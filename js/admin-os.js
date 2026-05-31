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
  { id:'notes',    icon:'📝', label:'Notas',        status:'coming' },
  { id:'crm',      icon:'🗃️', label:'CRM',         status:'coming' },
  { id:'docs',     icon:'📄', label:'Documentos',  status:'coming' },
  { id:'resources',icon:'📚', label:'Recursos',    status:'coming' },
  { id:'meetings', icon:'🎙️', label:'Reuniones',   status:'coming' },
  { id:'kpis',     icon:'📊', label:'KPIs',        status:'coming' },
  { id:'ia',       icon:'🤖', label:'IA',           status:'coming' },
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

// ── Brain Admin View ─────────────────────────────────────

function renderAdminBrainView() {
  const root = document.getElementById('view-admin-brain');
  if (!root) return;

  if (selectedClientId) {
    // Cliente seleccionado: ir a su brain directamente
    showView('view-admin-detail');
    if (typeof switchDetailTab === 'function') {
      switchDetailTab('brain', null);
      if (typeof brainLoadFromLocal === 'function') brainLoadFromLocal();
    }
    if (typeof setSidebarActive === 'function') setSidebarActive('brain');
    return;
  }

  // Sin cliente seleccionado: mostrar selector
  const clients = typeof allClientsData !== 'undefined' ? allClientsData : [];

  const clientListHTML = clients.length
    ? clients.map(c => `
        <button class="admin-brain-client-btn" onclick="selectClientForBrain('${c.id}')">
          <span class="admin-brain-client-avatar">${(c.full_name || c.email || 'VG').substring(0,2).toUpperCase()}</span>
          <div>
            <div style="font-size:13px;font-weight:600;color:var(--white);">${c.full_name || c.email || '—'}</div>
            <div style="font-size:11px;color:var(--gray);">${c.nicho || 'Sin nicho'}</div>
          </div>
          <span style="margin-left:auto;color:var(--green);font-size:14px;">→</span>
        </button>
      `).join('')
    : `<div style="color:var(--gray);font-size:13px;padding:16px 0;">No hay clientes activos.</div>`;

  root.innerHTML = `
    <div class="cc-body">
      <button class="back-btn" onclick="showAdminView('os')" style="margin-bottom:24px;">
        <svg viewBox="0 0 16 16" fill="none"><path d="M10 3L5 8l5 5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
        Volver al OS
      </button>
      <div style="margin-bottom:8px;">
        <p style="font-size:11px;font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:var(--green);font-family:'DM Mono',monospace;margin-bottom:8px;">Brain Empresarial</p>
        <h1 style="font-size:26px;font-weight:700;color:var(--white);margin-bottom:6px;">Brain IA</h1>
        <p style="font-size:13px;color:var(--gray);">Seleccioná un cliente para ver y generar sus documentos estratégicos.</p>
      </div>
      <div style="margin-top:28px;display:flex;flex-direction:column;gap:8px;max-width:540px;">
        ${clientListHTML}
      </div>
    </div>
  `;
}

function selectClientForBrain(clientId) {
  if (typeof openClientDetail === 'function') {
    openClientDetail(clientId).then(() => {
      if (typeof switchDetailTab === 'function') {
        switchDetailTab('brain', null);
        if (typeof brainLoadFromLocal === 'function') brainLoadFromLocal();
      }
      if (typeof setSidebarActive === 'function') setSidebarActive('brain');
    });
  }
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

window.renderAdminOS        = renderAdminOS;
window.handleOSModuleClick  = handleOSModuleClick;
window.osModuleSoon         = osModuleSoon;
window.osModuleLocked       = osModuleLocked;
window.showOSToast          = showOSToast;
