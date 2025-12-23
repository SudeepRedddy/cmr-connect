import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Static college context
const collegeContext = `
You are a helpful AI assistant for CMR College of Engineering & Technology (CMRCET), Hyderabad.

COLLEGE OVERVIEW:
- Name: CMR College of Engineering & Technology
- Short Name: CMRCET
- Tagline: "Explore to Invent"
- Established: 2002 (23+ years of excellence)
- Location: Kandlakoya, Medchal Road, Hyderabad - 501401, Telangana
- Campus: 10 acres of serene, lush green and pollution-free environment
- EAMCET Code: CMRK

ACCREDITATIONS & RANKINGS:
- NAAC A+ Accredited
- NIRF Rank: 151-200 band (Engineering category, 2025)
- UGC Autonomous Status
- NBA Accredited
- AICTE Approved

COURSES OFFERED:
B.Tech Programs: CSE (180), CSE Data Science (120), IT (120), CSE AI/ML (60), CSE Cyber Security (60), ECE (120), EEE (60), MECH (60), CIVIL (60)
M.Tech: CSE, ECE, EEE specializations
MBA: 120 intake

PLACEMENTS (2024-25):
- 607+ students placed
- Highest Package: 34.4 LPA (PayPal)
- Top Recruiters: Microsoft, Amazon, JPMorgan Chase, PayPal, Siemens, Texas Instruments

CONTACT:
- Phone: +91-40-64635858
- Email: info@cmrcet.ac.in
- Website: https://cmrcet.ac.in
`;

const rolePrompts: Record<string, string> = {
  student: `You are speaking to a student. Focus on courses, placements, campus life, facilities. Be friendly and peer-like.`,
  faculty: `You are speaking to a faculty member. Focus on academic resources, research, LMS portals. Be professional.`,
  visitor: `You are speaking to a visitor. Focus on overview, rankings, admissions, contact info. Be welcoming.`
};

// Function to fetch dynamic data from database
async function fetchDynamicContext(supabase: any): Promise<string> {
  let dynamicContext = '\n\nDYNAMIC DATA FROM DATABASE:\n';

  try {
    // Fetch faculty data
    const { data: facultyData } = await supabase
      .from('faculty')
      .select(`
        employee_id,
        department,
        designation,
        specialization,
        qualifications,
        experience_years,
        profiles!faculty_user_id_fkey(full_name, email, phone)
      `)
      .limit(50);

    if (facultyData && facultyData.length > 0) {
      dynamicContext += '\nFACULTY MEMBERS:\n';
      for (const f of facultyData) {
        const profile = f.profiles;
        const name = profile?.full_name || 'Unknown';
        dynamicContext += `- ${name} (${f.designation}, ${f.department}): ${f.specialization || 'General'}, ${f.qualifications || ''}, ${f.experience_years || 0} years exp, Contact: ${profile?.email || 'N/A'}\n`;
      }
    }

    // Fetch exam schedules
    const { data: examData } = await supabase
      .from('exam_schedules')
      .select('*')
      .gte('exam_date', new Date().toISOString().split('T')[0])
      .order('exam_date', { ascending: true })
      .limit(20);

    if (examData && examData.length > 0) {
      dynamicContext += '\nUPCOMING EXAMS:\n';
      for (const e of examData) {
        dynamicContext += `- ${e.exam_name} (${e.department}): ${e.subject_name} (${e.subject_code}) on ${e.exam_date} from ${e.start_time} to ${e.end_time} at ${e.venue || 'TBD'}\n`;
      }
    }

    // Fetch campus locations
    const { data: locationData } = await supabase
      .from('campus_locations')
      .select('*')
      .eq('is_active', true)
      .limit(50);

    if (locationData && locationData.length > 0) {
      dynamicContext += '\nCAMPUS LOCATIONS:\n';
      for (const loc of locationData) {
        const room = loc.room_number ? ` (Room ${loc.room_number})` : '';
        dynamicContext += `- ${loc.name}: ${loc.building}, Floor ${loc.floor}${room} - ${loc.description || loc.location_type}. Contact: ${loc.contact_person || 'N/A'} (${loc.contact_phone || 'N/A'})\n`;
      }
    }

    // Fetch active notices
    const { data: noticeData } = await supabase
      .from('notices')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(10);

    if (noticeData && noticeData.length > 0) {
      dynamicContext += '\nRECENT NOTICES:\n';
      for (const n of noticeData) {
        dynamicContext += `- ${n.title}: ${n.content.substring(0, 100)}...\n`;
      }
    }

    // Fetch upcoming events
    const { data: eventData } = await supabase
      .from('events')
      .select('*')
      .eq('is_active', true)
      .gte('event_date', new Date().toISOString().split('T')[0])
      .order('event_date', { ascending: true })
      .limit(10);

    if (eventData && eventData.length > 0) {
      dynamicContext += '\nUPCOMING EVENTS:\n';
      for (const ev of eventData) {
        dynamicContext += `- ${ev.title} on ${ev.event_date} at ${ev.venue || 'TBD'}: ${ev.description || ''}\n`;
      }
    }

  } catch (error) {
    console.error('Error fetching dynamic context:', error);
  }

  return dynamicContext;
}

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

    // Create supabase client for fetching dynamic data
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch dynamic context from database
    const dynamicContext = await fetchDynamicContext(supabase);

    const systemPrompt = `${collegeContext}
${dynamicContext}

${rolePrompts[role] || rolePrompts.visitor}

IMPORTANT INSTRUCTIONS:
1. Answer based on both static college data AND dynamic data from database above.
2. When asked about faculty, locations, exams, events - use the DYNAMIC DATA section.
3. Be helpful, accurate, and concise.
4. If asked about something not in the data, suggest contacting the college.
5. Format responses nicely with bullet points when listing multiple items.
6. If the user wants to connect with a faculty member for a live chat, tell them to click the "Connect with Faculty" button that will appear.`;

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

    // Check if user wants live chat with faculty
    const wantsLiveChat = message.toLowerCase().includes('connect') && 
      (message.toLowerCase().includes('faculty') || message.toLowerCase().includes('teacher') || message.toLowerCase().includes('professor'));

    console.log("AI Response received successfully");

    return new Response(JSON.stringify({ 
      response: aiResponse,
      suggestLiveChat: wantsLiveChat
    }), {
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
