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
    formData.escalation_required || ''
  ]);

  if (formData.meeting_conducted === 'YES' && formData.followup_date) {
    addFollowup(id, formData);
  }

  return id;
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
