-- Assign admin role to bosse@turingforum.dk
INSERT INTO public.user_roles (user_id, role)
VALUES ('96e94b10-c82e-41d1-97cb-aefb84037f21', 'admin'::app_role)
ON CONFLICT (user_id) 
DO UPDATE SET role = 'admin'::app_role;