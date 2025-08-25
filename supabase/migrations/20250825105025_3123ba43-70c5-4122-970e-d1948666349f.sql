-- First delete any existing role for this user, then insert admin role
DELETE FROM public.user_roles WHERE user_id = '96e94b10-c82e-41d1-97cb-aefb84037f21';
INSERT INTO public.user_roles (user_id, role)
VALUES ('96e94b10-c82e-41d1-97cb-aefb84037f21', 'admin'::app_role);