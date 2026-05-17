var ALLOWED_DOMAIN = 'educategirls.ngo';
var WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbxEIOaI_Zt48oMxVVOE_x-D58pNVFLKzz2G6xMEVxDVROYAKmNEt2dFELxQRbUY9igt/exec';

function doGet(e) {
  var page = (e.parameter && e.parameter.page) ? e.parameter.page : 'index';
  var token = (e.parameter && e.parameter.token) ? e.parameter.token : '';
  var session = token ? verifySession(token) : null;

  var publicPages = ['index', 'register', 'pending'];
  if (publicPages.indexOf(page) === -1) {
    if (!session || session.status !== 'active') {
      return buildPage('client/index', '', null);
    }
  }
  if (page === 'admin' && (!session || session.role !== 'admin')) {
    page = 'planner';
  }

  return buildPage('client/' + page, token, session);
}

function buildPage(file, token, session) {
  var tpl = HtmlService.createTemplateFromFile(file);
  tpl.token = token || '';
  tpl.session = session ? JSON.stringify(session) : 'null';
  tpl.appUrl = WEB_APP_URL;
  return tpl.evaluate()
    .setTitle('GR Reporting System')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function doPost(e) {
  var params = JSON.parse(e.postData.contents);
  var action = params.action;
  var token = params.token || null;
  var session = token ? verifySession(token) : null;

  try {

    // ── AUTH ──────────────────────────────────────────────
    if (action === 'sendOTP') {
      var email = (params.email || '').toLowerCase().trim();
      var domain = email.split('@')[1];
      if (domain !== ALLOWED_DOMAIN) {
        return respond({ success: false, message: 'Only @' + ALLOWED_DOMAIN + ' email addresses are allowed.' });
      }
      if (params.source === 'signin') {
        var existing = getUserByEmail(email);
        if (!existing) {
          return respond({ success: false, message: 'No account found for this email. Please sign up first.' });
        }
        if (existing.status === 'suspended') {
          return respond({ success: false, message: 'Your account has been suspended. Contact admin.' });
        }
      }
      return respond(sendOTP(email));
    }

    if (action === 'verifyOTP') {
      var result = verifyOTP((params.email || '').toLowerCase().trim(), params.otp);
      if (result.success && result.status === 'active' && result.user) {
        logLogin(result.user.email, result.user.full_name || '');
      }
      return respond(result);
    }

    if (action === 'logout') {
      if (token) destroySession(token);
      return respond({ success: true });
    }

    // ── PUBLIC DATA ───────────────────────────────────────
    if (action === 'getDropdowns') {
      return respond({ success: true, units: getUnits(), designations: getDesignations(), postingLevels: getPostingLevels() });
    }

    // ── REGISTRATION ──────────────────────────────────────
    if (action === 'register') {
      if (!session || session.status !== 'unregistered') return respond({ success: false, message: 'Session invalid.' });
      var existing = getUserByEmail(params.email);
      if (existing) return respond({ success: false, message: 'Email already registered.' });
      addUser({
        email: params.email,
        full_name: params.full_name,
        posting_level: params.posting_level,
        district: params.district,
        unit: params.unit,
        designation: params.designation
      });
      destroySession(token);
      var newToken = createSession(params.email, 'field', 'active');
      var newUser = getUserByEmail(params.email);
      return respond({ success: true, token: newToken, status: 'active', user: newUser });
    }

    // ── PROFILE UPDATE ────────────────────────────────────
    if (action === 'updateProfile') {
      if (!session || session.status !== 'active') return respond({ success: false, message: 'Not authorized.' });
      updateUserProfile(session.email, {
        full_name: params.full_name,
        unit: params.unit,
        designation: params.designation,
        photo_url: params.photo_url || ''
      });
      var updatedUser = getUserByEmail(session.email);
      return respond({ success: true, user: updatedUser });
    }

    // ── FILE UPLOAD ───────────────────────────────────────
    if (action === 'uploadFile') {
      if (!session || session.status !== 'active') return respond({ success: false, message: 'Not authorized.' });
      try {
        var blob = Utilities.newBlob(Utilities.base64Decode(params.fileData), params.mimeType || 'application/octet-stream', params.fileName || 'document');
        var file = DriveApp.createFile(blob);
        file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
        return respond({ success: true, url: 'https://drive.google.com/file/d/' + file.getId() + '/view', name: file.getName() });
      } catch(e) {
        return respond({ success: false, message: 'Upload failed: ' + e.toString() });
      }
    }

    // ── PLANNED MEETINGS ──────────────────────────────────
    if (action === 'planMeeting') {
      if (!session || session.status !== 'active') return respond({ success: false, message: 'Not authorized.' });
      var user = getUserByEmail(session.email);
      var id = planMeeting(params.data, session.email, user ? user.district : '');
      return respond({ success: true, plan_id: id });
    }

    if (action === 'getPlannedMeetings') {
      if (!session || session.status !== 'active') return respond({ success: false, message: 'Not authorized.' });
      var data;
      if (session.role === 'state' || session.role === 'admin') data = getAllPlannedMeetings();
      else if (session.role === 'district') { var u = getUserByEmail(session.email); data = getPlannedMeetingsByDistrict(u ? u.district : ''); }
      else data = getPlannedMeetingsByEmail(session.email);
      return respond({ success: true, data: data });
    }

    // ── MEETINGS (Form A / B) ─────────────────────────────
    if (action === 'submitMeeting') {
      if (!session || session.status !== 'active') return respond({ success: false, message: 'Not authorized.' });
      var user = getUserByEmail(session.email);
      params.formData.user_email = session.email;
      params.formData.district = user ? user.district : '';
      var submissionId = submitMeeting(params.formData);
      if (params.plan_id) {
        var newStatus = params.formData.meeting_conducted === 'YES' ? 'conducted' : 'not_conducted';
        updatePlanStatus(params.plan_id, newStatus, submissionId);
      }
      return respond({ success: true, submission_id: submissionId });
    }

    if (action === 'getMyProfile') {
      if (!session || session.status !== 'active') return respond({ success: false, message: 'Not authorized.' });
      var user = getUserByEmail(session.email);
      return respond({ success: true, user: user });
    }

    if (action === 'getMyMeetings') {
      if (!session || session.status !== 'active') return respond({ success: false, message: 'Not authorized.' });
      var data;
      if (session.role === 'state' || session.role === 'admin') data = getAllMeetings();
      else if (session.role === 'district') { var u = getUserByEmail(session.email); data = getMeetingsByDistrict(u ? u.district : ''); }
      else data = getMeetingsByEmail(session.email);
      return respond({ success: true, data: data });
    }

    // ── ADMIN ─────────────────────────────────────────────
    if (action === 'getPendingUsers') {
      if (!session || session.role !== 'admin') return respond({ success: false, message: 'Not authorized.' });
      return respond({ success: true, data: getAllPendingUsers() });
    }

    if (action === 'getAllUsers') {
      if (!session || session.role !== 'admin') return respond({ success: false, message: 'Not authorized.' });
      return respond({ success: true, data: getAllUsers() });
    }

    if (action === 'approveUser') {
      if (!session || session.role !== 'admin') return respond({ success: false, message: 'Not authorized.' });
      updateUserStatus(params.email, 'active');
      return respond({ success: true });
    }

    if (action === 'suspendUser') {
      if (!session || session.role !== 'admin') return respond({ success: false, message: 'Not authorized.' });
      updateUserStatus(params.email, 'suspended');
      return respond({ success: true });
    }

    if (action === 'updateRole') {
      if (!session || session.role !== 'admin') return respond({ success: false, message: 'Not authorized.' });
      updateUserRole(params.email, params.role);
      return respond({ success: true });
    }

    return respond({ success: false, message: 'Unknown action.' });

  } catch (err) {
    return respond({ success: false, message: err.toString() });
  }
}

function respond(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}
