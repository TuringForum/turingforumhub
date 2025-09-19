-- Fix security issue: Remove overly permissive profile viewing policy
-- This policy currently allows any authenticated user to view all profiles
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON public.profiles;

-- The existing "Users can view their own profile" policy is sufficient
-- It restricts profile visibility to the profile owner only
-- Using Expression: (auth.uid() = user_id)

-- Optional: If you need other users to see basic profile info (like in forums/chat)
-- you can create a more specific policy later, but for now we're securing it completely