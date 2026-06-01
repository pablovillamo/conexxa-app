// ============================================================
// OPERACIONES OS — Base Operativa
// Storage: localStorage → preparado para Supabase
// Módulos: SOPs · Checklists · Auditorías
// ============================================================

console.log('[OperacionesOS] loaded');

const OPS_SOPS_KEY        = 'ops_sops_v1';
const OPS_CHECKLISTS_KEY  = 'ops_checklists_v1';
const OPS_AUDITORIAS_KEY  = 'ops_auditorias_v1';

let opsTab    = 'dashboard';
let opsFilter = { clientId: 'all' };
let _tempChecklistItems = [];

// ── Areas ─────────────────────────────────────────────────

const OPS_AREAS = [
  'Ventas','Inventario','Caja','Bodega','Servicio al cliente',
  'Ecommerce','Compras','RRHH','Sucursal','Logística','Marketing',
  'Administración','TI','Calidad','Otro',
];

// ── Storage API — SOPs ─────────────────────────────────────

function ops_sops_getAll()   { try { return JSON.parse(localStorage.getItem(OPS_SOPS_KEY)||'[]'); } catch { return []; } }
function ops_sops_delete(id) { localStorage.setItem(OPS_SOPS_KEY, JSON.stringify(ops_sops_getAll().filter(s=>s.id!==id))); }
function ops_sops_save(sop) {
  const all = ops_sops_getAll();
  const idx = all.findIndex(s => s.id === sop.id);
  const now = new Date().toISOString();
  if (idx !== -1) { all[idx] = { ...all[idx], ...sop, updated_at: now }; }
  else { all.unshift({ ...sop, id: crypto.randomUUID(), created_at: now, updated_at: now }); }
  localStorage.setItem(OPS_SOPS_KEY, JSON.stringify(all));
}

// ── Storage API — Checklists ───────────────────────────────

function ops_cl_getAll()   { try { return JSON.parse(localStorage.getItem(OPS_CHECKLISTS_KEY)||'[]'); } catch { return []; } }
function ops_cl_delete(id) { localStorage.setItem(OPS_CHECKLISTS_KEY, JSON.stringify(ops_cl_getAll().filter(c=>c.id!==id))); }
function ops_cl_save(cl) {
  const all = ops_cl_getAll();
  const idx = all.findIndex(c => c.id === cl.id);
  const now = new Date().toISOString();
  if (idx !== -1) { all[idx] = { ...all[idx], ...cl, updated_at: now }; }
  else { all.unshift({ ...cl, id: crypto.randomUUID(), created_at: now, updated_at: now }); }
  localStorage.setItem(OPS_CHECKLISTS_KEY, JSON.stringify(all));
}

// ── Storage API — Auditorías ───────────────────────────────

function ops_aud_getAll()   { try { return JSON.parse(localStorage.getItem(OPS_AUDITORIAS_KEY)||'[]'); } catch { return []; } }
function ops_aud_delete(id) { localStorage.setItem(OPS_AUDITORIAS_KEY, JSON.stringify(ops_aud_getAll().filter(a=>a.id!==id))); }
function ops_aud_save(aud) {
  const all = ops_aud_getAll();
  const idx = all.findIndex(a => a.id === aud.id);
  const now = new Date().toISOString();
  if (idx !== -1) { all[idx] = { ...all[idx], ...aud, updated_at: now }; }
  else { all.unshift({ ...aud, id: crypto.randomUUID(), created_at: now, updated_at: now }); }
  localStorage.setItem(OPS_AUDITORIAS_KEY, JSON.stringify(all));
}

// ── Filtered helpers ───────────────────────────────────────

function ops_filteredSops()       { return filterByClient(ops_sops_getAll()); }
function ops_filteredChecklists() { return filterByClient(ops_cl_getAll()); }
function ops_filteredAuditorias() { return filterByClient(ops_aud_getAll()); }

function filterByClient(arr) {
  if (opsFilter.clientId === 'all') return arr;
  return arr.filter(i => i.client_id === opsFilter.clientId);
}

function getClientName(id) {
  const clients = typeof allClientsData !== 'undefined' ? allClientsData : [];
  return clients.find(c => c.id === id)?.full_name || '—';
}

// ── Main Render ────────────────────────────────────────────

function renderOperacionesView() {
  const root = document.getElementById('view-admin-operaciones');
  if (!root) return;

  const clients     = typeof allClientsData !== 'undefined' ? allClientsData : [];
  const sops        = ops_sops_getAll();
  const checklists  = ops_cl_getAll();
  const auditorias  = ops_aud_getAll();

  const kpis = {
    sops_activos:   sops.filter(s => s.estado === 'activo').length,
    cl_activos:     checklists.filter(c => c.estado === 'activo').length,
    aud_pendientes: auditorias.filter(a => a.estado === 'pendiente').length,
    aud_completas:  auditorias.filter(a => a.estado === 'completada').length,
    incidencias:    0, // Próximamente
    cumplimiento:   auditorias.length > 0
      ? Math.round(auditorias.filter(a=>a.estado==='completada').reduce((s,a) => s + (Number(a.puntaje)||0), 0)
          / Math.max(1, auditorias.filter(a=>a.estado==='completada').length))
      : 0,
  };

  const clientOptions = clients.map(c =>
    `<option value="${c.id}" ${c.id === opsFilter.clientId ? 'selected' : ''}>${c.full_name || c.email || '—'}</option>`
  ).join('');

  const TABS = [
    { id:'dashboard',  icon:'📊', label:'Dashboard' },
    { id:'sops',       icon:'📋', label:'SOPs' },
    { id:'checklists', icon:'✅', label:'Checklists' },
    { id:'auditorias', icon:'🔍', label:'Auditorías' },
    { id:'incidencias',icon:'🚨', label:'Incidencias', soon:true },
    { id:'calidad',    icon:'⭐', label:'Calidad',      soon:true },
    { id:'sucursales', icon:'🏪', label:'Sucursales',   soon:true },
  ];

  const tabBtns = TABS.map(t => `
    <button class="ops-tab-btn${opsTab === t.id ? ' active' : ''}${t.soon ? ' soon' : ''}"
      onclick="${t.soon ? `showOSToast('${t.label} — Próximamente','os-toast-soon')` : `showOpsTab('${t.id}')`}">
      ${t.icon} ${t.label}${t.soon ? ' <span class="ops-soon-dot">⏳</span>' : ''}
    </button>
  `).join('');

  root.innerHTML = `
    <div class="ops-body">

      <!-- Header -->
      <div class="ops-header">
        <div>
          <button class="back-btn" onclick="showAdminView('os')" style="margin-bottom:12px;">
            <svg viewBox="0 0 16 16" fill="none"><path d="M10 3L5 8l5 5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
            Volver al OS
          </button>
          <p class="ops-eyebrow">Módulos Empresariales</p>
          <h1 class="ops-title">Operaciones OS</h1>
          <p class="ops-sub">Controlá procesos, SOPs, checklists, auditorías, incidencias y cumplimiento operativo por cliente.</p>
        </div>
        <select class="ops-client-select" onchange="opsFilterClient(this.value)">
          <option value="all">Todos los clientes</option>
          ${clientOptions}
        </select>
      </div>

      <!-- KPIs -->
      <div class="ops-kpis">
        <div class="ops-kpi ops-kpi-main">
          <div class="ops-kpi-val">${kpis.sops_activos}</div>
          <div class="ops-kpi-label">SOPs activos</div>
        </div>
        <div class="ops-kpi">
          <div class="ops-kpi-icon">✅</div>
          <div class="ops-kpi-val">${kpis.cl_activos}</div>
          <div class="ops-kpi-label">Checklists activos</div>
        </div>
        <div class="ops-kpi" style="--ok:var(--amber)">
          <div class="ops-kpi-icon">⏳</div>
          <div class="ops-kpi-val" style="color:var(--amber)">${kpis.aud_pendientes}</div>
          <div class="ops-kpi-label">Auditorías pendientes</div>
        </div>
        <div class="ops-kpi">
          <div class="ops-kpi-icon">🔍</div>
          <div class="ops-kpi-val">${kpis.aud_completas}</div>
          <div class="ops-kpi-label">Auditorías completadas</div>
        </div>
        <div class="ops-kpi" style="--ok:var(--red)">
          <div class="ops-kpi-icon">🚨</div>
          <div class="ops-kpi-val" style="color:var(--gray)">—</div>
          <div class="ops-kpi-label">Incidencias abiertas</div>
        </div>
        <div class="ops-kpi">
          <div class="ops-kpi-icon">📈</div>
          <div class="ops-kpi-val" style="color:${kpis.cumplimiento >= 70 ? 'var(--green)' : kpis.cumplimiento >= 40 ? 'var(--amber)' : 'var(--gray)'}">
            ${kpis.cumplimiento > 0 ? kpis.cumplimiento + '%' : '—'}
          </div>
          <div class="ops-kpi-label">Cumplimiento promedio</div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="ops-tabs">${tabBtns}</div>

      <!-- Content -->
      <div id="ops-content"></div>

    </div>
  `;

  ops_renderTab();
}

// ── Tab render ─────────────────────────────────────────────

function showOpsTab(tab) {
  opsTab = tab;
  document.querySelectorAll('.ops-tab-btn').forEach(b => b.classList.remove('active'));
  const TABS = ['dashboard','sops','checklists','auditorias','incidencias','calidad','sucursales'];
  const idx = TABS.indexOf(tab);
  const btns = document.querySelectorAll('.ops-tab-btn');
  if (btns[idx]) btns[idx].classList.add('active');
  ops_renderTab();
}

function ops_renderTab() {
  switch (opsTab) {
    case 'dashboard':  ops_renderDashboard();  break;
    case 'sops':       ops_renderSOPs();        break;
    case 'checklists': ops_renderChecklists();  break;
    case 'auditorias': ops_renderAuditorias();  break;
  }
}

// ── Dashboard ─────────────────────────────────────────────

function ops_renderDashboard() {
  const el = document.getElementById('ops-content');
  if (!el) return;

  const sops       = ops_filteredSops();
  const checklists = ops_filteredChecklists();
  const auditorias = ops_filteredAuditorias();

  const recentSops = sops.slice(0,4).map(s => `
    <div class="ops-list-row">
      <div class="ops-list-row-left">
        <span class="ops-area-badge">${s.area || '—'}</span>
        <span class="ops-list-title">${s.titulo}</span>
      </div>
      <div class="ops-list-row-right">
        <span class="ops-estado-badge ops-estado-${s.estado}">${s.estado}</span>
        <span class="ops-list-meta">${getClientName(s.client_id)}</span>
      </div>
    </div>`).join('') || `<div class="ops-empty-inline">Sin SOPs registrados.</div>`;

  const recentAuds = auditorias.slice(0,4).map(a => `
    <div class="ops-list-row">
      <div class="ops-list-row-left">
        <span class="ops-area-badge">${a.area || '—'}</span>
        <span class="ops-list-title">${a.nombre}</span>
      </div>
      <div class="ops-list-row-right">
        ${a.puntaje ? `<span class="ops-puntaje" style="color:${Number(a.puntaje)>=70?'var(--green)':Number(a.puntaje)>=40?'var(--amber)':'var(--red)'};">${a.puntaje}%</span>` : ''}
        <span class="ops-estado-badge ops-estado-${a.estado}">${a.estado.replace('_',' ')}</span>
        <span class="ops-list-meta">${getClientName(a.client_id)}</span>
      </div>
    </div>`).join('') || `<div class="ops-empty-inline">Sin auditorías registradas.</div>`;

  el.innerHTML = `
    <div class="ops-dashboard">
      <div class="ops-dash-grid">
        <div class="ops-dash-card">
          <div class="ops-dash-card-header">
            <div class="ops-dash-card-title">📋 SOPs recientes</div>
            <button class="ops-link-btn" onclick="showOpsTab('sops')">Ver todos →</button>
          </div>
          <div class="ops-list">${recentSops}</div>
        </div>
        <div class="ops-dash-card">
          <div class="ops-dash-card-header">
            <div class="ops-dash-card-title">🔍 Auditorías recientes</div>
            <button class="ops-link-btn" onclick="showOpsTab('auditorias')">Ver todas →</button>
          </div>
          <div class="ops-list">${recentAuds}</div>
        </div>
      </div>

      <div class="ops-dash-quick">
        <div class="ops-dash-quick-title">Accesos rápidos</div>
        <div class="ops-quick-btns">
          <button class="ops-quick-btn" onclick="showOpsTab('sops');setTimeout(()=>openSopModal(),100)">📋 Nuevo SOP</button>
          <button class="ops-quick-btn" onclick="showOpsTab('checklists');setTimeout(()=>openChecklistModal(),100)">✅ Nuevo Checklist</button>
          <button class="ops-quick-btn" onclick="showOpsTab('auditorias');setTimeout(()=>openAuditoriaModal(),100)">🔍 Nueva Auditoría</button>
        </div>
      </div>
    </div>
  `;
}

// ── SOPs ──────────────────────────────────────────────────

function ops_renderSOPs() {
  const el = document.getElementById('ops-content');
  if (!el) return;

  const sops = ops_filteredSops();

  const rows = sops.length === 0
    ? `<div class="ops-empty">Sin SOPs todavía. Documentá el primer proceso de tu cliente.</div>`
    : sops.map(s => {
        const pasos = Array.isArray(s.pasos) ? s.pasos : (s.pasos||'').split('\n').filter(Boolean);
        return `
          <div class="ops-card">
            <div class="ops-card-top">
              <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
                <span class="ops-area-badge">${s.area || '—'}</span>
                <span class="ops-estado-badge ops-estado-${s.estado}">${s.estado}</span>
                <span class="ops-prioridad-badge ops-pri-${s.prioridad}">${s.prioridad}</span>
              </div>
              <button class="ops-delete-btn" onclick="opsDelete('sop','${s.id}')">✕</button>
            </div>
            <div class="ops-card-title">${s.titulo}</div>
            ${s.descripcion ? `<div class="ops-card-desc">${s.descripcion.substring(0,120)}${s.descripcion.length>120?'…':''}</div>` : ''}
            ${pasos.length ? `
              <div class="ops-steps">
                ${pasos.slice(0,3).map((p,i) => `<div class="ops-step"><span class="ops-step-num">${i+1}</span><span>${p}</span></div>`).join('')}
                ${pasos.length > 3 ? `<div class="ops-step-more">+${pasos.length-3} pasos más</div>` : ''}
              </div>` : ''}
            <div class="ops-card-footer">
              <span>👤 ${s.responsable || '—'}</span>
              <span>🏢 ${getClientName(s.client_id)}</span>
              <span>${new Date(s.created_at).toLocaleDateString('es-CR',{day:'numeric',month:'short'})}</span>
            </div>
          </div>`;
      }).join('');

  el.innerHTML = `
    <div class="ops-section-header">
      <div>
        <div class="ops-section-title">📋 SOPs</div>
        <div class="ops-section-sub">${sops.length} procedimiento${sops.length!==1?'s':''} registrado${sops.length!==1?'s':''}</div>
      </div>
      <button class="ops-add-btn" onclick="openSopModal()">+ Nuevo SOP</button>
    </div>
    <div class="ops-cards-grid">${rows}</div>
  `;
}

// ── Checklists ────────────────────────────────────────────

function ops_renderChecklists() {
  const el = document.getElementById('ops-content');
  if (!el) return;

  const checklists = ops_filteredChecklists();

  const rows = checklists.length === 0
    ? `<div class="ops-empty">Sin checklists todavía. Creá el primer checklist operativo.</div>`
    : checklists.map(cl => {
        const items     = cl.items || [];
        const done      = items.filter(i => i.completado).length;
        const pct       = items.length ? Math.round(done/items.length*100) : 0;
        return `
          <div class="ops-card">
            <div class="ops-card-top">
              <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
                <span class="ops-area-badge">${cl.area || '—'}</span>
                <span class="ops-freq-badge">${cl.frecuencia}</span>
                <span class="ops-estado-badge ops-estado-${cl.estado}">${cl.estado}</span>
              </div>
              <button class="ops-delete-btn" onclick="opsDelete('checklist','${cl.id}')">✕</button>
            </div>
            <div class="ops-card-title">${cl.nombre}</div>
            ${items.length ? `
              <div class="ops-cl-progress">
                <div class="ops-cl-bar"><div class="ops-cl-fill" style="width:${pct}%"></div></div>
                <span class="ops-cl-pct">${done}/${items.length} · ${pct}%</span>
              </div>
              <div class="ops-cl-items">
                ${items.slice(0,5).map(item => `
                  <label class="ops-cl-item">
                    <input type="checkbox" ${item.completado?'checked':''} onchange="opsToggleItem('${cl.id}','${item.id}',this.checked)" />
                    <span style="${item.completado?'text-decoration:line-through;color:var(--gray)':''}">${item.texto}</span>
                  </label>`).join('')}
                ${items.length > 5 ? `<div class="ops-step-more">+${items.length-5} items más</div>` : ''}
              </div>` : `<div style="font-size:12px;color:var(--gray);">Sin items.</div>`}
            <div class="ops-card-footer">
              <span>👤 ${cl.responsable || '—'}</span>
              <span>🏢 ${getClientName(cl.client_id)}</span>
            </div>
          </div>`;
      }).join('');

  el.innerHTML = `
    <div class="ops-section-header">
      <div>
        <div class="ops-section-title">✅ Checklists</div>
        <div class="ops-section-sub">${checklists.length} checklist${checklists.length!==1?'s':''} registrado${checklists.length!==1?'s':''}</div>
      </div>
      <button class="ops-add-btn" onclick="openChecklistModal()">+ Nuevo Checklist</button>
    </div>
    <div class="ops-cards-grid">${rows}</div>
  `;
}

// ── Auditorías ────────────────────────────────────────────

function ops_renderAuditorias() {
  const el = document.getElementById('ops-content');
  if (!el) return;

  const auditorias = ops_filteredAuditorias();

  const rows = auditorias.length === 0
    ? `<div class="ops-empty">Sin auditorías todavía. Registrá la primera auditoría operativa.</div>`
    : auditorias.map(a => {
        const puntajeNum = Number(a.puntaje) || 0;
        const puntajeColor = puntajeNum >= 70 ? 'var(--green)' : puntajeNum >= 40 ? 'var(--amber)' : 'var(--red)';
        return `
          <div class="ops-card">
            <div class="ops-card-top">
              <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
                <span class="ops-area-badge">${a.area || '—'}</span>
                <span class="ops-estado-badge ops-estado-${a.estado.replace('_','-')}">${a.estado.replace('_',' ')}</span>
                ${a.sucursal ? `<span class="ops-sucursal-badge">🏪 ${a.sucursal}</span>` : ''}
              </div>
              <div style="display:flex;align-items:center;gap:10px;">
                ${a.puntaje ? `<span class="ops-puntaje-big" style="color:${puntajeColor};">${puntajeNum}%</span>` : ''}
                <button class="ops-delete-btn" onclick="opsDelete('auditoria','${a.id}')">✕</button>
              </div>
            </div>
            <div class="ops-card-title">${a.nombre}</div>
            ${a.puntaje ? `
              <div class="ops-cl-progress" style="margin-top:8px;">
                <div class="ops-cl-bar"><div class="ops-cl-fill" style="width:${puntajeNum}%;background:${puntajeColor};"></div></div>
              </div>` : ''}
            ${a.observaciones ? `<div class="ops-card-desc">${a.observaciones.substring(0,100)}${a.observaciones.length>100?'…':''}</div>` : ''}
            <div class="ops-card-footer">
              <span>📅 ${a.fecha || '—'}</span>
              <span>🏢 ${getClientName(a.client_id)}</span>
            </div>
          </div>`;
      }).join('');

  el.innerHTML = `
    <div class="ops-section-header">
      <div>
        <div class="ops-section-title">🔍 Auditorías</div>
        <div class="ops-section-sub">${auditorias.length} auditoría${auditorias.length!==1?'s':''} registrada${auditorias.length!==1?'s':''}</div>
      </div>
      <button class="ops-add-btn" onclick="openAuditoriaModal()">+ Nueva Auditoría</button>
    </div>
    <div class="ops-cards-grid">${rows}</div>
  `;
}

// ── Modal SOP ─────────────────────────────────────────────

function openSopModal() {
  const clients   = typeof allClientsData !== 'undefined' ? allClientsData : [];
  const preClient = opsFilter.clientId !== 'all' ? opsFilter.clientId : (selectedClientId || '');

  document.getElementById('modal-new-sop-body').innerHTML = `
    <div class="ops-form-grid">
      <div class="ops-form-field full">
        <label class="ops-form-label">Título del SOP <span class="req">*</span></label>
        <input class="ops-input" type="text" id="sop-titulo" placeholder="Ej: Proceso de apertura de sucursal" />
      </div>
      <div class="ops-form-field">
        <label class="ops-form-label">Cliente <span class="req">*</span></label>
        <select class="ops-input" id="sop-client">
          <option value="">— Seleccionar —</option>
          ${clients.map(c=>`<option value="${c.id}" ${c.id===preClient?'selected':''}>${c.full_name||c.email||'—'}</option>`).join('')}
        </select>
      </div>
      <div class="ops-form-field">
        <label class="ops-form-label">Área</label>
        <select class="ops-input" id="sop-area">
          ${OPS_AREAS.map(a=>`<option value="${a}">${a}</option>`).join('')}
        </select>
      </div>
      <div class="ops-form-field">
        <label class="ops-form-label">Estado</label>
        <select class="ops-input" id="sop-estado">
          <option value="borrador">Borrador</option>
          <option value="activo" selected>Activo</option>
          <option value="archivado">Archivado</option>
        </select>
      </div>
      <div class="ops-form-field">
        <label class="ops-form-label">Prioridad</label>
        <select class="ops-input" id="sop-prioridad">
          <option value="baja">Baja</option>
          <option value="media" selected>Media</option>
          <option value="alta">Alta</option>
        </select>
      </div>
      <div class="ops-form-field">
        <label class="ops-form-label">Responsable</label>
        <input class="ops-input" type="text" id="sop-responsable" placeholder="Ej: Gerente de Operaciones" />
      </div>
      <div class="ops-form-field full">
        <label class="ops-form-label">Descripción</label>
        <textarea class="ops-input ops-textarea" id="sop-descripcion" rows="3" placeholder="¿Para qué sirve este SOP? ¿Cuándo se aplica?"></textarea>
      </div>
      <div class="ops-form-field full">
        <label class="ops-form-label">Pasos <span style="font-size:10px;color:var(--gray);font-weight:400;">(uno por línea)</span></label>
        <textarea class="ops-input ops-textarea" id="sop-pasos" rows="5"
          placeholder="1. Verificar apertura de caja&#10;2. Revisar inventario&#10;3. Encender sistemas..."></textarea>
      </div>
    </div>
    <div class="modal-msg" id="sop-form-msg"></div>
  `;
  openModal('modal-new-sop');
}

function saveSop() {
  const titulo   = document.getElementById('sop-titulo')?.value.trim();
  const clientId = document.getElementById('sop-client')?.value;
  const msg      = document.getElementById('sop-form-msg');
  if (!titulo)   { showMsg(msg,'error','El título es requerido.'); return; }
  if (!clientId) { showMsg(msg,'error','Seleccioná un cliente.'); return; }
  const pasosRaw = document.getElementById('sop-pasos')?.value || '';
  ops_sops_save({
    titulo,
    client_id:   clientId,
    area:         document.getElementById('sop-area')?.value || '',
    descripcion:  document.getElementById('sop-descripcion')?.value.trim() || '',
    pasos:        pasosRaw.split('\n').map(p=>p.trim()).filter(Boolean),
    responsable:  document.getElementById('sop-responsable')?.value.trim() || '',
    estado:       document.getElementById('sop-estado')?.value || 'activo',
    prioridad:    document.getElementById('sop-prioridad')?.value || 'media',
  });
  closeModal('modal-new-sop');
  ops_renderSOPs();
}

// ── Modal Checklist ───────────────────────────────────────

function openChecklistModal() {
  _tempChecklistItems = [];
  const clients   = typeof allClientsData !== 'undefined' ? allClientsData : [];
  const preClient = opsFilter.clientId !== 'all' ? opsFilter.clientId : (selectedClientId || '');

  document.getElementById('modal-new-checklist-body').innerHTML = `
    <div class="ops-form-grid">
      <div class="ops-form-field full">
        <label class="ops-form-label">Nombre del Checklist <span class="req">*</span></label>
        <input class="ops-input" type="text" id="cl-nombre" placeholder="Ej: Checklist apertura diaria" />
      </div>
      <div class="ops-form-field">
        <label class="ops-form-label">Cliente <span class="req">*</span></label>
        <select class="ops-input" id="cl-client">
          <option value="">— Seleccionar —</option>
          ${clients.map(c=>`<option value="${c.id}" ${c.id===preClient?'selected':''}>${c.full_name||c.email||'—'}</option>`).join('')}
        </select>
      </div>
      <div class="ops-form-field">
        <label class="ops-form-label">Área</label>
        <select class="ops-input" id="cl-area">
          ${OPS_AREAS.map(a=>`<option value="${a}">${a}</option>`).join('')}
        </select>
      </div>
      <div class="ops-form-field">
        <label class="ops-form-label">Frecuencia</label>
        <select class="ops-input" id="cl-frecuencia">
          <option value="diaria">Diaria</option>
          <option value="semanal">Semanal</option>
          <option value="mensual">Mensual</option>
          <option value="unica">Única</option>
        </select>
      </div>
      <div class="ops-form-field">
        <label class="ops-form-label">Responsable</label>
        <input class="ops-input" type="text" id="cl-responsable" placeholder="Ej: Encargado de turno" />
      </div>
      <div class="ops-form-field full">
        <label class="ops-form-label">Items del checklist</label>
        <div class="ops-item-add-row">
          <input class="ops-input" type="text" id="cl-item-input" placeholder="Ej: Verificar caja chica"
            onkeydown="if(event.key==='Enter'){event.preventDefault();ops_addClItem();}" />
          <button class="ops-add-item-btn" onclick="ops_addClItem()">+ Agregar</button>
        </div>
        <div id="cl-items-list" class="ops-items-list"></div>
      </div>
    </div>
    <div class="modal-msg" id="cl-form-msg"></div>
  `;
  openModal('modal-new-checklist');
}

function ops_addClItem() {
  const input = document.getElementById('cl-item-input');
  const texto = input?.value.trim();
  if (!texto) return;
  _tempChecklistItems.push({ id: crypto.randomUUID(), texto, completado: false });
  input.value = '';
  ops_renderTempItems();
  input.focus();
}

function ops_renderTempItems() {
  const el = document.getElementById('cl-items-list');
  if (!el) return;
  el.innerHTML = _tempChecklistItems.map((item, idx) => `
    <div class="ops-temp-item">
      <span class="ops-step-num">${idx+1}</span>
      <span style="flex:1;">${item.texto}</span>
      <button class="ops-delete-btn" onclick="_tempChecklistItems.splice(${idx},1);ops_renderTempItems()">✕</button>
    </div>`).join('') || `<div style="font-size:12px;color:var(--gray);padding:6px 0;">Sin items. Agregá al menos uno.</div>`;
}

function saveChecklist() {
  const nombre   = document.getElementById('cl-nombre')?.value.trim();
  const clientId = document.getElementById('cl-client')?.value;
  const msg      = document.getElementById('cl-form-msg');
  if (!nombre)   { showMsg(msg,'error','El nombre es requerido.'); return; }
  if (!clientId) { showMsg(msg,'error','Seleccioná un cliente.'); return; }
  ops_cl_save({
    nombre,
    client_id:  clientId,
    area:        document.getElementById('cl-area')?.value || '',
    frecuencia:  document.getElementById('cl-frecuencia')?.value || 'diaria',
    responsable: document.getElementById('cl-responsable')?.value.trim() || '',
    estado:      'activo',
    items:       [..._tempChecklistItems],
  });
  _tempChecklistItems = [];
  closeModal('modal-new-checklist');
  ops_renderChecklists();
}

function opsToggleItem(checklistId, itemId, checked) {
  const all = ops_cl_getAll();
  const cl  = all.find(c => c.id === checklistId);
  if (!cl) return;
  const item = (cl.items||[]).find(i => i.id === itemId);
  if (item) item.completado = checked;
  localStorage.setItem(OPS_CHECKLISTS_KEY, JSON.stringify(all));
  // Refresh just the progress bar
  ops_renderChecklists();
}

// ── Modal Auditoría ───────────────────────────────────────

function openAuditoriaModal() {
  const clients   = typeof allClientsData !== 'undefined' ? allClientsData : [];
  const preClient = opsFilter.clientId !== 'all' ? opsFilter.clientId : (selectedClientId || '');

  document.getElementById('modal-new-auditoria-body').innerHTML = `
    <div class="ops-form-grid">
      <div class="ops-form-field full">
        <label class="ops-form-label">Nombre de la auditoría <span class="req">*</span></label>
        <input class="ops-input" type="text" id="aud-nombre" placeholder="Ej: Auditoría operativa Q2 2026" />
      </div>
      <div class="ops-form-field">
        <label class="ops-form-label">Cliente <span class="req">*</span></label>
        <select class="ops-input" id="aud-client">
          <option value="">— Seleccionar —</option>
          ${clients.map(c=>`<option value="${c.id}" ${c.id===preClient?'selected':''}>${c.full_name||c.email||'—'}</option>`).join('')}
        </select>
      </div>
      <div class="ops-form-field">
        <label class="ops-form-label">Área</label>
        <select class="ops-input" id="aud-area">
          ${OPS_AREAS.map(a=>`<option value="${a}">${a}</option>`).join('')}
        </select>
      </div>
      <div class="ops-form-field">
        <label class="ops-form-label">Sucursal (opcional)</label>
        <input class="ops-input" type="text" id="aud-sucursal" placeholder="Ej: Sucursal San José" />
      </div>
      <div class="ops-form-field">
        <label class="ops-form-label">Estado</label>
        <select class="ops-input" id="aud-estado">
          <option value="pendiente" selected>Pendiente</option>
          <option value="en_proceso">En proceso</option>
          <option value="completada">Completada</option>
        </select>
      </div>
      <div class="ops-form-field">
        <label class="ops-form-label">Puntaje (0–100)</label>
        <input class="ops-input" type="number" id="aud-puntaje" min="0" max="100" placeholder="Ej: 85" />
      </div>
      <div class="ops-form-field">
        <label class="ops-form-label">Fecha</label>
        <input class="ops-input" type="date" id="aud-fecha" value="${new Date().toISOString().split('T')[0]}" />
      </div>
      <div class="ops-form-field full">
        <label class="ops-form-label">Observaciones</label>
        <textarea class="ops-input ops-textarea" id="aud-observaciones" rows="4"
          placeholder="Hallazgos, oportunidades de mejora, acciones recomendadas..."></textarea>
      </div>
    </div>
    <div class="modal-msg" id="aud-form-msg"></div>
  `;
  openModal('modal-new-auditoria');
}

function saveAuditoria() {
  const nombre   = document.getElementById('aud-nombre')?.value.trim();
  const clientId = document.getElementById('aud-client')?.value;
  const msg      = document.getElementById('aud-form-msg');
  if (!nombre)   { showMsg(msg,'error','El nombre es requerido.'); return; }
  if (!clientId) { showMsg(msg,'error','Seleccioná un cliente.'); return; }
  ops_aud_save({
    nombre,
    client_id:     clientId,
    area:           document.getElementById('aud-area')?.value || '',
    sucursal:       document.getElementById('aud-sucursal')?.value.trim() || '',
    estado:         document.getElementById('aud-estado')?.value || 'pendiente',
    puntaje:        document.getElementById('aud-puntaje')?.value || null,
    fecha:          document.getElementById('aud-fecha')?.value || null,
    observaciones:  document.getElementById('aud-observaciones')?.value.trim() || '',
    checklist_id:   null,
  });
  closeModal('modal-new-auditoria');
  ops_renderAuditorias();
}

// ── Delete ────────────────────────────────────────────────

function opsDelete(type, id) {
  if (!confirm('¿Eliminar este registro?')) return;
  if (type === 'sop')       { ops_sops_delete(id); ops_renderSOPs(); }
  if (type === 'checklist') { ops_cl_delete(id);   ops_renderChecklists(); }
  if (type === 'auditoria') { ops_aud_delete(id);  ops_renderAuditorias(); }
}

// ── Filtro por cliente ────────────────────────────────────

function opsFilterClient(clientId) {
  opsFilter.clientId = clientId;
  ops_renderTab();
}

// ── Exports ───────────────────────────────────────────────

window.renderOperacionesView  = renderOperacionesView;
window.showOpsTab             = showOpsTab;
window.openSopModal           = openSopModal;
window.saveSop                = saveSop;
window.openChecklistModal     = openChecklistModal;
window.saveChecklist          = saveChecklist;
window.ops_addClItem          = ops_addClItem;
window.opsToggleItem          = opsToggleItem;
window.openAuditoriaModal     = openAuditoriaModal;
window.saveAuditoria          = saveAuditoria;
window.opsDelete              = opsDelete;
window.opsFilterClient        = opsFilterClient;
