#!/usr/bin/env node
/**
 * Seed realistic APD mock assessment data
 * APD is a 65+ year old, well-established disability org in Bangalore
 * Strengths: programmes, advocacy, legal. Gaps: IT, fundraising diversification, some HR areas.
 */
require('dotenv').config();
const pool = require('../db/pool');

const SCORES = {
  // Strategic Clarity & Coherence — strong for established org
  '1a': { current: 4, target: 4, priority: null, notes: 'Clear mission since 1959. "Nothing about us, without us" principle deeply embedded. All staff and board articulate the vision consistently.' },
  '1b': { current: 3, target: 4, priority: 'Medium', notes: 'Strategic plan exists and guides programmatic work. Needs assessments conducted for most programmes. Could improve stakeholder consultation in planning cycles.' },
  '1c': { current: 4, target: 4, priority: null, notes: 'DEI is core to APD identity. Disability inclusion embedded in strategy, ToC, and budget. Gender and caste intersectionality also addressed.' },

  // Governance & Board — strong board with room for more engagement
  '2a': { current: 3, target: 4, priority: 'Medium', notes: '9 trustees from diverse sectors. Most independent. Could strengthen expertise in digital/tech and fundraising.' },
  '2b': { current: 3, target: 4, priority: 'Low', notes: 'Regular board meetings, well-documented. Good guidance from board. Some members could be more actively engaged in resource mobilisation.' },
  '2c': { current: 3, target: 4, priority: 'High', notes: 'Board has representation from PWD community. Gender balance improving. Need more representation from Dalit and Adivasi communities.' },

  // Organisation Management & Culture — mature but some gaps
  '3a': { current: 3, target: 4, priority: 'Low', notes: 'Well-designed structure across programmes. Some overlap between advocacy and programme teams. Roles generally clear.' },
  '3b': { current: 2, target: 3, priority: 'Medium', notes: 'Processes exist for internal change but response to external shifts (policy, funding landscape) is slow. Staff involvement in change planning is limited.', timeline_start: '2026-04-01', timeline_end: '2026-09-30', owner: 'CEO' },
  '3c': { current: 2, target: 3, priority: 'High', notes: 'Knowledge management is informal. Best practices from 65+ years not systematically documented. Institutional knowledge at risk with staff transitions.', timeline_start: '2026-04-15', timeline_end: '2026-12-31', owner: 'Programme Director', resources: 'KM consultant Rs.3L, Document management system Rs.1.5L, Staff time allocation 15hrs/month' },
  '3d': { current: 3, target: 4, priority: 'Low', notes: 'Admin procedures well-documented. Procurement policy exists. Some procedures need updating to reflect digital-first workflows.' },
  '3e': { current: 3, target: 4, priority: 'Medium', notes: 'Staff wellbeing recognised. Workloads heavy for field staff. POSH policy in place. Could strengthen mental health support and burnout prevention.' },
  '3f': { current: 2, target: 3, priority: 'High', notes: 'Risk management is ad-hoc. No formal risk register. Data security policies exist but not comprehensive. Need a risk management framework.', timeline_start: '2026-05-01', timeline_end: '2026-10-31', owner: 'Finance Director', resources: 'Risk management training Rs.50K, IT security audit Rs.1L' },
  '3g': { current: 3, target: 4, priority: 'Low', notes: 'Strong culture of inclusion and empathy. Internal comms could be more structured. Cross-team collaboration happens but is personality-dependent.' },

  // Leadership Development — founder-dependent
  '4a': { current: 3, target: 4, priority: 'Medium', notes: 'Leadership team empowers key members. Decision-making could be more distributed. Good vision-setting but implementation follow-through varies.' },
  '4b': { current: 2, target: 3, priority: 'Critical', notes: 'Heavy dependence on CEO. No formal succession plan. Second-tier leaders capable but not systematically developed. Significant institutional risk.', timeline_start: '2026-04-01', timeline_end: '2027-03-31', owner: 'Board Chair', resources: 'Leadership development programme Rs.5L, Executive coaching Rs.2L/year, Board retreat Rs.1L' },
  '4c': { current: 3, target: 4, priority: 'Medium', notes: 'Leadership team has good disability representation. Gender balance at senior level improving. Could track and report DEI metrics more formally.' },

  // Finance & Accounting — strong systems
  '5a': { current: 4, target: 4, priority: null, notes: 'Robust financial systems with Tally ERP. Regular audits by reputed firms. Controls well-established across all functions.' },
  '5b': { current: 3, target: 4, priority: 'Low', notes: 'Dedicated finance team of 4. Strong social sector knowledge. Could benefit from advanced training in grant accounting and FCRA compliance.' },
  '5c': { current: 3, target: 4, priority: 'Medium', notes: 'Annual org budget in place. Programme-wise budgets aligned to strategy. Multi-year projection needs improvement for 3-5 year planning.' },
  '5d': { current: 4, target: 4, priority: null, notes: 'Computer-based accounting with detailed programme-wise reporting. Monthly variance tracking. Clean audit history.' },
  '5e': { current: 2, target: 3, priority: 'Critical', notes: 'Heavily dependent on international donors (70%+). Limited domestic fundraising. Reserves cover only 3 months. Urgent need to diversify.', timeline_start: '2026-04-01', timeline_end: '2027-03-31', owner: 'CEO + Fundraising Lead', resources: 'Fundraising consultant Rs.3L, CSR outreach budget Rs.2L, Crowdfunding platform setup Rs.50K, Staff hire: Fundraising Manager Rs.8L/year' },

  // Human Resources — mixed
  '6a': { current: 3, target: 4, priority: 'Low', notes: 'Job descriptions exist and are periodically updated. Annual appraisals conducted. Some staff want more clarity on growth paths.' },
  '6b': { current: 3, target: 4, priority: 'Medium', notes: 'HR policies documented and mostly followed. POSH, Leave, Grievance policies in place. Need to benchmark against best practices.' },
  '6c': { current: 2, target: 3, priority: 'High', notes: 'Informal salary bands exist. Below market for some roles. Benefits defined but not always consistently applied across programmes.', timeline_start: '2026-06-01', timeline_end: '2026-12-31', owner: 'HR Head', resources: 'Salary benchmarking study Rs.1L, Benefits restructuring budget Rs.5L' },
  '6d': { current: 3, target: 4, priority: 'Medium', notes: 'Regular training opportunities through IDRR. External conference participation supported. Could be more systematic with individual development plans.' },
  '6e': { current: 3, target: 3, priority: null, notes: 'Turnover typical for sector. Field staff retention is a challenge. Senior staff turnover is low.' },
  '6f': { current: 3, target: 4, priority: 'Medium', notes: 'DEI tracked for disability and gender. Recruitment actively seeks PWD candidates. Could extend to caste, religion metrics and track across full HR lifecycle.' },

  // Fundraising — key weakness
  '7a': { current: 2, target: 3, priority: 'Critical', notes: 'Heavily reliant on 3-4 international funders. Few domestic donors. CSR engagement minimal. Need diversification strategy urgently.', timeline_start: '2026-04-01', timeline_end: '2027-03-31', owner: 'CEO', resources: 'Donor mapping exercise, CSR database subscription Rs.50K, Individual giving platform Rs.1L' },
  '7b': { current: 2, target: 3, priority: 'High', notes: 'Donor database exists in spreadsheets. Not systematically maintained. Need a proper CRM system.', timeline_start: '2026-05-01', timeline_end: '2026-09-30', owner: 'Fundraising Lead', resources: 'CRM system (Salesforce NPSP or Zoho) Rs.1L/year, Data migration support' },
  '7c': { current: 2, target: 3, priority: 'High', notes: 'No formal fundraising plan. CEO handles most funder relationships personally. Need dedicated fundraising capacity.', timeline_start: '2026-04-15', timeline_end: '2026-12-31', owner: 'CEO + Board', resources: 'Fundraising strategy consultant Rs.2L, Pitch deck development, Staff hire: Fundraising Manager' },

  // Communications, Marketing & Advocacy — strong advocacy, weak comms
  '8a': { current: 2, target: 3, priority: 'High', notes: 'No formal communications strategy. Website exists but outdated. Social media presence inconsistent. Annual report produced.', timeline_start: '2026-05-01', timeline_end: '2026-10-31', owner: 'Communications Officer', resources: 'Communications strategy consultant Rs.1.5L, Website redesign Rs.2L, Social media management tool Rs.30K/year' },
  '8b': { current: 3, target: 4, priority: 'Medium', notes: 'Community voices included in communications. Avoid stereotypical imagery. Could be more proactive in pushing DEI standards to partners.' },
  '8c': { current: 4, target: 4, priority: null, notes: 'Strong advocacy track record. Active in UNCRPD monitoring. Policy recommendations to state and central government. Own research conducted through IDRR.' },

  // MLE — developing
  '9a': { current: 3, target: 4, priority: 'Medium', notes: 'MLE plans exist for all major programmes with ToC. Could strengthen outcome measurement and move beyond output tracking.' },
  '9b': { current: 2, target: 3, priority: 'High', notes: 'Mix of paper and digital data collection. MIS exists for some programmes. Data not stored securely across all functions. Need unified system.', timeline_start: '2026-06-01', timeline_end: '2027-03-31', owner: 'MLE Head', resources: 'MIS system development Rs.5L, Data collection tablets Rs.2L, Staff training Rs.1L' },
  '9c': { current: 2, target: 3, priority: 'Medium', notes: 'Analysis happens for funder reports. Internal use of data for decision-making is limited. Need to build data culture.', timeline_start: '2026-07-01', timeline_end: '2027-03-31', owner: 'MLE Head' },
  '9d': { current: 2, target: 3, priority: 'Medium', notes: 'Interest in learning exists but not resourced. Evaluations conducted when required by funders. Findings not systematically incorporated.' },
  '9e': { current: 3, target: 4, priority: 'Medium', notes: 'Disability disaggregation done well. Gender disaggregation improving. Caste and economic status not consistently tracked across programmes.' },

  // Programme Management — strong
  '10a': { current: 3, target: 4, priority: 'Medium', notes: 'All programmes have ToC. Results frameworks exist. Could strengthen impact measurement and critical assumptions documentation.' },
  '10b': { current: 3, target: 4, priority: 'Low', notes: 'Programmes designed based on needs assessments. Regular reviews conducted. Could be more systematic in reassessment cycles.' },
  '10c': { current: 3, target: 4, priority: 'Low', notes: 'Successfully scaled several programmes. IDRR model being replicated. Could be more strategic about geographic expansion.' },
  '10d': { current: 3, target: 3, priority: null, notes: 'Good track record of programme innovation. Community Mental Health programme is relatively new. Innovation pipeline could be more structured.' },

  // Legal & Compliance — strong
  '11a': { current: 4, target: 4, priority: null, notes: 'Fully compliant with all legal requirements. FCRA, 80G, 12A all in place. Expert advisors on retainer.' },
  '11b': { current: 4, target: 4, priority: null, notes: 'Robust compliance systems. Dedicated staff with nonprofit expertise. Regular compliance reviews and timely filings.' },

  // IT Systems — weak
  '12a': { current: 2, target: 3, priority: 'High', notes: 'Website exists but outdated content. Not mobile-responsive. No interactive features. Needs complete overhaul.', timeline_start: '2026-05-01', timeline_end: '2026-08-31', owner: 'Communications Officer', resources: 'Website redesign agency Rs.3L, Hosting/domain Rs.15K/year, Content writer Rs.50K' },
  '12b': { current: 1, target: 3, priority: 'Critical', notes: 'No integrated database management system. Data in silos across programmes. Financial data in Tally, programme data in spreadsheets, HR data manual. Critical gap.', timeline_start: '2026-06-01', timeline_end: '2027-06-30', owner: 'IT Consultant + CEO', resources: 'Integrated MIS development Rs.8L, Cloud infrastructure Rs.1L/year, IT support staff Rs.5L/year, Staff training Rs.2L' },

  // Partnerships — strong
  '13a': { current: 3, target: 4, priority: 'Low', notes: 'Active in multiple disability networks. NDRN member. Partnerships with govt hospitals, schools. Could deepen private sector partnerships and take more leadership roles.' },
};

async function seed() {
  const client = await pool.connect();
  try {
    // Get APD assessment
    const aResult = await client.query("SELECT id FROM assessments WHERE user_id = 2 ORDER BY id DESC LIMIT 1");
    if (aResult.rows.length === 0) { console.error('No assessment found for Sahana'); return; }
    const assessmentId = aResult.rows[0].id;
    console.log('Assessment ID:', assessmentId);

    // Clear existing scores and milestones for this assessment
    await client.query('DELETE FROM milestones WHERE score_id IN (SELECT id FROM scores WHERE assessment_id = $1)', [assessmentId]);
    await client.query('DELETE FROM scores WHERE assessment_id = $1', [assessmentId]);
    console.log('Cleared existing data');

    // Insert scores
    for (const [subId, data] of Object.entries(SCORES)) {
      const result = await client.query(
        `INSERT INTO scores (assessment_id, sub_capability_id, current_level, target_level, priority, field_notes, resources, timeline_start, timeline_end, timeline_owner)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id`,
        [assessmentId, subId, data.current, data.target || null, data.priority || null,
         data.notes || null, data.resources || null,
         data.timeline_start || null, data.timeline_end || null, data.owner || null]
      );
      const scoreId = result.rows[0].id;

      // Add milestones for items with timelines
      if (data.timeline_start && data.priority) {
        const milestones = getMilestones(subId);
        for (let i = 0; i < milestones.length; i++) {
          await client.query(
            `INSERT INTO milestones (score_id, activity, owner, target_date, status, sort_order)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [scoreId, milestones[i].activity, milestones[i].owner, milestones[i].date, milestones[i].status, i]
          );
        }
      }
    }

    console.log(`Inserted ${Object.keys(SCORES).length} scores`);
    const mCount = await client.query('SELECT COUNT(*) FROM milestones m JOIN scores s ON m.score_id = s.id WHERE s.assessment_id = $1', [assessmentId]);
    console.log(`Inserted ${mCount.rows[0].count} milestones`);
    console.log('APD mock data seeded successfully');
  } finally {
    client.release();
    await pool.end();
  }
}

function getMilestones(subId) {
  const m = {
    '3b': [
      { activity: 'Map current change management processes and identify gaps', owner: 'HR Head', date: '2026-05-15', status: 'Pending' },
      { activity: 'Develop change management framework with staff input', owner: 'CEO', date: '2026-07-31', status: 'Pending' },
    ],
    '3c': [
      { activity: 'Audit existing knowledge assets and institutional memory', owner: 'Programme Director', date: '2026-06-30', status: 'Pending' },
      { activity: 'Set up document management system (SharePoint/Google)', owner: 'IT Consultant', date: '2026-08-31', status: 'Pending' },
      { activity: 'Conduct oral history interviews with senior staff', owner: 'Communications Officer', date: '2026-10-31', status: 'Pending' },
    ],
    '3f': [
      { activity: 'Develop organisational risk register', owner: 'Finance Director', date: '2026-06-30', status: 'Pending' },
      { activity: 'Conduct IT security audit', owner: 'IT Consultant', date: '2026-07-31', status: 'Pending' },
      { activity: 'Train staff on risk identification and reporting', owner: 'HR Head', date: '2026-09-30', status: 'Pending' },
    ],
    '4b': [
      { activity: 'Board to formally adopt succession planning policy', owner: 'Board Chair', date: '2026-06-30', status: 'Pending' },
      { activity: 'Identify and assess potential second-tier leaders', owner: 'CEO', date: '2026-08-31', status: 'Pending' },
      { activity: 'Begin executive coaching for 3 identified leaders', owner: 'External Coach', date: '2026-10-01', status: 'Pending' },
      { activity: 'Document key institutional processes and relationships', owner: 'CEO', date: '2027-01-31', status: 'Pending' },
    ],
    '5e': [
      { activity: 'Complete domestic funding landscape analysis', owner: 'Fundraising Lead', date: '2026-05-31', status: 'In Progress' },
      { activity: 'Develop CSR engagement strategy and target list', owner: 'CEO', date: '2026-07-31', status: 'Pending' },
      { activity: 'Launch individual giving programme (website + campaigns)', owner: 'Communications Officer', date: '2026-09-30', status: 'Pending' },
      { activity: 'Submit 5 CSR proposals to target companies', owner: 'Fundraising Lead', date: '2026-12-31', status: 'Pending' },
    ],
    '6c': [
      { activity: 'Commission salary benchmarking study', owner: 'HR Head', date: '2026-07-31', status: 'Pending' },
      { activity: 'Develop revised compensation framework', owner: 'HR Head + Finance Director', date: '2026-10-31', status: 'Pending' },
    ],
    '7a': [
      { activity: 'Map all current and potential donor relationships', owner: 'CEO', date: '2026-05-31', status: 'In Progress' },
      { activity: 'Develop 3-year funding diversification strategy', owner: 'CEO + Board', date: '2026-07-31', status: 'Pending' },
      { activity: 'Identify and approach 10 new domestic funders', owner: 'Fundraising Lead', date: '2026-12-31', status: 'Pending' },
    ],
    '7b': [
      { activity: 'Evaluate CRM options (Salesforce NPSP, Zoho)', owner: 'IT Consultant', date: '2026-06-30', status: 'Pending' },
      { activity: 'Migrate existing donor data to CRM', owner: 'Fundraising Lead', date: '2026-08-31', status: 'Pending' },
    ],
    '7c': [
      { activity: 'Hire dedicated Fundraising Manager', owner: 'HR Head', date: '2026-06-30', status: 'Pending' },
      { activity: 'Develop fundraising plan with targets and KPIs', owner: 'Fundraising Manager', date: '2026-09-30', status: 'Pending' },
    ],
    '8a': [
      { activity: 'Develop communications strategy with agency support', owner: 'Communications Officer', date: '2026-07-31', status: 'Pending' },
      { activity: 'Redesign website with mobile-first approach', owner: 'Web Agency', date: '2026-09-30', status: 'Pending' },
    ],
    '9b': [
      { activity: 'Document current data collection processes across programmes', owner: 'MLE Head', date: '2026-07-31', status: 'Pending' },
      { activity: 'Develop unified MIS requirements specification', owner: 'MLE Head + IT', date: '2026-09-30', status: 'Pending' },
      { activity: 'Procure and deploy digital data collection tools', owner: 'IT Consultant', date: '2027-01-31', status: 'Pending' },
    ],
    '9c': [
      { activity: 'Train programme teams on data analysis basics', owner: 'MLE Head', date: '2026-09-30', status: 'Pending' },
      { activity: 'Establish quarterly data review meetings', owner: 'CEO', date: '2026-10-31', status: 'Pending' },
    ],
    '9d': [
      { activity: 'Commission external evaluation of 2 flagship programmes', owner: 'MLE Head', date: '2026-12-31', status: 'Pending' },
    ],
    '12a': [
      { activity: 'Finalise website redesign brief and select agency', owner: 'Communications Officer', date: '2026-06-15', status: 'Pending' },
      { activity: 'Launch redesigned website', owner: 'Web Agency', date: '2026-08-31', status: 'Pending' },
    ],
    '12b': [
      { activity: 'Map all current data systems and integration needs', owner: 'IT Consultant', date: '2026-08-31', status: 'Pending' },
      { activity: 'Develop integrated MIS architecture', owner: 'IT Consultant', date: '2026-11-30', status: 'Pending' },
      { activity: 'Phase 1 deployment: HR + Finance integration', owner: 'IT Consultant', date: '2027-03-31', status: 'Pending' },
      { activity: 'Phase 2: Programme data integration', owner: 'IT Consultant', date: '2027-06-30', status: 'Pending' },
    ],
  };
  return m[subId] || [];
}

seed().catch(e => { console.error(e); process.exit(1); });
