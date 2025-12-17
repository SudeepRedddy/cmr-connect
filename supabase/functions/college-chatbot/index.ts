import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// College data context for the AI
const collegeContext = `
You are a helpful AI assistant for CMR College of Engineering & Technology (CMRCET), Hyderabad.

COLLEGE OVERVIEW:
- Name: CMR College of Engineering & Technology
- Short Name: CMRCET
- Tagline: "Explore to Invent"
- Established: 2002 (23+ years of excellence)
- Location: Kandlakoya, Medchal Road, Hyderabad - 501401, Telangana
- Distance: 20 Km from Secunderabad Railway Station on Hyderabad-Nagpur National Highway
- Campus: 10 acres of serene, lush green and pollution-free environment
- Sponsor: MGR Educational Society
- EAMCET Code: CMRK

ACCREDITATIONS & RANKINGS:
- NAAC A+ Accredited (National Assessment and Accreditation Council)
- NIRF Rank: 151-200 band (Engineering category, 2025) - 8th time in a row across TEN editions
- NIRF Innovation Rank: 11-50 band (2024)
- UGC Autonomous Status
- NBA Accredited (National Board of Accreditation)
- AICTE Approved
- Affiliated to JNTU Hyderabad

COURSES OFFERED:
B.Tech Programs:
- Computer Science and Engineering (CSE) - 180 intake
- CSE (Data Science) - 120 intake
- Information Technology (IT) - 120 intake
- CSE (Artificial Intelligence & Machine Learning) - 60 intake
- CSE (Cyber Security) - 60 intake
- Electronics and Communication Engineering (ECE) - 120 intake
- Electrical and Electronics Engineering (EEE) - 60 intake
- Mechanical Engineering - 60 intake
- Civil Engineering - 60 intake

Postgraduate Programs:
- M.Tech (CSE, ECE, EEE specializations)
- MBA - 120 intake

PLACEMENTS (2024-25):
- Total Placements: 607+ students placed
- Highest Package: 34.4 LPA (PayPal)
- Top Recruiters by Package:
  * PayPal: 34.4 LPA
  * Siemens: 20.4 LPA
  * Zenoti: 11.47 LPA
  * Texas Instruments: 10.04 LPA
  * Honeywell: 10.0 LPA
- Major Recruiters: Microsoft, Amazon, JPMorgan Chase, Rubrik, Juspay, Zscaler, Amadeus, Deloitte, DeltaX, EPAM, DBS, Accolite Digital, Accenture, Infosys, Capgemini, LTIMindtree, Cognizant, PwC, TCS, Wipro, Tech Mahindra, IBM, Virtusa, UST, Hexaware, NTT Data, Ernst & Young, TATA Technologies, TATA Advanced Systems
- Recruitment Stats: Accenture (456), Capgemini (472), Cognizant (231), Infosys (127), LTIMindtree (67), PwC (45)

FACILITIES:
- Central Library with Digital Resources
- Advanced Computer Labs
- Research Centers
- Sports Complex
- Hostel Facilities (Boys & Girls separate)
- Cafeteria
- Wi-Fi Enabled Campus
- Auditorium
- Seminar Halls
- Transportation covering major Hyderabad areas

GOVERNANCE & PORTALS:
- Samvidha: ERP System (for tracking attendance, grades, progress)
- Akanksha: Learning Management System
- eExamDesk: Examination Portal
- Bristom: Feedback System
- Build IT: Project Management
- ESLO: Student Learning Outcomes

RESEARCH:
- Funded Projects
- Research Centers
- Industry Consultancy
- Intellectual Property Assets (Patents filed and granted)
- Technology Incubation
- MSME ASPIRE - TBI
- Institution Innovation Council
- Collaborative research with top institutions
- Start-up incubation center

STUDENT ACTIVITIES:
- SAE India - SUPRA, Bicycle, Effi-Cycle competitions
- SAE Aero Design (International & National)
- Hackathons and Coding Contests
- Cultural Festivals
- Technical Symposiums
- CMR ThinkFest

CONTACT INFORMATION:
- Phone: +91-40-64635858, +91-40-64635859
- Email: info@cmrcet.ac.in
- Admissions: admissions@cmrcet.ac.in
- Website: https://cmrcet.ac.in
- Timings: 10:00 AM to 04:00 PM

ADMISSIONS:
- Eligibility: 10+2 with Physics, Chemistry, and Mathematics
- Process: Apply through TS EAMCET / AP EAMCET → Counseling through TSCHE/APSCHE → Use EAMCET Code: CMRK

SOCIAL MEDIA:
- Twitter: @cmrcet_official
- Facebook: cmrcet
- Instagram: @cmrcet_official
- LinkedIn: cmrcet_official
- YouTube: CMR College of Engineering & Technology
`;

const rolePrompts: Record<string, string> = {
  student: `You are speaking to a current or prospective student. Focus on:
- Course information, curriculum, and academic programs
- Placement opportunities, companies, and packages
- Campus life, activities, clubs, and events
- Hostel, facilities, and student services
- Admission process for prospective students
Be friendly, encouraging, and informative. Use a peer-like tone.`,
  
  faculty: `You are speaking to a faculty member or staff. Focus on:
- Academic resources and research opportunities
- LMS (Akanksha) and administrative portals
- Research centers, funded projects, and patents
- Industry consultancy and collaboration
- Professional development opportunities
Be professional and supportive.`,
  
  parent: `You are speaking to a parent or guardian. Focus on:
- Student safety and campus security
- Academic progress tracking through Samvidha ERP
- Transportation facilities and routes
- Hostel accommodations and facilities
- Placement record and career prospects
- Fee structure and admission process
Be reassuring, detailed, and professional.`,
  
  visitor: `You are speaking to a general visitor. Focus on:
- Overview of the college and its achievements
- Rankings, accreditations, and recognition
- Programs offered and admission process
- Contact information and how to visit
- General information about the institution
Be welcoming and informative.`
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, role, conversationHistory } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const systemPrompt = `${collegeContext}

${rolePrompts[role] || rolePrompts.visitor}

IMPORTANT INSTRUCTIONS:
1. Always answer based on the college data provided above.
2. Be helpful, accurate, and concise.
3. If asked about something not in the data, politely say you don't have that specific information and suggest contacting the college directly.
4. Format responses nicely with bullet points when listing multiple items.
5. Include relevant contact information when appropriate.
6. Keep responses friendly and professional.
7. If the user greets you, greet them back and ask how you can help them.`;

    const messages = [
      { role: "system", content: systemPrompt },
      ...(conversationHistory || []),
      { role: "user", content: message }
    ];

    console.log("Sending request to Lovable AI with role:", role);

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: messages,
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ 
          error: 'Rate limit exceeded. Please try again in a moment.' 
        }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      if (response.status === 402) {
        return new Response(JSON.stringify({ 
          error: 'AI service credits exhausted. Please try again later.' 
        }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content || "I'm sorry, I couldn't generate a response. Please try again.";

    console.log("AI Response received successfully");

    return new Response(JSON.stringify({ response: aiResponse }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in college-chatbot function:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'An error occurred' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
