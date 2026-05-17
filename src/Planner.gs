function planMeeting(data, userEmail, district) {
  var sheet = getSheet('PlannedMeetings');
  var id = generateUUID();
  var ts = formatTimestamp(new Date());

  var lastCol = sheet.getLastColumn();
  var headers = lastCol > 0 ? sheet.getRange(1, 1, 1, lastCol).getValues()[0] : [];
  var required = ['plan_id','timestamp','user_email','district','stakeholder_type','stakeholder_name',
    'meeting_date','meeting_time','level_of_meeting','block_cluster','meeting_purpose','notes',
    'status','linked_submission_id','document_link','parent_plan_id','chain_id','agenda_items'];
  required.forEach(function(col) {
    if (headers.indexOf(col) === -1) {
      sheet.getRange(1, headers.length + 1).setValue(col);
      headers.push(col);
    }
  });

  var chainId = data.chain_id || id;

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
    'planned', '',
    data.document_link || '',
    data.parent_plan_id || '',
    chainId,
    data.agenda_items || ''
  ]);
  return id;
}

function createFollowUpPlan(parentPlanId, data, userEmail, district) {
  var parent = getPlannedMeetingById(parentPlanId);
  var chainId = (parent && parent.chain_id) ? parent.chain_id : (parentPlanId || generateUUID());
  return planMeeting({
    meeting_date: data.followup_date || '',
    meeting_time: '',
    stakeholder_type: data.followup_stakeholder_type || (parent ? parent.stakeholder_type : '') || '',
    stakeholder_name: data.followup_stakeholder_name || (parent ? parent.stakeholder_name : '') || '',
    meeting_purpose: parent ? parent.meeting_purpose : '',
    level_of_meeting: parent ? parent.level_of_meeting : '',
    block_cluster: parent ? parent.block_cluster : '',
    notes: data.followup_notes || '',
    document_link: '',
    parent_plan_id: parentPlanId,
    chain_id: chainId
  }, userEmail, district);
}

function getPlannedMeetingById(planId) {
  var rows = sheetToObjects(getSheet('PlannedMeetings'));
  return rows.find(function(r) { return r.plan_id === planId; }) || null;
}

function getChainMeetings(chainId) {
  var rows = sheetToObjects(getSheet('PlannedMeetings'));
  return rows.filter(function(r) { return r.chain_id === chainId; })
    .sort(function(a, b) { return new Date(a.meeting_date || 0) - new Date(b.meeting_date || 0); });
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
