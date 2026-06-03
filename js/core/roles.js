console.log('[Roles] loaded');

// ============================================================
// CONEXXA — SISTEMA DE ROLES Y PERMISOS
// Fuente única de verdad para control de acceso.
// No duplicar esta lógica en ningún otro archivo.
// ============================================================

// ── Normalización ─────────────────────────────────────────
// 'client' es legacy — se trata como 'ceo' durante transición.
function normalizeRole(role) {
  if (!role) return null;
  if (role === 'client') return 'ceo';
  return role;
}

// ── Helpers de identidad ───────────────────────────────────
function isAdmin(profile)        { return normalizeRole(profile?.role) === 'admin'; }
function isCEO(profile)          { return normalizeRole(profile?.role) === 'ceo'; }
function isProgram90d(profile)   { return normalizeRole(profile?.role) === 'program_90d'; }
function isCollaborator(profile) { return normalizeRole(profile?.role) === 'collaborator'; }

function isActiveUser(profile) {
  if (!profile) return false;
  if (profile.is_active === false) return false;
  return true;
}

// ── Catálogo de módulos ────────────────────────────────────
// Fuente de verdad: qué módulos existen y quién puede verlos.
const CONEXXA_MODULES = [
  { key:'dashboard',            label:'Dashboard',            admin:true,  ceo:true,  program_90d:true,  collaboratorPermission:true  },
  { key:'progress',             label:'Progreso',             admin:true,  ceo:true,  program_90d:true,  collaboratorPermission:true  },
  { key:'tasks',                label:'Tareas',               admin:true,  ceo:true,  program_90d:true,  collaboratorPermission:true  },
  { key:'notes',                label:'Notas',                admin:true,  ceo:true,  program_90d:true,  collaboratorPermission:true  },
  { key:'brain',                label:'Brain',                admin:true,  ceo:true,  program_90d:false, collaboratorPermission:true  },
  { key:'modules',              label:'Módulos',              admin:true,  ceo:true,  program_90d:false, collaboratorPermission:true  },
  { key:'finance',              label:'Finanzas',             admin:true,  ceo:true,  program_90d:false, collaboratorPermission:true  },
  { key:'operations',           label:'Operaciones',          admin:true,  ceo:true,  program_90d:false, collaboratorPermission:true  },
  { key:'store_intelligence',   label:'Store Intelligence',   admin:true,  ceo:true,  program_90d:false, collaboratorPermission:true  },
  { key:'integrations',         label:'Integraciones',        admin:true,  ceo:true,  program_90d:false, collaboratorPermission:true  },
  { key:'shopify_intelligence', label:'Shopify Intelligence', admin:true,  ceo:true,  program_90d:false, collaboratorPermission:true  },
  { key:'inventory',            label:'Inventario',           admin:true,  ceo:true,  program_90d:false, collaboratorPermission:true  },
  { key:'reports',              label:'Reportes',             admin:true,  ceo:true,  program_90d:true,  collaboratorPermission:true  },
  { key:'team',                 label:'Mi Equipo',            admin:true,  ceo:true,  program_90d:false, collaboratorPermission:false },
  { key:'settings',             label:'Configuración',        admin:true,  ceo:true,  program_90d:true,  collaboratorPermission:false },
  { key:'program_deliverables', label:'Entregables',          admin:true,  ceo:false, program_90d:true,  collaboratorPermission:false },
  { key:'users',                label:'Usuarios',             admin:true,  ceo:false, program_90d:false, collaboratorPermission:false },
];

// ── Acceso a módulo ────────────────────────────────────────
// permissions = array de user_module_permissions del usuario actual.
function canAccessModule(profile, moduleKey, permissions) {
  if (!profile || !isActiveUser(profile)) return false;

  const role = normalizeRole(profile.role);
  if (role === 'admin') return true;

  const mod = CONEXXA_MODULES.find(m => m.key === moduleKey);
  if (!mod) return false;

  if (role === 'ceo')        return mod.ceo === true;
  if (role === 'program_90d') return mod.program_90d === true;

  if (role === 'collaborator') {
    if (!mod.collaboratorPermission) return false;
    const perm = (permissions || []).find(p => p.module_key === moduleKey);
    return perm?.can_view === true;
  }

  return false;
}

// ── Acción granular ────────────────────────────────────────
// action: 'view' | 'create' | 'edit' | 'delete'
function canPerformAction(profile, moduleKey, action, permissions) {
  if (!profile || !isActiveUser(profile)) return false;

  const role = normalizeRole(profile.role);
  if (role === 'admin') return true;

  if (!canAccessModule(profile, moduleKey, permissions)) return false;

  if (role === 'ceo')        return true;
  if (role === 'program_90d') return action !== 'delete';

  if (role === 'collaborator') {
    const perm = (permissions || []).find(p => p.module_key === moduleKey);
    if (!perm?.can_view) return false;
    if (action === 'view')   return perm.can_view   === true;
    if (action === 'create') return perm.can_create === true;
    if (action === 'edit')   return perm.can_edit   === true;
    if (action === 'delete') return perm.can_delete === true;
  }

  return false;
}

// ── Módulos visibles para un rol ───────────────────────────
function getVisibleModules(profile, permissions) {
  if (!profile) return [];
  return CONEXXA_MODULES.filter(m => canAccessModule(profile, m.key, permissions));
}

// ── Exposición global ──────────────────────────────────────
window.ConexxaRoles = {
  normalizeRole,
  isAdmin,
  isCEO,
  isProgram90d,
  isCollaborator,
  isActiveUser,
  canAccessModule,
  canPerformAction,
  getVisibleModules,
  MODULES: CONEXXA_MODULES,
};
