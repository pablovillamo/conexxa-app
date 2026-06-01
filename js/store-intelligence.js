// ============================================================
// STORE INTELLIGENCE & VISUAL MERCHANDISING
// Universal para clientes retail con tiendas físicas
// Storage: localStorage → preparado para Supabase Storage
//
// FASE 1:   Croquis de sucursal + gestión de zonas ✅
// FASE 1.2: Historial fotográfico por zona ✅
// FASE 2:   Auditorías visuales + comparativo sucursales
// FASE 3:   IA visual + heatmaps + score automático
// FASE 4:   Integración con inventario y ventas
// ============================================================

console.log('[StoreIntelligence] loaded');

const SI_STORES_KEY = 'si_stores_v1';
const SI_ZONES_KEY  = 'si_zones_v1';
const SI_PHOTOS_KEY = 'si_photos_v1';

// ── Estado activo ─────────────────────────────────────────

let si_clientId = null;
let si_storeId  = null;

// ── Tipos de zona ─────────────────────────────────────────

const SI_ZONE_TYPES = {
  entrada:       { label:'Entrada',           color:'#22C55E', bg:'rgba(34,197,94,.12)',   icon:'🚪' },
  flujo:         { label:'Flujo de clientes', color:'#3B82F6', bg:'rgba(59,130,246,.12)',  icon:'🔄' },
  zona_caliente: { label:'Zona Caliente',     color:'#EF4444', bg:'rgba(239,68,68,.12)',   icon:'🔥' },
  zona_fria:     { label:'Zona Fría',         color:'#06B6D4', bg:'rgba(6,182,212,.12)',   icon:'❄️' },
  impulso:       { label:'Punto de Impulso',  color:'#F59E0B', bg:'rgba(245,158,11,.12)',  icon:'⚡' },
  escaparate:    { label:'Escaparate',        color:'#8B5CF6', bg:'rgba(139,92,246,.12)',  icon:'🪟' },
  tarima:        { label:'Tarima',            color:'#EC4899', bg:'rgba(236,72,153,.12)',  icon:'🏷️' },
  urna:          { label:'Urna',              color:'#6366F1', bg:'rgba(99,102,241,.12)',  icon:'💎' },
  caja:          { label:'Caja',              color:'#14B8A6', bg:'rgba(20,184,166,.12)',  icon:'💰' },
  bodega:        { label:'Bodega',            color:'#6B7280', bg:'rgba(107,114,128,.12)', icon:'📦' },
  personalizada: { label:'Zona Personalizada',color:'#F97316', bg:'rgba(249,115,22,.12)',  icon:'✏️' },
};

// ── Storage — Stores (sucursales) ─────────────────────────

function si_stores_getAll()    { try { return JSON.parse(localStorage.getItem(SI_STORES_KEY)||'[]'); } catch { return []; } }
function si_stores_delete(id)  { localStorage.setItem(SI_STORES_KEY, JSON.stringify(si_stores_getAll().filter(s=>s.id!==id))); }
function si_stores_save(store) {
  const all = si_stores_getAll();
  const idx = all.findIndex(s => s.id === store.id);
  const now = new Date().toISOString();
  if (idx !== -1) { all[idx] = { ...all[idx], ...store, updated_at: now }; }
  else { all.unshift({ ...store, id: crypto.randomUUID(), created_at: now, updated_at: now }); }
  localStorage.setItem(SI_STORES_KEY, JSON.stringify(all));
}

function si_stores_forClient(clientId) {
  return si_stores_getAll().filter(s => s.client_id === clientId);
}

// ── Storage — Zones ───────────────────────────────────────

function si_zones_getAll()    { try { return JSON.parse(localStorage.getItem(SI_ZONES_KEY)||'[]'); } catch { return []; } }
function si_zones_delete(id)  { localStorage.setItem(SI_ZONES_KEY, JSON.stringify(si_zones_getAll().filter(z=>z.id!==id))); }
function si_zones_save(zone) {
  const all = si_zones_getAll();
  const idx = all.findIndex(z => z.id === zone.id);
  const now = new Date().toISOString();
  if (idx !== -1) { all[idx] = { ...all[idx], ...zone, updated_at: now }; }
  else { all.unshift({ ...zone, id: crypto.randomUUID(), created_at: now, updated_at: now }); }
  localStorage.setItem(SI_ZONES_KEY, JSON.stringify(all));
}

function si_zones_forStore(storeId) {
  return si_zones_getAll().filter(z => z.store_id === storeId);
}

// ── Storage — Photos ──────────────────────────────────────
// Schema preparado para Supabase Storage:
// url → storage.from('store-photos').getPublicUrl(path)
// thumbnail → versión resize (misma URL en Supabase con transform)

function si_photos_getAll() { try { return JSON.parse(localStorage.getItem(SI_PHOTOS_KEY)||'[]'); } catch { return []; } }
function si_photos_delete(id) { localStorage.setItem(SI_PHOTOS_KEY, JSON.stringify(si_photos_getAll().filter(p=>p.id!==id))); }

function si_photos_save(photo) {
  const all = si_photos_getAll();
  const idx = all.findIndex(p => p.id === photo.id);
  const now = new Date().toISOString();
  if (idx !== -1) { all[idx] = { ...all[idx], ...photo, updated_at: now }; }
  else { all.unshift({ ...photo, id: crypto.randomUUID(), created_at: now, updated_at: now }); }
  localStorage.setItem(SI_PHOTOS_KEY, JSON.stringify(all));
}

function si_photos_forZone(zoneId) {
  return si_photos_getAll().filter(p => p.zone_id === zoneId);
}

function si_photos_getMain(zoneId) {
  return si_photos_forZone(zoneId).find(p => p.es_principal) || null;
}

function si_photos_setPrincipal(photoId, zoneId) {
  const all = si_photos_getAll();
  all.forEach(p => { if (p.zone_id === zoneId) p.es_principal = (p.id === photoId); });
  localStorage.setItem(SI_PHOTOS_KEY, JSON.stringify(all));
}

// ── Image resize (Canvas) ─────────────────────────────────
// Preparado para Supabase Storage: reemplazar por upload a bucket

function si_resizeImage(file, maxWidth = 900, quality = 0.78) {
  console.log('[SI Photo] PASO 1 — archivo recibido:', file.name, '| tipo:', file.type, '| tamaño:', (file.size/1024).toFixed(1)+'KB');

  return new Promise((resolve, reject) => {

    // PASO 2 — Validación de formato
    const ALLOWED = ['image/jpeg', 'image/png', 'image/webp'];
    const HEIC    = ['image/heic', 'image/heif'];

    if (HEIC.includes(file.type.toLowerCase())) {
      const e = new Error('Este formato de iPhone (HEIC/HEIF) no es compatible en navegador. Convertí la foto a JPG o PNG antes de subirla.');
      console.error('[SI Photo] PASO 2 FAIL — HEIC detectado:', file.type);
      reject(e); return;
    }

    // Algunos iPhones envían tipo vacío para HEIC — detectar por extensión
    const ext = (file.name || '').split('.').pop().toLowerCase();
    if (ext === 'heic' || ext === 'heif') {
      const e = new Error('Este formato de iPhone (HEIC/HEIF) no es compatible en navegador. Convertí la foto a JPG o PNG antes de subirla.');
      console.error('[SI Photo] PASO 2 FAIL — HEIC por extensión:', ext);
      reject(e); return;
    }

    if (!ALLOWED.includes(file.type.toLowerCase())) {
      const e = new Error('Formato no soportado: ' + (file.type || 'desconocido') + '. Usá JPG, PNG o WEBP.');
      console.error('[SI Photo] PASO 2 FAIL — formato no permitido:', e.message);
      reject(e); return;
    }

    if (file.size > 8 * 1024 * 1024) {
      const e = new Error('La imagen no puede superar 8MB. Tamaño recibido: ' + (file.size/1024/1024).toFixed(1)+'MB');
      console.error('[SI Photo] PASO 2 FAIL — tamaño excedido:', e.message);
      reject(e); return;
    }

    console.log('[SI Photo] PASO 2 OK — validación pasada');

    // PASO 3 — Crear Object URL (más estable que FileReader para imágenes locales)
    let objectUrl = null;
    try {
      objectUrl = URL.createObjectURL(file);
      console.log('[SI Photo] PASO 3 OK — objectURL creado:', objectUrl.slice(0, 40) + '...');
    } catch (urlErr) {
      const e = new Error('No se pudo crear objectURL: ' + urlErr.message);
      console.error('[SI Photo] PASO 3 FAIL:', e.message);
      reject(e); return;
    }

    // PASO 4 — Cargar imagen desde objectURL
    console.log('[SI Photo] PASO 4 — cargando imagen con Image()...');
    const img = new Image();

    img.onerror = (ev) => {
      URL.revokeObjectURL(objectUrl);
      const e = new Error('La imagen no pudo cargarse. Verificá que el archivo no esté dañado.');
      console.error('[SI Photo] PASO 4 FAIL — img.onerror:', ev);
      reject(e);
    };

    img.onload = () => {
      console.log('[SI Photo] PASO 4 OK — dimensiones:', img.width, 'x', img.height);

      // Liberar objectURL en cuanto la imagen esté en memoria
      URL.revokeObjectURL(objectUrl);
      console.log('[SI Photo] PASO 4 — objectURL liberado (revokeObjectURL)');

      // PASO 5 — Canvas resize — try/catch porque img.onload es async y sus throws no llegan al Promise
      try {
        let w = img.width, h = img.height;
        if (w > maxWidth) { h = Math.round(h * maxWidth / w); w = maxWidth; }
        console.log('[SI Photo] PASO 5 — redimensionando a', w, 'x', h);

        const canvas = document.createElement('canvas');
        canvas.width  = w;
        canvas.height = h;

        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('canvas.getContext("2d") devolvió null.');

        ctx.drawImage(img, 0, 0, w, h);
        console.log('[SI Photo] PASO 5 OK — drawImage completado');

        // PASO 6 — base64 con fallback PNG si JPEG falla
        console.log('[SI Photo] PASO 6 — convirtiendo a base64 (quality=' + quality + ')...');
        let base64 = canvas.toDataURL('image/jpeg', quality);

        if (!base64 || base64 === 'data:,') {
          console.warn('[SI Photo] PASO 6 — JPEG falló, intentando PNG fallback...');
          base64 = canvas.toDataURL('image/png');
        }

        if (!base64 || base64 === 'data:,') {
          throw new Error('canvas.toDataURL no generó resultado válido en ningún formato.');
        }

        console.log('[SI Photo] PASO 6 OK — base64 listo:', (base64.length/1024).toFixed(1)+'KB');
        resolve(base64);

      } catch (canvasErr) {
        console.error('[SI Photo] PASO 5-6 FAIL:', canvasErr.message, canvasErr.stack);
        reject(canvasErr);
      }
    };

    img.src = objectUrl;
  });
}

// ── Mock data seed — solo si no hay datos ─────────────────

function si_seedMockData() {
  if (si_stores_getAll().length > 0) return; // ya hay datos

  // Buscar client_id real de Calzado 365 o usar placeholder
  const clients = typeof allClientsData !== 'undefined' ? allClientsData : [];
  const c365 = clients.find(c =>
    (c.full_name || '').toLowerCase().includes('calzado') ||
    (c.email || '').toLowerCase().includes('calzado')
  );
  const clientId = c365?.id || 'mock_calzado_365';

  const stores = [
    { id:'store_alajuela',   client_id:clientId, name:'Alajuela',        city:'Alajuela',   squareMeters:120, address:'Av. Principal, Alajuela' },
    { id:'store_sanjose',    client_id:clientId, name:'San José Centro',  city:'San José',   squareMeters:95,  address:'Calle 2, San José' },
    { id:'store_citymall',   client_id:clientId, name:'City Mall',        city:'Alajuela',   squareMeters:150, address:'City Mall, Local 34' },
  ];
  stores.forEach(s => si_stores_save({ ...s, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }));

  const zonesAlajuela = [
    { store_id:'store_alajuela', name:'Entrada principal',    type:'entrada',       width:4,  length:3, height:3.5, description:'Primera zona de impacto al ingresar. Alta visibilidad.', responsible:'Encargado de tienda', commercialPriority:'Alta',  status:'Activa', photos:[], notes:[] },
    { store_id:'store_alajuela', name:'Escaparate frontal',   type:'escaparate',    width:3,  length:1, height:2.5, description:'Vitrina principal exterior. Exhibición de colecciones nuevas.', responsible:'Encargado de tienda', commercialPriority:'Alta',  status:'Activa', photos:[], notes:[] },
    { store_id:'store_alajuela', name:'Tarima de novedades',  type:'tarima',        width:3,  length:3, height:0.3, description:'Tarima central para exhibición de productos estrella.', responsible:'Vendedor senior', commercialPriority:'Alta',  status:'Activa', photos:[], notes:[] },
    { store_id:'store_alajuela', name:'Zona de ofertas',      type:'zona_caliente', width:5,  length:4, height:3,   description:'Área de descuentos y promociones. Alta rotación.', responsible:'Encargado de tienda', commercialPriority:'Alta',  status:'Activa', photos:[], notes:[] },
    { store_id:'store_alajuela', name:'Caja principal',       type:'caja',          width:2,  length:1.5, height:1.2, description:'Mostrador de pago. También punto de cross-selling.', responsible:'Cajero', commercialPriority:'Media', status:'Activa', photos:[], notes:[] },
    { store_id:'store_alajuela', name:'Bodega trasera',       type:'bodega',        width:6,  length:5, height:3,   description:'Almacén de producto sin atención al público.', responsible:'Asistente de bodega', commercialPriority:'Baja',  status:'Activa', photos:[], notes:[] },
  ];
  zonesAlajuela.forEach(z => si_zones_save({ ...z, id: crypto.randomUUID(), created_at: new Date().toISOString(), updated_at: new Date().toISOString() }));
}

// ── Score visual provisional ──────────────────────────────

function si_calculateScore(zones) {
  if (!zones.length) return 0;
  const activas      = zones.filter(z => z.status === 'Activa').length;
  const calientes    = zones.filter(z => z.type === 'zona_caliente').length;
  const entradas     = zones.filter(z => z.type === 'entrada').length;
  const escaparates  = zones.filter(z => z.type === 'escaparate').length;
  const conFoto      = zones.filter(z => si_photos_getMain(z.id)).length;
  const actPct       = (activas / zones.length) * 50;
  const fotoPct      = zones.length > 0 ? (conFoto / zones.length) * 20 : 0;
  const bonus        = Math.min(30, (calientes * 6) + (entradas * 8) + (escaparates * 6));
  return Math.min(100, Math.round(actPct + fotoPct + bonus));
}

// ── Render principal ──────────────────────────────────────

function renderStoreIntelligenceView() {
  const root = document.getElementById('view-admin-store-intelligence');
  if (!root) return;

  si_seedMockData();

  const clients = typeof allClientsData !== 'undefined' ? allClientsData : [];

  // Incluir clientes retail + los del mock
  const retailTypes = ['retail','ecommerce','franchise','hybrid'];
  const retailClients = clients.filter(c => {
    const types = typeof parseBusinessTypes === 'function' ? parseBusinessTypes(c.business_type) : [];
    return types.some(t => retailTypes.includes(t));
  });

  // Si no hay clientes retail reales, mostrar todos
  const displayClients = retailClients.length > 0 ? retailClients : clients;

  // Incluir clientes del mock que no están en allClientsData
  const mockStoreClients = si_stores_getAll()
    .map(s => s.client_id)
    .filter(id => id && !clients.find(c => c.id === id))
    .filter((id, idx, arr) => arr.indexOf(id) === idx)
    .map(id => ({ id, full_name: id === 'mock_calzado_365' ? 'Calzado 365 (demo)' : id, email: '' }));

  const allDisplayClients = [...displayClients, ...mockStoreClients];

  const clientOptions = allDisplayClients.map(c =>
    `<option value="${c.id}" ${c.id === si_clientId ? 'selected' : ''}>${c.full_name || c.email || '—'}</option>`
  ).join('');

  // Stores del cliente seleccionado
  const stores = si_clientId ? si_stores_forClient(si_clientId) : [];
  const storeOptions = stores.map(s =>
    `<option value="${s.id}" ${s.id === si_storeId ? 'selected' : ''}>${s.name} · ${s.city}</option>`
  ).join('');

  root.innerHTML = `
    <div class="si-body">

      <!-- Header -->
      <div class="si-header">
        <div>
          <button class="back-btn" onclick="showAdminView('os')" style="margin-bottom:12px;">
            <svg viewBox="0 0 16 16" fill="none"><path d="M10 3L5 8l5 5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
            Volver al OS
          </button>
          <p class="si-eyebrow">Retail · Tiendas Físicas</p>
          <h1 class="si-title">Store Intelligence</h1>
          <p class="si-sub">Gestión visual, croquis, zonas comerciales y auditoría de tiendas físicas.</p>
        </div>
        <div class="si-header-actions">
          <button class="si-add-btn" onclick="openNewStoreModal()" ${!si_clientId ? 'disabled title="Seleccioná un cliente primero"' : ''}>+ Nueva sucursal</button>
        </div>
      </div>

      <!-- Selectors -->
      <div class="si-selectors">
        <div class="si-selector-group">
          <label class="si-selector-label">Cliente</label>
          <select class="si-select" onchange="si_selectClient(this.value)">
            <option value="">— Seleccionar cliente —</option>
            ${clientOptions}
          </select>
        </div>
        <div class="si-selector-group">
          <label class="si-selector-label">Sucursal</label>
          <select class="si-select" id="si-store-select" onchange="si_selectStore(this.value)" ${!si_clientId ? 'disabled' : ''}>
            <option value="">— ${si_clientId ? 'Seleccionar sucursal' : 'Seleccioná un cliente primero'} —</option>
            ${storeOptions}
          </select>
        </div>
      </div>

      <!-- Content -->
      <div id="si-content">
        ${!si_clientId
          ? `<div class="si-welcome">
              <div style="font-size:40px;margin-bottom:14px;">🏪</div>
              <div style="font-size:16px;font-weight:600;color:var(--white);margin-bottom:6px;">Seleccioná un cliente retail</div>
              <div style="font-size:13px;color:var(--gray);">Elegí un cliente del selector superior para ver sus sucursales y zonas comerciales.</div>
             </div>`
          : !si_storeId
          ? `<div class="si-welcome">
              <div style="font-size:40px;margin-bottom:14px;">🏬</div>
              <div style="font-size:16px;font-weight:600;color:var(--white);margin-bottom:6px;">Seleccioná una sucursal</div>
              <div style="font-size:13px;color:var(--gray);">Elegí una sucursal para ver su dashboard y zonas configuradas.</div>
              ${stores.length === 0 ? `<button class="si-add-btn" style="margin-top:16px;" onclick="openNewStoreModal()">+ Agregar primera sucursal</button>` : ''}
             </div>`
          : ''}
      </div>

    </div>
  `;

  if (si_storeId) {
    si_renderStoreContent();
  }
}

// ── Selectors ─────────────────────────────────────────────

function si_selectClient(clientId) {
  si_clientId = clientId || null;
  si_storeId  = null;
  renderStoreIntelligenceView();
}

function si_selectStore(storeId) {
  si_storeId = storeId || null;
  if (si_storeId) {
    si_renderStoreContent();
  } else {
    const content = document.getElementById('si-content');
    if (content) content.innerHTML = `<div class="si-welcome"><div style="font-size:40px;margin-bottom:14px;">🏬</div><div style="font-size:16px;font-weight:600;color:var(--white);">Seleccioná una sucursal</div></div>`;
  }
}

// ── Store content (dashboard + zones) ────────────────────

function si_renderStoreContent() {
  const content = document.getElementById('si-content');
  if (!content || !si_storeId) return;

  const store = si_stores_getAll().find(s => s.id === si_storeId);
  if (!store) return;

  const zones  = si_zones_forStore(si_storeId);
  const score  = si_calculateScore(zones);
  const scoreColor = score >= 70 ? 'var(--green)' : score >= 40 ? 'var(--amber)' : 'var(--red)';

  const allPhotos   = si_photos_getAll().filter(p => zones.some(z => z.id === p.zone_id));
  const conFoto     = zones.filter(z => si_photos_getMain(z.id));
  const sinFoto     = zones.filter(z => !si_photos_getMain(z.id));
  const ultimaFoto  = allPhotos.length > 0
    ? new Date(allPhotos[0].created_at).toLocaleDateString('es-CR',{day:'numeric',month:'short'})
    : '—';

  const kpis = {
    total:      zones.length,
    calientes:  zones.filter(z => z.type === 'zona_caliente').length,
    frias:      zones.filter(z => z.type === 'zona_fria').length,
    conFoto:    conFoto.length,
    sinFoto:    sinFoto.length,
    ultimaFoto,
  };

  content.innerHTML = `

    <!-- Store info bar -->
    <div class="si-store-bar">
      <div class="si-store-info">
        <span class="si-store-name">🏪 ${store.name}</span>
        <span class="si-store-meta">${store.city}</span>
        ${store.squareMeters ? `<span class="si-store-meta">${store.squareMeters} m²</span>` : ''}
        ${store.address ? `<span class="si-store-meta">📍 ${store.address}</span>` : ''}
      </div>
      <div style="display:flex;align-items:center;gap:12px;">
        <div class="si-score-chip" style="--sc:${scoreColor};">
          Score visual: <strong style="color:${scoreColor};">${score}</strong>/100
        </div>
        <button class="si-add-btn" onclick="openCreateZoneModal()">+ Nueva zona</button>
      </div>
    </div>

    <!-- KPIs -->
    <div class="si-kpis">
      <div class="si-kpi si-kpi-main">
        <div class="si-kpi-val">${kpis.total}</div>
        <div class="si-kpi-label">Zonas configuradas</div>
      </div>
      <div class="si-kpi" style="--sk:#EF4444">
        <div class="si-kpi-icon">🔥</div>
        <div class="si-kpi-val" style="color:#EF4444">${kpis.calientes}</div>
        <div class="si-kpi-label">Zonas calientes</div>
      </div>
      <div class="si-kpi" style="--sk:#06B6D4">
        <div class="si-kpi-icon">❄️</div>
        <div class="si-kpi-val" style="color:#06B6D4">${kpis.frias}</div>
        <div class="si-kpi-label">Zonas frías</div>
      </div>
      <div class="si-kpi" style="--sk:#22C55E">
        <div class="si-kpi-icon">📸</div>
        <div class="si-kpi-val" style="color:var(--green)">${kpis.conFoto}</div>
        <div class="si-kpi-label">Con foto actual</div>
      </div>
      <div class="si-kpi" style="--sk:${kpis.sinFoto > 0 ? 'var(--amber)' : 'var(--gray)'}">
        <div class="si-kpi-icon">📷</div>
        <div class="si-kpi-val" style="color:${kpis.sinFoto > 0 ? 'var(--amber)' : 'var(--gray)'}">${kpis.sinFoto}</div>
        <div class="si-kpi-label">Sin foto</div>
      </div>
      <div class="si-kpi">
        <div class="si-kpi-icon">🕐</div>
        <div class="si-kpi-val" style="font-size:14px;">${kpis.ultimaFoto}</div>
        <div class="si-kpi-label">Última foto</div>
      </div>
    </div>

    <!-- Croquis de sucursal -->
    <div class="si-section">
      <div class="si-section-header">
        <div>
          <div class="si-section-title">🗺️ Croquis de Sucursal</div>
          <div class="si-section-sub">Vista visual de zonas configuradas. Próximamente: editor de plano interactivo.</div>
        </div>
      </div>
      <div id="si-croquis">
        ${si_renderCroquis(zones)}
      </div>
    </div>

    <!-- Zona list -->
    <div class="si-section">
      <div class="si-section-header">
        <div>
          <div class="si-section-title">📋 Zonas configuradas</div>
          <div class="si-section-sub">${zones.length} zona${zones.length!==1?'s':''} registrada${zones.length!==1?'s':''}</div>
        </div>
        <button class="si-add-btn" onclick="openCreateZoneModal()">+ Nueva zona</button>
      </div>
      <div id="si-zones-list">
        ${renderStoreZones(zones)}
      </div>
    </div>

    <!-- Future phases placeholder -->
    <div class="si-future-section">
      <div class="si-future-title">🚀 Próximas funciones</div>
      <div class="si-future-grid">
        <div class="si-future-card" style="color:var(--green);border-color:rgba(34,197,94,.2);">✅ Historial fotográfico activo</div>
        <div class="si-future-card">🤖 Análisis IA visual</div>
        <div class="si-future-card">🌡️ Heatmaps de tráfico</div>
        <div class="si-future-card">📊 Comparativo de sucursales</div>
        <div class="si-future-card">📦 Integración con inventario</div>
        <div class="si-future-card">💰 Integración con ventas</div>
        <div class="si-future-card">🔍 Auditorías visuales</div>
        <div class="si-future-card">📐 Score automático IA</div>
      </div>
    </div>
  `;
}

// ── Croquis (visual grid de zonas) ────────────────────────

function si_renderCroquis(zones) {
  if (!zones.length) {
    return `<div class="si-croquis-empty">Sin zonas configuradas. Creá la primera zona para ver el croquis.</div>`;
  }
  return `
    <div class="si-croquis-grid">
      ${zones.filter(z => z.status === 'Activa').map(z => {
        const tipo      = SI_ZONE_TYPES[z.type] || SI_ZONE_TYPES.personalizada;
        const area      = (z.width && z.length) ? `${z.width}×${z.length}m` : '';
        const mainPhoto = si_photos_getMain(z.id);
        const photoCount = si_photos_forZone(z.id).length;
        return `
          <div class="si-croquis-block${mainPhoto ? ' si-croquis-has-photo' : ''}"
            style="--zc:${tipo.color};--zcbg:${tipo.bg};"
            onclick="openZoneDetail('${z.id}')" title="${z.name}">
            ${mainPhoto
              ? `<div class="si-croquis-photo-thumb"><img src="${mainPhoto.url}" alt="" /></div>`
              : `<div class="si-croquis-icon">${tipo.icon}</div>`}
            <div class="si-croquis-name">${z.name}</div>
            ${area ? `<div class="si-croquis-area">${area}</div>` : ''}
            <div class="si-croquis-photo-badge">
              ${mainPhoto ? `<span class="si-photo-dot si-photo-dot-ok">📸 ${photoCount}</span>` : `<span class="si-photo-dot si-photo-dot-empty">sin foto</span>`}
            </div>
          </div>`;
      }).join('')}
    </div>
    <div class="si-croquis-legend">
      ${Object.entries(SI_ZONE_TYPES).filter(([k]) => zones.some(z=>z.type===k)).map(([k,v]) =>
        `<span class="si-legend-item" style="color:${v.color};">${v.icon} ${v.label}</span>`
      ).join('')}
    </div>
  `;
}

// ── Zone list ─────────────────────────────────────────────

function renderStoreZones(zones) {
  if (!zones.length) {
    return `<div class="si-empty">Sin zonas todavía. Creá la primera zona para este local.</div>`;
  }
  return `
    <div class="si-zones-table-wrap">
      <table class="si-table">
        <thead>
          <tr>
            <th>Zona</th>
            <th>Tipo</th>
            <th>Medidas</th>
            <th>Foto</th>
            <th>Prioridad</th>
            <th>Estado</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          ${zones.map(z => {
            const tipo = SI_ZONE_TYPES[z.type] || SI_ZONE_TYPES.personalizada;
            const medidas = (z.width && z.length) ? `${z.width}×${z.length}m` : '—';
            const prioColor = z.commercialPriority === 'Alta' ? 'var(--red)' : z.commercialPriority === 'Media' ? 'var(--amber)' : 'var(--gray)';
            return `
              <tr>
                <td style="font-weight:600;color:var(--white);">${z.name}</td>
                <td>
                  <span class="si-type-badge" style="background:${tipo.bg};color:${tipo.color};">
                    ${tipo.icon} ${tipo.label}
                  </span>
                </td>
                <td style="font-size:12px;color:var(--gray);">${medidas}</td>
                <td>${(() => {
                  const mp = si_photos_getMain(z.id);
                  const cnt = si_photos_forZone(z.id).length;
                  return mp
                    ? `<div class="si-table-thumb" onclick="openZoneDetail('${z.id}')"><img src="${mp.url}" alt="" /><span>📸 ${cnt}</span></div>`
                    : `<span style="font-size:11px;color:var(--gray);">sin foto</span>`;
                })()}</td>
                <td><span style="font-size:12px;color:${prioColor};">● ${z.commercialPriority || '—'}</span></td>
                <td><span class="si-status-badge si-status-${z.status==='Activa'?'activa':'inactiva'}">${z.status}</span></td>
                <td>
                  <div style="display:flex;gap:4px;">
                    <button class="si-action-btn" onclick="openZoneDetail('${z.id}')" title="Ver detalle">👁</button>
                    <button class="si-action-btn" onclick="openEditZoneModal('${z.id}')" title="Editar">✏️</button>
                    <button class="si-action-btn si-action-del" onclick="deleteZone('${z.id}')" title="Eliminar">✕</button>
                  </div>
                </td>
              </tr>`;
          }).join('')}
        </tbody>
      </table>
    </div>
  `;
}

// ── Modal crear zona ──────────────────────────────────────

function openCreateZoneModal(prefillData = null) {
  const isEdit = !!prefillData;
  const d      = prefillData || {};

  document.getElementById('modal-si-zone-body').innerHTML = `
    <div class="si-form-grid">
      <div class="si-form-field full">
        <label class="si-form-label">Nombre de la zona <span class="req">*</span></label>
        <input class="si-input" type="text" id="sz-nombre" value="${d.name||''}"
          placeholder="Ej: Entrada principal, Tarima de novedades..." />
      </div>
      <div class="si-form-field">
        <label class="si-form-label">Tipo de zona <span class="req">*</span></label>
        <select class="si-input" id="sz-tipo">
          ${Object.entries(SI_ZONE_TYPES).map(([k,v]) =>
            `<option value="${k}" ${k === (d.type||'entrada') ? 'selected' : ''}>${v.icon} ${v.label}</option>`
          ).join('')}
        </select>
      </div>
      <div class="si-form-field">
        <label class="si-form-label">Prioridad comercial</label>
        <select class="si-input" id="sz-prioridad">
          <option value="Alta"  ${(d.commercialPriority||'Media') === 'Alta'  ? 'selected' : ''}>Alta</option>
          <option value="Media" ${(d.commercialPriority||'Media') === 'Media' ? 'selected' : ''}>Media</option>
          <option value="Baja"  ${(d.commercialPriority||'Media') === 'Baja'  ? 'selected' : ''}>Baja</option>
        </select>
      </div>
      <div class="si-form-field">
        <label class="si-form-label">Ancho (m)</label>
        <input class="si-input" type="number" id="sz-ancho" value="${d.width||''}" step="0.5" min="0" placeholder="Ej: 3.5" />
      </div>
      <div class="si-form-field">
        <label class="si-form-label">Largo (m)</label>
        <input class="si-input" type="number" id="sz-largo" value="${d.length||''}" step="0.5" min="0" placeholder="Ej: 4" />
      </div>
      <div class="si-form-field">
        <label class="si-form-label">Altura (m)</label>
        <input class="si-input" type="number" id="sz-altura" value="${d.height||''}" step="0.1" min="0" placeholder="Ej: 3" />
      </div>
      <div class="si-form-field">
        <label class="si-form-label">Responsable</label>
        <input class="si-input" type="text" id="sz-responsable" value="${d.responsible||''}" placeholder="Ej: Encargado de tienda" />
      </div>
      <div class="si-form-field">
        <label class="si-form-label">Estado</label>
        <select class="si-input" id="sz-estado">
          <option value="Activa"   ${(d.status||'Activa') === 'Activa'   ? 'selected' : ''}>Activa</option>
          <option value="Inactiva" ${(d.status||'Activa') === 'Inactiva' ? 'selected' : ''}>Inactiva</option>
        </select>
      </div>
      <div class="si-form-field full">
        <label class="si-form-label">Descripción</label>
        <textarea class="si-input si-textarea" id="sz-descripcion" rows="3"
          placeholder="¿Qué función tiene esta zona? ¿Qué se exhibe?">${d.description||''}</textarea>
      </div>
    </div>
    <input type="hidden" id="sz-edit-id" value="${d.id||''}" />
    <div class="modal-msg" id="sz-form-msg"></div>
  `;

  const modal = document.getElementById('modal-si-zone');
  modal.querySelector('.modal-title').textContent = isEdit ? 'Editar zona' : 'Nueva zona';
  openModal('modal-si-zone');
}

function createStoreZone() {
  const nombre = document.getElementById('sz-nombre')?.value.trim();
  const msg    = document.getElementById('sz-form-msg');
  if (!nombre) { showMsg(msg, 'error', 'El nombre de la zona es requerido.'); return; }
  if (!si_storeId) { showMsg(msg, 'error', 'Seleccioná una sucursal primero.'); return; }

  const editId = document.getElementById('sz-edit-id')?.value;
  si_zones_save({
    id:                 editId || undefined,
    store_id:           si_storeId,
    name:               nombre,
    type:               document.getElementById('sz-tipo')?.value || 'entrada',
    width:              parseFloat(document.getElementById('sz-ancho')?.value) || null,
    length:             parseFloat(document.getElementById('sz-largo')?.value) || null,
    height:             parseFloat(document.getElementById('sz-altura')?.value) || null,
    responsible:        document.getElementById('sz-responsable')?.value.trim() || '',
    commercialPriority: document.getElementById('sz-prioridad')?.value || 'Media',
    status:             document.getElementById('sz-estado')?.value || 'Activa',
    description:        document.getElementById('sz-descripcion')?.value.trim() || '',
    photos:             [],
    notes:              [],
  });

  closeModal('modal-si-zone');
  si_renderStoreContent();
}

function editStoreZone(zoneId) {
  openEditZoneModal(zoneId);
}

function openEditZoneModal(zoneId) {
  const zone = si_zones_getAll().find(z => z.id === zoneId);
  if (!zone) return;
  openCreateZoneModal(zone);
}

function deleteZone(zoneId) {
  if (!confirm('¿Eliminar esta zona?')) return;
  si_zones_delete(zoneId);
  si_renderStoreContent();
}

// ── Zone detail modal ─────────────────────────────────────

function openZoneDetail(zoneId) {
  const zone = si_zones_getAll().find(z => z.id === zoneId);
  if (!zone) return;

  const tipo   = SI_ZONE_TYPES[zone.type] || SI_ZONE_TYPES.personalizada;
  const medidas = [
    zone.width  ? `Ancho: ${zone.width}m`  : null,
    zone.length ? `Largo: ${zone.length}m` : null,
    zone.height ? `Altura: ${zone.height}m`: null,
  ].filter(Boolean).join(' · ');

  const prioColor = zone.commercialPriority === 'Alta' ? 'var(--red)' : zone.commercialPriority === 'Media' ? 'var(--amber)' : 'var(--gray)';

  document.getElementById('modal-si-detail-body').innerHTML = `
    <div class="si-detail">

      <div class="si-detail-top">
        <span class="si-type-badge" style="background:${tipo.bg};color:${tipo.color};font-size:12px;padding:5px 12px;">
          ${tipo.icon} ${tipo.label}
        </span>
        <span style="font-size:12px;color:${prioColor};">● Prioridad ${zone.commercialPriority || '—'}</span>
      </div>

      <h2 class="si-detail-title">${zone.name}</h2>

      <div class="si-detail-meta">
        ${medidas ? `<div class="si-detail-meta-item"><span>📐 Medidas</span><strong>${medidas}</strong></div>` : ''}
        <div class="si-detail-meta-item"><span>👤 Responsable</span><strong>${zone.responsible || '—'}</strong></div>
        <div class="si-detail-meta-item"><span>📊 Estado</span><strong style="color:${zone.status==='Activa'?'var(--green)':'var(--gray)'}">${zone.status}</strong></div>
      </div>

      ${zone.description ? `
        <div class="si-detail-section">
          <div class="si-detail-section-label">Descripción</div>
          <div style="font-size:13px;color:rgba(255,255,255,.8);line-height:1.7;">${zone.description}</div>
        </div>` : ''}

      <!-- Historial fotográfico — FASE 1.2 activa -->
      <div class="si-detail-section">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">
          <div class="si-detail-section-label" style="margin-bottom:0;">📸 Historial fotográfico</div>
          <button class="si-add-btn" style="font-size:11px;padding:6px 12px;"
            onclick="si_openUploadArea('${zone.id}')">+ Subir foto</button>
        </div>
        <div id="si-photo-upload-area-${zone.id}"></div>
        <div id="si-photo-gallery-${zone.id}">
          ${si_renderPhotoGallery(zone.id)}
        </div>
      </div>

      <!-- Observaciones -->
      <div class="si-detail-section">
        <div class="si-detail-section-label">📝 Observaciones</div>
        ${(zone.notes||[]).length === 0
          ? `<div style="font-size:12px;color:var(--gray);">Sin observaciones registradas.</div>`
          : zone.notes.map(n => `<div style="font-size:13px;color:var(--gray);padding:6px 0;border-bottom:1px solid rgba(255,255,255,.04);">${n}</div>`).join('')}
      </div>

      <!-- IA visual — FASE 3 -->
      <div class="si-detail-section">
        <button class="si-ia-btn" disabled title="Disponible en Fase 3 — Análisis IA Visual">
          🤖 Analizar con IA Visual — Próximamente
        </button>
      </div>

    </div>
  `;

  openModal('modal-si-detail');
}

// ── Modal nueva sucursal ──────────────────────────────────

function openNewStoreModal() {
  if (!si_clientId) { if (typeof showOSToast === 'function') showOSToast('Seleccioná un cliente primero','os-toast-soon'); return; }

  document.getElementById('modal-si-store-body').innerHTML = `
    <div class="si-form-grid">
      <div class="si-form-field full">
        <label class="si-form-label">Nombre de la sucursal <span class="req">*</span></label>
        <input class="si-input" type="text" id="ss-nombre" placeholder="Ej: Alajuela, City Mall, Sucursal Norte" />
      </div>
      <div class="si-form-field">
        <label class="si-form-label">Ciudad</label>
        <input class="si-input" type="text" id="ss-ciudad" placeholder="Ej: San José" />
      </div>
      <div class="si-form-field">
        <label class="si-form-label">Metros cuadrados</label>
        <input class="si-input" type="number" id="ss-m2" placeholder="Ej: 120" min="1" />
      </div>
      <div class="si-form-field full">
        <label class="si-form-label">Dirección</label>
        <input class="si-input" type="text" id="ss-direccion" placeholder="Ej: Calle Principal, Local 5" />
      </div>
    </div>
    <div class="modal-msg" id="ss-form-msg"></div>
  `;
  openModal('modal-si-store');
}

function saveNewStore() {
  const nombre = document.getElementById('ss-nombre')?.value.trim();
  const msg    = document.getElementById('ss-form-msg');
  if (!nombre) { showMsg(msg, 'error', 'El nombre de la sucursal es requerido.'); return; }

  si_stores_save({
    client_id:     si_clientId,
    name:          nombre,
    city:          document.getElementById('ss-ciudad')?.value.trim() || '',
    squareMeters:  parseFloat(document.getElementById('ss-m2')?.value) || null,
    address:       document.getElementById('ss-direccion')?.value.trim() || '',
  });

  closeModal('modal-si-store');
  renderStoreIntelligenceView();
}

// ── Photo gallery render ──────────────────────────────────

const SI_FOTO_TIPOS = ['General','Entrada','Escaparate','Tarima','Urna','Caja','Bodega','Exhibición','Detalle de producto'];

function si_renderPhotoGallery(zoneId) {
  const photos = si_photos_forZone(zoneId);
  if (!photos.length) {
    return `<div class="si-photo-empty">Sin fotos todavía. Subí la primera foto de esta zona.</div>`;
  }
  return `
    <div class="si-photo-grid">
      ${photos.map(p => `
        <div class="si-photo-card${p.es_principal ? ' si-photo-principal' : ''}">
          <div class="si-photo-img-wrap">
            <img src="${p.url}" alt="${p.tipo_evidencia || ''}" loading="lazy" />
            ${p.es_principal ? `<span class="si-photo-star-badge">★ Principal</span>` : ''}
          </div>
          <div class="si-photo-info">
            <div class="si-photo-tipo">${p.tipo_evidencia || 'General'}</div>
            <div class="si-photo-meta">
              <span>${new Date(p.created_at).toLocaleDateString('es-CR',{day:'numeric',month:'short',year:'numeric'})}</span>
              ${p.responsable ? `<span>· ${p.responsable}</span>` : ''}
            </div>
            ${p.comentario ? `<div class="si-photo-comment">${p.comentario}</div>` : ''}
          </div>
          <div class="si-photo-actions">
            ${!p.es_principal
              ? `<button class="si-photo-btn si-photo-btn-star" onclick="si_setMainPhoto('${p.id}','${zoneId}')" title="Marcar como foto principal">☆ Principal</button>`
              : `<span class="si-photo-btn-current">★ Foto actual</span>`}
            <button class="si-photo-btn si-photo-btn-del" onclick="si_deletePhoto('${p.id}','${zoneId}')" title="Eliminar">✕</button>
          </div>
        </div>
      `).join('')}
    </div>`;
}

// ── Upload area ───────────────────────────────────────────

let _siPendingPhotoBase64 = null;
let _siPendingZoneId      = null;

function si_openUploadArea(zoneId) {
  _siPendingZoneId = zoneId;
  _siPendingPhotoBase64 = null;
  const area = document.getElementById(`si-photo-upload-area-${zoneId}`);
  if (!area) return;

  area.innerHTML = `
    <div class="si-upload-box" id="si-upload-box-${zoneId}">
      <div class="si-upload-drop-zone" onclick="document.getElementById('si-file-input-${zoneId}').click()">
        <div class="si-upload-drop-icon">📁</div>
        <div class="si-upload-drop-text">Clic para seleccionar imagen</div>
        <div class="si-upload-drop-sub">JPG, PNG, WEBP · Máx 8MB · Se comprime automáticamente</div>
        <input type="file" id="si-file-input-${zoneId}" accept="image/jpeg,image/png,image/webp"
          style="display:none;" onchange="si_handleFileSelect(event,'${zoneId}')" />
      </div>
      <div id="si-upload-preview-${zoneId}" style="display:none;">
        <img id="si-upload-img-${zoneId}" src="" alt="preview" class="si-upload-preview-img" />
        <div class="si-upload-form">
          <select class="si-input si-upload-field" id="si-tipo-${zoneId}">
            ${SI_FOTO_TIPOS.map(t=>`<option value="${t}">${t}</option>`).join('')}
          </select>
          <input class="si-input si-upload-field" type="text" id="si-responsable-${zoneId}" placeholder="Responsable (opcional)" />
          <textarea class="si-input si-upload-field si-upload-textarea" id="si-comment-${zoneId}"
            rows="2" placeholder="Comentario u observación..."></textarea>
          <label class="si-upload-check-row">
            <input type="checkbox" id="si-principal-${zoneId}" checked />
            <span>Marcar como foto principal actual</span>
          </label>
        </div>
        <div class="si-upload-btns">
          <button class="si-upload-cancel" onclick="si_cancelUpload('${zoneId}')">Cancelar</button>
          <button class="si-add-btn" style="font-size:12px;padding:8px 18px;" onclick="si_savePhoto('${zoneId}')">Guardar foto</button>
        </div>
        <div class="modal-msg" id="si-upload-msg-${zoneId}"></div>
      </div>
    </div>
  `;
}

async function si_handleFileSelect(event, zoneId) {
  const file = event.target.files[0];
  console.log('[SI Photo] handleFileSelect — zoneId:', zoneId, '| file:', file?.name ?? 'null');

  if (!file) { console.warn('[SI Photo] No hay archivo seleccionado.'); return; }

  const preview  = document.getElementById(`si-upload-preview-${zoneId}`);
  const imgEl    = document.getElementById(`si-upload-img-${zoneId}`);
  const dropZone = document.querySelector(`#si-upload-box-${zoneId} .si-upload-drop-zone`);

  console.log('[SI Photo] DOM refs — preview:', !!preview, '| imgEl:', !!imgEl, '| dropZone:', !!dropZone);

  try {
    const base64 = await si_resizeImage(file);

    // PASO 7 — Guardado en estado
    console.log('[SI Photo] PASO 7 — guardando estado pending...');
    _siPendingPhotoBase64 = base64;
    _siPendingZoneId      = zoneId;

    if (imgEl)    { imgEl.src = base64; }
    if (preview)  { preview.style.display = 'block'; }
    if (dropZone) { dropZone.style.display = 'none'; }

    console.log('[SI Photo] PASO 8 — UI actualizada, listo para guardar.');

  } catch (err) {
    console.error('[SI Photo] ERROR COMPLETO:', err);
    console.error('[SI Photo] err.message:', err?.message);
    console.error('[SI Photo] err.stack:', err?.stack);
    console.error('[SI Photo] typeof err:', typeof err, '| constructor:', err?.constructor?.name);
    alert('Error procesando imagen:\n' + (err?.message || JSON.stringify(err)));
  }
}

function si_savePhoto(zoneId) {
  if (!_siPendingPhotoBase64 || _siPendingZoneId !== zoneId) {
    alert('Seleccioná una imagen primero.');
    return;
  }
  const esPrincipal = document.getElementById(`si-principal-${zoneId}`)?.checked ?? true;

  // Si se marca como principal, quitar el flag de las demás
  if (esPrincipal) {
    const all = si_photos_getAll();
    all.forEach(p => { if (p.zone_id === zoneId) p.es_principal = false; });
    localStorage.setItem(SI_PHOTOS_KEY, JSON.stringify(all));
  }

  si_photos_save({
    zone_id:        zoneId,
    store_id:       si_storeId,
    url:            _siPendingPhotoBase64,
    tipo_evidencia: document.getElementById(`si-tipo-${zoneId}`)?.value || 'General',
    responsable:    document.getElementById(`si-responsable-${zoneId}`)?.value.trim() || '',
    comentario:     document.getElementById(`si-comment-${zoneId}`)?.value.trim() || '',
    es_principal:   esPrincipal,
  });

  _siPendingPhotoBase64 = null;
  _siPendingZoneId      = null;

  // Refresh gallery + upload area
  const uploadArea = document.getElementById(`si-photo-upload-area-${zoneId}`);
  if (uploadArea) uploadArea.innerHTML = '';
  const gallery = document.getElementById(`si-photo-gallery-${zoneId}`);
  if (gallery) gallery.innerHTML = si_renderPhotoGallery(zoneId);

  // Refresh zone table/croquis in background
  si_renderStoreContent();
}

function si_cancelUpload(zoneId) {
  _siPendingPhotoBase64 = null;
  const area = document.getElementById(`si-photo-upload-area-${zoneId}`);
  if (area) area.innerHTML = '';
}

function si_deletePhoto(photoId, zoneId) {
  if (!confirm('¿Eliminar esta foto?')) return;
  si_photos_delete(photoId);
  const gallery = document.getElementById(`si-photo-gallery-${zoneId}`);
  if (gallery) gallery.innerHTML = si_renderPhotoGallery(zoneId);
  si_renderStoreContent();
}

function si_setMainPhoto(photoId, zoneId) {
  si_photos_setPrincipal(photoId, zoneId);
  const gallery = document.getElementById(`si-photo-gallery-${zoneId}`);
  if (gallery) gallery.innerHTML = si_renderPhotoGallery(zoneId);
  si_renderStoreContent();
}

// ── Exports ───────────────────────────────────────────────

window.renderStoreIntelligenceView = renderStoreIntelligenceView;
window.si_selectClient             = si_selectClient;
window.si_selectStore              = si_selectStore;
window.openCreateZoneModal         = openCreateZoneModal;
window.openEditZoneModal           = openEditZoneModal;
window.createStoreZone             = createStoreZone;
window.editStoreZone               = editStoreZone;
window.deleteZone                  = deleteZone;
window.openZoneDetail              = openZoneDetail;
window.openNewStoreModal           = openNewStoreModal;
window.saveNewStore                = saveNewStore;
window.si_calculateScore           = si_calculateScore;
window.SI_ZONE_TYPES               = SI_ZONE_TYPES;
window.si_openUploadArea           = si_openUploadArea;
window.si_handleFileSelect         = si_handleFileSelect;
window.si_savePhoto                = si_savePhoto;
window.si_cancelUpload             = si_cancelUpload;
window.si_deletePhoto              = si_deletePhoto;
window.si_setMainPhoto             = si_setMainPhoto;
