import fs from 'fs';
import path from 'path';

const root = path.resolve('..');
const dest = path.join(root, 'src', 'client');

const pages = [
  'index', 'register', 'pending', 'dashboard', 'planner', 'formA', 'formB',
  'myentries', 'admin', 'contacts', 'profile', 'gantt', 'timeline', 'state'
];

function convert(html, name) {
  let out = html;
  out = out.replace(/<link[^>]*href=["']style\.css["'][^>]*>\s*/gi, '');
  if (!out.includes("include('client/style')")) {
    out = out.replace(/<head>/i, "<head>\n  <style><?!= include('client/style'); ?></style>");
  }
  out = out.replace(/<script src=["']common\.js["']><\/script>/gi,
    "<script><?!= include('client/common'); ?></script>");
  out = out.replace(
    /var APP_URL = 'https:\/\/script\.google\.com\/macros\/s\/[^']+'/g,
    "var APP_URL = '<?= appUrl ?>'"
  );
  out = out.replace(/window\.location\.href = 'dashboard\.html'/g, "goTo('dashboard')");
  out = out.replace(/window\.location\.href = 'planner\.html'/g, "goTo('planner')");
  out = out.replace(/window\.location\.href = 'gantt\.html'/g, "goTo('gantt')");
  out = out.replace(/window\.location\.href = 'myentries\.html'/g, "goTo('myentries')");
  out = out.replace(/window\.location\.href = 'contacts\.html'/g, "goTo('contacts')");
  out = out.replace(/window\.location\.href = 'profile\.html'/g, "goTo('profile')");
  out = out.replace(/window\.location\.href = 'admin\.html'/g, "goTo('admin')");
  out = out.replace(/window\.location\.href = 'index\.html'/g, 'window.location.href = APP_URL');
  out = out.replace(
    /window\.location\.href = 'register\.html\?token=' \+ ([^;]+)/g,
    "window.location.href = APP_URL + '?page=register&token=' + $1"
  );
  out = out.replace(
    /window\.location\.href = 'pending\.html\?token=' \+ ([^;]+)/g,
    "window.location.href = APP_URL + '?page=pending&token=' + $1"
  );
  out = out.replace(
    /window\.location\.href = 'timeline\.html\?plan_id=' \+ planId/g,
    "window.location.href = APP_URL + '?page=timeline&token=' + encodeURIComponent(token) + '&plan_id=' + encodeURIComponent(planId)"
  );
  out = out.replace(/href="register\.html"/g, 'href="#" onclick="window.location.href=APP_URL+\'?page=register\';return false;"');
  out = out.replace(/href="index\.html"/g, 'href="#" onclick="window.location.href=APP_URL;return false;"');
  out = out.replace(/href="planner\.html"/g, 'href="#" onclick="goTo(\'planner\');return false;"');
  out = out.replace(/href="gantt\.html"/g, 'href="#" onclick="goTo(\'gantt\');return false;"');
  out = out.replace(/href="myentries\.html"/g, 'href="#" onclick="goTo(\'myentries\');return false;"');
  out = out.replace(/localStorage\.setItem\('grToken', res\.token\);\s*/g, '');
  out = out.replace(/localStorage\.setItem\('grSession',[^;]+\);\s*/g, '');
  if (name === 'index' || name === 'register') {
    out = out.replace(
      /window\.location\.href = 'dashboard\.html'/g,
      "window.location.href = APP_URL + '?page=dashboard&token=' + res.token"
    );
    out = out.replace(
      /goTo\('dashboard'\)/g,
      "window.location.href = APP_URL + '?page=dashboard&token=' + res.token"
    );
  }
  if (name === 'admin') {
    out = out.replace(
      /session\.role !== 'admin'/g,
      "(session.role !== 'admin' && session.role !== 'state')"
    );
  }
  return out;
}

// common.html from common.js
const commonJs = fs.readFileSync(path.join(root, 'common.js'), 'utf8');
let common = commonJs
  .replace(/var APP_URL = '[^']+';/, "var APP_URL = '<?= appUrl ?>';\nvar token = '<?= token ?>';\nvar _session = <?= session ?>;")
  .replace(/function grSession\(\) \{[\s\S]*?\}/, 'function grSession() { return _session; }')
  .replace(/function grToken\(\) \{[\s\S]*?\}/, 'function grToken() { return token; }')
  .replace(/window\.location\.href = 'index\.html'/g, 'window.location.href = APP_URL')
  .replace(/localStorage\.removeItem\('grToken'\);\s*\n\s*localStorage\.removeItem\('grSession'\);\s*\n/, '')
  .replace(/localStorage\.setItem\('grSession', JSON\.stringify\(sess\)\);\s*\n/, '');

common = `function goTo(page) {
  var extra = '';
  var qs = window.location.search.replace(/^\\?/, '');
  var params = {};
  if (qs) qs.split('&').forEach(function(p) { var kv = p.split('='); if (kv[0]) params[decodeURIComponent(kv[0])] = decodeURIComponent(kv[1] || ''); });
  if ((page === 'formA' || page === 'formB' || page === 'timeline') && params.plan_id) {
    extra = '&plan_id=' + encodeURIComponent(params.plan_id);
  }
  window.location.href = APP_URL + '?page=' + page + '&token=' + encodeURIComponent(token) + extra;
}

` + common;

common = common.replace(/var s = grSession\(\);/g, 'var s = _session;');
common = common.replace(/\{ href: '(\w+)\.html', label:/g, "{ page: '$1', label:");
common = common.replace(
  /return '<a href="' \+ item\.href \+ '" class="sidebar-nav-item' \+ \(activePage === item\.key \? ' active' : ''\) \+ '">'/g,
  "return '<a href=\"#\" onclick=\"goTo(\\'' + item.page + '\\');return false;\" class=\"sidebar-nav-item' + (activePage === item.key ? ' active' : '') + '\">'"
);

fs.writeFileSync(path.join(dest, 'common.html'), common);
fs.copyFileSync(path.join(root, 'style.css'), path.join(dest, 'style.html'));

for (const name of pages) {
  const src = path.join(root, `${name}.html`);
  if (!fs.existsSync(src)) continue;
  const html = fs.readFileSync(src, 'utf8');
  fs.writeFileSync(path.join(dest, `${name}.html`), convert(html, name));
  console.log('synced', name);
}

console.log('done');
