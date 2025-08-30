-- Fix security issue: Restrict profile visibility to authenticated users only
-- Drop the existing public access policy
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

-- Create a new policy that restricts profile access to authenticated users only
CREATE POLICY "Authenticated users can view profiles" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (true);

-- Optional: Add a more granular policy for stricter privacy
-- Users can always view their own profile, and authenticated users can view others
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);