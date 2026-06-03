// ============================================================
// V-GROWTH OS — COMMAND CENTER
// ============================================================

console.log('[AdminOS] loaded');

// ── Sidebar nav items ─────────────────────────────────────

const SIDEBAR_CORE = [
  { id:'os',       icon:'⚡', label:'Dashboard',   status:'active', action:() => showAdminView('os')      },
  { id:'clients',  icon:'👥', label:'Clientes',    status:'active', action:() => showAdminView('clients') },
  { id:'brain',    icon:'🧠', label:'Brain IA',    status:'active', action:() => showAdminView('brain')   },
  { id:'tasks',    icon:'✅', label:'Tareas',       status:'active', action:() => showAdminView('tasks')  },
  { id:'notes',    icon:'📝', label:'Notas OS',       status:'active', action:() => showAdminView('notas-os')        },
  { id:'notif',    icon:'🔔', label:'Notificaciones', status:'active', action:() => showAdminView('notificaciones')  },
  { id:'crm',      icon:'🗃️', label:'CRM',         status:'coming' },
  { id:'docs',     icon:'📄', label:'Documentos',  status:'coming' },
  { id:'resources',icon:'📚', label:'Recursos',    status:'coming' },
  { id:'meetings', icon:'🎙️', label:'Reuniones',   status:'coming' },
  { id:'kpis',     icon:'📊', label:'KPIs',        status:'coming' },
  { id:'ia',       icon:'🤖', label:'IA',           status:'coming' },
];

const SIDEBAR_MODULES = [
  { id:'ecom',        icon:'🛒', label:'Ecommerce OS',        status:'active',  action:() => showAdminView('ecommerce')           },
  { id:'store-intel', icon:'🏪', label:'Store Intelligence', status:'active',  action:() => showAdminView('store-intelligence') },
  { id:'finanzas',    icon:'💰', label:'Finanzas OS',      status:'active',  action:() => showAdminView('finanzas')     },
  { id:'ops',         icon:'⚙️', label:'Operaciones OS',  status:'active',  action:() => showAdminView('operaciones')  },
  { id:'analytics',   icon:'📊', label:'Analytics OS',    status:'coming'  },
  { id:'content',     icon:'✍️', label:'Content OS',      status:'coming'  },
  { id:'app-os',      icon:'📱', label:'App OS',          status:'coming'  },
  { id:'integrations',icon:'🔌', label:'Integraciones',   status:'active',  action:() => showAdminView('integrations') },
  { id:'ceo',         icon:'🎯', label:'CEO OS',          status:'coming'  },
  { id:'inv',         icon:'📦', label:'Inventario OS',     status:'coming'  },
  { id:'purch',       icon:'🛍️', label:'Compras OS',       status:'coming'  },
  { id:'rrhh',        icon:'🤝', label:'RRHH OS',           status:'coming'  },
  { id:'cx',          icon:'💬', label:'Customer Success',  status:'coming'  },
  { id:'franchise',   icon:'🏪', label:'Franquicias OS',    status:'locked'  },
  { id:'brand',       icon:'🎨', label:'Marca y Producto',  status:'coming'  },
  { id:'ia-os',       icon:'🤖', label:'IA OS',             status:'coming'  },
  { id:'vg',          icon:'🚀', label:'Conexxa',            status:'active',  action:() => showAdminView('clients')       },
];

// ── Sync sidebar avatar + name ────────────────────────────

function syncSidebarUser() {
  const nameEl   = document.getElementById('user-name-display');
  const avatarEl = document.getElementById('user-avatar');
  const osbName  = document.getElementById('osb-user-name');
  const osbAvatar= document.getElementById('osb-user-avatar');
  if (osbName   && nameEl)   osbName.textContent   = nameEl.textContent || '—';
  if (osbAvatar && avatarEl) osbAvatar.innerHTML    = avatarEl.innerHTML || 'CX';
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
  const active     = clients.filter(c => (c.client_status || '') === 'activo').length;
  const total      = clients.length;
  const modActive  = OS_MODULES.filter(m => m.status === 'active').length;
  const modSoon    = OS_MODULES.filter(m => m.status === 'coming_soon').length;
  const intActive  = 1;
  const intSoon    = 4;

  // Stats por tipo de negocio (multi-type: un cliente suma en todos sus tipos)
  const typeCount = {};
  clients.forEach(c => {
    const types = parseBusinessTypes(c.business_type);
    if (types.length === 0) {
      typeCount['sin_tipo'] = (typeCount['sin_tipo'] || 0) + 1;
    } else {
      types.forEach(t => { typeCount[t] = (typeCount[t] || 0) + 1; });
    }
  });

  const now = new Date();
  const dateStr = now.toLocaleDateString('es-CR', { weekday:'long', day:'numeric', month:'long' });
  const adminName = (document.getElementById('user-name-display')?.textContent || 'Pablo').split(' ')[0];

  // ── Categories for module grid ──────────────────────────
  const catGroups = [
    { label: 'Conexxa',           ids: ['vg-program','vg-brain','vg-ecommerce','vg-tasks'] },
    { label: 'Core OS',           ids: ['core-crm','core-docs','core-meetings','core-kpis','core-resources'] },
    { label: 'Business OS',       ids: ['finanzas','os-operations','os-ceo','os-inventory','os-cx','os-brand'] },
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
          <h1 class="cc-headline">Conexxa OS</h1>
          <p class="cc-sub">Sistema Operativo Empresarial · ${total} cliente${total !== 1 ? 's' : ''} en plataforma</p>
        </div>
        <div class="cc-date">${dateStr.charAt(0).toUpperCase() + dateStr.slice(1)}</div>
      </div>

      <!-- Quick Stats -->
      <div class="cc-quick-stats">
        <div class="cc-qs-card green">
          <div class="cc-qs-val" id="cc-qs-active">${active}</div>
          <div class="cc-qs-label">Activos</div>
        </div>
        <div class="cc-qs-card">
          <div class="cc-qs-val">${total}</div>
          <div class="cc-qs-label">Total clientes</div>
        </div>
        <div class="cc-qs-card green">
          <div class="cc-qs-val">${typeCount['ecommerce'] || 0}</div>
          <div class="cc-qs-label">Ecommerce</div>
        </div>
        <div class="cc-qs-card">
          <div class="cc-qs-val">${typeCount['retail'] || 0}</div>
          <div class="cc-qs-label">Retail</div>
        </div>
        <div class="cc-qs-card">
          <div class="cc-qs-val">${typeCount['app'] || 0}</div>
          <div class="cc-qs-label">Apps</div>
        </div>
        <div class="cc-qs-card">
          <div class="cc-qs-val">${typeCount['consulting'] || 0}</div>
          <div class="cc-qs-label">Consultoría</div>
        </div>
        <div class="cc-qs-card green">
          <div class="cc-qs-val">${modActive}</div>
          <div class="cc-qs-label">Módulos activos</div>
        </div>
        <div class="cc-qs-card amber">
          <div class="cc-qs-val">${intActive}</div>
          <div class="cc-qs-label">Integraciones</div>
        </div>
      </div>

      <!-- Type Filters -->
      <div class="cc-type-filters" style="margin-bottom:28px;">
        <div class="cc-section-title" style="margin-bottom:12px;">Filtrar por tipo</div>
        <div class="cc-filter-row">
          <button class="cc-filter-btn active" onclick="ccFilterClients('all', this)">Todos (${total})</button>
          ${Object.entries(BUSINESS_TYPES).filter(([k]) => typeCount[k]).map(([k, v]) =>
            `<button class="cc-filter-btn" onclick="ccFilterClients('${k}', this)" style="--ft-color:${v.color};">${v.icon} ${v.label} (${typeCount[k]})</button>`
          ).join('')}
        </div>
      </div>

      <!-- Client Table by type -->
      <div class="cc-modules" id="cc-client-table" style="margin-bottom:36px;">
        <div class="cc-section-header" style="margin-bottom:12px;">
          <span class="cc-section-title">Clientes en plataforma</span>
          <button class="btn-action" style="font-size:12px;padding:7px 14px;" onclick="showAdminView('clients')">Ver todos →</button>
        </div>
        ${buildClientTypeTable(clients)}
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

// ── Brain Admin View ─────────────────────────────────────

const BRAIN_MASTERS = [
  { slug:'identidad', icon:'🧬', name:'Identidad',   desc:'Misión, visión, valores y personalidad de marca.' },
  { slug:'oferta',    icon:'🎯', name:'Oferta',       desc:'Propuesta de valor, precio y transformación.' },
  { slug:'cliente',   icon:'👤', name:'Cliente Ideal',desc:'Perfil, dolores, deseos y objeciones.' },
  { slug:'mercado',   icon:'🌍', name:'Mercado',      desc:'Competencia, tendencias y oportunidades.' },
  { slug:'branding',  icon:'🎨', name:'Branding',     desc:'Identidad visual, paleta y tipografía.' },
  { slug:'vision',    icon:'🔭', name:'Visión',       desc:'Objetivos a largo plazo y hoja de ruta.' },
  { slug:'operacion', icon:'⚙️', name:'Operaciones',  desc:'Flujos, SOPs y estructura operativa.' },
  { slug:'ia',        icon:'🤖', name:'IA Estratégica',desc:'Aplicación de IA al negocio y automatizaciones.' },
];

function renderAdminBrainView() {
  const topEl = document.getElementById('brain-admin-top');
  const genWrap = document.getElementById('brain-generator-wrap');
  if (!topEl) return;

  const clients = typeof allClientsData !== 'undefined' ? allClientsData : [];

  // ── Build client selector dropdown ──────────────────────
  const clientOptions = clients.map(c =>
    `<option value="${c.id}" ${c.id === selectedClientId ? 'selected' : ''}>${c.full_name || c.email || '—'}</option>`
  ).join('');

  const selectedClient = clients.find(c => c.id === selectedClientId);
  const clientName = selectedClient ? (selectedClient.full_name || selectedClient.email || '—') : null;

  // ── 8 Master cards ───────────────────────────────────────
  const masterCardsHTML = BRAIN_MASTERS.map(m => `
    <div class="brain-master-card" onclick="openBrainMaster('${m.slug}')">
      <div class="brain-master-icon">${m.icon}</div>
      <div class="brain-master-name">${m.name}</div>
      <div class="brain-master-desc">${m.desc}</div>
      <div class="brain-master-arrow">→</div>
    </div>
  `).join('');

  topEl.innerHTML = `
    <div class="brain-admin-header">
      <div class="brain-admin-header-left">
        <button class="back-btn" onclick="showAdminView('os')" style="margin-bottom:16px;">
          <svg viewBox="0 0 16 16" fill="none"><path d="M10 3L5 8l5 5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
          Volver al OS
        </button>
        <p class="brain-admin-eyebrow">Core OS · Brain Empresarial</p>
        <h1 class="brain-admin-title">Brain Empresarial</h1>
        <p class="brain-admin-sub">Crea, organiza y consulta los masters estratégicos de cada empresa.</p>
      </div>
      <div class="brain-admin-client-select">
        <label style="font-size:11px;color:var(--gray);text-transform:uppercase;letter-spacing:.08em;display:block;margin-bottom:6px;font-family:'DM Mono',monospace;">Cliente activo</label>
        ${clients.length
          ? `<select id="brain-client-dropdown" class="brain-admin-select" onchange="switchBrainClient(this.value)">
               <option value="">— Seleccionar cliente —</option>
               ${clientOptions}
             </select>`
          : `<div style="font-size:12px;color:var(--gray);">No hay clientes disponibles</div>`}
      </div>
    </div>

    ${selectedClientId
      ? `<div class="brain-client-context">
           <div class="brain-client-context-dot"></div>
           <span>Editando Brain de <strong>${clientName}</strong></span>
         </div>`
      : `<div class="brain-no-client-banner">
           <span>⚠ Seleccioná un cliente para crear o editar un Master</span>
         </div>`}

    <div class="brain-master-grid">${masterCardsHTML}</div>
  `;

  // Show/hide generator based on client selection
  if (genWrap) genWrap.style.display = selectedClientId ? 'block' : 'none';
}

function switchBrainClient(clientId) {
  if (!clientId) {
    selectedClientId = null;
    renderAdminBrainView();
    return;
  }
  selectedClientId = clientId;
  renderAdminBrainView();
  // Init brain for selected client
  if (typeof switchBrainModule === 'function') switchBrainModule(currentBrainModulo || 'identidad');
  if (typeof brainLoadFromLocal === 'function') brainLoadFromLocal();
  // Prefill from profile
  const client = (typeof allClientsData !== 'undefined' ? allClientsData : []).find(c => c.id === clientId);
  if (client && typeof brainPrefillFromProfile === 'function') brainPrefillFromProfile(client);
}

function openBrainMaster(slug) {
  if (!selectedClientId) {
    showOSToast('Seleccioná un cliente antes de crear un Master', 'os-toast-soon');
    // Scroll to client dropdown
    const dd = document.getElementById('brain-client-dropdown');
    if (dd) { dd.focus(); dd.classList.add('brain-admin-select-pulse'); setTimeout(() => dd.classList.remove('brain-admin-select-pulse'), 1200); }
    return;
  }
  if (typeof switchBrainModule === 'function') switchBrainModule(slug);
  const genWrap = document.getElementById('brain-generator-wrap');
  if (genWrap) {
    genWrap.style.display = 'block';
    genWrap.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

function selectClientForBrain(clientId) {
  switchBrainClient(clientId);
}

// ── Tasks Admin View ──────────────────────────────────────

async function renderAdminTasksView() {
  const root = document.getElementById('view-admin-tasks');
  if (!root) return;

  root.innerHTML = `
    <div class="cc-body">
      <button class="back-btn" onclick="showAdminView('os')" style="margin-bottom:24px;">
        <svg viewBox="0 0 16 16" fill="none"><path d="M10 3L5 8l5 5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
        Volver al OS
      </button>
      <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:16px;flex-wrap:wrap;margin-bottom:28px;">
        <div>
          <p style="font-size:11px;font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:var(--green);font-family:'DM Mono',monospace;margin-bottom:8px;">Gestión de Tareas</p>
          <h1 style="font-size:26px;font-weight:700;color:var(--white);margin-bottom:4px;">Tareas</h1>
          <p style="font-size:13px;color:var(--gray);">Todas las tareas asignadas a clientes activos.</p>
        </div>
        <button class="btn-action" onclick="adminCreateTask()" style="flex-shrink:0;">+ Crear tarea</button>
      </div>
      <div id="admin-tasks-content" style="color:var(--gray);font-size:13px;">Cargando tareas...</div>
    </div>
  `;

  try {
    const { data: tasks, error } = await sb
      .from('tasks')
      .select('*, profiles:client_id(id, full_name, email)')
      .order('created_at', { ascending: false });

    if (error) throw error;

    const all = tasks || [];
    const pending  = all.filter(t => !t.completed);
    const done     = all.filter(t =>  t.completed);
    const today    = new Date(); today.setHours(0,0,0,0);
    const overdue  = pending.filter(t => t.due_date && new Date(t.due_date) < today);

    const statsHTML = `
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:10px;margin-bottom:28px;">
        <div style="background:var(--black-card);border:1px solid var(--border);border-radius:12px;padding:16px;">
          <div style="font-size:24px;font-weight:700;color:var(--white);">${all.length}</div>
          <div style="font-size:11px;color:var(--gray);text-transform:uppercase;letter-spacing:.08em;">Total</div>
        </div>
        <div style="background:var(--black-card);border:1px solid var(--border);border-radius:12px;padding:16px;">
          <div style="font-size:24px;font-weight:700;color:var(--amber);">${pending.length}</div>
          <div style="font-size:11px;color:var(--gray);text-transform:uppercase;letter-spacing:.08em;">Pendientes</div>
        </div>
        <div style="background:var(--black-card);border:1px solid var(--border);border-radius:12px;padding:16px;">
          <div style="font-size:24px;font-weight:700;color:var(--green);">${done.length}</div>
          <div style="font-size:11px;color:var(--gray);text-transform:uppercase;letter-spacing:.08em;">Completadas</div>
        </div>
        <div style="background:var(--black-card);border:1px solid var(--border);border-radius:12px;padding:16px;">
          <div style="font-size:24px;font-weight:700;color:var(--red);">${overdue.length}</div>
          <div style="font-size:11px;color:var(--gray);text-transform:uppercase;letter-spacing:.08em;">Vencidas</div>
        </div>
      </div>
    `;

    const tasksHTML = all.length === 0
      ? `<div style="background:var(--black-card);border:1px solid var(--border);border-radius:12px;padding:32px;text-align:center;color:var(--gray);font-size:14px;">No hay tareas todavía. Creá la primera desde el perfil de un cliente.</div>`
      : all.map(t => {
          const clientName = t.profiles?.full_name || t.profiles?.email || 'Cliente desconocido';
          const dueDate = t.due_date ? new Date(t.due_date).toLocaleDateString('es-ES',{day:'numeric',month:'short'}) : null;
          const isOverdue = !t.completed && t.due_date && new Date(t.due_date) < today;
          const statusDot = t.completed
            ? `<span style="color:var(--green);font-size:12px;">✓ Completada</span>`
            : isOverdue
              ? `<span style="color:var(--red);font-size:12px;">⚠ Vencida</span>`
              : `<span style="color:var(--amber);font-size:12px;">● Pendiente</span>`;
          return `
            <div style="background:var(--black-card);border:1px solid var(--border);border-radius:12px;padding:16px 20px;display:flex;align-items:center;gap:16px;${t.completed?'opacity:.5':''}">
              <div style="flex:1;min-width:0;">
                <div style="font-size:13px;font-weight:600;color:var(--white);margin-bottom:3px;${t.completed?'text-decoration:line-through':''}">${t.title}</div>
                ${t.description ? `<div style="font-size:12px;color:var(--gray);margin-bottom:3px;">${t.description}</div>` : ''}
                <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;">
                  <span style="font-size:11px;color:var(--gray);">👤 ${clientName}</span>
                  ${dueDate ? `<span style="font-size:11px;color:${isOverdue?'var(--red)':'var(--gray)'};">📅 ${dueDate}</span>` : ''}
                  ${statusDot}
                </div>
              </div>
            </div>
          `;
        }).join('');

    document.getElementById('admin-tasks-content').innerHTML = statsHTML + `
      <div style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.1em;color:var(--gray);font-family:'DM Mono',monospace;margin-bottom:12px;">Todas las tareas</div>
      <div style="display:flex;flex-direction:column;gap:8px;">${tasksHTML}</div>
    `;

  } catch (err) {
    console.error('[AdminTasks] error:', err);
    document.getElementById('admin-tasks-content').innerHTML =
      `<div style="color:var(--red);font-size:13px;">Error cargando tareas: ${err.message}</div>`;
  }
}

function adminCreateTask() {
  if (!selectedClientId) {
    showOSToast('Seleccioná un cliente primero para asignarle una tarea', 'os-toast-soon');
    return;
  }
  if (typeof openNewTaskModal === 'function') openNewTaskModal();
}

window.renderAdminBrainView  = renderAdminBrainView;
window.renderAdminTasksView  = renderAdminTasksView;
window.selectClientForBrain  = selectClientForBrain;
window.adminCreateTask       = adminCreateTask;
window.switchBrainClient     = switchBrainClient;
window.openBrainMaster       = openBrainMaster;

// ── Client Brain View ─────────────────────────────────────

function renderClientBrainView() {
  const headerEl = document.getElementById('brain-client-header');
  if (!headerEl) return;

  const masterCardsHTML = BRAIN_MASTERS.map(m => `
    <div class="brain-master-card" onclick="openClientBrainMaster('${m.slug}')">
      <div class="brain-master-icon">${m.icon}</div>
      <div class="brain-master-name">${m.name}</div>
      <div class="brain-master-desc">${m.desc}</div>
      <div class="brain-master-arrow">→</div>
    </div>
  `).join('');

  headerEl.innerHTML = `
    <p style="font-size:11px;font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:var(--green);font-family:'DM Mono',monospace;margin-bottom:10px;">Brain Empresarial</p>
    <h1 style="font-size:24px;font-weight:700;color:var(--white);margin-bottom:6px;">Tu Brain</h1>
    <p style="font-size:13px;color:var(--gray);margin-bottom:28px;">Construye los documentos maestros de tu marca con inteligencia artificial.</p>
    <div class="brain-master-grid">${masterCardsHTML}</div>
  `;
}

function openClientBrainMaster(slug) {
  // For client role: selectedClientId = currentUser.id (set at login)
  if (typeof switchBrainModule === 'function') switchBrainModule(slug);
}

window.renderClientBrainView  = renderClientBrainView;
window.openClientBrainMaster  = openClientBrainMaster;

// ── Client type table helper ──────────────────────────────

function buildClientTypeTable(clients) {
  if (!clients.length) return `<div style="color:var(--gray);font-size:13px;padding:16px 0;">Sin clientes registrados.</div>`;
  return `
    <div style="background:var(--black-card);border:1px solid var(--border);border-radius:14px;overflow:hidden;">
      <table style="width:100%;border-collapse:collapse;">
        <thead>
          <tr style="border-bottom:1px solid var(--border);">
            <th style="padding:12px 16px;text-align:left;font-size:11px;color:var(--gray);font-weight:600;text-transform:uppercase;letter-spacing:.08em;">Cliente</th>
            <th style="padding:12px 16px;text-align:left;font-size:11px;color:var(--gray);font-weight:600;text-transform:uppercase;letter-spacing:.08em;">Tipo</th>
            <th style="padding:12px 16px;text-align:left;font-size:11px;color:var(--gray);font-weight:600;text-transform:uppercase;letter-spacing:.08em;">Nicho</th>
            <th style="padding:12px 16px;text-align:left;font-size:11px;color:var(--gray);font-weight:600;text-transform:uppercase;letter-spacing:.08em;">Estado</th>
            <th style="padding:12px 16px;text-align:right;font-size:11px;color:var(--gray);font-weight:600;"></th>
          </tr>
        </thead>
        <tbody>
          ${clients.map(c => {
            const types = parseBusinessTypes(c.business_type);
            const statusColor = c.client_status === 'activo' ? 'var(--green)' : c.client_status === 'pausado' ? 'var(--amber)' : 'var(--gray)';
            const initials = (c.full_name || c.email || 'CX').substring(0,2).toUpperCase();
            const typeBadges = types.length
              ? types.map(t => {
                  const info = BUSINESS_TYPES[t];
                  return info ? `<span style="font-size:10px;font-weight:600;padding:2px 7px;border-radius:5px;background:${info.bg};color:${info.color};white-space:nowrap;">${info.icon} ${info.label}</span>` : '';
                }).join('')
              : `<span style="font-size:11px;color:var(--gray);">—</span>`;
            return `
              <tr class="cc-client-row" style="border-bottom:1px solid rgba(255,255,255,0.04);" data-types="${types.join(',')}">
                <td style="padding:12px 16px;">
                  <div style="display:flex;align-items:center;gap:10px;">
                    <div style="width:28px;height:28px;border-radius:50%;background:var(--green-dim);border:1px solid var(--green-border);display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:var(--green);flex-shrink:0;">${initials}</div>
                    <span style="font-size:13px;font-weight:500;color:var(--white);">${c.full_name || c.email || '—'}</span>
                  </div>
                </td>
                <td style="padding:12px 16px;">
                  <div style="display:flex;gap:4px;flex-wrap:wrap;">${typeBadges}</div>
                </td>
                <td style="padding:12px 16px;font-size:12px;color:var(--gray);">${c.nicho || '—'}</td>
                <td style="padding:12px 16px;">
                  <span style="font-size:12px;color:${statusColor};">● ${c.client_status || 'pendiente'}</span>
                </td>
                <td style="padding:12px 16px;text-align:right;">
                  <button onclick="openClientOverview('${c.id}')" style="background:transparent;border:1px solid var(--border);border-radius:7px;color:var(--gray);font-size:12px;padding:5px 10px;cursor:pointer;font-family:'Inter',sans-serif;transition:color .15s,border-color .15s;" onmouseover="this.style.color='#fff';this.style.borderColor='rgba(255,255,255,.2)'" onmouseout="this.style.color='var(--gray)';this.style.borderColor='var(--border)'">Ver →</button>
                </td>
              </tr>`;
          }).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function ccFilterClients(type, btn) {
  document.querySelectorAll('.cc-filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  document.querySelectorAll('.cc-client-row').forEach(row => {
    const types = (row.dataset.types || '').split(',').filter(Boolean);
    const visible = type === 'all' || types.includes(type);
    row.style.display = visible ? '' : 'none';
  });
}

window.buildClientTypeTable = buildClientTypeTable;
window.ccFilterClients      = ccFilterClients;

// ── Ecommerce OS View ─────────────────────────────────────

function renderAdminEcommerceOS() {
  const root = document.getElementById('view-admin-ecommerce');
  if (!root) return;

  const all = typeof allClientsData !== 'undefined' ? allClientsData : [];
  const clients = all.filter(c => isEcommerceClient(c));

  const cardsHTML = clients.length === 0
    ? `<div style="background:var(--black-card);border:1px solid var(--border);border-radius:14px;padding:32px;text-align:center;color:var(--gray);font-size:14px;">No hay clientes con tipo Ecommerce registrados.<br><span style="font-size:12px;margin-top:6px;display:block;">Editá un cliente y seleccioná "Ecommerce" en sus tipos de negocio.</span></div>`
    : clients.map(c => {
        const types = parseBusinessTypes(c.business_type);
        const initials = (c.full_name || c.email || 'CX').substring(0,2).toUpperCase();
        const statusColor = c.client_status === 'activo' ? 'var(--green)' : 'var(--amber)';
        const typeBadges = types.map(t => {
          const info = BUSINESS_TYPES[t];
          return info ? `<span style="font-size:10px;font-weight:600;padding:2px 7px;border-radius:5px;background:${info.bg};color:${info.color};">${info.icon} ${info.label}</span>` : '';
        }).join('');
        return `
          <div class="cc-mod-card is-active" onclick="openClientDetail('${c.id}')">
            <div class="cc-mod-card-top">
              <div style="width:34px;height:34px;border-radius:50%;background:var(--green-dim);border:1px solid var(--green-border);display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;color:var(--green);">${initials}</div>
            </div>
            <div class="cc-mod-name">${c.full_name || c.email || '—'}</div>
            <div class="cc-mod-desc">${c.nicho || 'Sin nicho'}</div>
            <div style="display:flex;gap:4px;flex-wrap:wrap;margin-top:6px;">${typeBadges}</div>
            <div style="display:flex;align-items:center;justify-content:space-between;margin-top:8px;">
              <span style="font-size:11px;color:${statusColor};">● ${c.client_status || 'pendiente'}</span>
              <span style="font-size:12px;color:var(--green);">Ver →</span>
            </div>
          </div>`;
      }).join('');

  root.innerHTML = `
    <div class="cc-body">
      <button class="back-btn" onclick="showAdminView('os')" style="margin-bottom:24px;">
        <svg viewBox="0 0 16 16" fill="none"><path d="M10 3L5 8l5 5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
        Volver al OS
      </button>
      <p class="os-eyebrow" style="margin-bottom:8px;">Módulos Empresariales</p>
      <h1 style="font-size:28px;font-weight:700;color:var(--white);margin-bottom:6px;">Ecommerce OS</h1>
      <p style="font-size:13px;color:var(--gray);margin-bottom:28px;">${clients.length} cliente${clients.length !== 1 ? 's' : ''} con operación ecommerce activa.</p>
      <div class="cc-section-header" style="margin-bottom:14px;">
        <span class="cc-section-title">Clientes Ecommerce</span>
        <span style="font-size:11px;color:var(--gray);">Filtrado: ecommerce · hybrid</span>
      </div>
      <div class="cc-modules-grid">${cardsHTML}</div>
    </div>
  `;
}

window.renderAdminEcommerceOS = renderAdminEcommerceOS;

// ── Integrations Panel ────────────────────────────────────

async function renderAdminIntegrationsPanel() {
  const root = document.getElementById('view-admin-integrations');
  if (!root) return;

  root.innerHTML = `
    <div class="cc-body">
      <button class="back-btn" onclick="showAdminView('os')" style="margin-bottom:24px;">
        <svg viewBox="0 0 16 16" fill="none"><path d="M10 3L5 8l5 5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
        Volver al OS
      </button>
      <p class="os-eyebrow" style="margin-bottom:8px;">Panel Global</p>
      <h1 style="font-size:28px;font-weight:700;color:var(--white);margin-bottom:6px;">Integraciones</h1>
      <p style="font-size:13px;color:var(--gray);margin-bottom:28px;">Estado de integraciones por cliente.</p>
      <div id="integrations-panel-content" style="color:var(--gray);font-size:13px;">Cargando...</div>
    </div>
  `;

  try {
    const { data: connections } = await sb
      .from('shopify_connections')
      .select('user_id, shop_domain, status, updated_at')
      .eq('status', 'connected');

    const shopifyMap = {};
    (connections || []).forEach(conn => { shopifyMap[conn.user_id] = conn; });

    const clients = typeof allClientsData !== 'undefined' ? allClientsData : [];

    const INT_LABELS = {
      shopify: 'Shopify', meta: 'Meta Ads', klaviyo: 'Klaviyo',
      manychat: 'ManyChat', whatsapp: 'WhatsApp', 'google-drive': 'Google Drive',
      payment: 'Pagos', pos: 'POS/ERP', inventory: 'Inventario',
      analytics: 'Analytics', crm: 'CRM', email: 'Email', calendar: 'Calendario',
      auditorias: 'Auditorías', sucursales: 'Sucursales', kpis: 'KPIs',
    };

    const statusDot = (s) => {
      if (s === 'active')   return `<span style="color:var(--green);font-size:12px;">✓ Activo</span>`;
      if (s === 'na')       return `<span style="color:var(--gray);font-size:12px;">N/A</span>`;
      return `<span style="color:var(--amber);font-size:11px;">⏳ Pendiente</span>`;
    };

    const rows = clients.map(c => {
      const types = parseBusinessTypes(c.business_type);
      const typeInfo = BUSINESS_TYPES[types[0]] || null;
      // Union of all relevant integrations for all client types
      const relevantInts = [...new Set(
        types.length > 0
          ? types.flatMap(t => INTEGRATIONS_BY_TYPE[t] || [])
          : INTEGRATIONS_BY_TYPE['ecommerce']
      )];
      const hasShopify = !!shopifyMap[c.id];
      const initials = (c.full_name || c.email || 'CX').substring(0,2).toUpperCase();

      const intCells = ['shopify','meta','klaviyo','manychat','whatsapp','google-drive'].map(key => {
        const relevant = relevantInts.includes(key);
        const isActive = key === 'shopify' ? hasShopify : false;
        const status = !relevant ? 'na' : isActive ? 'active' : 'pending';
        return `<td style="padding:10px 12px;text-align:center;border-right:1px solid rgba(255,255,255,0.04);">${statusDot(status)}</td>`;
      }).join('');

      return `
        <tr style="border-bottom:1px solid rgba(255,255,255,0.04);">
          <td style="padding:10px 16px;">
            <div style="display:flex;align-items:center;gap:8px;">
              <div style="width:26px;height:26px;border-radius:50%;background:var(--green-dim);border:1px solid var(--green-border);display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;color:var(--green);flex-shrink:0;">${initials}</div>
              <span style="font-size:13px;font-weight:500;">${c.full_name || c.email || '—'}</span>
            </div>
          </td>
          <td style="padding:10px 12px;border-right:1px solid rgba(255,255,255,0.04);">
            <div style="display:flex;gap:3px;flex-wrap:wrap;">
            ${types.length ? types.map(t => {
              const info = BUSINESS_TYPES[t];
              return info ? `<span style="font-size:10px;font-weight:600;padding:2px 6px;border-radius:4px;background:${info.bg};color:${info.color};">${info.icon}</span>` : '';
            }).join('') : '—'}
          </div>
          </td>
          ${intCells}
          <td style="padding:10px 12px;text-align:right;">
            <button onclick="openClientOverview('${c.id}')" style="background:transparent;border:1px solid var(--border);border-radius:6px;color:var(--gray);font-size:11px;padding:4px 9px;cursor:pointer;font-family:'Inter',sans-serif;">Ver</button>
          </td>
        </tr>`;
    }).join('');

    const legend = `
      <div style="display:flex;gap:16px;flex-wrap:wrap;margin-bottom:16px;font-size:11px;color:var(--gray);">
        <span>✓ <span style="color:var(--green);">Activo</span></span>
        <span>⏳ <span style="color:var(--amber);">Pendiente</span></span>
        <span>N/A Sin integración requerida</span>
      </div>`;

    document.getElementById('integrations-panel-content').innerHTML = legend + `
      <div style="overflow-x:auto;">
        <table style="width:100%;border-collapse:collapse;background:var(--black-card);border:1px solid var(--border);border-radius:14px;overflow:hidden;min-width:760px;">
          <thead>
            <tr style="border-bottom:1px solid var(--border);">
              <th style="padding:10px 16px;text-align:left;font-size:10px;color:var(--gray);font-weight:600;text-transform:uppercase;letter-spacing:.08em;">Cliente</th>
              <th style="padding:10px 12px;text-align:left;font-size:10px;color:var(--gray);font-weight:600;text-transform:uppercase;border-right:1px solid rgba(255,255,255,0.04);">Tipo</th>
              <th style="padding:10px 12px;text-align:center;font-size:10px;color:var(--gray);font-weight:600;text-transform:uppercase;border-right:1px solid rgba(255,255,255,0.04);">Shopify</th>
              <th style="padding:10px 12px;text-align:center;font-size:10px;color:var(--gray);font-weight:600;text-transform:uppercase;border-right:1px solid rgba(255,255,255,0.04);">Meta</th>
              <th style="padding:10px 12px;text-align:center;font-size:10px;color:var(--gray);font-weight:600;text-transform:uppercase;border-right:1px solid rgba(255,255,255,0.04);">Klaviyo</th>
              <th style="padding:10px 12px;text-align:center;font-size:10px;color:var(--gray);font-weight:600;text-transform:uppercase;border-right:1px solid rgba(255,255,255,0.04);">ManyChat</th>
              <th style="padding:10px 12px;text-align:center;font-size:10px;color:var(--gray);font-weight:600;text-transform:uppercase;border-right:1px solid rgba(255,255,255,0.04);">WhatsApp</th>
              <th style="padding:10px 12px;text-align:center;font-size:10px;color:var(--gray);font-weight:600;text-transform:uppercase;border-right:1px solid rgba(255,255,255,0.04);">Drive</th>
              <th style="padding:10px 12px;text-align:right;font-size:10px;color:var(--gray);"></th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>`;

  } catch (err) {
    document.getElementById('integrations-panel-content').innerHTML =
      `<div style="color:var(--red);font-size:13px;">Error cargando integraciones: ${err.message}</div>`;
  }
}

window.renderAdminIntegrationsPanel = renderAdminIntegrationsPanel;

// ── Metodología 90 Días ───────────────────────────────────

function renderAdminMetodologia() {
  const root = document.getElementById('view-admin-metodologia');
  if (!root) return;

  const fases = [
    {
      num: 'Días 1–30', name: 'Fundamento y Diagnóstico', color: '#22C55E',
      items: [
        'Auditoría Shopify completa',
        'Auditoría de oferta',
        'Auditoría de marca',
        'Auditoría de conversión',
        'Revisión y análisis de datos',
        'Instalación de tracking (GA4, Pixel)',
        'Priorización de oportunidades',
      ]
    },
    {
      num: 'Días 31–60', name: 'Optimización y Sistemas', color: '#6366F1',
      items: [
        'SEO base (estructura técnica)',
        'Optimización de fichas de producto',
        'Captación de datos y leads',
        'Flujos de email marketing',
        'Automatizaciones (ManyChat, Klaviyo)',
        'Segmentación de audiencias',
        'Mejoras de conversión en checkout',
      ]
    },
    {
      num: 'Días 61–90', name: 'Escalamiento y Control', color: '#F59E0B',
      items: [
        'Dashboard de métricas (CR, AOV, LTV)',
        'Campañas de adquisición',
        'Estrategia de retención',
        'Automatización comercial',
        'Reportes semanales',
        'Documentación de SOPs',
        'Plan de crecimiento mensual',
      ]
    },
  ];

  const fasesHTML = fases.map((f, idx) => `
    <div class="met-fase" style="--fase-color:${f.color};">
      <div class="met-fase-header">
        <div class="met-fase-dot"></div>
        <div>
          <div class="met-fase-num">${f.num}</div>
          <div class="met-fase-name">${f.name}</div>
        </div>
        <div class="met-fase-badge">${String(idx+1).padStart(2,'0')}</div>
      </div>
      <div class="met-fase-items">
        ${f.items.map(item => `
          <div class="met-fase-item">
            <svg viewBox="0 0 12 12" fill="none" style="width:10px;height:10px;flex-shrink:0;margin-top:2px;"><path d="M2 6l3 3 5-5" stroke="${f.color}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
            <span>${item}</span>
          </div>
        `).join('')}
      </div>
    </div>
  `).join('');

  root.innerHTML = `
    <div class="cc-body">
      <button class="back-btn" onclick="showAdminView('os')" style="margin-bottom:24px;">
        <svg viewBox="0 0 16 16" fill="none"><path d="M10 3L5 8l5 5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
        Volver al OS
      </button>
      <p class="os-eyebrow" style="margin-bottom:8px;">Conexxa · Metodología</p>
      <h1 style="font-size:28px;font-weight:700;color:var(--white);margin-bottom:6px;">Programa Conexxa</h1>
      <p style="font-size:13px;color:var(--gray);margin-bottom:32px;">Sistema de implementación ecommerce estructurado en 3 fases de 30 días.</p>
      <div class="met-grid">${fasesHTML}</div>
    </div>
  `;
}

window.renderAdminMetodologia = renderAdminMetodologia;

// ── Finanzas OS ───────────────────────────────────────────

function renderAdminFinanzasOS() {
  const root = document.getElementById('view-admin-finanzas');
  if (!root) return;

  const subModules = [
    {
      id:     'costos',
      icon:   '₡',
      name:   'Gastos / Costos',
      desc:   'Control de gastos por categoría: ecommerce, comercial, administrativo y operativo.',
      status: 'active',
      action: `showAdminView('costos')`,
    },
    { id:'ingresos',  icon:'📈', name:'Ingresos',           desc:'Registro y análisis de todas las fuentes de ingreso.',        status:'soon' },
    { id:'flujo',     icon:'🔄', name:'Flujo de Caja',      desc:'Proyección y control de flujo mensual y anual.',             status:'soon' },
    { id:'por-pagar', icon:'📤', name:'Cuentas por Pagar',  desc:'Seguimiento de deudas, proveedores y vencimientos.',         status:'soon' },
    { id:'por-cobrar',icon:'📥', name:'Cuentas por Cobrar', desc:'Facturas pendientes, clientes y proyección de cobros.',      status:'soon' },
    { id:'presupuesto',icon:'📋',name:'Presupuestos',       desc:'Planeación financiera anual y presupuesto por área.',        status:'soon' },
    { id:'rentabilidad',icon:'💹',name:'Rentabilidad',      desc:'Márgenes, ROI, punto de equilibrio y análisis de utilidad.', status:'soon' },
  ];

  const cardsHTML = subModules.map(m => {
    const isActive = m.status === 'active';
    return `
      <div class="cc-mod-card ${isActive ? 'is-active' : 'is-soon'}" ${isActive ? `onclick="${m.action}"` : ''}>
        <div class="cc-mod-card-top">
          <span class="cc-mod-icon">${m.icon}</span>
          <span class="cc-mod-badge ${isActive ? 'active' : 'soon'}">${isActive ? 'Activo' : 'Próximamente'}</span>
        </div>
        <div class="cc-mod-name">${m.name}</div>
        <div class="cc-mod-desc">${m.desc}</div>
        ${isActive
          ? `<button class="cc-mod-btn open" onclick="${m.action}" style="margin-top:8px;">Abrir →</button>`
          : `<button class="cc-mod-btn disabled-btn" style="margin-top:8px;">⏳ Próximamente</button>`}
      </div>
    `;
  }).join('');

  root.innerHTML = `
    <div class="cc-body">
      <button class="back-btn" onclick="showAdminView('os')" style="margin-bottom:24px;">
        <svg viewBox="0 0 16 16" fill="none"><path d="M10 3L5 8l5 5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
        Volver al OS
      </button>
      <p class="os-eyebrow" style="margin-bottom:8px;">Módulos Empresariales</p>
      <h1 style="font-size:28px;font-weight:700;color:var(--white);margin-bottom:6px;">💰 Finanzas OS</h1>
      <p style="font-size:13px;color:var(--gray);margin-bottom:32px;">Control financiero completo. Gastos activos — resto próximamente.</p>
      <div class="cc-modules-grid">${cardsHTML}</div>
    </div>
  `;
}

window.renderAdminFinanzasOS = renderAdminFinanzasOS;

// ── Operaciones OS ────────────────────────────────────────

function renderAdminOperacionesOS() {
  if (typeof renderOperacionesView === 'function') {
    renderOperacionesView();
  }
}

window.renderAdminOperacionesOS = renderAdminOperacionesOS;

window.renderAdminOS        = renderAdminOS;
window.osModuleSoon         = osModuleSoon;
window.osModuleLocked       = osModuleLocked;
window.showOSToast          = showOSToast;
