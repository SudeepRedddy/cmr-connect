import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

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

    // Verify the requesting user is an admin
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    const supabaseClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: authHeader } }
    })

    const { data: { user: requestingUser } } = await supabaseClient.auth.getUser()
    if (!requestingUser) {
      throw new Error('Not authenticated')
    }

    // Check if requesting user is admin
    const { data: roleData } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', requestingUser.id)
      .eq('role', 'admin')
      .single()

    if (!roleData) {
      throw new Error('Unauthorized: Admin access required')
    }

    const { email, password, full_name, role, additionalData } = await req.json()

    if (!email || !password || !role) {
      throw new Error('Email, password, and role are required')
    }

    // Create user with admin API
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name }
    })

    if (createError) throw createError
    if (!newUser.user) throw new Error('Failed to create user')

    const userId = newUser.user.id

    // Create profile
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({ id: userId, email, full_name })

    if (profileError) {
      console.error('Profile error:', profileError)
    }

    // Assign role
    const { error: roleError } = await supabaseAdmin
      .from('user_roles')
      .insert({ user_id: userId, role })

    if (roleError) throw roleError

    // Add role-specific data
    if (role === 'student' && additionalData) {
      const { error: studentError } = await supabaseAdmin
        .from('students')
        .insert({
          user_id: userId,
          roll_number: additionalData.roll_number,
          department: additionalData.department,
          year: additionalData.year,
          section: additionalData.section || null,
          batch_year: additionalData.batch_year
        })
      if (studentError) throw studentError
    }

    if (role === 'faculty' && additionalData) {
      const { error: facultyError } = await supabaseAdmin
        .from('faculty')
        .insert({
          user_id: userId,
          employee_id: additionalData.employee_id,
          department: additionalData.department,
          designation: additionalData.designation,
          specialization: additionalData.specialization || null,
          qualifications: additionalData.qualifications || null
        })
      if (facultyError) throw facultyError
    }

    return new Response(
      JSON.stringify({ success: true, userId }),
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