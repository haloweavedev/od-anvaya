import { useState, useCallback, useRef, useEffect } from "react";

/* ─────────────────────────────────────────────────────────────
   FULL CAPABILITY DATA — all level descriptions from Bridgespan
───────────────────────────────────────────────────────────── */
const CAPABILITIES = [
  {
    id: 1, name: "Strategic Clarity & Coherence",
    icon: "🎯", color: "#0ea5e9",
    subcapabilities: [
      {
        id: "1a", name: "Mission and Vision", dei: false,
        levels: {
          1: "Mission/vision statement not written; no widely shared set of values governs the work.",
          2: "Mission/vision statement written but not concrete or realisable; many within the organisation cannot articulate it.",
          3: "Clear expression of the organisation's mission and vision; many staff are at least familiar with and express commitment to them.",
          4: "Clear, specific and compelling expression of mission and vision; staff and board are fully committed to it."
        }
      },
      {
        id: "1b", name: "Strategic Planning", dei: false,
        levels: {
          1: "No written strategic plan. Programme planning rarely occurs and does not involve needs assessments. No strategy is devised or communicated.",
          2: "Strategic plan written but not referred to. Planning occurs but doesn't integrate organisational strategy. Strategy often devised only by top management.",
          3: "Strategic plan provides a general guide for programmatic work. Needs assessments conducted. Some team members involved in strategy design.",
          4: "Strategic plan focuses on desired outcomes and guides decision-making. Programmes regularly reviewed. Conversations with internal and external stakeholders guide planning."
        }
      },
      {
        id: "1c", name: "DEI in Strategy", dei: true,
        levels: {
          1: "Organisation has not identified a DEI lens in the work it does or in its leadership/staff. DEI is not part of vision, mission, or strategy documents.",
          2: "Organisation has identified some aspects of DEI. DEI is called out in vision and mission, but is not part of the strategy/budget.",
          3: "Organisation has actively included a DEI lens across its work but does not incorporate it across all activities. Some elements of strategy include DEI but not in theory of change or budget.",
          4: "Organisation has actively included a DEI lens across its work; incorporates it into activities, results framework, theory of change, and budget. Could be a role model for other organisations."
        }
      },
    ]
  },
  {
    id: 2, name: "Governance & Board Management",
    icon: "⚖️", color: "#6366f1",
    subcapabilities: [
      {
        id: "2a", name: "Board Composition & Characteristics", dei: false,
        levels: {
          1: "Limited board structure in place; has relatives and/or staff members on its board. Members do not have relevant experience.",
          2: "Board members drawn from a narrow spectrum of sectors. Includes some independent members. Only a few members (1–2) have relevant experience.",
          3: "Board members drawn from a broad spectrum of sectors. More than half are independent members. A handful have relevant experience.",
          4: "All board members are independent. All members have relevant experience and expertise."
        }
      },
      {
        id: "2b", name: "Board Engagement", dei: false,
        levels: {
          1: "Board meetings not held frequently, rarely attended, or not documented. Members unclear on roles. Members do not contribute resources or provide direction to leadership.",
          2: "Board meetings held frequently but attended by only a few members. Members somewhat clear on roles; seek limited guidance. Some members contribute resources.",
          3: "Board meetings held regularly, well-attended, and documented (not yet shared with stakeholders). Members provide regular guidance. Most members contribute or leverage networks.",
          4: "Board meetings held regularly, well-attended, documented, and reports made available to stakeholders. All members actively engage, provide resources, and support leadership."
        }
      },
      {
        id: "2c", name: "Diversified Board", dei: true,
        levels: {
          1: "Board does not have representation from historically excluded groups or from the community the organisation serves.",
          2: "Board has some representation from historically excluded groups, such as women, or from the communities served.",
          3: "Board has a somewhat balanced composition of members representing historically excluded groups or communities served.",
          4: "Board has at least half of its members representing historically excluded groups or from the communities the organisation serves."
        }
      },
    ]
  },
  {
    id: 3, name: "Organisation Management & Culture",
    icon: "🏛️", color: "#8b5cf6",
    subcapabilities: [
      {
        id: "3a", name: "Organisational Structure", dei: false,
        levels: {
          1: "No formal organisational structure or clear division of roles and responsibilities.",
          2: "Basic organisational structure in place with some divisions in roles and responsibilities.",
          3: "Well-designed structure in place for most work, but there is still some lack of clarity in responsibilities and roles.",
          4: "Well-designed organisational structure highly compatible with goals of the organisation, allowing for maximal effectiveness and clearly defined roles."
        }
      },
      {
        id: "3b", name: "Change Management", dei: false,
        levels: {
          1: "No process for responding to internal or external changes. No staff member is involved and they do not have the right systems and policies to manage change.",
          2: "Basic processes established for reviewing internal changes but not external. No consistent involvement of staff; significant delays in responding to change.",
          3: "Established processes for planning, reviewing, and responding to internal and external changes. Organisation consistently involves staff. Few delays encountered.",
          4: "Effective and consistent routines for planning, reviewing, and responding to all changes. Staff consistently involved. Ways to gauge staff comfort with how change is introduced."
        }
      },
      {
        id: "3c", name: "Knowledge Management", dei: false,
        levels: {
          1: "No process or systems exist to capture and disseminate internal knowledge or best practices.",
          2: "Basic systems established to capture and disseminate knowledge. Only a few people know the process. Process is not user-friendly and used only occasionally.",
          3: "All essential systems established. All staff aware of the process. Process is user-friendly but not comprehensive. New knowledge not transferred to ongoing programmes.",
          4: "All essential systems established for internal and external knowledge. Annual review process exists. Process is user-friendly and comprehensive. New knowledge is transferred to programmes and stakeholders."
        }
      },
      {
        id: "3d", name: "Administrative Procedures", dei: false,
        levels: {
          1: "No documented administrative procedures. No documented procurement plan outlined.",
          2: "Partially documented administrative procedures that explain key functions but are not consistently applied or known to staff.",
          3: "Well-documented administrative procedures mostly followed but gaps remain; systems periodically reviewed. Most or all policies documented and well understood by staff.",
          4: "Administrative procedures clearly documented, followed throughout the organisation, regularly reviewed and updated. Complete and appropriate policies known and understood by staff."
        }
      },
      {
        id: "3e", name: "Staff Well-being (Physical & Psychological Safety)", dei: false,
        levels: {
          1: "Staff's physical and emotional well-being is heavily affected by unsustainable workloads, stress, and/or trauma, and this is not recognised by the organisation. No structures to ensure employee safety.",
          2: "Staff's well-being is affected by unsustainable workloads; the organisation recognises this but does not adequately address it. Employee safety processes exist but few are aware.",
          3: "Staff's well-being is addressed by the organisation but could be more strongly promoted. Formal measures to ensure employee safety are documented but not always shared.",
          4: "Staff's well-being is a priority for the organisation and practices serve as a model. Employee safety is an organisational priority with regular protocol reviews and updates."
        }
      },
      {
        id: "3f", name: "Risk Management", dei: false,
        levels: {
          1: "Organisation does not have capacity or policies to identify and mitigate key risks (finance, data security, IT, key resources, reputation, employee protection).",
          2: "Organisation has some capacity or policies to identify and mitigate risks, but these are not known to all employees or followed consistently.",
          3: "Organisation has capacity and documented policies to identify and mitigate key risks. Policies are shared with all employees and consistently followed.",
          4: "Well-documented policies and capacity to identify and mitigate key risks. Consistently followed across the organisation. Resources and processes available to deal with risks when faced."
        }
      },
      {
        id: "3g", name: "Organisational Culture", dei: true,
        levels: {
          1: "No shared set of beliefs or practices. No internal communications systems. Climate does not promote employee commitment; people do not work well together.",
          2: "A set of beliefs or practices exists that some senior employees follow. Internal communications systems are weak. Huge variation in organisational commitment.",
          3: "Some shared beliefs and practices carried out within a few departments. Information generally flows well for some teams but breakdowns still occur. Collaboration is department-specific.",
          4: "A cohesive set of beliefs and practices that all employees are aware of and practise regularly. Effective and consistent internal communications. Strong employee commitment and collaborative effort organisation-wide."
        }
      },
    ]
  },
  {
    id: 4, name: "Leadership Development",
    icon: "🌟", color: "#f59e0b",
    subcapabilities: [
      {
        id: "4a", name: "Management Style", dei: false,
        levels: {
          1: "Leaders may not always show consistent behaviour across situations, impacting employee morale. Leaders get involved sporadically. Leaders often work independently and do not seek staff input. Disagreements are unwelcome.",
          2: "Leaders direct employees towards a focused area with unclear directions. Leaders aware of issues across teams. Leaders seek input on certain matters but do not communicate effectively. Disagreements often ignored.",
          3: "Leaders empower only a few key organisational members. Leaders balance involvement and provide specific direction. Leaders enable input from key players leading to more efficient decision-making. Sometimes accept disagreements.",
          4: "Leaders inspire vision and strategic thinking for action or change. Leaders foster innovation and engagement. Leaders inspire action throughout the team and build autonomous decision-making with an open door to redress disagreements."
        }
      },
      {
        id: "4b", name: "Succession Planning & Development", dei: false,
        levels: {
          1: "No second-tier leadership and little is delegated by the executive director/CEO. Organisation is completely dependent on the present leader and could not function without them.",
          2: "Little effective second-tier leadership and/or insufficient delegation of tasks by the ED/CEO. Organisation highly dependent on the present leader; only an informal process for succession exists.",
          3: "Second-tier leadership is mostly effective in management. Delegation by the ED/CEO occurs. If the leader left, the organisation would have challenges but would likely sustain itself.",
          4: "ED/CEO delegates appropriate work and strong, highly effective second-tier leadership is in place. Organisation proactively considers a succession plan, with a smooth transition to a new leader expected."
        }
      },
      {
        id: "4c", name: "Diversified Leadership", dei: true,
        levels: {
          1: "The organisation's leadership team has no representation across religion, gender, caste, etc. The leadership team does not take any effort to build equity or diversity.",
          2: "The leadership team has some representation across religion, gender, caste, etc. but does not actively track metrics. Leadership team only discusses building equity and diversity at an internal policies level.",
          3: "The leadership team has some representation across religion, gender, caste, etc.; actively tracks metrics. Leadership team actively works to promote equity and diversity internally.",
          4: "The leadership team has a strong representation across religion, gender, caste, etc.; actively tracks metrics. Leadership actively promotes equity and diversity across the organisation's work, systems, and policies — both internally and externally."
        }
      },
    ]
  },
  {
    id: 5, name: "Finance & Accounting",
    icon: "💰", color: "#10b981",
    subcapabilities: [
      {
        id: "5a", name: "Financial Systems & Controls", dei: false,
        levels: {
          1: "No documented financial systems or controls govern financial operations. No formal procedures for recordkeeping or financial reporting exist.",
          2: "Some formal systems and controls govern financial operations, but they are not fully adequate. Financial reports are insufficiently transparent to provide adequate information for stakeholders.",
          3: "Formal systems and controls govern financial operations, including recordkeeping and documentation. Financial reports are transparent, providing adequate information to stakeholders, but gaps remain.",
          4: "Robust and appropriate systems and controls govern all financial operations, including comprehensive recordkeeping and transparent procedures that are regularly updated. Financial reports are transparent and comprehensive."
        }
      },
      {
        id: "5b", name: "Staff Financial Skills", dei: false,
        levels: {
          1: "Organisation does not have dedicated or full-time staff to manage financials; work is usually outsourced. Staff has basic knowledge but lacks expertise needed for the social sector; no policies exist.",
          2: "Organisation has one to two dedicated – but not full-time – staff who manage financials as well as needed. Few staff members have the knowledge and training; where policies exist, they are not followed consistently.",
          3: "Organisation has dedicated and full-time staff to manage financials. Staff has the necessary knowledge and skills to manage the most necessary financial aspects; most have been trained on the organisation's financial systems.",
          4: "Organisation has dedicated and full-time staff who have expertise in dealing specifically with social sector organisations. Staff has the necessary knowledge and skills; fully trained on the organisation's financial systems and follows policies consistently."
        }
      },
      {
        id: "5c", name: "Budgeting", dei: false,
        levels: {
          1: "No annual organisational budget; only project budgets exist. No alignment of project budgets to the organisation's mission.",
          2: "Has an annual organisational budget, but it is a simple amalgamation of projects with no projection of future costs. No clear alignment between mission and budget priorities.",
          3: "Has an organisational annual budget that includes both institutional costs and programme costs; some projection for future plans. Some alignment between mission and budget priorities for programmes but not for institutional strengthening.",
          4: "Has an annual budget that is largely complete, sufficiently detailed, and strongly aligned with the strategic plan and has tentative budgets for the next 3–5 years. Strong alignment between mission and budget priorities, including for institutional strengthening."
        }
      },
      {
        id: "5d", name: "Accounting", dei: false,
        levels: {
          1: "No standard system for financial accounting; tracking is done using paper. Budgets are tracked mainly for funder reporting rather than financial analysis and planning.",
          2: "Some financial accounting and procedures are tracked by computer spreadsheets. Budgets are not tracked. Non-budgeted expenses are frequent. Over- and underspends are not investigated or remedied.",
          3: "Computer-based system for financial accounting. Income and expenditures tracked against budget quarterly; variances reviewed by senior management. Non-budgeted expenses are occasional and sometimes reviewed.",
          4: "Computer-based system able to produce detailed reports by programme to support reporting to funders. Income and expenditures tracked against budget monthly; variances reviewed and covered through existing reserves. Non-budgeted expenses are rare and investigated."
        }
      },
      {
        id: "5e", name: "Financial Sustainability", dei: false,
        levels: {
          1: "Raised funds insufficient for non-programme and programmatic needs. No reserves exist. Organisation's work is determined mostly by funder interest in specific projects.",
          2: "Raised funds almost cover needs, but there isn't much wiggle room. Limited reserves; revenue generation is undertaken only on a needs basis without a strategy. Organisation receives some core support but also takes on funder-driven projects.",
          3: "Raised funds sufficient to meet immediate needs with some budget flexibility. Sufficient reserves to handle unexpected shortfalls, but strategy needs improvement. Receives general operating and project support consistent with strategic plan but still struggles for sufficient funding.",
          4: "Raised funds meet needs and have some flexibility; sufficient cushion to allow for increased expansion each year. Ample reserves to adapt to unforeseen demands and an effective leverage strategy. Revenue generation activities totally cover admin costs. Receives sufficient funder support to realise all organisational priorities."
        }
      },
    ]
  },
  {
    id: 6, name: "Human Resources",
    icon: "👥", color: "#ec4899",
    subcapabilities: [
      {
        id: "6a", name: "Job Descriptions & Appraisals", dei: false,
        levels: {
          1: "Job descriptions are not documented and roles and responsibilities are not delineated. Performance appraisals do not occur.",
          2: "Job descriptions exist but are outdated and no longer accurate; staff expresses confusion as to their roles. Performance appraisals happen infrequently.",
          3: "Job descriptions are occasionally updated. Staff receive regular appraisals but wish for greater clarity on roles and responsibilities.",
          4: "Job descriptions are accurate and updated. Staff receive constructive feedback and regular appraisals and are clear on roles and responsibilities."
        }
      },
      {
        id: "6b", name: "HR Policies & Plans", dei: false,
        levels: {
          1: "No formal human resources policies exist. No human resources plan exists and there are no staff qualified to oversee it.",
          2: "Incomplete human resources policies that are outdated and not consistently applied. Simplified HR plan exists, but it is overseen by staff without formal training.",
          3: "HR policies exist but do not reflect best practices; policies are typically followed and most staff are familiar with relevant pieces. HR plan exists but needs updating; dedicated staff oversee the plan but could use additional training.",
          4: "Clear and frequently updated policies on vital HR issues reflect best practices. They are consistently applied and staff are familiar with relevant pieces. Well-developed and frequently revised HR plan reflects organisational mission; formally trained, qualified staff oversee the plan."
        }
      },
      {
        id: "6c", name: "Compensation & Benefits", dei: false,
        levels: {
          1: "There are no formal or informal salary bands by role.",
          2: "There are informal salary bands by role. Employee benefits are not defined and are on the low end for the field.",
          3: "There are formal, written salary bands by role and level; the organisation may periodically adjust pay scales for inflation. Employee benefits are defined and documented but are not known to most staff and/or inconsistently applied.",
          4: "Formal, written salary bands by role determined using a salary benchmarking process. The organisation regularly adjusts pay scales for inflation, making it a leader in the field. Employee benefits are clearly defined, documented, easily accessible, and consistently implemented for all staff."
        }
      },
      {
        id: "6d", name: "Staff Development", dei: false,
        levels: {
          1: "Opportunities for staff development do not exist.",
          2: "Opportunities for staff development are rare.",
          3: "Opportunities for staff development are offered with some frequency.",
          4: "Organisation provides regular opportunities for professional growth."
        }
      },
      {
        id: "6e", name: "Staff Turnover", dei: false,
        levels: {
          1: "Turnover is significantly greater than is typical for the sector, and the organisation is not addressing the problem.",
          2: "Turnover is somewhat higher than is typical for the sector, especially for high-performing staff. The organisation recognises the problem but does not have a plan to address it.",
          3: "Attrition rates are typical for the sector; the organisation does not have a plan for retention of high-performing staff.",
          4: "Rates are low for the sector and the organisation takes a proactive role in seeking to retain high-performing staff."
        }
      },
      {
        id: "6f", name: "DEI in HR", dei: true,
        levels: {
          1: "HR policies and systems do not include or track DEI across the people development cycle, including recruitment, onboarding, compensation, training, retention, culture building, growth and career progression, and exit.",
          2: "HR policies and systems actively track identified DEI metrics (such as gender, disabilities, caste or religion) within the organisation and on its board, but has limited tailored people development practices to improve these metrics or the DEI culture.",
          3: "HR policies and systems actively track DEI metrics and has select, tailored people development practices to improve these metrics and the DEI culture. For example, tailoring recruitment and training to hire and develop leadership and staff based on their identity.",
          4: "HR policies and systems actively track DEI metrics and has well-tailored people development practices to improve these metrics and the DEI culture, as well as having a diverse and representative board. Could serve as a role model for other organisations."
        }
      },
    ]
  },
  {
    id: 7, name: "Fundraising",
    icon: "🤝", color: "#f97316",
    subcapabilities: [
      {
        id: "7a", name: "Funding Diversification", dei: false,
        levels: {
          1: "One or two funders provide short-term grants with low possibility of becoming repeat funders. No attempt is made to discuss repeat donations.",
          2: "A few key funders provide yearly support. Only some become repeat funders, but no observable trend exists. Informal conversations about repeat donations undertaken; conversions are low to nil.",
          3: "A circulating pool of diverse, new funders and repeat funders who are able to provide some multi-year commitments. Discussions about repeat donations held regularly; conversions are not always reliable.",
          4: "Highly diverse set of funders can be confidently relied upon for multi-year commitments while also being able to attract special funders for creative projects. Discussions about repeat donations are initiated by both the organisation and funders; conversion rate is significant and reliable."
        }
      },
      {
        id: "7b", name: "Funder Management Systems", dei: false,
        levels: {
          1: "Funder management systems are rudimentary and lacking key information, or significant information is out of date.",
          2: "Funder management systems are mostly accurate, and sporadically updated.",
          3: "Funder management systems are accurate and often updated.",
          4: "Funder management systems are easily accessible, accurate, and frequently updated."
        }
      },
      {
        id: "7c", name: "Fundraising Capacity", dei: false,
        levels: {
          1: "No thorough fundraising plan or strategy exists. It is a reactive response to needs as they arise. Fundraising activities only undertaken by the founder/CEO.",
          2: "The need for a fundraising plan is recognised but currently only an informal strategy exists. Fundraising activities managed by an ad hoc team that supports the leadership staff.",
          3: "A solid fundraising plan details dedicated strategies, funder databases, and targeted pitch decks. Dedicated and trained fundraising staff; occasional board and leader involvement.",
          4: "Robust fundraising plan aligned with other operational plans is developed and implemented; clear markers showcase learnings from previous experiences. Fundraising best practices deployed. Board and leadership team involved strategically to cultivate and steward contacts."
        }
      },
    ]
  },
  {
    id: 8, name: "Communications, Marketing & Advocacy",
    icon: "📢", color: "#14b8a6",
    subcapabilities: [
      {
        id: "8a", name: "Communications Strategy", dei: false,
        levels: {
          1: "Rare engagement in external outreach and no strategy for doing so. Alignment with organisational goals not considered. Key target audiences have not been identified and messages are inconsistent.",
          2: "No formal communications strategy exists but the organisation does occasional general outreach when opportunities arise. Key target audiences have not been identified but there is some consistency in messages.",
          3: "Communications strategy exists but is not tailored to key target audiences; messages typically are not revised to adjust to changing contexts. Strategy maps to some organisational goals. Key target audiences identified but customised messages not always implemented.",
          4: "Organisation has a clearly outlined strategy with targeted and distinct messages to prioritised audiences. Messages are regularly revised in light of changing contexts. Strategy is aligned to organisational goals. Key target audiences receive customised information in timely and easily accessible formats."
        }
      },
      {
        id: "8b", name: "DEI in Communications & Marketing", dei: true,
        levels: {
          1: "Organisation does not include the voice of the community it works with in its communications and marketing strategy; does not reflect DEI in its communications or messaging.",
          2: "Organisation does include community voices in external communications but does not apply DEI considerations to its communications, such as avoiding stereotypes in visual or written content.",
          3: "Organisation does include community voices in its external communications, and does apply DEI considerations to its communications, such as avoiding stereotypes in visual or written content.",
          4: "Organisation actively and authentically represents the voices and experiences of the community it works with in its communications and marketing strategy. Identifies opportunities to improve its communications plan to align with its DEI goals. Also pushes its partners or other stakeholders to incorporate DEI considerations."
        }
      },
      {
        id: "8c", name: "Advocacy", dei: false,
        levels: {
          1: "Influencing policymakers or end beneficiaries is not part of the organisation's work. No clear policy recommendations are provided. Little awareness of existing research and its relevance for advocacy.",
          2: "Influencing policymakers or communities is part of organisation's work but is not done in a systematic way. Provides some recommendations that are not tailored to the target audience. Awareness of relevant research but does not incorporate into its work.",
          3: "Influencing policymakers or communities is part of the core strategy but is not guided by an advocacy strategy. Provides recommendations to the target audience but often not revised to incorporate the changing political landscape. Outside research is often employed.",
          4: "Influencing policymakers or communities is part of the core strategy and is guided by an advocacy strategy that is both proactive and reactive. Provides recommendations to the target audience that is adjusted to political interests and changing landscapes. Organisation also conducts its own research to contribute to the sector."
        }
      },
    ]
  },
  {
    id: 9, name: "Monitoring, Learning & Evaluation",
    icon: "📊", color: "#a78bfa",
    subcapabilities: [
      {
        id: "9a", name: "MLE Strategy", dei: false,
        levels: {
          1: "There are no MLE plans for various projects or frameworks for MLE within the organisation. There is no clear understanding of expected measurable results for activities.",
          2: "MLE plan exists only because of funder insistence. Plan covers only activities or outcomes requested by the funder. There is no process to involve staff or communities in drawing up MLE plans.",
          3: "MLE plans exist for all programmes and contain components such as a theory of change, inputs, outputs, and outcomes. MLE plans have considered the inputs of staff but not communities the organisation works with.",
          4: "An overall MLE framework for the organisation exists for all programmes, including components such as theory of change, inputs, outputs, outcomes, and benchmarks informed by both internal and external best practices. A regular and consistent process is in place to consider inputs from the staff, stakeholders, and communities."
        }
      },
      {
        id: "9b", name: "Data Collection & Infrastructure", dei: false,
        levels: {
          1: "No formal system for data collection exists; data is often collected using paper-based methods. Data from programmes are collected largely for funder reporting and not stored securely. Qualitative data is not considered.",
          2: "A rudimentary data collection system exists across multiple tools but not regularly updated. Data periodically collected to report to funders and not stored securely; data collection is seen as overly burdensome. Qualitative data are sporadically collected with no effort to use it.",
          3: "IT-enabled digital infrastructure and tools are in place to collect up-to-date data from all programmes and some non-programme functions. Data collection systems are in use and secure but could be improved. Qualitative data are available but don't always corroborate other data.",
          4: "IT-enabled digital infrastructure and tools are in use to collect disaggregated, timely data for both programme and non-programme functions aligned to the MLE plan. Data collection and analysis systems are secure and effectively integrated into the organisation's work. The organisation has a data protection policy and all staff have been trained."
        }
      },
      {
        id: "9c", name: "Data Analysis & Dissemination", dei: false,
        levels: {
          1: "No data are analysed. Reports are created largely for funders and are based on ad-hoc information. No dedicated staff available to analyse data.",
          2: "Some data are analysed and presented in funder reports. Reports are not transformed into knowledge for internal dissemination and decision-making. Staff do not have the requisite skills to conduct data analysis.",
          3: "Organisation has a system for regularly analysing and reporting for programmes and some non-programme functions. Reports are regularly shared with funders and efforts are made to share information for internal decision-making. Organisation has skilled and competent staff for data analysis.",
          4: "A comprehensive, integrated system (real-time analysis, dashboards, and reports) is used to provide reliable, timely information to measure the organisation's performance. Information is regularly shared with stakeholders. Data is used to review progress, inform programme design, and for strategic decision-making. Specialised staff capable of working with complex data are available."
        }
      },
      {
        id: "9d", name: "Influence of Evaluation on Organisation", dei: false,
        levels: {
          1: "There is no interest in reflection and learning, and no expectation that evidence will lead to refined strategy and improvements in practice.",
          2: "There is little interest in and very few resources for reflection and learning; there is little evidence used to refine strategy and practice.",
          3: "Whilst there is interest in reflection and learning, few resources are available to ensure they occur regularly; improvements in strategy and practice based on evidence occur, but inconsistently.",
          4: "A culture of reflection and learning exists and resources are available and used to ensure that learning from evidence and experience occurs. What is learned leads to improvements in strategy and practice, and these lessons are shared internally and externally."
        }
      },
      {
        id: "9e", name: "Collection & Presentation of DEI Data", dei: true,
        levels: {
          1: "Organisation does not collect or track any DEI metrics within its evaluations.",
          2: "Organisation tracks some DEI metrics, such as gender, within its evaluations.",
          3: "Organisation actively tracks and strives for disaggregated data around DEI metrics such as religion, caste, gender, income, but the data do not inform the programme strategy.",
          4: "Organisation actively tracks and strives for disaggregated data around DEI metrics such as religion, caste, gender, income, etc.; the data informs the programme strategy."
        }
      },
    ]
  },
  {
    id: 10, name: "Programme Management",
    icon: "📋", color: "#06b6d4",
    subcapabilities: [
      {
        id: "10a", name: "Theory of Change & Results Framework", dei: false,
        levels: {
          1: "Programmes don't have a ToC but the team is able to articulate what they believe is the linkage between activities and desired outcome. Does not have a results framework.",
          2: "All programmes have a ToC including outcomes and corresponding time frames, but few programme-specific ToCs tie back to the organisation's mission. Nor does the organisation have an overall ToC. Activities are independent of the results framework.",
          3: "All programmes have a ToC including outcomes and corresponding time frames. ToCs are used sporadically to inform programme implementation. The ToCs of all programmes reflect the organisation's mission and collectively inform how the organisation articulates its ToC. Activities are aligned with the results framework.",
          4: "The ToCs of all programmes include outcomes, impact, and corresponding time frames. ToCs are used consistently to inform programme implementation. All programmes clearly reflect the organisation's mission. The results framework includes underlying critical assumptions for the successful achievement of targeted outcomes."
        }
      },
      {
        id: "10b", name: "Programme Planning", dei: false,
        levels: {
          1: "Organisation rarely performs programme planning and does not involve opportunity or needs assessments.",
          2: "Organisation performs programme planning but does not involve formal opportunity or needs assessments.",
          3: "Opportunity or needs assessments are conducted and documented; programme strategies are occasionally revised based on informal assessments.",
          4: "Programmes are designed on the basis of documented opportunity or needs assessments; they are frequently reassessed to ensure that they are optimally effective."
        }
      },
      {
        id: "10c", name: "Programme Growth & Replication", dei: false,
        levels: {
          1: "No assessment of possibility of scaling existing programmes; limited ability to scale, replicate, or deepen depth of existing programmes.",
          2: "Limited assessment of possibility of scaling existing programmes and, even when judged appropriate, little or limited action taken. Some ability to scale, replicate, or deepen existing programmes.",
          3: "Occasional assessment of possibility of scaling existing programmes and when judged appropriate, action occasionally taken. Able to scale, replicate, or deepen existing programmes.",
          4: "Frequent assessment of possibility of scaling existing programmes and when judged appropriate, action always taken. Efficiently and effectively able to grow existing programmes to meet needs of potential service recipients in local areas or other geographies, or by deepening services."
        }
      },
      {
        id: "10d", name: "New Programme Development", dei: false,
        levels: {
          1: "No assessment of gaps in ability of the current programme to meet recipient needs; limited ability to create new programmes. New programmes created largely in response to funding availability.",
          2: "Limited assessment of gaps in ability of existing programmes to meet recipient needs, with little or limited action taken. Some ability to modify existing programmes and create new programmes.",
          3: "Occasional assessment of gaps in ability of existing programmes to meet recipient needs, with some adjustments made. Demonstrated ability to modify and fine-tune existing programmes and create new programmes.",
          4: "Continual assessment of gaps in ability of existing programmes to meet recipient needs and adjustments always made. Organisation efficiently and effectively creates new, innovative programmes. Continuous pipeline of new ideas."
        }
      },
    ]
  },
  {
    id: 11, name: "Legal & Compliance",
    icon: "📜", color: "#84cc16",
    subcapabilities: [
      {
        id: "11a", name: "Legal Obligations", dei: false,
        levels: {
          1: "The organisation is legally registered, but is not aware of the compliance and regulatory requirements that need to be fulfilled by law.",
          2: "The organisation is legally registered but struggles at times to fully comply with relevant laws as it does not have any staff or advisors with the requisite knowledge and expertise.",
          3: "The organisation is legally registered but struggles at times to fully comply with relevant laws even though it has staff or advisors with the requisite knowledge and expertise.",
          4: "The organisation is legally registered and complies with relevant laws through staff or advisors who have the requisite knowledge and expertise with the regulatory requirements."
        }
      },
      {
        id: "11b", name: "Compliance", dei: false,
        levels: {
          1: "Organisation does not have any set process and systems to support compliance of fiscal and regulatory requirements. Compliance is very rudimentary.",
          2: "Organisation has a basic template that it follows to comply with fiscal and regulatory requirements. The staff has very limited knowledge.",
          3: "Organisation has systems and processes in place to comply with requirements; it has staff who have general knowledge but not expertise in nonprofit sector needs.",
          4: "Organisation has systems and processes in place to comply with requirements; it has staff who have expertise in nonprofit sector needs."
        }
      },
    ]
  },
  {
    id: 12, name: "Information Technology Systems",
    icon: "💻", color: "#38bdf8",
    subcapabilities: [
      {
        id: "12a", name: "Website", dei: false,
        levels: {
          1: "Organisation has no website of its own.",
          2: "Organisation has a basic website containing general information, but little information on current developments. Site maintenance is a burden and performed only occasionally.",
          3: "Organisation has a comprehensive website containing basic information on the organisation as well as latest developments. Most information is organisation-specific, and it is regularly maintained.",
          4: "Organisation has a sophisticated, comprehensive, and interactive website, which is regularly maintained and kept up to date. Includes links to related organisations and useful resources on the topic addressed by the organisation."
        }
      },
      {
        id: "12b", name: "Database Management & Reporting Systems", dei: false,
        levels: {
          1: "There are no systems for tracking clients, staff, volunteers, programme outcomes, and financial information.",
          2: "Databases and management reporting systems exist only in a few areas; systems perform only basic features and are awkward to use or used only occasionally by staff.",
          3: "Database and management reporting systems exist in most areas for tracking clients, staff, volunteers, programme outcomes, and financial information; they are commonly used and help to increase information sharing and efficiency.",
          4: "Sophisticated, comprehensive database and management reporting systems exist for tracking clients, staff, volunteers, programme outcomes, and financial information; they are widely used and essential in increasing information sharing and efficiency."
        }
      },
    ]
  },
  {
    id: 13, name: "Partnerships & Alliances",
    icon: "🔗", color: "#fb923c",
    subcapabilities: [
      {
        id: "13a", name: "Partnership Strategy", dei: false,
        levels: {
          1: "Does not belong to any formal or informal network of similar or complementary organisations, and does not work in partnerships with any other nonprofit organisation, government entity, or private company.",
          2: "Belongs to at least one formal or informal network of organisations. Not an active participant in and/or contributor to the network's activities. Has at least one informal partnership with another organisation; level of integration is low.",
          3: "Belongs to at least one formal network of organisations. An active participant in and/or contributor to the network on a consistent basis (eg, learns from other organisations, shares best practices, pursues joint advocacy). Has at least one formal partnership with another organisation, however, none involve joint programme delivery.",
          4: "Holds a leadership position in at least one formal network of organisations. Leads the network's efforts and represents the collective externally. Has at least one formal partnership with another organisation that involves joint programme delivery. Level of integration is high."
        }
      },
    ]
  },
];

const LEVEL_COLORS = { 0: "#374151", 1: "#ef4444", 2: "#f97316", 3: "#eab308", 4: "#22c55e" };
const LEVEL_BG = { 0: "#374151", 1: "#7f1d1d", 2: "#431407", 3: "#422006", 4: "#052e16" };
const LEVEL_NAMES = { 1: "Nascent", 2: "Emerging", 3: "Developing", 4: "Advanced" };
const PRIORITY_CONFIG = {
  Critical: { color: "#ef4444", bg: "#7f1d1d33", icon: "🔴" },
  High:     { color: "#f97316", bg: "#43140733", icon: "🟠" },
  Medium:   { color: "#3b82f6", bg: "#1e3a5f33", icon: "🔵" },
  Low:      { color: "#6b7280", bg: "#37415133", icon: "⚪" },
};

/* ── helpers ── */
function avg(nums) {
  const f = nums.filter(Boolean);
  return f.length ? f.reduce((a, b) => a + b, 0) / f.length : null;
}

/* ── components ── */
function LevelPill({ level, size = "md" }) {
  if (!level) return <span style={{ color: "#4b5563", fontSize: 11, fontFamily: "monospace" }}>—</span>;
  const s = size === "sm" ? { fontSize: 10, padding: "1px 6px" } : { fontSize: 12, padding: "3px 10px" };
  return (
    <span style={{
      ...s, borderRadius: 20, fontWeight: 800, fontFamily: "monospace",
      background: LEVEL_BG[level], color: LEVEL_COLORS[level],
      border: `1px solid ${LEVEL_COLORS[level]}55`,
    }}>
      L{level} · {LEVEL_NAMES[level]}
    </span>
  );
}

function ProgressRing({ value, max = 4, color, size = 56 }) {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const pct = value ? (value / max) * circ : 0;
  return (
    <svg width={size} height={size} style={{ flexShrink: 0 }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#1e2d45" strokeWidth={4} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color}
        strokeWidth={4} strokeDasharray={`${pct} ${circ}`}
        strokeLinecap="round" transform={`rotate(-90 ${size / 2} ${size / 2})`} />
      <text x={size / 2} y={size / 2 + 5} textAnchor="middle"
        fill={value ? color : "#374151"} fontSize={13} fontWeight={800} fontFamily="monospace">
        {value ? value.toFixed(1) : "—"}
      </text>
    </svg>
  );
}

function RadarChart({ scores, size = 260 }) {
  const cx = size / 2, cy = size / 2, r = size * 0.35;
  const n = CAPABILITIES.length;
  const getPoint = (i, val, maxVal = 4) => {
    const a = (Math.PI * 2 * i) / n - Math.PI / 2;
    const d = (val / maxVal) * r;
    return [cx + d * Math.cos(a), cy + d * Math.sin(a)];
  };
  const avgs = CAPABILITIES.map(cap => {
    const a = avg(cap.subcapabilities.map(s => scores[s.id] || 0));
    return a || 0;
  });
  const poly = avgs.map((v, i) => getPoint(i, v).join(",")).join(" ");
  return (
    <svg width={size} height={size}>
      {[1, 2, 3, 4].map(l => (
        <polygon key={l} points={CAPABILITIES.map((_, i) => getPoint(i, l).join(",")).join(" ")}
          fill="none" stroke={l === 4 ? "#1e3a5f" : "#111827"} strokeWidth={l === 4 ? 1 : 0.5} />
      ))}
      {CAPABILITIES.map((_, i) => {
        const [x, y] = getPoint(i, 4);
        return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="#111827" strokeWidth={0.5} />;
      })}
      <polygon points={poly} fill="rgba(99,202,183,0.15)" stroke="#63cab7" strokeWidth={2} />
      {avgs.map((v, i) => {
        const [x, y] = getPoint(i, v);
        return v > 0 ? <circle key={i} cx={x} cy={y} r={3} fill="#63cab7" /> : null;
      })}
      {CAPABILITIES.map((cap, i) => {
        const a = (Math.PI * 2 * i) / n - Math.PI / 2;
        const d = r + 20;
        return (
          <text key={i} x={cx + d * Math.cos(a)} y={cy + d * Math.sin(a)}
            textAnchor="middle" dominantBaseline="middle"
            fontSize={9} fill="#4b5563" fontFamily="monospace">{cap.id}</text>
        );
      })}
    </svg>
  );
}

/* ════════════════════════════════════════════════════════════
   AUTH WRAPPER — Login / Register / Admin
════════════════════════════════════════════════════════════ */

// Simple hash for password (not cryptographic — for demo purposes)
function simpleHash(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  return h.toString(36);
}

const APD_ADMIN = { email: "admin@apd.org", passwordHash: simpleHash("APD@2025"), name: "APD Admin", orgName: "Association of People with Disability", isAdmin: true };

/* ════════════════════════════════════════════════════════════
   MAIN TOOL
════════════════════════════════════════════════════════════ */
function SmartODTool({ currentUser, onLogout, savedData, onSaveData }) {
  const [step, setStep] = useState("intro"); // intro | setup | assess | plan | report

  // Load from saved data or defaults
  const [org, setOrg] = useState(savedData?.org || { name: currentUser.orgName || "", assessor: currentUser.name || "", date: new Date().toISOString().split("T")[0], notes: "" });
  const [scores, setScores] = useState(savedData?.scores || {});
  const [targets, setTargets] = useState(savedData?.targets || {});
  const [fieldNotes, setFieldNotes] = useState(savedData?.fieldNotes || {});
  const [priorities, setPriorities] = useState(savedData?.priorities || {});
  const [actions, setActions] = useState(savedData?.actions || {});
  const [timelines, setTimelines] = useState(savedData?.timelines || {});
  const [resources, setResources] = useState(savedData?.resources || {});

  // Auto-save whenever data changes
  useEffect(() => {
    onSaveData({ org, scores, targets, fieldNotes, priorities, actions, timelines, resources });
  }, [org, scores, targets, fieldNotes, priorities, actions, timelines, resources]);
  const [activeCap, setActiveCap] = useState(0);
  const [showLevelGuide, setShowLevelGuide] = useState(null); // subId
  const [deiOnly, setDeiOnly] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2500);
  };

  const setScore = (id, v) => setScores(s => ({ ...s, [id]: v === s[id] ? null : v }));
  const setTarget = (id, v) => setTargets(t => ({ ...t, [id]: v === t[id] ? null : v }));

  const allSubs = CAPABILITIES.flatMap(c => c.subcapabilities);
  const totalRated = allSubs.filter(s => scores[s.id]).length;
  const totalSubs = allSubs.length;
  const overallAvg = avg(allSubs.map(s => scores[s.id]).filter(Boolean));
  const criticalItems = allSubs.filter(s => priorities[s.id] === "Critical");
  const highItems = allSubs.filter(s => priorities[s.id] === "High");

  const capStats = CAPABILITIES.map(cap => {
    const vals = cap.subcapabilities.map(s => scores[s.id]).filter(Boolean);
    return { avg: avg(vals), rated: vals.length, total: cap.subcapabilities.length };
  });

  /* ── LEVEL DESCRIPTION CARD (popup) ── */
  const LevelGuide = ({ sub, onClose }) => (
    <div style={{
      position: "fixed", inset: 0, background: "#000000cc",
      zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 24
    }} onClick={onClose}>
      <div style={{
        background: "#0d1b2e", border: "1px solid #1e3a5f", borderRadius: 16,
        width: "100%", maxWidth: 620, maxHeight: "85vh", overflow: "auto",
        boxShadow: "0 25px 80px #00000099"
      }} onClick={e => e.stopPropagation()}>
        <div style={{ padding: "24px 28px", borderBottom: "1px solid #1e2d45", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontSize: 11, fontFamily: "monospace", color: "#64748b", letterSpacing: "0.12em", marginBottom: 4 }}>LEVEL DESCRIPTIONS</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#f1f5f9" }}>{sub.name}</div>
            {sub.dei && <span style={{ marginTop: 6, display: "inline-block", background: "#052e1633", border: "1px solid #22c55e44", color: "#22c55e", borderRadius: 4, padding: "2px 8px", fontSize: 10, fontFamily: "monospace", fontWeight: 700 }}>DEI INDICATOR</span>}
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#64748b", fontSize: 22, cursor: "pointer", lineHeight: 1 }}>×</button>
        </div>
        <div style={{ padding: 28 }}>
          {[1, 2, 3, 4].map(lvl => (
            <div key={lvl} style={{
              marginBottom: 16, padding: "16px 20px", borderRadius: 12,
              border: `1.5px solid ${scores[sub.id] === lvl ? LEVEL_COLORS[lvl] : LEVEL_COLORS[lvl] + "33"}`,
              background: scores[sub.id] === lvl ? LEVEL_BG[lvl] : "#060c18",
              cursor: "pointer", transition: "all 0.15s"
            }} onClick={() => { setScore(sub.id, lvl); }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 8, background: LEVEL_COLORS[lvl] + "22",
                  border: `2px solid ${LEVEL_COLORS[lvl]}`, display: "flex", alignItems: "center",
                  justifyContent: "center", color: LEVEL_COLORS[lvl], fontWeight: 800, fontSize: 13, fontFamily: "monospace", flexShrink: 0
                }}>L{lvl}</div>
                <div>
                  <div style={{ fontWeight: 700, color: LEVEL_COLORS[lvl], fontSize: 14 }}>{LEVEL_NAMES[lvl]}</div>
                  {scores[sub.id] === lvl && <div style={{ fontSize: 10, color: "#22c55e", fontFamily: "monospace" }}>✓ CURRENTLY SELECTED</div>}
                </div>
              </div>
              <div style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.7, paddingLeft: 44 }}>{sub.levels[lvl]}</div>
            </div>
          ))}
        </div>
        <div style={{ padding: "16px 28px", borderTop: "1px solid #1e2d45", textAlign: "center" }}>
          <div style={{ fontSize: 11, color: "#475569", fontFamily: "monospace" }}>Click any level above to select it · Source: Bridgespan Group OD Assessment Guide</div>
        </div>
      </div>
    </div>
  );

  /* ── INTRO ── */
  const IntroPage = () => {
    const [visible, setVisible] = useState(false);
    useState(() => { setTimeout(() => setVisible(true), 80); }, []);

    const capabilities = [
      { icon: "🎯", name: "Strategic Clarity" },
      { icon: "⚖️", name: "Governance" },
      { icon: "🏛️", name: "Org Management" },
      { icon: "🌟", name: "Leadership" },
      { icon: "💰", name: "Finance" },
      { icon: "👥", name: "Human Resources" },
      { icon: "🤝", name: "Fundraising" },
      { icon: "📢", name: "Communications" },
      { icon: "📊", name: "MLE" },
      { icon: "📋", name: "Programme Mgmt" },
      { icon: "📜", name: "Legal & Compliance" },
      { icon: "💻", name: "IT Systems" },
      { icon: "🔗", name: "Partnerships" },
    ];

    return (
      <div style={{ minHeight: "100vh", background: "#030b14", display: "flex", flexDirection: "column", overflowX: "hidden", fontFamily: "Georgia, serif" }}>

        {/* ── Hero ── */}
        <div style={{ position: "relative", minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "60px 40px", overflow: "hidden" }}>

          {/* Background grid */}
          <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(#0ea5e908 1px, transparent 1px), linear-gradient(90deg, #0ea5e908 1px, transparent 1px)", backgroundSize: "48px 48px", pointerEvents: "none" }} />

          {/* Glowing orbs */}
          <div style={{ position: "absolute", top: "15%", left: "10%", width: 320, height: 320, borderRadius: "50%", background: "radial-gradient(circle, #63cab730 0%, transparent 70%)", filter: "blur(40px)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", bottom: "20%", right: "8%", width: 280, height: 280, borderRadius: "50%", background: "radial-gradient(circle, #6366f130 0%, transparent 70%)", filter: "blur(40px)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", top: "50%", right: "20%", width: 200, height: 200, borderRadius: "50%", background: "radial-gradient(circle, #0ea5e920 0%, transparent 70%)", filter: "blur(30px)", pointerEvents: "none" }} />

          {/* APD badge */}
          <div style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(20px)", transition: "all 0.6s ease", marginBottom: 28, display: "flex", alignItems: "center", gap: 12, background: "#0d1b2e", border: "1px solid #1e3a5f", borderRadius: 40, padding: "8px 20px" }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg, #63cab7, #0ea5e9)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>♿</div>
            <span style={{ fontSize: 12, fontFamily: "monospace", color: "#63cab7", fontWeight: 700, letterSpacing: "0.1em" }}>ASSOCIATION OF PEOPLE WITH DISABILITY</span>
          </div>

          {/* Title */}
          <div style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(30px)", transition: "all 0.7s ease 0.1s", textAlign: "center", marginBottom: 24, maxWidth: 760 }}>
            <h1 style={{ fontSize: "clamp(36px, 5vw, 64px)", fontWeight: 900, lineHeight: 1.1, letterSpacing: "-0.03em", margin: 0 }}>
              <span style={{ color: "#f1f5f9" }}>Partner NGO</span>
              <br />
              <span style={{ background: "linear-gradient(135deg, #63cab7 0%, #0ea5e9 50%, #a78bfa 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                Organisation Development
              </span>
              <br />
              <span style={{ color: "#f1f5f9" }}>Assessment Tool</span>
            </h1>
          </div>

          {/* Subtitle */}
          <div style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(20px)", transition: "all 0.7s ease 0.2s", textAlign: "center", maxWidth: 600, marginBottom: 48 }}>
            <p style={{ color: "#64748b", fontSize: 17, lineHeight: 1.8, margin: 0 }}>
              A structured tool to help APD's partner NGOs assess their organisational strengths, identify capability gaps, and co-create a prioritised development plan — together.
            </p>
          </div>

          {/* CTA buttons */}
          <div style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(20px)", transition: "all 0.7s ease 0.3s", display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center", marginBottom: 72 }}>
            <button onClick={() => setStep("setup")}
              style={{ padding: "16px 40px", background: "linear-gradient(135deg, #63cab7, #0ea5e9)", border: "none", borderRadius: 12, color: "#030b14", fontFamily: "monospace", fontWeight: 900, fontSize: 14, letterSpacing: "0.1em", cursor: "pointer", boxShadow: "0 8px 32px #63cab744" }}>
              BEGIN ASSESSMENT →
            </button>
            <button onClick={() => document.getElementById('apd-how').scrollIntoView({ behavior: 'smooth' })}
              style={{ padding: "16px 40px", background: "transparent", border: "1.5px solid #1e3a5f", borderRadius: 12, color: "#64748b", fontFamily: "monospace", fontWeight: 700, fontSize: 14, letterSpacing: "0.1em", cursor: "pointer" }}>
              HOW IT WORKS ↓
            </button>
          </div>

          {/* Capability orbit pills */}
          <div style={{ opacity: visible ? 1 : 0, transition: "all 0.8s ease 0.4s", display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 8, maxWidth: 700 }}>
            {capabilities.map((c, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, background: "#0d1b2e", border: "1px solid #1e2d45", borderRadius: 20, padding: "6px 14px", fontSize: 11, color: "#4b5563", fontFamily: "monospace" }}>
                <span>{c.icon}</span>{c.name}
              </div>
            ))}
          </div>

          {/* Scroll indicator */}
          <div style={{ position: "absolute", bottom: 32, left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: 6, opacity: 0.4 }}>
            <div style={{ width: 1, height: 40, background: "linear-gradient(to bottom, transparent, #63cab7)" }} />
            <div style={{ fontSize: 9, fontFamily: "monospace", color: "#63cab7", letterSpacing: "0.2em" }}>SCROLL</div>
          </div>
        </div>

        {/* ── Why OD Section ── */}
        <div id="apd-how" style={{ padding: "80px 10%", background: "#050c18", borderTop: "1px solid #0d1b2e" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <div style={{ fontSize: 11, fontFamily: "monospace", color: "#63cab7", letterSpacing: "0.2em", marginBottom: 12 }}>WHY THIS MATTERS</div>
            <h2 style={{ fontSize: 36, fontWeight: 800, color: "#f1f5f9", margin: 0, letterSpacing: "-0.02em" }}>
              Strong Organisations,<br /><span style={{ color: "#63cab7" }}>Stronger Impact</span>
            </h2>
            <p style={{ color: "#4b5563", fontSize: 15, lineHeight: 1.8, maxWidth: 640, margin: "20px auto 0" }}>
              APD believes that sustainable impact for persons with disability begins with the organisations that serve them. This tool enables APD and its partner NGOs to take an honest, structured look at where they stand — and chart a clear path forward together.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
            {[
              { icon: "🤝", title: "Built for Collaboration", color: "#63cab7", desc: "Designed to be done together — APD capacity-building staff and the partner NGO leadership complete this as a joint exercise, building shared understanding and ownership of the plan." },
              { icon: "🔍", title: "Honest Self-Reflection", color: "#0ea5e9", desc: "The 4-level rating scale is anchored to specific, real-world descriptions — not vague labels. Every rating is grounded in evidence, not aspiration." },
              { icon: "♿", title: "DEI at the Centre", color: "#a78bfa", desc: "Diversity, Equity & Inclusion is woven through 7 of the 13 capability areas, reflecting APD's commitment to building organisations that truly include and represent the communities they serve." },
              { icon: "🗺️", title: "From Assessment to Action", color: "#f59e0b", desc: "The tool doesn't stop at diagnosis. It guides you all the way to a timestamped, milestone-based action plan with owners, resources, and a Gantt timeline — ready to implement." },
            ].map(({ icon, title, color, desc }) => (
              <div key={title} style={{ background: "#0d1b2e", border: `1px solid ${color}22`, borderRadius: 16, padding: 28 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: color + "18", border: `1.5px solid ${color}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, marginBottom: 16 }}>{icon}</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: "#e2e8f0", marginBottom: 10 }}>{title}</div>
                <div style={{ fontSize: 13, color: "#4b5563", lineHeight: 1.8 }}>{desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── 4-Step Process ── */}
        <div style={{ padding: "80px 10%", background: "#030b14", borderTop: "1px solid #0d1b2e" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <div style={{ fontSize: 11, fontFamily: "monospace", color: "#63cab7", letterSpacing: "0.2em", marginBottom: 12 }}>THE PROCESS</div>
            <h2 style={{ fontSize: 36, fontWeight: 800, color: "#f1f5f9", margin: 0, letterSpacing: "-0.02em" }}>Four Steps to a<br /><span style={{ color: "#63cab7" }}>Development Plan</span></h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 0, position: "relative" }}>
            {/* connector line */}
            <div style={{ position: "absolute", top: 36, left: "12.5%", right: "12.5%", height: 1, background: "linear-gradient(to right, #63cab744, #0ea5e944, #a78bfa44, #f59e0b44)", zIndex: 0 }} />
            {[
              { num: "01", icon: "⚙️", title: "Setup", color: "#63cab7", desc: "Enter the partner NGO's details — organisation name, lead assessor, date, and the purpose of this assessment." },
              { num: "02", icon: "🎯", title: "Assess", color: "#0ea5e9", desc: "Work through all 13 capability areas. Rate each sub-capability on a 4-point scale using detailed level descriptions as your guide." },
              { num: "03", icon: "📋", title: "Plan", color: "#a78bfa", desc: "For each gap identified, define milestones, assign owners, set target dates, list resources needed, and mark priorities." },
              { num: "04", icon: "📊", title: "Report", color: "#f59e0b", desc: "Generate a full visual report with radar chart, strengths & gaps analysis, Gantt timeline, and a consolidated action plan." },
            ].map(({ num, icon, title, color, desc }) => (
              <div key={num} style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", padding: "0 24px" }}>
                <div style={{ width: 72, height: 72, borderRadius: "50%", background: "#0d1b2e", border: `2px solid ${color}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", marginBottom: 20, boxShadow: `0 0 24px ${color}33` }}>
                  <span style={{ fontSize: 22 }}>{icon}</span>
                </div>
                <div style={{ fontSize: 11, fontFamily: "monospace", color, letterSpacing: "0.15em", marginBottom: 6, fontWeight: 700 }}>{num}</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: "#e2e8f0", marginBottom: 10 }}>{title}</div>
                <div style={{ fontSize: 13, color: "#4b5563", lineHeight: 1.8 }}>{desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Level Scale ── */}
        <div style={{ padding: "80px 10%", background: "#050c18", borderTop: "1px solid #0d1b2e" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60, alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 11, fontFamily: "monospace", color: "#63cab7", letterSpacing: "0.2em", marginBottom: 12 }}>THE RATING SCALE</div>
              <h2 style={{ fontSize: 32, fontWeight: 800, color: "#f1f5f9", margin: "0 0 16px", letterSpacing: "-0.02em" }}>Four Levels of<br /><span style={{ color: "#63cab7" }}>Organisational Maturity</span></h2>
              <p style={{ color: "#4b5563", fontSize: 14, lineHeight: 1.8 }}>
                Each of the 13 capabilities and their sub-capabilities are rated on a 4-point scale from Nascent to Advanced. Every level has a specific, plain-language description so there is no ambiguity — you'll know exactly where the organisation stands and what the next level looks like.
              </p>
              <p style={{ color: "#4b5563", fontSize: 14, lineHeight: 1.8 }}>
                The goal is not to reach Level 4 everywhere — it's to be <em style={{ color: "#94a3b8" }}>honest, strategic, and focused</em> on the areas that matter most for the NGO's mission.
              </p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                { lvl: 1, name: "Nascent", color: "#ef4444", desc: "Systems, policies or practices are absent or very basic. The organisation is largely reactive." },
                { lvl: 2, name: "Emerging", color: "#f97316", desc: "Some foundational elements exist but are inconsistent, incomplete, or not widely understood." },
                { lvl: 3, name: "Developing", color: "#eab308", desc: "Clear systems and practices are in place and mostly functioning, with some room for improvement." },
                { lvl: 4, name: "Advanced", color: "#22c55e", desc: "Robust, well-embedded practices that could serve as a model. Regularly reviewed and improved." },
              ].map(({ lvl, name, color, desc }) => (
                <div key={lvl} style={{ display: "flex", gap: 16, padding: "16px 20px", background: "#0d1b2e", border: `1px solid ${color}33`, borderRadius: 12, alignItems: "flex-start" }}>
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: color + "20", border: `2px solid ${color}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "monospace", fontWeight: 800, color, fontSize: 14, flexShrink: 0 }}>L{lvl}</div>
                  <div>
                    <div style={{ fontWeight: 700, color, fontSize: 14, marginBottom: 4 }}>{name}</div>
                    <div style={{ fontSize: 12, color: "#4b5563", lineHeight: 1.6 }}>{desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── 13 Capabilities ── */}
        <div style={{ padding: "80px 10%", background: "#030b14", borderTop: "1px solid #0d1b2e" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <div style={{ fontSize: 11, fontFamily: "monospace", color: "#63cab7", letterSpacing: "0.2em", marginBottom: 12 }}>WHAT YOU'LL ASSESS</div>
            <h2 style={{ fontSize: 32, fontWeight: 800, color: "#f1f5f9", margin: 0, letterSpacing: "-0.02em" }}>13 Organisational<br /><span style={{ color: "#63cab7" }}>Capability Areas</span></h2>
            <p style={{ color: "#4b5563", fontSize: 14, lineHeight: 1.8, maxWidth: 560, margin: "16px auto 0" }}>
              The framework covers every dimension of a well-functioning NGO. Areas marked with a DEI badge have explicit sub-capabilities focused on diversity, equity, and inclusion — a non-negotiable for APD's partners.
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
            {CAPABILITIES.map((cap) => {
              const deiCount = cap.subcapabilities.filter(s => s.dei).length;
              return (
                <div key={cap.id} style={{ background: "#0d1b2e", border: `1px solid ${cap.color}22`, borderRadius: 12, padding: "18px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <span style={{ fontSize: 22 }}>{cap.icon}</span>
                    {deiCount > 0 && <span style={{ fontSize: 9, fontFamily: "monospace", background: "#052e1633", border: "1px solid #22c55e44", color: "#22c55e", borderRadius: 4, padding: "2px 6px", fontWeight: 700 }}>DEI</span>}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#e2e8f0", lineHeight: 1.3, marginBottom: 4 }}>{cap.name}</div>
                    <div style={{ fontSize: 10, fontFamily: "monospace", color: cap.color + "99" }}>{cap.subcapabilities.length} sub-capabilities</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Attribution ── */}
        <div style={{ padding: "36px 10%", background: "#030b14", borderTop: "1px solid #0d1b2e" }}>
          <div style={{ maxWidth: 680, margin: "0 auto", textAlign: "center" }}>
            <div style={{ fontSize: 9, fontFamily: "monospace", color: "#1e2d45", letterSpacing: "0.2em", marginBottom: 18 }}>
              CAPABILITY INDICATORS DEVELOPED BY
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 28, flexWrap: "wrap" }}>

              {/* Bridgespan — wordmark style */}
              <div style={{ opacity: 0.35, display: "flex", alignItems: "center", gap: 5 }}>
                <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#60a5fa" }} />
                <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#34d399" }} />
                <span style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", fontFamily: "sans-serif", letterSpacing: "0.02em" }}>Bridgespan</span>
              </div>

              <div style={{ width: 1, height: 16, background: "#1e2d45" }} />

              {/* Dasra */}
              <div style={{ opacity: 0.35, display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 20, height: 20, borderRadius: "50%", background: "#e8460a", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: 7, fontWeight: 900, color: "#fff", fontFamily: "monospace" }}>d</span>
                </div>
                <span style={{ fontSize: 11, fontWeight: 600, color: "#94a3b8", fontFamily: "sans-serif" }}>dasra</span>
              </div>

              <div style={{ width: 1, height: 16, background: "#1e2d45" }} />

              {/* Dhwani */}
              <div style={{ opacity: 0.35 }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: "#c9a84c", fontFamily: "serif", letterSpacing: "0.03em" }}>Dhwani Foundation</span>
              </div>

              <div style={{ width: 1, height: 16, background: "#1e2d45" }} />

              {/* Samhita */}
              <div style={{ opacity: 0.35 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#e8460a", fontFamily: "sans-serif", letterSpacing: "-0.01em" }}>Samhita</span>
              </div>

              <div style={{ width: 1, height: 16, background: "#1e2d45" }} />

              {/* Sattva */}
              <div style={{ opacity: 0.35 }}>
                <span style={{ fontSize: 11, fontWeight: 800, color: "#4a9e3f", fontFamily: "monospace", letterSpacing: "0.04em" }}>SATTVA</span>
              </div>

              <div style={{ width: 1, height: 16, background: "#1e2d45" }} />

              {/* Toolbox India */}
              <div style={{ opacity: 0.35, display: "flex", alignItems: "center", gap: 5 }}>
                <div style={{ position: "relative", width: 18, height: 12 }}>
                  <div style={{ width: 12, height: 12, borderRadius: "50%", border: "2px solid #94a3b8", position: "absolute", left: 0 }} />
                  <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#e8460a", position: "absolute", right: 0, opacity: 0.8 }} />
                </div>
                <span style={{ fontSize: 10, fontWeight: 600, color: "#94a3b8", fontFamily: "sans-serif" }}>toolbox india</span>
              </div>

            </div>
          </div>
        </div>

        {/* ── Final CTA ── */}
        <div style={{ padding: "80px 10%", background: "#050c18", borderTop: "1px solid #0d1b2e", textAlign: "center" }}>
          <div style={{ maxWidth: 600, margin: "0 auto" }}>
            <div style={{ fontSize: 40, marginBottom: 20 }}>♿</div>
            <h2 style={{ fontSize: 32, fontWeight: 800, color: "#f1f5f9", marginBottom: 16, letterSpacing: "-0.02em" }}>
              Ready to begin?
            </h2>
            <p style={{ color: "#4b5563", fontSize: 15, lineHeight: 1.8, marginBottom: 36 }}>
              Set aside 60–90 minutes with your partner NGO's leadership team. Have your organisation's key documents handy. Be honest, be collaborative, and focus on growth — not judgement.
            </p>
            <button onClick={() => setStep("setup")}
              style={{ padding: "18px 48px", background: "linear-gradient(135deg, #63cab7, #0ea5e9)", border: "none", borderRadius: 14, color: "#030b14", fontFamily: "monospace", fontWeight: 900, fontSize: 15, letterSpacing: "0.1em", cursor: "pointer", boxShadow: "0 8px 40px #63cab755" }}>
              START THE ASSESSMENT →
            </button>
          </div>
        </div>

      </div>
    );
  };

  /* ── SETUP ── */
  const SetupPage = () => (
    <div style={{ maxWidth: 680 }}>
      <div style={{ marginBottom: 40 }}>
        <h1 style={{ fontSize: 32, fontWeight: 800, color: "#f1f5f9", marginBottom: 8, letterSpacing: "-0.02em" }}>
          Welcome to the NGO<br /><span style={{ color: "#63cab7" }}>OD Assessment Tool</span>
        </h1>
        <p style={{ color: "#64748b", fontSize: 15, lineHeight: 1.7 }}>
          An APD initiative to support partner NGOs in building strong, inclusive organisations.
          Fill in the details below to begin a structured assessment across 13 capability areas.
        </p>
      </div>

      <div style={{ background: "#0d1b2e", border: "1px solid #1e2d45", borderRadius: 16, padding: 32, marginBottom: 24 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: "#cbd5e1", marginBottom: 24, fontFamily: "monospace", letterSpacing: "0.08em" }}>ORGANISATION DETAILS</h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
          {[["Organisation Name", "name", "e.g. Praja Foundation", "text"],
            ["Lead Assessor", "assessor", "e.g. Anita Sharma", "text"],
            ["Assessment Date", "date", "", "date"],
          ].map(([label, key, ph, type]) => (
            <div key={key}>
              <label style={{ display: "block", fontSize: 11, fontFamily: "monospace", color: "#64748b", letterSpacing: "0.1em", marginBottom: 8 }}>{label}</label>
              <input type={type} placeholder={ph} value={org[key]}
                onChange={e => setOrg(o => ({ ...o, [key]: e.target.value }))}
                style={{ width: "100%", background: "#060c18", border: "1px solid #1e2d45", borderRadius: 10, padding: "12px 16px", color: "#e2e8f0", fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "Georgia, serif" }} />
            </div>
          ))}
        </div>
        <div>
          <label style={{ display: "block", fontSize: 11, fontFamily: "monospace", color: "#64748b", letterSpacing: "0.1em", marginBottom: 8 }}>CONTEXT / PURPOSE OF THIS ASSESSMENT</label>
          <textarea value={org.notes} onChange={e => setOrg(o => ({ ...o, notes: e.target.value }))}
            placeholder="e.g. Annual OD review before multi-year grant, preparation for leadership transition..."
            style={{ width: "100%", background: "#060c18", border: "1px solid #1e2d45", borderRadius: 10, padding: "12px 16px", color: "#e2e8f0", fontSize: 14, outline: "none", resize: "vertical", minHeight: 80, boxSizing: "border-box", fontFamily: "Georgia, serif" }} />
        </div>
      </div>

      {/* Process overview */}
      <div style={{ background: "#060c18", border: "1px solid #0ea5e933", borderRadius: 16, padding: 28, marginBottom: 32 }}>
        <h3 style={{ fontSize: 13, fontFamily: "monospace", color: "#0ea5e9", letterSpacing: "0.1em", marginBottom: 20 }}>HOW THIS TOOL WORKS</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {[
            ["01 ASSESS", "🎯", "Rate each of 13 capabilities on a 4-level scale. Every level has a full description to guide your assessment."],
            ["02 UNDERSTAND", "💡", "Click 'View Descriptions' on any sub-capability to see exactly what Level 1–4 looks like. Select directly from the popup."],
            ["03 PLAN", "📋", "Set target levels, assign priority (Critical / High / Medium / Low), and write specific action plans."],
            ["04 REPORT", "📊", "Get a visual summary with radar chart, score breakdowns, and a consolidated action plan table."],
          ].map(([title, icon, desc]) => (
            <div key={title} style={{ display: "flex", gap: 14, padding: 16, background: "#0d1b2e", borderRadius: 10, border: "1px solid #1e2d45" }}>
              <span style={{ fontSize: 22, flexShrink: 0 }}>{icon}</span>
              <div>
                <div style={{ fontSize: 11, fontFamily: "monospace", color: "#63cab7", fontWeight: 700, marginBottom: 4 }}>{title}</div>
                <div style={{ fontSize: 12, color: "#64748b", lineHeight: 1.6 }}>{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button onClick={() => { if (!org.name) { showToast("Please enter the organisation name", "warn"); return; } setStep("assess"); }}
        style={{ padding: "14px 36px", background: "#63cab7", color: "#0a0f1a", border: "none", borderRadius: 10, fontFamily: "monospace", fontWeight: 800, fontSize: 13, letterSpacing: "0.1em", cursor: "pointer" }}>
        BEGIN ASSESSMENT →
      </button>
    </div>
  );

  /* ── ASSESS ── */
  const AssessPage = () => {
    const cap = CAPABILITIES[activeCap];
    const subs = deiOnly ? cap.subcapabilities.filter(s => s.dei) : cap.subcapabilities;

    return (
      <div style={{ display: "flex", gap: 24, height: "100%" }}>
        {/* LEFT: cap nav */}
        <div style={{ width: 240, flexShrink: 0 }}>
          <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
            <button onClick={() => setDeiOnly(!deiOnly)}
              style={{ flex: 1, padding: "7px 0", background: deiOnly ? "#052e16" : "#060c18", border: `1.5px solid ${deiOnly ? "#22c55e" : "#1e2d45"}`, borderRadius: 8, color: deiOnly ? "#22c55e" : "#6b7280", fontSize: 11, fontFamily: "monospace", fontWeight: 700, cursor: "pointer" }}>
              {deiOnly ? "✓ DEI ONLY" : "FILTER: DEI"}
            </button>
          </div>
          <div style={{ fontSize: 11, fontFamily: "monospace", color: "#374151", marginBottom: 10, letterSpacing: "0.1em" }}>
            {totalRated}/{totalSubs} RATED
          </div>
          <div style={{ height: 4, borderRadius: 2, background: "#1e2d45", overflow: "hidden", marginBottom: 16 }}>
            <div style={{ width: `${(totalRated / totalSubs) * 100}%`, height: "100%", background: "#63cab7", borderRadius: 2, transition: "width 0.4s" }} />
          </div>
          <div style={{ overflowY: "auto", maxHeight: "calc(100vh - 250px)" }}>
            {CAPABILITIES.map((c, i) => {
              const st = capStats[i];
              const isActive = activeCap === i;
              return (
                <div key={c.id} onClick={() => setActiveCap(i)}
                  style={{ padding: "12px 14px", borderRadius: 10, marginBottom: 6, cursor: "pointer", border: `1.5px solid ${isActive ? c.color + "88" : "#1e2d45"}`, background: isActive ? c.color + "11" : "#060c18", transition: "all 0.15s" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    <span style={{ fontSize: 16 }}>{c.icon}</span>
                    <div style={{ fontSize: 11, color: isActive ? "#e2e8f0" : "#94a3b8", fontWeight: 600, lineHeight: 1.3 }}>{c.name}</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ flex: 1, height: 3, borderRadius: 2, background: "#1e2d45", overflow: "hidden" }}>
                      <div style={{ width: st.avg ? `${(st.avg / 4) * 100}%` : "0%", height: "100%", background: st.avg ? LEVEL_COLORS[Math.round(st.avg)] : "#374151", borderRadius: 2, transition: "width 0.4s" }} />
                    </div>
                    <span style={{ fontSize: 10, fontFamily: "monospace", color: st.avg ? LEVEL_COLORS[Math.round(st.avg)] : "#374151", width: 28 }}>
                      {st.avg ? st.avg.toFixed(1) : `${st.rated}/${st.total}`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT: sub-cap cards */}
        <div style={{ flex: 1, overflowY: "auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24, padding: "18px 24px", background: "#0d1b2e", borderRadius: 14, border: `1.5px solid ${cap.color}44` }}>
            <span style={{ fontSize: 28 }}>{cap.icon}</span>
            <div>
              <div style={{ fontSize: 20, fontWeight: 800, color: "#f1f5f9" }}>{cap.name}</div>
              <div style={{ fontSize: 12, color: "#64748b", fontFamily: "monospace", marginTop: 2 }}>
                {cap.subcapabilities.filter(s => scores[s.id]).length}/{cap.subcapabilities.length} sub-capabilities rated
              </div>
            </div>
            {capStats[activeCap].avg && (
              <div style={{ marginLeft: "auto" }}>
                <ProgressRing value={capStats[activeCap].avg} color={cap.color} size={52} />
              </div>
            )}
          </div>

          {subs.length === 0 && (
            <div style={{ textAlign: "center", padding: 40, color: "#374151", fontSize: 14 }}>No DEI sub-capabilities in this section.</div>
          )}

          {subs.map(sub => {
            const current = scores[sub.id];
            return (
              <div key={sub.id} style={{ background: "#0d1b2e", border: `1.5px solid ${current ? LEVEL_COLORS[current] + "44" : "#1e2d45"}`, borderRadius: 14, padding: "20px 24px", marginBottom: 14, transition: "border-color 0.2s" }}>
                {/* Header */}
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16, gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "#e2e8f0", marginBottom: 6 }}>{sub.name}</div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {sub.dei && <span style={{ background: "#052e1633", border: "1px solid #22c55e44", color: "#22c55e", borderRadius: 4, padding: "2px 8px", fontSize: 10, fontFamily: "monospace", fontWeight: 700 }}>DEI INDICATOR</span>}
                      {current && <LevelPill level={current} />}
                    </div>
                  </div>
                  <button onClick={() => setShowLevelGuide(sub.id)}
                    style={{ padding: "8px 16px", background: "#0ea5e911", border: "1.5px solid #0ea5e944", borderRadius: 8, color: "#0ea5e9", fontSize: 11, fontFamily: "monospace", fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0 }}>
                    📖 VIEW DESCRIPTIONS
                  </button>
                </div>

                {/* Quick level selector with inline preview */}
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 11, fontFamily: "monospace", color: "#64748b", letterSpacing: "0.1em", marginBottom: 10 }}>SELECT CURRENT LEVEL</div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
                    {[1, 2, 3, 4].map(lvl => (
                      <div key={lvl} onClick={() => setScore(sub.id, lvl)}
                        style={{ padding: "10px 12px", borderRadius: 10, border: `2px solid ${current === lvl ? LEVEL_COLORS[lvl] : LEVEL_COLORS[lvl] + "44"}`, background: current === lvl ? LEVEL_BG[lvl] : "#060c18", cursor: "pointer", transition: "all 0.15s" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                          <div style={{ width: 24, height: 24, borderRadius: 6, background: LEVEL_COLORS[lvl] + "22", border: `1.5px solid ${LEVEL_COLORS[lvl]}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "monospace", fontWeight: 800, fontSize: 11, color: LEVEL_COLORS[lvl] }}>L{lvl}</div>
                          <span style={{ fontSize: 11, fontWeight: 700, color: LEVEL_COLORS[lvl] }}>{LEVEL_NAMES[lvl]}</span>
                        </div>
                        <div style={{ fontSize: 10, color: "#4b5563", lineHeight: 1.5, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical" }}>
                          {sub.levels[lvl].split(".")[0]}.
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <div style={{ fontSize: 11, fontFamily: "monospace", color: "#64748b", letterSpacing: "0.1em", marginBottom: 8 }}>ASSESSMENT NOTES <span style={{ color: "#374151" }}>(optional)</span></div>
                  <textarea value={fieldNotes[sub.id] || ""} onChange={e => setFieldNotes(n => ({ ...n, [sub.id]: e.target.value }))}
                    placeholder="Evidence for this rating, observations, context..."
                    style={{ width: "100%", background: "#060c18", border: "1px solid #1e2d45", borderRadius: 8, padding: "10px 14px", color: "#cbd5e1", fontSize: 13, outline: "none", resize: "vertical", minHeight: 60, boxSizing: "border-box", fontFamily: "Georgia, serif" }} />
                </div>
              </div>
            );
          })}

          {/* Nav buttons */}
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, paddingBottom: 24 }}>
            <button onClick={() => setActiveCap(a => Math.max(0, a - 1))} disabled={activeCap === 0}
              style={{ padding: "10px 20px", background: "#1e2d45", border: "none", borderRadius: 8, color: "#94a3b8", fontFamily: "monospace", fontSize: 12, cursor: activeCap === 0 ? "not-allowed" : "pointer", opacity: activeCap === 0 ? 0.4 : 1 }}>
              ← PREV
            </button>
            {activeCap < CAPABILITIES.length - 1 ? (
              <button onClick={() => setActiveCap(a => a + 1)}
                style={{ padding: "10px 20px", background: "#63cab7", color: "#0a0f1a", border: "none", borderRadius: 8, fontFamily: "monospace", fontWeight: 800, fontSize: 12, cursor: "pointer" }}>
                NEXT → {CAPABILITIES[activeCap + 1]?.icon} {CAPABILITIES[activeCap + 1]?.name.split(" ")[0]}...
              </button>
            ) : (
              <button onClick={() => setStep("plan")}
                style={{ padding: "10px 24px", background: "#63cab7", color: "#0a0f1a", border: "none", borderRadius: 8, fontFamily: "monospace", fontWeight: 800, fontSize: 12, cursor: "pointer" }}>
                GO TO ACTION PLAN →
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  /* ── PLAN ── */
  const PlanPage = () => {
    const [planCap, setPlanCap] = useState(0);
    const cap = CAPABILITIES[planCap];
    const gaps = allSubs.filter(s => scores[s.id] && scores[s.id] < 4).sort((a, b) => (scores[a.id] || 0) - (scores[b.id] || 0));

    return (
      <div style={{ display: "flex", gap: 24 }}>
        {/* left */}
        <div style={{ width: 240, flexShrink: 0 }}>
          <div style={{ fontSize: 11, fontFamily: "monospace", color: "#64748b", letterSpacing: "0.1em", marginBottom: 12 }}>CAPABILITIES</div>
          <div style={{ overflowY: "auto", maxHeight: "calc(100vh - 200px)" }}>
            {CAPABILITIES.map((c, i) => {
              const withAction = c.subcapabilities.filter(s => (Array.isArray(actions[s.id]) ? actions[s.id].length > 0 : false) || timelines[s.id]?.start).length;
              const withPriority = c.subcapabilities.filter(s => priorities[s.id]).length;
              return (
                <div key={c.id} onClick={() => setPlanCap(i)}
                  style={{ padding: "12px 14px", borderRadius: 10, marginBottom: 6, cursor: "pointer", border: `1.5px solid ${planCap === i ? c.color + "88" : "#1e2d45"}`, background: planCap === i ? c.color + "11" : "#060c18", transition: "all 0.15s" }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4 }}>
                    <span>{c.icon}</span>
                    <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600, lineHeight: 1.3 }}>{c.name}</div>
                  </div>
                  <div style={{ fontSize: 10, color: "#374151", fontFamily: "monospace" }}>
                    {withPriority} prioritised · {withAction} planned
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* right */}
        <div style={{ flex: 1, overflowY: "auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20, padding: "16px 22px", background: "#0d1b2e", borderRadius: 14, border: `1.5px solid ${cap.color}44` }}>
            <span style={{ fontSize: 26 }}>{cap.icon}</span>
            <div style={{ fontSize: 18, fontWeight: 800, color: "#f1f5f9" }}>{cap.name}</div>
          </div>

          {cap.subcapabilities.map(sub => {
            const current = scores[sub.id];
            const target = targets[sub.id];
            const priority = priorities[sub.id];
            const action = actions[sub.id];
            const pc = PRIORITY_CONFIG[priority];
            return (
              <div key={sub.id} style={{ background: "#0d1b2e", border: `1.5px solid ${priority ? pc.color + "44" : "#1e2d45"}`, borderRadius: 14, padding: "20px 24px", marginBottom: 14 }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16, gap: 12 }}>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "#e2e8f0", marginBottom: 6 }}>{sub.name}</div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                      {sub.dei && <span style={{ background: "#052e1633", border: "1px solid #22c55e44", color: "#22c55e", borderRadius: 4, padding: "2px 8px", fontSize: 10, fontFamily: "monospace", fontWeight: 700 }}>DEI</span>}
                      {current && <LevelPill level={current} />}
                      {current && target && <span style={{ color: "#374151", fontSize: 13 }}>→</span>}
                      {target && <LevelPill level={target} />}
                    </div>
                  </div>
                  <button onClick={() => setShowLevelGuide(sub.id)}
                    style={{ padding: "7px 14px", background: "#0ea5e911", border: "1.5px solid #0ea5e944", borderRadius: 8, color: "#0ea5e9", fontSize: 10, fontFamily: "monospace", fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0 }}>
                    📖 DESCRIPTIONS
                  </button>
                </div>

                <div style={{ display: "flex", gap: 20, flexWrap: "wrap", marginBottom: 16 }}>
                  {/* Current */}
                  <div>
                    <div style={{ fontSize: 11, fontFamily: "monospace", color: "#64748b", letterSpacing: "0.1em", marginBottom: 8 }}>CURRENT</div>
                    <div style={{ display: "flex", gap: 6 }}>
                      {[1, 2, 3, 4].map(l => (
                        <button key={l} onClick={() => setScore(sub.id, l)}
                          style={{ width: 38, height: 38, borderRadius: 8, border: `2px solid ${current === l ? LEVEL_COLORS[l] : LEVEL_COLORS[l] + "44"}`, background: current === l ? LEVEL_BG[l] : "transparent", color: current === l ? LEVEL_COLORS[l] : LEVEL_COLORS[l] + "88", fontWeight: 800, fontSize: 13, cursor: "pointer", fontFamily: "monospace", transition: "all 0.1s" }}>L{l}</button>
                      ))}
                    </div>
                  </div>
                  {/* Target */}
                  <div>
                    <div style={{ fontSize: 11, fontFamily: "monospace", color: "#64748b", letterSpacing: "0.1em", marginBottom: 8 }}>TARGET</div>
                    <div style={{ display: "flex", gap: 6 }}>
                      {[1, 2, 3, 4].map(l => (
                        <button key={l} onClick={() => setTarget(sub.id, l)}
                          style={{ width: 38, height: 38, borderRadius: 8, border: `2px solid ${target === l ? LEVEL_COLORS[l] : LEVEL_COLORS[l] + "33"}`, background: target === l ? LEVEL_BG[l] : "transparent", color: target === l ? LEVEL_COLORS[l] : LEVEL_COLORS[l] + "55", fontWeight: 800, fontSize: 13, cursor: "pointer", fontFamily: "monospace", transition: "all 0.1s" }}>L{l}</button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Priority */}
                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 11, fontFamily: "monospace", color: "#64748b", letterSpacing: "0.1em", marginBottom: 8 }}>PRIORITY</div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {Object.entries(PRIORITY_CONFIG).map(([p, cfg]) => (
                      <button key={p} onClick={() => setPriorities(pr => ({ ...pr, [sub.id]: pr[sub.id] === p ? null : p }))}
                        style={{ padding: "7px 16px", borderRadius: 8, border: `1.5px solid ${priority === p ? cfg.color : cfg.color + "44"}`, background: priority === p ? cfg.bg : "transparent", color: priority === p ? cfg.color : cfg.color + "88", fontSize: 12, fontFamily: "monospace", fontWeight: 700, cursor: "pointer", transition: "all 0.1s" }}>
                        {cfg.icon} {p}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Milestones / Activities */}
                {(() => {
                  const milestones = actions[sub.id] || [];
                  const addMilestone = () => setActions(a => ({ ...a, [sub.id]: [...(a[sub.id] || []), { id: Date.now(), activity: "", owner: "", date: "", status: "Pending" }] }));
                  const updateMilestone = (idx, field, val) => setActions(a => {
                    const arr = [...(a[sub.id] || [])];
                    arr[idx] = { ...arr[idx], [field]: val };
                    return { ...a, [sub.id]: arr };
                  });
                  const removeMilestone = idx => setActions(a => {
                    const arr = [...(a[sub.id] || [])];
                    arr.splice(idx, 1);
                    return { ...a, [sub.id]: arr };
                  });
                  const STATUS_OPTS = ["Pending", "In Progress", "Done", "Blocked"];
                  const STATUS_COLOR = { Pending: "#64748b", "In Progress": "#0ea5e9", Done: "#22c55e", Blocked: "#ef4444" };
                  return (
                    <div style={{ marginBottom: 14 }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                        <div>
                          <div style={{ fontSize: 11, fontFamily: "monospace", color: "#63cab7", letterSpacing: "0.1em", fontWeight: 700 }}>
                            📌 MILESTONES & ACTIVITIES
                          </div>
                          {current && target && (
                            <div style={{ fontSize: 10, color: "#374151", fontFamily: "monospace", marginTop: 3 }}>
                              Steps to move from <span style={{ color: LEVEL_COLORS[current] }}>L{current} {LEVEL_NAMES[current]}</span> → <span style={{ color: LEVEL_COLORS[target] }}>L{target} {LEVEL_NAMES[target]}</span>
                            </div>
                          )}
                        </div>
                        <button onClick={addMilestone}
                          style={{ padding: "6px 14px", background: "#63cab722", border: "1.5px solid #63cab766", borderRadius: 8, color: "#63cab7", fontSize: 11, fontFamily: "monospace", fontWeight: 700, cursor: "pointer" }}>
                          + ADD
                        </button>
                      </div>

                      {milestones.length === 0 && (
                        <div onClick={addMilestone} style={{ border: "1.5px dashed #1e3a5f", borderRadius: 10, padding: "18px 20px", textAlign: "center", cursor: "pointer", color: "#374151", fontSize: 12 }}>
                          Click <span style={{ color: "#63cab7", fontFamily: "monospace" }}>+ ADD</span> to define specific activities and milestones
                        </div>
                      )}

                      {milestones.length > 0 && (
                        <div style={{ background: "#060c18", borderRadius: 10, overflow: "hidden", border: "1px solid #1e2d45" }}>
                          {/* Column headers */}
                          <div style={{ display: "grid", gridTemplateColumns: "28px 1fr 140px 130px 110px 28px", gap: 0, padding: "8px 12px", borderBottom: "1px solid #1e2d45", background: "#0d1b2e" }}>
                            {["#", "ACTIVITY / MILESTONE", "OWNER", "TARGET DATE", "STATUS", ""].map((h, i) => (
                              <div key={i} style={{ fontSize: 9, fontFamily: "monospace", color: "#374151", letterSpacing: "0.1em", fontWeight: 700 }}>{h}</div>
                            ))}
                          </div>
                          {milestones.map((m, idx) => (
                            <div key={m.id} style={{ display: "grid", gridTemplateColumns: "28px 1fr 140px 130px 110px 28px", gap: 0, padding: "8px 12px", borderBottom: idx < milestones.length - 1 ? "1px solid #111827" : "none", alignItems: "start" }}>
                              {/* Index */}
                              <div style={{ fontSize: 11, fontFamily: "monospace", color: "#374151", paddingTop: 8 }}>{idx + 1}</div>

                              {/* Activity */}
                              <textarea value={m.activity}
                                onChange={e => updateMilestone(idx, "activity", e.target.value)}
                                placeholder={`e.g. ${idx === 0 ? "Conduct needs assessment and gap analysis" : idx === 1 ? "Draft policy / procedure document" : "Implement and review with team"}`}
                                style={{ background: "transparent", border: "none", borderBottom: "1px solid #1e2d4566", color: "#cbd5e1", fontSize: 12, outline: "none", resize: "none", minHeight: 36, padding: "6px 8px", fontFamily: "Georgia, serif", lineHeight: 1.5, width: "100%", boxSizing: "border-box" }} />

                              {/* Owner */}
                              <input value={m.owner} onChange={e => updateMilestone(idx, "owner", e.target.value)}
                                placeholder="e.g. CEO"
                                style={{ background: "transparent", border: "none", borderBottom: "1px solid #1e2d4566", color: "#94a3b8", fontSize: 11, outline: "none", padding: "6px 8px", fontFamily: "monospace", width: "100%", boxSizing: "border-box" }} />

                              {/* Date */}
                              <input type="date" value={m.date} onChange={e => updateMilestone(idx, "date", e.target.value)}
                                style={{ background: "transparent", border: "none", borderBottom: "1px solid #1e2d4566", color: "#64748b", fontSize: 11, outline: "none", padding: "6px 8px", fontFamily: "monospace", width: "100%", boxSizing: "border-box" }} />

                              {/* Status */}
                              <select value={m.status} onChange={e => updateMilestone(idx, "status", e.target.value)}
                                style={{ background: "#0d1b2e", border: `1px solid ${STATUS_COLOR[m.status]}44`, borderRadius: 6, color: STATUS_COLOR[m.status], fontSize: 11, outline: "none", padding: "5px 8px", fontFamily: "monospace", fontWeight: 700, cursor: "pointer", width: "100%" }}>
                                {STATUS_OPTS.map(s => <option key={s} value={s}>{s}</option>)}
                              </select>

                              {/* Remove */}
                              <button onClick={() => removeMilestone(idx)}
                                style={{ background: "none", border: "none", color: "#374151", cursor: "pointer", fontSize: 14, paddingTop: 6, lineHeight: 1 }}>×</button>
                            </div>
                          ))}

                          {/* Progress bar across milestones */}
                          {milestones.length > 0 && (() => {
                            const done = milestones.filter(m => m.status === "Done").length;
                            const inProg = milestones.filter(m => m.status === "In Progress").length;
                            const blocked = milestones.filter(m => m.status === "Blocked").length;
                            const pct = Math.round((done / milestones.length) * 100);
                            return (
                              <div style={{ padding: "10px 12px", background: "#0d1b2e", borderTop: "1px solid #1e2d45", display: "flex", alignItems: "center", gap: 12 }}>
                                <div style={{ flex: 1, height: 5, borderRadius: 3, background: "#1e2d45", overflow: "hidden" }}>
                                  <div style={{ width: `${pct}%`, height: "100%", background: "#22c55e", borderRadius: 3, transition: "width 0.3s" }} />
                                </div>
                                <div style={{ fontSize: 10, fontFamily: "monospace", color: "#64748b", whiteSpace: "nowrap" }}>
                                  {done}/{milestones.length} done
                                  {inProg > 0 && <span style={{ color: "#0ea5e9" }}> · {inProg} in progress</span>}
                                  {blocked > 0 && <span style={{ color: "#ef4444" }}> · {blocked} blocked</span>}
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* Resources */}
                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 11, fontFamily: "monospace", color: "#64748b", letterSpacing: "0.1em", marginBottom: 8 }}>
                    💎 RESOURCES NEEDED <span style={{ color: "#374151" }}>(optional)</span>
                  </div>
                  <textarea value={resources[sub.id] || ""} onChange={e => setResources(r => ({ ...r, [sub.id]: e.target.value }))}
                    placeholder="e.g. Budget: ₹2L for training workshop · External consultant for HR audit · 10hrs/month from Programme team · Board approval required..."
                    style={{ width: "100%", background: "#060c18", border: "1px solid #a78bfa44", borderRadius: 8, padding: "10px 14px", color: "#cbd5e1", fontSize: 13, outline: "none", resize: "vertical", minHeight: 60, boxSizing: "border-box", fontFamily: "Georgia, serif" }} />
                  {/* Resource tag chips — auto-parse comma/bullet separated items */}
                  {resources[sub.id]?.trim() && (
                    <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {resources[sub.id].split(/[·•,\n]/).map(t => t.trim()).filter(Boolean).map((tag, i) => (
                        <span key={i} style={{ fontSize: 11, background: "#a78bfa18", border: "1px solid #a78bfa44", color: "#a78bfa", borderRadius: 6, padding: "3px 10px", fontFamily: "monospace" }}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Timeline */}
                <div style={{ background: "#060c18", border: "1px solid #1e3a5f", borderRadius: 10, padding: "14px 18px" }}>
                  <div style={{ fontSize: 11, fontFamily: "monospace", color: "#0ea5e9", letterSpacing: "0.1em", marginBottom: 12 }}>📅 TIMELINE & OWNERSHIP</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                    {[
                      { label: "START DATE", key: "start", type: "date" },
                      { label: "END DATE", key: "end", type: "date" },
                      { label: "RESPONSIBLE PERSON", key: "owner", type: "text", placeholder: "e.g. Programme Director" },
                    ].map(({ label, key, type, placeholder }) => (
                      <div key={key}>
                        <div style={{ fontSize: 10, fontFamily: "monospace", color: "#374151", letterSpacing: "0.1em", marginBottom: 6 }}>{label}</div>
                        <input type={type} placeholder={placeholder || ""}
                          value={timelines[sub.id]?.[key] || ""}
                          onChange={e => setTimelines(t => ({ ...t, [sub.id]: { ...(t[sub.id] || {}), [key]: e.target.value } }))}
                          style={{ width: "100%", background: "#0d1b2e", border: "1px solid #1e2d45", borderRadius: 8, padding: "9px 12px", color: "#e2e8f0", fontSize: 12, outline: "none", boxSizing: "border-box", fontFamily: "monospace" }} />
                      </div>
                    ))}
                  </div>
                  {/* Duration chip */}
                  {timelines[sub.id]?.start && timelines[sub.id]?.end && (() => {
                    const s = new Date(timelines[sub.id].start);
                    const e = new Date(timelines[sub.id].end);
                    const days = Math.round((e - s) / 86400000);
                    const weeks = Math.round(days / 7);
                    const months = Math.round(days / 30);
                    const valid = days > 0;
                    const label = valid ? (days < 14 ? `${days} days` : months < 3 ? `${weeks} weeks` : `${months} months`) : null;
                    const color = valid ? (months <= 1 ? "#22c55e" : months <= 3 ? "#eab308" : months <= 6 ? "#f97316" : "#ef4444") : "#ef4444";
                    return (
                      <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ fontSize: 11, fontFamily: "monospace", color, background: color + "18", border: `1px solid ${color}44`, borderRadius: 6, padding: "3px 10px" }}>
                          {valid ? `⏱ Duration: ${label}` : "⚠ End date before start date"}
                        </span>
                        {timelines[sub.id]?.owner && (
                          <span style={{ fontSize: 11, fontFamily: "monospace", color: "#64748b", background: "#1e2d45", borderRadius: 6, padding: "3px 10px" }}>
                            👤 {timelines[sub.id].owner}
                          </span>
                        )}
                      </div>
                    );
                  })()}
                </div>
              </div>
            );
          })}
          <div style={{ paddingBottom: 24 }}>
            <button onClick={() => setStep("report")} style={{ padding: "12px 32px", background: "#63cab7", color: "#0a0f1a", border: "none", borderRadius: 10, fontFamily: "monospace", fontWeight: 800, fontSize: 13, cursor: "pointer" }}>
              VIEW FULL REPORT →
            </button>
          </div>
        </div>
      </div>
    );
  };

  /* ── REPORT ── */
  const ReportPage = () => {
    const actionItems = allSubs.filter(s => (Array.isArray(actions[s.id]) ? actions[s.id].length > 0 : false) || timelines[s.id]?.start || resources[s.id]?.trim()).map(s => {
      const cap = CAPABILITIES.find(c => c.subcapabilities.find(x => x.id === s.id));
      const tl = timelines[s.id] || {};
      const milestones = Array.isArray(actions[s.id]) ? actions[s.id] : [];
      return { ...s, capName: cap.name, capIcon: cap.icon, capColor: cap.color, current: scores[s.id], target: targets[s.id], priority: priorities[s.id], tl, res: resources[s.id] || "", milestones };
    }).sort((a, b) => {
      const o = { Critical: 0, High: 1, Medium: 2, Low: 3 };
      return (o[a.priority] ?? 9) - (o[b.priority] ?? 9);
    });

    // Gantt: compute date range across all items
    const allDates = actionItems.flatMap(i => [i.tl.start, i.tl.end].filter(Boolean)).map(d => new Date(d));
    const ganttMin = allDates.length ? new Date(Math.min(...allDates)) : null;
    const ganttMax = allDates.length ? new Date(Math.max(...allDates)) : null;
    const ganttSpan = ganttMin && ganttMax ? ganttMax - ganttMin : 0;
    const ganttItems = actionItems.filter(i => i.tl.start && i.tl.end && new Date(i.tl.end) > new Date(i.tl.start));

    const gapItems = allSubs.filter(s => scores[s.id] && scores[s.id] < 4).map(s => {
      const cap = CAPABILITIES.find(c => c.subcapabilities.find(x => x.id === s.id));
      return { ...s, capColor: cap.color, capIcon: cap.icon, gap: 4 - scores[s.id] };
    }).sort((a, b) => b.gap - a.gap);

    return (
      <div>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32, flexWrap: "wrap", gap: 16 }}>
          <div>
            <div style={{ fontSize: 11, fontFamily: "monospace", color: "#64748b", letterSpacing: "0.12em", marginBottom: 6 }}>OD ASSESSMENT REPORT</div>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: "#f1f5f9", marginBottom: 4 }}>{org.name || "Organisation"}</h1>
            <div style={{ fontSize: 13, color: "#64748b", fontFamily: "monospace" }}>Assessed by {org.assessor || "—"} · {org.date}</div>
            {org.notes && <div style={{ fontSize: 13, color: "#4b5563", marginTop: 6, maxWidth: 600 }}>Context: {org.notes}</div>}
          </div>
          <button onClick={() => window.print()} style={{ padding: "12px 24px", background: "#0d1b2e", border: "1.5px solid #1e3a5f", borderRadius: 10, color: "#63cab7", fontFamily: "monospace", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>
            ⬇ PRINT REPORT
          </button>
        </div>

        {/* KPI row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 28 }}>
          {[
            { val: overallAvg ? overallAvg.toFixed(2) : "—", label: "OVERALL AVERAGE", color: overallAvg ? LEVEL_COLORS[Math.round(overallAvg)] : "#374151" },
            { val: `${totalRated}/${totalSubs}`, label: "SUB-CAPS RATED", color: "#0ea5e9" },
            { val: criticalItems.length, label: "CRITICAL ITEMS", color: "#ef4444" },
            { val: actionItems.length, label: "ACTION ITEMS", color: "#63cab7" },
          ].map(k => (
            <div key={k.label} style={{ background: "#0d1b2e", border: "1px solid #1e2d45", borderRadius: 12, padding: "20px 22px" }}>
              <div style={{ fontSize: 32, fontWeight: 800, fontFamily: "monospace", color: k.color }}>{k.val}</div>
              <div style={{ fontSize: 10, color: "#64748b", fontFamily: "monospace", letterSpacing: "0.12em", marginTop: 4 }}>{k.label}</div>
            </div>
          ))}
        </div>

        {/* Radar + Scores */}
        <div style={{ display: "flex", gap: 20, marginBottom: 28, flexWrap: "wrap" }}>
          <div style={{ background: "#0d1b2e", border: "1px solid #1e2d45", borderRadius: 14, padding: 24, flexShrink: 0 }}>
            <div style={{ fontSize: 11, fontFamily: "monospace", color: "#64748b", letterSpacing: "0.1em", marginBottom: 16 }}>CAPABILITY RADAR</div>
            <RadarChart scores={scores} size={240} />
            <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 12px", marginTop: 12 }}>
              {CAPABILITIES.map(c => (
                <div key={c.id} style={{ fontSize: 9, color: "#4b5563", fontFamily: "monospace", display: "flex", gap: 4 }}>
                  <span>{c.icon}</span>{c.id}. {c.name.split(" ")[0]}
                </div>
              ))}
            </div>
          </div>

          <div style={{ flex: 1, minWidth: 280, background: "#0d1b2e", border: "1px solid #1e2d45", borderRadius: 14, padding: 24 }}>
            <div style={{ fontSize: 11, fontFamily: "monospace", color: "#64748b", letterSpacing: "0.1em", marginBottom: 20 }}>CAPABILITY SCORES</div>
            {CAPABILITIES.map((cap, i) => {
              const st = capStats[i];
              return (
                <div key={cap.id} style={{ marginBottom: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <span style={{ fontSize: 13 }}>{cap.icon}</span>
                      <span style={{ fontSize: 12, color: "#94a3b8" }}>{cap.name}</span>
                    </div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <span style={{ fontSize: 10, color: "#374151", fontFamily: "monospace" }}>{st.rated}/{st.total}</span>
                      {st.avg && <span style={{ fontSize: 13, fontFamily: "monospace", fontWeight: 800, color: LEVEL_COLORS[Math.round(st.avg)] }}>{st.avg.toFixed(1)}</span>}
                    </div>
                  </div>
                  <div style={{ height: 6, borderRadius: 3, background: "#1e2d45", overflow: "hidden" }}>
                    <div style={{ width: st.avg ? `${(st.avg / 4) * 100}%` : "0%", height: "100%", background: st.avg ? LEVEL_COLORS[Math.round(st.avg)] : "#374151", borderRadius: 3, transition: "width 0.5s" }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Strengths & Gaps */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 28 }}>
          <div style={{ background: "#0d1b2e", border: "1px solid #052e16", borderRadius: 14, padding: 24 }}>
            <div style={{ fontSize: 11, fontFamily: "monospace", color: "#22c55e", letterSpacing: "0.1em", marginBottom: 16 }}>✓ STRENGTHS (Level 3–4)</div>
            {allSubs.filter(s => scores[s.id] >= 3).slice(0, 8).map(s => {
              const cap = CAPABILITIES.find(c => c.subcapabilities.find(x => x.id === s.id));
              return (
                <div key={s.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, padding: "8px 12px", background: "#060c18", borderRadius: 8 }}>
                  <div style={{ fontSize: 12, color: "#94a3b8" }}><span style={{ marginRight: 6 }}>{cap.icon}</span>{s.name}</div>
                  <LevelPill level={scores[s.id]} size="sm" />
                </div>
              );
            })}
            {allSubs.filter(s => scores[s.id] >= 3).length === 0 && <div style={{ fontSize: 13, color: "#374151" }}>No Level 3–4 scores yet. Complete the assessment.</div>}
          </div>
          <div style={{ background: "#0d1b2e", border: "1px solid #7f1d1d", borderRadius: 14, padding: 24 }}>
            <div style={{ fontSize: 11, fontFamily: "monospace", color: "#ef4444", letterSpacing: "0.1em", marginBottom: 16 }}>⚠ TOP GAPS (Level 1–2)</div>
            {gapItems.slice(0, 8).map(s => (
              <div key={s.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, padding: "8px 12px", background: "#060c18", borderRadius: 8 }}>
                <div style={{ fontSize: 12, color: "#94a3b8" }}><span style={{ marginRight: 6 }}>{s.capIcon}</span>{s.name}</div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <LevelPill level={scores[s.id]} size="sm" />
                  <span style={{ fontSize: 10, color: "#ef4444", fontFamily: "monospace" }}>gap {s.gap}</span>
                </div>
              </div>
            ))}
            {gapItems.length === 0 && <div style={{ fontSize: 13, color: "#374151" }}>No gaps identified yet.</div>}
          </div>
        </div>

        {/* ── GANTT CHART ── */}
        {ganttItems.length > 0 && (
          <div style={{ background: "#0d1b2e", border: "1px solid #1e3a5f", borderRadius: 14, padding: 24, marginBottom: 28 }}>
            <div style={{ fontSize: 11, fontFamily: "monospace", color: "#0ea5e9", letterSpacing: "0.1em", marginBottom: 20 }}>📅 IMPLEMENTATION TIMELINE — GANTT VIEW</div>
            {/* Month headers */}
            {(() => {
              const months = [];
              const cur = new Date(ganttMin);
              cur.setDate(1);
              while (cur <= ganttMax) {
                months.push(new Date(cur));
                cur.setMonth(cur.getMonth() + 1);
              }
              return (
                <div>
                  <div style={{ display: "flex", marginBottom: 8, marginLeft: 200 }}>
                    {months.map((m, i) => (
                      <div key={i} style={{ flex: 1, minWidth: 0, fontSize: 9, fontFamily: "monospace", color: "#374151", borderLeft: "1px solid #1e2d45", paddingLeft: 4 }}>
                        {m.toLocaleDateString("en-IN", { month: "short", year: "2-digit" })}
                      </div>
                    ))}
                  </div>
                  {ganttItems.map((item, idx) => {
                    const s = new Date(item.tl.start);
                    const e = new Date(item.tl.end);
                    const leftPct = ((s - ganttMin) / ganttSpan) * 100;
                    const widthPct = Math.max(((e - s) / ganttSpan) * 100, 1.5);
                    const pc = item.priority ? PRIORITY_CONFIG[item.priority] : null;
                    const barColor = pc ? pc.color : item.capColor;
                    const days = Math.round((e - s) / 86400000);
                    const dur = days < 14 ? `${days}d` : days < 90 ? `${Math.round(days / 7)}w` : `${Math.round(days / 30)}mo`;
                    return (
                      <div key={item.id} style={{ display: "flex", alignItems: "center", marginBottom: 8, gap: 0 }}>
                        <div style={{ width: 200, flexShrink: 0, paddingRight: 12, display: "flex", alignItems: "center", gap: 6, overflow: "hidden" }}>
                          <span style={{ fontSize: 12, flexShrink: 0 }}>{item.capIcon}</span>
                          <div style={{ overflow: "hidden" }}>
                            <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600, whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>{item.name}</div>
                            {item.tl.owner && <div style={{ fontSize: 9, color: "#374151", fontFamily: "monospace", whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>👤 {item.tl.owner}</div>}
                          </div>
                        </div>
                        <div style={{ flex: 1, position: "relative", height: 28, background: "#060c18", borderRadius: 4, overflow: "hidden", border: "1px solid #111827" }}>
                          <div style={{
                            position: "absolute", top: 4, height: 20, left: `${leftPct}%`, width: `${widthPct}%`,
                            background: barColor + "33", border: `1.5px solid ${barColor}88`, borderRadius: 4,
                            display: "flex", alignItems: "center", paddingLeft: 6, overflow: "hidden", minWidth: 8,
                            transition: "all 0.3s"
                          }}>
                            <span style={{ fontSize: 9, fontFamily: "monospace", color: barColor, whiteSpace: "nowrap", fontWeight: 700 }}>{dur}</span>
                          </div>
                          {months.map((m, i) => (
                            <div key={i} style={{ position: "absolute", top: 0, bottom: 0, left: `${((m - ganttMin) / ganttSpan) * 100}%`, width: 1, background: "#1e2d4588" }} />
                          ))}
                        </div>
                      </div>
                    );
                  })}
                  {/* Legend */}
                  <div style={{ display: "flex", gap: 16, marginTop: 16, marginLeft: 200, flexWrap: "wrap" }}>
                    {Object.entries(PRIORITY_CONFIG).map(([p, cfg]) => (
                      <div key={p} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 10, fontFamily: "monospace", color: "#4b5563" }}>
                        <div style={{ width: 16, height: 8, borderRadius: 2, background: cfg.color + "33", border: `1.5px solid ${cfg.color}88` }} />
                        {p}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* Action Plan Table */}
        {actionItems.length > 0 && (
          <div style={{ background: "#0d1b2e", border: "1px solid #1e2d45", borderRadius: 14, padding: 24, marginBottom: 28 }}>
            <div style={{ fontSize: 11, fontFamily: "monospace", color: "#64748b", letterSpacing: "0.1em", marginBottom: 20 }}>CONSOLIDATED ACTION PLAN — {actionItems.length} ITEMS</div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid #1e2d45" }}>
                    {["#", "Capability", "Sub-Capability", "Current", "Target", "Gap", "Priority", "Owner", "Start", "End", "Duration", "Resources Needed", "Milestones & Activities"].map(h => (
                      <th key={h} style={{ padding: "8px 14px", textAlign: "left", fontSize: 10, fontFamily: "monospace", color: "#4b5563", fontWeight: 700, letterSpacing: "0.08em", whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {actionItems.map((item, i) => {
                    const pc = item.priority ? PRIORITY_CONFIG[item.priority] : null;
                    const gap = item.current && item.target ? item.target - item.current : null;
                    const tl = item.tl;
                    const dur = tl.start && tl.end ? (() => {
                      const days = Math.round((new Date(tl.end) - new Date(tl.start)) / 86400000);
                      if (days <= 0) return <span style={{ color: "#ef4444", fontSize: 11 }}>⚠</span>;
                      const label = days < 14 ? `${days}d` : days < 90 ? `${Math.round(days / 7)}w` : `${Math.round(days / 30)}mo`;
                      const col = days < 30 ? "#22c55e" : days < 90 ? "#eab308" : days < 180 ? "#f97316" : "#ef4444";
                      return <span style={{ fontFamily: "monospace", fontSize: 11, color: col, fontWeight: 700 }}>{label}</span>;
                    })() : <span style={{ color: "#374151" }}>—</span>;
                    return (
                      <tr key={item.id} style={{ borderBottom: "1px solid #111827", background: i % 2 === 0 ? "#060c1844" : "transparent" }}>
                        <td style={{ padding: "10px 14px", color: "#374151", fontFamily: "monospace", fontSize: 11 }}>{i + 1}</td>
                        <td style={{ padding: "10px 14px", whiteSpace: "nowrap" }}>
                          <span style={{ color: item.capColor, marginRight: 6 }}>{item.capIcon}</span>
                          <span style={{ fontSize: 11, color: "#64748b" }}>{item.capName.split(" ")[0]}</span>
                        </td>
                        <td style={{ padding: "10px 14px", color: "#cbd5e1", fontWeight: 600, whiteSpace: "nowrap" }}>
                          {item.name}
                          {item.dei && <span style={{ marginLeft: 6, background: "#052e1633", border: "1px solid #22c55e44", color: "#22c55e", borderRadius: 3, padding: "1px 5px", fontSize: 9, fontFamily: "monospace" }}>DEI</span>}
                        </td>
                        <td style={{ padding: "10px 14px" }}><LevelPill level={item.current} size="sm" /></td>
                        <td style={{ padding: "10px 14px" }}><LevelPill level={item.target} size="sm" /></td>
                        <td style={{ padding: "10px 14px", fontFamily: "monospace", fontSize: 12, color: gap > 0 ? "#22c55e" : gap < 0 ? "#ef4444" : "#374151" }}>
                          {gap !== null ? (gap > 0 ? `+${gap}` : gap) : "—"}
                        </td>
                        <td style={{ padding: "10px 14px", whiteSpace: "nowrap" }}>
                          {pc && <span style={{ color: pc.color, fontFamily: "monospace", fontSize: 11, fontWeight: 700 }}>{pc.icon} {item.priority}</span>}
                        </td>
                        <td style={{ padding: "10px 14px", fontSize: 12, color: "#64748b", whiteSpace: "nowrap", fontFamily: "monospace" }}>{tl.owner || "—"}</td>
                        <td style={{ padding: "10px 14px", fontSize: 11, color: "#64748b", whiteSpace: "nowrap", fontFamily: "monospace" }}>{tl.start ? new Date(tl.start).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "2-digit" }) : "—"}</td>
                        <td style={{ padding: "10px 14px", fontSize: 11, color: "#64748b", whiteSpace: "nowrap", fontFamily: "monospace" }}>{tl.end ? new Date(tl.end).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "2-digit" }) : "—"}</td>
                        <td style={{ padding: "10px 14px" }}>{dur}</td>
                        <td style={{ padding: "10px 14px", fontSize: 12, minWidth: 200, maxWidth: 260 }}>
                          {item.res ? (
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                              {item.res.split(/[·•,\n]/).map(t => t.trim()).filter(Boolean).map((tag, i) => (
                                <span key={i} style={{ fontSize: 10, background: "#a78bfa18", border: "1px solid #a78bfa44", color: "#a78bfa", borderRadius: 5, padding: "2px 7px", fontFamily: "monospace" }}>{tag}</span>
                              ))}
                            </div>
                          ) : <span style={{ color: "#1e2d45" }}>—</span>}
                        </td>
                        <td style={{ padding: "10px 14px", minWidth: 280 }}>
                          {item.milestones.length > 0 ? (
                            <div>
                              {item.milestones.map((m, mi) => {
                                const SC = { Pending: "#64748b", "In Progress": "#0ea5e9", Done: "#22c55e", Blocked: "#ef4444" };
                                const sc = SC[m.status] || "#64748b";
                                return (
                                  <div key={mi} style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: mi < item.milestones.length - 1 ? 8 : 0 }}>
                                    <div style={{ width: 18, height: 18, borderRadius: "50%", border: `2px solid ${sc}`, background: m.status === "Done" ? sc : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                                      {m.status === "Done" && <span style={{ color: "#000", fontSize: 9, fontWeight: 900 }}>✓</span>}
                                      {m.status === "Blocked" && <span style={{ color: sc, fontSize: 9 }}>!</span>}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                      <div style={{ fontSize: 12, color: m.status === "Done" ? "#4b5563" : "#cbd5e1", textDecoration: m.status === "Done" ? "line-through" : "none" }}>{m.activity || <span style={{ color: "#374151" }}>Untitled</span>}</div>
                                      <div style={{ display: "flex", gap: 8, marginTop: 2, flexWrap: "wrap" }}>
                                        {m.owner && <span style={{ fontSize: 9, color: "#4b5563", fontFamily: "monospace" }}>👤 {m.owner}</span>}
                                        {m.date && <span style={{ fontSize: 9, color: "#4b5563", fontFamily: "monospace" }}>📅 {new Date(m.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "2-digit" })}</span>}
                                        <span style={{ fontSize: 9, color: sc, fontFamily: "monospace", fontWeight: 700 }}>{m.status}</span>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                              {/* Mini progress bar */}
                              {(() => {
                                const done = item.milestones.filter(m => m.status === "Done").length;
                                const pct = Math.round((done / item.milestones.length) * 100);
                                return (
                                  <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 8 }}>
                                    <div style={{ flex: 1, height: 3, borderRadius: 2, background: "#1e2d45", overflow: "hidden" }}>
                                      <div style={{ width: `${pct}%`, height: "100%", background: "#22c55e", borderRadius: 2 }} />
                                    </div>
                                    <span style={{ fontSize: 9, fontFamily: "monospace", color: "#374151" }}>{done}/{item.milestones.length}</span>
                                  </div>
                                );
                              })()}
                            </div>
                          ) : <span style={{ color: "#1e2d45" }}>—</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {actionItems.length === 0 && (
          <div style={{ background: "#0d1b2e", border: "1px dashed #1e2d45", borderRadius: 14, padding: 40, textAlign: "center", marginBottom: 28 }}>
            <div style={{ fontSize: 24, marginBottom: 12 }}>📋</div>
            <div style={{ color: "#64748b", fontSize: 15 }}>No action plans written yet.</div>
            <button onClick={() => setStep("plan")} style={{ marginTop: 16, padding: "10px 24px", background: "#63cab7", color: "#0a0f1a", border: "none", borderRadius: 8, fontFamily: "monospace", fontWeight: 800, fontSize: 12, cursor: "pointer" }}>
              GO TO ACTION PLANNING →
            </button>
          </div>
        )}

        {/* Footer nav */}
        <div style={{ display: "flex", gap: 12, paddingBottom: 40 }}>
          <button onClick={() => setStep("plan")} style={{ padding: "10px 20px", background: "#1e2d45", border: "none", borderRadius: 8, color: "#94a3b8", fontFamily: "monospace", fontSize: 12, cursor: "pointer" }}>← EDIT PLAN</button>
          <button onClick={() => setStep("assess")} style={{ padding: "10px 20px", background: "#1e2d45", border: "none", borderRadius: 8, color: "#94a3b8", fontFamily: "monospace", fontSize: 12, cursor: "pointer" }}>← EDIT ASSESSMENT</button>
        </div>
      </div>
    );
  };

  /* ── MAIN RENDER ── */
  const navItems = [
    { id: "intro", label: "00", title: "About", icon: "🏠" },
    { id: "setup", label: "01", title: "Setup", icon: "⚙️" },
    { id: "assess", label: "02", title: "Assess", icon: "🎯" },
    { id: "plan", label: "03", title: "Plan", icon: "📋" },
    { id: "report", label: "04", title: "Report", icon: "📊" },
  ];

  const activeSub = showLevelGuide ? allSubs.find(s => s.id === showLevelGuide) : null;

  return (
    <div style={{ minHeight: "100vh", background: "#050c18", color: "#e2e8f0", fontFamily: "Georgia, serif", display: "flex" }}>
      {/* Level guide modal */}
      {activeSub && <LevelGuide sub={activeSub} onClose={() => setShowLevelGuide(null)} />}

      {/* Toast */}
      {toast && (
        <div style={{ position: "fixed", bottom: 32, right: 32, zIndex: 999, background: toast.type === "warn" ? "#7c2d12" : "#052e16", border: `1px solid ${toast.type === "warn" ? "#ea580c" : "#16a34a"}`, borderRadius: 10, padding: "14px 20px", fontSize: 13, color: toast.type === "warn" ? "#fed7aa" : "#bbf7d0", fontFamily: "monospace", boxShadow: "0 8px 32px #00000066" }}>
          {toast.msg}
        </div>
      )}

      {/* Sidebar */}
      <div style={{ width: 200, background: "#030b15", borderRight: "1px solid #0d1b2e", display: "flex", flexDirection: "column", padding: "28px 0", flexShrink: 0, position: "sticky", top: 0, height: "100vh" }}>
        <div style={{ padding: "0 20px 28px", borderBottom: "1px solid #0d1b2e", marginBottom: 20 }}>
          <div style={{ fontSize: 9, fontFamily: "monospace", letterSpacing: "0.2em", color: "#63cab7", marginBottom: 4 }}>APD · OD TOOL</div>
          <div style={{ fontSize: 16, fontWeight: 800, color: "#f1f5f9", lineHeight: 1.2 }}>Partner NGO<br />OD Planner</div>
        </div>
        {org.name && (
          <div style={{ padding: "0 20px 20px", borderBottom: "1px solid #0d1b2e", marginBottom: 16 }}>
            <div style={{ fontSize: 9, fontFamily: "monospace", color: "#374151", letterSpacing: "0.1em", marginBottom: 4 }}>CURRENT NGO</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#94a3b8", lineHeight: 1.3 }}>{org.name}</div>
          </div>
        )}
        {navItems.map(n => (
          <div key={n.id} onClick={() => setStep(n.id)}
            style={{ padding: "14px 20px", cursor: "pointer", borderLeft: `3px solid ${step === n.id ? "#63cab7" : "transparent"}`, background: step === n.id ? "#0d1b2e" : "transparent", transition: "all 0.15s" }}>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <span style={{ fontSize: 16 }}>{n.icon}</span>
              <div>
                <div style={{ fontSize: 9, fontFamily: "monospace", color: step === n.id ? "#63cab7" : "#374151", letterSpacing: "0.12em" }}>{n.label}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: step === n.id ? "#e2e8f0" : "#64748b" }}>{n.title}</div>
              </div>
            </div>
          </div>
        ))}

        {/* User + Logout */}
        <div style={{ marginTop: "auto", padding: "16px 20px", borderTop: "1px solid #0d1b2e" }}>
          <div style={{ fontSize: 9, fontFamily: "monospace", color: "#374151", letterSpacing: "0.1em", marginBottom: 8 }}>PROGRESS</div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, fontFamily: "monospace", color: "#4b5563", marginBottom: 6 }}>
            <span>Rated</span><span style={{ color: "#63cab7" }}>{totalRated}/{totalSubs}</span>
          </div>
          <div style={{ height: 4, borderRadius: 2, background: "#0d1b2e", overflow: "hidden", marginBottom: 12 }}>
            <div style={{ width: `${(totalRated / totalSubs) * 100}%`, height: "100%", background: "#63cab7", borderRadius: 2, transition: "width 0.4s" }} />
          </div>
          {overallAvg && (
            <div style={{ marginBottom: 12, fontSize: 11, fontFamily: "monospace", color: LEVEL_COLORS[Math.round(overallAvg)] }}>
              Avg: {overallAvg.toFixed(2)} · {LEVEL_NAMES[Math.round(overallAvg)]}
            </div>
          )}
          <div style={{ padding: "10px 12px", background: "#060c18", borderRadius: 8, border: "1px solid #1e2d45" }}>
            <div style={{ fontSize: 10, color: "#94a3b8", fontWeight: 600, marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{currentUser.orgName}</div>
            <div style={{ fontSize: 9, color: "#374151", fontFamily: "monospace", marginBottom: 8, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{currentUser.email}</div>
            <button onClick={onLogout} style={{ width: "100%", padding: "5px 0", background: "transparent", border: "1px solid #1e2d45", borderRadius: 6, color: "#4b5563", fontSize: 10, fontFamily: "monospace", cursor: "pointer", letterSpacing: "0.08em" }}>
              LOG OUT
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, overflowY: "auto", padding: step === "intro" ? "0" : "36px 44px" }}>
        {step === "intro" && <IntroPage />}
        {step === "setup" && <SetupPage />}
        {step === "assess" && <AssessPage />}
        {step === "plan" && <PlanPage />}
        {step === "report" && <ReportPage />}
      </div>
    </div>
  );
}
export default function App() {
  const [authStep, setAuthStep] = useState("login"); // login | register
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [form, setForm] = useState({ email: "", password: "", name: "", orgName: "", confirmPassword: "" });
  const [authError, setAuthError] = useState("");
  const [savedData, setSavedData] = useState(null);
  const [adminView, setAdminView] = useState(false);
  const [allOrgs, setAllOrgs] = useState([]);
  const [viewingOrg, setViewingOrg] = useState(null);

  // Check if already logged in
  useEffect(() => {
    (async () => {
      try {
        const sess = await window.storage.get("apd-session");
        if (sess) {
          const user = JSON.parse(sess.value);
          setCurrentUser(user);
          if (!user.isAdmin) await loadUserData(user.email);
        }
      } catch (e) {}
      setAuthLoading(false);
    })();
  }, []);

  const loadUserData = async (email) => {
    try {
      const d = await window.storage.get(`apd-data-${email}`);
      if (d) setSavedData(JSON.parse(d.value));
    } catch (e) { setSavedData(null); }
  };

  const loadAllOrgs = async () => {
    try {
      const keys = await window.storage.list("apd-user-");
      const orgs = await Promise.all(
        keys.keys.map(async k => {
          try {
            const u = await window.storage.get(k);
            if (!u) return null;
            const user = JSON.parse(u.value);
            let data = null;
            try {
              const d = await window.storage.get(`apd-data-${user.email}`);
              if (d) data = JSON.parse(d.value);
            } catch (e) {}
            const allSubs = CAPABILITIES.flatMap(c => c.subcapabilities);
            const rated = data ? allSubs.filter(s => data.scores?.[s.id]).length : 0;
            const vals = data ? allSubs.map(s => data.scores?.[s.id]).filter(Boolean) : [];
            const avgScore = vals.length ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1) : null;
            return { ...user, data, rated, totalSubs: allSubs.length, avgScore };
          } catch (e) { return null; }
        })
      );
      setAllOrgs(orgs.filter(Boolean));
    } catch (e) { setAllOrgs([]); }
  };

  const handleLogin = async () => {
    setAuthError("");
    const { email, password } = form;
    if (!email || !password) { setAuthError("Please fill in all fields."); return; }

    // Check APD admin
    if (email.toLowerCase() === APD_ADMIN.email && simpleHash(password) === APD_ADMIN.passwordHash) {
      await window.storage.set("apd-session", JSON.stringify(APD_ADMIN));
      setCurrentUser(APD_ADMIN);
      return;
    }

    // Check registered users
    try {
      const u = await window.storage.get(`apd-user-${email.toLowerCase()}`);
      if (!u) { setAuthError("No account found with this email."); return; }
      const user = JSON.parse(u.value);
      if (user.passwordHash !== simpleHash(password)) { setAuthError("Incorrect password."); return; }
      await window.storage.set("apd-session", JSON.stringify(user));
      setCurrentUser(user);
      await loadUserData(email.toLowerCase());
    } catch (e) { setAuthError("Login failed. Please try again."); }
  };

  const handleRegister = async () => {
    setAuthError("");
    const { email, password, confirmPassword, name, orgName } = form;
    if (!email || !password || !name || !orgName) { setAuthError("Please fill in all fields."); return; }
    if (password !== confirmPassword) { setAuthError("Passwords do not match."); return; }
    if (password.length < 6) { setAuthError("Password must be at least 6 characters."); return; }
    const emailKey = email.toLowerCase();
    try {
      try {
        const existing = await window.storage.get(`apd-user-${emailKey}`);
        if (existing) { setAuthError("An account with this email already exists."); return; }
      } catch (e) {}
      const user = { email: emailKey, passwordHash: simpleHash(password), name, orgName, isAdmin: false };
      await window.storage.set(`apd-user-${emailKey}`, JSON.stringify(user));
      await window.storage.set("apd-session", JSON.stringify(user));
      setCurrentUser(user);
      setSavedData(null);
    } catch (e) { setAuthError("Registration failed. Please try again."); }
  };

  const handleLogout = async () => {
    try { await window.storage.delete("apd-session"); } catch (e) {}
    setCurrentUser(null);
    setSavedData(null);
    setAdminView(false);
    setViewingOrg(null);
    setForm({ email: "", password: "", name: "", orgName: "", confirmPassword: "" });
  };

  const handleSaveData = async (data) => {
    if (!currentUser || currentUser.isAdmin) return;
    try { await window.storage.set(`apd-data-${currentUser.email}`, JSON.stringify(data)); } catch (e) {}
  };

  const inputStyle = { width: "100%", background: "#060c18", border: "1px solid #1e2d45", borderRadius: 10, padding: "13px 16px", color: "#e2e8f0", fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "Georgia, serif" };
  const labelStyle = { display: "block", fontSize: 10, fontFamily: "monospace", color: "#4b5563", letterSpacing: "0.12em", marginBottom: 8 };

  if (authLoading) return (
    <div style={{ minHeight: "100vh", background: "#030b14", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>♿</div>
        <div style={{ fontSize: 12, fontFamily: "monospace", color: "#374151", letterSpacing: "0.1em" }}>LOADING...</div>
      </div>
    </div>
  );

  // ── ADMIN DASHBOARD ──
  if (currentUser?.isAdmin) {
    if (viewingOrg) {
      return (
        <div style={{ minHeight: "100vh", background: "#030b14" }}>
          <div style={{ padding: "14px 28px", background: "#0d1b2e", borderBottom: "1px solid #1e2d45", display: "flex", alignItems: "center", gap: 16 }}>
            <button onClick={() => setViewingOrg(null)} style={{ padding: "6px 14px", background: "transparent", border: "1px solid #1e2d45", borderRadius: 6, color: "#64748b", fontSize: 11, fontFamily: "monospace", cursor: "pointer" }}>← BACK</button>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#e2e8f0" }}>Viewing: {viewingOrg.orgName}</div>
            <div style={{ fontSize: 11, color: "#374151", fontFamily: "monospace" }}>{viewingOrg.email}</div>
          </div>
          <SmartODTool currentUser={viewingOrg} onLogout={() => setViewingOrg(null)} savedData={viewingOrg.data} onSaveData={() => {}} />
        </div>
      );
    }
    return (
      <div style={{ minHeight: "100vh", background: "#030b14", fontFamily: "Georgia, serif" }}>
        {/* Admin header */}
        <div style={{ padding: "18px 40px", background: "#0d1b2e", borderBottom: "1px solid #1e2d45", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg, #63cab7, #0ea5e9)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>♿</div>
            <div>
              <div style={{ fontSize: 9, fontFamily: "monospace", color: "#63cab7", letterSpacing: "0.2em" }}>APD · OD TOOL</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: "#f1f5f9" }}>Admin Dashboard</div>
            </div>
          </div>
          <button onClick={handleLogout} style={{ padding: "8px 18px", background: "transparent", border: "1px solid #1e2d45", borderRadius: 8, color: "#64748b", fontSize: 11, fontFamily: "monospace", cursor: "pointer" }}>LOG OUT</button>
        </div>

        <div style={{ padding: "40px", maxWidth: 960, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
            <div>
              <div style={{ fontSize: 11, fontFamily: "monospace", color: "#374151", letterSpacing: "0.12em", marginBottom: 4 }}>PARTNER NGO OVERVIEW</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: "#f1f5f9" }}>All Organisations</div>
            </div>
            <button onClick={loadAllOrgs} style={{ padding: "10px 20px", background: "#63cab7", color: "#030b14", border: "none", borderRadius: 8, fontFamily: "monospace", fontWeight: 800, fontSize: 12, cursor: "pointer" }}>
              ↻ REFRESH
            </button>
          </div>

          {allOrgs.length === 0 && (
            <div style={{ background: "#0d1b2e", border: "1px dashed #1e2d45", borderRadius: 14, padding: 48, textAlign: "center" }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>🏢</div>
              <div style={{ color: "#374151", fontSize: 15, marginBottom: 16 }}>No partner NGOs registered yet.</div>
              <button onClick={loadAllOrgs} style={{ padding: "10px 24px", background: "#63cab7", color: "#030b14", border: "none", borderRadius: 8, fontFamily: "monospace", fontWeight: 800, fontSize: 12, cursor: "pointer" }}>LOAD ORGANISATIONS</button>
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
            {allOrgs.map(org => {
              const pct = org.totalSubs ? Math.round((org.rated / org.totalSubs) * 100) : 0;
              const avgColor = org.avgScore ? LEVEL_COLORS[Math.round(parseFloat(org.avgScore))] : "#374151";
              return (
                <div key={org.email} style={{ background: "#0d1b2e", border: "1px solid #1e2d45", borderRadius: 14, padding: 22, cursor: "pointer", transition: "border-color 0.15s" }}
                  onClick={() => setViewingOrg(org)}
                  onMouseEnter={e => e.currentTarget.style.borderColor = "#63cab7"}
                  onMouseLeave={e => e.currentTarget.style.borderColor = "#1e2d45"}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: "#e2e8f0", marginBottom: 4 }}>{org.orgName}</div>
                      <div style={{ fontSize: 11, color: "#374151", fontFamily: "monospace" }}>{org.email}</div>
                    </div>
                    {org.avgScore && <span style={{ fontSize: 18, fontWeight: 800, fontFamily: "monospace", color: avgColor }}>{org.avgScore}</span>}
                  </div>
                  <div style={{ marginBottom: 10 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, fontFamily: "monospace", color: "#374151", marginBottom: 5 }}>
                      <span>Assessment Progress</span><span>{org.rated}/{org.totalSubs} rated</span>
                    </div>
                    <div style={{ height: 5, borderRadius: 3, background: "#060c18", overflow: "hidden" }}>
                      <div style={{ width: `${pct}%`, height: "100%", background: pct === 100 ? "#22c55e" : pct > 50 ? "#eab308" : "#63cab7", borderRadius: 3, transition: "width 0.4s" }} />
                    </div>
                  </div>
                  <div style={{ fontSize: 10, color: "#63cab7", fontFamily: "monospace", fontWeight: 700 }}>VIEW ASSESSMENT →</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ── AUTH SCREENS ──
  if (!currentUser) return (
    <div style={{ minHeight: "100vh", background: "#030b14", display: "flex", fontFamily: "Georgia, serif" }}>
      {/* Left panel — branding */}
      <div style={{ flex: 1, background: "#050c18", borderRight: "1px solid #0d1b2e", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "60px 10%", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "20%", left: "10%", width: 240, height: 240, borderRadius: "50%", background: "radial-gradient(circle, #63cab720, transparent 70%)", filter: "blur(40px)" }} />
        <div style={{ position: "absolute", bottom: "15%", right: "5%", width: 200, height: 200, borderRadius: "50%", background: "radial-gradient(circle, #6366f120, transparent 70%)", filter: "blur(40px)" }} />
        <div style={{ position: "relative", textAlign: "center", maxWidth: 380 }}>
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: "linear-gradient(135deg, #63cab7, #0ea5e9)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, margin: "0 auto 24px" }}>♿</div>
          <div style={{ fontSize: 10, fontFamily: "monospace", color: "#63cab7", letterSpacing: "0.2em", marginBottom: 12 }}>ASSOCIATION OF PEOPLE WITH DISABILITY</div>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: "#f1f5f9", lineHeight: 1.2, letterSpacing: "-0.02em", marginBottom: 16 }}>Partner NGO<br /><span style={{ background: "linear-gradient(135deg, #63cab7, #0ea5e9)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>OD Assessment Tool</span></h1>
          <p style={{ color: "#374151", fontSize: 13, lineHeight: 1.8 }}>A structured platform for APD's partner organisations to assess capabilities, identify gaps, and build inclusive development plans.</p>
          <div style={{ marginTop: 36, display: "flex", flexDirection: "column", gap: 10 }}>
            {["13 Organisational Capabilities", "4-Level Maturity Scale", "Milestone-Based Action Planning", "DEI Integration", "Gantt Timeline & Reports"].map(f => (
              <div key={f} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 12, color: "#4b5563" }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#63cab7", flexShrink: 0 }} />{f}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div style={{ width: 420, display: "flex", flexDirection: "column", justifyContent: "center", padding: "60px 48px" }}>
        <div style={{ marginBottom: 36 }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: "#f1f5f9", marginBottom: 6 }}>
            {authStep === "login" ? "Welcome back" : "Create your account"}
          </div>
          <div style={{ fontSize: 13, color: "#374151" }}>
            {authStep === "login" ? "Sign in to continue your OD assessment." : "Register your NGO to get started."}
          </div>
        </div>

        {authError && (
          <div style={{ background: "#7f1d1d33", border: "1px solid #ef444444", borderRadius: 8, padding: "10px 14px", fontSize: 12, color: "#fca5a5", fontFamily: "monospace", marginBottom: 20 }}>
            {authError}
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {authStep === "register" && (
            <>
              <div>
                <label style={labelStyle}>YOUR NAME</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Priya Rajan" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>ORGANISATION NAME</label>
                <input value={form.orgName} onChange={e => setForm(f => ({ ...f, orgName: e.target.value }))} placeholder="e.g. Vikalp Trust" style={inputStyle} />
              </div>
            </>
          )}
          <div>
            <label style={labelStyle}>EMAIL ADDRESS</label>
            <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="you@ngo.org" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>PASSWORD</label>
            <input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              onKeyDown={e => e.key === "Enter" && authStep === "login" && handleLogin()}
              placeholder={authStep === "register" ? "Min. 6 characters" : "••••••••"} style={inputStyle} />
          </div>
          {authStep === "register" && (
            <div>
              <label style={labelStyle}>CONFIRM PASSWORD</label>
              <input type="password" value={form.confirmPassword} onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))} placeholder="••••••••" style={inputStyle} />
            </div>
          )}

          <button onClick={authStep === "login" ? handleLogin : handleRegister}
            style={{ padding: "14px", background: "linear-gradient(135deg, #63cab7, #0ea5e9)", border: "none", borderRadius: 10, color: "#030b14", fontFamily: "monospace", fontWeight: 900, fontSize: 13, letterSpacing: "0.1em", cursor: "pointer", marginTop: 4 }}>
            {authStep === "login" ? "SIGN IN →" : "CREATE ACCOUNT →"}
          </button>
        </div>

        <div style={{ marginTop: 28, textAlign: "center", fontSize: 13, color: "#374151" }}>
          {authStep === "login" ? (
            <>New to the platform?{" "}
              <span onClick={() => { setAuthStep("register"); setAuthError(""); }} style={{ color: "#63cab7", cursor: "pointer", fontWeight: 700 }}>Create an account</span>
            </>
          ) : (
            <>Already registered?{" "}
              <span onClick={() => { setAuthStep("login"); setAuthError(""); }} style={{ color: "#63cab7", cursor: "pointer", fontWeight: 700 }}>Sign in</span>
            </>
          )}
        </div>

        <div style={{ marginTop: 36, padding: "12px 16px", background: "#060c18", borderRadius: 8, border: "1px solid #0d1b2e" }}>
          <div style={{ fontSize: 9, fontFamily: "monospace", color: "#1e2d45", letterSpacing: "0.12em", marginBottom: 6 }}>APD ADMIN ACCESS</div>
          <div style={{ fontSize: 11, color: "#1e2d45" }}>admin@apd.org · contact APD for credentials</div>
        </div>
      </div>
    </div>
  );

  // ── MAIN TOOL ──
  return <SmartODTool currentUser={currentUser} onLogout={handleLogout} savedData={savedData} onSaveData={handleSaveData} />;
}
