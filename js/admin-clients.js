console.log("[AdminClients] loaded");

// ============================================================ ADMIN CLIENTES
let allClientsData = [];
let allProgressData = [];
let allTasksData = [];
let collaboratorCountByAccount = {};   // parent_account_id → nº de colaboradores

// Roles comerciales que aparecen en el módulo maestro de Clientes.
// Excluye explícitamente admin y collaborator.
const CLIENTS_COMMERCIAL_ROLES = (window.ConexxaRoles && window.ConexxaRoles.COMMERCIAL_ROLES)
  || ['ceo', 'program_90d', 'app_client', 'service_client', 'client'];

function getClientImageUrl(client) {
  if (!client) return null;
  return client.profile_image_url || client.photo_url || client.avatar_url || client.logo_url || client.image_url || null;
}

// Etiqueta legible del tipo de cliente según su rol.
function clientTypeLabel(role) {
  const r = (window.ConexxaRoles ? window.ConexxaRoles.normalizeRole(role) : role) || role;
  const map = {
    ceo:            'CEO',
    program_90d:    'Programa 90D',
    service_client: 'Consultoría / Servicios',
    app_client:     'Apps',
  };
  // 'client' legacy se normaliza a 'ceo'; mostramos su origen como Legacy.
  if (role === 'client') return 'Legacy';
  return map[r] || r || '—';
}

function clientTypeBadgeStyle(role) {
  switch (role) {
    case 'program_90d':    return 'color:#818CF8;background:rgba(99,102,241,.1);border-color:rgba(99,102,241,.2);';
    case 'service_client': return 'color:#F59E0B;background:rgba(245,158,11,.1);border-color:rgba(245,158,11,.2);';
    case 'app_client':     return 'color:#14B8A6;background:rgba(20,184,166,.1);border-color:rgba(20,184,166,.2);';
    case 'client':         return 'color:var(--text-muted);background:rgba(255,255,255,.04);border-color:var(--border-line);';
    default:               return 'color:var(--acid);background:rgba(166,255,0,.08);border-color:rgba(166,255,0,.2);';
  }
}

// is_active === false → inactivo; cualquier otro valor (true/null) → activo.
function clientIsActive(c) {
  return c?.is_active !== false;
}

async function loadAdminClients() {
  // Solo cuentas comerciales. Excluye admin y collaborator.
  const { data: clients } = await sb.from('profiles')
    .select('*')
    .in('role', CLIENTS_COMMERCIAL_ROLES)
    .order('created_at', { ascending: false });

  // Colaboradores: para contar "usuarios vinculados" por parent_account_id.
  const { data: collaborators } = await sb.from('profiles')
    .select('id, parent_account_id')
    .eq('role', 'collaborator');

  // Datos de programa/tareas siguen disponibles para otras vistas (90D),
  // pero ya NO alimentan métricas del módulo maestro de Clientes.
  const { data: allProgress } = await sb.from('client_modules').select('*');
  const { data: allTasks } = await sb.from('tasks').select('*');

  allClientsData = clients || [];
  allProgressData = allProgress || [];
  allTasksData = allTasks || [];
  window.ConexxaState.setAllClientsData(allClientsData);

  // Conteo de colaboradores por cuenta (parent_account_id).
  collaboratorCountByAccount = {};
  (collaborators || []).forEach(col => {
    const pid = col.parent_account_id;
    if (!pid) return;
    collaboratorCountByAccount[pid] = (collaboratorCountByAccount[pid] || 0) + 1;
  });

  // ── Métricas del módulo maestro de Clientes ──────────────
  const total = allClientsData.length;
  let activos = 0, ceos = 0, prog90 = 0, consultoria = 0, apps = 0, inactivos = 0;

  allClientsData.forEach(c => {
    const role   = window.ConexxaRoles ? window.ConexxaRoles.normalizeRole(c.role) : c.role;
    const active = clientIsActive(c);
    if (active) activos++; else inactivos++;

    if (!active) return;       // los conteos por tipo son sobre cuentas activas
    if (role === 'ceo')            ceos++;
    else if (role === 'program_90d')    prog90++;
    else if (role === 'service_client') consultoria++;
    else if (role === 'app_client')     apps++;
  });

  const setKpi = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  setKpi('kpi-activos',     activos);
  setKpi('kpi-ceos',        ceos);
  setKpi('kpi-prog90',      prog90);
  setKpi('kpi-consultoria', consultoria);
  setKpi('kpi-apps',        apps);
  setKpi('kpi-inactivos',   inactivos);

  const sub = document.getElementById('admin-subtitle');
  if (sub) sub.textContent = `${total} cliente${total !== 1 ? 's' : ''} comercial${total !== 1 ? 'es' : ''} · Conexxa`;

  populateNichoFilter(allClientsData);
  renderClientsTable(allClientsData);
}

// Rellena el select de nichos con los valores presentes en los clientes.
function populateNichoFilter(clients) {
  const sel = document.getElementById('filter-nicho');
  if (!sel) return;
  const current = sel.value;
  const nichos = [...new Set((clients || []).map(c => (c.nicho || '').trim()).filter(Boolean))]
    .sort((a, b) => a.localeCompare(b));
  sel.innerHTML = '<option value="">Todos los nichos</option>'
    + nichos.map(n => `<option value="${n}">${n}</option>`).join('');
  if (current && nichos.includes(current)) sel.value = current;
}

function renderClientsTable(clients) {
  const tbody = document.getElementById('clients-tbody');
  if (!tbody) return;
  if(!clients || clients.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:32px;color:var(--gray);">Sin clientes aún. Agrega el primero.</td></tr>';
    return;
  }
  tbody.innerHTML = clients.map(c => {
    const initials = (c.full_name || c.email || 'CX').substring(0,2).toUpperCase();
    const imgUrl = getClientImageUrl(c);
    const typeLabel = clientTypeLabel(c.role);
    const typeStyle = clientTypeBadgeStyle(c.role);

    let avatarContent, avatarStyleAttr;
    if (imgUrl) {
      avatarContent = `<img src="${imgUrl}" style="width:100%;height:100%;object-fit:cover;border-radius:inherit;" alt="" onerror="this.parentElement.style.padding='';this.parentElement.textContent='${initials}';" />`;
      avatarStyleAttr = ' style="padding:0;"';
    } else {
      avatarContent = initials;
      avatarStyleAttr = '';
    }

    const createdStr = c.created_at ? new Date(c.created_at).toLocaleDateString('es-ES',{day:'numeric',month:'short',year:'numeric'})
                     : c.start_date ? new Date(c.start_date).toLocaleDateString('es-ES',{day:'numeric',month:'short',year:'numeric'})
                     : '—';

    const active = clientIsActive(c);
    const statusBadge = active
      ? `<span class="status-badge status-activo">● Activo</span>`
      : `<span class="status-badge status-pausado">● Inactivo</span>`;

    const linkedUsers = collaboratorCountByAccount[c.id] || 0;

    return `<tr onclick="openClientWorkspace('${c.id}')" style="cursor:pointer;">
      <td><div style="display:flex;align-items:center;gap:10px;">
        <div class="client-avatar-cell"${avatarStyleAttr}>${avatarContent}</div>
        <div class="client-name-cell">${c.full_name || c.email}</div>
      </div></td>
      <td style="color:var(--gray);font-size:12px;">${c.email || '—'}</td>
      <td><span style="font-size:10px;font-family:var(--font-mono);padding:2px 7px;border-radius:4px;border:1px solid;${typeStyle}">${typeLabel}</span></td>
      <td style="color:var(--gray);font-size:12px;">${c.nicho || '—'}</td>
      <td>${statusBadge}</td>
      <td><span class="mono" style="font-size:13px;color:var(--gray);">${linkedUsers}</span></td>
      <td style="color:var(--gray);font-size:12px;">${createdStr}</td>
      <td><svg viewBox="0 0 16 16" fill="none" style="width:16px;height:16px;color:var(--gray);"><path d="M6 3l5 5-5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></td>
    </tr>`;
  }).join('');
}

function filterClients() {
  const search = (document.getElementById('client-search')?.value || '').toLowerCase();
  const nicho  = document.getElementById('filter-nicho')?.value || '';
  const sort   = document.getElementById('filter-sort')?.value || 'recent';

  let filtered = allClientsData.filter(c => {
    const matchSearch = !search
      || (c.full_name||'').toLowerCase().includes(search)
      || (c.email||'').toLowerCase().includes(search)
      || (c.nicho||'').toLowerCase().includes(search);
    const matchNicho = !nicho || (c.nicho || '') === nicho;
    return matchSearch && matchNicho;
  });

  const ts = (c) => new Date(c.created_at || c.start_date || 0).getTime();
  if (sort === 'old') {
    filtered.sort((a,b) => ts(a) - ts(b));
  } else if (sort === 'name') {
    filtered.sort((a,b) => (a.full_name||a.email||'').localeCompare(b.full_name||b.email||''));
  } else { // recent (default)
    filtered.sort((a,b) => ts(b) - ts(a));
  }

  renderClientsTable(filtered);
}

// ── Apertura del cliente desde Clientes ─────────────────────
// El click en un cliente abre su workspace real por tipo (ver
// client-workspace.js → openClientWorkspace). openClientOverview
// se mantiene como alias por compatibilidad con otras vistas.
function openClientOverview(clientId) {
  if (typeof openClientWorkspace === 'function') return openClientWorkspace(clientId);
  // Fallback defensivo si client-workspace.js no cargó.
  selectedClientId = clientId;
  window.ConexxaState.setSelectedClientId(clientId);
  if (typeof openClientDetail === 'function') openClientDetail(clientId);
}
window.openClientOverview = openClientOverview;

// ── Vista detallada ecommerce (preservada para Ecommerce OS) ─

async function openClientDetail(clientId) {
  selectedClientId = clientId;
  window.ConexxaState.setSelectedClientId(clientId);
  showAdminView('detail');

  const { data: client } = await sb.from('profiles').select('*').eq('id', clientId).single();
  const { data: progress } = await sb.from('client_modules').select('*').eq('client_id', clientId);
  const { data: tasks } = await sb.from('tasks').select('*,modules(name,number)').eq('client_id', clientId).order('created_at', { ascending: false });

  // Render header using shared function
  ecRefreshDetailHeader(client);

  // Pre-fill Brain Generator module 01 fields if empty
  brainPrefillFromProfile(client);

  const doneMap = {};
  (progress || []).forEach(p => { doneMap[p.module_id] = p.completed; });
  const p1done = allModules.filter(m => m.phase===1 && doneMap[m.id]).length;
  const p2done = allModules.filter(m => m.phase===2 && doneMap[m.id]).length;
  const p3done = allModules.filter(m => m.phase===3 && doneMap[m.id]).length;

  document.getElementById('detail-phases').innerHTML = [
    { label:'FASE 1 · Días 1–15', name:'Diagnóstico y base', done:p1done, total:2, color:'#22C55E' },
    { label:'FASE 2 · Días 16–60', name:'Construcción del sistema', done:p2done, total:3, color:'#16A34A' },
    { label:'FASE 3 · Días 61–90', name:'Sistema completo', done:p3done, total:4, color:'#085041' },
  ].map(ph => `
    <div class="phase-card">
      <div class="phase-card-label">${ph.label}</div>
      <div class="phase-card-name">${ph.name}</div>
      <div class="phase-card-bar"><div class="phase-card-fill" style="width:${Math.round(ph.done/ph.total*100)}%;background:${ph.color}"></div></div>
      <div class="phase-card-count mono">${ph.done} / ${ph.total} módulos</div>
    </div>
  `).join('');

  document.getElementById('detail-modules').innerHTML = allModules.map(m => {
    const row = (progress||[]).find(p => p.module_id === m.id);
    const isDone = row?.completed || false;
    const rowId = row?.id || '';
    return `
    <div class="module-row ${isDone ? 'done' : ''}" onclick="toggleAdminModule('${rowId}', ${!isDone}, '${m.id}')" style="cursor:pointer;">
      <div class="module-check-icon">
        <svg viewBox="0 0 12 12" fill="none"><path d="M2 6L5 9L10 3" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </div>
      <div class="module-info">
        <div class="module-num">MÓDULO ${m.number}</div>
        <div class="module-name">${m.name}</div>
      </div>
      <div class="module-phase-tag">Fase ${m.phase}</div>
    </div>
  `;
  }).join('');

  const taskList = document.getElementById('detail-tasks');
  if (!tasks || tasks.length === 0) {
    taskList.innerHTML = '<div class="empty-state">Sin tareas asignadas aún. Usa "Asignar tarea" para agregar la primera.</div>';
  } else {
    taskList.innerHTML = tasks.map(t => {
      const dueStr = t.due_date ? new Date(t.due_date).toLocaleDateString('es-ES',{day:'numeric',month:'short',year:'numeric'}) : null;
      return `
        <div class="task-row ${t.completed ? 'done' : ''}">
          <div class="task-row-top">
            <div class="task-title-text">${t.title}</div>
            ${t.completed ? '<span class="task-done-badge">Completada</span>' : '<span class="task-pending-badge">Pendiente</span>'}
          </div>
          ${t.description ? `<div class="task-desc">${t.description}</div>` : ''}
          <div class="task-meta-row">
            ${t.modules ? `<span class="task-meta-tag">Módulo ${t.modules.number} — ${t.modules.name}</span>` : ''}
            ${dueStr ? `<span class="task-meta-tag">Vence: ${dueStr}</span>` : ''}
            ${t.email_sent ? '<span class="task-email-tag">Correo enviado</span>' : '<span class="task-no-email-tag">Sin correo</span>'}
          </div>
        </div>
      `;
    }).join('');
  }
}

// ============================================================ ADMIN CREAR CLIENTE
function openNewClientModal() {
  const today = new Date();
  const end = new Date(today); end.setDate(end.getDate() + 90);
  document.getElementById('nc-start').value = today.toISOString().split('T')[0];
  document.getElementById('nc-end').value = end.toISOString().split('T')[0];
  openModal('modal-new-client');
}

async function crearCliente() {
  console.log('[crearCliente] iniciado');
  const name  = document.getElementById('nc-name').value.trim();
  const email = document.getElementById('nc-email').value.trim();
  const pass  = document.getElementById('nc-password').value;
  const nicho = document.getElementById('nc-nicho').value.trim();
  const start = document.getElementById('nc-start').value;
  const end   = document.getElementById('nc-end').value;
  const msg   = document.getElementById('nc-msg');

  if (!name || !email || !pass) { showMsg(msg, 'error', 'Nombre, email y contraseña son requeridos'); return; }
  if (pass.length < 8) { showMsg(msg, 'error', 'La contraseña debe tener mínimo 8 caracteres'); return; }

  const btn = document.querySelector('#modal-new-client .btn-primary');
  if (!btn) { console.error('[crearCliente] botón no encontrado en #modal-new-client'); return; }
  btn.disabled = true;
  btn.textContent = 'Creando...';

  try {
    // 1 — crear usuario en Supabase Auth
    console.log('[crearCliente] llamando sb.auth.signUp, email:', email);
    const { data: authData, error: authErr } = await sb.auth.signUp({
      email,
      password: pass,
      options: { data: { full_name: name, nicho, role: 'ceo' } }
    });
    console.log('[crearCliente] signUp respuesta — user:', authData?.user?.id, '| error:', authErr);

    if (authErr) {
      console.error('[crearCliente] error en signUp:', authErr);
      showMsg(msg, 'error', authErr.message);
      return;
    }

    if (!authData?.user) {
      console.warn('[crearCliente] signUp sin user — email en uso o confirmación requerida. authData:', authData);
      showMsg(msg, 'error', 'No se pudo crear el usuario. El email puede estar en uso.');
      return;
    }

    // 2 — actualizar perfil con fechas y nicho
    console.log('[crearCliente] actualizando perfil para uid:', authData.user.id);
    const { error: profileErr } = await sb.from('profiles')
      .update({ nicho: nicho || null, start_date: start || null, end_date: end || null })
      .eq('id', authData.user.id);
    if (profileErr) {
      console.error('[crearCliente] error actualizando perfil (no bloquea):', profileErr);
    } else {
      console.log('[crearCliente] perfil actualizado');
    }

    // 3 — éxito
    showMsg(msg, 'success', '¡Cliente creado! Ya puede acceder con su email y contraseña.');
    console.log('[crearCliente] éxito completo');
    setTimeout(async () => {
      closeModal('modal-new-client');
      ['nc-name', 'nc-email', 'nc-password', 'nc-nicho'].forEach(id => { document.getElementById(id).value = ''; });
      await loadAdminClients();
    }, 1800);

  } catch (err) {
    console.error('[crearCliente] excepción inesperada:', err);
    showMsg(msg, 'error', err.message || 'Error inesperado al crear el cliente');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Crear cliente';
  }
}

// ── Vista maestro: Clientes (todos los tipos comerciales) ──
// Reutiliza la tabla existente — ya carga en loadAdminClients()
function renderAdminClientsView() {
  // La vista view-admin-clients ya se llena por loadAdminClients()
  // Esta función se llama desde navigation.js al navegar
  if (allClientsData.length > 0) renderClientsTable(allClientsData);
}
window.renderAdminClientsView = renderAdminClientsView;

// ── Vista: Usuarios (TODOS los perfiles de la plataforma) ──
// Etiqueta y estilo de badge para cualquier rol (incl. admin/collaborator).
function userRoleLabel(role) {
  const map = {
    admin:          'Admin',
    ceo:            'CEO',
    program_90d:    'Programa 90D',
    service_client: 'Consultoría / Servicios',
    app_client:     'Apps',
    collaborator:   'Colaborador',
    client:         'Legacy',
  };
  return map[role] || role || '—';
}

function userRoleBadgeStyle(role) {
  switch (role) {
    case 'admin':          return 'color:var(--white);background:rgba(255,255,255,.08);border-color:rgba(255,255,255,.2);';
    case 'program_90d':    return 'color:#818CF8;background:rgba(99,102,241,.1);border-color:rgba(99,102,241,.2);';
    case 'service_client': return 'color:#F59E0B;background:rgba(245,158,11,.1);border-color:rgba(245,158,11,.2);';
    case 'app_client':     return 'color:#14B8A6;background:rgba(20,184,166,.1);border-color:rgba(20,184,166,.2);';
    case 'collaborator':   return 'color:#60A5FA;background:rgba(96,165,250,.1);border-color:rgba(96,165,250,.2);';
    case 'client':         return 'color:var(--text-muted);background:rgba(255,255,255,.04);border-color:var(--border-line);';
    default:               return 'color:var(--acid);background:rgba(166,255,0,.08);border-color:rgba(166,255,0,.2);';
  }
}

let allUsersData = [];

// Navegación a Usuarios: carga fresca de TODOS los perfiles, luego pinta.
async function renderAdminUsersView() {
  const wrap = document.getElementById('admin-users-table-wrap');
  if (!wrap) return;
  wrap.innerHTML = '<div style="color:var(--text-muted);font-size:13px;padding:20px;">Cargando usuarios...</div>';
  const { data: users, error } = await sb.from('profiles')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) {
    wrap.innerHTML = `<div style="color:var(--red);font-size:13px;padding:20px;">Error cargando usuarios: ${error.message}</div>`;
    return;
  }
  allUsersData = users || [];
  paintAdminUsers();
}

// Cambios de filtro/búsqueda: re-pinta sin volver a consultar Supabase.
function filterAdminUsers() {
  paintAdminUsers();
}

function paintAdminUsers() {
  const wrap = document.getElementById('admin-users-table-wrap');
  if (!wrap) return;

  const byId = {};
  allUsersData.forEach(u => { byId[u.id] = u; });

  const roleFilter = document.getElementById('users-filter-role')?.value || '';
  const search = (document.getElementById('users-search')?.value || '').toLowerCase();

  const filtered = allUsersData.filter(u => {
    const matchRole = !roleFilter || u.role === roleFilter;
    const matchSearch = !search
      || (u.full_name || '').toLowerCase().includes(search)
      || (u.email || '').toLowerCase().includes(search);
    return matchRole && matchSearch;
  });

  if (!filtered.length) {
    wrap.innerHTML = `<div style="padding:40px;text-align:center;color:var(--text-muted);font-size:13px;">No hay usuarios que coincidan con el filtro.</div>`;
    return;
  }

  wrap.innerHTML = `
    <div style="font-size:12px;color:var(--text-muted);margin-bottom:12px;">${filtered.length} usuario${filtered.length !== 1 ? 's' : ''} de ${allUsersData.length} en la plataforma</div>
    <div style="background:var(--black-card);border:1px solid var(--border-line);border-radius:14px;overflow:hidden;overflow-x:auto;">
      <table style="width:100%;border-collapse:collapse;min-width:720px;">
        <thead><tr style="border-bottom:1px solid var(--border-line);">
          ${['Usuario','Email','Rol','Cuenta padre','Estado','Ingreso'].map(h =>
            `<th style="text-align:left;padding:10px 14px;font-size:11px;font-family:var(--font-mono);color:var(--text-muted);text-transform:uppercase;letter-spacing:.06em;">${h}</th>`
          ).join('')}
        </tr></thead>
        <tbody>${filtered.map(u => {
          const initials = (u.full_name || u.email || 'CX').substring(0,2).toUpperCase();
          const active = u.is_active !== false;
          const created = u.created_at ? new Date(u.created_at).toLocaleDateString('es-ES',{day:'numeric',month:'short',year:'numeric'}) : '—';
          // Cuenta padre: solo aplica a colaboradores (parent_account_id).
          const parent = u.parent_account_id ? byId[u.parent_account_id] : null;
          const parentLabel = u.role === 'collaborator'
            ? (parent ? (parent.full_name || parent.email) : (u.parent_account_id ? '—' : 'Sin cuenta'))
            : '—';
          return `<tr style="border-bottom:1px solid rgba(255,255,255,.04);">
            <td style="padding:12px 14px;"><div style="display:flex;align-items:center;gap:9px;">
              <div style="width:26px;height:26px;border-radius:50%;background:var(--green-dim);border:1px solid var(--green-border);display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;color:var(--green);flex-shrink:0;">${initials}</div>
              <span style="font-size:13px;font-weight:500;color:var(--text-primary);">${u.full_name || u.email || '—'}</span>
            </div></td>
            <td style="padding:12px 14px;font-size:12px;color:var(--text-secondary);">${u.email || '—'}</td>
            <td style="padding:12px 14px;"><span style="font-size:10px;font-family:var(--font-mono);padding:2px 7px;border-radius:4px;border:1px solid;${userRoleBadgeStyle(u.role)}">${userRoleLabel(u.role)}</span></td>
            <td style="padding:12px 14px;font-size:12px;color:var(--text-secondary);">${parentLabel}</td>
            <td style="padding:12px 14px;font-size:12px;color:${active ? 'var(--green)' : 'var(--amber)'};">● ${active ? 'Activo' : 'Inactivo'}</td>
            <td style="padding:12px 14px;font-size:12px;color:var(--text-muted);font-family:var(--font-mono);">${created}</td>
          </tr>`;
        }).join('')}</tbody>
      </table>
    </div>`;
}
window.renderAdminUsersView = renderAdminUsersView;
window.filterAdminUsers     = filterAdminUsers;

// ── Vista: CEOs ────────────────────────────────────────────
async function renderAdminCEOsView() {
  const el = document.getElementById('admin-ceos-list');
  if (!el) return;
  el.innerHTML = '<div style="color:var(--text-muted);font-size:13px;">Cargando...</div>';

  const { data: ceos } = await sb.from('profiles').select('*').in('role',['ceo','client']).order('created_at',{ascending:false});
  const list = ceos || [];

  if (!list.length) {
    el.innerHTML = `<div style="padding:40px;text-align:center;color:var(--text-muted);font-size:13px;">Sin CEOs registrados todavía.</div>`;
    return;
  }

  const badgeCls = 'color:var(--acid);background:rgba(166,255,0,.08);border:1px solid rgba(166,255,0,.2);border-radius:4px;font-size:10px;font-family:var(--font-mono);padding:1px 6px;';

  el.innerHTML = `
    <table style="width:100%;border-collapse:collapse;">
      <thead><tr style="border-bottom:1px solid var(--border-line);">
        ${['Empresa / CEO','Email','Nicho','Estado','Creado','Acciones'].map(h =>
          `<th style="text-align:left;padding:8px 12px;font-size:11px;font-family:var(--font-mono);color:var(--text-muted);text-transform:uppercase;letter-spacing:.06em;">${h}</th>`
        ).join('')}
      </tr></thead>
      <tbody>${list.map(c => {
        const status = c.status || 'activo';
        const created = c.created_at ? new Date(c.created_at).toLocaleDateString('es-ES',{day:'numeric',month:'short',year:'numeric'}) : '—';
        return `<tr onclick="openClientOverview('${c.id}')" style="cursor:pointer;border-bottom:1px solid var(--border-line);">
          <td style="padding:12px;"><div style="font-weight:600;font-size:13px;color:var(--text-primary);">${c.full_name||c.email}</div><span style="${badgeCls}">CEO</span></td>
          <td style="padding:12px;font-size:12px;color:var(--text-secondary);">${c.email}</td>
          <td style="padding:12px;font-size:12px;color:var(--text-secondary);">${c.nicho||'—'}</td>
          <td style="padding:12px;"><span class="status-badge ${status==='activo'?'stable':'warning'}">${status}</span></td>
          <td style="padding:12px;font-size:12px;color:var(--text-muted);font-family:var(--font-mono);">${created}</td>
          <td style="padding:12px;"><svg viewBox="0 0 16 16" fill="none" style="width:16px;height:16px;color:var(--text-muted);"><path d="M6 3l5 5-5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg></td>
        </tr>`;
      }).join('')}</tbody>
    </table>`;
}
window.renderAdminCEOsView = renderAdminCEOsView;

// ── Vista: Programa 90D ────────────────────────────────────
async function renderAdminProgram90View() {
  const listEl = document.getElementById('admin-program90-list');
  const kpiEl  = document.getElementById('admin-program90-kpis');
  if (!listEl) return;

  listEl.innerHTML = '<div style="color:var(--text-muted);font-size:13px;">Cargando...</div>';

  const { data: clients } = await sb.from('profiles').select('*').eq('role','program_90d').order('created_at',{ascending:false});
  const { data: allProgress } = await sb.from('client_modules').select('*');
  const { data: allTasks }    = await sb.from('tasks').select('*');
  const list = clients || [];
  const today = new Date(); today.setHours(0,0,0,0);

  // KPIs
  let activos=0, completados=0, pausados=0, proxFinish=0, totalPct=0, vencidas=0;
  let topClient=null, topPct=0, atrasados=0;
  list.forEach(c => {
    const s = (c.status||'activo').toLowerCase();
    if(s==='activo') activos++; else if(s==='finalizado') completados++; else if(s==='pausado') pausados++;
    const prog = (allProgress||[]).filter(p=>p.client_id===c.id);
    const done = prog.filter(p=>p.completed).length;
    const pct  = Math.round((done/9)*100);
    totalPct += pct;
    if(pct>topPct){topPct=pct;topClient=c;}
    if(c.end_date){const dl=Math.ceil((new Date(c.end_date)-today)/86400000);if(dl>0&&dl<=15)proxFinish++;}
    if(c.start_date){const dn=Math.floor((Date.now()-new Date(c.start_date).getTime())/86400000)+1;const ep=Math.round((Math.min(dn,90)/90)*100);if(pct<ep-20)atrasados++;}
  });
  (allTasks||[]).forEach(t=>{if(!t.completed&&t.due_date&&new Date(t.due_date)<today)vencidas++;});
  const avgPct = list.length>0?Math.round(totalPct/list.length):0;

  if (kpiEl) kpiEl.innerHTML = [
    {val:activos,    label:'Activos',    cls:'green'},
    {val:completados,label:'Completados',cls:''},
    {val:pausados,   label:'Pausados',   cls:'amber'},
    {val:proxFinish, label:'Próx. fin',  cls:'amber'},
    {val:avgPct+'%', label:'Promedio',   cls:'green'},
    {val:atrasados,  label:'Atrasados',  cls:atrasados>0?'amber':''},
    {val:vencidas,   label:'T. vencidas',cls:vencidas>0?'critical':''},
    {val:topClient?(topClient.full_name||topClient.email).split(' ')[0]+' '+topPct+'%':'—', label:'Mayor avance', cls:'green'},
  ].map(k=>`<div class="cc-qs-card ${k.cls}"><div class="cc-qs-val" style="font-size:18px;">${k.val}</div><div class="cc-qs-label">${k.label}</div></div>`).join('');

  if (!list.length) {
    listEl.innerHTML = `<div style="padding:40px;text-align:center;color:var(--text-muted);font-size:13px;">Sin clientes del Programa 90D todavía.</div>`;
    return;
  }

  const badgeCls = 'color:#818CF8;background:rgba(99,102,241,.1);border:1px solid rgba(99,102,241,.2);border-radius:4px;font-size:10px;font-family:var(--font-mono);padding:1px 6px;';

  listEl.innerHTML = `
    <table style="width:100%;border-collapse:collapse;">
      <thead><tr style="border-bottom:1px solid var(--border-line);">
        ${['Cliente','Nicho','Ingreso','Día','Días rest.','Progreso','Estado','Acciones'].map(h =>
          `<th style="text-align:left;padding:8px 12px;font-size:11px;font-family:var(--font-mono);color:var(--text-muted);text-transform:uppercase;letter-spacing:.06em;">${h}</th>`
        ).join('')}
      </tr></thead>
      <tbody>${list.map(c => {
        const prog = (allProgress||[]).filter(p=>p.client_id===c.id);
        const done = prog.filter(p=>p.completed).length;
        const pct  = Math.round((done/9)*100);
        let dayNum='—', daysLeft='—', daysClass='';
        if(c.start_date){const d=Math.floor((Date.now()-new Date(c.start_date).getTime())/86400000)+1;dayNum=Math.min(90,Math.max(1,d));}
        if(c.end_date){const dl=Math.ceil((new Date(c.end_date)-today)/86400000);daysLeft=dl>0?dl+' días':'Vencido';daysClass=dl<=0?'days-urgent':dl<=15?'days-warn':'days-ok';}
        const startStr=c.start_date?new Date(c.start_date).toLocaleDateString('es-ES',{day:'numeric',month:'short',year:'numeric'}):'—';
        const status=c.status||'activo';
        return `<tr onclick="openClientOverview('${c.id}')" style="cursor:pointer;border-bottom:1px solid var(--border-line);">
          <td style="padding:12px;"><div style="font-weight:600;font-size:13px;color:var(--text-primary);">${c.full_name||c.email}</div><span style="${badgeCls}">Prog 90D</span></td>
          <td style="padding:12px;font-size:12px;color:var(--text-secondary);">${c.nicho||'—'}</td>
          <td style="padding:12px;font-size:12px;color:var(--text-muted);font-family:var(--font-mono);">${startStr}</td>
          <td style="padding:12px;font-size:13px;color:var(--acid);font-family:var(--font-mono);">${dayNum}</td>
          <td style="padding:12px;"><span class="days-remaining ${daysClass}">${daysLeft}</span></td>
          <td style="padding:12px;"><div style="display:flex;align-items:center;gap:8px;"><div class="progress-cell-bar"><div class="progress-cell-fill" style="width:${pct}%"></div></div><span style="font-size:11px;color:var(--text-muted);">${pct}%</span></div></td>
          <td style="padding:12px;"><span class="status-badge ${status==='activo'?'stable':status==='pausado'?'warning':'optimal'}">${status}</span></td>
          <td style="padding:12px;"><svg viewBox="0 0 16 16" fill="none" style="width:16px;height:16px;color:var(--text-muted);"><path d="M6 3l5 5-5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg></td>
        </tr>`;
      }).join('')}</tbody>
    </table>`;
}
window.renderAdminProgram90View = renderAdminProgram90View;

// ── Vista: Consultoría / Servicios ─────────────────────────
async function renderAdminConsultingView() {
  const el = document.getElementById('admin-consulting-list');
  if (!el) return;
  el.innerHTML = '<div style="color:var(--text-muted);font-size:13px;">Cargando...</div>';

  const { data: clients } = await sb.from('profiles').select('*').eq('role','service_client').order('created_at',{ascending:false});
  const list = clients || [];

  if (!list.length) {
    el.innerHTML = `<div style="padding:40px;text-align:center;color:var(--text-muted);font-size:13px;">No hay clientes de consultoría registrados todavía.</div>`;
    return;
  }

  const badgeCls = 'color:#F59E0B;background:rgba(245,158,11,.1);border:1px solid rgba(245,158,11,.2);border-radius:4px;font-size:10px;font-family:var(--font-mono);padding:1px 6px;';

  el.innerHTML = `
    <table style="width:100%;border-collapse:collapse;">
      <thead><tr style="border-bottom:1px solid var(--border-line);">
        ${['Cliente','Email','Nicho','Estado','Inicio','Acciones'].map(h =>
          `<th style="text-align:left;padding:8px 12px;font-size:11px;font-family:var(--font-mono);color:var(--text-muted);text-transform:uppercase;letter-spacing:.06em;">${h}</th>`
        ).join('')}
      </tr></thead>
      <tbody>${list.map(c => {
        const status  = c.status || 'activo';
        const created = c.created_at ? new Date(c.created_at).toLocaleDateString('es-ES',{day:'numeric',month:'short',year:'numeric'}) : '—';
        return `<tr onclick="openClientOverview('${c.id}')" style="cursor:pointer;border-bottom:1px solid var(--border-line);">
          <td style="padding:12px;"><div style="font-weight:600;font-size:13px;color:var(--text-primary);">${c.full_name||c.email}</div><span style="${badgeCls}">Consultoría</span></td>
          <td style="padding:12px;font-size:12px;color:var(--text-secondary);">${c.email}</td>
          <td style="padding:12px;font-size:12px;color:var(--text-secondary);">${c.nicho||'—'}</td>
          <td style="padding:12px;"><span class="status-badge ${status==='activo'?'stable':'warning'}">${status}</span></td>
          <td style="padding:12px;font-size:12px;color:var(--text-muted);font-family:var(--font-mono);">${created}</td>
          <td style="padding:12px;"><svg viewBox="0 0 16 16" fill="none" style="width:16px;height:16px;color:var(--text-muted);"><path d="M6 3l5 5-5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg></td>
        </tr>`;
      }).join('')}</tbody>
    </table>`;
}
window.renderAdminConsultingView = renderAdminConsultingView;

// ── Vista: Apps ────────────────────────────────────────────
async function renderAdminAppsView() {
  const el = document.getElementById('admin-apps-list');
  if (!el) return;
  el.innerHTML = '<div style="color:var(--text-muted);font-size:13px;">Cargando...</div>';

  const { data: clients } = await sb.from('profiles').select('*').eq('role','app_client').order('created_at',{ascending:false});
  const list = clients || [];

  if (!list.length) {
    el.innerHTML = `<div style="padding:40px;text-align:center;color:var(--text-muted);font-size:13px;">No hay proyectos de apps registrados todavía.</div>`;
    return;
  }

  const badgeCls = 'color:#14B8A6;background:rgba(20,184,166,.1);border:1px solid rgba(20,184,166,.2);border-radius:4px;font-size:10px;font-family:var(--font-mono);padding:1px 6px;';

  el.innerHTML = `
    <table style="width:100%;border-collapse:collapse;">
      <thead><tr style="border-bottom:1px solid var(--border-line);">
        ${['Proyecto / App','Email','Nicho','Estado','Ingreso','Acciones'].map(h =>
          `<th style="text-align:left;padding:8px 12px;font-size:11px;font-family:var(--font-mono);color:var(--text-muted);text-transform:uppercase;letter-spacing:.06em;">${h}</th>`
        ).join('')}
      </tr></thead>
      <tbody>${list.map(c => {
        const status  = c.status || 'activo';
        const created = c.created_at ? new Date(c.created_at).toLocaleDateString('es-ES',{day:'numeric',month:'short',year:'numeric'}) : '—';
        return `<tr onclick="openClientOverview('${c.id}')" style="cursor:pointer;border-bottom:1px solid var(--border-line);">
          <td style="padding:12px;"><div style="font-weight:600;font-size:13px;color:var(--text-primary);">${c.full_name||c.email}</div><span style="${badgeCls}">App</span></td>
          <td style="padding:12px;font-size:12px;color:var(--text-secondary);">${c.email}</td>
          <td style="padding:12px;font-size:12px;color:var(--text-secondary);">${c.nicho||'—'}</td>
          <td style="padding:12px;"><span class="status-badge ${status==='activo'?'stable':'warning'}">${status}</span></td>
          <td style="padding:12px;font-size:12px;color:var(--text-muted);font-family:var(--font-mono);">${created}</td>
          <td style="padding:12px;"><svg viewBox="0 0 16 16" fill="none" style="width:16px;height:16px;color:var(--text-muted);"><path d="M6 3l5 5-5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg></td>
        </tr>`;
      }).join('')}</tbody>
    </table>`;
}
window.renderAdminAppsView = renderAdminAppsView;
