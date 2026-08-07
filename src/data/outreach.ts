export type Stage =
  | "discovered"
  | "researching"
  | "ready"
  | "contacted"
  | "replied"
  | "referral"
  | "interview";

export const STAGES: { id: Stage; label: string }[] = [
  { id: "discovered", label: "Discovered" },
  { id: "researching", label: "Researching" },
  { id: "ready", label: "Ready" },
  { id: "contacted", label: "Contacted" },
  { id: "replied", label: "Replied" },
  { id: "referral", label: "Referral" },
  { id: "interview", label: "Interview" },
];

export type Campaign = {
  id: string;
  name: string;
  company: string;
  role: string;
  location: string;
  candidates: number;
  contacted: number;
  replies: number;
  referrals: number;
  status: "active" | "paused" | "completed";
  createdAt: string;
};

export const campaigns: Campaign[] = [
  {
    id: "rbc-swe",
    name: "RBC SWE Internship",
    company: "RBC",
    role: "Software Engineer Intern",
    location: "Toronto, ON",
    candidates: 50,
    contacted: 32,
    replies: 8,
    referrals: 5,
    status: "active",
    createdAt: "Jul 28, 2026",
  },
  {
    id: "shopify-backend",
    name: "Shopify Backend Intern",
    company: "Shopify",
    role: "Backend Developer Intern",
    location: "Remote, Canada",
    candidates: 38,
    contacted: 21,
    replies: 6,
    referrals: 3,
    status: "active",
    createdAt: "Aug 1, 2026",
  },
  {
    id: "td-data",
    name: "TD Data Science Co-op",
    company: "TD Bank",
    role: "Data Science Co-op",
    location: "Toronto, ON",
    candidates: 27,
    contacted: 18,
    replies: 4,
    referrals: 2,
    status: "active",
    createdAt: "Aug 3, 2026",
  },
  {
    id: "nvidia-ml",
    name: "NVIDIA ML Intern",
    company: "NVIDIA",
    role: "Machine Learning Intern",
    location: "Santa Clara, CA",
    candidates: 22,
    contacted: 9,
    replies: 2,
    referrals: 0,
    status: "paused",
    createdAt: "Jul 12, 2026",
  },
];

export type Candidate = {
  id: string;
  name: string;
  role: string;
  company: string;
  location: string;
  matchScore: number;
  stage: Stage;
  campaignId: string;
  education: string;
  gradYear: string;
  skills: string[];
  experience: { title: string; org: string; period: string }[];
  reasons: string[];
  lastContacted: string | null;
  nextAction: string;
  research: string;
  angle: string;
  message: string;
  linkedin: string;
};

export const candidates: Candidate[] = [
  {
    id: "sarah-chen",
    name: "Sarah Chen",
    role: "Software Engineer",
    company: "RBC",
    location: "Toronto, ON",
    matchScore: 94,
    stage: "ready",
    campaignId: "rbc-swe",
    education: "Ontario Tech University — BSc Computer Science",
    gradYear: "Class of 2021",
    skills: ["Java", "Spring Boot", "Kubernetes", "Payments", "React"],
    experience: [
      { title: "Software Engineer II", org: "RBC", period: "2023 — Present" },
      { title: "Software Engineer", org: "RBC", period: "2021 — 2023" },
      { title: "SWE Intern", org: "Manulife", period: "Summer 2020" },
    ],
    reasons: ["Same university — Ontario Tech", "Same city — Toronto", "Similar career path"],
    lastContacted: null,
    nextAction: "Send intro message",
    research:
      "Sarah joined RBC directly out of Ontario Tech's co-op stream and has spent four years on the Digital Payments platform team. She mentors two interns each summer and has spoken twice at RBC's internal 'New Grad Path' sessions. Recent activity suggests she's actively involved in early-talent hiring for the 2027 intern cohort.",
    angle:
      "Ask about transitioning from university into RBC software engineering — she went through the same co-op pipeline and now mentors interns on the payments team.",
    message:
      "Hi Sarah,\n\nI'm a third-year Computer Science student at Ontario Tech, and I came across your profile while looking into the payments engineering work at RBC. It's genuinely encouraging to see someone go from the same co-op stream into a platform team like yours.\n\nI'm applying to RBC's SWE internship for Summer 2027, and I'd love to hear how you found the transition from school into the team — especially what actually mattered in your first year.\n\nWould you be open to a 15-minute chat in the next couple of weeks? Happy to work around your schedule.\n\nThanks,\nAlex",
    linkedin: "https://www.linkedin.com/in/sarah-chen-example",
  },
  {
    id: "marcus-oduya",
    name: "Marcus Oduya",
    role: "Senior Software Engineer",
    company: "RBC",
    location: "Toronto, ON",
    matchScore: 88,
    stage: "contacted",
    campaignId: "rbc-swe",
    education: "University of Waterloo — BASc Software Engineering",
    gradYear: "Class of 2018",
    skills: ["Go", "Terraform", "AWS", "Distributed Systems"],
    experience: [
      { title: "Senior Software Engineer", org: "RBC", period: "2022 — Present" },
      { title: "Software Engineer", org: "Wealthsimple", period: "2018 — 2022" },
    ],
    reasons: ["Same city — Toronto", "Hiring manager for intern cohort", "Fintech background"],
    lastContacted: "Aug 4, 2026",
    nextAction: "Follow up in 3 days",
    research:
      "Marcus leads the cloud platform pod at RBC and has posted twice this quarter about intern hiring. He responds most often to short, specific messages that reference his infrastructure work.",
    angle:
      "Reference his recent post on internal developer platforms and ask what infrastructure fundamentals matter most for incoming interns.",
    message:
      "Hi Marcus,\n\nYour post on RBC's internal developer platform stuck with me — I've been building a small Terraform-managed deploy pipeline for a school project and hit a lot of the same tradeoffs you described.\n\nI'm applying to RBC's SWE internship and would love to know which infrastructure fundamentals you'd expect an intern to be comfortable with.\n\nThanks for any pointers,\nAlex",
    linkedin: "https://www.linkedin.com/in/marcus-oduya-example",
  },
  {
    id: "priya-raman",
    name: "Priya Raman",
    role: "Engineering Manager",
    company: "Shopify",
    location: "Ottawa, ON",
    matchScore: 91,
    stage: "replied",
    campaignId: "shopify-backend",
    education: "Ontario Tech University — BSc Computer Science",
    gradYear: "Class of 2016",
    skills: ["Ruby", "GraphQL", "Team Leadership", "Mentorship"],
    experience: [
      { title: "Engineering Manager", org: "Shopify", period: "2023 — Present" },
      { title: "Staff Engineer", org: "Shopify", period: "2019 — 2023" },
    ],
    reasons: ["Same university — Ontario Tech", "Manages intern cohort", "Alumni mentor"],
    lastContacted: "Aug 2, 2026",
    nextAction: "Reply — schedule call",
    research:
      "Priya is an active Ontario Tech alumni mentor and manages the merchant services backend team, which takes 4 interns per cycle.",
    angle: "Lead with the Ontario Tech alumni connection and her mentorship program involvement.",
    message:
      "Hi Priya,\n\nFellow Ontario Tech CS grad here (well, almost — class of 2027). I saw you mentor through the alumni program and wanted to reach out about Shopify's backend internship.\n\nWould you have 15 minutes to share what a strong intern application looks like on your team?\n\nThanks,\nAlex",
    linkedin: "https://www.linkedin.com/in/priya-raman-example",
  },
  {
    id: "daniel-kim",
    name: "Daniel Kim",
    role: "Backend Developer",
    company: "Shopify",
    location: "Toronto, ON",
    matchScore: 82,
    stage: "researching",
    campaignId: "shopify-backend",
    education: "McMaster University — BEng Computer Engineering",
    gradYear: "Class of 2022",
    skills: ["Ruby on Rails", "Kafka", "Postgres"],
    experience: [{ title: "Backend Developer", org: "Shopify", period: "2022 — Present" }],
    reasons: ["Same city — Toronto", "Recent new grad", "Similar career path"],
    lastContacted: null,
    nextAction: "Finish research summary",
    research:
      "Daniel converted from an internship to full-time and writes occasionally about Rails performance work.",
    angle: "Ask how he converted his internship into a return offer.",
    message:
      "Hi Daniel,\n\nI'm a CS student applying to Shopify's backend internship. You converted from intern to full-time on the same team, and I'd love to hear what made the difference.\n\nWould a short chat work sometime this month?\n\nThanks,\nAlex",
    linkedin: "https://www.linkedin.com/in/daniel-kim-example",
  },
  {
    id: "amara-osei",
    name: "Amara Osei",
    role: "Data Scientist",
    company: "TD Bank",
    location: "Toronto, ON",
    matchScore: 89,
    stage: "referral",
    campaignId: "td-data",
    education: "University of Toronto — MSc Statistics",
    gradYear: "Class of 2020",
    skills: ["Python", "PyTorch", "Risk Modelling", "SQL"],
    experience: [
      { title: "Data Scientist", org: "TD Bank", period: "2021 — Present" },
      { title: "Analytics Associate", org: "Scotiabank", period: "2020 — 2021" },
    ],
    reasons: ["Same city — Toronto", "Referral advocate", "Overlapping research area"],
    lastContacted: "Aug 5, 2026",
    nextAction: "Send resume for referral",
    research:
      "Amara offered to submit a referral after an initial exchange about credit risk modelling coursework.",
    angle: "Follow through quickly with a tailored resume and a one-line project summary.",
    message:
      "Hi Amara,\n\nThank you again — attaching my resume as promised. The most relevant project is a credit default model I built on the Lending Club dataset (AUC 0.81).\n\nReally appreciate you putting it forward.\n\nAlex",
    linkedin: "https://www.linkedin.com/in/amara-osei-example",
  },
  {
    id: "james-whitfield",
    name: "James Whitfield",
    role: "Quantitative Analyst",
    company: "TD Bank",
    location: "Toronto, ON",
    matchScore: 76,
    stage: "discovered",
    campaignId: "td-data",
    education: "Queen's University — BCom Finance",
    gradYear: "Class of 2019",
    skills: ["R", "Time Series", "Excel Modelling"],
    experience: [{ title: "Quantitative Analyst", org: "TD Bank", period: "2019 — Present" }],
    reasons: ["Same city — Toronto", "Adjacent team"],
    lastContacted: null,
    nextAction: "Queue for research",
    research: "Limited public activity. Adjacent to the data science co-op team.",
    angle: "Keep it short — ask which team owns the co-op program.",
    message:
      "Hi James,\n\nQuick question if you have a moment — I'm applying to TD's data science co-op and trying to understand which team owns the program. Any pointer would help a lot.\n\nThanks,\nAlex",
    linkedin: "https://www.linkedin.com/in/james-whitfield-example",
  },
  {
    id: "lena-fischer",
    name: "Lena Fischer",
    role: "ML Engineer",
    company: "NVIDIA",
    location: "Santa Clara, CA",
    matchScore: 85,
    stage: "interview",
    campaignId: "nvidia-ml",
    education: "University of Waterloo — MMath Computer Science",
    gradYear: "Class of 2019",
    skills: ["CUDA", "PyTorch", "Model Optimization"],
    experience: [{ title: "ML Engineer", org: "NVIDIA", period: "2020 — Present" }],
    reasons: ["Similar career path", "Published in same research area"],
    lastContacted: "Aug 6, 2026",
    nextAction: "Interview prep — Aug 11",
    research:
      "Lena forwarded the application internally; a recruiter screen is now scheduled for Aug 11.",
    angle: "Send a brief thank-you and confirm interview logistics.",
    message:
      "Hi Lena,\n\nThank you for forwarding my application — the recruiter reached out and we're set for Aug 11.\n\nGrateful for the help, and I'll keep you posted.\n\nAlex",
    linkedin: "https://www.linkedin.com/in/lena-fischer-example",
  },
  {
    id: "tobi-adeyemi",
    name: "Tobi Adeyemi",
    role: "Software Engineer",
    company: "RBC",
    location: "Toronto, ON",
    matchScore: 79,
    stage: "contacted",
    campaignId: "rbc-swe",
    education: "Toronto Metropolitan University — BSc Computer Science",
    gradYear: "Class of 2023",
    skills: ["TypeScript", "Node.js", "Postgres"],
    experience: [{ title: "Software Engineer", org: "RBC", period: "2023 — Present" }],
    reasons: ["Same city — Toronto", "Recent new grad", "SWE background"],
    lastContacted: "Aug 5, 2026",
    nextAction: "Follow up in 5 days",
    research: "Recently joined RBC from a new grad program; likely relatable and responsive.",
    angle: "Peer-to-peer tone — ask about the new grad onboarding experience.",
    message:
      "Hi Tobi,\n\nYou joined RBC not long ago through the new grad route, and I'm applying for the SWE internship this cycle.\n\nWould you be open to sharing what the interview loop was actually like?\n\nThanks,\nAlex",
    linkedin: "https://www.linkedin.com/in/tobi-adeyemi-example",
  },
  {
    id: "hannah-lieu",
    name: "Hannah Lieu",
    role: "Product Engineer",
    company: "Shopify",
    location: "Vancouver, BC",
    matchScore: 73,
    stage: "discovered",
    campaignId: "shopify-backend",
    education: "UBC — BSc Computer Science",
    gradYear: "Class of 2021",
    skills: ["React", "Ruby", "Design Systems"],
    experience: [{ title: "Product Engineer", org: "Shopify", period: "2021 — Present" }],
    reasons: ["SWE background", "Similar career path"],
    lastContacted: null,
    nextAction: "Queue for research",
    research: "Product-focused; weaker fit for a backend referral but worth a light touch.",
    angle: "Ask about cross-team mobility at Shopify.",
    message:
      "Hi Hannah,\n\nI'm applying to Shopify's backend internship and curious how much movement there is between product and platform teams. Any perspective would be appreciated.\n\nThanks,\nAlex",
    linkedin: "https://www.linkedin.com/in/hannah-lieu-example",
  },
  {
    id: "victor-santos",
    name: "Victor Santos",
    role: "Staff Engineer",
    company: "RBC",
    location: "Toronto, ON",
    matchScore: 87,
    stage: "replied",
    campaignId: "rbc-swe",
    education: "Ontario Tech University — BEng Software Engineering",
    gradYear: "Class of 2014",
    skills: ["Java", "Architecture", "Mentorship"],
    experience: [{ title: "Staff Engineer", org: "RBC", period: "2019 — Present" }],
    reasons: ["Same university — Ontario Tech", "Same city — Toronto", "Senior advocate"],
    lastContacted: "Aug 3, 2026",
    nextAction: "Book coffee chat",
    research: "Replied warmly and offered a 20-minute call; strong referral potential.",
    angle: "Convert the warm reply into a scheduled call this week.",
    message:
      "Hi Victor,\n\nThat would be great — I'm free Tuesday or Thursday afternoon this week, whichever suits you better.\n\nLooking forward to it,\nAlex",
    linkedin: "https://www.linkedin.com/in/victor-santos-example",
  },
];

export const getCandidate = (id: string) => candidates.find((c) => c.id === id);

export const messagesOverTime = [
  { week: "Jun 8", sent: 12, replies: 2 },
  { week: "Jun 15", sent: 19, replies: 4 },
  { week: "Jun 22", sent: 24, replies: 5 },
  { week: "Jun 29", sent: 31, replies: 7 },
  { week: "Jul 6", sent: 28, replies: 6 },
  { week: "Jul 13", sent: 37, replies: 10 },
  { week: "Jul 20", sent: 42, replies: 12 },
  { week: "Jul 27", sent: 39, replies: 11 },
  { week: "Aug 3", sent: 46, replies: 14 },
];

export const connectionTypes = [
  { type: "Same university", rate: 34 },
  { type: "Same city", rate: 22 },
  { type: "Similar career path", rate: 18 },
  { type: "Shared project area", rate: 15 },
  { type: "Cold, role-only", rate: 6 },
];

export const campaignPerformance = campaigns.map((c) => ({
  name: c.company,
  responseRate: Math.round((c.replies / Math.max(c.contacted, 1)) * 100),
  referrals: c.referrals,
}));