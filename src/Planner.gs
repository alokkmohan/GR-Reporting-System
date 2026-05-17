function planMeeting(data, userEmail, district) {
  var sheet = getSheet('PlannedMeetings');
  var id = generateUUID();
  var ts = formatTimestamp(new Date());
  sheet.appendRow([
    id, ts, userEmail, district,
    data.stakeholder_type || '',
    data.stakeholder_name || '',
    data.meeting_date || '',
    data.meeting_time || '',
    data.level_of_meeting || '',
    data.block_cluster || '',
    data.meeting_purpose || '',
    data.notes || '',
    'planned',
    ''
  ]);
  return id;
}

function getPlannedMeetingsByEmail(email) {
  return sheetToObjects(getSheet('PlannedMeetings')).filter(function(r) {
    return r.user_email === email;
  });
}

function getPlannedMeetingsByDistrict(district) {
  return sheetToObjects(getSheet('PlannedMeetings')).filter(function(r) {
    return r.district === district;
  });
}

function getAllPlannedMeetings() {
  return sheetToObjects(getSheet('PlannedMeetings'));
}

function updatePlanStatus(planId, status, submissionId) {
  var sheet = getSheet('PlannedMeetings');
  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  var statusCol = headers.indexOf('status') + 1;
  var linkedCol = headers.indexOf('linked_submission_id') + 1;
  var idCol = headers.indexOf('plan_id');
  for (var i = 1; i < data.length; i++) {
    if (data[i][idCol] === planId) {
      sheet.getRange(i + 1, statusCol).setValue(status);
      if (submissionId) sheet.getRange(i + 1, linkedCol).setValue(submissionId);
      return true;
    }
  }
  return false;
}

function getPlannedMeetingById(planId) {
  var rows = sheetToObjects(getSheet('PlannedMeetings'));
  return rows.find(function(r) { return r.plan_id === planId; }) || null;
}
