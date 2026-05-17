// Run seedSampleData() once from the Apps Script editor to load demo data.
// Run clearSampleData() to remove it.

function seedSampleData() {
  try {
    var EMAIL = 'alok.mohan@educategirls.ngo';
    var now   = new Date();

    function dOff(n) {
      var d = new Date(now); d.setDate(d.getDate() + n);
      return Utilities.formatDate(d, 'Asia/Kolkata', 'yyyy-MM-dd');
    }

    // ── 7 Stakeholder Chains ─────────────────────────────────

    // Chain 1 — BSA Sitapur (Active, follow-up upcoming)
    var c1p1 = planMeeting({
      stakeholder_type:'BSA', stakeholder_name:'BSA Sitapur',
      meeting_date:dOff(-37), meeting_time:'11:00',
      level_of_meeting:'District', block_cluster:'Sitapur Sadar',
      meeting_purpose:'Enrollment',
      notes:'Initial Q1 enrollment review with BSA',
      agenda_items:JSON.stringify(['Enrollment gap analysis','Dropout list review in Maholi block','Plan home visit schedule'])
    }, EMAIL, 'Sitapur');

    var c1p2 = planMeeting({
      stakeholder_type:'BSA', stakeholder_name:'BSA Sitapur',
      meeting_date:dOff(-12), meeting_time:'10:00',
      level_of_meeting:'District', block_cluster:'Sitapur Sadar',
      meeting_purpose:'Review Meeting',
      notes:'Follow-up on enrollment action points',
      parent_plan_id:c1p1, chain_id:c1p1,
      agenda_items:JSON.stringify(['MPR submission status','Attendance tracker review','Maholi block update'])
    }, EMAIL, 'Sitapur');

    var c1p3 = planMeeting({
      stakeholder_type:'BSA', stakeholder_name:'BSA Sitapur',
      meeting_date:dOff(16), meeting_time:'11:00',
      level_of_meeting:'District', block_cluster:'Sitapur Sadar',
      meeting_purpose:'MPR Submission',
      notes:'Quarterly review — Q2 data',
      parent_plan_id:c1p2, chain_id:c1p1,
      agenda_items:JSON.stringify(['Q2 enrollment data','Budget utilization review','Next quarter targets'])
    }, EMAIL, 'Sitapur');

    // Chain 2 — CDO Hardoi (Overdue follow-up)
    var c2p1 = planMeeting({
      stakeholder_type:'CDO', stakeholder_name:'CDO Hardoi',
      meeting_date:dOff(-25), meeting_time:'15:00',
      level_of_meeting:'District', block_cluster:'Hardoi',
      meeting_purpose:'Introductory Meeting',
      notes:'First meeting with CDO, program introduction',
      agenda_items:JSON.stringify(['Educate Girls program overview','District enrollment challenges','Request for DTF inclusion'])
    }, EMAIL, 'Hardoi');

    var c2p2 = planMeeting({
      stakeholder_type:'CDO', stakeholder_name:'CDO Hardoi',
      meeting_date:dOff(-7), meeting_time:'15:00',
      level_of_meeting:'District', block_cluster:'Hardoi',
      meeting_purpose:'Review Meeting',
      notes:'Follow-up on district support commitments',
      parent_plan_id:c2p1, chain_id:c2p1,
      agenda_items:JSON.stringify(['Support letter status','DTF agenda inclusion','Action taken on enrollment'])
    }, EMAIL, 'Hardoi');

    // Chain 3 — DM Lucknow (Upcoming, no prior meeting)
    planMeeting({
      stakeholder_type:'District Collector', stakeholder_name:'DM Lucknow',
      meeting_date:dOff(11), meeting_time:'12:00',
      level_of_meeting:'District', block_cluster:'Lucknow',
      meeting_purpose:'Courtesy Meeting',
      notes:'Annual courtesy meeting with District Magistrate',
      agenda_items:JSON.stringify(['Program impact update','Request for official support letter','DTF agenda items'])
    }, EMAIL, 'Lucknow');

    // Chain 4 — DIET Principal Sitapur (Completed chain)
    var c4p1 = planMeeting({
      stakeholder_type:'DIET Principal', stakeholder_name:'DIET Principal Sitapur',
      meeting_date:dOff(-44), meeting_time:'10:30',
      level_of_meeting:'District', block_cluster:'Sitapur',
      meeting_purpose:'Learning',
      notes:'Teacher training coordination with DIET',
      agenda_items:JSON.stringify(['Training calendar finalization','EG material integration','Resource sharing plan'])
    }, EMAIL, 'Sitapur');

    var c4p2 = planMeeting({
      stakeholder_type:'DIET Principal', stakeholder_name:'DIET Principal Sitapur',
      meeting_date:dOff(-22), meeting_time:'10:30',
      level_of_meeting:'District', block_cluster:'Sitapur',
      meeting_purpose:'Review Meeting',
      notes:'Post-training review meeting',
      parent_plan_id:c4p1, chain_id:c4p1,
      agenda_items:JSON.stringify(['Training completion data (28 teachers)','Feedback from participants','Expansion plan to Maholi & Biswan'])
    }, EMAIL, 'Sitapur');

    // Chain 5 — BDO Bahraich (Overdue, single meeting)
    planMeeting({
      stakeholder_type:'BDO', stakeholder_name:'BDO Bahraich Sadar',
      meeting_date:dOff(-9), meeting_time:'11:00',
      level_of_meeting:'Block', block_cluster:'Bahraich Sadar',
      meeting_purpose:'School Liasioning',
      notes:'School infrastructure & girls enrollment discussion',
      agenda_items:JSON.stringify(['School infrastructure gaps','Mid-day meal attendance','Girls enrollment improvement plan'])
    }, EMAIL, 'Bahraich');

    // Chain 6 — ABSA Hardoi (Upcoming, June)
    planMeeting({
      stakeholder_type:'ABSA', stakeholder_name:'ABSA Hardoi',
      meeting_date:dOff(26), meeting_time:'14:00',
      level_of_meeting:'Block', block_cluster:'Hardoi',
      meeting_purpose:'Review Meeting',
      notes:'Block level monthly review',
      agenda_items:JSON.stringify(['Block enrollment data','Teacher attendance review','ASER data discussion','Cluster visit plan'])
    }, EMAIL, 'Hardoi');

    // Chain 7 — SPD Lucknow (Active, upcoming + future)
    var c7p1 = planMeeting({
      stakeholder_type:'SPD', stakeholder_name:'SPD Office Lucknow',
      meeting_date:dOff(3), meeting_time:'11:00',
      level_of_meeting:'State', block_cluster:'Lucknow',
      meeting_purpose:'MPR Submission',
      notes:'Monthly progress report — May',
      agenda_items:JSON.stringify(['May MPR data submission','State level program update','Policy discussion on girl enrollment'])
    }, EMAIL, 'Lucknow');

    planMeeting({
      stakeholder_type:'SPD', stakeholder_name:'SPD Office Lucknow',
      meeting_date:dOff(34), meeting_time:'11:00',
      level_of_meeting:'State', block_cluster:'Lucknow',
      meeting_purpose:'Review Meeting',
      notes:'Quarterly state review — Q2',
      parent_plan_id:c7p1, chain_id:c7p1,
      agenda_items:JSON.stringify(['Q2 enrollment review','Budget utilization','FY planning for next quarter'])
    }, EMAIL, 'Lucknow');

    // ── 5 Conducted Meetings ─────────────────────────────────

    var m1 = submitMeeting({
      user_email:EMAIL, meeting_conducted:'YES',
      date:dOff(-37), unit:'TAU', district:'Sitapur',
      block_cluster:'Sitapur Sadar', conducted_by:'ZOL', staff_name:'Priya Sharma',
      level_of_meeting:'District', other_participants:'DPTO Sitapur',
      stakeholder_type:'BSA', stakeholder_name:'BSA Sitapur',
      department_organisation:'Basic Shiksha Vibhag', meeting_purpose:'Enrollment',
      key_discussion_points:'Discussed Q4 enrollment gaps in 3 blocks. BSA confirmed 4 schools in Maholi block have high dropout rates among girls in Class 6-8. Agreed to do joint school visits. BSA will share school-wise data.',
      outcome:'BSA agreed to issue circular to all school heads for improving attendance tracking. Maholi block identified as priority zone. Joint school visits planned.',
      next_action:'Issue attendance circular to school heads', responsible_person:'BSA Office',
      followup_date:dOff(-12), followup_status:'Completed',
      photo_link:'', remark:'Positive', priority_level:'High', escalation_required:'No',
      attendee_type:'same', actual_attendee_name:'BSA Sitapur',
      meeting_status:'completed',
      action_items:JSON.stringify([
        {action:'Issue circular to all school heads in district', owner:'BSA Office', due_date:dOff(-28)},
        {action:'Prepare school-wise dropout data for Maholi block', owner:'BPO Maholi', due_date:dOff(-25)}
      ]),
      plan_id:c1p1, co_entry:''
    });
    updatePlanStatus(c1p1, 'conducted', m1);

    var m2 = submitMeeting({
      user_email:EMAIL, meeting_conducted:'YES',
      date:dOff(-12), unit:'TAU', district:'Sitapur',
      block_cluster:'Sitapur Sadar', conducted_by:'ZOL', staff_name:'Priya Sharma',
      level_of_meeting:'District', other_participants:'',
      stakeholder_type:'BSA', stakeholder_name:'BSA Sitapur',
      department_organisation:'Basic Shiksha Vibhag', meeting_purpose:'Review Meeting',
      key_discussion_points:'Circular compliance: 78% of schools responded with data. Maholi dropout report received — 312 girls identified at risk. Joint school visits scheduled for 3rd week of month. BSA confirmed personal visit to 2 schools.',
      outcome:'Joint visit schedule confirmed. BPO Maholi and ZOL to visit 5 schools together. BSA to follow up with remaining schools on circular.',
      next_action:'Conduct joint school visits in Maholi block', responsible_person:'ZOL Sitapur',
      followup_date:dOff(16), followup_status:'Pending',
      photo_link:'', remark:'Positive', priority_level:'High', escalation_required:'No',
      attendee_type:'same', actual_attendee_name:'BSA Sitapur',
      meeting_status:'follow_up_required',
      action_items:JSON.stringify([
        {action:'Conduct joint school visits — 5 schools in Maholi', owner:'ZOL + BPO Maholi', due_date:dOff(5)},
        {action:'Submit joint visit report to BSA office', owner:'ZOL Sitapur', due_date:dOff(20)}
      ]),
      plan_id:c1p2, co_entry:''
    });
    updatePlanStatus(c1p2, 'conducted', m2);

    var m3 = submitMeeting({
      user_email:EMAIL, meeting_conducted:'YES',
      date:dOff(-25), unit:'Pragatai', district:'Hardoi',
      block_cluster:'Hardoi', conducted_by:'DOL', staff_name:'Ravi Kumar',
      level_of_meeting:'District', other_participants:'DPO Hardoi',
      stakeholder_type:'CDO', stakeholder_name:'CDO Hardoi',
      department_organisation:"Collector's Office", meeting_purpose:'Introductory Meeting',
      key_discussion_points:'Introduced Educate Girls program to CDO with state-level impact data. Shared Hardoi district enrollment challenges — 8,400 out-of-school girls estimated. CDO expressed strong interest in girl-child education.',
      outcome:'CDO agreed to include EG program in next DTF meeting agenda. Official support letter to be issued. CDO asked for detailed district data for review.',
      next_action:'Get official support letter from CDO office', responsible_person:'DOL Hardoi',
      followup_date:dOff(-7), followup_status:'Pending',
      photo_link:'', remark:'Positive', priority_level:'High', escalation_required:'No',
      attendee_type:'same', actual_attendee_name:'CDO Hardoi',
      meeting_status:'follow_up_required',
      action_items:JSON.stringify([
        {action:'Draft support letter and send for CDO signature', owner:'DOL Hardoi', due_date:dOff(-15)},
        {action:'Include EG in next DTF agenda document', owner:'CDO Office', due_date:dOff(-7)}
      ]),
      plan_id:c2p1, co_entry:''
    });
    updatePlanStatus(c2p1, 'conducted', m3);

    var m4 = submitMeeting({
      user_email:EMAIL, meeting_conducted:'YES',
      date:dOff(-44), unit:'TAU', district:'Sitapur',
      block_cluster:'Sitapur', conducted_by:'SOH', staff_name:'Anita Verma',
      level_of_meeting:'District', other_participants:'ABSA, 2 BRPs',
      stakeholder_type:'DIET Principal', stakeholder_name:'DIET Principal Sitapur',
      department_organisation:'DIET', meeting_purpose:'Learning',
      key_discussion_points:'Discussed integrating EG learning materials into teacher training modules at BRC level. DIET Principal reviewed our content and expressed strong support. Agreed on 2-day teacher orientation, date confirmed as April 20-21.',
      outcome:'DIET to include EG materials in April BRC training. 30+ teachers to be covered. DIET Principal to be present on Day 1.',
      next_action:'Conduct 2-day teacher orientation training', responsible_person:'SOH + TAU Lead',
      followup_date:dOff(-22), followup_status:'Completed',
      photo_link:'', remark:'Positive', priority_level:'Medium', escalation_required:'No',
      attendee_type:'same', actual_attendee_name:'DIET Principal Sitapur',
      meeting_status:'follow_up_required',
      action_items:JSON.stringify([
        {action:'Prepare and print training materials (60 copies)', owner:'TAU Lead', due_date:dOff(-40)},
        {action:'Confirm final participant list with DIET office', owner:'DIET Principal', due_date:dOff(-37)}
      ]),
      plan_id:c4p1, co_entry:''
    });
    updatePlanStatus(c4p1, 'conducted', m4);

    var m5 = submitMeeting({
      user_email:EMAIL, meeting_conducted:'YES',
      date:dOff(-22), unit:'TAU', district:'Sitapur',
      block_cluster:'Sitapur', conducted_by:'SOH', staff_name:'Anita Verma',
      level_of_meeting:'District', other_participants:'BRP Sitapur, 28 Teachers',
      stakeholder_type:'DIET Principal', stakeholder_name:'DIET Principal Sitapur',
      department_organisation:'DIET', meeting_purpose:'Review Meeting',
      key_discussion_points:'Post-training review: 28 teachers trained across 3 days (1 extra day added). DIET Principal shared very positive feedback. Teachers reported change in approach to girl enrollment. Plan to expand to Maholi and Biswan blocks.',
      outcome:'Training objective fully achieved. DIET to include EG in annual training calendar for FY 2026-27. Block expansion to Maholi and Biswan confirmed.',
      next_action:'', responsible_person:'',
      followup_date:'', followup_status:'Not Required',
      photo_link:'', remark:'Positive', priority_level:'Medium', escalation_required:'No',
      attendee_type:'same', actual_attendee_name:'DIET Principal Sitapur',
      meeting_status:'completed',
      action_items:JSON.stringify([]),
      plan_id:c4p2, co_entry:''
    });
    updatePlanStatus(c4p2, 'conducted', m5);

    // Store seed IDs so clearSampleData() can remove them
    var props = PropertiesService.getScriptProperties();
    props.setProperty('SEED_PLAN_IDS',    JSON.stringify([c1p1,c1p2,c1p3,c2p1,c2p2,c4p1,c4p2]));
    props.setProperty('SEED_MEETING_IDS', JSON.stringify([m1,m2,m3,m4,m5]));

    return '✅ Done! Added 12 planned meetings + 5 conducted meetings across 7 stakeholder chains.\n\n'
      + 'Chains created:\n'
      + '  1. BSA Sitapur — 3 meetings (2 done, 1 upcoming Jun ' + dOff(16).slice(-2) + ')\n'
      + '  2. CDO Hardoi — 2 meetings (1 done, 1 OVERDUE)\n'
      + '  3. DM Lucknow — upcoming meeting\n'
      + '  4. DIET Principal Sitapur — COMPLETED (2/2 done)\n'
      + '  5. BDO Bahraich — OVERDUE single meeting\n'
      + '  6. ABSA Hardoi — upcoming (June)\n'
      + '  7. SPD Lucknow — 2 upcoming meetings';

  } catch(e) {
    return '❌ Error: ' + e.message + '\n' + e.stack;
  }
}

function clearSampleData() {
  try {
    var props = PropertiesService.getScriptProperties();
    var planIds    = JSON.parse(props.getProperty('SEED_PLAN_IDS')    || '[]');
    var meetingIds = JSON.parse(props.getProperty('SEED_MEETING_IDS') || '[]');

    if (!planIds.length && !meetingIds.length) {
      return '⚠️ No seed data found. Run seedSampleData() first.';
    }

    function deleteRowsById(sheetName, idCol, ids) {
      var sheet = getSheet(sheetName);
      if (!sheet) return 0;
      var data  = sheet.getDataRange().getValues();
      var col   = data[0].indexOf(idCol);
      var count = 0;
      for (var i = data.length - 1; i >= 1; i--) {
        if (ids.indexOf(data[i][col]) !== -1) {
          sheet.deleteRow(i + 1);
          count++;
        }
      }
      return count;
    }

    var pDel = deleteRowsById('PlannedMeetings', 'plan_id',      planIds);
    var mDel = deleteRowsById('Meetings',        'submission_id', meetingIds);

    // Also clean up any Followups rows created by the seed meetings
    var fSheet = getSheet('Followups');
    if (fSheet) {
      var fData = fSheet.getDataRange().getValues();
      for (var i = fData.length - 1; i >= 1; i--) {
        if (meetingIds.indexOf(fData[i][0]) !== -1) fSheet.deleteRow(i + 1);
      }
    }

    props.deleteProperty('SEED_PLAN_IDS');
    props.deleteProperty('SEED_MEETING_IDS');

    return '🗑️ Cleared: ' + pDel + ' planned meetings, ' + mDel + ' meeting submissions.';
  } catch(e) {
    return '❌ Error: ' + e.message;
  }
}
