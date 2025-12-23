import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const departments = ['CSE', 'ECE', 'EEE', 'MECH', 'CIVIL'];
const sections = ['A', 'B'];
const designations = ['Assistant Professor', 'Associate Professor', 'Professor', 'Senior Lecturer', 'HOD'];
const specializations: Record<string, string[]> = {
  CSE: ['Data Science', 'Machine Learning', 'Cyber Security', 'Cloud Computing', 'Web Technologies'],
  ECE: ['VLSI Design', 'Embedded Systems', 'Signal Processing', 'Communication Systems', 'IoT'],
  EEE: ['Power Systems', 'Control Systems', 'Power Electronics', 'Renewable Energy', 'Electrical Machines'],
  MECH: ['Thermal Engineering', 'Manufacturing', 'Automobile', 'CAD/CAM', 'Robotics'],
  CIVIL: ['Structural Engineering', 'Geotechnical', 'Transportation', 'Environmental', 'Construction Management']
};

const firstNames = ['Rahul', 'Priya', 'Arun', 'Sneha', 'Vikram', 'Ananya', 'Karthik', 'Deepa', 'Rajesh', 'Kavitha', 
  'Suresh', 'Lakshmi', 'Mahesh', 'Divya', 'Ganesh', 'Revathi', 'Naveen', 'Swathi', 'Prasad', 'Meena',
  'Ravi', 'Sunitha', 'Srinivas', 'Padma', 'Venkat', 'Anusha', 'Krishna', 'Bhavani', 'Ramesh', 'Shalini',
  'Ajay', 'Pooja', 'Harish', 'Rekha', 'Mohan', 'Vasantha', 'Kishore', 'Sirisha', 'Naresh', 'Jyothi'];
const lastNames = ['Kumar', 'Sharma', 'Reddy', 'Rao', 'Gupta', 'Verma', 'Singh', 'Patel', 'Nair', 'Iyer',
  'Prasad', 'Murthy', 'Varma', 'Chowdary', 'Naidu', 'Pillai', 'Menon', 'Shetty', 'Hegde', 'Patil'];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    })

    const createdUsers: { email: string; password: string; role: string; department: string; name: string }[] = [];

    // Create 25 faculty (5 per department)
    for (let deptIdx = 0; deptIdx < departments.length; deptIdx++) {
      const dept = departments[deptIdx];
      for (let i = 0; i < 5; i++) {
        const firstName = firstNames[(deptIdx * 5 + i) % firstNames.length];
        const lastName = lastNames[(deptIdx * 5 + i) % lastNames.length];
        const fullName = `Dr. ${firstName} ${lastName}`;
        const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}.${dept.toLowerCase()}@cmrcet.ac.in`;
        const password = `Faculty@${dept}${i + 1}`;
        const employeeId = `FAC${dept}${String(i + 1).padStart(3, '0')}`;

        try {
          // Create auth user
          const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { full_name: fullName }
          });

          if (createError) {
            console.error(`Error creating faculty ${email}:`, createError.message);
            continue;
          }

          if (!newUser.user) continue;
          const userId = newUser.user.id;

          // Create profile
          await supabaseAdmin.from('profiles').insert({ 
            id: userId, 
            email, 
            full_name: fullName,
            phone: `98765${String(deptIdx * 5 + i).padStart(5, '0')}`
          });

          // Assign role
          await supabaseAdmin.from('user_roles').insert({ user_id: userId, role: 'faculty' });

          // Create faculty record
          await supabaseAdmin.from('faculty').insert({
            user_id: userId,
            employee_id: employeeId,
            department: dept,
            designation: designations[i % designations.length],
            specialization: specializations[dept][i % specializations[dept].length],
            qualifications: 'Ph.D',
            experience_years: 5 + (i * 2),
            publications_count: 10 + (i * 3)
          });

          createdUsers.push({ email, password, role: 'faculty', department: dept, name: fullName });
        } catch (e) {
          console.error(`Error with faculty ${email}:`, e);
        }
      }
    }

    // Create 100 students (20 per department)
    for (let deptIdx = 0; deptIdx < departments.length; deptIdx++) {
      const dept = departments[deptIdx];
      for (let i = 0; i < 20; i++) {
        const firstName = firstNames[(deptIdx * 20 + i) % firstNames.length];
        const lastName = lastNames[(deptIdx * 20 + i) % lastNames.length];
        const fullName = `${firstName} ${lastName}`;
        const rollNumber = `22${dept}${String(i + 1).padStart(3, '0')}`;
        const email = `${rollNumber.toLowerCase()}@cmrcet.ac.in`;
        const password = `Student@${dept}${i + 1}`;
        const year = (i % 4) + 1;
        const section = sections[i % sections.length];

        try {
          // Create auth user
          const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { full_name: fullName }
          });

          if (createError) {
            console.error(`Error creating student ${email}:`, createError.message);
            continue;
          }

          if (!newUser.user) continue;
          const userId = newUser.user.id;

          // Create profile
          await supabaseAdmin.from('profiles').insert({ 
            id: userId, 
            email, 
            full_name: fullName,
            phone: `90000${String(deptIdx * 20 + i).padStart(5, '0')}`
          });

          // Assign role
          await supabaseAdmin.from('user_roles').insert({ user_id: userId, role: 'student' });

          // Create student record
          await supabaseAdmin.from('students').insert({
            user_id: userId,
            roll_number: rollNumber,
            department: dept,
            year,
            section,
            batch_year: 2025 - year,
            cgpa: 7.0 + (Math.random() * 2.5),
            attendance_percentage: 75 + (Math.random() * 20)
          });

          createdUsers.push({ email, password, role: 'student', department: dept, name: fullName });
        } catch (e) {
          console.error(`Error with student ${email}:`, e);
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Created ${createdUsers.length} users`,
        users: createdUsers
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error: unknown) {
    console.error('Error:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return new Response(
      JSON.stringify({ error: message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
