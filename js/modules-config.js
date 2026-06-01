// ============================================================
// V-GROWTH OS — REGISTRO CENTRAL DE MÓDULOS
// Fuente única de verdad para todas las cards del OS dashboard.
// Estados: active | locked | coming_soon | hidden | internal
// ============================================================

const OS_MODULES = [

  // ── VILLAMO GROWTH ────────────────────────────────────────
  {
    id:          'vg-program',
    name:        'Programa 90 Días',
    description: 'Gestión de clientes activos, progreso por fases y módulos del programa.',
    icon:        '🚀',
    status:      'active',
    category:    'villamo',
    action:      () => showAdminView('clients'),
    order:       1,
  },
  {
    id:          'vg-brain',
    name:        'Brain Clonado IA',
    description: 'Documentos estratégicos generados con IA: identidad, oferta, cliente ideal y más.',
    icon:        '🧠',
    status:      'active',
    category:    'villamo',
    action:      () => showAdminView('brain'),
    order:       2,
  },
  {
    id:          'vg-ecommerce',
    name:        'Ecommerce OS',
    description: 'Métricas Shopify, productos sincronizados, órdenes y conexiones ecommerce.',
    icon:        '🛒',
    status:      'active',
    category:    'villamo',
    action:      () => showAdminView('clients'),
    order:       3,
  },
  {
    id:          'vg-tasks',
    name:        'Tareas y Tracker',
    description: 'Asignación de tareas, checklists operativos y seguimiento de entregables.',
    icon:        '✅',
    status:      'active',
    category:    'villamo',
    action:      () => showAdminView('tasks'),
    order:       4,
  },

  // ── CORE OS ───────────────────────────────────────────────
  {
    id:          'core-crm',
    name:        'CRM Central',
    description: 'Base de datos unificada de clientes, contactos y segmentaciones por perfil.',
    icon:        '👥',
    status:      'coming_soon',
    category:    'core',
    action:      null,
    order:       10,
  },
  {
    id:          'core-docs',
    name:        'Documentos',
    description: 'Gestión centralizada de contratos, propuestas, SOPs y documentos internos.',
    icon:        '📄',
    status:      'coming_soon',
    category:    'core',
    action:      null,
    order:       11,
  },
  {
    id:          'core-meetings',
    name:        'Reuniones',
    description: 'Registro de auditorías, sesiones de trabajo y minutas de reuniones.',
    icon:        '🎙️',
    status:      'coming_soon',
    category:    'core',
    action:      null,
    order:       12,
  },
  {
    id:          'core-kpis',
    name:        'KPIs Dashboard',
    description: 'Panel de métricas globales: CR, AOV, LTV, CAC, ROAS por cliente y período.',
    icon:        '📊',
    status:      'coming_soon',
    category:    'core',
    action:      null,
    order:       13,
  },
  {
    id:          'core-resources',
    name:        'Recursos',
    description: 'Biblioteca de entregables, materiales educativos y recursos por módulo.',
    icon:        '📚',
    status:      'coming_soon',
    category:    'core',
    action:      null,
    order:       14,
  },

  // ── BUSINESS OS ──────────────────────────────────────────
  {
    id:          'os-ceo',
    name:        'CEO OS',
    description: 'Dashboard ejecutivo con visión estratégica, OKRs y decisiones clave del negocio.',
    icon:        '🎯',
    status:      'coming_soon',
    category:    'business',
    action:      null,
    order:       20,
  },
  {
    id:          'os-operations',
    name:        'Operaciones OS',
    description: 'SOPs, flujos de trabajo, automatizaciones y gestión operativa del negocio.',
    icon:        '⚙️',
    status:      'coming_soon',
    category:    'business',
    action:      null,
    order:       21,
  },
  {
    id:          'os-inventory',
    name:        'Inventario OS',
    description: 'Control de stock, movimientos de inventario, alertas y trazabilidad de productos.',
    icon:        '📦',
    status:      'coming_soon',
    category:    'business',
    action:      null,
    order:       22,
  },
  {
    id:          'os-purchasing',
    name:        'Compras OS',
    description: 'Gestión de proveedores, órdenes de compra, costos y negociaciones.',
    icon:        '🛍️',
    status:      'coming_soon',
    category:    'business',
    action:      null,
    order:       23,
  },
  {
    id:          'os-rrhh',
    name:        'RRHH OS',
    description: 'Gestión de equipo, roles, onboarding, capacitación y cultura organizacional.',
    icon:        '🤝',
    status:      'coming_soon',
    category:    'business',
    action:      null,
    order:       24,
  },
  {
    id:          'os-cx',
    name:        'Customer Success OS',
    description: 'Retención, NPS, ciclo de vida del cliente y estrategias de fidelización.',
    icon:        '💬',
    status:      'coming_soon',
    category:    'business',
    action:      null,
    order:       25,
  },
  {
    id:          'os-brand',
    name:        'Marca y Producto OS',
    description: 'Estrategia de marca, roadmap de producto, identidad visual y posicionamiento.',
    icon:        '🎨',
    status:      'coming_soon',
    category:    'business',
    action:      null,
    order:       26,
  },
  {
    id:          'os-franchise',
    name:        'Franquicias OS',
    description: 'Modelo de expansión, manual de franquicias, gestión de nuevas unidades.',
    icon:        '🏪',
    status:      'locked',
    category:    'business',
    action:      null,
    order:       27,
  },

  // ── INTEGRACIONES ─────────────────────────────────────────
  {
    id:          'int-shopify',
    name:        'Shopify',
    description: 'Conexión activa. Sincronización de productos, órdenes y métricas en tiempo real.',
    icon:        '🛒',
    status:      'active',
    category:    'integrations',
    action:      () => showAdminView('clients'),
    order:       40,
  },
  {
    id:          'int-meta',
    name:        'Meta Ads',
    description: 'Métricas de campañas Facebook e Instagram Ads, ROAS y audiencias.',
    icon:        '📱',
    status:      'coming_soon',
    category:    'integrations',
    action:      null,
    order:       41,
  },
  {
    id:          'int-klaviyo',
    name:        'Klaviyo',
    description: 'Email marketing, flujos automatizados, tasas de apertura y conversión.',
    icon:        '📧',
    status:      'coming_soon',
    category:    'integrations',
    action:      null,
    order:       42,
  },
  {
    id:          'int-manychat',
    name:        'ManyChat',
    description: 'Automatizaciones de chat, keyword triggers y flujos de conversión.',
    icon:        '💬',
    status:      'coming_soon',
    category:    'integrations',
    action:      null,
    order:       43,
  },
  {
    id:          'int-google',
    name:        'Google Drive',
    description: 'Sincronización de documentos, carpetas de clientes y entregables.',
    icon:        '📁',
    status:      'coming_soon',
    category:    'integrations',
    action:      null,
    order:       44,
  },

  // ── IA OS ─────────────────────────────────────────────────
  {
    id:          'ai-brain',
    name:        'IA OS',
    description: 'Generación de documentos estratégicos, análisis de datos y automatización inteligente.',
    icon:        '🤖',
    status:      'active',
    category:    'ai',
    action:      () => showAdminView('clients'),
    order:       50,
  },
];

// ── Helpers ───────────────────────────────────────────────
function getModulesByCategory(category) {
  return OS_MODULES
    .filter(m => m.category === category && m.status !== 'hidden')
    .sort((a, b) => a.order - b.order);
}

function getModuleById(id) {
  return OS_MODULES.find(m => m.id === id) || null;
}

window.OS_MODULES      = OS_MODULES;
window.getModulesByCategory = getModulesByCategory;
window.getModuleById   = getModuleById;

// ── Tipos de negocio ──────────────────────────────────────

const BUSINESS_TYPES = {
  ecommerce:      { label:'Ecommerce',      color:'#22C55E', bg:'rgba(34,197,94,.1)',   icon:'🛒' },
  retail:         { label:'Retail',          color:'#6366F1', bg:'rgba(99,102,241,.1)',  icon:'🏪' },
  app:            { label:'App',             color:'#14B8A6', bg:'rgba(20,184,166,.1)',  icon:'📱' },
  consulting:     { label:'Consultoría',     color:'#F59E0B', bg:'rgba(245,158,11,.1)', icon:'💼' },
  personal_brand: { label:'Marca Personal',  color:'#EC4899', bg:'rgba(236,72,153,.1)', icon:'⭐' },
  franchise:      { label:'Franquicia',      color:'#8B5CF6', bg:'rgba(139,92,246,.1)', icon:'🔗' },
  hybrid:         { label:'Ecommerce & Retail', color:'#F97316', bg:'rgba(249,115,22,.1)', icon:'🔀' },
};

const INTEGRATIONS_BY_TYPE = {
  ecommerce:      ['shopify','meta','klaviyo','manychat','whatsapp','google-drive','payment'],
  retail:         ['pos','inventory','google-drive','whatsapp','meta','auditorias','reports'],
  app:            ['analytics','users','subscriptions','crm','email','google-drive'],
  consulting:     ['crm','proposals','documents','google-drive','calendar','email'],
  personal_brand: ['instagram','tiktok','email','crm','google-drive','calendar'],
  franchise:      ['auditorias','sucursales','manuales','kpis','inventory','google-drive'],
  hybrid:         ['shopify','meta','klaviyo','pos','inventory','google-drive'],
};

// Tipos que califican como ecommerce para Ecommerce OS
const ECOMMERCE_TYPES = ['ecommerce', 'hybrid'];

function getBusinessType(raw) {
  if (!raw) return null;
  const key = raw.toLowerCase().trim();
  return BUSINESS_TYPES[key] || null;
}

function isEcommerceClient(client) {
  const bt = (client.business_type || '').toLowerCase().trim();
  return ECOMMERCE_TYPES.includes(bt);
}

window.BUSINESS_TYPES        = BUSINESS_TYPES;
window.INTEGRATIONS_BY_TYPE  = INTEGRATIONS_BY_TYPE;
window.ECOMMERCE_TYPES       = ECOMMERCE_TYPES;
window.getBusinessType       = getBusinessType;
window.isEcommerceClient     = isEcommerceClient;
