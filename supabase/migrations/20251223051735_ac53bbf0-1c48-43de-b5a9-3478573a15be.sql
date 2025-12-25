-- Create exam_schedules table for examination data
CREATE TABLE public.exam_schedules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  exam_name TEXT NOT NULL,
  subject_code TEXT NOT NULL,
  subject_name TEXT NOT NULL,
  exam_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  department TEXT NOT NULL,
  year INTEGER NOT NULL,
  semester INTEGER NOT NULL,
  exam_type TEXT NOT NULL DEFAULT 'regular', -- regular, supplementary, mid-term
  venue TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create campus_locations table for location data
CREATE TABLE public.campus_locations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  location_type TEXT NOT NULL, -- lab, classroom, office, facility, canteen, library, etc.
  building TEXT NOT NULL,
  floor INTEGER NOT NULL DEFAULT 0,
  room_number TEXT,
  description TEXT,
  facilities TEXT[],
  capacity INTEGER,
  contact_person TEXT,
  contact_phone TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create live_chat_sessions table for student-faculty chat
CREATE TABLE public.live_chat_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  faculty_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, active, closed
  topic TEXT,
  department TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  accepted_at TIMESTAMP WITH TIME ZONE,
  closed_at TIMESTAMP WITH TIME ZONE
);

-- Create live_chat_messages table for chat messages
CREATE TABLE public.live_chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.live_chat_sessions(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sender_role TEXT NOT NULL, -- student, faculty
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.exam_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campus_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_chat_messages ENABLE ROW LEVEL SECURITY;

-- RLS policies for exam_schedules (public read, admin write)
CREATE POLICY "Anyone can view exam schedules" 
ON public.exam_schedules FOR SELECT USING (true);

CREATE POLICY "Admins can manage exam schedules" 
ON public.exam_schedules FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

-- RLS policies for campus_locations (public read, admin write)
CREATE POLICY "Anyone can view locations" 
ON public.campus_locations FOR SELECT USING (true);

CREATE POLICY "Admins can manage locations" 
ON public.campus_locations FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

-- RLS policies for live_chat_sessions
CREATE POLICY "Students can view own sessions" 
ON public.live_chat_sessions FOR SELECT 
USING (auth.uid() = student_id);

CREATE POLICY "Faculty can view pending and own sessions" 
ON public.live_chat_sessions FOR SELECT 
USING (
  public.has_role(auth.uid(), 'faculty') AND 
  (status = 'pending' OR faculty_id = auth.uid())
);

CREATE POLICY "Students can create sessions" 
ON public.live_chat_sessions FOR INSERT 
WITH CHECK (auth.uid() = student_id AND public.has_role(auth.uid(), 'student'));

CREATE POLICY "Faculty can accept sessions" 
ON public.live_chat_sessions FOR UPDATE 
USING (public.has_role(auth.uid(), 'faculty'));

-- RLS policies for live_chat_messages
CREATE POLICY "Session participants can view messages" 
ON public.live_chat_messages FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.live_chat_sessions s 
    WHERE s.id = session_id 
    AND (s.student_id = auth.uid() OR s.faculty_id = auth.uid())
  )
);

CREATE POLICY "Session participants can send messages" 
ON public.live_chat_messages FOR INSERT 
WITH CHECK (
  auth.uid() = sender_id AND
  EXISTS (
    SELECT 1 FROM public.live_chat_sessions s 
    WHERE s.id = session_id 
    AND s.status = 'active'
    AND (s.student_id = auth.uid() OR s.faculty_id = auth.uid())
  )
);

-- Enable realtime for live chat
ALTER PUBLICATION supabase_realtime ADD TABLE public.live_chat_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.live_chat_messages;