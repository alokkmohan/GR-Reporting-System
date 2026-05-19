var ALLOWED_DOMAIN = 'educategirls.ngo';
var WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbxEIOaI_Zt48oMxVVOE_x-D58pNVFLKzz2G6xMEVxDVROYAKmNEt2dFELxQRbUY9igt/exec';
var SITE_URL = 'https://gr.egtau.org';

function doGet(e) {
  var page = (e.parameter && e.parameter.page) ? e.parameter.page : 'index';
  var token = (e.parameter && e.parameter.token) ? e.parameter.token : '';
  var session = token ? verifySession(token) : null;

  var vt = (e.parameter && e.parameter.vt) ? e.parameter.vt : '';
  var publicPages = ['index', 'register', 'pending'];
  // State page is accessible via viewer token without a session
  if (page === 'state' && vt) {
    return buildPage('client/state', '', null);
  }
  if (publicPages.indexOf(page) === -1) {
    if (!session || session.status !== 'active') {
      return buildPage('client/index', '', null);
    }
  }
  if (page === 'admin' && (!session || (session.role !== 'admin' && session.role !== 'state'))) {
    page = 'dashboard';
  }

  return buildPage('client/' + page, token, session);
}

function buildPage(file, token, session) {
  var tpl = HtmlService.createTemplateFromFile(file);
  tpl.token = token || '';
  if (session && session.status === 'active' && session.email) {
    var user = getUserByEmail(session.email);
    if (user) {
      session = {
        email: session.email,
        role: session.role || user.role,
        status: session.status,
        full_name: user.full_name || '',
        district: user.district || '',
        designation: user.designation || '',
        unit: user.unit || '',
        posting_level: user.posting_level || '',
        photo_url: user.photo_url || ''
      };
    }
  }
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

    // ── MY PROFILE ────────────────────────────────────────
    if (action === 'getMyProfile') {
      if (!session || session.status !== 'active') return respond({ success: false, message: 'Not authorized.' });
      var user = getUserByEmail(session.email);
      return respond({ success: true, user: user });
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
      if (params.phone) updateUserProfile(params.email, { phone: params.phone });
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
        photo_url: params.photo_url || '',
        phone: params.phone || ''
      });
      var updatedUser = getUserByEmail(session.email);
      return respond({ success: true, user: updatedUser });
    }

    if (action === 'getContacts') {
      if (!session || session.status !== 'active') return respond({ success: false, message: 'Not authorized.' });
      var allUsers = getAllUsers().filter(function(u) { return u.status === 'active'; });
      var contacts;
      if (session.role === 'state' || session.role === 'admin') {
        contacts = allUsers;
      } else {
        var me = getUserByEmail(session.email);
        var myDistrict = me ? me.district : '';
        contacts = allUsers.filter(function(u) { return u.district === myDistrict; });
      }
      return respond({ success: true, data: contacts.map(function(u) {
        return { email: u.email, full_name: u.full_name, designation: u.designation, unit: u.unit, district: u.district, posting_level: u.posting_level, photo_url: u.photo_url || '', phone: u.phone || '' };
      })});
    }

    // ── FILE UPLOAD ───────────────────────────────────────
    if (action === 'uploadFile') {
      if (!session || session.status !== 'active') return respond({ success: false, message: 'Not authorized.' });
      try {
        var blob = Utilities.newBlob(Utilities.base64Decode(params.fileData), params.mimeType || 'application/octet-stream', params.fileName || 'document');
        var file = DriveApp.createFile(blob);
        file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
        var isImage = (params.mimeType || '').indexOf('image/') === 0;
        var url = isImage
          ? 'https://drive.google.com/thumbnail?id=' + file.getId() + '&sz=w300-h300'
          : 'https://drive.google.com/file/d/' + file.getId() + '/view';
        return respond({ success: true, url: url, name: file.getName() });
      } catch(e) {
        return respond({ success: false, message: 'Upload failed: ' + e.toString() });
      }
    }

    // ── USER LOOKUP + INVITE ──────────────────────────────
    if (action === 'lookupUser') {
      if (!session || session.status !== 'active') return respond({ success: false, message: 'Not authorized.' });
      var email = (params.email || '').toLowerCase().trim();
      var found = getUserByEmail(email);
      if (found) return respond({ success: true, found: true, user: { full_name: found.full_name, designation: found.designation, district: found.district, unit: found.unit } });
      return respond({ success: true, found: false });
    }

    if (action === 'sendInvite') {
      if (!session || session.status !== 'active') return respond({ success: false, message: 'Not authorized.' });
      var toEmail = (params.email || '').toLowerCase().trim();
      if (!toEmail.endsWith('@' + ALLOWED_DOMAIN)) return respond({ success: false, message: 'Only @' + ALLOWED_DOMAIN + ' emails can be invited.' });
      var inviter = getUserByEmail(session.email);
      var inviterName = inviter ? (inviter.full_name || session.email) : session.email;
      MailApp.sendEmail({
        to: toEmail,
        subject: 'Invitation to join GR Reporting System',
        body: 'Hi,\n\n' + inviterName + ' has invited you to join the GR Reporting System used by Educate Girls for logging stakeholder meeting records.\n\nClick the link below to create your account:\n' + SITE_URL + '/register.html\n\nThis portal is for authorized Educate Girls team members only.\n\nEducate Girls'
      });
      return respond({ success: true });
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
      params.formData.plan_id = params.plan_id || '';
      var submissionId = submitMeeting(params.formData);
      if (params.plan_id) {
        var newStatus = params.formData.meeting_conducted === 'YES' ? 'conducted' : 'not_conducted';
        updatePlanStatus(params.plan_id, newStatus, submissionId);
      }
      var nextPlanId = null;
      var fd = params.formData;
      var needsFollowUp = (fd.meeting_conducted === 'YES' && fd.meeting_status === 'follow_up_required' && fd.followup_date)
                       || (fd.meeting_conducted === 'NO'  && fd.reason_not_conducted === 'Postponed'    && fd.followup_date);
      if (needsFollowUp && params.plan_id) {
        nextPlanId = createFollowUpPlan(params.plan_id, fd, session.email, fd.district || '');
      }
      // Duplicate submission for co-attendees so it appears in their records too
      var coAttendees = params.formData.co_attendees || [];
      if (Array.isArray(coAttendees)) {
        coAttendees.forEach(function(coEmail) {
          coEmail = (coEmail || '').toLowerCase().trim();
          if (!coEmail || coEmail === session.email) return;
          var coUser = getUserByEmail(coEmail);
          if (!coUser) return;
          var coData = JSON.parse(JSON.stringify(params.formData));
          coData.user_email = coEmail;
          coData.district = coUser.district || coData.district;
          coData.staff_name = coUser.full_name || coData.staff_name;
          coData.co_entry = 'yes';
          submitMeeting(coData);
        });
      }
      return respond({ success: true, submission_id: submissionId, next_plan_id: nextPlanId });
    }

    if (action === 'deletePlan') {
      if (!session || session.status !== 'active') return respond({ success: false, message: 'Not authorized.' });
      var plan = getPlannedMeetingById(params.plan_id);
      if (!plan) return respond({ success: false, message: 'Plan not found.' });
      if (plan.user_email !== session.email && session.role !== 'admin') return respond({ success: false, message: 'Not authorized.' });
      return respond({ success: deletePlannedMeeting(params.plan_id) });
    }

    if (action === 'updatePlan') {
      if (!session || session.status !== 'active') return respond({ success: false, message: 'Not authorized.' });
      var plan = getPlannedMeetingById(params.plan_id);
      if (!plan) return respond({ success: false, message: 'Plan not found.' });
      if (plan.user_email !== session.email && session.role !== 'admin') return respond({ success: false, message: 'Not authorized.' });
      updatePlannedMeeting(params.plan_id, params.data);
      return respond({ success: true });
    }

    if (action === 'getStateData') {
      var stateUser = (session && session.status === 'active') ? session : null;
      if (!stateUser && params.viewer_token) {
        var vtUser = getUserByViewerToken(params.viewer_token);
        if (vtUser && (vtUser.role === 'state' || vtUser.role === 'admin')) {
          stateUser = vtUser;
        }
      }
      if (!stateUser) return respond({ success: false, message: 'Access denied. Invalid or expired viewer link.' });
      if (stateUser.role !== 'state' && stateUser.role !== 'admin') return respond({ success: false, message: 'State or admin access required.' });
      var allMtgs = getAllMeetings();
      return respond({ success: true, data: allMtgs, viewer_name: stateUser.full_name || stateUser.email || '' });
    }

    if (action === 'generateViewerToken') {
      if (!session || session.status !== 'active') return respond({ success: false, message: 'Not authorized.' });
      // Allow state/admin to generate their own token, or admin to generate for others
      var targetEmail = (params.email && session.role === 'admin') ? params.email : session.email;
      if (session.role !== 'state' && session.role !== 'admin') return respond({ success: false, message: 'State or admin access required.' });
      var targetUser = getUserByEmail(targetEmail);
      if (!targetUser) return respond({ success: false, message: 'User not found.' });
      var vt = getOrCreateViewerToken(targetEmail);
      var viewerUrl = SITE_URL + '/state.html?vt=' + vt;
      return respond({ success: true, token: vt, url: viewerUrl });
    }

    if (action === 'createMeetingDoc') {
      if (!session || session.status !== 'active') return respond({ success: false, message: 'Not authorized.' });
      var meeting = getMeetingById(params.submission_id);
      if (!meeting) return respond({ success: false, message: 'Meeting not found.' });
      try {
        var title = 'MoM | ' + (meeting.district || '') + ' | ' + (meeting.stakeholder_name || 'Meeting') + ' | ' + (meeting.date || '');
        var doc = DocumentApp.create(title);
        var body = doc.getBody();
        var h1Style = {}; h1Style[DocumentApp.Attribute.HEADING] = DocumentApp.ParagraphHeading.HEADING1;
        var h2Style = {}; h2Style[DocumentApp.Attribute.HEADING] = DocumentApp.ParagraphHeading.HEADING2;
        body.appendParagraph('MINUTES OF MEETING').setAttributes(h1Style);
        body.appendParagraph('');
        body.appendParagraph('Date: ' + (meeting.date || ''));
        body.appendParagraph('Stakeholder: ' + (meeting.stakeholder_name || ''));
        body.appendParagraph('Department: ' + (meeting.department_organisation || ''));
        body.appendParagraph('Purpose: ' + (meeting.meeting_purpose || ''));
        body.appendParagraph('Level: ' + (meeting.level_of_meeting || ''));
        body.appendParagraph('Conducted By: ' + (meeting.conducted_by || ''));
        body.appendParagraph('District: ' + (meeting.district || ''));
        body.appendParagraph('');
        body.appendParagraph('KEY DISCUSSION POINTS').setAttributes(h2Style);
        body.appendParagraph(meeting.key_discussion_points || '(Not recorded)');
        body.appendParagraph('');
        body.appendParagraph('OUTCOME').setAttributes(h2Style);
        body.appendParagraph(meeting.outcome || '(Not recorded)');
        body.appendParagraph('');
        body.appendParagraph('NEXT ACTION').setAttributes(h2Style);
        body.appendParagraph((meeting.next_action || '(Not recorded)') + (meeting.responsible_person ? '\nResponsible: ' + meeting.responsible_person : ''));
        body.appendParagraph('');
        body.appendParagraph('SENIOR COMMENTS AND FEEDBACK').setAttributes(h2Style);
        body.appendParagraph('(Seniors: please add your comments and feedback below this line)');
        body.appendParagraph('');
        body.appendParagraph('---');
        body.appendParagraph('Generated by GR Reporting System | ' + session.email + ' | ' + Utilities.formatDate(new Date(), 'Asia/Kolkata', 'dd-MM-yyyy HH:mm'));
        var file = DriveApp.getFileById(doc.getId());
        file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.COMMENT);
        var docUrl = 'https://docs.google.com/document/d/' + doc.getId() + '/edit';
        updateMeetingDocLink(params.submission_id, docUrl);
        doc.saveAndClose();
        return respond({ success: true, url: docUrl });
      } catch(e) {
        return respond({ success: false, message: 'Failed to create document: ' + e.toString() });
      }
    }

    if (action === 'getMeetingTimeline') {
      if (!session || session.status !== 'active') return respond({ success: false, message: 'Not authorized.' });
      var plan = getPlannedMeetingById(params.plan_id);
      if (!plan) return respond({ success: false, message: 'Plan not found.' });
      var chainId = plan.chain_id || params.plan_id;
      var chainPlans = getChainMeetings(chainId);
      var allMtgs = getAllMeetings();
      var timeline = chainPlans.map(function(p) {
        var linked = p.linked_submission_id
          ? allMtgs.find(function(m) { return m.submission_id === p.linked_submission_id; }) || null
          : null;
        return { plan: p, meeting: linked };
      });
      return respond({ success: true, data: timeline, chain_id: chainId });
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
