const pool = require('./pool');
const bcrypt = require('bcrypt');

const CAPABILITIES = [
  {
    id: 1, name: "Strategic Clarity & Coherence", icon: "🎯", color: "#0ea5e9",
    subs: [
      { id: "1a", name: "Mission and Vision", dei: false, levels: {
        1: "Mission/vision statement not written; no widely shared set of values governs the work.",
        2: "Mission/vision statement written but not concrete or realisable; many within the organisation cannot articulate it.",
        3: "Clear expression of the organisation's mission and vision; many staff are at least familiar with and express commitment to them.",
        4: "Clear, specific and compelling expression of mission and vision; staff and board are fully committed to it."
      }},
      { id: "1b", name: "Strategic Planning", dei: false, levels: {
        1: "No written strategic plan. Programme planning rarely occurs and does not involve needs assessments. No strategy is devised or communicated.",
        2: "Strategic plan written but not referred to. Planning occurs but doesn't integrate organisational strategy. Strategy often devised only by top management.",
        3: "Strategic plan provides a general guide for programmatic work. Needs assessments conducted. Some team members involved in strategy design.",
        4: "Strategic plan focuses on desired outcomes and guides decision-making. Programmes regularly reviewed. Conversations with internal and external stakeholders guide planning."
      }},
      { id: "1c", name: "DEI in Strategy", dei: true, levels: {
        1: "Organisation has not identified a DEI lens in the work it does or in its leadership/staff. DEI is not part of vision, mission, or strategy documents.",
        2: "Organisation has identified some aspects of DEI. DEI is called out in vision and mission, but is not part of the strategy/budget.",
        3: "Organisation has actively included a DEI lens across its work but does not incorporate it across all activities. Some elements of strategy include DEI but not in theory of change or budget.",
        4: "Organisation has actively included a DEI lens across its work; incorporates it into activities, results framework, theory of change, and budget. Could be a role model for other organisations."
      }},
    ]
  },
  {
    id: 2, name: "Governance & Board Management", icon: "⚖️", color: "#6366f1",
    subs: [
      { id: "2a", name: "Board Composition & Characteristics", dei: false, levels: {
        1: "Limited board structure in place; has relatives and/or staff members on its board. Members do not have relevant experience.",
        2: "Board members drawn from a narrow spectrum of sectors. Includes some independent members. Only a few members (1-2) have relevant experience.",
        3: "Board members drawn from a broad spectrum of sectors. More than half are independent members. A handful have relevant experience.",
        4: "All board members are independent. All members have relevant experience and expertise."
      }},
      { id: "2b", name: "Board Engagement", dei: false, levels: {
        1: "Board meetings not held frequently, rarely attended, or not documented. Members unclear on roles. Members do not contribute resources or provide direction to leadership.",
        2: "Board meetings held frequently but attended by only a few members. Members somewhat clear on roles; seek limited guidance. Some members contribute resources.",
        3: "Board meetings held regularly, well-attended, and documented (not yet shared with stakeholders). Members provide regular guidance. Most members contribute or leverage networks.",
        4: "Board meetings held regularly, well-attended, documented, and reports made available to stakeholders. All members actively engage, provide resources, and support leadership."
      }},
      { id: "2c", name: "Diversified Board", dei: true, levels: {
        1: "Board does not have representation from historically excluded groups or from the community the organisation serves.",
        2: "Board has some representation from historically excluded groups, such as women, or from the communities served.",
        3: "Board has a somewhat balanced composition of members representing historically excluded groups or communities served.",
        4: "Board has at least half of its members representing historically excluded groups or from the communities the organisation serves."
      }},
    ]
  },
  {
    id: 3, name: "Organisation Management & Culture", icon: "🏛️", color: "#8b5cf6",
    subs: [
      { id: "3a", name: "Organisational Structure", dei: false, levels: {
        1: "No formal organisational structure or clear division of roles and responsibilities.",
        2: "Basic organisational structure in place with some divisions in roles and responsibilities.",
        3: "Well-designed structure in place for most work, but there is still some lack of clarity in responsibilities and roles.",
        4: "Well-designed organisational structure highly compatible with goals of the organisation, allowing for maximal effectiveness and clearly defined roles."
      }},
      { id: "3b", name: "Change Management", dei: false, levels: {
        1: "No process for responding to internal or external changes. No staff member is involved and they do not have the right systems and policies to manage change.",
        2: "Basic processes established for reviewing internal changes but not external. No consistent involvement of staff; significant delays in responding to change.",
        3: "Established processes for planning, reviewing, and responding to internal and external changes. Organisation consistently involves staff. Few delays encountered.",
        4: "Effective and consistent routines for planning, reviewing, and responding to all changes. Staff consistently involved. Ways to gauge staff comfort with how change is introduced."
      }},
      { id: "3c", name: "Knowledge Management", dei: false, levels: {
        1: "No process or systems exist to capture and disseminate internal knowledge or best practices.",
        2: "Basic systems established to capture and disseminate knowledge. Only a few people know the process. Process is not user-friendly and used only occasionally.",
        3: "All essential systems established. All staff aware of the process. Process is user-friendly but not comprehensive. New knowledge not transferred to ongoing programmes.",
        4: "All essential systems established for internal and external knowledge. Annual review process exists. Process is user-friendly and comprehensive. New knowledge is transferred to programmes and stakeholders."
      }},
      { id: "3d", name: "Administrative Procedures", dei: false, levels: {
        1: "No documented administrative procedures. No documented procurement plan outlined.",
        2: "Partially documented administrative procedures that explain key functions but are not consistently applied or known to staff.",
        3: "Well-documented administrative procedures mostly followed but gaps remain; systems periodically reviewed. Most or all policies documented and well understood by staff.",
        4: "Administrative procedures clearly documented, followed throughout the organisation, regularly reviewed and updated. Complete and appropriate policies known and understood by staff."
      }},
      { id: "3e", name: "Staff Well-being (Physical & Psychological Safety)", dei: false, levels: {
        1: "Staff's physical and emotional well-being is heavily affected by unsustainable workloads, stress, and/or trauma, and this is not recognised by the organisation. No structures to ensure employee safety.",
        2: "Staff's well-being is affected by unsustainable workloads; the organisation recognises this but does not adequately address it. Employee safety processes exist but few are aware.",
        3: "Staff's well-being is addressed by the organisation but could be more strongly promoted. Formal measures to ensure employee safety are documented but not always shared.",
        4: "Staff's well-being is a priority for the organisation and practices serve as a model. Employee safety is an organisational priority with regular protocol reviews and updates."
      }},
      { id: "3f", name: "Risk Management", dei: false, levels: {
        1: "Organisation does not have capacity or policies to identify and mitigate key risks (finance, data security, IT, key resources, reputation, employee protection).",
        2: "Organisation has some capacity or policies to identify and mitigate risks, but these are not known to all employees or followed consistently.",
        3: "Organisation has capacity and documented policies to identify and mitigate key risks. Policies are shared with all employees and consistently followed.",
        4: "Well-documented policies and capacity to identify and mitigate key risks. Consistently followed across the organisation. Resources and processes available to deal with risks when faced."
      }},
      { id: "3g", name: "Organisational Culture", dei: true, levels: {
        1: "No shared set of beliefs or practices. No internal communications systems. Climate does not promote employee commitment; people do not work well together.",
        2: "A set of beliefs or practices exists that some senior employees follow. Internal communications systems are weak. Huge variation in organisational commitment.",
        3: "Some shared beliefs and practices carried out within a few departments. Information generally flows well for some teams but breakdowns still occur. Collaboration is department-specific.",
        4: "A cohesive set of beliefs and practices that all employees are aware of and practise regularly. Effective and consistent internal communications. Strong employee commitment and collaborative effort organisation-wide."
      }},
    ]
  },
  {
    id: 4, name: "Leadership Development", icon: "🌟", color: "#f59e0b",
    subs: [
      { id: "4a", name: "Management Style", dei: false, levels: {
        1: "Leaders may not always show consistent behaviour across situations, impacting employee morale. Leaders get involved sporadically. Leaders often work independently and do not seek staff input. Disagreements are unwelcome.",
        2: "Leaders direct employees towards a focused area with unclear directions. Leaders aware of issues across teams. Leaders seek input on certain matters but do not communicate effectively. Disagreements often ignored.",
        3: "Leaders empower only a few key organisational members. Leaders balance involvement and provide specific direction. Leaders enable input from key players leading to more efficient decision-making. Sometimes accept disagreements.",
        4: "Leaders inspire vision and strategic thinking for action or change. Leaders foster innovation and engagement. Leaders inspire action throughout the team and build autonomous decision-making with an open door to redress disagreements."
      }},
      { id: "4b", name: "Succession Planning & Development", dei: false, levels: {
        1: "No second-tier leadership and little is delegated by the executive director/CEO. Organisation is completely dependent on the present leader and could not function without them.",
        2: "Little effective second-tier leadership and/or insufficient delegation of tasks by the ED/CEO. Organisation highly dependent on the present leader; only an informal process for succession exists.",
        3: "Second-tier leadership is mostly effective in management. Delegation by the ED/CEO occurs. If the leader left, the organisation would have challenges but would likely sustain itself.",
        4: "ED/CEO delegates appropriate work and strong, highly effective second-tier leadership is in place. Organisation proactively considers a succession plan, with a smooth transition to a new leader expected."
      }},
      { id: "4c", name: "Diversified Leadership", dei: true, levels: {
        1: "The organisation's leadership team has no representation across religion, gender, caste, etc. The leadership team does not take any effort to build equity or diversity.",
        2: "The leadership team has some representation across religion, gender, caste, etc. but does not actively track metrics. Leadership team only discusses building equity and diversity at an internal policies level.",
        3: "The leadership team has some representation across religion, gender, caste, etc.; actively tracks metrics. Leadership team actively works to promote equity and diversity internally.",
        4: "The leadership team has a strong representation across religion, gender, caste, etc.; actively tracks metrics. Leadership actively promotes equity and diversity across the organisation's work, systems, and policies — both internally and externally."
      }},
    ]
  },
  {
    id: 5, name: "Finance & Accounting", icon: "💰", color: "#10b981",
    subs: [
      { id: "5a", name: "Financial Systems & Controls", dei: false, levels: {
        1: "No documented financial systems or controls govern financial operations. No formal procedures for recordkeeping or financial reporting exist.",
        2: "Some formal systems and controls govern financial operations, but they are not fully adequate. Financial reports are insufficiently transparent to provide adequate information for stakeholders.",
        3: "Formal systems and controls govern financial operations, including recordkeeping and documentation. Financial reports are transparent, providing adequate information to stakeholders, but gaps remain.",
        4: "Robust and appropriate systems and controls govern all financial operations, including comprehensive recordkeeping and transparent procedures that are regularly updated. Financial reports are transparent and comprehensive."
      }},
      { id: "5b", name: "Staff Financial Skills", dei: false, levels: {
        1: "Organisation does not have dedicated or full-time staff to manage financials; work is usually outsourced. Staff has basic knowledge but lacks expertise needed for the social sector; no policies exist.",
        2: "Organisation has one to two dedicated - but not full-time - staff who manage financials as well as needed. Few staff members have the knowledge and training; where policies exist, they are not followed consistently.",
        3: "Organisation has dedicated and full-time staff to manage financials. Staff has the necessary knowledge and skills to manage the most necessary financial aspects; most have been trained on the organisation's financial systems.",
        4: "Organisation has dedicated and full-time staff who have expertise in dealing specifically with social sector organisations. Staff has the necessary knowledge and skills; fully trained on the organisation's financial systems and follows policies consistently."
      }},
      { id: "5c", name: "Budgeting", dei: false, levels: {
        1: "No annual organisational budget; only project budgets exist. No alignment of project budgets to the organisation's mission.",
        2: "Has an annual organisational budget, but it is a simple amalgamation of projects with no projection of future costs. No clear alignment between mission and budget priorities.",
        3: "Has an organisational annual budget that includes both institutional costs and programme costs; some projection for future plans. Some alignment between mission and budget priorities for programmes but not for institutional strengthening.",
        4: "Has an annual budget that is largely complete, sufficiently detailed, and strongly aligned with the strategic plan and has tentative budgets for the next 3-5 years. Strong alignment between mission and budget priorities, including for institutional strengthening."
      }},
      { id: "5d", name: "Accounting", dei: false, levels: {
        1: "No standard system for financial accounting; tracking is done using paper. Budgets are tracked mainly for funder reporting rather than financial analysis and planning.",
        2: "Some financial accounting and procedures are tracked by computer spreadsheets. Budgets are not tracked. Non-budgeted expenses are frequent. Over- and underspends are not investigated or remedied.",
        3: "Computer-based system for financial accounting. Income and expenditures tracked against budget quarterly; variances reviewed by senior management. Non-budgeted expenses are occasional and sometimes reviewed.",
        4: "Computer-based system able to produce detailed reports by programme to support reporting to funders. Income and expenditures tracked against budget monthly; variances reviewed and covered through existing reserves. Non-budgeted expenses are rare and investigated."
      }},
      { id: "5e", name: "Financial Sustainability", dei: false, levels: {
        1: "Raised funds insufficient for non-programme and programmatic needs. No reserves exist. Organisation's work is determined mostly by funder interest in specific projects.",
        2: "Raised funds almost cover needs, but there isn't much wiggle room. Limited reserves; revenue generation is undertaken only on a needs basis without a strategy. Organisation receives some core support but also takes on funder-driven projects.",
        3: "Raised funds sufficient to meet immediate needs with some budget flexibility. Sufficient reserves to handle unexpected shortfalls, but strategy needs improvement. Receives general operating and project support consistent with strategic plan but still struggles for sufficient funding.",
        4: "Raised funds meet needs and have some flexibility; sufficient cushion to allow for increased expansion each year. Ample reserves to adapt to unforeseen demands and an effective leverage strategy. Revenue generation activities totally cover admin costs. Receives sufficient funder support to realise all organisational priorities."
      }},
    ]
  },
  {
    id: 6, name: "Human Resources", icon: "👥", color: "#ec4899",
    subs: [
      { id: "6a", name: "Job Descriptions & Appraisals", dei: false, levels: {
        1: "Job descriptions are not documented and roles and responsibilities are not delineated. Performance appraisals do not occur.",
        2: "Job descriptions exist but are outdated and no longer accurate; staff expresses confusion as to their roles. Performance appraisals happen infrequently.",
        3: "Job descriptions are occasionally updated. Staff receive regular appraisals but wish for greater clarity on roles and responsibilities.",
        4: "Job descriptions are accurate and updated. Staff receive constructive feedback and regular appraisals and are clear on roles and responsibilities."
      }},
      { id: "6b", name: "HR Policies & Plans", dei: false, levels: {
        1: "No formal human resources policies exist. No human resources plan exists and there are no staff qualified to oversee it.",
        2: "Incomplete human resources policies that are outdated and not consistently applied. Simplified HR plan exists, but it is overseen by staff without formal training.",
        3: "HR policies exist but do not reflect best practices; policies are typically followed and most staff are familiar with relevant pieces. HR plan exists but needs updating; dedicated staff oversee the plan but could use additional training.",
        4: "Clear and frequently updated policies on vital HR issues reflect best practices. They are consistently applied and staff are familiar with relevant pieces. Well-developed and frequently revised HR plan reflects organisational mission; formally trained, qualified staff oversee the plan."
      }},
      { id: "6c", name: "Compensation & Benefits", dei: false, levels: {
        1: "There are no formal or informal salary bands by role.",
        2: "There are informal salary bands by role. Employee benefits are not defined and are on the low end for the field.",
        3: "There are formal, written salary bands by role and level; the organisation may periodically adjust pay scales for inflation. Employee benefits are defined and documented but are not known to most staff and/or inconsistently applied.",
        4: "Formal, written salary bands by role determined using a salary benchmarking process. The organisation regularly adjusts pay scales for inflation, making it a leader in the field. Employee benefits are clearly defined, documented, easily accessible, and consistently implemented for all staff."
      }},
      { id: "6d", name: "Staff Development", dei: false, levels: {
        1: "Opportunities for staff development do not exist.",
        2: "Opportunities for staff development are rare.",
        3: "Opportunities for staff development are offered with some frequency.",
        4: "Organisation provides regular opportunities for professional growth."
      }},
      { id: "6e", name: "Staff Turnover", dei: false, levels: {
        1: "Turnover is significantly greater than is typical for the sector, and the organisation is not addressing the problem.",
        2: "Turnover is somewhat higher than is typical for the sector, especially for high-performing staff. The organisation recognises the problem but does not have a plan to address it.",
        3: "Attrition rates are typical for the sector; the organisation does not have a plan for retention of high-performing staff.",
        4: "Rates are low for the sector and the organisation takes a proactive role in seeking to retain high-performing staff."
      }},
      { id: "6f", name: "DEI in HR", dei: true, levels: {
        1: "HR policies and systems do not include or track DEI across the people development cycle, including recruitment, onboarding, compensation, training, retention, culture building, growth and career progression, and exit.",
        2: "HR policies and systems actively track identified DEI metrics (such as gender, disabilities, caste or religion) within the organisation and on its board, but has limited tailored people development practices to improve these metrics or the DEI culture.",
        3: "HR policies and systems actively track DEI metrics and has select, tailored people development practices to improve these metrics and the DEI culture. For example, tailoring recruitment and training to hire and develop leadership and staff based on their identity.",
        4: "HR policies and systems actively track DEI metrics and has well-tailored people development practices to improve these metrics and the DEI culture, as well as having a diverse and representative board. Could serve as a role model for other organisations."
      }},
    ]
  },
  {
    id: 7, name: "Fundraising", icon: "🤝", color: "#f97316",
    subs: [
      { id: "7a", name: "Funding Diversification", dei: false, levels: {
        1: "One or two funders provide short-term grants with low possibility of becoming repeat funders. No attempt is made to discuss repeat donations.",
        2: "A few key funders provide yearly support. Only some become repeat funders, but no observable trend exists. Informal conversations about repeat donations undertaken; conversions are low to nil.",
        3: "A circulating pool of diverse, new funders and repeat funders who are able to provide some multi-year commitments. Discussions about repeat donations held regularly; conversions are not always reliable.",
        4: "Highly diverse set of funders can be confidently relied upon for multi-year commitments while also being able to attract special funders for creative projects. Discussions about repeat donations are initiated by both the organisation and funders; conversion rate is significant and reliable."
      }},
      { id: "7b", name: "Funder Management Systems", dei: false, levels: {
        1: "Funder management systems are rudimentary and lacking key information, or significant information is out of date.",
        2: "Funder management systems are mostly accurate, and sporadically updated.",
        3: "Funder management systems are accurate and often updated.",
        4: "Funder management systems are easily accessible, accurate, and frequently updated."
      }},
      { id: "7c", name: "Fundraising Capacity", dei: false, levels: {
        1: "No thorough fundraising plan or strategy exists. It is a reactive response to needs as they arise. Fundraising activities only undertaken by the founder/CEO.",
        2: "The need for a fundraising plan is recognised but currently only an informal strategy exists. Fundraising activities managed by an ad hoc team that supports the leadership staff.",
        3: "A solid fundraising plan details dedicated strategies, funder databases, and targeted pitch decks. Dedicated and trained fundraising staff; occasional board and leader involvement.",
        4: "Robust fundraising plan aligned with other operational plans is developed and implemented; clear markers showcase learnings from previous experiences. Fundraising best practices deployed. Board and leadership team involved strategically to cultivate and steward contacts."
      }},
    ]
  },
  {
    id: 8, name: "Communications, Marketing & Advocacy", icon: "📢", color: "#14b8a6",
    subs: [
      { id: "8a", name: "Communications Strategy", dei: false, levels: {
        1: "Rare engagement in external outreach and no strategy for doing so. Alignment with organisational goals not considered. Key target audiences have not been identified and messages are inconsistent.",
        2: "No formal communications strategy exists but the organisation does occasional general outreach when opportunities arise. Key target audiences have not been identified but there is some consistency in messages.",
        3: "Communications strategy exists but is not tailored to key target audiences; messages typically are not revised to adjust to changing contexts. Strategy maps to some organisational goals. Key target audiences identified but customised messages not always implemented.",
        4: "Organisation has a clearly outlined strategy with targeted and distinct messages to prioritised audiences. Messages are regularly revised in light of changing contexts. Strategy is aligned to organisational goals. Key target audiences receive customised information in timely and easily accessible formats."
      }},
      { id: "8b", name: "DEI in Communications & Marketing", dei: true, levels: {
        1: "Organisation does not include the voice of the community it works with in its communications and marketing strategy; does not reflect DEI in its communications or messaging.",
        2: "Organisation does include community voices in external communications but does not apply DEI considerations to its communications, such as avoiding stereotypes in visual or written content.",
        3: "Organisation does include community voices in its external communications, and does apply DEI considerations to its communications, such as avoiding stereotypes in visual or written content.",
        4: "Organisation actively and authentically represents the voices and experiences of the community it works with in its communications and marketing strategy. Identifies opportunities to improve its communications plan to align with its DEI goals. Also pushes its partners or other stakeholders to incorporate DEI considerations."
      }},
      { id: "8c", name: "Advocacy", dei: false, levels: {
        1: "Influencing policymakers or end beneficiaries is not part of the organisation's work. No clear policy recommendations are provided. Little awareness of existing research and its relevance for advocacy.",
        2: "Influencing policymakers or communities is part of organisation's work but is not done in a systematic way. Provides some recommendations that are not tailored to the target audience. Awareness of relevant research but does not incorporate into its work.",
        3: "Influencing policymakers or communities is part of the core strategy but is not guided by an advocacy strategy. Provides recommendations to the target audience but often not revised to incorporate the changing political landscape. Outside research is often employed.",
        4: "Influencing policymakers or communities is part of the core strategy and is guided by an advocacy strategy that is both proactive and reactive. Provides recommendations to the target audience that is adjusted to political interests and changing landscapes. Organisation also conducts its own research to contribute to the sector."
      }},
    ]
  },
  {
    id: 9, name: "Monitoring, Learning & Evaluation", icon: "📊", color: "#a78bfa",
    subs: [
      { id: "9a", name: "MLE Strategy", dei: false, levels: {
        1: "There are no MLE plans for various projects or frameworks for MLE within the organisation. There is no clear understanding of expected measurable results for activities.",
        2: "MLE plan exists only because of funder insistence. Plan covers only activities or outcomes requested by the funder. There is no process to involve staff or communities in drawing up MLE plans.",
        3: "MLE plans exist for all programmes and contain components such as a theory of change, inputs, outputs, and outcomes. MLE plans have considered the inputs of staff but not communities the organisation works with.",
        4: "An overall MLE framework for the organisation exists for all programmes, including components such as theory of change, inputs, outputs, outcomes, and benchmarks informed by both internal and external best practices. A regular and consistent process is in place to consider inputs from the staff, stakeholders, and communities."
      }},
      { id: "9b", name: "Data Collection & Infrastructure", dei: false, levels: {
        1: "No formal system for data collection exists; data is often collected using paper-based methods. Data from programmes are collected largely for funder reporting and not stored securely. Qualitative data is not considered.",
        2: "A rudimentary data collection system exists across multiple tools but not regularly updated. Data periodically collected to report to funders and not stored securely; data collection is seen as overly burdensome. Qualitative data are sporadically collected with no effort to use it.",
        3: "IT-enabled digital infrastructure and tools are in place to collect up-to-date data from all programmes and some non-programme functions. Data collection systems are in use and secure but could be improved. Qualitative data are available but don't always corroborate other data.",
        4: "IT-enabled digital infrastructure and tools are in use to collect disaggregated, timely data for both programme and non-programme functions aligned to the MLE plan. Data collection and analysis systems are secure and effectively integrated into the organisation's work. The organisation has a data protection policy and all staff have been trained."
      }},
      { id: "9c", name: "Data Analysis & Dissemination", dei: false, levels: {
        1: "No data are analysed. Reports are created largely for funders and are based on ad-hoc information. No dedicated staff available to analyse data.",
        2: "Some data are analysed and presented in funder reports. Reports are not transformed into knowledge for internal dissemination and decision-making. Staff do not have the requisite skills to conduct data analysis.",
        3: "Organisation has a system for regularly analysing and reporting for programmes and some non-programme functions. Reports are regularly shared with funders and efforts are made to share information for internal decision-making. Organisation has skilled and competent staff for data analysis.",
        4: "A comprehensive, integrated system (real-time analysis, dashboards, and reports) is used to provide reliable, timely information to measure the organisation's performance. Information is regularly shared with stakeholders. Data is used to review progress, inform programme design, and for strategic decision-making. Specialised staff capable of working with complex data are available."
      }},
      { id: "9d", name: "Influence of Evaluation on Organisation", dei: false, levels: {
        1: "There is no interest in reflection and learning, and no expectation that evidence will lead to refined strategy and improvements in practice.",
        2: "There is little interest in and very few resources for reflection and learning; there is little evidence used to refine strategy and practice.",
        3: "Whilst there is interest in reflection and learning, few resources are available to ensure they occur regularly; improvements in strategy and practice based on evidence occur, but inconsistently.",
        4: "A culture of reflection and learning exists and resources are available and used to ensure that learning from evidence and experience occurs. What is learned leads to improvements in strategy and practice, and these lessons are shared internally and externally."
      }},
      { id: "9e", name: "Collection & Presentation of DEI Data", dei: true, levels: {
        1: "Organisation does not collect or track any DEI metrics within its evaluations.",
        2: "Organisation tracks some DEI metrics, such as gender, within its evaluations.",
        3: "Organisation actively tracks and strives for disaggregated data around DEI metrics such as religion, caste, gender, income, but the data do not inform the programme strategy.",
        4: "Organisation actively tracks and strives for disaggregated data around DEI metrics such as religion, caste, gender, income, etc.; the data informs the programme strategy."
      }},
    ]
  },
  {
    id: 10, name: "Programme Management", icon: "📋", color: "#06b6d4",
    subs: [
      { id: "10a", name: "Theory of Change & Results Framework", dei: false, levels: {
        1: "Programmes don't have a ToC but the team is able to articulate what they believe is the linkage between activities and desired outcome. Does not have a results framework.",
        2: "All programmes have a ToC including outcomes and corresponding time frames, but few programme-specific ToCs tie back to the organisation's mission. Nor does the organisation have an overall ToC. Activities are independent of the results framework.",
        3: "All programmes have a ToC including outcomes and corresponding time frames. ToCs are used sporadically to inform programme implementation. The ToCs of all programmes reflect the organisation's mission and collectively inform how the organisation articulates its ToC. Activities are aligned with the results framework.",
        4: "The ToCs of all programmes include outcomes, impact, and corresponding time frames. ToCs are used consistently to inform programme implementation. All programmes clearly reflect the organisation's mission. The results framework includes underlying critical assumptions for the successful achievement of targeted outcomes."
      }},
      { id: "10b", name: "Programme Planning", dei: false, levels: {
        1: "Organisation rarely performs programme planning and does not involve opportunity or needs assessments.",
        2: "Organisation performs programme planning but does not involve formal opportunity or needs assessments.",
        3: "Opportunity or needs assessments are conducted and documented; programme strategies are occasionally revised based on informal assessments.",
        4: "Programmes are designed on the basis of documented opportunity or needs assessments; they are frequently reassessed to ensure that they are optimally effective."
      }},
      { id: "10c", name: "Programme Growth & Replication", dei: false, levels: {
        1: "No assessment of possibility of scaling existing programmes; limited ability to scale, replicate, or deepen depth of existing programmes.",
        2: "Limited assessment of possibility of scaling existing programmes and, even when judged appropriate, little or limited action taken. Some ability to scale, replicate, or deepen existing programmes.",
        3: "Occasional assessment of possibility of scaling existing programmes and when judged appropriate, action occasionally taken. Able to scale, replicate, or deepen existing programmes.",
        4: "Frequent assessment of possibility of scaling existing programmes and when judged appropriate, action always taken. Efficiently and effectively able to grow existing programmes to meet needs of potential service recipients in local areas or other geographies, or by deepening services."
      }},
      { id: "10d", name: "New Programme Development", dei: false, levels: {
        1: "No assessment of gaps in ability of the current programme to meet recipient needs; limited ability to create new programmes. New programmes created largely in response to funding availability.",
        2: "Limited assessment of gaps in ability of existing programmes to meet recipient needs, with little or limited action taken. Some ability to modify existing programmes and create new programmes.",
        3: "Occasional assessment of gaps in ability of existing programmes to meet recipient needs, with some adjustments made. Demonstrated ability to modify and fine-tune existing programmes and create new programmes.",
        4: "Continual assessment of gaps in ability of existing programmes to meet recipient needs and adjustments always made. Organisation efficiently and effectively creates new, innovative programmes. Continuous pipeline of new ideas."
      }},
    ]
  },
  {
    id: 11, name: "Legal & Compliance", icon: "📜", color: "#84cc16",
    subs: [
      { id: "11a", name: "Legal Obligations", dei: false, levels: {
        1: "The organisation is legally registered, but is not aware of the compliance and regulatory requirements that need to be fulfilled by law.",
        2: "The organisation is legally registered but struggles at times to fully comply with relevant laws as it does not have any staff or advisors with the requisite knowledge and expertise.",
        3: "The organisation is legally registered but struggles at times to fully comply with relevant laws even though it has staff or advisors with the requisite knowledge and expertise.",
        4: "The organisation is legally registered and complies with relevant laws through staff or advisors who have the requisite knowledge and expertise with the regulatory requirements."
      }},
      { id: "11b", name: "Compliance", dei: false, levels: {
        1: "Organisation does not have any set process and systems to support compliance of fiscal and regulatory requirements. Compliance is very rudimentary.",
        2: "Organisation has a basic template that it follows to comply with fiscal and regulatory requirements. The staff has very limited knowledge.",
        3: "Organisation has systems and processes in place to comply with requirements; it has staff who have general knowledge but not expertise in nonprofit sector needs.",
        4: "Organisation has systems and processes in place to comply with requirements; it has staff who have expertise in nonprofit sector needs."
      }},
    ]
  },
  {
    id: 12, name: "Information Technology Systems", icon: "💻", color: "#38bdf8",
    subs: [
      { id: "12a", name: "Website", dei: false, levels: {
        1: "Organisation has no website of its own.",
        2: "Organisation has a basic website containing general information, but little information on current developments. Site maintenance is a burden and performed only occasionally.",
        3: "Organisation has a comprehensive website containing basic information on the organisation as well as latest developments. Most information is organisation-specific, and it is regularly maintained.",
        4: "Organisation has a sophisticated, comprehensive, and interactive website, which is regularly maintained and kept up to date. Includes links to related organisations and useful resources on the topic addressed by the organisation."
      }},
      { id: "12b", name: "Database Management & Reporting Systems", dei: false, levels: {
        1: "There are no systems for tracking clients, staff, volunteers, programme outcomes, and financial information.",
        2: "Databases and management reporting systems exist only in a few areas; systems perform only basic features and are awkward to use or used only occasionally by staff.",
        3: "Database and management reporting systems exist in most areas for tracking clients, staff, volunteers, programme outcomes, and financial information; they are commonly used and help to increase information sharing and efficiency.",
        4: "Sophisticated, comprehensive database and management reporting systems exist for tracking clients, staff, volunteers, programme outcomes, and financial information; they are widely used and essential in increasing information sharing and efficiency."
      }},
    ]
  },
  {
    id: 13, name: "Partnerships & Alliances", icon: "🔗", color: "#fb923c",
    subs: [
      { id: "13a", name: "Partnership Strategy", dei: false, levels: {
        1: "Does not belong to any formal or informal network of similar or complementary organisations, and does not work in partnerships with any other nonprofit organisation, government entity, or private company.",
        2: "Belongs to at least one formal or informal network of organisations. Not an active participant in and/or contributor to the network's activities. Has at least one informal partnership with another organisation; level of integration is low.",
        3: "Belongs to at least one formal network of organisations. An active participant in and/or contributor to the network on a consistent basis (eg, learns from other organisations, shares best practices, pursues joint advocacy). Has at least one formal partnership with another organisation, however, none involve joint programme delivery.",
        4: "Holds a leadership position in at least one formal network of organisations. Leads the network's efforts and represents the collective externally. Has at least one formal partnership with another organisation that involves joint programme delivery. Level of integration is high."
      }},
    ]
  },
];

async function seed() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Seed admin user
    const adminHash = await bcrypt.hash('APD@2025', 10);
    await client.query(
      `INSERT INTO users (email, password_hash, name, org_name, is_admin)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (email) DO NOTHING`,
      ['admin@apd.org', adminHash, 'APD Admin', 'Association of People with Disability', true]
    );

    // Seed capabilities
    for (const cap of CAPABILITIES) {
      await client.query(
        `INSERT INTO capabilities (id, name, icon, color, sort_order)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (id) DO UPDATE SET name=$2, icon=$3, color=$4, sort_order=$5`,
        [cap.id, cap.name, cap.icon, cap.color, cap.id]
      );

      for (let si = 0; si < cap.subs.length; si++) {
        const sub = cap.subs[si];
        await client.query(
          `INSERT INTO sub_capabilities (id, capability_id, name, is_dei, sort_order)
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT (id) DO UPDATE SET capability_id=$2, name=$3, is_dei=$4, sort_order=$5`,
          [sub.id, cap.id, sub.name, sub.dei, si]
        );

        for (const [level, desc] of Object.entries(sub.levels)) {
          await client.query(
            `INSERT INTO level_descriptions (sub_capability_id, level, description)
             VALUES ($1, $2, $3)
             ON CONFLICT (sub_capability_id, level) DO UPDATE SET description=$3`,
            [sub.id, parseInt(level), desc]
          );
        }
      }
    }

    await client.query('COMMIT');
    console.log('Seed complete: admin user + 13 capabilities + all sub-capabilities + level descriptions.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Seed failed:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
