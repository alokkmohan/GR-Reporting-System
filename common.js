var APP_URL = 'https://script.google.com/macros/s/AKfycbxEIOaI_Zt48oMxVVOE_x-D58pNVFLKzz2G6xMEVxDVROYAKmNEt2dFELxQRbUY9igt/exec';

function grSession() { return JSON.parse(localStorage.getItem('grSession') || 'null'); }
function grToken() { return localStorage.getItem('grToken') || ''; }

function requireAuth() {
  var s = grSession();
  if (!s || s.status !== 'active') { window.location.href = 'index.html'; return null; }
  if (!s.designation) {
    fetch(APP_URL, { method: 'POST', body: JSON.stringify({ action: 'getMyProfile', token: grToken() }) })
      .then(function(r) { return r.json(); }).then(function(res) {
        if (res.success && res.user) {
          var sess = grSession();
          sess.designation = res.user.designation || '';
          sess.unit = res.user.unit || '';
          sess.full_name = res.user.full_name || sess.full_name || '';
          sess.district = res.user.district || sess.district || '';
          sess.photo_url = res.user.photo_url || sess.photo_url || '';
          localStorage.setItem('grSession', JSON.stringify(sess));
          var badge = document.querySelector('.role-badge');
          if (badge) badge.textContent = sess.designation || sess.role || 'Field';
          var avatarWrap = document.querySelector('.sidebar-avatar-wrap');
          if (avatarWrap && sess.photo_url) {
            avatarWrap.innerHTML = '<img src="' + sess.photo_url + '" onerror="this.style.display=\'none\'" style="width:52px;height:52px;border-radius:50%;object-fit:cover;display:block;">';
          }
        }
      }).catch(function() {});
  }
  return s;
}

function logout() {
  var overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(30,41,59,0.92);z-index:99999;display:flex;flex-direction:column;align-items:center;justify-content:center;';
  overlay.innerHTML = '<div style="width:48px;height:48px;border:4px solid rgba(255,255,255,0.15);border-top-color:#fff;border-radius:50%;animation:spin 0.8s linear infinite;"></div>'
    + '<div style="color:#fff;font-size:14px;font-weight:600;margin-top:18px;letter-spacing:0.3px;">Signing out...</div>'
    + '<div style="color:rgba(255,255,255,0.5);font-size:12px;margin-top:6px;">Please wait</div>';
  document.body.appendChild(overlay);
  fetch(APP_URL, { method: 'POST', body: JSON.stringify({ action: 'logout', token: grToken() }) })
    .finally(function() {
      localStorage.removeItem('grToken');
      localStorage.removeItem('grSession');
      window.location.href = 'index.html';
    });
}

function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
  document.getElementById('sidebarOverlay').classList.toggle('open');
}
function closeSidebar() {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sidebarOverlay').classList.remove('open');
}

var _sidebarIcons = {
  dashboard: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
  planner:   '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
  gantt:     '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="5" x2="21" y2="5"/><rect x="3" y="9" width="7" height="2" rx="1" fill="currentColor" stroke="none"/><rect x="6" y="13" width="9" height="2" rx="1" fill="currentColor" stroke="none"/><rect x="11" y="17" width="7" height="2" rx="1" fill="currentColor" stroke="none"/></svg>',
  myentries: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>',
  profile:   '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
  admin:     '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/></svg>',
  logout:    '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>'
};

function renderSidebar(activePage) {
  var s = grSession();
  if (!s) return;

  var words = (s.full_name || s.email || 'U').split(' ');
  var initials = (words[0].charAt(0) + (words[1] ? words[1].charAt(0) : '')).toUpperCase();

  var avatarHtml = s.photo_url
    ? '<img src="' + s.photo_url + '" onerror="this.style.display=\'none\'" style="width:52px;height:52px;border-radius:50%;object-fit:cover;display:block;">'
    : '<div class="sidebar-initials">' + initials + '</div>';

  var navItems = [
    { href: 'dashboard.html', label: 'Home', key: 'dashboard' },
    { href: 'planner.html',   label: 'Meeting Planner', key: 'planner' },
    { href: 'gantt.html',     label: 'Meeting Gantt', key: 'gantt' },
    { href: 'myentries.html', label: 'My Entries', key: 'myentries' },
    { href: 'profile.html',   label: 'My Profile', key: 'profile' }
  ];
  if (s.role === 'admin' || s.role === 'state') {
    navItems.push({ href: 'admin.html', label: 'Admin Panel', key: 'admin' });
  }

  var navHtml = navItems.map(function(item) {
    var icon = _sidebarIcons[item.key] || '';
    return '<a href="' + item.href + '" class="sidebar-nav-item' + (activePage === item.key ? ' active' : '') + '">'
      + icon + '<span class="sidebar-nav-label">' + item.label + '</span></a>';
  }).join('');

  var logoutIcon = _sidebarIcons.logout || '';
  var html = '<div id="sidebarOverlay" class="sidebar-overlay" onclick="closeSidebar()"></div>'
    + '<aside id="sidebar" class="sidebar">'
    + '<div class="sidebar-user">'
    + '<div class="sidebar-avatar-wrap">' + avatarHtml + '</div>'
    + '<div class="sidebar-name">' + esc(s.full_name || '') + '</div>'
    + '<div class="sidebar-email">' + esc(s.email || '') + '</div>'
    + (s.designation ? '<span class="role-badge" id="roleBadge">' + esc(s.designation) + '</span>' : '<span class="role-badge" id="roleBadge">' + esc(s.role || 'Field') + '</span>')
    + '</div>'
    + '<nav class="sidebar-nav">' + navHtml + '</nav>'
    + '<div class="sidebar-footer">'
    + '<a href="#" onclick="logout()" class="sidebar-nav-item sidebar-logout">' + logoutIcon + '<span class="sidebar-nav-label">Logout</span></a>'
    + '</div>'
    + '</aside>';

  document.getElementById('sidebarMount').innerHTML = html;

  var navUser = document.getElementById('navUser');
  if (navUser) navUser.textContent = s.full_name || s.email || '';
}

function fmtDate(d) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}
function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
