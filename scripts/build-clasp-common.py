from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
js = (ROOT / 'common.js').read_text(encoding='utf-8')

header = """function goTo(page) {
  var extra = '';
  var qs = window.location.search.replace(/^\\?/, '');
  var params = {};
  if (qs) qs.split('&').forEach(function(p) { var kv = p.split('='); if (kv[0]) params[decodeURIComponent(kv[0])] = decodeURIComponent(kv[1] || ''); });
  if ((page === 'formA' || page === 'formB' || page === 'timeline') && params.plan_id) {
    extra = '&plan_id=' + encodeURIComponent(params.plan_id);
  }
  window.location.href = APP_URL + '?page=' + page + '&token=' + encodeURIComponent(token) + extra;
}

var APP_URL = '<?= appUrl ?>';
var token = '<?= token ?>';
var _session = <?= session ?>;

function grSession() { return _session; }
function grToken() { return token; }

"""

js = js.replace(
    "var APP_URL = 'https://script.google.com/macros/s/AKfycbxEIOaI_Zt48oMxVVOE_x-D58pNVFLKzz2G6xMEVxDVROYAKmNEt2dFELxQRbUY9igt/exec';\n\nfunction grSession() { return JSON.parse(localStorage.getItem('grSession') || 'null'); }\nfunction grToken() { return localStorage.getItem('grToken') || ''; }\n\n",
    "",
)

js = js.replace("var s = grSession();\n  if (!s || s.status !== 'active') { window.location.href = 'index.html'; return null; }",
                "if (!_session || _session.status !== 'active') { window.location.href = APP_URL; return null; }")

js = js.replace("var sess = grSession(); if (!sess) return;", "var sess = _session; if (!sess) return;")
js = js.replace("localStorage.setItem('grSession', JSON.stringify(sess));", "")

js = js.replace("window.location.href = 'index.html';", "window.location.href = APP_URL;")
js = js.replace("localStorage.removeItem('grToken');\n      localStorage.removeItem('grSession');\n      ", "")

js = js.replace("{ href: 'dashboard.html', label: 'Home', key: 'dashboard' }",
                "{ page: 'dashboard', label: 'Home', key: 'dashboard' }")
js = js.replace("{ href: 'planner.html',   label: 'Manage Meetings', key: 'planner' }",
                "{ page: 'planner', label: 'Manage Meetings', key: 'planner' }")
js = js.replace("{ href: 'gantt.html',     label: 'Meeting Gantt', key: 'gantt' }",
                "{ page: 'gantt', label: 'Meeting Gantt', key: 'gantt' }")
js = js.replace("{ href: 'myentries.html', label: 'My Entries',  key: 'myentries' }",
                "{ page: 'myentries', label: 'My Entries', key: 'myentries' }")
js = js.replace("{ href: 'contacts.html',  label: 'Contacts',    key: 'contacts' }",
                "{ page: 'contacts', label: 'Contacts', key: 'contacts' }")
js = js.replace("{ href: 'profile.html',   label: 'My Profile',  key: 'profile' }",
                "{ page: 'profile', label: 'My Profile', key: 'profile' }")
js = js.replace("{ href: 'admin.html', label: 'Admin Panel', key: 'admin' }",
                "{ page: 'admin', label: 'Admin Panel', key: 'admin' }")

js = js.replace(
    "return '<a href=\"' + item.href + '\" class=\"sidebar-nav-item' + (activePage === item.key ? ' active' : '') + '\">'",
    "return '<a href=\"#\" onclick=\"goTo(\\'' + item.page + '\\');return false;\" class=\"sidebar-nav-item' + (activePage === item.key ? ' active' : '') + '\">'",
)

js = js.replace("  var s = grSession();\n  if (!s) return;", "  var s = _session;\n  if (!s) return;")

js = js.replace("  return s;\n}", "  return _session;\n}")

out = header + js
(ROOT / 'src/client/common.html').write_text(out, encoding='utf-8')
print('built src/client/common.html')
