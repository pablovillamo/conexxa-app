// ============================================================
// COSTOS OS — V-GROWTH
// Almacenamiento: localStorage (preparado para Supabase)
// Moneda: Colones costarricenses (₡)
// ============================================================

console.log('[Costos] loaded');

const COSTOS_KEY = 'costos_v1';

// ── Categorías ────────────────────────────────────────────

const COSTOS_CATEGORIAS = {
  ecommerce:      { label:'Ecommerce',      icon:'🛒', color:'#22C55E', bg:'rgba(34,197,94,.1)' },
  comercial:      { label:'Comercial',       icon:'📣', color:'#6366F1', bg:'rgba(99,102,241,.1)' },
  administrativo: { label:'Administrativo',  icon:'📋', color:'#F59E0B', bg:'rgba(245,158,11,.1)' },
  operativo:      { label:'Operativo',       icon:'⚙️', color:'#14B8A6', bg:'rgba(20,184,166,.1)' },
};

const COSTOS_SUBCATEGORIAS = {
  ecommerce:      ['Shopify Plan','Apps Shopify','Klaviyo','ManyChat','WhatsApp Business','Dominio','Hosting','Pasarela de pago','Comisiones ecommerce','Otro'],
  comercial:      ['Meta Ads','Google Ads','Influencers','Producción de contenido','Fotografía','Diseño gráfico','Promociones','Comisiones de venta','Otro'],
  administrativo: ['Contabilidad','Legal / Notaría','Comisiones bancarias','Software administrativo','Licencias','Suscripciones','Oficina','Asesorías','Otro'],
  operativo:      ['Renta','Planilla','Servicios públicos','Transporte','Bodega','Empaque','Mantenimiento','Inventario operativo','ERP/POS','Otro'],
};

const COSTOS_FRECUENCIAS = ['mensual','anual','unico','variable'];
const COSTOS_ESTADOS     = ['activo','pendiente','cancelado'];
const COSTOS_ORIGENES    = ['manual','api','csv','estimado'];

// ── Storage API (swap para Supabase) ──────────────────────

function costos_getAll() {
  try {
    return JSON.parse(localStorage.getItem(COSTOS_KEY) || '[]');
  } catch { return []; }
}

function costos_save(gasto) {
  const all = costos_getAll();
  const idx = all.findIndex(g => g.id === gasto.id);
  if (idx !== -1) {
    all[idx] = { ...all[idx], ...gasto, updated_at: new Date().toISOString() };
  } else {
    all.unshift({ ...gasto, id: crypto.randomUUID(), created_at: new Date().toISOString(), updated_at: new Date().toISOString() });
  }
  localStorage.setItem(COSTOS_KEY, JSON.stringify(all));
}

function costos_delete(id) {
  const all = costos_getAll().filter(g => g.id !== id);
  localStorage.setItem(COSTOS_KEY, JSON.stringify(all));
}

function costos_getForClient(clientId) {
  return costos_getAll().filter(g => g.client_id === clientId);
}

// ── Normalización a monto mensual ─────────────────────────

function costos_monthly(gasto) {
  const m = Number(gasto.monto) || 0;
  if (gasto.frecuencia === 'anual') return m / 12;
  if (gasto.frecuencia === 'unico') return 0; // no entra en mensual recurrente
  return m;
}

// ── Formato colones ───────────────────────────────────────

function fmt(amount) {
  if (!amount) return '₡0';
  return '₡' + Math.round(amount).toLocaleString('es-CR');
}

// ── Estado actual de filtros ──────────────────────────────

let costosFilter = { clientId: 'all', categoria: 'all' };

// ── Render principal ──────────────────────────────────────

function renderCostosView() {
  const root = document.getElementById('view-admin-costos');
  if (!root) return;

  const clients = typeof allClientsData !== 'undefined' ? allClientsData : [];
  const clientOptions = clients.map(c =>
    `<option value="${c.id}">${c.full_name || c.email || '—'}</option>`
  ).join('');

  root.innerHTML = `
    <div class="costos-body">

      <!-- Header -->
      <div class="costos-header">
        <div>
          <button class="back-btn" onclick="showAdminView('os')" style="margin-bottom:12px;">
            <svg viewBox="0 0 16 16" fill="none"><path d="M10 3L5 8l5 5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
            Volver al OS
          </button>
          <p class="costos-eyebrow">Admin · Finanzas</p>
          <h1 class="costos-title">Costos OS</h1>
          <p class="costos-sub">Control de gastos de todos los clientes. Moneda: Colones costarricenses.</p>
        </div>
        <button class="costos-add-btn" onclick="openAddCostoModal()">+ Agregar gasto</button>
      </div>

      <!-- Filtros -->
      <div class="costos-filters">
        <select class="costos-select" id="costo-filter-client" onchange="costos_applyFilter()">
          <option value="all">Todos los clientes</option>
          ${clientOptions}
        </select>
        <select class="costos-select" id="costo-filter-cat" onchange="costos_applyFilter()">
          <option value="all">Todas las categorías</option>
          ${Object.entries(COSTOS_CATEGORIAS).map(([k,v]) =>
            `<option value="${k}">${v.icon} ${v.label}</option>`
          ).join('')}
        </select>
      </div>

      <!-- Dashboard -->
      <div id="costos-dashboard"></div>

      <!-- Tablas -->
      <div id="costos-tables"></div>

    </div>
  `;

  costos_renderDashboard();
  costos_renderTables();
}

// ── Dashboard ─────────────────────────────────────────────

function costos_renderDashboard() {
  const el = document.getElementById('costos-dashboard');
  if (!el) return;

  const gastos = costos_filtered();
  const clients = typeof allClientsData !== 'undefined' ? allClientsData : [];

  // Totales por categoría (mensual)
  const totals = { ecommerce: 0, comercial: 0, administrativo: 0, operativo: 0 };
  gastos.forEach(g => {
    if (g.estado === 'cancelado') return;
    const cat = g.categoria;
    if (totals[cat] !== undefined) totals[cat] += costos_monthly(g);
  });
  const totalMensual = Object.values(totals).reduce((a, b) => a + b, 0);

  // Por cliente
  const byClient = {};
  gastos.forEach(g => {
    if (g.estado === 'cancelado') return;
    byClient[g.client_id] = (byClient[g.client_id] || 0) + costos_monthly(g);
  });
  const clientTotals = Object.entries(byClient).sort((a, b) => b[1] - a[1]);

  const topClient = clientTotals[0];
  const lowClient = clientTotals[clientTotals.length - 1];
  const getClientName = (id) => (clients.find(c => c.id === id)?.full_name || id?.slice(0,8) || '—');
  const avgPerClient  = clientTotals.length ? totalMensual / clientTotals.length : 0;
  const activeGastos  = gastos.filter(g => g.estado === 'activo').length;

  el.innerHTML = `
    <div class="costos-kpis">
      <div class="costos-kpi costos-kpi-main">
        <div class="costos-kpi-val">${fmt(totalMensual)}</div>
        <div class="costos-kpi-label">Gasto mensual total</div>
        <div class="costos-kpi-sub">${activeGastos} gastos activos</div>
      </div>
      ${Object.entries(COSTOS_CATEGORIAS).map(([k,v]) => `
        <div class="costos-kpi" style="--ck-color:${v.color};">
          <div class="costos-kpi-icon">${v.icon}</div>
          <div class="costos-kpi-val">${fmt(totals[k])}</div>
          <div class="costos-kpi-label">${v.label}</div>
        </div>
      `).join('')}
      <div class="costos-kpi">
        <div class="costos-kpi-icon">📊</div>
        <div class="costos-kpi-val" style="font-size:14px;">${fmt(avgPerClient)}</div>
        <div class="costos-kpi-label">Promedio por cliente</div>
      </div>
      ${topClient ? `
        <div class="costos-kpi">
          <div class="costos-kpi-icon">🔺</div>
          <div class="costos-kpi-val" style="font-size:14px;color:#FCA5A5;">${getClientName(topClient[0])}</div>
          <div class="costos-kpi-label">Mayor gasto · ${fmt(topClient[1])}</div>
        </div>` : ''}
    </div>
  `;
}

// ── Tablas ────────────────────────────────────────────────

function costos_renderTables() {
  const el = document.getElementById('costos-tables');
  if (!el) return;

  const gastos = costos_filtered();
  const clients = typeof allClientsData !== 'undefined' ? allClientsData : [];
  const getClientName = (id) => clients.find(c => c.id === id)?.full_name || '—';

  const categoriasToShow = costosFilter.categoria === 'all'
    ? Object.keys(COSTOS_CATEGORIAS)
    : [costosFilter.categoria];

  el.innerHTML = categoriasToShow.map(catKey => {
    const cat   = COSTOS_CATEGORIAS[catKey];
    const rows  = gastos.filter(g => g.categoria === catKey);
    const total = rows.filter(g => g.estado !== 'cancelado').reduce((s, g) => s + costos_monthly(g), 0);

    const colLabel = { ecommerce:'Plataforma', comercial:'Canal', administrativo:'Área', operativo:'Área operativa' };

    const tableRows = rows.length === 0
      ? `<tr><td colspan="8" style="text-align:center;padding:24px;color:var(--gray);font-size:13px;">Sin gastos en esta categoría. <button onclick="openAddCostoModal('${catKey}')" style="background:transparent;border:none;color:var(--green);cursor:pointer;font-family:'Inter',sans-serif;font-size:13px;text-decoration:underline;">Agregar →</button></td></tr>`
      : rows.map(g => {
          const estadoColor = g.estado === 'activo' ? 'var(--green)' : g.estado === 'cancelado' ? 'var(--red)' : 'var(--amber)';
          const montoParsed = costos_monthly(g);
          return `
            <tr style="border-bottom:1px solid rgba(255,255,255,0.04);">
              <td style="padding:10px 14px;font-size:13px;color:var(--white);font-weight:500;">${getClientName(g.client_id)}</td>
              <td style="padding:10px 14px;font-size:13px;color:var(--white);">${g.concepto || '—'}</td>
              <td style="padding:10px 14px;font-size:12px;color:var(--gray);">${g.subcategoria || '—'}</td>
              <td style="padding:10px 14px;font-size:13px;font-weight:700;color:var(--white);font-variant-numeric:tabular-nums;">${fmt(g.monto)}</td>
              <td style="padding:10px 14px;font-size:11px;color:var(--gray);text-transform:uppercase;letter-spacing:.06em;">${g.frecuencia}</td>
              <td style="padding:10px 14px;font-size:12px;color:${estadoColor};">● ${g.estado}</td>
              <td style="padding:10px 14px;font-size:11px;color:rgba(255,255,255,.4);">${g.origen}</td>
              <td style="padding:10px 14px;text-align:right;">
                <button onclick="costos_deleteItem('${g.id}')" style="background:transparent;border:none;color:var(--gray);cursor:pointer;font-size:12px;padding:4px 8px;border-radius:5px;font-family:'Inter',sans-serif;" onmouseover="this.style.color='#FCA5A5'" onmouseout="this.style.color='var(--gray)'">✕</button>
              </td>
            </tr>`;
        }).join('');

    return `
      <div class="costos-table-section">
        <div class="costos-table-header">
          <div class="costos-table-title" style="--ct-color:${cat.color};">
            <span class="costos-table-icon">${cat.icon}</span>
            <span>Gastos ${cat.label}</span>
          </div>
          <div class="costos-table-total">${fmt(total)}<span>/mes</span></div>
        </div>
        <div style="overflow-x:auto;">
          <table style="width:100%;border-collapse:collapse;min-width:680px;">
            <thead>
              <tr style="border-bottom:1px solid var(--border);">
                <th class="costos-th">Cliente</th>
                <th class="costos-th">Concepto</th>
                <th class="costos-th">${colLabel[catKey]}</th>
                <th class="costos-th">Monto</th>
                <th class="costos-th">Frecuencia</th>
                <th class="costos-th">Estado</th>
                <th class="costos-th">Origen</th>
                <th class="costos-th"></th>
              </tr>
            </thead>
            <tbody>${tableRows}</tbody>
          </table>
        </div>
      </div>
    `;
  }).join('');
}

// ── Filtrado ──────────────────────────────────────────────

function costos_filtered() {
  let all = costos_getAll();
  if (costosFilter.clientId !== 'all') {
    all = all.filter(g => g.client_id === costosFilter.clientId);
  }
  if (costosFilter.categoria !== 'all') {
    all = all.filter(g => g.categoria === costosFilter.categoria);
  }
  return all;
}

function costos_applyFilter() {
  costosFilter.clientId  = document.getElementById('costo-filter-client')?.value || 'all';
  costosFilter.categoria = document.getElementById('costo-filter-cat')?.value    || 'all';
  costos_renderDashboard();
  costos_renderTables();
}

// ── Modal agregar gasto ───────────────────────────────────

function openAddCostoModal(presetCat = '') {
  const clients = typeof allClientsData !== 'undefined' ? allClientsData : [];

  // Pre-select client from current filter
  const preClient = costosFilter.clientId !== 'all' ? costosFilter.clientId : (selectedClientId || '');

  const clientOptions = clients.map(c =>
    `<option value="${c.id}" ${c.id === preClient ? 'selected' : ''}>${c.full_name || c.email || '—'}</option>`
  ).join('');

  document.getElementById('modal-new-costo-body').innerHTML = `
    <div class="costo-form-grid">

      <div class="costo-form-field full">
        <label class="costo-form-label">Cliente <span class="req">*</span></label>
        <select class="costo-input" id="cf-client">
          <option value="">— Seleccionar cliente —</option>
          ${clientOptions}
        </select>
      </div>

      <div class="costo-form-field">
        <label class="costo-form-label">Categoría <span class="req">*</span></label>
        <select class="costo-input" id="cf-categoria" onchange="costos_updateSubcats()">
          <option value="">— Seleccionar —</option>
          ${Object.entries(COSTOS_CATEGORIAS).map(([k,v]) =>
            `<option value="${k}" ${k === presetCat ? 'selected' : ''}>${v.icon} ${v.label}</option>`
          ).join('')}
        </select>
      </div>

      <div class="costo-form-field">
        <label class="costo-form-label">Subcategoría</label>
        <select class="costo-input" id="cf-subcat">
          <option value="">— Seleccionar categoría primero —</option>
        </select>
      </div>

      <div class="costo-form-field full">
        <label class="costo-form-label">Concepto <span class="req">*</span></label>
        <input class="costo-input" type="text" id="cf-concepto" placeholder="Ej: Shopify Plan Advanced" />
      </div>

      <div class="costo-form-field">
        <label class="costo-form-label">Monto (₡) <span class="req">*</span></label>
        <input class="costo-input" type="number" id="cf-monto" placeholder="0" min="0" step="100" />
      </div>

      <div class="costo-form-field">
        <label class="costo-form-label">Frecuencia</label>
        <select class="costo-input" id="cf-frecuencia">
          ${COSTOS_FRECUENCIAS.map(f => `<option value="${f}">${f.charAt(0).toUpperCase()+f.slice(1)}</option>`).join('')}
        </select>
      </div>

      <div class="costo-form-field">
        <label class="costo-form-label">Estado</label>
        <select class="costo-input" id="cf-estado">
          ${COSTOS_ESTADOS.map(e => `<option value="${e}">${e.charAt(0).toUpperCase()+e.slice(1)}</option>`).join('')}
        </select>
      </div>

      <div class="costo-form-field">
        <label class="costo-form-label">Origen del dato</label>
        <select class="costo-input" id="cf-origen">
          ${COSTOS_ORIGENES.map(o => `<option value="${o}">${o.charAt(0).toUpperCase()+o.slice(1)}</option>`).join('')}
        </select>
      </div>

      <div class="costo-form-field">
        <label class="costo-form-label">Próximo pago</label>
        <input class="costo-input" type="date" id="cf-fecha" />
      </div>

      <div class="costo-form-field full">
        <label class="costo-form-label">Notas</label>
        <input class="costo-input" type="text" id="cf-notas" placeholder="Opcional..." />
      </div>

    </div>
    <div class="modal-msg" id="costo-form-msg"></div>
  `;

  if (presetCat) costos_updateSubcats();

  openModal('modal-new-costo');
}

function costos_updateSubcats() {
  const cat = document.getElementById('cf-categoria')?.value;
  const sel = document.getElementById('cf-subcat');
  if (!sel) return;
  const opts = cat && COSTOS_SUBCATEGORIAS[cat]
    ? COSTOS_SUBCATEGORIAS[cat].map(s => `<option value="${s}">${s}</option>`).join('')
    : '<option value="">— Seleccioná una categoría —</option>';
  sel.innerHTML = opts;
}

function saveCosto() {
  const clientId  = document.getElementById('cf-client')?.value;
  const categoria = document.getElementById('cf-categoria')?.value;
  const concepto  = document.getElementById('cf-concepto')?.value.trim();
  const monto     = parseFloat(document.getElementById('cf-monto')?.value) || 0;
  const msg       = document.getElementById('costo-form-msg');

  if (!clientId)  { showMsg(msg, 'error', 'Seleccioná un cliente.'); return; }
  if (!categoria) { showMsg(msg, 'error', 'Seleccioná una categoría.'); return; }
  if (!concepto)  { showMsg(msg, 'error', 'El concepto es requerido.'); return; }
  if (monto <= 0) { showMsg(msg, 'error', 'El monto debe ser mayor a 0.'); return; }

  costos_save({
    client_id:    clientId,
    categoria,
    subcategoria: document.getElementById('cf-subcat')?.value    || '',
    concepto,
    monto,
    frecuencia:   document.getElementById('cf-frecuencia')?.value || 'mensual',
    estado:       document.getElementById('cf-estado')?.value     || 'activo',
    origen:       document.getElementById('cf-origen')?.value     || 'manual',
    fecha_proximo_pago: document.getElementById('cf-fecha')?.value || null,
    notas:        document.getElementById('cf-notas')?.value.trim() || '',
  });

  closeModal('modal-new-costo');
  costos_renderDashboard();
  costos_renderTables();
}

function costos_deleteItem(id) {
  if (!confirm('¿Eliminar este gasto?')) return;
  costos_delete(id);
  costos_renderDashboard();
  costos_renderTables();
}

// ── Exports ───────────────────────────────────────────────

window.renderCostosView      = renderCostosView;
window.openAddCostoModal     = openAddCostoModal;
window.saveCosto             = saveCosto;
window.costos_applyFilter    = costos_applyFilter;
window.costos_updateSubcats  = costos_updateSubcats;
window.costos_deleteItem     = costos_deleteItem;
window.COSTOS_CATEGORIAS     = COSTOS_CATEGORIAS;
window.costos_getAll         = costos_getAll;
window.fmt                   = fmt;
