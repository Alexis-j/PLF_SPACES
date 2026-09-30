-- PLF Spaces · Verificación de la base de datos
--
-- Todo lo de este archivo es de solo lectura. Pégalo entero en el SQL
-- editor de Supabase y revisa los resultados.
--
-- Es el guion de comprobación de lib/migrations/001 y 002. Ejecuta el
-- bloque 1 tras aplicar el PASTE 1 y el bloque 2 tras el PASTE 2.

-- =====================================================================
-- BLOQUE 1 · Después del PASTE 1 (aditivo)
-- =====================================================================

-- 1.1 Las tres funciones de seguridad existen y con las características
--     correctas. security_definer debe ser true y settings debe incluir
--     el search_path pineado.
SELECT
  p.proname,
  pg_get_function_result(p.oid) AS returns,
  p.prosecdef AS security_definer,
  p.proconfig AS settings
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
  AND p.proname IN (
    'is_super_admin',
    'protect_profile_role',
    'get_reviews_with_author',
    'is_business_member',
    'is_business_owner'
  )
ORDER BY p.proname;

-- 1.2 El trigger protector existe. Si no aparece, protect_profile_role()
--     no se está aplicando y profiles.role sigue siendo escribible.
SELECT tgname, tgrelid::regclass AS on_table, tgenabled
FROM pg_trigger
WHERE NOT tgisinternal AND tgname = 'on_profile_role_protected';

-- 1.3 handle_new_user() ya no menciona raw_user_meta_data->>'role'.
--     Si prosrc contiene "->>'role'", la escalada por signup sigue viva.
SELECT prosrc
FROM pg_proc
WHERE proname = 'handle_new_user';

-- 1.4 ESTADO: debe devolver 0 filas. Cualquier fila es un role que el
--     cliente ya tenía permiso de elegir: bájala a 'customer' a mano
--     tras confirmar que no es un admin legítimo.
SELECT email, role
FROM public.profiles
WHERE role NOT IN ('customer', 'business_owner', 'business_staff');

-- 1.5 Un admin legítimo existe y su profile está completo.
SELECT count(*) FILTER (WHERE role = 'super_admin') AS super_admins,
       count(*) FILTER (WHERE role = 'business_owner') AS owners,
       count(*) FILTER (WHERE role = 'customer') AS customers
FROM public.profiles;

-- 1.6 RLS sigue habilitado en las 10 tablas. categories debe aparecer:
--     en la base real ya lo estaba, aunque el schema del repo no lo
--     reflejaba.
SELECT relname, relrowsecurity
FROM pg_class
WHERE relnamespace = 'public'::regnamespace
  AND relkind = 'r'
ORDER BY relname;

-- 1.7 get_reviews_with_author responde y devuelve el nombre del autor.
--     Pasa un id de negocio que exista (sustituir).
SELECT * FROM public.get_reviews_with_author(
  (SELECT id FROM public.businesses LIMIT 1)
);


-- =====================================================================
-- BLOQUE 2 · Después del PASTE 2 (profiles privados)
-- =====================================================================

-- 2.1 La policy pública desapareció y la privada está en su lugar.
--     No debe quedar ninguna policy con USING (true) sobre profiles.
SELECT policyname, cmd, qual, with_check
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'profiles'
ORDER BY policyname;

-- 2.2 Cualquier policy que aún diga USING (true) sobre una tabla con
--     datos personales. businesses, reviews y posts son públicos por
--     diseño; profiles y followers no deberían aparecer aquí.
SELECT tablename, policyname
FROM pg_policies
WHERE schemaname = 'public'
  AND (qual = 'true' OR with_check = 'true')
  AND tablename IN ('profiles', 'followers', 'favorites', 'business_members')
ORDER BY tablename;


-- =====================================================================
-- BLOQUE 3 · Integridad de datos (siempre útil)
-- =====================================================================

-- 3.1 business_members huérfanos: apuntan a un profile que no existe.
--     Salen de un borrado de usuario a medias.
SELECT bm.id, bm.business_id, bm.user_id, bm.role
FROM public.business_members bm
LEFT JOIN public.profiles p ON p.id = bm.user_id
WHERE p.id IS NULL;

-- 3.2 negocios cuyo owner_id apunta a un profile inexistente.
SELECT b.id, b.name, b.owner_id
FROM public.businesses b
LEFT JOIN public.profiles p ON p.id = b.owner_id
WHERE b.owner_id IS NOT NULL AND p.id IS NULL;

-- 3.3 negocios sin owner ni miembros owner. El segundo owner no puede
--     añadirse a sí mismo (requireBusinessAccess exige una fila previa),
--     así que esto no lo arregla un script: hay que hacerlo por API.
SELECT b.id, b.name
FROM public.businesses b
WHERE NOT EXISTS (
  SELECT 1 FROM public.business_members bm
  WHERE bm.business_id = b.id AND bm.role = 'owner'
)
  AND b.owner_id IS NOT NULL;

-- 3.4 emails duplicados. profiles.email no tiene UNIQUE, y el código lo
--     busca con .single() en create-business y .maybeSingle() en team: dos
--     filas con el mismo email hacen fallar .single() con datos en null.
SELECT email, count(*) AS veces
FROM public.profiles
WHERE email IS NOT NULL AND email <> ''
GROUP BY email
HAVING count(*) > 1;

-- 3.5 Reseñas sin autor o con autor borrado.
SELECT r.id, r.business_id, r.user_id
FROM public.reviews r
LEFT JOIN public.profiles p ON p.id = r.user_id
WHERE p.id IS NULL;
