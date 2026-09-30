-- PLF Spaces · 001 Security hardening
--
-- Cierra tres problemas P0:
--   1. Escalada de privilegios: cualquiera podía convertirse en super_admin.
--   2. Fuga de PII: profiles era legible con la anon key (emails incluidos).
--   3. (El XSS se arregla en código: lib/safe-url.ts)
--
-- IMPORTANTE: a partir de aquí la fuente de verdad del schema son las
-- migraciones de este directorio. lib/supabase-schema.sql queda como
-- bootstrap de una instalación vacía y ya NO refleja la base de datos real.
--
-- El archivo está partido en tres bloques (PASTE 1, PASTE 2, PASTE 3) para
-- poder desplegar sin dejar la aplicación rota en ningún momento:
--
--   PASTE 1 (este archivo, hasta el final)  → aditivo, nada restrictivo.
--   PASTE 2 (lib/migrations/002_*)          → cierra la policy de profiles.
--   PASTE 3 (lib/migrations/003_*)          → solo si algo salió mal.
--
-- Aplicar PASTE 1, desplegar el código, y solo entonces PASTE 2.


-- =====================================================================
-- PASTE 1 · Funciones, trigger protector y grants
-- Todo lo de este bloque es aditivo: la app sigue funcionando igual.
-- =====================================================================


-- -------------------------------------------------------------------------
-- is_super_admin()
--
-- Las policies que consultan profiles desde otra tabla (businesses,
-- business_members) necesitan leer el rol. Con la policy de profiles
-- restringida a "mi propia fila", esas subconsultas empezarían a fallar
-- en silencio, así que el chequeo de admin tiene que vivir en un helper.
--
-- SECURITY DEFINER corre como dueño de la tabla y evita que RLS se
-- re-evalúe: sin esto, una policy sobre profiles que subconsulta profiles
-- provoke "infinite recursion detected in policy".
-- -------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
      AND role = 'super_admin'
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, pg_temp;

GRANT EXECUTE ON FUNCTION public.is_super_admin() TO anon, authenticated, service_role;


-- -------------------------------------------------------------------------
-- protect_profile_role()
--
-- Última línea de defensa del P0 #1. Ningún cliente puede cambiar su
-- propio role: el trigger aborta la sentencia con 42501 (insufficient
-- privilege), que es el mismo código que usa RLS.
--
-- current_user es 'service_role' cuando la llamada viene de
-- supabaseAdmin(), y 'postgres' desde el SQL editor de Supabase. Los
-- triggers se ejecutan también para service_role, así que la puerta
-- administrativa sigue abierta sin abrirla para el resto.
--
-- Los writes legítimos de role (seed-admin, create-business) pasan por
-- service_role, de modo que ninguno necesita cambios.
-- -------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.protect_profile_role()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role
     AND current_user NOT IN ('postgres', 'service_role') THEN
    RAISE EXCEPTION 'profiles.role can only be changed by the server'
      USING ERRCODE = '42501';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

DROP TRIGGER IF EXISTS on_profile_role_protected ON public.profiles;
CREATE TRIGGER on_profile_role_protected
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.protect_profile_role();


-- -------------------------------------------------------------------------
-- get_reviews_with_author()
--
-- getReviews() hacía un embed profiles(full_name) con la anon key. Al
-- cerrar la policy de profiles ese embed se quedaría sin datos y las
-- reseñas aparecerían sin autor. Esta función hace el join por dentro
-- como SECURITY DEFINER y expone solo el nombre.
--
-- No devuelve user_id ni email a propósito: el id público de autor no lo
-- usa nadie y es el camino más corto para reidentificar a un usuario.
-- -------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_reviews_with_author(p_business_id UUID)
RETURNS TABLE (
  id UUID,
  rating INTEGER,
  comment TEXT,
  created_at TIMESTAMPTZ,
  user_name TEXT
) AS $$
  SELECT
    r.id,
    r.rating,
    r.comment,
    r.created_at,
    COALESCE(p.full_name, 'Guest')
  FROM public.reviews r
  LEFT JOIN public.profiles p ON p.id = r.user_id
  WHERE r.business_id = p_business_id
  ORDER BY r.created_at DESC;
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, pg_temp;

GRANT EXECUTE ON FUNCTION public.get_reviews_with_author(UUID) TO anon, authenticated, service_role;


-- -------------------------------------------------------------------------
-- handle_new_user() corregido
--
-- Este era el vector A del P0 #1. raw_user_meta_data lo escribe el
-- cliente, así que con COALESCE(..., raw_user_meta_data->>'role', ...)
-- cualquiera podía pedir el signup con role: 'super_admin' y el trigger
-- se lo concedía. El rol ahora es una constante.
-- -------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data ->> 'full_name',
    'customer'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- -------------------------------------------------------------------------
-- State check: deja esto al final del PASTE 1.
-- Debe devolver 0. Si devuelve algo, hay filas con un role que el
-- cliente ya tenía permiso de elegir: bájalas a 'customer' a mano
-- después de confirmar que son legítimas.
-- -------------------------------------------------------------------------
-- SELECT email, role FROM public.profiles
--  WHERE role NOT IN ('customer', 'business_owner', 'business_staff');
