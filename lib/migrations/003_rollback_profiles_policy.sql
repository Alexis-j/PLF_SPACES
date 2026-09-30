-- PLF Spaces · 003 rollback de profiles
--
-- PASTE 3. Solo si PASTE 2 rompió algo y hay que volver atrás rápido.
--
-- Restaura la policy pública. Ojo: esto reabre el P0 #2, los emails
-- vuelven a ser públicos con la anon key. úsalo solo como pausa para
-- diagnosticar, no como estado final.

DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;

CREATE POLICY "Profiles are viewable by everyone"
  ON public.profiles FOR SELECT USING (true);

-- El trigger protect_profile_role() y las funciones de 001 se dejan
-- puestos a propósito: no reopen ninguna vía de escalada de privilegios.
--
-- Para revertir también el P0 #1 por completo, quita el trigger:
--   DROP TRIGGER IF EXISTS on_profile_role_protected ON public.profiles;
-- y restaura handle_new_user() desde lib/supabase-schema.sql.
