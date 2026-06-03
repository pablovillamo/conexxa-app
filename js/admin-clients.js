console.log("[AdminClients] loaded");

// ============================================================ ADMIN CLIENTES
let allClientsData = [];
let allProgressData = [];
let allTasksData = [];

function getClientImageUrl(client) {
  if (!client) return null;
  return client.profile_image_url || client.photo_url || client.avatar_url || client.logo_url || client.image_url || null;
}

async function loadAdminClients() {
  // Transición: incluye 'client' (legacy) y 'ceo' hasta completar migración
  const { data: clients } = await sb.from('profiles').select('*').in('role',['client','ceo']).order('created_at',{ascending:false});
  const { data: allProgress } = await sb.from('client_modules').select('*');
  const { data: allTasks } = await sb.from('tasks').select('*');

  allClientsData = clients || [];
  allProgressData = allProgress || [];
  allTasksData = allTasks || [];
  window.ConexxaState.setAllClientsData(allClientsData);

  // DEBUG: ver qué campos de imagen trae Supabase
  if (allClientsData.length > 0) {
    const sample = allClientsData[0];
    console.log('[AdminClients] keys del primer cliente:', Object.keys(sample));
    console.log('[AdminClients] campos de imagen:', {
      profile_image_url: sample.profile_image_url,
      photo_url: sample.photo_url,
      avatar_url: sample.avatar_url,
      logo_url: sample.logo_url,
      image_url: sample.image_url
    });
  }

  const total = allClientsData.length;
  let activos=0, completados=0, pausados=0, proxFinish=0, totalPct=0;
  let topClient = null, topPct = 0, vencidas = 0;
  const today = new Date(); today.setHours(0,0,0,0);

  allClientsData.forEach(c => {
    const status = (c.status || 'activo').toLowerCase();
    if(status === 'activo') activos++;
    else if(status === 'finalizado') completados++;
    else if(status === 'pausado') pausados++;
    const prog = allProgressData.filter(p => p.client_id === c.id);
    const done = prog.filter(p => p.completed).length;
    const pct = Math.round((done/9)*100);
    totalPct += pct;
    if(pct > topPct) { topPct = pct; topClient = c; }
    if(c.end_date) {
      const daysLeft = Math.ceil((new Date(c.end_date) - today) / 86400000);
      if(daysLeft > 0 && daysLeft <= 15) proxFinish++;
    }
  });

  allTasksData.forEach(t => { if(!t.completed && t.due_date && new Date(t.due_date) < today) vencidas++; });

  const avgPct = total > 0 ? Math.round(totalPct/total) : 0;
  const atrasados = allClientsData.filter(c => {
    if(!c.start_date) return false;
    const dayNum = Math.floor((Date.now() - new Date(c.start_date).getTime()) / 86400000) + 1;
    const prog = allProgressData.filter(p => p.client_id === c.id);
    const done = prog.filter(p => p.completed).length;
    const pct = Math.round((done/9)*100);
    const expectedPct = Math.round((Math.min(dayNum,90)/90)*100);
    return pct < expectedPct - 20;
  }).length;

  document.getElementById('kpi-activos').textContent = activos;
  document.getElementById('kpi-completados').textContent = completados;
  document.getElementById('kpi-pausados').textContent = pausados;
  document.getElementById('kpi-prox').textContent = proxFinish;
  document.getElementById('kpi-avg').textContent = avgPct + '%';
  document.getElementById('alert-atrasados').textContent = atrasados;
  document.getElementById('alert-vencidas').textContent = vencidas;
  document.getElementById('alert-top').textContent = topClient ? (topClient.full_name || topClient.email).split(' ')[0] + ' ' + topPct + '%' : '—';
  document.getElementById('admin-subtitle').textContent = `${total} cliente${total!==1?'s':''} · Conexxa`;
  renderClientsTable(allClientsData);
}

function renderClientsTable(clients) {
  const tbody = document.getElementById('clients-tbody');
  if (!tbody) return;
  if(!clients || clients.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:32px;color:var(--gray);">Sin clientes aún. Agrega el primero.</td></tr>';
    return;
  }
  const today = new Date(); today.setHours(0,0,0,0);
  tbody.innerHTML = clients.map(c => {
    const prog = allProgressData.filter(p => p.client_id === c.id);
    const done = prog.filter(p => p.completed).length;
    const pct = Math.round((done/9)*100);
    const initials = (c.full_name || c.email || 'CX').substring(0,2).toUpperCase();
    console.log('[Client image debug]', c.full_name || c.email, { profile_image_url: c.profile_image_url, photo_url: c.photo_url, avatar_url: c.avatar_url, logo_url: c.logo_url });
    const imgUrl = getClientImageUrl(c);
    let avatarContent, avatarStyleAttr;
    if (imgUrl) {
      avatarContent = `<img src="${imgUrl}" style="width:100%;height:100%;object-fit:cover;border-radius:inherit;" alt="" onerror="this.parentElement.style.padding='';this.parentElement.textContent='${initials}';" />`;
      avatarStyleAttr = ' style="padding:0;"';
    } else {
      avatarContent = initials;
      avatarStyleAttr = '';
    }
    const startStr = c.start_date ? new Date(c.start_date).toLocaleDateString('es-ES',{day:'numeric',month:'short',year:'numeric'}) : '—';
    let dayNum = '—', daysLeft = '—', daysClass = '';
    if(c.start_date) {
      const d = Math.floor((Date.now()-new Date(c.start_date).getTime())/86400000)+1;
      dayNum = Math.min(90,Math.max(1,d));
    }
    if(c.end_date) {
      const dl = Math.ceil((new Date(c.end_date)-today)/86400000);
      daysLeft = dl > 0 ? dl + ' días' : 'Vencido';
      daysClass = dl <= 0 ? 'days-urgent' : dl <= 15 ? 'days-warn' : 'days-ok';
    }
    const status = c.status || 'activo';
    const statusMap = {activo:'status-activo',pausado:'status-pausado',finalizado:'status-finalizado',pendiente:'status-pendiente'};
    const statusLabel = {activo:'Activo',pausado:'Pausado',finalizado:'Finalizado',pendiente:'Pendiente'};
    return `<tr onclick="openClientOverview('${c.id}')" style="cursor:pointer;">
      <td><div style="display:flex;align-items:center;gap:10px;">
        <div class="client-avatar-cell"${avatarStyleAttr}>${avatarContent}</div>
        <div><div class="client-name-cell">${c.full_name || c.email}</div><div class="client-nicho-cell">${c.email}</div></div>
      </div></td>
      <td style="color:var(--gray);font-size:12px;">${c.nicho || '—'}</td>
      <td style="color:var(--gray);font-size:12px;">${startStr}</td>
      <td><span class="mono" style="font-size:13px;color:var(--green);">${dayNum}</span></td>
      <td><span class="days-remaining ${daysClass}">${daysLeft}</span></td>
      <td><div style="display:flex;align-items:center;gap:8px;">
        <div class="progress-cell-bar"><div class="progress-cell-fill" style="width:${pct}%"></div></div>
        <span style="font-size:12px;color:var(--gray);">${pct}%</span>
      </div></td>
      <td><span class="status-badge ${statusMap[status]||'status-pendiente'}">● ${statusLabel[status]||status}</span></td>
      <td><svg viewBox="0 0 16 16" fill="none" style="width:16px;height:16px;color:var(--gray);"><path d="M6 3l5 5-5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></td>
    </tr>`;
  }).join('');
}

function filterClients() {
  const search = (document.getElementById('client-search')?.value || '').toLowerCase();
  const status = document.getElementById('filter-status')?.value || '';
  const sort = document.getElementById('filter-sort')?.value || 'date';
  const today = new Date(); today.setHours(0,0,0,0);
  let filtered = allClientsData.filter(c => {
    const matchSearch = !search || (c.full_name||'').toLowerCase().includes(search) || (c.email||'').toLowerCase().includes(search) || (c.nicho||'').toLowerCase().includes(search);
    const matchStatus = !status || (c.status||'activo').toLowerCase() === status;
    return matchSearch && matchStatus;
  });
  if(sort === 'progress') {
    filtered.sort((a,b) => {
      const pa = allProgressData.filter(p=>p.client_id===a.id).filter(p=>p.completed).length;
      const pb = allProgressData.filter(p=>p.client_id===b.id).filter(p=>p.completed).length;
      return pb - pa;
    });
  } else if(sort === 'days') {
    filtered.sort((a,b) => {
      const da = a.end_date ? Math.ceil((new Date(a.end_date)-today)/86400000) : 999;
      const db = b.end_date ? Math.ceil((new Date(b.end_date)-today)/86400000) : 999;
      return da - db;
    });
  } else if(sort === 'name') {
    filtered.sort((a,b) => (a.full_name||a.email).localeCompare(b.full_name||b.email));
  }
  renderClientsTable(filtered);
}

// ── Vista general del cliente (nueva entrada desde Clientes) ─

function openClientOverview(clientId) {
  selectedClientId = clientId;
  window.ConexxaState.setSelectedClientId(clientId);
  const clients = typeof allClientsData !== 'undefined' ? allClientsData : [];
  const client  = clients.find(c => c.id === clientId) || { id: clientId };

  showView('view-admin-client-dashboard');
  if (typeof setSidebarActive === 'function') setSidebarActive('clients');
  renderClientOverview(client);
}

function renderClientOverview(client) {
  const root = document.getElementById('view-admin-client-dashboard');
  if (!root) return;

  const name     = client.full_name || client.email || '—';
  const initials = name.substring(0, 2).toUpperCase();
  const types    = typeof parseBusinessTypes === 'function' ? parseBusinessTypes(client.business_type) : [];
  const typeBadges = types.map(t => {
    const info = typeof BUSINESS_TYPES !== 'undefined' ? BUSINESS_TYPES[t] : null;
    return info ? `<span style="font-size:11px;font-weight:600;padding:3px 9px;border-radius:6px;background:${info.bg};color:${info.color};">${info.icon} ${info.label}</span>` : '';
  }).join('');
  const statusColor = client.client_status === 'activo' ? 'var(--green)' : client.client_status === 'pausado' ? 'var(--amber)' : 'var(--gray)';

  const futureMods = [
    { icon:'📊', name:'Resumen general',   desc:'KPIs, progreso y métricas clave del cliente.' },
    { icon:'⚡', name:'Módulos activos',    desc:'Todos los módulos habilitados para esta cuenta.' },
    { icon:'🔌', name:'Integraciones',      desc:'Estado de todas las conexiones activas.' },
    { icon:'₡',  name:'Costos',            desc:'Dashboard de gastos y costos operativos.' },
    { icon:'✅', name:'Tareas',             desc:'Seguimiento de tareas asignadas.' },
    { icon:'📈', name:'KPIs',              desc:'Métricas de rendimiento y objetivos.' },
    { icon:'🛒', name:'Ecommerce OS',      desc:'Shopify, productos, órdenes y métricas.' },
    { icon:'⚙️', name:'Operaciones OS',   desc:'Flujos, SOPs y operación del negocio.' },
    { icon:'📦', name:'Inventario OS',     desc:'Stock, movimientos y alertas de inventario.' },
    { icon:'🛍️', name:'Compras OS',       desc:'Proveedores, órdenes de compra y costos.' },
  ];

  root.innerHTML = `
    <div class="cc-body">

      <!-- Back -->
      <button class="back-btn" onclick="showAdminView('clients')" style="margin-bottom:20px;">
        <svg viewBox="0 0 16 16" fill="none"><path d="M10 3L5 8l5 5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
        Volver a Clientes
      </button>

      <!-- Client header -->
      <div style="display:flex;align-items:center;gap:16px;margin-bottom:28px;flex-wrap:wrap;">
        <div style="width:48px;height:48px;border-radius:50%;background:var(--green-dim);border:2px solid var(--green-border);display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:700;color:var(--green);flex-shrink:0;">${initials}</div>
        <div style="flex:1;">
          <h1 style="font-size:22px;font-weight:700;color:var(--white);margin-bottom:4px;">${name}</h1>
          <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">
            <span style="font-size:12px;color:${statusColor};">● ${client.client_status || 'pendiente'}</span>
            ${client.nicho ? `<span style="font-size:12px;color:var(--gray);">${client.nicho}</span>` : ''}
            ${typeBadges}
          </div>
        </div>
        <button class="btn-action" style="font-size:12px;padding:8px 16px;" onclick="openClientDetail('${client.id}')">
          Ver OS Ecommerce →
        </button>
      </div>

      <!-- Placeholder banner -->
      <div style="background:rgba(34,197,94,.05);border:1px solid rgba(34,197,94,.2);border-radius:14px;padding:24px;margin-bottom:32px;text-align:center;">
        <div style="font-size:22px;margin-bottom:8px;">🚧</div>
        <div style="font-size:15px;font-weight:600;color:var(--white);margin-bottom:6px;">Dashboard del Cliente — Próximamente</div>
        <div style="font-size:13px;color:var(--gray);max-width:520px;margin:0 auto;line-height:1.6;">Aquí se centralizará la vista general del cliente por tipo de negocio, módulos activos, integraciones, costos, tareas, KPIs y progreso.</div>
      </div>

      <!-- Future modules grid -->
      <div style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.1em;color:var(--gray);font-family:'DM Mono',monospace;margin-bottom:14px;">Módulos futuros de esta vista</div>
      <div class="cc-modules-grid">
        ${futureMods.map(m => `
          <div style="background:var(--black-card);border:1px solid var(--border);border-radius:14px;padding:18px;opacity:.6;">
            <div style="font-size:20px;margin-bottom:8px;">${m.icon}</div>
            <div style="font-size:13px;font-weight:600;color:var(--white);margin-bottom:4px;">${m.name}</div>
            <div style="font-size:12px;color:var(--gray);line-height:1.4;">${m.desc}</div>
            <div style="font-size:10px;color:var(--amber);margin-top:10px;text-transform:uppercase;letter-spacing:.08em;font-family:'DM Mono',monospace;">⏳ En construcción</div>
          </div>
        `).join('')}
      </div>

    </div>
  `;
}

window.openClientOverview  = openClientOverview;
window.renderClientOverview = renderClientOverview;

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
