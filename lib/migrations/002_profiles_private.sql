-- PLF Spaces · 002 profiles privados
--
-- PASTE 2. Aplicar SOLO después de desplegar el código del commit 2
-- (las tabs de admin ya leen por /api/admin/* con service_role y
-- getReviews() ya va por get_reviews_with_author).
--
-- Cierra el P0 #2: profiles era legible con la anon key sin sesión,
-- exponiendo email, nombre y rol de todos los usuarios.
--
-- Comprobado antes de endurecer: GET /rest/v1/profiles devolvía las
-- filas con la anon key, sin sesión. El panel de admin sobrevivía
-- únicamente gracias a esa policy.

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

-- Cada quien ve su fila; los admins ven todas. La segunda cláusula
-- usa el helper SECURITY DEFINER: una subconsulta directa sobre
-- profiles dentro de su propia policy entraría en recursión.
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT USING (
    auth.uid() = id OR public.is_super_admin()
  );

-- La policy de UPDATE se mantiene: "update own profile" sigue siendo
-- lo que permite al usuario editar su nombre o avatar. Lo que impide
-- que se convierta en escalada de privilegios es protect_profile_role()
-- (001), no esta policy.

-- Nota sobre subconsultas ajenas: las policies de businesses y
-- business_members leen profiles para comprobar el rol de admin. Sus
-- subconsultas pasan por RLS, pero filtran por id = auth.uid(), que
-- la policy de arriba sigue admitiendo. Por eso siguen funcionando.
