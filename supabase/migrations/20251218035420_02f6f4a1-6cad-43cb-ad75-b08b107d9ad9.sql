-- Create app roles enum
CREATE TYPE public.app_role AS ENUM ('admin', 'student', 'faculty');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

-- Create students table
CREATE TABLE public.students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  roll_number TEXT UNIQUE NOT NULL,
  department TEXT NOT NULL,
  year INTEGER NOT NULL CHECK (year >= 1 AND year <= 4),
  section TEXT,
  batch_year INTEGER NOT NULL,
  attendance_percentage NUMERIC(5,2) DEFAULT 0,
  cgpa NUMERIC(4,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create faculty table
CREATE TABLE public.faculty (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  employee_id TEXT UNIQUE NOT NULL,
  department TEXT NOT NULL,
  designation TEXT NOT NULL,
  specialization TEXT,
  qualifications TEXT,
  experience_years INTEGER DEFAULT 0,
  publications_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create notices table
CREATE TABLE public.notices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  target_audience TEXT[] DEFAULT ARRAY['all']::TEXT[],
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Create events table
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  event_date DATE NOT NULL,
  event_time TIME,
  venue TEXT,
  target_audience TEXT[] DEFAULT ARRAY['all']::TEXT[],
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create chatbot_analytics table
CREATE TABLE public.chatbot_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  user_role TEXT NOT NULL,
  question TEXT NOT NULL,
  response TEXT,
  session_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create timetable table
CREATE TABLE public.timetable (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  department TEXT NOT NULL,
  year INTEGER NOT NULL,
  section TEXT,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 1 AND day_of_week <= 6),
  period_number INTEGER NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  subject_name TEXT NOT NULL,
  faculty_id UUID REFERENCES public.faculty(id),
  room_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faculty ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chatbot_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timetable ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins can manage all profiles"
  ON public.profiles FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- User roles policies
CREATE POLICY "Users can view own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage roles"
  ON public.user_roles FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Students policies
CREATE POLICY "Students can view own data"
  ON public.students FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Faculty can view all students"
  ON public.students FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'faculty'));

CREATE POLICY "Admins can manage students"
  ON public.students FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Faculty policies
CREATE POLICY "Faculty can view own data"
  ON public.faculty FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "All authenticated can view faculty"
  ON public.faculty FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage faculty"
  ON public.faculty FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Notices policies (public read for active notices)
CREATE POLICY "Anyone can view active notices"
  ON public.notices FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage notices"
  ON public.notices FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Events policies
CREATE POLICY "Anyone can view active events"
  ON public.events FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage events"
  ON public.events FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Chatbot analytics policies
CREATE POLICY "Authenticated users can insert analytics"
  ON public.chatbot_analytics FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can insert analytics"
  ON public.chatbot_analytics FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Admins can view analytics"
  ON public.chatbot_analytics FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Timetable policies
CREATE POLICY "Authenticated can view timetable"
  ON public.timetable FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage timetable"
  ON public.timetable FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Create trigger for profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data ->> 'full_name');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();