-- Drop the existing update policy for faculty
DROP POLICY IF EXISTS "Faculty can accept sessions" ON public.live_chat_sessions;

-- Create a proper update policy for faculty that allows accepting and closing
CREATE POLICY "Faculty can update sessions" 
ON public.live_chat_sessions 
FOR UPDATE 
USING (has_role(auth.uid(), 'faculty'::app_role) AND (status = 'pending' OR faculty_id = auth.uid()))
WITH CHECK (has_role(auth.uid(), 'faculty'::app_role));

-- Add policy for students to update (close) their own sessions
CREATE POLICY "Students can update own sessions" 
ON public.live_chat_sessions 
FOR UPDATE 
USING (auth.uid() = student_id)
WITH CHECK (auth.uid() = student_id);