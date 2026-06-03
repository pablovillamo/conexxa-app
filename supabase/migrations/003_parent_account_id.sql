-- ============================================================
-- CONEXXA — MIGRACIÓN 003: PARENT ACCOUNT ID
-- Reemplaza el concepto parent_ceo_id por parent_account_id
-- para soportar equipos en cualquier tipo de cuenta cliente.
-- Ejecutar en: Supabase Dashboard → SQL Editor
-- Seguro: no borra parent_ceo_id, solo agrega y copia.
-- ============================================================

-- ── 1. Agregar columna parent_account_id ───────────────────

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS parent_account_id uuid
  REFERENCES profiles(id) ON DELETE SET NULL;

-- ── 2. Copiar datos desde parent_ceo_id (si existen) ───────

UPDATE profiles
SET parent_account_id = parent_ceo_id
WHERE parent_account_id IS NULL
  AND parent_ceo_id IS NOT NULL;

-- ── 3. Índice ──────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_profiles_parent_account_id
  ON profiles(parent_account_id);

-- ── 4. Verificación ────────────────────────────────────────

SELECT
  p.email,
  p.role,
  p.account_type,
  p.parent_account_id,
  parent.email  AS parent_email,
  parent.role   AS parent_role
FROM profiles p
LEFT JOIN profiles parent ON parent.id = p.parent_account_id
ORDER BY p.role, p.email;

-- ── NOTA PARA MIGRACIÓN FUTURA ─────────────────────────────
-- parent_ceo_id queda como columna legacy.
-- Las políticas RLS en 001_roles_system.sql usan parent_ceo_id.
-- Migrar RLS en una fase posterior cuando todo esté validado:
--
-- DROP POLICY "ceo_reads_collaborators" ON profiles;
-- CREATE POLICY "account_reads_collaborators" ON profiles FOR SELECT
--   USING (parent_account_id = auth.uid());
--
-- DROP POLICY "ceo_updates_own_collaborators" ON profiles;
-- CREATE POLICY "account_updates_collaborators" ON profiles FOR UPDATE
--   USING (parent_account_id = auth.uid() AND role = 'collaborator')
--   WITH CHECK (role = 'collaborator' AND parent_account_id = auth.uid());
--
-- DROP POLICY "ceo_manages_collaborator_permissions" ON user_module_permissions;
-- CREATE POLICY "account_manages_collaborator_permissions"
--   ON user_module_permissions FOR ALL
--   USING (
--     EXISTS (
--       SELECT 1 FROM profiles p
--       WHERE p.id = user_module_permissions.user_id
--         AND p.parent_account_id = auth.uid()
--         AND p.role = 'collaborator'
--     )
--   );
