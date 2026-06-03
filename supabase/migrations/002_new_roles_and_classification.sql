-- ============================================================
-- CONEXXA — MIGRACIÓN 002: NUEVOS ROLES Y CLASIFICACIÓN
-- Ejecutar en: Supabase Dashboard → SQL Editor
-- Seguro: no borra datos, solo actualiza roles.
-- ============================================================

-- ── 1. Actualizar constraint para incluir nuevos roles ─────

ALTER TABLE profiles
  DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE profiles
  ADD CONSTRAINT profiles_role_check
  CHECK (role IN (
    'admin',
    'ceo',
    'program_90d',
    'app_client',
    'service_client',
    'collaborator',
    'client'
  ));

-- ── 2. Admins ──────────────────────────────────────────────

UPDATE profiles
SET role        = 'admin',
    account_type = NULL,
    is_active    = true,
    updated_at   = now()
WHERE lower(email) IN (
  'pablovillamo123@gmail.com',
  'noelia.globalshoes@gmail.com'
);

-- ── 3. CEOs ────────────────────────────────────────────────

UPDATE profiles
SET role         = 'ceo',
    account_type = 'ceo',
    is_active    = true,
    updated_at   = now()
WHERE lower(email) IN (
  'marketing@zoecr.online',
  'onlinecalzado365@gmail.com'
);

-- ── 4. Programa 90D ────────────────────────────────────────

UPDATE profiles
SET role         = 'program_90d',
    account_type = 'program_90d',
    is_active    = true,
    updated_at   = now()
WHERE lower(email) IN (
  'beautygemscostarica@gmail.com',
  'grupozyko@gmail.com',
  'casafrancisca00@gmail.com',
  'suntouchcostarica@gmail.com',
  'diecinuevecostarica@gmail.com',
  'conexxatienda@gmail.com'
);

-- ── 5. Apps ────────────────────────────────────────────────

UPDATE profiles
SET role         = 'app_client',
    account_type = 'apps',
    is_active    = true,
    updated_at   = now()
WHERE lower(email) IN (
  'alejandrosolanorodriguez@gmail.com',
  'ciclicacr@gmail.com'
);

-- ── 6. Consultoría / Servicios ─────────────────────────────

UPDATE profiles
SET role         = 'service_client',
    account_type = 'consultoria_servicios',
    is_active    = true,
    updated_at   = now()
WHERE lower(email) IN (
  'adri181099@gmail.com'
);

-- ── 7. Verificación ────────────────────────────────────────

SELECT email, full_name, role, account_type, is_active
FROM profiles
ORDER BY role, full_name;
