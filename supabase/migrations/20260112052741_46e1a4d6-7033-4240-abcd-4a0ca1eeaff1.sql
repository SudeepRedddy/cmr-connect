-- Fix PUBLIC_DATA_EXPOSURE: Restrict campus_locations to authenticated users only
-- Staff contact information (contact_person, contact_phone) should not be publicly accessible

-- Drop the overly permissive public policy
DROP POLICY IF EXISTS "Anyone can view locations" ON campus_locations;

-- Create new policy that requires authentication to view locations
CREATE POLICY "Authenticated users can view locations" 
ON campus_locations 
FOR SELECT 
TO authenticated
USING (true);