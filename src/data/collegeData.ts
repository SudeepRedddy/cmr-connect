// Comprehensive CMR College data extracted from the website
export const collegeData = {
  name: "CMR College of Engineering & Technology",
  shortName: "CMRCET",
  tagline: "Explore to Invent",
  established: 2002,
  yearsOfExcellence: 23,
  location: {
    address: "Kandlakoya, Medchal Road, Hyderabad - 501401",
    state: "Telangana",
    country: "India",
    distance: "20 Km from Secunderabad Railway Station",
    highway: "Hyderabad – Nagpur National Highway",
    campus: "10 acres of serene, lush green and pollution free environment"
  },
  sponsor: "MGR Educational Society",
  
  accreditations: [
    { name: "NAAC", grade: "A+", description: "National Assessment and Accreditation Council" },
    { name: "NIRF", rank: "151-200", category: "Engineering", year: 2025, streak: "8th time in a row across TEN editions" },
    { name: "NIRF Innovation", rank: "11-50", year: 2024 },
    { name: "UGC", status: "Autonomous" },
    { name: "NBA", status: "Accredited", description: "National Board of Accreditation" },
    { name: "AICTE", status: "Approved" },
    { name: "JNTU", affiliation: "Affiliated to JNTU Hyderabad" }
  ],

  eamcetCode: "CMRK",

  courses: {
    undergraduate: [
      { name: "Computer Science and Engineering", code: "CSE", intake: 180 },
      { name: "Computer Science and Engineering (Data Science)", code: "CSE-DS", intake: 120 },
      { name: "Information Technology", code: "IT", intake: 120 },
      { name: "CSE (Artificial Intelligence & Machine Learning)", code: "CSE-AIML", intake: 60 },
      { name: "CSE (Cyber Security)", code: "CSE-CS", intake: 60 },
      { name: "Electronics and Communication Engineering", code: "ECE", intake: 120 },
      { name: "Electrical and Electronics Engineering", code: "EEE", intake: 60 },
      { name: "Mechanical Engineering", code: "MECH", intake: 60 },
      { name: "Civil Engineering", code: "CIVIL", intake: 60 }
    ],
    postgraduate: [
      { name: "Master of Technology (M.Tech)", specializations: ["CSE", "ECE", "EEE"] },
      { name: "Master of Business Administration (MBA)", intake: 120 }
    ]
  },

  placements: {
    year: "2024-25",
    totalPlacements: 607,
    highestPackage: "34.4 LPA",
    topRecruiters: [
      { name: "PayPal", package: "34.4 LPA" },
      { name: "Siemens", package: "20.4 LPA" },
      { name: "Zenoti", package: "11.47 LPA" },
      { name: "Texas Instruments", package: "10.04 LPA" },
      { name: "Honeywell", package: "10.0 LPA" }
    ],
    recruiters: [
      "Microsoft", "Amazon", "JPMorgan Chase & Co", "Rubrik", "Juspay", "Zscaler",
      "Amadeus", "Deloitte", "DeltaX", "EPAM", "DBS", "Accolite Digital",
      "Accenture", "Infosys", "Capgemini", "LTIMindtree", "Cognizant", "PwC",
      "TCS", "Wipro", "Tech Mahindra", "IBM", "Virtusa", "UST", "Hexaware",
      "NTT Data", "Ernst & Young", "TATA Technologies", "TATA Advanced Systems"
    ],
    topRecruiterStats: [
      { company: "Accenture", count: 456 },
      { company: "Infosys", count: 127 },
      { company: "Capgemini", count: 472 },
      { company: "LTIMindtree", count: 67 },
      { company: "Cognizant", count: 231 },
      { company: "PwC", count: 45 }
    ]
  },

  facilities: [
    "Central Library with Digital Resources",
    "Advanced Computer Labs",
    "Research Centers",
    "Sports Complex",
    "Hostel Facilities",
    "Cafeteria",
    "Wi-Fi Enabled Campus",
    "Auditorium",
    "Seminar Halls",
    "Transportation"
  ],

  governance: [
    { name: "Samvidha", type: "ERP System" },
    { name: "Akanksha", type: "Learning Management" },
    { name: "eExamDesk", type: "Examination Portal" },
    { name: "Bristom", type: "Feedback System" },
    { name: "Build IT", type: "Project Management" },
    { name: "ESLO", type: "Student Learning Outcomes" }
  ],

  research: {
    areas: [
      "Funded Projects",
      "Research Centers",
      "Industry Consultancy",
      "Intellectual Property Assets",
      "Technology Incubation",
      "MSME ASPIRE - TBI",
      "Institution Innovation Council"
    ],
    achievements: [
      "Multiple patents filed and granted",
      "Industry-funded research projects",
      "Collaborative research with top institutions",
      "Start-up incubation center"
    ]
  },

  studentActivities: [
    "SAE India - SUPRA, Bicycle, Effi-Cycle",
    "SAE Aero Design (International & National)",
    "Hackathons and Coding Contests",
    "Cultural Festivals",
    "Technical Symposiums",
    "CMR ThinkFest"
  ],

  contact: {
    phone: ["+91-40-64635858", "+91-40-64635859"],
    email: "info@cmrcet.ac.in",
    admissions: "admissions@cmrcet.ac.in",
    website: "https://cmrcet.ac.in"
  },

  socialMedia: {
    twitter: "@cmrcet_official",
    facebook: "cmrcet",
    instagram: "@cmrcet_official",
    linkedin: "cmrcet_official",
    youtube: "CMR College of Engineering & Technology"
  },

  importantLinks: {
    cmsPortal: "CMS",
    lms: "LMS",
    aria: "ARIA",
    rti: "RTI",
    transport: "Transport",
    virtualTour: "Virtual Tour",
    onlineGrievance: "Online Grievance",
    aicteFeedback: "AICTE Feedback"
  },

  admissions: {
    eligibility: "Candidates must have passed 10+2 or equivalent examination with Physics, Chemistry, and Mathematics",
    process: [
      "Apply through TS EAMCET / AP EAMCET",
      "Counseling through TSCHE / APSCHE",
      "Use EAMCET Code: CMRK"
    ],
    timings: "10:00 AM to 04:00 PM"
  }
};

// FAQs for the chatbot
export const faqData = [
  {
    category: "Admissions",
    questions: [
      {
        q: "What is the EAMCET code for CMRCET?",
        a: "The EAMCET code for CMR College of Engineering & Technology is CMRK."
      },
      {
        q: "What courses are offered at CMRCET?",
        a: "CMRCET offers B.Tech programs in CSE, CSE (Data Science), IT, CSE (AI&ML), CSE (Cyber Security), ECE, EEE, Mechanical, and Civil Engineering. For postgraduate, we offer M.Tech and MBA programs."
      },
      {
        q: "How do I apply for admission?",
        a: "You can apply through TS EAMCET or AP EAMCET. After qualifying, participate in the counseling process through TSCHE/APSCHE and select CMRCET using code CMRK."
      },
      {
        q: "What are the eligibility criteria?",
        a: "Candidates must have passed 10+2 or equivalent examination with Physics, Chemistry, and Mathematics from a recognized board."
      }
    ]
  },
  {
    category: "Placements",
    questions: [
      {
        q: "What is the highest package offered?",
        a: "The highest package offered in 2024 placements was 34.4 LPA by PayPal."
      },
      {
        q: "Which companies recruit from CMRCET?",
        a: "Top recruiters include Microsoft, Amazon, PayPal, Siemens, JPMorgan, Accenture, Infosys, Capgemini, TCS, and many more Fortune 500 companies."
      },
      {
        q: "What is the placement percentage?",
        a: "CMRCET has achieved 607+ placements in the 2024 batch with students placed in top companies worldwide."
      }
    ]
  },
  {
    category: "Academics",
    questions: [
      {
        q: "Is CMRCET an autonomous college?",
        a: "Yes, CMRCET is a UGC Autonomous institution, allowing us to design our own curriculum and conduct examinations independently."
      },
      {
        q: "What accreditations does CMRCET have?",
        a: "CMRCET is NAAC A+ accredited, NBA accredited, AICTE approved, and ranked in NIRF 151-200 band for 8 consecutive years."
      },
      {
        q: "What is the NIRF ranking?",
        a: "CMRCET is ranked in the 151-200 band in NIRF Engineering Rankings 2025, achieving this for the 8th time in a row."
      }
    ]
  },
  {
    category: "Campus",
    questions: [
      {
        q: "Where is CMRCET located?",
        a: "CMRCET is located at Kandlakoya, Medchal Road, Hyderabad - 501401, Telangana. It's 20 km from Secunderabad Railway Station on the Hyderabad-Nagpur National Highway."
      },
      {
        q: "What facilities are available on campus?",
        a: "The campus features advanced computer labs, central library, research centers, sports complex, hostels, cafeteria, Wi-Fi connectivity, auditorium, and transportation facilities across 10 acres of green environment."
      },
      {
        q: "Is hostel accommodation available?",
        a: "Yes, separate hostel facilities are available for both boys and girls with all modern amenities."
      }
    ]
  },
  {
    category: "Faculty",
    questions: [
      {
        q: "How can faculty access the LMS?",
        a: "Faculty can access the Learning Management System (LMS) through the college portal. Login credentials are provided by the IT department."
      },
      {
        q: "What research opportunities are available?",
        a: "CMRCET has multiple research centers, funded projects, industry consultancy programs, and an Innovation Council. Faculty can participate in collaborative research and file patents."
      }
    ]
  },
  {
    category: "Parents",
    questions: [
      {
        q: "How can parents track student progress?",
        a: "Parents can access the Samvidha ERP system to track attendance, grades, and academic progress. Login credentials are provided during admission."
      },
      {
        q: "Is the campus safe?",
        a: "Yes, the campus has 24/7 security, CCTV surveillance, and is located in a serene, pollution-free environment. We prioritize student safety."
      },
      {
        q: "What transportation facilities are available?",
        a: "CMRCET provides bus transportation covering major areas of Hyderabad and surrounding regions. Routes and timings are available on the transport portal."
      }
    ]
  }
];

export type UserRole = 'student' | 'faculty' | 'parent' | 'visitor';

export const roleDescriptions: Record<UserRole, string> = {
  student: "Current student or prospective student seeking information about courses, placements, campus life, and academics.",
  faculty: "Teaching or non-teaching staff member looking for academic resources, research opportunities, and administrative information.",
  parent: "Parent or guardian interested in student progress, safety, facilities, and admission processes.",
  visitor: "General visitor interested in learning about CMRCET, its programs, achievements, and contact information."
};
