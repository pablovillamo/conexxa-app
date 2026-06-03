console.log('[Roles] loaded');

// ============================================================
// CONEXXA — SISTEMA DE ROLES Y PERMISOS
// ============================================================

const USER_ROLES = {
  ADMIN:          'admin',
  CEO:            'ceo',
  PROGRAM_90D:    'program_90d',
  APP_CLIENT:     'app_client',
  SERVICE_CLIENT: 'service_client',
  COLLABORATOR:   'collaborator',
  CLIENT:         'client',   // legacy
};

// Roles que son cuentas comerciales (aparecen en Clientes)
const COMMERCIAL_ROLES = ['ceo', 'program_90d', 'app_client', 'service_client', 'client'];

// ── Normalización ─────────────────────────────────────────
// 'client' legacy → 'ceo' durante transición.
function normalizeRole(role) {
  if (!role) return null;
  if (role === 'client') return 'ceo';
  return role;
}

// ── Helpers de identidad ───────────────────────────────────
function isAdmin(profile)         { return normalizeRole(profile?.role) === 'admin'; }
function isCEO(profile)           { return normalizeRole(profile?.role) === 'ceo'; }
function isProgram90d(profile)    { return profile?.role === 'program_90d'; }
function isAppClient(profile)     { return profile?.role === 'app_client'; }
function isServiceClient(profile) { return profile?.role === 'service_client'; }
function isCollaborator(profile)  { return profile?.role === 'collaborator'; }
function isCommercialClient(profile) {
  return COMMERCIAL_ROLES.includes(profile?.role);
}

function isActiveUser(profile) {
  if (!profile) return false;
  if (profile.is_active === false) return false;
  return true;
}

// ── Catálogo de módulos ────────────────────────────────────
const CONEXXA_MODULES = [
  // key, label, admin, ceo, program_90d, app_client, service_client, collaboratorPermission
  { key:'dashboard',            label:'Dashboard',            admin:true, ceo:true,  program_90d:true,  app_client:true,  service_client:true,  collaboratorPermission:true  },
  { key:'progress',             label:'Progreso',             admin:true, ceo:true,  program_90d:true,  app_client:false, service_client:false, collaboratorPermission:true  },
  { key:'tasks',                label:'Tareas',               admin:true, ceo:true,  program_90d:true,  app_client:true,  service_client:true,  collaboratorPermission:true  },
  { key:'notes',                label:'Notas',                admin:true, ceo:true,  program_90d:true,  app_client:true,  service_client:true,  collaboratorPermission:true  },
  { key:'brain',                label:'Brain',                admin:true, ceo:true,  program_90d:false, app_client:false, service_client:false, collaboratorPermission:true  },
  { key:'modules',              label:'Módulos',              admin:true, ceo:true,  program_90d:false, app_client:false, service_client:false, collaboratorPermission:true  },
  { key:'finance',              label:'Finanzas',             admin:true, ceo:true,  program_90d:false, app_client:false, service_client:false, collaboratorPermission:true  },
  { key:'operations',           label:'Operaciones',          admin:true, ceo:true,  program_90d:false, app_client:false, service_client:false, collaboratorPermission:true  },
  { key:'store_intelligence',   label:'Store Intelligence',   admin:true, ceo:true,  program_90d:false, app_client:false, service_client:false, collaboratorPermission:true  },
  { key:'integrations',         label:'Integraciones',        admin:true, ceo:true,  program_90d:false, app_client:false, service_client:false, collaboratorPermission:true  },
  { key:'shopify_intelligence', label:'Shopify Intelligence', admin:true, ceo:true,  program_90d:false, app_client:false, service_client:false, collaboratorPermission:true  },
  { key:'inventory',            label:'Inventario',           admin:true, ceo:true,  program_90d:false, app_client:false, service_client:false, collaboratorPermission:true  },
  { key:'reports',              label:'Reportes',             admin:true, ceo:true,  program_90d:true,  app_client:true,  service_client:true,  collaboratorPermission:true  },
  { key:'team',                 label:'Mi Equipo',            admin:true, ceo:true,  program_90d:false, app_client:false, service_client:false, collaboratorPermission:false },
  { key:'settings',             label:'Configuración',        admin:true, ceo:true,  program_90d:true,  app_client:true,  service_client:true,  collaboratorPermission:false },
  { key:'program_deliverables', label:'Entregables',          admin:true, ceo:false, program_90d:true,  app_client:true,  service_client:true,  collaboratorPermission:false },
  { key:'roadmap',              label:'Roadmap',              admin:true, ceo:false, program_90d:false, app_client:true,  service_client:false, collaboratorPermission:false },
  { key:'users',                label:'Usuarios',             admin:true, ceo:false, program_90d:false, app_client:false, service_client:false, collaboratorPermission:false },
];

// ── Acceso a módulo ────────────────────────────────────────
function canAccessModule(profile, moduleKey, permissions) {
  if (!profile || !isActiveUser(profile)) return false;

  const role = normalizeRole(profile.role);
  if (role === 'admin') return true;

  const mod = CONEXXA_MODULES.find(m => m.key === moduleKey);
  if (!mod) return false;

  if (role === 'ceo')            return mod.ceo            === true;
  if (role === 'program_90d')    return mod.program_90d    === true;
  if (role === 'app_client')     return mod.app_client     === true;
  if (role === 'service_client') return mod.service_client === true;

  if (role === 'collaborator') {
    if (!mod.collaboratorPermission) return false;
    const perm = (permissions || []).find(p => p.module_key === moduleKey);
    return perm?.can_view === true;
  }

  return false;
}

// ── Acción granular ────────────────────────────────────────
function canPerformAction(profile, moduleKey, action, permissions) {
  if (!profile || !isActiveUser(profile)) return false;

  const role = normalizeRole(profile.role);
  if (role === 'admin') return true;
  if (!canAccessModule(profile, moduleKey, permissions)) return false;
  if (role === 'ceo')            return true;
  if (role === 'program_90d')    return action !== 'delete';
  if (role === 'app_client')     return action !== 'delete';
  if (role === 'service_client') return action !== 'delete';

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

function getVisibleModules(profile, permissions) {
  if (!profile) return [];
  return CONEXXA_MODULES.filter(m => canAccessModule(profile, m.key, permissions));
}

// ── Exposición global ──────────────────────────────────────
window.ConexxaRoles = {
  USER_ROLES,
  COMMERCIAL_ROLES,
  normalizeRole,
  isAdmin,
  isCEO,
  isProgram90d,
  isAppClient,
  isServiceClient,
  isCollaborator,
  isCommercialClient,
  isActiveUser,
  canAccessModule,
  canPerformAction,
  getVisibleModules,
  MODULES: CONEXXA_MODULES,
};
