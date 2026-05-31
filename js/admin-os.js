// ============================================================
// V-GROWTH OS — COMMAND CENTER
// ============================================================

console.log('[AdminOS] loaded');

// ── Sidebar nav items ─────────────────────────────────────

const SIDEBAR_CORE = [
  { id:'os',       icon:'⚡', label:'Dashboard',        status:'active',  action:() => showAdminView('os')      },
  { id:'clients',  icon:'👥', label:'Clientes',          status:'active',  action:() => showAdminView('clients') },
  { id:'brain',    icon:'🧠', label:'Brain IA',          status:'active',  action:() => showAdminView('clients') },
  { id:'tasks',    icon:'✅', label:'Tareas',             status:'active',  action:() => showAdminView('clients') },
  { id:'notes',    icon:'📝', label:'Notas',              status:'coming'   },
  { id:'crm',      icon:'🗃️', label:'CRM',               status:'coming'   },
  { id:'docs',     icon:'📄', label:'Documentos',        status:'coming'   },
  { id:'resources',icon:'📚', label:'Recursos',           status:'coming'   },
  { id:'meetings', icon:'🎙️', label:'Reuniones',         status:'coming'   },
  { id:'kpis',     icon:'📊', label:'KPIs',              status:'coming'   },
  { id:'ia',       icon:'🤖', label:'IA',                status:'coming'   },
];

const SIDEBAR_MODULES = [
  { id:'ceo',      icon:'🎯', label:'CEO OS',            status:'coming'  },
  { id:'ops',      icon:'⚙️', label:'Operaciones OS',   status:'coming'  },
  { id:'inv',      icon:'📦', label:'Inventario OS',     status:'coming'  },
  { id:'purch',    icon:'🛍️', label:'Compras OS',       status:'coming'  },
  { id:'rrhh',     icon:'🤝', label:'RRHH OS',           status:'coming'  },
  { id:'ecom',     icon:'🛒', label:'Ecommerce OS',      status:'active',  action:() => showAdminView('clients') },
  { id:'cx',       icon:'💬', label:'Customer Success',  status:'coming'  },
  { id:'franchise',icon:'🏪', label:'Franquicias OS',    status:'locked'  },
  { id:'brand',    icon:'🎨', label:'Marca y Producto',  status:'coming'  },
  { id:'ia-os',    icon:'🤖', label:'IA OS',             status:'coming'  },
  { id:'vg',       icon:'🚀', label:'Villamo Growth',    status:'active',  action:() => showAdminView('clients') },
];

// ── Sync sidebar avatar + name ────────────────────────────

function syncSidebarUser() {
  const nameEl   = document.getElementById('user-name-display');
  const avatarEl = document.getElementById('user-avatar');
  const osbName  = document.getElementById('osb-user-name');
  const osbAvatar= document.getElementById('osb-user-avatar');
  if (osbName   && nameEl)   osbName.textContent   = nameEl.textContent || '—';
  if (osbAvatar && avatarEl) osbAvatar.innerHTML    = avatarEl.innerHTML || 'VG';
}

// ── Render sidebar nav ────────────────────────────────────

function renderSidebarNav() {
  const coreEl    = document.getElementById('osb-nav-core');
  const modulesEl = document.getElementById('osb-nav-modules');
  if (!coreEl || !modulesEl) return;

  const buildItem = (item) => {
    const isActive  = item.status === 'active';
    const isComing  = item.status === 'coming';
    const isLocked  = item.status === 'locked';
    const badge = isActive ? ''
      : isComing ? `<span class="osb-item-badge osb-badge-soon">Soon</span>`
      : `<span class="osb-item-badge osb-badge-locked">🔒</span>`;
    const cls = `osb-item${isActive ? '' : isComing ? ' is-coming' : ' is-locked'}`;
    const click = isActive && item.action
      ? `onclick="osbNavigate('${item.id}')"`
      : '';
    return `<button class="${cls}" id="osb-item-${item.id}" ${click}>
      <span class="osb-item-icon">${item.icon}</span>
      <span class="osb-item-label">${item.label}</span>
      ${badge}
    </button>`;
  };

  coreEl.innerHTML    = SIDEBAR_CORE.map(buildItem).join('');
  modulesEl.innerHTML = SIDEBAR_MODULES.map(buildItem).join('');
  syncSidebarUser();
}

function osbNavigate(itemId) {
  const allItems = [...SIDEBAR_CORE, ...SIDEBAR_MODULES];
  const item = allItems.find(i => i.id === itemId);
  if (item && item.action) item.action();
}

function setSidebarActive(viewId) {
  document.querySelectorAll('.osb-item').forEach(el => el.classList.remove('active'));
  const el = document.getElementById('osb-item-' + viewId);
  if (el) el.classList.add('active');
}

window.osbNavigate     = osbNavigate;
window.setSidebarActive = setSidebarActive;
window.renderSidebarNav = renderSidebarNav;
window.syncSidebarUser  = syncSidebarUser;

// ── Render Command Center ─────────────────────────────────

function renderAdminOS() {
  const root = document.getElementById('view-admin-os');
  if (!root) return;

  const clients    = typeof allClientsData !== 'undefined' ? allClientsData : [];
  const active     = clients.filter(c => (c.client_status || c.status || '') === 'activo').length;
  const total      = clients.length;
  const modActive  = OS_MODULES.filter(m => m.status === 'active').length;
  const modSoon    = OS_MODULES.filter(m => m.status === 'coming_soon').length;
  const intActive  = 1; // Shopify conectado
  const intSoon    = 4; // Meta, Klaviyo, ManyChat, Google

  const now = new Date();
  const dateStr = now.toLocaleDateString('es-CR', { weekday:'long', day:'numeric', month:'long' });
  const adminName = (document.getElementById('user-name-display')?.textContent || 'Pablo').split(' ')[0];

  // ── Categories for module grid ──────────────────────────
  const catGroups = [
    { label: 'Villamo Growth',    ids: ['vg-program','vg-brain','vg-ecommerce','vg-tasks'] },
    { label: 'Core OS',           ids: ['core-crm','core-docs','core-meetings','core-kpis','core-resources'] },
    { label: 'Business OS',       ids: ['os-ceo','os-operations','os-inventory','os-cx','os-brand'] },
    { label: 'Integraciones',     ids: ['int-shopify','int-meta','int-klaviyo','int-manychat'] },
  ];

  const buildModCard = (mod) => {
    const isActive = mod.status === 'active';
    const isSoon   = mod.status === 'coming_soon';
    const badgeTxt = isActive ? 'Activo' : isSoon ? 'Próximamente' : 'Bloqueado';
    const badgeCls = isActive ? 'active' : isSoon ? 'soon' : 'locked';
    const cardCls  = `cc-mod-card ${isActive ? 'is-active' : isSoon ? 'is-soon' : 'is-locked'}`;
    const btn = isActive
      ? `<button class="cc-mod-btn open" onclick="handleOSModuleClick('${mod.id}')">Abrir →</button>`
      : isSoon
        ? `<button class="cc-mod-btn disabled-btn">⏳ Próximamente</button>`
        : `<button class="cc-mod-btn disabled-btn">🔒 Bloqueado</button>`;
    return `
      <div class="${cardCls}">
        <div class="cc-mod-card-top">
          <span class="cc-mod-icon">${mod.icon}</span>
          <span class="cc-mod-badge ${badgeCls}">${badgeTxt}</span>
        </div>
        <div class="cc-mod-name">${mod.name}</div>
        <div class="cc-mod-desc">${mod.description}</div>
        ${btn}
      </div>
    `;
  };

  const groupsHTML = catGroups.map(group => {
    const mods = group.ids
      .map(id => OS_MODULES.find(m => m.id === id))
      .filter(Boolean);
    if (!mods.length) return '';
    return `
      <div class="cc-cat-group">
        <div class="cc-cat-label">${group.label}</div>
        <div class="cc-modules-grid">${mods.map(buildModCard).join('')}</div>
      </div>
    `;
  }).join('');

  // ── Roadmap ─────────────────────────────────────────────
  const phases = [
    { num:'Fase 1', name:'Base', cls:'phase-done',   items:['Auth & Permisos','Gestión clientes','Brain IA'] },
    { num:'Fase 2', name:'Core OS', cls:'phase-active', items:['Command Center','Navegación OS','Módulos activos'] },
    { num:'Fase 3', name:'Ecommerce', cls:'',         items:['Shopify OS','Métricas','Integraciones'] },
    { num:'Fase 4', name:'Operaciones', cls:'',       items:['CEO OS','Ops OS','RRHH OS'] },
    { num:'Fase 5', name:'Inventario', cls:'',        items:['Stock OS','Compras OS','Proveedores'] },
    { num:'Fase 6', name:'IA OS', cls:'',             items:['IA Avanzada','Automatizaciones','Predicciones'] },
  ];

  const roadmapHTML = phases.map(p => `
    <div class="cc-phase ${p.cls}">
      <div class="cc-phase-dot"></div>
      <div class="cc-phase-num">${p.num}</div>
      <div class="cc-phase-name">${p.name}</div>
      <div class="cc-phase-items">
        ${p.items.map(i => `<div class="cc-phase-item">${i}</div>`).join('')}
      </div>
    </div>
  `).join('');

  root.innerHTML = `
    <div class="cc-body">

      <!-- Welcome -->
      <div class="cc-welcome">
        <div>
          <p class="cc-greeting">Hola, ${adminName} <span>👋</span></p>
          <h1 class="cc-headline">V-Growth OS</h1>
          <p class="cc-sub">Sistema Operativo Empresarial · ${total} cliente${total !== 1 ? 's' : ''} en plataforma</p>
        </div>
        <div class="cc-date">${dateStr.charAt(0).toUpperCase() + dateStr.slice(1)}</div>
      </div>

      <!-- Quick Stats -->
      <div class="cc-quick-stats">
        <div class="cc-qs-card green">
          <div class="cc-qs-val" id="cc-qs-active">${active}</div>
          <div class="cc-qs-label">Clientes activos</div>
        </div>
        <div class="cc-qs-card">
          <div class="cc-qs-val">${total}</div>
          <div class="cc-qs-label">Total clientes</div>
        </div>
        <div class="cc-qs-card green">
          <div class="cc-qs-val">${modActive}</div>
          <div class="cc-qs-label">Módulos activos</div>
        </div>
        <div class="cc-qs-card amber">
          <div class="cc-qs-val">${modSoon}</div>
          <div class="cc-qs-label">Próximamente</div>
        </div>
        <div class="cc-qs-card green">
          <div class="cc-qs-val">${intActive}</div>
          <div class="cc-qs-label">Integraciones</div>
        </div>
        <div class="cc-qs-card purple">
          <div class="cc-qs-val">${intSoon}</div>
          <div class="cc-qs-label">Int. pendientes</div>
        </div>
      </div>

      <!-- Modules -->
      <div class="cc-modules">
        <div class="cc-section-header">
          <span class="cc-section-title">Módulos del Sistema</span>
        </div>
        ${groupsHTML}
      </div>

      <!-- Roadmap -->
      <div class="cc-roadmap">
        <div class="cc-section-header" style="margin-bottom:16px;">
          <span class="cc-section-title">Roadmap del Sistema</span>
        </div>
        <div class="cc-roadmap-track">${roadmapHTML}</div>
      </div>

    </div>
  `;
}

// ── Module click handler ──────────────────────────────────

function handleOSModuleClick(moduleId) {
  const mod = getModuleById(moduleId);
  if (!mod || !mod.action) return;
  mod.action();
}

function osModuleSoon(name) {
  showOSToast(`${name} — Próximamente disponible`, 'os-toast-soon');
}

function osModuleLocked(name) {
  showOSToast(`${name} — Requiere plan Enterprise`, 'os-toast-locked');
}

function showOSToast(msg, cls = '') {
  document.querySelectorAll('.os-toast').forEach(t => t.remove());
  const t = document.createElement('div');
  t.className = `os-toast${cls ? ' ' + cls : ''}`;
  t.textContent = msg;
  document.body.appendChild(t);
  requestAnimationFrame(() => t.classList.add('visible'));
  setTimeout(() => {
    t.classList.remove('visible');
    setTimeout(() => t.remove(), 300);
  }, 2500);
}

window.renderAdminOS        = renderAdminOS;
window.handleOSModuleClick  = handleOSModuleClick;
window.osModuleSoon         = osModuleSoon;
window.osModuleLocked       = osModuleLocked;
window.showOSToast          = showOSToast;
