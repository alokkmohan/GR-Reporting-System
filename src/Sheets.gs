var SHEET_ID = '1Rv1WZ6mjWgdAXY3fkYJf5Lpv1s1OfijXCzjqH9C25Ls';

function getSheet(name) {
  return SpreadsheetApp.openById(SHEET_ID).getSheetByName(name);
}

function sheetToObjects(sheet) {
  var data = sheet.getDataRange().getValues();
  if (data.length < 2) return [];
  var headers = data[0];
  return data.slice(1).map(function(row) {
    var obj = {};
    headers.forEach(function(h, i) { obj[h] = row[i]; });
    return obj;
  });
}

// ---------- USERS ----------

function getUserByEmail(email) {
  var rows = sheetToObjects(getSheet('Users'));
  return rows.find(function(r) { return r.email === email; }) || null;
}

function addUser(userData) {
  var sheet = getSheet('Users');
  sheet.appendRow([
    userData.email,
    userData.full_name,
    userData.posting_level || '',
    userData.district || '',
    userData.unit || '',
    userData.designation,
    userData.role || 'field',
    'active',
    formatTimestamp(new Date())
  ]);
}

function getSheetList(sheetName, defaults) {
  var ss = SpreadsheetApp.openById(SHEET_ID);
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    sheet.appendRow(['Name']);
    defaults.forEach(function(v) { sheet.appendRow([v]); });
  }
  var data = sheet.getDataRange().getValues();
  return data.slice(1).map(function(r) { return r[0]; }).filter(function(v) { return v !== ''; });
}

function getUnits() {
  return getSheetList('Units', ['TAU', 'TST', 'Vidhaya', 'Pragatai', 'Other']);
}

function getDesignations() {
  return getSheetList('Designations', ['SOH', 'Director Operations', 'ZOL', 'DOL', 'DPO', 'BPO', 'DPTO', 'SPSS', 'SIL', 'TAU Lead', 'Program Associate', 'Other']);
}

function getPostingLevels() {
  return getSheetList('PostingLevels', ['Centre', 'State', 'District', 'Block']);
}

function updateUserStatus(email, status) {
  var sheet = getSheet('Users');
  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  var statusCol = headers.indexOf('status') + 1;
  for (var i = 1; i < data.length; i++) {
    if (data[i][headers.indexOf('email')] === email) {
      sheet.getRange(i + 1, statusCol).setValue(status);
      return true;
    }
  }
  return false;
}

function updateUserProfile(email, data) {
  var sheet = getSheet('Users');
  var range = sheet.getDataRange();
  var vals = range.getValues();
  var headers = vals[0];
  // Ensure all updateable columns exist in the header row
  ['full_name', 'unit', 'designation', 'photo_url', 'phone'].forEach(function(col) {
    if (headers.indexOf(col) === -1) {
      sheet.getRange(1, headers.length + 1).setValue(col);
      headers.push(col);
    }
  });
  for (var i = 1; i < vals.length; i++) {
    if (vals[i][headers.indexOf('email')] === email) {
      ['full_name', 'unit', 'designation', 'photo_url', 'phone'].forEach(function(field) {
        if (data[field] === undefined || data[field] === null) return;
        if (field === 'full_name' && data[field] === '') return;
        var col = headers.indexOf(field);
        if (col >= 0) sheet.getRange(i + 1, col + 1).setValue(data[field]);
      });
      return true;
    }
  }
  return false;
}

function updateUserRole(email, role) {
  var sheet = getSheet('Users');
  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  var roleCol = headers.indexOf('role') + 1;
  for (var i = 1; i < data.length; i++) {
    if (data[i][headers.indexOf('email')] === email) {
      sheet.getRange(i + 1, roleCol).setValue(role);
      return true;
    }
  }
  return false;
}

function getAllPendingUsers() {
  return sheetToObjects(getSheet('Users')).filter(function(r) {
    return r.status === 'pending';
  });
}

function getAllUsers() {
  return sheetToObjects(getSheet('Users'));
}

// ---------- MEETINGS ----------

function submitMeeting(formData) {
  var sheet = getSheet('Meetings');
  var id = generateUUID();
  var ts = formatTimestamp(new Date());
  var rm = getReportingMonth(formData.date);

  // Ensure ALL columns exist (handles fresh sheet with no headers)
  var lastCol = sheet.getLastColumn();
  var headers = lastCol > 0 ? sheet.getRange(1, 1, 1, lastCol).getValues()[0] : [];
  var allCols = [
    'submission_id','timestamp','user_email','meeting_conducted','date','reporting_month',
    'unit','district','block_cluster','conducted_by','staff_name','level_of_meeting',
    'other_participants','stakeholder_type','stakeholder_name','department_organisation',
    'meeting_purpose','key_discussion_points','outcome','next_action','responsible_person',
    'followup_date','followup_status','photo_link','remark','priority_level','escalation_required',
    'attendee_type','actual_attendee_name','meeting_status','action_items','plan_id','co_entry',
    'reason_not_conducted','followup_notes','meeting_images','mom_doc_link'
  ];
  allCols.forEach(function(col) {
    if (headers.indexOf(col) === -1) {
      sheet.getRange(1, headers.length + 1).setValue(col);
      headers.push(col);
    }
  });

  sheet.appendRow([
    id, ts,
    formData.user_email,
    formData.meeting_conducted,
    formData.date,
    rm,
    formData.unit || '',
    formData.district || '',
    formData.block_cluster || '',
    formData.conducted_by || '',
    formData.staff_name || '',
    formData.level_of_meeting || '',
    formData.other_participants || '',
    formData.stakeholder_type || '',
    formData.stakeholder_name || '',
    formData.department_organisation || '',
    formData.meeting_purpose || '',
    formData.key_discussion_points || '',
    formData.outcome || '',
    formData.next_action || '',
    formData.responsible_person || '',
    formData.followup_date || '',
    formData.followup_status || '',
    formData.photo_link || '',
    formData.remark || '',
    formData.priority_level || '',
    formData.escalation_required || '',
    formData.attendee_type || '',
    formData.actual_attendee_name || '',
    formData.meeting_status || '',
    formData.action_items || '',
    formData.plan_id || '',
    formData.co_entry || '',
    formData.reason_not_conducted || '',
    formData.followup_notes || '',
    formData.meeting_images || ''
  ]);

  if (formData.meeting_conducted === 'YES' && formData.followup_date) {
    addFollowup(id, formData);
  }

  return id;
}

function deletePlannedMeeting(planId) {
  var sheet = getSheet('PlannedMeetings');
  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  var idCol = headers.indexOf('plan_id');
  for (var i = 1; i < data.length; i++) {
    if (data[i][idCol] === planId) { sheet.deleteRow(i + 1); return true; }
  }
  return false;
}

function updatePlannedMeeting(planId, updateData) {
  var sheet = getSheet('PlannedMeetings');
  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  var idCol = headers.indexOf('plan_id');
  var fields = ['meeting_date','meeting_time','stakeholder_type','stakeholder_name','meeting_purpose',
    'level_of_meeting','block_cluster','document_link','agenda_items','meeting_mode','meet_link','location','colleague_email',
    'event_type','duration','participants'];
  for (var i = 1; i < data.length; i++) {
    if (data[i][idCol] === planId) {
      fields.forEach(function(field) {
        var col = headers.indexOf(field);
        if (col >= 0 && updateData[field] !== undefined) sheet.getRange(i + 1, col + 1).setValue(updateData[field]);
      });
      return true;
    }
  }
  return false;
}

function getMeetingById(submissionId) {
  var rows = sheetToObjects(getSheet('Meetings'));
  return rows.find(function(r) { return r.submission_id === submissionId; }) || null;
}

function updateMeetingDocLink(submissionId, docUrl) {
  var sheet = getSheet('Meetings');
  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  if (headers.indexOf('mom_doc_link') === -1) {
    sheet.getRange(1, headers.length + 1).setValue('mom_doc_link');
    headers.push('mom_doc_link');
  }
  var idCol = headers.indexOf('submission_id');
  var docCol = headers.indexOf('mom_doc_link') + 1;
  for (var i = 1; i < data.length; i++) {
    if (data[i][idCol] === submissionId) {
      sheet.getRange(i + 1, docCol).setValue(docUrl);
      return true;
    }
  }
  return false;
}

function getMeetingsByEmail(email) {
  return sheetToObjects(getSheet('Meetings')).filter(function(r) {
    return r.user_email === email;
  });
}

function getMeetingsByDistrict(district) {
  return sheetToObjects(getSheet('Meetings')).filter(function(r) {
    return r.district === district;
  });
}

function getAllMeetings() {
  return sheetToObjects(getSheet('Meetings'));
}

// ---------- LOGIN LOG ----------

function logLogin(email, fullName) {
  var ss = SpreadsheetApp.openById(SHEET_ID);
  var sheet = ss.getSheetByName('LoginLog');
  if (!sheet) {
    sheet = ss.insertSheet('LoginLog');
    sheet.appendRow(['Timestamp', 'Email', 'Full Name', 'Date', 'Time']);
  }
  var now = new Date();
  var dateStr = Utilities.formatDate(now, 'Asia/Kolkata', 'dd-MM-yyyy');
  var timeStr = Utilities.formatDate(now, 'Asia/Kolkata', 'HH:mm:ss');
  sheet.appendRow([formatTimestamp(now), email, fullName, dateStr, timeStr]);
}

// ---------- FOLLOWUPS ----------

// ---------- VIEWER TOKENS ----------

function getOrCreateViewerToken(email) {
  var sheet = getSheet('Users');
  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  if (headers.indexOf('viewer_token') === -1) {
    sheet.getRange(1, headers.length + 1).setValue('viewer_token');
    headers.push('viewer_token');
  }
  var emailCol = headers.indexOf('email');
  var vtCol = headers.indexOf('viewer_token');
  for (var i = 1; i < data.length; i++) {
    if (data[i][emailCol] === email) {
      var existing = data[i][vtCol];
      if (existing) return existing;
      var newToken = generateUUID();
      sheet.getRange(i + 1, vtCol + 1).setValue(newToken);
      return newToken;
    }
  }
  return null;
}

function getUserByViewerToken(vt) {
  if (!vt) return null;
  var rows = sheetToObjects(getSheet('Users'));
  return rows.find(function(r) { return r.viewer_token === vt && r.status === 'active'; }) || null;
}

// ---------- FOLLOWUPS ----------

function addFollowup(submissionId, formData) {
  var sheet = getSheet('Followups');
  sheet.appendRow([
    submissionId,
    formData.user_email,
    formData.district,
    formData.next_action || '',
    formData.responsible_person || '',
    formData.followup_date,
    formData.followup_status || 'Pending',
    ''
  ]);
}
