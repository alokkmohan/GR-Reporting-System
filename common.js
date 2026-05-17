var APP_URL = 'https://script.google.com/macros/s/AKfycbxEIOaI_Zt48oMxVVOE_x-D58pNVFLKzz2G6xMEVxDVROYAKmNEt2dFELxQRbUY9igt/exec';

function grSession() { return JSON.parse(localStorage.getItem('grSession') || 'null'); }
function grToken() { return localStorage.getItem('grToken') || ''; }

function requireAuth() {
  var s = grSession();
  if (!s || s.status !== 'active') { window.location.href = 'index.html'; return null; }
  return s;
}

function logout() {
  fetch(APP_URL, { method: 'POST', body: JSON.stringify({ action: 'logout', token: grToken() }) })
    .finally(function () {
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

function renderSidebar(activePage) {
  var s = grSession();
  if (!s) return;

  var words = (s.full_name || s.email || 'U').split(' ');
  var initials = (words[0].charAt(0) + (words[1] ? words[1].charAt(0) : '')).toUpperCase();

  var avatarHtml = s.photo_url
    ? '<img src="' + s.photo_url + '" onerror="this.style.display=\'none\'" style="width:52px;height:52px;border-radius:50%;object-fit:cover;display:block;">'
    : '<div class="sidebar-initials">' + initials + '</div>';

  var navItems = [
    { href: 'dashboard.html', label: 'Dashboard', key: 'dashboard' },
    { href: 'planner.html', label: 'Meeting Planner', key: 'planner' },
    { href: 'formA.html', label: 'New Meeting', key: 'formA' },
    { href: 'myentries.html', label: 'My Entries', key: 'myentries' },
    { href: 'profile.html', label: 'My Profile', key: 'profile' }
  ];
  if (s.role === 'admin' || s.role === 'state') {
    navItems.push({ href: 'admin.html', label: 'Admin Panel', key: 'admin' });
  }

  var navHtml = navItems.map(function (item) {
    return '<a href="' + item.href + '" class="sidebar-nav-item' + (activePage === item.key ? ' active' : '') + '">' + item.label + '</a>';
  }).join('');

  var html = '<div id="sidebarOverlay" class="sidebar-overlay" onclick="closeSidebar()"></div>'
    + '<aside id="sidebar" class="sidebar">'
    + '<div class="sidebar-user">'
    + '<div class="sidebar-avatar-wrap">' + avatarHtml + '</div>'
    + '<div class="sidebar-name">' + (s.full_name || '') + '</div>'
    + '<div class="sidebar-email">' + (s.email || '') + '</div>'
    + '<span class="role-badge">' + esc(s.designation || s.role || 'Field') + '</span>'
    + '</div>'
    + '<nav class="sidebar-nav">' + navHtml + '</nav>'
    + '<div class="sidebar-footer">'
    + '<a href="#" onclick="logout()" class="sidebar-nav-item sidebar-logout">Logout</a>'
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
