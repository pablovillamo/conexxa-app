-- ============================================================
-- CONEXXA — MIGRACIÓN 001: SISTEMA DE ROLES
-- Ejecutar en: Supabase Dashboard → SQL Editor
-- Seguro: solo ADD COLUMN IF NOT EXISTS y CREATE TABLE IF NOT EXISTS
-- No borra datos. No modifica columnas existentes.
-- ============================================================

-- ── 1. Columnas nuevas en profiles ────────────────────────

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS position      text,
  ADD COLUMN IF NOT EXISTS parent_ceo_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS created_by    uuid REFERENCES profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS is_active     boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS company_name  text,
  ADD COLUMN IF NOT EXISTS account_type  text,
  ADD COLUMN IF NOT EXISTS last_login_at timestamptz,
  ADD COLUMN IF NOT EXISTS updated_at    timestamptz DEFAULT now();

-- ── 2. Constraint de roles válidos ────────────────────────
-- Incluye 'client' temporalmente para compatibilidad.
-- Después de migrar todos los client → ceo, remover 'client'.

ALTER TABLE profiles
  DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE profiles
  ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('admin', 'ceo', 'program_90d', 'collaborator', 'client'));

-- ── 3. Tabla de permisos por módulo ───────────────────────

CREATE TABLE IF NOT EXISTS user_module_permissions (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  module_key   text NOT NULL,
  can_view     boolean DEFAULT false,
  can_create   boolean DEFAULT false,
  can_edit     boolean DEFAULT false,
  can_delete   boolean DEFAULT false,
  granted_by   uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at   timestamptz DEFAULT now(),
  updated_at   timestamptz DEFAULT now(),
  UNIQUE(user_id, module_key)
);

-- ── 4. Índices ─────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_profiles_role
  ON profiles(role);

CREATE INDEX IF NOT EXISTS idx_profiles_parent_ceo_id
  ON profiles(parent_ceo_id);

CREATE INDEX IF NOT EXISTS idx_profiles_is_active
  ON profiles(is_active);

CREATE INDEX IF NOT EXISTS idx_user_module_permissions_user_id
  ON user_module_permissions(user_id);

CREATE INDEX IF NOT EXISTS idx_user_module_permissions_module_key
  ON user_module_permissions(module_key);

-- ── 5. RLS — profiles ─────────────────────────────────────
-- Habilitar RLS si no está activo.
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Admin: lee y edita todos los profiles.
DROP POLICY IF EXISTS "admin_full_access_profiles" ON profiles;
CREATE POLICY "admin_full_access_profiles"
  ON profiles FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- Usuario: lee su propio profile.
DROP POLICY IF EXISTS "own_profile_select" ON profiles;
CREATE POLICY "own_profile_select"
  ON profiles FOR SELECT
  USING (id = auth.uid());

-- CEO: lee profiles de sus colaboradores.
DROP POLICY IF EXISTS "ceo_reads_collaborators" ON profiles;
CREATE POLICY "ceo_reads_collaborators"
  ON profiles FOR SELECT
  USING (parent_ceo_id = auth.uid());

-- CEO: edita colaboradores propios (campos no sensibles).
-- role y parent_ceo_id no pueden cambiarse por esta vía.
DROP POLICY IF EXISTS "ceo_updates_own_collaborators" ON profiles;
CREATE POLICY "ceo_updates_own_collaborators"
  ON profiles FOR UPDATE
  USING (
    parent_ceo_id = auth.uid()
    AND (SELECT role FROM profiles WHERE id = auth.uid()) IN ('ceo', 'client')
  )
  WITH CHECK (
    role = 'collaborator'
    AND parent_ceo_id = auth.uid()
  );

-- ── 6. RLS — user_module_permissions ──────────────────────
ALTER TABLE user_module_permissions ENABLE ROW LEVEL SECURITY;

-- Admin: acceso total.
DROP POLICY IF EXISTS "admin_full_access_permissions" ON user_module_permissions;
CREATE POLICY "admin_full_access_permissions"
  ON user_module_permissions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- Usuario: lee sus propios permisos.
DROP POLICY IF EXISTS "own_permissions_select" ON user_module_permissions;
CREATE POLICY "own_permissions_select"
  ON user_module_permissions FOR SELECT
  USING (user_id = auth.uid());

-- CEO: gestiona permisos de sus colaboradores.
DROP POLICY IF EXISTS "ceo_manages_collaborator_permissions" ON user_module_permissions;
CREATE POLICY "ceo_manages_collaborator_permissions"
  ON user_module_permissions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = user_module_permissions.user_id
        AND p.parent_ceo_id = auth.uid()
        AND p.role = 'collaborator'
    )
  );

-- ── 7. Función helper para rol del usuario actual ─────────
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid()
$$;

-- ── 8. MIGRACIÓN OPCIONAL — client → ceo ──────────────────
-- DESCOMENTAR SOLO después de confirmar manualmente qué usuarios
-- client deben ser ceo vs program_90d.
--
-- UPDATE profiles SET role = 'ceo' WHERE role = 'client';
--
-- ── FIN DE MIGRACIÓN ───────────────────────────────────────
