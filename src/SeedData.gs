// ── USAGE ────────────────────────────────────────────────────────────────────
// resetSampleData()  → wipes sheets clean + loads fresh sample data (use this)
// seedSampleData()   → adds data on top of existing rows (run ONLY on clean sheets)
// clearSampleData()  → removes last seed run's rows by stored IDs

function resetSampleData() {
  try {
    // ── Wipe Meetings sheet and rebuild with correct headers ──
    var meetSheet = getSheet('Meetings');
    if (meetSheet) {
      meetSheet.clearContents();
      meetSheet.appendRow([
        'submission_id','timestamp','user_email','meeting_conducted','date','reporting_month',
        'unit','district','block_cluster','conducted_by','staff_name','level_of_meeting',
        'other_participants','stakeholder_type','stakeholder_name','department_organisation',
        'meeting_purpose','key_discussion_points','outcome','next_action','responsible_person',
        'followup_date','followup_status','photo_link','remark','priority_level','escalation_required',
        'attendee_type','actual_attendee_name','meeting_status','action_items','plan_id','co_entry',
        'reason_not_conducted','followup_notes'
      ]);
    }

    // ── Wipe PlannedMeetings sheet and rebuild with correct headers ──
    var planSheet = getSheet('PlannedMeetings');
    if (planSheet) {
      planSheet.clearContents();
      planSheet.appendRow([
        'plan_id','timestamp','user_email','district','stakeholder_type','stakeholder_name',
        'meeting_date','meeting_time','level_of_meeting','block_cluster','meeting_purpose','notes',
        'status','linked_submission_id','document_link','parent_plan_id','chain_id','agenda_items'
      ]);
    }

    // ── Clear Followups data (keep header if exists) ──
    var fSheet = getSheet('Followups');
    if (fSheet && fSheet.getLastRow() > 1) {
      fSheet.deleteRows(2, fSheet.getLastRow() - 1);
    }

    // ── Clear stored seed IDs ──
    var props = PropertiesService.getScriptProperties();
    props.deleteProperty('SEED_PLAN_IDS');
    props.deleteProperty('SEED_MEETING_IDS');

    // ── Re-seed with fresh data ──
    return seedSampleData();
  } catch(e) {
    return '❌ Reset Error: ' + e.message + '\n' + e.stack;
  }
}

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

    // ── Not-Conducted Meetings (4 records) ──────────────────

    // NC1 — BSA Bahraich: Not Available
    var nc1 = submitMeeting({
      user_email:EMAIL, meeting_conducted:'NO',
      date:dOff(-19), unit:'TAU', district:'Bahraich',
      block_cluster:'Bahraich Sadar', conducted_by:'BPO', staff_name:'Suresh Yadav',
      level_of_meeting:'District', stakeholder_type:'BSA', stakeholder_name:'BSA Bahraich',
      department_organisation:'Basic Shiksha Vibhag', meeting_purpose:'Enrollment',
      reason_not_conducted:'Not Available',
      followup_date:dOff(5), followup_status:'Pending',
      followup_notes:'BSA saab achanak district-level samiksha baithak mein chaley gaye, pehle se suchit nahi tha. Office staff ne bataya ki agle hafte time milega. Phone par short baat hui — BSA ne khud kaha ki schedule karein. Dobara appointment fix kiya gaya.',
      remark:'Neutral', priority_level:'High',
      plan_id:'', co_entry:''
    });

    // NC2 — SDM Hardoi: Refused
    var nc2 = submitMeeting({
      user_email:EMAIL, meeting_conducted:'NO',
      date:dOff(-14), unit:'Pragatai', district:'Hardoi',
      block_cluster:'Hardoi', conducted_by:'DOL', staff_name:'Ravi Kumar',
      level_of_meeting:'District', stakeholder_type:'District Collector', stakeholder_name:'SDM Hardoi',
      department_organisation:"Sub-Divisional Magistrate Office", meeting_purpose:'Introductory Meeting',
      reason_not_conducted:'Refused',
      followup_date:'', followup_status:'Pending',
      followup_notes:'SDM ne office mein milne se mana kar diya. PA ne bataya ki SDM chahte hain ki pehle district-level enrollment data aur program impact report bheja jaaye. Data packet tayar karke bhejne ki planning ki ja rahi hai. Iske baad dobara appointment maanga jaayega.',
      remark:'Cold', priority_level:'Medium',
      plan_id:'', co_entry:''
    });

    // NC3 — BDO Biswan: Travel Issue
    var nc3 = submitMeeting({
      user_email:EMAIL, meeting_conducted:'NO',
      date:dOff(-8), unit:'TAU', district:'Sitapur',
      block_cluster:'Biswan', conducted_by:'BPO', staff_name:'Kavita Singh',
      level_of_meeting:'Block', stakeholder_type:'BDO', stakeholder_name:'BDO Biswan',
      department_organisation:'Block Development Office', meeting_purpose:'School Liasioning',
      reason_not_conducted:'Travel Issue',
      followup_date:dOff(7), followup_status:'Pending',
      followup_notes:'Raste mein gaadi puncture ho gayi — Biswan tak pahunchna sambhav nahi raha. BDO saab se phone par baat ki, unhone kaha ki agle hafte aa jaayein. Naya appointment confirm kiya gaya.',
      remark:'Neutral', priority_level:'Medium',
      plan_id:'', co_entry:''
    });

    // NC4 — ABSA Lucknow: Postponed (auto-plan next date)
    var nc4 = submitMeeting({
      user_email:EMAIL, meeting_conducted:'NO',
      date:dOff(-5), unit:'TAU', district:'Lucknow',
      block_cluster:'Lucknow Sadar', conducted_by:'ZOL', staff_name:'Priya Sharma',
      level_of_meeting:'Block', stakeholder_type:'ABSA', stakeholder_name:'ABSA Lucknow Sadar',
      department_organisation:'Basic Shiksha Vibhag', meeting_purpose:'Review Meeting',
      reason_not_conducted:'Postponed',
      followup_date:dOff(12), followup_status:'Pending',
      followup_notes:'ABSA ne khud phone karke bataya ki uss din unki block-level annual pariksha duty thi. Unhone agle 12 din baad ki date di aur kaha ki tab zaroor milenge. Agenda bhi email par share kar diya gaya.',
      remark:'Positive', priority_level:'Medium',
      plan_id:'', co_entry:''
    });

    // Store seed IDs so clearSampleData() can remove them
    var props = PropertiesService.getScriptProperties();
    props.setProperty('SEED_PLAN_IDS',    JSON.stringify([c1p1,c1p2,c1p3,c2p1,c2p2,c4p1,c4p2]));
    props.setProperty('SEED_MEETING_IDS', JSON.stringify([m1,m2,m3,m4,m5,nc1,nc2,nc3,nc4]));

    return '✅ Done! Added 12 planned + 5 conducted + 4 not-conducted records across 7 chains.\n\n'
      + 'Conducted:\n'
      + '  ✓ BSA Sitapur × 2 (Apr + May)\n'
      + '  ✓ CDO Hardoi × 1 (Apr)\n'
      + '  ✓ DIET Principal Sitapur × 2 (Apr)\n\n'
      + 'Not Conducted:\n'
      + '  ✗ BSA Bahraich — Not Available (rescheduled)\n'
      + '  ✗ SDM Hardoi — Refused (data maanga)\n'
      + '  ✗ BDO Biswan — Travel Issue (rescheduled)\n'
      + '  ✗ ABSA Lucknow — Postponed (unka duty tha)\n\n'
      + 'Chains: BSA Sitapur (Active) · CDO Hardoi (Overdue) · DM Lucknow · DIET (Done) · BDO Bahraich (Overdue) · ABSA Hardoi · SPD Lucknow';

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
