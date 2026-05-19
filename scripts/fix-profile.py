import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

RENDER = """    function getInitials(s) {
      var words = (s.full_name || s.email || 'U').split(' ');
      return (words[0].charAt(0) + (words[1] ? words[1].charAt(0) : '')).toUpperCase();
    }

    function renderPhoto(s) {
      var wrap = document.getElementById('photoWrap');
      var initials = getInitials(s);
      wrap.innerHTML = '';
      if (s.photo_url) {
        var img = document.createElement('img');
        img.className = 'photo-circle';
        img.alt = s.full_name || 'Profile photo';
        img.src = s.photo_url;
        img.onerror = function() {
          img.remove();
          var fb = document.createElement('DIV_TAG');
          fb.className = 'photo-initials';
          fb.textContent = initials;
          wrap.insertBefore(fb, wrap.firstChild);
        };
        wrap.appendChild(img);
      } else {
        var ph = document.createElement('DIV_TAG');
        ph.className = 'photo-initials';
        ph.textContent = initials;
        wrap.appendChild(ph);
      }
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'photo-edit-btn';
      btn.title = s.photo_url ? 'Change photo' : 'Add photo';
      btn.textContent = s.photo_url ? 'Edit' : '+';
      btn.onclick = function() { document.getElementById('photoFileInput').click(); };
      wrap.appendChild(btn);
    }""".replace("'DIV_TAG'", "'motionless'").replace("'motionless'", "'div'")

UPLOAD = """    function uploadPhoto(input) {
      var file = input.files[0];
      if (!file) return;
      input.value = '';
      if (file.size > 10 * 1024 * 1024) { alert('Image too large. Max 10MB.'); return; }
      var wrap = document.getElementById('photoWrap');
      var overlay = document.createElement('DIV_TAG');
      overlay.className = 'photo-uploading';
      overlay.innerHTML = '<DIV_TAG class="spinner" style="margin:0;width:28px;height:28px;border-width:2px;border-color:rgba(255,255,255,0.3);border-top-color:#fff;"></DIV_TAG>';
      wrap.appendChild(overlay);
      var reader = new FileReader();
      reader.onload = function(e) {
        var img = new Image();
        img.onload = function() {
          var MAX = 300;
          var w = img.width, h = img.height;
          if (w > h) { if (w > MAX) { h = Math.round(h * MAX / w); w = MAX; } }
          else       { if (h > MAX) { w = Math.round(w * MAX / h); h = MAX; } }
          var canvas = document.createElement('canvas');
          canvas.width = w; canvas.height = h;
          canvas.getContext('2d').drawImage(img, 0, 0, w, h);
          var base64 = canvas.toDataURL('image/jpeg', 0.85).split(',')[1];
          fetch(APP_URL, { method:'POST', body: JSON.stringify({
            action:'uploadFile', token: grToken(),
            fileName: file.name.replace(/\\.[^.]+$/, '') + '.jpg',
            mimeType: 'image/jpeg', fileData: base64
          })})
          .then(function(r) { return r.json(); }).then(function(res) {
            overlay.remove();
            if (res.success) {
              var s = grSession(); s.photo_url = res.url;
              localStorage.setItem('grSession', JSON.stringify(s));
              fetch(APP_URL, { method:'POST', body: JSON.stringify({
                action:'updateProfile', token: grToken(),
                full_name: s.full_name || '',
                unit: s.unit || '', designation: s.designation || '', photo_url: res.url
              })});
              fillHeader(s);
              renderSidebar('profile');
            } else {
              alert('Photo upload failed: ' + (res.message || 'Unknown error'));
              renderPhoto(grSession());
            }
          }).catch(function(err) {
            overlay.remove();
            alert('Upload error: ' + (err.message || err));
            renderPhoto(grSession());
          });
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    }""".replace('DIV_TAG', 'div')


def fix_profile(path: Path):
    h = path.read_text(encoding='utf-8')
    h, n1 = re.subn(
        r'    function renderPhoto\(s\) \{.*?\n    \}\n\n    function fillHeader',
        RENDER + '\n\n    function fillHeader',
        h, count=1, flags=re.S)
    h, n2 = re.subn(
        r'    function uploadPhoto\(input\) \{.*?\n    \}',
        UPLOAD, h, count=1, flags=re.S)
    path.write_text(h, encoding='utf-8')
    print(path, 'ok', n1, n2)


def fix_common(path: Path):
    c = path.read_text(encoding='utf-8')
    if 'avImg.onerror' in c:
        print('common.js skip')
        return
    c = re.sub(
        r"      if \(avatarWrap\) \{[\s\S]*?': '<div class=\"sidebar-initials\">' \+ initials \+ '</div>';\s*\n      \}",
        """      if (avatarWrap) {
        avatarWrap.innerHTML = '';
        if (sess.photo_url) {
          var avImg = document.createElement('img');
          avImg.src = sess.photo_url;
          avImg.style.cssText = 'width:52px;height:52px;border-radius:50%;object-fit:cover;display:block;';
          avImg.onerror = function() {
            avImg.remove();
            var avFb = document.createElement('div');
            avFb.className = 'sidebar-initials';
            avFb.textContent = initials;
            avatarWrap.appendChild(avFb);
          };
          avatarWrap.appendChild(avImg);
        } else {
          var avFb2 = document.createElement('motionless');
          avFb2.className = 'sidebar-initials';
          avFb2.textContent = initials;
          avatarWrap.appendChild(avFb2);
        }
      }""".replace("createElement('motionless')", "createElement('div')"),
        c, count=1)
    c = re.sub(
        r"  var avatarHtml = s\.photo_url[\s\S]*?: '<div class=\"sidebar-initials\">' \+ initials \+ '</div>';\n\n  var navItems",
        '  var navItems', c, count=1)
    old_join = "+ '<div class=\"sidebar-user\">'\n    + '<div class=\"sidebar-avatar-wrap\">' + avatarHtml + '</div>'"
    new_join = "+ '<div class=\"sidebar-user\"><motionless id=\"sbAvatar\"></motionless>'"
    if old_join in c:
        c = c.replace(old_join, new_join.replace('motionless', 'div'))
    if 'function fillSidebarAvatar' not in c:
        helper = """
function fillSidebarAvatar(s) {
  var el = document.getElementById('sbAvatar');
  if (!el) return;
  var words = (s.full_name || s.email || 'U').split(' ');
  var initials = (words[0].charAt(0) + (words[1] ? words[1].charAt(0) : '')).toUpperCase();
  el.innerHTML = '';
  var wrap = document.createElement('DIV_TAG');
  wrap.className = 'sidebar-avatar-wrap';
  if (s.photo_url) {
    var img = document.createElement('img');
    img.src = s.photo_url;
    img.style.cssText = 'width:52px;height:52px;border-radius:50%;object-fit:cover;display:block;';
    img.onerror = function() {
      img.remove();
      var fb = document.createElement('DIV_TAG');
      fb.className = 'sidebar-initials';
      fb.textContent = initials;
      wrap.appendChild(fb);
    };
    wrap.appendChild(img);
  } else {
    var fb = document.createElement('DIV_TAG');
    fb.className = 'sidebar-initials';
    fb.textContent = initials;
    wrap.appendChild(fb);
  }
  el.appendChild(wrap);
}
""".replace('DIV_TAG', 'div')
        c = c.replace('function renderSidebar(activePage) {', helper + '\nfunction renderSidebar(activePage) {')
        c = c.replace(
            "  document.getElementById('sidebarMount').innerHTML = html;",
            "  document.getElementById('sidebarMount').innerHTML = html;\n  fillSidebarAvatar(s);")
    path.write_text(c, encoding='utf-8')
    print('common.js fixed')


for rel in ['profile.html', 'src/client/profile.html']:
    p = ROOT / rel
    if p.exists():
        fix_profile(p)
def fix_require_auth(path: Path):
    c = path.read_text(encoding='utf-8')
    c2, n = re.subn(
        r"      if \(avatarWrap\) \{[\s\S]*?avatarWrap\.innerHTML = sess\.photo_url[\s\S]*?'</div>';\s*\n      \}",
        """      if (avatarWrap) {
        avatarWrap.innerHTML = '';
        if (sess.photo_url) {
          var avImg = document.createElement('img');
          avImg.src = sess.photo_url;
          avImg.style.cssText = 'width:52px;height:52px;border-radius:50%;object-fit:cover;display:block;';
          avImg.onerror = function() {
            avImg.remove();
            var avFb = document.createElement('div');
            avFb.className = 'sidebar-initials';
            avFb.textContent = initials;
            avatarWrap.appendChild(avFb);
          };
          avatarWrap.appendChild(avImg);
        } else {
          var avFb2 = document.createElement('div');
          avFb2.className = 'sidebar-initials';
          avFb2.textContent = initials;
          avatarWrap.appendChild(avFb2);
        }
      }""",
        c,
        count=1,
    )
    if n:
        path.write_text(c2, encoding='utf-8')
        print('requireAuth avatar fixed', path.name)


fix_common(ROOT / 'common.js')
fix_require_auth(ROOT / 'common.js')
