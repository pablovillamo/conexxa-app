console.log('[ClientWorkspace] loaded');

// ============================================================
// CONEXXA — WORKSPACE DEL CLIENTE (vista admin)
// Al hacer click en un cliente desde Admin OS → Clientes, el admin
// abre el workspace real del cliente según su tipo. Cada tipo tiene
// su propio sidebar (CORE OS · MÓDULOS · SETTINGS) y módulos.
// ============================================================

// ── Configuración centralizada de workspaces por tipo ──────
const CLIENT_WORKSPACE_CONFIG = {
  ceo: {
    core:     ['Dashboard CEO', 'Brain IA', 'Tareas', 'Notas OS'],
    modules:  ['Operaciones OS', 'Finanzas OS', 'Ecommerce OS', 'Store Intelligence'],
    settings: ['Mi Equipo', 'Notificaciones', 'Integraciones', 'Configuración'],
  },
  program_90d: {
    core:     ['Dashboard Programa', 'Brain IA', 'Tareas', 'Notas OS'],
    modules:  ['Ecommerce OS', 'Finanzas Ecommerce'],
    settings: ['Mi Equipo', 'Notificaciones', 'Integraciones', 'Configuración'],
  },
  service_client: {
    core:     ['Brain IA', 'Tareas', 'Notas OS'],
    modules:  ['Dashboard Comercial', 'CRM', 'Reuniones', 'Documentos', 'KPIs', 'IA', 'Content'],
    settings: ['Mi Equipo', 'Notificaciones', 'Integraciones', 'Configuración'],
  },
  app_client: {
    core:     ['Brain IA', 'Tareas', 'Notas OS'],
    modules:  ['Dashboard Apps', 'Mi App', 'Roadmap', 'Bugs / Soporte', 'Documentos', 'Recursos', 'Reuniones', 'KPIs', 'Analytics', 'IA'],
    settings: ['Mi Equipo', 'Notificaciones', 'Integraciones', 'Configuración'],
  },
};

window.CLIENT_WORKSPACE_CONFIG = CLIENT_WORKSPACE_CONFIG;

// Etiqueta del tipo de cliente para el header del workspace.
const WORKSPACE_TYPE_LABEL = {
  ceo:            'CEO',
  program_90d:    'Programa 90D',
  service_client: 'Consultoría / Servicios',
  app_client:     'Apps',
};

// Descripción base por módulo (voz de marca, sin lenguaje de construcción).
const WS_MODULE_DESC = {
  'Dashboard CEO':       'Visión ejecutiva de la cuenta: estado del negocio, equipo y módulos activos.',
  'Dashboard Programa':  'Avance del programa de 90 días: día actual, días restantes y progreso por fase.',
  'Dashboard Comercial': 'Estado comercial de la cuenta: pipeline, reuniones y entregables del servicio.',
  'Dashboard Apps':      'Estado del proyecto de app: roadmap, soporte y métricas de producto.',
  'Brain IA':            'Documentos maestros de la marca generados con inteligencia artificial.',
  'Tareas':              'Tareas y entregables asignados a la cuenta.',
  'Notas OS':            'Notas internas y bitácora de trabajo de la cuenta.',
  'Operaciones OS':      'Flujos, SOPs y operación del negocio.',
  'Finanzas OS':         'Control financiero: costos, ingresos y rentabilidad.',
  'Finanzas Ecommerce':  'Finanzas enfocadas en la operación ecommerce de la cuenta.',
  'Ecommerce OS':        'Shopify, productos, órdenes y métricas de la tienda.',
  'Store Intelligence':  'Plano interactivo de la tienda y análisis de conversión.',
  'CRM':                 'Base de contactos, oportunidades y seguimiento comercial.',
  'Reuniones':           'Registro de reuniones, minutas y próximos encuentros.',
  'Documentos':          'Contratos, propuestas y documentos de la cuenta.',
  'KPIs':                'Métricas de rendimiento y objetivos de la cuenta.',
  'IA':                  'Asistente y automatizaciones inteligentes para la cuenta.',
  'Content':             'Calendario de contenido, ideas y publicaciones.',
  'Mi App':              'Configuración y estado de la aplicación del cliente.',
  'Roadmap':             'Hoja de ruta de funcionalidades y entregas.',
  'Bugs / Soporte':      'Incidencias reportadas y tickets de soporte.',
  'Recursos':            'Biblioteca de materiales y entregables.',
  'Analytics':           'Analítica de uso, retención y crecimiento.',
  'Mi Equipo':           'Colaboradores vinculados a esta cuenta.',
  'Notificaciones':      'Avisos y comunicaciones de la cuenta.',
  'Integraciones':       'Conexiones activas de la cuenta.',
  'Configuración':       'Datos de la cuenta y preferencias.',
};

// Estado del workspace actual.
let currentWorkspace = null;        // { profile, role, config, items[], active }
let _adminNavHTMLCache = null;      // snapshot del sidebar admin para restaurar

// ── Apertura del workspace ─────────────────────────────────
async function openClientWorkspace(profileOrId) {
  let profile = (typeof profileOrId === 'object' && profileOrId)
    ? profileOrId
    : (typeof allClientsData !== 'undefined' ? allClientsData : []).find(c => c.id === profileOrId);

  if (!profile && typeof profileOrId === 'string') {
    const { data } = await sb.from('profiles').select('*').eq('id', profileOrId).single();
    profile = data;
  }
  if (!profile) { console.warn('[ClientWorkspace] perfil no encontrado:', profileOrId); return; }

  const role = window.ConexxaRoles
    ? window.ConexxaRoles.normalizeRole(profile.role)   // 'client' → 'ceo'
    : profile.role;

  const config = CLIENT_WORKSPACE_CONFIG[role] || CLIENT_WORKSPACE_CONFIG.ceo;

  // Lista plana de items para navegación e índices estables.
  const items = [
    ...config.core.map(label    => ({ section: 'CORE OS',  label })),
    ...config.modules.map(label  => ({ section: 'MÓDULOS',  label })),
    ...config.settings.map(label => ({ section: 'SETTINGS', label })),
  ];

  selectedClientId = profile.id;
  if (window.ConexxaState) window.ConexxaState.setSelectedClientId(profile.id);

  // Aterrizar en el dashboard del tipo si existe; si no, en el primer módulo.
  const landing = items.findIndex(it => it.label.startsWith('Dashboard'));
  const startIdx = landing >= 0 ? landing : 0;

  currentWorkspace = { profile, role, config, items, active: startIdx };

  showView('view-admin-client-dashboard');
  enterWorkspaceSidebar();
  renderWorkspaceModule(startIdx);
}
window.openClientWorkspace = openClientWorkspace;

// ── Sidebar: swap admin → workspace y restaurar ────────────
function enterWorkspaceSidebar() {
  const nav = document.getElementById('osb-nav');
  if (!nav) return;
  if (_adminNavHTMLCache === null) _adminNavHTMLCache = nav.innerHTML;

  const ws = currentWorkspace;
  const buildItems = (section) => ws.items
    .map((it, idx) => ({ it, idx }))
    .filter(o => o.it.section === section)
    .map(o => `<button class="osb-item" id="ws-item-${o.idx}" onclick="wsNavigate(${o.idx})">
        <span class="osb-item-label">${o.it.label}</span>
      </button>`)
    .join('');

  nav.innerHTML = `
    <div class="osb-section">
      <button class="osb-item" onclick="exitClientWorkspace()" style="color:var(--gray);">
        <span class="osb-item-label">← Volver a Clientes</span>
      </button>
    </div>
    <div class="osb-divider"></div>
    <div class="osb-section">
      <div class="osb-section-label">Core OS</div>
      ${buildItems('CORE OS')}
    </div>
    <div class="osb-divider"></div>
    <div class="osb-section">
      <div class="osb-section-label">Módulos</div>
      ${buildItems('MÓDULOS')}
    </div>
    <div class="osb-divider"></div>
    <div class="osb-section">
      <div class="osb-section-label">Settings</div>
      ${buildItems('SETTINGS')}
    </div>
  `;

  // Footer: muestra a qué cuenta pertenece el workspace.
  const roleEl = document.getElementById('osb-user-role');
  if (roleEl) roleEl.textContent = `Workspace · ${WORKSPACE_TYPE_LABEL[ws.role] || 'Cliente'}`;
}

function restoreAdminSidebar() {
  const nav = document.getElementById('osb-nav');
  if (nav && _adminNavHTMLCache !== null) {
    nav.innerHTML = _adminNavHTMLCache;
  }
  const roleEl = document.getElementById('osb-user-role');
  if (roleEl) roleEl.textContent = 'Admin';
  if (typeof renderSidebarNav === 'function') renderSidebarNav();
}

function exitClientWorkspace() {
  currentWorkspace = null;
  restoreAdminSidebar();
  if (typeof showAdminView === 'function') showAdminView('clients');
}
window.exitClientWorkspace = exitClientWorkspace;

function setWorkspaceActive(idx) {
  document.querySelectorAll('#osb-nav .osb-item').forEach(el => el.classList.remove('active'));
  const el = document.getElementById('ws-item-' + idx);
  if (el) el.classList.add('active');
}

function wsNavigate(idx) {
  renderWorkspaceModule(idx);
}
window.wsNavigate = wsNavigate;

// ── Render del módulo activo ───────────────────────────────
function renderWorkspaceModule(idx) {
  if (!currentWorkspace) return;
  const item = currentWorkspace.items[idx];
  if (!item) return;
  currentWorkspace.active = idx;
  setWorkspaceActive(idx);

  const root = document.getElementById('view-admin-client-dashboard');
  if (!root) return;

  root.innerHTML = `
    <div class="cc-body">
      ${workspaceHeaderHTML()}
      <div id="ws-module-content">${moduleContentHTML(item)}</div>
    </div>
  `;

  // Renderers asíncronos / con efectos secundarios.
  if (item.label === 'Mi Equipo') renderMiEquipo();
}

function workspaceHeaderHTML() {
  const ws = currentWorkspace;
  const c = ws.profile;
  const name = c.full_name || c.email || '—';
  const initials = name.substring(0, 2).toUpperCase();
  const typeLabel = WORKSPACE_TYPE_LABEL[ws.role] || 'Cliente';
  const active = c.is_active !== false;
  const statusColor = active ? 'var(--green)' : 'var(--amber)';
  const imgUrl = typeof getClientImageUrl === 'function' ? getClientImageUrl(c) : null;
  const avatar = imgUrl
    ? `<div style="width:42px;height:42px;border-radius:50%;overflow:hidden;flex-shrink:0;"><img src="${imgUrl}" style="width:100%;height:100%;object-fit:cover;" alt=""/></div>`
    : `<div style="width:42px;height:42px;border-radius:50%;background:var(--green-dim);border:2px solid var(--green-border);display:flex;align-items:center;justify-content:center;font-size:15px;font-weight:700;color:var(--green);flex-shrink:0;">${initials}</div>`;

  return `
    <button class="back-btn" onclick="exitClientWorkspace()" style="margin-bottom:18px;">
      <svg viewBox="0 0 16 16" fill="none"><path d="M10 3L5 8l5 5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
      Volver a Clientes
    </button>
    <div style="display:flex;align-items:center;gap:14px;margin-bottom:24px;flex-wrap:wrap;padding-bottom:18px;border-bottom:1px solid var(--border-line);">
      ${avatar}
      <div style="flex:1;min-width:0;">
        <h1 style="font-size:20px;font-weight:700;color:var(--white);margin-bottom:3px;">${name}</h1>
        <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">
          <span style="font-size:11px;font-family:'DM Mono',monospace;color:var(--acid);">${typeLabel}</span>
          <span style="font-size:12px;color:${statusColor};">● ${active ? 'Activo' : 'Inactivo'}</span>
          ${c.nicho ? `<span style="font-size:12px;color:var(--gray);">${c.nicho}</span>` : ''}
        </div>
      </div>
    </div>
  `;
}

// Contenido por módulo: renderers reales donde existen; base limpia
// (nunca pantalla de construcción) para el resto.
function moduleContentHTML(item) {
  switch (item.label) {
    case 'Dashboard Programa': return program90DashboardHTML();
    case 'Dashboard CEO':      return ceoDashboardHTML();
    case 'Mi Equipo':          return '<div id="ws-equipo">Cargando equipo...</div>';
    default:                   return moduleBaseHTML(item.label);
  }
}

function moduleBaseHTML(label) {
  const ws = currentWorkspace;
  const clientName = ws.profile.full_name || ws.profile.email || 'esta cuenta';
  const desc = WS_MODULE_DESC[label] || 'Módulo de la cuenta.';
  return `
    <p class="os-eyebrow" style="margin-bottom:8px;">${WORKSPACE_TYPE_LABEL[ws.role] || 'Cliente'} · Módulo</p>
    <h1 style="font-size:24px;font-weight:700;color:var(--white);margin-bottom:6px;">${label}</h1>
    <p style="font-size:13px;color:var(--gray);margin-bottom:24px;max-width:640px;line-height:1.6;">${desc}</p>
    <div style="background:var(--black-card);border:1px solid var(--border-line);border-radius:14px;padding:32px;text-align:center;">
      <div style="font-size:14px;font-weight:600;color:var(--white);margin-bottom:6px;">Base del módulo lista</div>
      <div style="font-size:13px;color:var(--gray);max-width:480px;margin:0 auto;line-height:1.6;">${label} está disponible para ${clientName}. Conectá los datos de este módulo para empezar a operar.</div>
    </div>
  `;
}

// ── Dashboard Programa 90D — progreso real ─────────────────
function program90DashboardHTML() {
  const ws = currentWorkspace;
  const c = ws.profile;
  const progressRows = (typeof allProgressData !== 'undefined' ? allProgressData : [])
    .filter(p => p.client_id === c.id);
  const done = progressRows.filter(p => p.completed).length;
  const pct = Math.round((done / 9) * 100);

  let dayNum = '—', daysLeft = '—';
  if (c.start_date) {
    const d = Math.floor((Date.now() - new Date(c.start_date).getTime()) / 86400000) + 1;
    dayNum = Math.min(90, Math.max(1, d));
  }
  if (c.end_date) {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const dl = Math.ceil((new Date(c.end_date) - today) / 86400000);
    daysLeft = dl > 0 ? dl : 0;
  }

  const card = (val, label, color) => `
    <div class="cc-qs-card" style="${color ? `--qs-color:${color};` : ''}">
      <div class="cc-qs-val" style="font-size:24px;${color ? `color:${color};` : ''}">${val}</div>
      <div class="cc-qs-label">${label}</div>
    </div>`;

  return `
    <p class="os-eyebrow" style="margin-bottom:8px;">Programa 90D · Dashboard</p>
    <h1 style="font-size:24px;font-weight:700;color:var(--white);margin-bottom:6px;">Dashboard del Programa</h1>
    <p style="font-size:13px;color:var(--gray);margin-bottom:24px;">${WS_MODULE_DESC['Dashboard Programa']}</p>
    <div class="cc-quick-stats" style="margin-bottom:24px;">
      ${card(dayNum, 'Día actual', 'var(--acid)')}
      ${card(daysLeft, 'Días restantes', '#F59E0B')}
      ${card(pct + '%', 'Progreso', 'var(--green)')}
      ${card(done + ' / 9', 'Módulos completados', '')}
    </div>
    <div style="background:var(--black-card);border:1px solid var(--border-line);border-radius:14px;padding:20px;">
      <div style="font-size:11px;text-transform:uppercase;letter-spacing:.08em;color:var(--gray);font-family:'DM Mono',monospace;margin-bottom:12px;">Avance general</div>
      <div class="progress-cell-bar" style="height:10px;"><div class="progress-cell-fill" style="width:${pct}%"></div></div>
      <div style="font-size:12px;color:var(--gray);margin-top:8px;">${done} de 9 módulos del programa completados.</div>
    </div>
  `;
}

// ── Dashboard CEO — resumen ejecutivo ──────────────────────
function ceoDashboardHTML() {
  const ws = currentWorkspace;
  const c = ws.profile;
  const types = typeof parseBusinessTypes === 'function' ? parseBusinessTypes(c.business_type) : [];
  const typeBadges = types.map(t => {
    const info = typeof BUSINESS_TYPES !== 'undefined' ? BUSINESS_TYPES[t] : null;
    return info ? `<span style="font-size:11px;font-weight:600;padding:3px 9px;border-radius:6px;background:${info.bg};color:${info.color};">${info.icon} ${info.label}</span>` : '';
  }).join('');
  const team = (typeof collaboratorCountByAccount !== 'undefined' && collaboratorCountByAccount[c.id]) || 0;
  const modCount = ws.config.modules.length;

  const card = (val, label, color) => `
    <div class="cc-qs-card">
      <div class="cc-qs-val" style="font-size:24px;${color ? `color:${color};` : ''}">${val}</div>
      <div class="cc-qs-label">${label}</div>
    </div>`;

  return `
    <p class="os-eyebrow" style="margin-bottom:8px;">CEO · Dashboard</p>
    <h1 style="font-size:24px;font-weight:700;color:var(--white);margin-bottom:6px;">Dashboard CEO</h1>
    <p style="font-size:13px;color:var(--gray);margin-bottom:24px;">${WS_MODULE_DESC['Dashboard CEO']}</p>
    <div class="cc-quick-stats" style="margin-bottom:24px;">
      ${card(modCount, 'Módulos activos', 'var(--green)')}
      ${card(team, 'Equipo vinculado', 'var(--acid)')}
      ${card(c.is_active !== false ? 'Activo' : 'Inactivo', 'Estado de cuenta', c.is_active !== false ? 'var(--green)' : '#F59E0B')}
    </div>
    ${types.length ? `
      <div style="background:var(--black-card);border:1px solid var(--border-line);border-radius:14px;padding:20px;">
        <div style="font-size:11px;text-transform:uppercase;letter-spacing:.08em;color:var(--gray);font-family:'DM Mono',monospace;margin-bottom:12px;">Tipos de negocio</div>
        <div style="display:flex;gap:6px;flex-wrap:wrap;">${typeBadges}</div>
      </div>` : ''}
  `;
}

// ── Mi Equipo — colaboradores por parent_account_id ────────
async function renderMiEquipo() {
  const el = document.getElementById('ws-equipo');
  if (!el || !currentWorkspace) return;
  const c = currentWorkspace.profile;

  el.innerHTML = `
    <p class="os-eyebrow" style="margin-bottom:8px;">Settings · Equipo</p>
    <h1 style="font-size:24px;font-weight:700;color:var(--white);margin-bottom:6px;">Mi Equipo</h1>
    <p style="font-size:13px;color:var(--gray);margin-bottom:24px;">${WS_MODULE_DESC['Mi Equipo']}</p>
    <div id="ws-equipo-list" style="color:var(--gray);font-size:13px;">Cargando colaboradores...</div>
  `;

  // Colaboradores del cliente: role = 'collaborator' AND parent_account_id = cliente.id
  const { data: team, error } = await sb.from('profiles')
    .select('id, full_name, email, is_active, created_at')
    .eq('role', 'collaborator')
    .eq('parent_account_id', c.id)
    .order('created_at', { ascending: true });

  const listEl = document.getElementById('ws-equipo-list');
  if (!listEl) return;

  if (error) {
    listEl.innerHTML = `<div style="color:var(--red);font-size:13px;">No se pudo cargar el equipo.</div>`;
    return;
  }

  const list = team || [];
  if (!list.length) {
    listEl.innerHTML = `
      <div style="background:var(--black-card);border:1px solid var(--border-line);border-radius:14px;padding:32px;text-align:center;">
        <div style="font-size:14px;font-weight:600;color:var(--white);margin-bottom:6px;">Sin colaboradores todavía</div>
        <div style="font-size:13px;color:var(--gray);max-width:440px;margin:0 auto;line-height:1.6;">Esta cuenta aún no tiene colaboradores vinculados.</div>
      </div>`;
    return;
  }

  listEl.innerHTML = `
    <div style="background:var(--black-card);border:1px solid var(--border-line);border-radius:14px;overflow:hidden;">
      <table style="width:100%;border-collapse:collapse;">
        <thead><tr style="border-bottom:1px solid var(--border-line);">
          ${['Colaborador', 'Email', 'Estado', 'Ingreso'].map(h =>
            `<th style="text-align:left;padding:10px 14px;font-size:11px;font-family:var(--font-mono);color:var(--text-muted);text-transform:uppercase;letter-spacing:.06em;">${h}</th>`
          ).join('')}
        </tr></thead>
        <tbody>${list.map(m => {
          const initials = (m.full_name || m.email || 'CX').substring(0, 2).toUpperCase();
          const active = m.is_active !== false;
          const created = m.created_at ? new Date(m.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
          return `<tr style="border-bottom:1px solid rgba(255,255,255,.04);">
            <td style="padding:12px 14px;"><div style="display:flex;align-items:center;gap:9px;">
              <div style="width:26px;height:26px;border-radius:50%;background:var(--green-dim);border:1px solid var(--green-border);display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;color:var(--green);">${initials}</div>
              <span style="font-size:13px;font-weight:500;color:var(--white);">${m.full_name || m.email || '—'}</span>
            </div></td>
            <td style="padding:12px 14px;font-size:12px;color:var(--gray);">${m.email || '—'}</td>
            <td style="padding:12px 14px;font-size:12px;color:${active ? 'var(--green)' : 'var(--amber)'};">● ${active ? 'Activo' : 'Inactivo'}</td>
            <td style="padding:12px 14px;font-size:12px;color:var(--text-muted);font-family:var(--font-mono);">${created}</td>
          </tr>`;
        }).join('')}</tbody>
      </table>
    </div>
  `;
}
