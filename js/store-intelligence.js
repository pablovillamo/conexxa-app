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

// ── Estado croquis interactivo — FASE 1.4 ─────────────────

let si_layoutEditMode = false;
let _siLayoutDraft    = {};
let _siDragState      = null;

// ── Estado editor de plano — FASE 1.7 (croquis físico) ────
// FASE 1.8 (futura): imagen de plano real como fondo, calibrar medidas reales, gemelo digital 3D, heatmaps, IA

let si_floorPlanMode  = false;
let _siFloorPlanDraft = null;  // { elements: [], walls: [], labels: [], version: 1 }
let _siActiveTool     = 'select';
let _siWallStart      = null;  // { x, y } — punto de inicio de pared en dibujo

// ── Estado campañas visuales — FASE 1.6 ───────────────────
// FASE 1.7 (futura): checklist de ejecución, evidencia fotográfica obligatoria, auditoría de cumplimiento, IA

let _siCampaignFilter = { estado: 'all', tipo: 'all' };

// ── Estado flujo de clientes — FASE 1.5 ───────────────────
// FASE 1.6 (futura): heatmaps reales, tráfico medido, IA recorrido óptimo, comparativo entre sucursales

let si_flowEditMode       = false;
let _siFlowDraft          = null;  // { points: [] } — borrador durante edición
let _siSelectedFlowPoint  = null;  // id del punto seleccionado en edit mode

// ── Listeners globales de drag y dibujo (registrados una vez) ──

(function si_initDragListeners() {
  document.addEventListener('mousemove', function(e) {
    if (_siDragState && si_layoutEditMode) si_onDragMove(e.clientX, e.clientY);
    if (si_floorPlanMode && _siWallStart && _siActiveTool === 'wall') si_updateWallPreview(e.clientX, e.clientY);
  });
  document.addEventListener('mouseup', function(e) {
    if (_siDragState) _siDragState = null;
    if (si_floorPlanMode && _siWallStart && _siActiveTool === 'wall') si_finishDrawingWall(e.clientX, e.clientY);
  });
  document.addEventListener('touchmove', function(e) {
    if (_siDragState && si_layoutEditMode) { e.preventDefault(); si_onDragMove(e.touches[0].clientX, e.touches[0].clientY); }
    if (si_floorPlanMode && _siWallStart && _siActiveTool === 'wall') { e.preventDefault(); si_updateWallPreview(e.touches[0].clientX, e.touches[0].clientY); }
  }, { passive: false });
  document.addEventListener('touchend', function(e) {
    if (_siDragState) _siDragState = null;
    if (si_floorPlanMode && _siWallStart && _siActiveTool === 'wall' && e.changedTouches[0]) si_finishDrawingWall(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
  });
})();

// ── Estado comparativo — FASE 1.3 ─────────────────────────
// FASE 1.4 (futura): comparar orden visual, saturación, cambios de campaña con IA

let _siCompA      = null;  // id de foto seleccionada como A (Antes)
let _siCompB      = null;  // id de foto seleccionada como B (Después)
let _siCompZone   = null;  // zoneId actual del comparativo
let _siCompFilter = 'all'; // filtro por tipo_evidencia
let _siCompSort   = 'reciente'; // 'reciente' | 'antigua'

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

// ── Tipos de puntos de flujo ──────────────────────────────

// ── Elementos físicos del plano ───────────────────────────

const SI_FLOOR_ELEMENTS = {
  wall:     { label:'Pared',       icon:'▬',  color:'#9CA3AF', dw:20, dh:1.5, isWall: true },
  entrada:  { label:'Entrada',     icon:'🚪', color:'#22C55E', dw:8,  dh:3   },
  ventana:  { label:'Escaparate',  icon:'🪟', color:'#3B82F6', dw:12, dh:2   },
  caja:     { label:'Caja',        icon:'💰', color:'#14B8A6', dw:8,  dh:6   },
  bodega:   { label:'Bodega',      icon:'📦', color:'#6B7280', dw:18, dh:14  },
  tarima:   { label:'Tarima',      icon:'🏷️', color:'#EC4899', dw:14, dh:10  },
  urna:     { label:'Urna',        icon:'💎', color:'#6366F1', dw:6,  dh:6   },
};

// ── Tipos y estados de campañas ───────────────────────────

const SI_CAMPAIGN_TIPOS = [
  'Temporada','Promoción','Lanzamiento','Colección','Evento','Liquidación','Branding','Personalizada',
];

const SI_CAMPAIGN_ESTADOS = {
  Planificada: { color:'#F59E0B', bg:'rgba(245,158,11,.1)' },
  Activa:      { color:'#22C55E', bg:'rgba(34,197,94,.1)'  },
  Finalizada:  { color:'#6B7280', bg:'rgba(107,114,128,.1)'},
  Vencida:     { color:'#EF4444', bg:'rgba(239,68,68,.1)'  },
};

const SI_FLOW_TYPES = {
  entrada:    { label:'Entrada',         color:'#22C55E', icon:'🚪' },
  congestion: { label:'Congestión',      color:'#EF4444', icon:'🚨' },
  decision:   { label:'Decisión',        color:'#F59E0B', icon:'⚡' },
  conversion: { label:'Conversión',      color:'#8B5CF6', icon:'💰' },
  ignorada:   { label:'Zona ignorada',   color:'#6B7280', icon:'❌' },
  salida:     { label:'Salida',          color:'#06B6D4', icon:'👋' },
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

    <!-- Flow KPIs (visible solo si hay puntos) -->
    ${(() => {
      const flow = si_getStoreFlow();
      const pts  = flow.points || [];
      if (!pts.length) return '';
      const cong  = pts.filter(p => p.type === 'congestion').length;
      const conv  = pts.filter(p => p.type === 'conversion').length;
      const ign   = pts.filter(p => p.type === 'ignorada').length;
      return `
        <div class="si-flow-kpis">
          <span class="si-flow-kpi-label">🚶 Flujo de clientes</span>
          <div class="si-flow-kpi-items">
            <div class="si-flow-kpi-item"><span class="si-fk-val">${pts.length}</span><span class="si-fk-lbl">Puntos</span></div>
            <div class="si-flow-kpi-item" style="color:#EF4444"><span class="si-fk-val">${cong}</span><span class="si-fk-lbl">Congestión</span></div>
            <div class="si-flow-kpi-item" style="color:#8B5CF6"><span class="si-fk-val">${conv}</span><span class="si-fk-lbl">Conversión</span></div>
            <div class="si-flow-kpi-item" style="color:#6B7280"><span class="si-fk-val">${ign}</span><span class="si-fk-lbl">Ignoradas</span></div>
          </div>
        </div>`;
    })()}

    <!-- Croquis interactivo — FASE 1.4 -->
    <div class="si-section" id="si-croquis-section">
      ${si_renderInteractiveCroquis(zones)}
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

    <!-- Campañas visuales — FASE 1.6 -->
    <div class="si-section" id="si-campaigns-section">
      ${si_renderCampaignsSection()}
    </div>

    <!-- Future phases placeholder -->
    <div class="si-future-section">
      <div class="si-future-title">🚀 Próximas funciones</div>
      <div class="si-future-grid">
        <div class="si-future-card" style="color:var(--green);border-color:rgba(34,197,94,.2);">✅ Historial fotográfico activo</div>
        <div class="si-future-card" style="color:var(--green);border-color:rgba(34,197,94,.2);">✅ Campañas visuales activas</div>
        <div class="si-future-card">🤖 Análisis IA visual</div>
        <div class="si-future-card">🌡️ Heatmaps de tráfico</div>
        <div class="si-future-card">📊 Comparativo de sucursales</div>
        <div class="si-future-card">📋 Checklist de ejecución de campaña</div>
        <div class="si-future-card">📦 Integración con inventario</div>
        <div class="si-future-card">💰 Integración con ventas</div>
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

      <!-- Campañas asociadas -->
      ${(() => {
        const camps = si_getStoreCampaigns().filter(c => (c.zonas||[]).includes(zone.id));
        if (!camps.length) return '';
        return `
          <div class="si-detail-section">
            <div class="si-detail-section-label">📣 Campañas asociadas</div>
            <div class="si-zone-campaigns">
              ${camps.map(c => {
                const st = si_getCampaignStatus(c);
                const sc = SI_CAMPAIGN_ESTADOS[st] || SI_CAMPAIGN_ESTADOS.Planificada;
                return `
                  <div class="si-zone-campaign-row">
                    <span class="si-camp-estado-badge" style="background:${sc.bg};color:${sc.color};">● ${st}</span>
                    <span class="si-zone-campaign-name">${c.nombre}</span>
                    <span class="si-zone-campaign-dates">${c.fechaInicio}${c.fechaFin ? ' → ' + c.fechaFin : ''}</span>
                  </div>`;
              }).join('')}
            </div>
          </div>`;
      })()}

      <!-- Comparativo visual — FASE 1.3 -->
      <div class="si-detail-section">
        <div class="si-detail-section-label">🔄 Comparativo visual</div>
        <div id="si-comp-${zone.id}">
          ${si_renderComparativo(zone.id)}
        </div>
      </div>

      <!-- IA visual — FASE 3 -->
      <!-- FASE 1.4: conectar si_renderComparativoResult con análisis IA -->
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

// ── Comparativo visual — FASE 1.3 ────────────────────────
//
// FASE 1.4 (preparado en comentarios):
// - Comparar orden visual entre fotos
// - Detectar saturación de colores
// - Detectar cambios de campaña
// - Score mejora/empeoramiento por fecha
// Para Supabase: fotos ya tienen zone_id y created_at — sin cambio de schema.

function si_getFilteredPhotos(zoneId) {
  let photos = si_photos_forZone(zoneId);
  if (_siCompFilter !== 'all') {
    photos = photos.filter(p => (p.tipo_evidencia || 'General') === _siCompFilter);
  }
  photos.sort((a, b) => {
    const dA = new Date(a.created_at).getTime();
    const dB = new Date(b.created_at).getTime();
    return _siCompSort === 'antigua' ? dA - dB : dB - dA;
  });
  return photos;
}

function si_renderComparativo(zoneId) {
  if (_siCompZone !== zoneId) {
    _siCompA = null; _siCompB = null;
    _siCompZone   = zoneId;
    _siCompFilter = 'all';
    _siCompSort   = 'reciente';
  }

  const allPhotos = si_photos_forZone(zoneId);

  if (allPhotos.length < 2) {
    return `
      <div class="si-comp-empty">
        <span>📷</span>
        Necesitás al menos 2 fotos para comparar esta zona.
        <span style="font-size:11px;display:block;margin-top:4px;color:rgba(136,135,128,.6);">
          Subí más fotos en la sección "Historial fotográfico".
        </span>
      </div>`;
  }

  const photos = si_getFilteredPhotos(zoneId);
  const tiposPresentes = [...new Set(allPhotos.map(p => p.tipo_evidencia || 'General'))];

  const tipoOptions = ['all', ...tiposPresentes].map(t =>
    `<option value="${t}" ${_siCompFilter === t ? 'selected' : ''}>${t === 'all' ? 'Todos los tipos' : t}</option>`
  ).join('');

  const thumbA = _siCompA ? allPhotos.find(p => p.id === _siCompA) : null;
  const thumbB = _siCompB ? allPhotos.find(p => p.id === _siCompB) : null;

  const photoSelectOpts = photos.map(p => {
    const d = new Date(p.created_at).toLocaleDateString('es-CR',{day:'numeric',month:'short',year:'numeric'});
    return `<option value="${p.id}">${p.tipo_evidencia || 'General'} · ${d}${p.responsable ? ' · ' + p.responsable : ''}</option>`;
  }).join('');

  const canCompare = _siCompA && _siCompB && _siCompA !== _siCompB;

  return `
    <div class="si-comp-filters">
      <select class="si-input si-comp-select" onchange="si_compFilterChange('${zoneId}',this.value,'filter')">
        ${tipoOptions}
      </select>
      <select class="si-input si-comp-select" onchange="si_compFilterChange('${zoneId}',this.value,'sort')">
        <option value="reciente" ${_siCompSort==='reciente'?'selected':''}>Más reciente primero</option>
        <option value="antigua"  ${_siCompSort==='antigua' ?'selected':''}>Más antigua primero</option>
      </select>
    </div>

    <div class="si-comp-selectors">
      <div class="si-comp-col">
        <div class="si-comp-col-label">📅 Foto A — Antes</div>
        <select class="si-input si-comp-photo-select" onchange="si_selectCompPhoto('${zoneId}','a',this.value)">
          <option value="">— Seleccionar —</option>
          ${photos.map(p => {
            const d = new Date(p.created_at).toLocaleDateString('es-CR',{day:'numeric',month:'short',year:'numeric'});
            return `<option value="${p.id}" ${p.id === _siCompA ? 'selected' : ''}>${p.tipo_evidencia||'General'} · ${d}</option>`;
          }).join('')}
        </select>
        ${thumbA
          ? `<div class="si-comp-preview"><img src="${thumbA.url}" alt="Foto A" /></div>`
          : `<div class="si-comp-preview-empty">Sin selección</div>`}
      </div>

      <div class="si-comp-divider">↔</div>

      <div class="si-comp-col">
        <div class="si-comp-col-label">📅 Foto B — Después</div>
        <select class="si-input si-comp-photo-select" onchange="si_selectCompPhoto('${zoneId}','b',this.value)">
          <option value="">— Seleccionar —</option>
          ${photos.map(p => {
            const d = new Date(p.created_at).toLocaleDateString('es-CR',{day:'numeric',month:'short',year:'numeric'});
            return `<option value="${p.id}" ${p.id === _siCompB ? 'selected' : ''}>${p.tipo_evidencia||'General'} · ${d}</option>`;
          }).join('')}
        </select>
        ${thumbB
          ? `<div class="si-comp-preview"><img src="${thumbB.url}" alt="Foto B" /></div>`
          : `<div class="si-comp-preview-empty">Sin selección</div>`}
      </div>
    </div>

    <button class="si-comp-btn${canCompare ? '' : ' disabled'}"
      onclick="si_runComparativo('${zoneId}')" ${canCompare ? '' : 'disabled'}>
      🔄 Comparar fotos
    </button>

    <div id="si-comp-result-${zoneId}"></div>
  `;
}

function si_compFilterChange(zoneId, value, kind) {
  if (kind === 'filter') _siCompFilter = value;
  else                   _siCompSort   = value;
  _siCompA = null; _siCompB = null;
  const c = document.getElementById(`si-comp-${zoneId}`);
  if (c) c.innerHTML = si_renderComparativo(zoneId);
}

function si_selectCompPhoto(zoneId, slot, photoId) {
  if (slot === 'a') _siCompA = photoId || null;
  else              _siCompB = photoId || null;
  if (_siCompA && _siCompB && _siCompA === _siCompB) {
    if (slot === 'a') _siCompB = null;
    else              _siCompA = null;
  }
  const c = document.getElementById(`si-comp-${zoneId}`);
  if (c) c.innerHTML = si_renderComparativo(zoneId);
}

function si_runComparativo(zoneId) {
  if (!_siCompA || !_siCompB || _siCompA === _siCompB) return;

  const allPhotos = si_photos_forZone(zoneId);
  const photoA    = allPhotos.find(p => p.id === _siCompA);
  const photoB    = allPhotos.find(p => p.id === _siCompB);
  if (!photoA || !photoB) return;

  const resultEl = document.getElementById(`si-comp-result-${zoneId}`);
  if (!resultEl) return;

  const fmtDate = (iso) => new Date(iso).toLocaleDateString('es-CR',{
    day:'numeric', month:'long', year:'numeric',
  });

  const dateA    = new Date(photoA.created_at).getTime();
  const dateB    = new Date(photoB.created_at).getTime();
  const [antes, despues] = dateA <= dateB ? [photoA, photoB] : [photoB, photoA];
  const diffDays = Math.abs(Math.round((dateA - dateB) / 86400000));
  const diffLabel = diffDays === 0 ? 'mismo día'
    : `${diffDays} día${diffDays !== 1 ? 's' : ''} de diferencia`;

  const buildCard = (photo, label) => `
    <div class="si-comp-result-card">
      <div class="si-comp-result-label">${label}</div>
      <div class="si-comp-result-img">
        <img src="${photo.url}" alt="${label}" loading="lazy" />
        ${photo.es_principal ? `<span class="si-comp-principal-tag">★ Principal</span>` : ''}
      </div>
      <div class="si-comp-result-meta">
        <div class="si-comp-meta-row"><span class="si-comp-meta-key">📅 Fecha</span><span class="si-comp-meta-val">${fmtDate(photo.created_at)}</span></div>
        ${photo.responsable ? `<div class="si-comp-meta-row"><span class="si-comp-meta-key">👤 Responsable</span><span class="si-comp-meta-val">${photo.responsable}</span></div>` : ''}
        <div class="si-comp-meta-row"><span class="si-comp-meta-key">📌 Tipo</span><span class="si-comp-meta-val">${photo.tipo_evidencia || 'General'}</span></div>
        ${photo.comentario ? `<div class="si-comp-meta-row"><span class="si-comp-meta-key">💬 Comentario</span><span class="si-comp-meta-val">${photo.comentario}</span></div>` : ''}
      </div>
    </div>`;

  resultEl.innerHTML = `
    <div class="si-comp-result">
      <div class="si-comp-result-header">
        <div class="si-comp-result-title">Comparativo</div>
        <div class="si-comp-result-diff">🕐 ${diffLabel}</div>
      </div>
      <div class="si-comp-result-grid">
        ${buildCard(antes,   '📅 Antes')}
        ${buildCard(despues, '📅 Después')}
      </div>
    </div>
  `;

  resultEl.scrollIntoView({ behavior:'smooth', block:'nearest' });
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
// ── Croquis Interactivo — FASE 1.4 ────────────────────────
//
// FASE 1.5 (preparado en comentarios):
// - Flechas de flujo de clientes entre zonas
// - Heatmaps de tráfico sobre el plano
// - Zonas de congestión resaltadas
// - IA análisis espacial del plano
// - Métricas por zona superpuestas (ventas, tráfico)

// ── Layout initialization ─────────────────────────────────

function si_initLayoutDraft(zones) {
  const cols  = Math.max(2, Math.ceil(Math.sqrt(zones.length)));
  const rows  = Math.ceil(zones.length / cols);
  const cellW = Math.max(10, Math.floor(94 / cols));
  const cellH = Math.max(14, Math.floor(94 / rows));

  zones.forEach((z, idx) => {
    if (z.layout) {
      _siLayoutDraft[z.id] = { ...z.layout };
    } else {
      const col = idx % cols;
      const row = Math.floor(idx / cols);
      _siLayoutDraft[z.id] = {
        x: 2 + col * cellW,
        y: 2 + row * cellH,
        w: Math.max(8,  cellW - 2),
        h: Math.max(12, cellH - 2),
      };
    }
  });
}

function si_getZoneLayout(zone) {
  return _siLayoutDraft[zone.id] || zone.layout || null;
}

// ── Render croquis interactivo ────────────────────────────

function si_renderInteractiveCroquis(zones) {
  const activeZones = zones.filter(z => z.status === 'Activa');

  let toolbar;
  if (si_floorPlanMode) {
    toolbar = `
      <div class="si-fp-toolbar si-fpmode-toolbar">
        <div class="si-fp-info">
          <span class="si-fp-mode-badge fpmode">🏗️ Diseñando plano</span>
          <span class="si-fp-tip">Seleccioná herramienta · dibujá paredes · colocá elementos físicos · arrastrá zonas</span>
        </div>
        <div class="si-fp-btns">
          <button class="si-fp-btn" onclick="si_clearFloorPlan()">🗑 Limpiar</button>
          <button class="si-fp-btn" onclick="si_cancelFloorPlan()">✕ Cancelar</button>
          <button class="si-fp-btn si-fp-btn-save" onclick="si_saveFloorPlan()">💾 Guardar plano</button>
        </div>
      </div>`;
  } else if (si_layoutEditMode) {
    toolbar = `
      <div class="si-fp-toolbar">
        <div class="si-fp-info">
          <span class="si-fp-mode-badge edit">✏️ Editando zonas</span>
          <span class="si-fp-tip">Arrastrá para mover · Esquina inferior derecha para redimensionar</span>
        </div>
        <div class="si-fp-btns">
          <button class="si-fp-btn" onclick="si_autoArrangeZones()">⊞ Auto ordenar</button>
          <button class="si-fp-btn" onclick="si_resetLayout()">↺ Resetear</button>
          <button class="si-fp-btn" onclick="si_cancelLayout()">✕ Cancelar</button>
          <button class="si-fp-btn si-fp-btn-save" onclick="si_saveLayout()">💾 Guardar croquis</button>
        </div>
      </div>`;
  } else if (si_flowEditMode) {
    toolbar = `
      <div class="si-fp-toolbar si-flow-toolbar">
        <div class="si-fp-info">
          <span class="si-fp-mode-badge flow">🚶 Editando flujo</span>
          <span class="si-fp-tip">Clic en el plano para agregar puntos de recorrido</span>
        </div>
        <div class="si-fp-btns">
          <button class="si-fp-btn" onclick="si_clearCustomerFlow()">🗑 Limpiar flujo</button>
          <button class="si-fp-btn" onclick="si_cancelCustomerFlow()">✕ Cancelar</button>
          <button class="si-fp-btn si-fp-btn-save" onclick="si_saveCustomerFlow()">💾 Guardar flujo</button>
        </div>
      </div>`;
  } else {
    const flow = si_getStoreFlow();
    const flowPtCount = flow.points?.length || 0;
    toolbar = `
      <div class="si-section-header" style="margin-bottom:14px;">
        <div>
          <div class="si-section-title">🗺️ Croquis de Sucursal</div>
          <div class="si-section-sub">Vista visual interactiva de zonas y recorrido del cliente.</div>
        </div>
        <div style="display:flex;gap:6px;flex-wrap:wrap;">
          <button class="si-fp-btn" onclick="si_centerView()">⊙ Centrar</button>
          <button class="si-fp-btn si-fp-btn-flow${flowPtCount > 0 ? ' has-flow' : ''}"
            onclick="si_toggleFlowEditMode()">
            🚶 ${flowPtCount > 0 ? `Flujo (${flowPtCount})` : 'Flujo'}
          </button>
          <button class="si-fp-btn si-fp-btn-edit" onclick="si_toggleLayoutEditMode()">↔ Zonas</button>
          <button class="si-fp-btn si-fp-btn-blueprint" onclick="si_toggleFloorPlanMode()">🏗️ Diseñar plano</button>
        </div>
      </div>`;
  }

  if (activeZones.length === 0) {
    return toolbar + `<div class="si-croquis-empty">Sin zonas activas para mostrar en el croquis.</div>`;
  }

  // Ensure layouts exist in draft
  activeZones.forEach((z, idx) => {
    if (!_siLayoutDraft[z.id]) {
      const cols  = Math.max(2, Math.ceil(Math.sqrt(activeZones.length)));
      const cellW = Math.max(10, Math.floor(94 / cols));
      const cellH = Math.max(14, Math.floor(94 / Math.ceil(activeZones.length / cols)));
      const col = idx % cols;
      const row = Math.floor(idx / cols);
      _siLayoutDraft[z.id] = z.layout || {
        x: 2 + col * cellW, y: 2 + row * cellH,
        w: Math.max(8, cellW - 2), h: Math.max(12, cellH - 2),
      };
    }
  });

  const blocksHTML = activeZones.map(z => {
    const tipo           = SI_ZONE_TYPES[z.type] || SI_ZONE_TYPES.personalizada;
    const layout         = _siLayoutDraft[z.id];
    const mainPhoto      = si_photos_getMain(z.id);
    const photoCount     = si_photos_forZone(z.id).length;
    const prioColor      = z.commercialPriority === 'Alta' ? '#EF4444' : z.commercialPriority === 'Media' ? '#F59E0B' : 'transparent';
    const activeCampaigns = si_getActiveCampaignsForZone(z.id);

    return `
      <div class="si-fp-zone${si_layoutEditMode ? ' si-fp-zone-edit' : ''}"
        data-zone-id="${z.id}"
        style="left:${layout.x}%;top:${layout.y}%;width:${layout.w}%;height:${layout.h}%;--zc:${tipo.color};--zcbg:${tipo.bg};"
        onmousedown="si_onZoneMousedown(event,'${z.id}')"
        ontouchstart="si_onZoneTouchstart(event,'${z.id}')"
        onclick="si_onZoneClick(event,'${z.id}')"
        title="${z.name}">

        ${mainPhoto ? `<img class="si-fp-zone-bg-img" src="${mainPhoto.url}" alt="" />` : ''}

        <div class="si-fp-zone-content">
          <div class="si-fp-zone-icon">${tipo.icon}</div>
          <div class="si-fp-zone-name">${z.name}</div>
          ${!si_layoutEditMode ? `
            <div class="si-fp-zone-badges">
              ${photoCount > 0 ? `<span class="si-fp-photo-dot">📸${photoCount}</span>` : ''}
              ${activeCampaigns.length > 0 ? `<span class="si-fp-campaign-dot">📣</span>` : ''}
              <span class="si-fp-type-dot" style="background:${tipo.color}20;color:${tipo.color};">${tipo.label}</span>
            </div>` : ''}
        </div>

        <div class="si-fp-prio-bar" style="background:${prioColor};"></div>

        ${si_layoutEditMode ? `
          <div class="si-resize-handle"
            onmousedown="si_onResizeMousedown(event,'${z.id}')"
            ontouchstart="si_onResizeTouchstart(event,'${z.id}')">
          </div>` : ''}
      </div>`;
  }).join('');

  // Legend
  const presentTypes = [...new Set(activeZones.map(z => z.type))];
  const legendHTML = `
    <div class="si-fp-legend">
      ${presentTypes.map(t => {
        const v = SI_ZONE_TYPES[t] || SI_ZONE_TYPES.personalizada;
        return `<span class="si-fp-legend-item" style="color:${v.color};">${v.icon} ${v.label}</span>`;
      }).join('')}
    </div>`;

  const flowLegend = (() => {
    const flow = si_flowEditMode ? _siFlowDraft : si_getStoreFlow();
    if (!flow?.points?.length) return '';
    const presentTypes = [...new Set(flow.points.map(p => p.type || 'entrada'))];
    return `
      <div class="si-flow-legend">
        <span class="si-fl-label">Flujo:</span>
        ${presentTypes.map(t => {
          const ft = SI_FLOW_TYPES[t] || SI_FLOW_TYPES.entrada;
          return `<span class="si-fl-item" style="color:${ft.color};">${ft.icon} ${ft.label}</span>`;
        }).join('')}
      </div>`;
  })();

  return toolbar + `
    <div class="si-fp-layout${si_floorPlanMode ? ' si-fp-with-panel' : ''}">
      <div class="si-fp-main">
        ${si_floorPlanMode ? si_renderFloorPlanToolbar() : ''}
        <div class="si-floor-plan${si_flowEditMode ? ' si-flow-edit-active' : ''}${si_floorPlanMode ? ' si-floor-plan-blueprint' : ''}"
          id="si-floor-plan-${si_storeId}">

          <!-- Structural layer: walls + physical elements -->
          <div class="si-fp-struct-wrap" id="si-fp-struct-wrap-${si_storeId}">
            ${si_renderFloorPlanSVG()}
            <div class="si-fp-tool-overlay" id="si-fp-overlay-${si_storeId}"
              style="pointer-events:${si_floorPlanMode && _siActiveTool !== 'select' && _siActiveTool !== 'borrar' ? 'all' : 'none'}"
              onmousedown="si_onToolMousedown(event)"
              onmousemove="si_onToolMousemove(event)"
              ontouchstart="si_onToolTouchstart(event)">
            </div>
          </div>

          <!-- Zone blocks + flow SVG (existing) -->
          <div class="si-floor-plan-inner" id="si-floor-plan-inner-${si_storeId}"
            ${si_flowEditMode ? `onclick="si_addFlowPointFromClick(event)"` : ''}>
            ${blocksHTML}
            <div id="si-flow-svg-wrap-${si_storeId}" class="si-flow-svg-wrap">
              ${si_renderCustomerFlowLayer()}
            </div>
          </div>
        </div>
        ${legendHTML}
        ${flowLegend}
        <div id="si-flow-edit-panel-${si_storeId}" class="si-flow-edit-panel">
          ${si_flowEditMode ? si_renderFlowEditPanel() : ''}
        </div>
      </div>
      ${si_floorPlanMode ? `
        <div class="si-fp-side-panel" id="si-fp-side-panel-${si_storeId}">
          ${si_renderZonePanel()}
        </div>` : ''}
    </div>
  `;
}

// ── Edit mode controls ────────────────────────────────────

function si_toggleLayoutEditMode() {
  si_layoutEditMode = true;
  // Init draft from current zone layouts
  const zones = si_storeId ? si_zones_forStore(si_storeId).filter(z => z.status === 'Activa') : [];
  si_initLayoutDraft(zones);
  si_refreshCroquisSection();
}

function si_saveLayout() {
  const zones = si_storeId ? si_zones_forStore(si_storeId) : [];
  zones.forEach(z => {
    if (_siLayoutDraft[z.id]) {
      si_zones_save({ ...z, layout: { ..._siLayoutDraft[z.id] } });
    }
  });
  si_layoutEditMode = false;
  si_refreshCroquisSection();
  if (typeof showOSToast === 'function') showOSToast('Croquis guardado correctamente');
}

function si_cancelLayout() {
  si_layoutEditMode = false;
  _siLayoutDraft    = {};
  si_refreshCroquisSection();
}

function si_autoArrangeZones() {
  const zones = si_storeId ? si_zones_forStore(si_storeId).filter(z => z.status === 'Activa') : [];
  const cols  = Math.max(2, Math.ceil(Math.sqrt(zones.length)));
  const cellW = Math.max(10, Math.floor(94 / cols));
  const cellH = Math.max(14, Math.floor(94 / Math.ceil(zones.length / cols)));
  zones.forEach((z, idx) => {
    const col = idx % cols;
    const row = Math.floor(idx / cols);
    _siLayoutDraft[z.id] = {
      x: 2 + col * cellW, y: 2 + row * cellH,
      w: Math.max(8, cellW - 2), h: Math.max(12, cellH - 2),
    };
  });
  si_refreshCroquisSection();
}

function si_resetLayout() {
  if (!confirm('¿Resetear posiciones de todas las zonas?')) return;
  const zones = si_storeId ? si_zones_forStore(si_storeId) : [];
  zones.forEach(z => { si_zones_save({ ...z, layout: null }); });
  _siLayoutDraft = {};
  si_autoArrangeZones();
}

function si_centerView() {
  const plan = document.getElementById(`si-floor-plan-${si_storeId}`);
  if (plan) plan.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function si_refreshCroquisSection() {
  const section = document.getElementById('si-croquis-section');
  if (!section) return;
  const zones = si_storeId ? si_zones_forStore(si_storeId) : [];
  section.innerHTML = si_renderInteractiveCroquis(zones);
}

// ── Drag & resize handlers ────────────────────────────────

function si_onZoneMousedown(e, zoneId) {
  if (!si_layoutEditMode) return;
  if (e.target.closest('.si-resize-handle')) return;
  e.preventDefault();
  e.stopPropagation();
  _siDragState = si_buildDragState('drag', zoneId, e.clientX, e.clientY);
}

function si_onZoneTouchstart(e, zoneId) {
  if (!si_layoutEditMode) return;
  e.preventDefault();
  _siDragState = si_buildDragState('drag', zoneId, e.touches[0].clientX, e.touches[0].clientY);
}

function si_onResizeMousedown(e, zoneId) {
  if (!si_layoutEditMode) return;
  e.preventDefault();
  e.stopPropagation();
  _siDragState = si_buildDragState('resize', zoneId, e.clientX, e.clientY);
}

function si_onResizeTouchstart(e, zoneId) {
  if (!si_layoutEditMode) return;
  e.preventDefault();
  _siDragState = si_buildDragState('resize', zoneId, e.touches[0].clientX, e.touches[0].clientY);
}

function si_buildDragState(type, zoneId, clientX, clientY) {
  const container = document.getElementById(`si-floor-plan-inner-${si_storeId}`);
  if (!container) return null;
  const rect   = container.getBoundingClientRect();
  const layout = _siLayoutDraft[zoneId] || { x: 0, y: 0, w: 20, h: 20 };
  return {
    type,
    zoneId,
    startX:  clientX,
    startY:  clientY,
    startLX: layout.x,
    startLY: layout.y,
    startLW: layout.w,
    startLH: layout.h,
    layout:  { ...layout },
    rect,
  };
}

function si_onDragMove(clientX, clientY) {
  if (!_siDragState) return;
  const s      = _siDragState;
  const dx     = ((clientX - s.startX) / s.rect.width)  * 100;
  const dy     = ((clientY - s.startY) / s.rect.height) * 100;
  const el     = document.querySelector(`[data-zone-id="${s.zoneId}"]`);
  if (!el) return;

  if (s.type === 'drag') {
    const nx = Math.round(Math.max(0, Math.min(100 - s.layout.w, s.startLX + dx)) * 10) / 10;
    const ny = Math.round(Math.max(0, Math.min(100 - s.layout.h, s.startLY + dy)) * 10) / 10;
    el.style.left = nx + '%';
    el.style.top  = ny + '%';
    _siLayoutDraft[s.zoneId] = { ...s.layout, x: nx, y: ny };
  } else {
    const nw = Math.round(Math.max(6,  Math.min(100 - s.startLX, s.startLW + dx)) * 10) / 10;
    const nh = Math.round(Math.max(10, Math.min(100 - s.startLY, s.startLH + dy)) * 10) / 10;
    el.style.width  = nw + '%';
    el.style.height = nh + '%';
    _siLayoutDraft[s.zoneId] = { ...s.layout, w: nw, h: nh };
  }
}

function si_onZoneClick(e, zoneId) {
  if (si_layoutEditMode || si_flowEditMode) return;
  openZoneDetail(zoneId);
}

// ── Exports ───────────────────────────────────────────────

window.renderStoreIntelligenceView = renderStoreIntelligenceView;

window.si_renderComparativo        = si_renderComparativo;
window.si_compFilterChange         = si_compFilterChange;
window.si_selectCompPhoto          = si_selectCompPhoto;
window.si_runComparativo           = si_runComparativo;
// ── Flujo de clientes — FASE 1.5 ─────────────────────────
//
// FASE 1.6 (preparado en comentarios):
// - Heatmaps reales por zona (tráfico medido)
// - IA sugerir recorrido óptimo
// - Comparación de flujo entre sucursales
// - Animación del recorrido

// ── Storage helpers ───────────────────────────────────────

function si_getStoreFlow() {
  const store = si_stores_getAll().find(s => s.id === si_storeId);
  return store?.customerFlow || { points: [] };
}

// ── Render SVG layer ──────────────────────────────────────

function si_renderCustomerFlowLayer() {
  const flow   = si_flowEditMode ? (_siFlowDraft || { points: [] }) : si_getStoreFlow();
  const points = (flow.points || []).slice().sort((a, b) => a.order - b.order);

  if (!points.length) {
    if (si_flowEditMode) {
      return `<svg class="si-flow-svg" viewBox="0 0 100 100" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
        <text x="50" y="50" text-anchor="middle" dominant-baseline="middle" font-size="3"
          fill="rgba(136,135,128,0.5)" font-family="Inter,sans-serif">Clic en el plano para agregar punto</text>
      </svg>`;
    }
    return '';
  }

  // Arrow marker
  const markerId = `si-arrow-${si_storeId || 'x'}`.replace(/[^a-zA-Z0-9_-]/g, '_');

  // Lines between consecutive points
  const lines = points.slice(1).map((p, i) => {
    const prev  = points[i];
    const color = SI_FLOW_TYPES[p.type || 'entrada']?.color || '#22C55E';
    return `<line x1="${prev.x}" y1="${prev.y}" x2="${p.x}" y2="${p.y}"
      stroke="${color}" stroke-width="0.8" stroke-opacity="0.75"
      marker-end="url(#${markerId})" />`;
  }).join('');

  // Point circles with order number
  const circles = points.map(p => {
    const ft    = SI_FLOW_TYPES[p.type || 'entrada'] || SI_FLOW_TYPES.entrada;
    const isSelected = si_flowEditMode && _siSelectedFlowPoint === p.id;
    const r     = isSelected ? 3.8 : 3;
    const onClickAttr = si_flowEditMode
      ? `onclick="event.stopPropagation();si_selectFlowPoint('${p.id}')"`
      : `onclick="event.stopPropagation();si_showFlowTooltip(event,'${p.id}')"`;
    return `
      <g class="si-fp-point" data-flow-id="${p.id}" style="cursor:pointer;" ${onClickAttr}>
        <circle cx="${p.x}" cy="${p.y}" r="${r}"
          fill="${ft.color}" stroke="${isSelected ? '#fff' : 'rgba(0,0,0,.4)'}"
          stroke-width="${isSelected ? '0.8' : '0.4'}" />
        <text x="${p.x}" y="${p.y + 0.9}" text-anchor="middle"
          font-size="2.4" font-weight="700" fill="white"
          font-family="Inter, sans-serif" pointer-events="none">${p.order}</text>
        ${p.label ? `<text x="${p.x}" y="${p.y - 4.5}" text-anchor="middle"
          font-size="2" fill="${ft.color}" font-family="Inter,sans-serif"
          pointer-events="none">${p.label}</text>` : ''}
      </g>`;
  }).join('');

  return `
    <svg class="si-flow-svg" viewBox="0 0 100 100" preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg">
      <defs>
        <marker id="${markerId}" markerWidth="5" markerHeight="5" refX="4.5" refY="2.5" orient="auto">
          <path d="M0,0 L0,5 L5,2.5 z" fill="#22C55E" fill-opacity="0.8" />
        </marker>
      </defs>
      ${lines}
      ${circles}
    </svg>`;
}

// ── Flow edit panel ───────────────────────────────────────

function si_renderFlowEditPanel() {
  const pts = _siFlowDraft?.points || [];
  if (!pts.length) return `<div class="si-fep-empty">Sin puntos todavía. Hacé clic en el plano para agregar.</div>`;

  const sorted = [...pts].sort((a, b) => a.order - b.order);

  return `
    <div class="si-fep-list">
      ${sorted.map(p => {
        const ft = SI_FLOW_TYPES[p.type || 'entrada'] || SI_FLOW_TYPES.entrada;
        const isSel = _siSelectedFlowPoint === p.id;
        return `
          <div class="si-fep-row${isSel ? ' selected' : ''}" onclick="si_selectFlowPoint('${p.id}')">
            <div class="si-fep-row-left">
              <span class="si-fep-num" style="background:${ft.color}20;color:${ft.color};">${p.order}</span>
              <span class="si-fep-icon">${ft.icon}</span>
              <div>
                <div class="si-fep-type" style="color:${ft.color};">${ft.label}</div>
                ${p.label ? `<div class="si-fep-lbl">${p.label}</div>` : ''}
              </div>
            </div>
            <button class="si-fep-del" onclick="event.stopPropagation();si_deleteFlowPoint('${p.id}')" title="Eliminar">✕</button>
          </div>
          ${isSel ? `
            <div class="si-fep-editor">
              <div class="si-fep-editor-row">
                <label class="si-form-label">Tipo</label>
                <select class="si-input si-fep-select" onchange="si_updateFlowPointType('${p.id}',this.value)">
                  ${Object.entries(SI_FLOW_TYPES).map(([k,v]) =>
                    `<option value="${k}" ${k === (p.type||'entrada') ? 'selected' : ''}>${v.icon} ${v.label}</option>`
                  ).join('')}
                </select>
              </div>
              <div class="si-fep-editor-row">
                <label class="si-form-label">Etiqueta</label>
                <input class="si-input si-fep-input" type="text" value="${p.label || ''}"
                  placeholder="Ej: Vitrina principal"
                  oninput="si_updateFlowPointLabel('${p.id}',this.value)" />
              </div>
            </div>` : ''}
        `;
      }).join('')}
    </div>`;
}

// ── Edit mode controls ────────────────────────────────────

function si_toggleFlowEditMode() {
  si_flowEditMode      = true;
  _siFlowDraft         = JSON.parse(JSON.stringify(si_getStoreFlow()));
  _siSelectedFlowPoint = null;
  si_refreshCroquisSection();
}

function si_saveCustomerFlow() {
  const store = si_stores_getAll().find(s => s.id === si_storeId);
  if (!store) return;
  si_stores_save({ ...store, customerFlow: _siFlowDraft });
  si_flowEditMode      = false;
  _siFlowDraft         = null;
  _siSelectedFlowPoint = null;
  si_refreshCroquisSection();
  si_renderStoreContent(); // refresh flow KPIs
  if (typeof showOSToast === 'function') showOSToast('Flujo de clientes guardado');
}

function si_cancelCustomerFlow() {
  si_flowEditMode      = false;
  _siFlowDraft         = null;
  _siSelectedFlowPoint = null;
  si_refreshCroquisSection();
}

function si_clearCustomerFlow() {
  if (!confirm('¿Eliminar todos los puntos del flujo?')) return;
  _siFlowDraft         = { points: [] };
  _siSelectedFlowPoint = null;
  si_refreshSVGAndPanel();
}

// ── Point management ──────────────────────────────────────

function si_addFlowPointFromClick(e) {
  if (!si_flowEditMode) return;
  if (e.target.closest('.si-fp-point') || e.target.closest('.si-resize-handle')) return;

  const container = document.getElementById(`si-floor-plan-inner-${si_storeId}`);
  if (!container) return;
  const rect = container.getBoundingClientRect();
  const x = Math.round(((e.clientX - rect.left) / rect.width)  * 100 * 10) / 10;
  const y = Math.round(((e.clientY - rect.top)  / rect.height) * 100 * 10) / 10;

  if (!_siFlowDraft) _siFlowDraft = { points: [] };

  const order       = (_siFlowDraft.points.length) + 1;
  const defaultType = order === 1 ? 'entrada'
    : order === (_siFlowDraft.points.length + 1) ? 'salida'
    : 'decision';

  const newPoint = { id: crypto.randomUUID(), x, y, order, label: '', type: defaultType };
  _siFlowDraft.points.push(newPoint);
  _siSelectedFlowPoint = newPoint.id;
  si_refreshSVGAndPanel();
}

function si_selectFlowPoint(pointId) {
  _siSelectedFlowPoint = (_siSelectedFlowPoint === pointId) ? null : pointId;
  si_refreshSVGAndPanel();
}

function si_updateFlowPointType(pointId, type) {
  const p = _siFlowDraft?.points?.find(pt => pt.id === pointId);
  if (p) p.type = type;
  si_refreshSVGAndPanel();
}

function si_updateFlowPointLabel(pointId, label) {
  const p = _siFlowDraft?.points?.find(pt => pt.id === pointId);
  if (p) p.label = label;
  // Debounced SVG refresh only
  const wrap = document.getElementById(`si-flow-svg-wrap-${si_storeId}`);
  if (wrap) wrap.innerHTML = si_renderCustomerFlowLayer();
}

function si_deleteFlowPoint(pointId) {
  if (!_siFlowDraft) return;
  _siFlowDraft.points = _siFlowDraft.points.filter(p => p.id !== pointId);
  // Re-number
  _siFlowDraft.points.forEach((p, i) => { p.order = i + 1; });
  if (_siSelectedFlowPoint === pointId) _siSelectedFlowPoint = null;
  si_refreshSVGAndPanel();
}

// ── Tooltip (vista operativa) ─────────────────────────────

function si_showFlowTooltip(e, pointId) {
  const flow  = si_getStoreFlow();
  const point = flow.points?.find(p => p.id === pointId);
  if (!point) return;
  const ft = SI_FLOW_TYPES[point.type || 'entrada'] || SI_FLOW_TYPES.entrada;

  let tip = document.getElementById('si-flow-tooltip');
  if (!tip) {
    tip = document.createElement('div');
    tip.id = 'si-flow-tooltip';
    tip.className = 'si-flow-tooltip';
    document.body.appendChild(tip);
    document.addEventListener('click', () => { if (tip) tip.style.display = 'none'; }, { once: true });
  }
  tip.innerHTML = `
    <div class="si-ft-type" style="color:${ft.color};">${ft.icon} ${ft.label}</div>
    <div class="si-ft-order">Punto #${point.order}</div>
    ${point.label ? `<div class="si-ft-label">${point.label}</div>` : ''}
  `;
  tip.style.cssText = `display:block;left:${e.clientX + 12}px;top:${e.clientY - 10}px;`;
  clearTimeout(tip._t);
  tip._t = setTimeout(() => { tip.style.display = 'none'; }, 3500);
}

// ── Partial re-render helpers ─────────────────────────────

function si_refreshSVGAndPanel() {
  const wrap  = document.getElementById(`si-flow-svg-wrap-${si_storeId}`);
  const panel = document.getElementById(`si-flow-edit-panel-${si_storeId}`);
  if (wrap)  wrap.innerHTML  = si_renderCustomerFlowLayer();
  if (panel) panel.innerHTML = si_flowEditMode ? si_renderFlowEditPanel() : '';
}

// ── Campañas Visuales — FASE 1.6 ─────────────────────────
//
// FASE 1.7 (preparado):
// - Checklist de ejecución de campaña por zona
// - Evidencia fotográfica obligatoria por campaña
// - Auditoría de cumplimiento visual
// - IA: análisis de efectividad de campaña
// Para Supabase: visualCampaigns → tabla `si_campaigns` con store_id

// ── Storage helpers ───────────────────────────────────────

function si_getStoreCampaigns() {
  const store = si_stores_getAll().find(s => s.id === si_storeId);
  return store?.visualCampaigns || [];
}

function si_saveStoreCampaigns(campaigns) {
  const store = si_stores_getAll().find(s => s.id === si_storeId);
  if (!store) return;
  si_stores_save({ ...store, visualCampaigns: campaigns });
}

function si_getCampaignStatus(campaign) {
  if (!campaign.fechaInicio) return campaign.estado || 'Planificada';
  const today = new Date(); today.setHours(0,0,0,0);
  const start = new Date(campaign.fechaInicio + 'T00:00:00');
  const end   = campaign.fechaFin ? new Date(campaign.fechaFin + 'T00:00:00') : null;
  if (today < start)             return 'Planificada';
  if (end && today > end)        return 'Finalizada';
  return 'Activa';
}

function si_getActiveCampaignsForZone(zoneId) {
  return si_getStoreCampaigns().filter(c =>
    (c.zonas || []).includes(zoneId) && si_getCampaignStatus(c) === 'Activa'
  );
}

function si_calculateCampaignKPIs() {
  const camps = si_getStoreCampaigns();
  const zones = si_storeId ? si_zones_forStore(si_storeId) : [];
  const now   = new Date(); now.setHours(0,0,0,0);
  return {
    activas:      camps.filter(c => si_getCampaignStatus(c) === 'Activa').length,
    planificadas: camps.filter(c => si_getCampaignStatus(c) === 'Planificada').length,
    finalizadas:  camps.filter(c => si_getCampaignStatus(c) === 'Finalizada').length,
    vencidas:     camps.filter(c => c.fechaFin && new Date(c.fechaFin + 'T00:00:00') < now && si_getCampaignStatus(c) !== 'Activa').length,
    zonasConCamp: zones.filter(z => si_getActiveCampaignsForZone(z.id).length > 0).length,
  };
}

// ── Render campaigns section ──────────────────────────────

function si_renderCampaignsSection() {
  const all   = si_getStoreCampaigns();
  const kpis  = si_calculateCampaignKPIs();

  const kpiBar = all.length ? `
    <div class="si-camp-kpi-bar">
      <span class="si-camp-kpi-label">📣 Campañas</span>
      <div class="si-camp-kpi-items">
        <div class="si-camp-kpi" style="color:#22C55E">${kpis.activas} <span>Activas</span></div>
        <div class="si-camp-kpi" style="color:#F59E0B">${kpis.planificadas} <span>Planificadas</span></div>
        <div class="si-camp-kpi">${kpis.finalizadas} <span>Finalizadas</span></div>
        <div class="si-camp-kpi" style="color:#22C55E">${kpis.zonasConCamp} <span>Zonas con campaña</span></div>
      </div>
    </div>` : '';

  // Filtros
  const tipoOpts  = ['all', ...SI_CAMPAIGN_TIPOS].map(t =>
    `<option value="${t}" ${_siCampaignFilter.tipo === t ? 'selected' : ''}>${t === 'all' ? 'Todos los tipos' : t}</option>`
  ).join('');
  const estadoOpts = ['all', ...Object.keys(SI_CAMPAIGN_ESTADOS)].map(e =>
    `<option value="${e}" ${_siCampaignFilter.estado === e ? 'selected' : ''}>${e === 'all' ? 'Todos los estados' : e}</option>`
  ).join('');

  // Filter campaigns
  let filtered = all;
  if (_siCampaignFilter.estado !== 'all') filtered = filtered.filter(c => si_getCampaignStatus(c) === _siCampaignFilter.estado);
  if (_siCampaignFilter.tipo   !== 'all') filtered = filtered.filter(c => c.tipo === _siCampaignFilter.tipo);
  filtered = filtered.slice().sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  const zones = si_storeId ? si_zones_forStore(si_storeId) : [];

  const cards = filtered.length === 0
    ? `<div class="si-camp-empty">Sin campañas${all.length > 0 ? ' para este filtro' : ' todavía'}. Creá la primera campaña visual.</div>`
    : `<div class="si-camp-grid">${filtered.map(c => {
        const st      = si_getCampaignStatus(c);
        const sc      = SI_CAMPAIGN_ESTADOS[st] || SI_CAMPAIGN_ESTADOS.Planificada;
        const campZones = (c.zonas || []).map(id => zones.find(z => z.id === id)?.name).filter(Boolean);
        const isIncomplete = (c.zonas || []).length === 0;
        return `
          <div class="si-camp-card">
            <div class="si-camp-card-top">
              <div style="display:flex;gap:6px;flex-wrap:wrap;">
                <span class="si-camp-tipo-badge">${c.tipo || 'Personalizada'}</span>
                <span class="si-camp-estado-badge" style="background:${sc.bg};color:${sc.color};">● ${st}</span>
                ${isIncomplete ? `<span class="si-camp-incomplete-badge">⚠ Sin zonas</span>` : ''}
              </div>
              <div style="display:flex;gap:4px;">
                <button class="si-camp-action-btn" onclick="si_openCampaignModal('${c.id}')" title="Editar">✏️</button>
                <button class="si-camp-action-btn si-camp-del-btn" onclick="si_deleteCampaign('${c.id}')" title="Eliminar">✕</button>
              </div>
            </div>
            <div class="si-camp-nombre">${c.nombre}</div>
            ${c.objetivo ? `<div class="si-camp-objetivo">${c.objetivo.substring(0,80)}${c.objetivo.length>80?'…':''}</div>` : ''}
            <div class="si-camp-meta">
              <span>📅 ${c.fechaInicio}${c.fechaFin ? ' → ' + c.fechaFin : ''}</span>
              ${c.responsable ? `<span>👤 ${c.responsable}</span>` : ''}
            </div>
            ${campZones.length ? `
              <div class="si-camp-zones">
                ${campZones.slice(0,3).map(n => `<span class="si-camp-zone-tag">${n}</span>`).join('')}
                ${campZones.length > 3 ? `<span class="si-camp-zone-tag">+${campZones.length-3}</span>` : ''}
              </div>` : ''}
          </div>`;
      }).join('')}</div>`;

  return `
    ${kpiBar}
    <div class="si-section-header" style="margin-bottom:14px;">
      <div>
        <div class="si-section-title">📣 Campañas visuales</div>
        <div class="si-section-sub">${all.length} campaña${all.length!==1?'s':''} · gestión por zonas de la sucursal</div>
      </div>
      <button class="si-add-btn" onclick="si_openCampaignModal()">+ Nueva campaña</button>
    </div>
    <div class="si-camp-filters">
      <select class="si-input si-camp-filter-sel" onchange="si_campFilterChange('tipo',this.value)">${tipoOpts}</select>
      <select class="si-input si-camp-filter-sel" onchange="si_campFilterChange('estado',this.value)">${estadoOpts}</select>
    </div>
    ${cards}
  `;
}

function si_campFilterChange(key, val) {
  _siCampaignFilter[key] = val;
  const section = document.getElementById('si-campaigns-section');
  if (section) section.innerHTML = si_renderCampaignsSection();
}

// ── CRUD ──────────────────────────────────────────────────

function si_openCampaignModal(campaignId = null) {
  const zones    = si_storeId ? si_zones_forStore(si_storeId) : [];
  const existing = campaignId ? si_getStoreCampaigns().find(c => c.id === campaignId) : null;
  const d        = existing || {};

  document.getElementById('modal-si-campaign-body').innerHTML = `
    <div class="si-form-grid">
      <div class="si-form-field full">
        <label class="si-form-label">Nombre de la campaña <span class="req">*</span></label>
        <input class="si-input" type="text" id="sc-nombre" value="${d.nombre||''}" placeholder="Ej: Campaña de verano 2026" />
      </div>
      <div class="si-form-field">
        <label class="si-form-label">Tipo</label>
        <select class="si-input" id="sc-tipo">
          ${SI_CAMPAIGN_TIPOS.map(t => `<option value="${t}" ${t===(d.tipo||'Temporada')?'selected':''}>${t}</option>`).join('')}
        </select>
      </div>
      <div class="si-form-field">
        <label class="si-form-label">Estado</label>
        <select class="si-input" id="sc-estado">
          ${Object.keys(SI_CAMPAIGN_ESTADOS).map(e => `<option value="${e}" ${e===(d.estado||'Planificada')?'selected':''}>${e}</option>`).join('')}
        </select>
      </div>
      <div class="si-form-field">
        <label class="si-form-label">Fecha inicio <span class="req">*</span></label>
        <input class="si-input" type="date" id="sc-inicio" value="${d.fechaInicio||''}" />
      </div>
      <div class="si-form-field">
        <label class="si-form-label">Fecha fin</label>
        <input class="si-input" type="date" id="sc-fin" value="${d.fechaFin||''}" />
      </div>
      <div class="si-form-field">
        <label class="si-form-label">Responsable</label>
        <input class="si-input" type="text" id="sc-responsable" value="${d.responsable||''}" placeholder="Ej: Encargado visual" />
      </div>
      <div class="si-form-field full">
        <label class="si-form-label">Objetivo comercial</label>
        <input class="si-input" type="text" id="sc-objetivo" value="${d.objetivo||''}" placeholder="Ej: Incrementar ventas de temporada 30%" />
      </div>
      <div class="si-form-field full">
        <label class="si-form-label">Zonas asociadas
          <span style="font-size:10px;color:var(--gray);font-weight:400;">(opcional — campaña sin zonas queda marcada como incompleta)</span>
        </label>
        <div class="si-camp-zones-select" id="sc-zonas-list">
          ${zones.length === 0
            ? `<div style="font-size:12px;color:var(--gray);">Sin zonas configuradas en esta sucursal.</div>`
            : zones.map(z => {
                const tipo     = SI_ZONE_TYPES[z.type] || SI_ZONE_TYPES.personalizada;
                const hasPhoto = !!si_photos_getMain(z.id);
                const checked  = (d.zonas||[]).includes(z.id);
                return `
                  <label class="si-camp-zone-check">
                    <input type="checkbox" value="${z.id}" ${checked?'checked':''} />
                    <span class="si-czc-icon">${tipo.icon}</span>
                    <span class="si-czc-name">${z.name}</span>
                    ${hasPhoto ? `<span class="si-czc-photo">📸</span>` : ''}
                    <span class="si-czc-tipo" style="color:${tipo.color};">${tipo.label}</span>
                  </label>`;
              }).join('')}
        </div>
      </div>
      <div class="si-form-field full">
        <label class="si-form-label">Notas</label>
        <textarea class="si-input si-textarea" id="sc-notas" rows="2" placeholder="Observaciones, instrucciones...">${d.notas||''}</textarea>
      </div>
    </div>
    <input type="hidden" id="sc-edit-id" value="${d.id||''}" />
    <div class="modal-msg" id="sc-form-msg"></div>
  `;

  const modal = document.getElementById('modal-si-campaign');
  modal.querySelector('.modal-title').textContent = existing ? 'Editar campaña' : 'Nueva campaña';
  openModal('modal-si-campaign');
}

function si_saveCampaign() {
  const nombre = document.getElementById('sc-nombre')?.value.trim();
  const msg    = document.getElementById('sc-form-msg');
  if (!nombre) { showMsg(msg,'error','El nombre de la campaña es requerido.'); return; }

  const fechaInicio = document.getElementById('sc-inicio')?.value;
  if (!fechaInicio) { showMsg(msg,'error','La fecha de inicio es requerida.'); return; }

  const fechaFin = document.getElementById('sc-fin')?.value || null;
  if (fechaFin && fechaFin < fechaInicio) { showMsg(msg,'error','La fecha fin no puede ser menor que la fecha inicio.'); return; }

  const zonas  = [...document.querySelectorAll('#sc-zonas-list input:checked')].map(el => el.value);
  const editId = document.getElementById('sc-edit-id')?.value;
  const now    = new Date().toISOString();
  const data   = {
    nombre, fechaInicio, fechaFin, zonas,
    tipo:        document.getElementById('sc-tipo')?.value       || 'Temporada',
    estado:      document.getElementById('sc-estado')?.value     || 'Planificada',
    objetivo:    document.getElementById('sc-objetivo')?.value.trim()    || '',
    responsable: document.getElementById('sc-responsable')?.value.trim() || '',
    notas:       document.getElementById('sc-notas')?.value.trim()       || '',
    store_id:    si_storeId,
  };

  const campaigns = si_getStoreCampaigns();
  if (editId) {
    const idx = campaigns.findIndex(c => c.id === editId);
    if (idx !== -1) campaigns[idx] = { ...campaigns[idx], ...data, updated_at: now };
  } else {
    campaigns.unshift({ ...data, id: crypto.randomUUID(), created_at: now, updated_at: now });
  }

  si_saveStoreCampaigns(campaigns);
  closeModal('modal-si-campaign');
  si_refreshCampaignsSection();
  si_refreshCroquisSection(); // update campaign badges on zone blocks
}

function si_deleteCampaign(id) {
  if (!confirm('¿Eliminar esta campaña?')) return;
  si_saveStoreCampaigns(si_getStoreCampaigns().filter(c => c.id !== id));
  si_refreshCampaignsSection();
  si_refreshCroquisSection();
}

function si_refreshCampaignsSection() {
  const s = document.getElementById('si-campaigns-section');
  if (s) s.innerHTML = si_renderCampaignsSection();
}

// ── Editor de plano — FASE 1.7 ───────────────────────────
//
// FASE 1.8 (preparado):
// - Imagen de plano real como fondo (store.floorPlan.bgImage)
// - Calibrar medidas reales (escala metros/pixel)
// - Gemelo digital 3D
// - Heatmaps superpuestos
// - IA análisis espacial

// ── Storage ───────────────────────────────────────────────

function si_getFloorPlan() {
  const store = si_stores_getAll().find(s => s.id === si_storeId);
  return store?.floorPlan || { elements: [], walls: [], labels: [], version: 1 };
}

function si_saveStoreFloorPlan(fp) {
  const store = si_stores_getAll().find(s => s.id === si_storeId);
  if (!store) return;
  si_stores_save({ ...store, floorPlan: fp });
}

// ── SVG estructural ───────────────────────────────────────

function si_renderFloorPlanSVG() {
  const fp      = si_floorPlanMode ? (_siFloorPlanDraft || { elements:[], walls:[], labels:[] }) : si_getFloorPlan();
  const walls   = fp.walls    || [];
  const elements= fp.elements || [];
  const isBorrar = si_floorPlanMode && _siActiveTool === 'borrar';
  const storeIdSafe = (si_storeId||'x').replace(/[^a-zA-Z0-9_-]/g,'_');

  const wallLines = walls.map(w => {
    const delAttr = isBorrar ? `onclick="event.stopPropagation();si_deleteFloorElement('${w.id}','wall')" class="si-fp-wall si-fp-deletable"` : `class="si-fp-wall"`;
    return `<line ${delAttr} data-id="${w.id}" x1="${w.x1}" y1="${w.y1}" x2="${w.x2}" y2="${w.y2}" />`;
  }).join('');

  const elemShapes = elements.map(e => {
    const ft = SI_FLOOR_ELEMENTS[e.type] || {};
    const cx = e.x + e.w/2, cy = e.y + e.h/2;
    const delAttr = isBorrar ? `onclick="event.stopPropagation();si_deleteFloorElement('${e.id}','element')" style="cursor:pointer;"` : '';
    return `
      <g class="si-fp-el${isBorrar ? ' si-fp-deletable' : ''}" data-id="${e.id}" ${delAttr}>
        <rect x="${e.x}" y="${e.y}" width="${e.w}" height="${e.h}"
          fill="${ft.color}1A" stroke="${ft.color}" stroke-width="0.6" rx="0.6" />
        <text x="${cx}" y="${cy + 1.2}" text-anchor="middle" dominant-baseline="middle"
          font-size="3" font-family="Inter,sans-serif" fill="${ft.color}" pointer-events="none">${ft.icon||''}</text>
        ${e.label ? `<text x="${cx}" y="${e.y + e.h + 3.5}" text-anchor="middle"
          font-size="2" fill="${ft.color}BB" font-family="Inter,sans-serif" pointer-events="none">${e.label}</text>` : ''}
      </g>`;
  }).join('');

  return `
    <svg class="si-fp-struct-svg" id="si-fp-struct-svg-${storeIdSafe}"
      viewBox="0 0 100 100" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
      <!-- Store boundary — FASE 1.8: bg image here -->
      <rect class="si-fp-boundary" x="0.3" y="0.3" width="99.4" height="99.4" />
      <!-- Walls -->
      ${wallLines}
      <!-- Physical elements -->
      ${elemShapes}
      <!-- Wall draw preview -->
      <line id="si-fp-preview-${storeIdSafe}" x1="0" y1="0" x2="0" y2="0"
        stroke="#22C55E" stroke-width="0.8" stroke-dasharray="2,1" display="none"
        pointer-events="none" />
    </svg>`;
}

// ── Tool toolbar ──────────────────────────────────────────

function si_renderFloorPlanToolbar() {
  const tools = [
    { id:'select',  label:'Seleccionar', icon:'↖' },
    { id:'wall',    label:'Pared',       icon:'▬', color:'#9CA3AF' },
    { id:'entrada', label:'Entrada',     icon:'🚪', color:'#22C55E' },
    { id:'ventana', label:'Escaparate',  icon:'🪟', color:'#3B82F6' },
    { id:'caja',    label:'Caja',        icon:'💰', color:'#14B8A6' },
    { id:'bodega',  label:'Bodega',      icon:'📦', color:'#6B7280' },
    { id:'tarima',  label:'Tarima',      icon:'🏷️', color:'#EC4899' },
    { id:'urna',    label:'Urna',        icon:'💎', color:'#6366F1' },
    { id:'borrar',  label:'Borrar',      icon:'✕',  danger: true    },
  ];
  const hint = {
    select:  'Arrastrá zonas para reposicionarlas en el plano.',
    wall:    'Clic y arrastrá para dibujar una pared.',
    borrar:  'Clic en cualquier pared o elemento para eliminarlo.',
    default: 'Clic en el plano para colocar el elemento.',
  };
  const activeHint = hint[_siActiveTool] || hint.default;
  return `
    <div class="si-fp-tools">
      ${tools.map(t => `
        <button class="si-tool-btn${_siActiveTool === t.id ? ' active' : ''}${t.danger ? ' danger' : ''}"
          onclick="si_setFloorPlanTool('${t.id}')" title="${t.label}"
          style="${t.color && _siActiveTool === t.id ? `--tc:${t.color}` : ''}">
          <span class="si-tool-icon">${t.icon}</span>
          <span class="si-tool-label">${t.label}</span>
        </button>`).join('')}
    </div>
    <div class="si-fp-tool-hint">${activeHint}</div>`;
}

// ── Zone side panel ───────────────────────────────────────

function si_renderZonePanel() {
  const zones    = si_storeId ? si_zones_forStore(si_storeId).filter(z => z.status === 'Activa') : [];
  const located  = zones.filter(z => z.layout || _siLayoutDraft[z.id]);
  const unlocated= zones.filter(z => !z.layout && !_siLayoutDraft[z.id]);

  const buildItem = (z, located) => {
    const tipo = SI_ZONE_TYPES[z.type] || SI_ZONE_TYPES.personalizada;
    return `
      <div class="si-zp-item">
        <span class="si-zp-icon" style="color:${tipo.color};">${tipo.icon}</span>
        <div class="si-zp-info">
          <div class="si-zp-name">${z.name}</div>
          <div class="si-zp-tipo" style="color:${tipo.color};">${tipo.label}</div>
        </div>
        <button class="si-zp-btn" onclick="si_centerZoneOnPlan('${z.id}')" title="${located ? 'Centrar' : 'Ubicar'}">${located ? '⊙' : '📌'}</button>
      </div>`;
  };

  return `
    <div class="si-zone-panel">
      <div class="si-zp-header">Zonas del plano</div>
      ${located.length ? `
        <div class="si-zp-group">
          <div class="si-zp-group-label">✅ Ubicadas (${located.length})</div>
          ${located.map(z => buildItem(z, true)).join('')}
        </div>` : ''}
      ${unlocated.length ? `
        <div class="si-zp-group">
          <div class="si-zp-group-label">📍 Sin ubicar (${unlocated.length})</div>
          ${unlocated.map(z => buildItem(z, false)).join('')}
          <button class="si-fp-btn" style="width:100%;margin-top:8px;font-size:11px;"
            onclick="si_autoPlaceUnlocatedZones()">⊞ Ubicar automáticamente</button>
        </div>` : ''}
      ${zones.length === 0 ? `<div class="si-zp-empty">Sin zonas activas.</div>` : ''}
      <div class="si-zp-legend">
        <div class="si-zp-legend-title">Leyenda</div>
        ${Object.entries(SI_FLOOR_ELEMENTS).filter(([k]) => k !== 'wall').map(([k,v]) =>
          `<div class="si-zp-legend-item"><span style="color:${v.color};">${v.icon}</span><span>${v.label}</span></div>`
        ).join('')}
        ${Object.entries(SI_ZONE_TYPES).slice(0,5).map(([k,v]) =>
          `<div class="si-zp-legend-item"><span style="color:${v.color};">${v.icon}</span><span>${v.label}</span></div>`
        ).join('')}
      </div>
    </div>`;
}

// ── Mode controls ─────────────────────────────────────────

function si_toggleFloorPlanMode() {
  si_floorPlanMode  = true;
  si_layoutEditMode = true;
  _siActiveTool     = 'select';
  _siWallStart      = null;
  const store = si_stores_getAll().find(s => s.id === si_storeId);
  _siFloorPlanDraft = JSON.parse(JSON.stringify(store?.floorPlan || { elements:[], walls:[], labels:[], version:1 }));
  const zones = si_zones_forStore(si_storeId).filter(z => z.status === 'Activa');
  si_initLayoutDraft(zones);
  si_refreshCroquisSection();
}

function si_saveFloorPlan() {
  si_saveStoreFloorPlan(_siFloorPlanDraft);
  // Save zone layouts too
  const zones = si_zones_forStore(si_storeId);
  zones.forEach(z => { if (_siLayoutDraft[z.id]) si_zones_save({ ...z, layout: _siLayoutDraft[z.id] }); });
  si_floorPlanMode  = false;
  si_layoutEditMode = false;
  _siFloorPlanDraft = null;
  _siActiveTool     = 'select';
  si_refreshCroquisSection();
  if (typeof showOSToast === 'function') showOSToast('Plano guardado correctamente');
}

function si_cancelFloorPlan() {
  si_floorPlanMode  = false;
  si_layoutEditMode = false;
  _siFloorPlanDraft = null;
  _siLayoutDraft    = {};
  _siActiveTool     = 'select';
  _siWallStart      = null;
  si_refreshCroquisSection();
}

function si_clearFloorPlan() {
  if (!confirm('¿Eliminar todas las paredes y elementos del plano?')) return;
  _siFloorPlanDraft = { elements:[], walls:[], labels:[], version:1 };
  si_refreshFloorPlanSVG();
}

function si_setFloorPlanTool(tool) {
  _siActiveTool = tool;
  _siWallStart  = null;
  // Update overlay pointer-events
  const overlay = document.getElementById(`si-fp-overlay-${si_storeId}`);
  if (overlay) overlay.style.pointerEvents = (tool !== 'select' && tool !== 'borrar') ? 'all' : 'none';
  // Update tool buttons
  document.querySelectorAll('.si-tool-btn').forEach(b => b.classList.remove('active'));
  const activeBtn = document.querySelector(`.si-tool-btn[onclick*="'${tool}'"]`);
  if (activeBtn) activeBtn.classList.add('active');
  // Update hint
  const hints = {
    select: 'Arrastrá zonas para reposicionarlas.',
    wall:   'Clic y arrastrá para dibujar una pared.',
    borrar: 'Clic en cualquier pared o elemento para eliminarlo.',
  };
  const hintEl = document.querySelector('.si-fp-tool-hint');
  if (hintEl) hintEl.textContent = hints[tool] || 'Clic en el plano para colocar el elemento.';
  // Cancel preview if switching away from wall
  if (tool !== 'wall') si_clearWallPreview();
}

// ── Tool actions ──────────────────────────────────────────

function si_getFloorPlanPos(e) {
  const container = document.getElementById(`si-floor-plan-inner-${si_storeId}`);
  if (!container) return { x: 50, y: 50 };
  const rect = container.getBoundingClientRect();
  return {
    x: Math.round(Math.max(1, Math.min(99, ((e.clientX - rect.left)  / rect.width)  * 100)) * 10) / 10,
    y: Math.round(Math.max(1, Math.min(99, ((e.clientY - rect.top)   / rect.height) * 100)) * 10) / 10,
  };
}

function si_onToolMousedown(e) {
  if (!si_floorPlanMode) return;
  e.preventDefault(); e.stopPropagation();
  const pos = si_getFloorPlanPos(e);

  if (_siActiveTool === 'wall') {
    _siWallStart = pos;
    si_updateWallPreview(e.clientX, e.clientY);
  } else if (_siActiveTool !== 'select' && _siActiveTool !== 'borrar') {
    si_addFloorElement(_siActiveTool, pos.x, pos.y);
  }
}

function si_onToolMousemove(e) {
  if (!si_floorPlanMode || _siActiveTool !== 'wall' || !_siWallStart) return;
  si_updateWallPreview(e.clientX, e.clientY);
}

function si_onToolTouchstart(e) {
  if (!si_floorPlanMode) return;
  e.preventDefault();
  si_onToolMousedown({ clientX: e.touches[0].clientX, clientY: e.touches[0].clientY, preventDefault:()=>{}, stopPropagation:()=>{} });
}

function si_updateWallPreview(clientX, clientY) {
  if (!_siWallStart) return;
  const pos  = si_getFloorPlanPos({ clientX, clientY });
  const stId = (si_storeId||'x').replace(/[^a-zA-Z0-9_-]/g,'_');
  const line = document.getElementById(`si-fp-preview-${stId}`);
  if (!line) return;
  line.setAttribute('x1', _siWallStart.x);
  line.setAttribute('y1', _siWallStart.y);
  line.setAttribute('x2', pos.x);
  line.setAttribute('y2', pos.y);
  line.setAttribute('display', 'block');
}

function si_finishDrawingWall(clientX, clientY) {
  if (!_siWallStart) return;
  const pos = si_getFloorPlanPos({ clientX, clientY });
  const dx  = Math.abs(pos.x - _siWallStart.x);
  const dy  = Math.abs(pos.y - _siWallStart.y);
  if (dx < 1 && dy < 1) { _siWallStart = null; si_clearWallPreview(); return; } // too short

  if (!_siFloorPlanDraft) _siFloorPlanDraft = { elements:[], walls:[], labels:[] };
  _siFloorPlanDraft.walls = _siFloorPlanDraft.walls || [];
  _siFloorPlanDraft.walls.push({
    id: crypto.randomUUID(),
    type: 'wall',
    x1: _siWallStart.x, y1: _siWallStart.y,
    x2: pos.x,          y2: pos.y,
  });
  _siWallStart = null;
  si_clearWallPreview();
  si_refreshFloorPlanSVG();
}

function si_clearWallPreview() {
  const stId = (si_storeId||'x').replace(/[^a-zA-Z0-9_-]/g,'_');
  const line = document.getElementById(`si-fp-preview-${stId}`);
  if (line) line.setAttribute('display', 'none');
}

function si_addFloorElement(type, cx, cy) {
  const ft = SI_FLOOR_ELEMENTS[type];
  if (!ft || ft.isWall) return;
  if (!_siFloorPlanDraft) _siFloorPlanDraft = { elements:[], walls:[], labels:[] };
  _siFloorPlanDraft.elements = _siFloorPlanDraft.elements || [];
  const w = ft.dw, h = ft.dh;
  _siFloorPlanDraft.elements.push({
    id:    crypto.randomUUID(),
    type,
    x:     Math.max(0, Math.min(100-w, cx - w/2)),
    y:     Math.max(0, Math.min(100-h, cy - h/2)),
    w, h,
    label: ft.label,
  });
  si_refreshFloorPlanSVG();
}

function si_deleteFloorElement(id, kind) {
  if (!_siFloorPlanDraft) return;
  if (kind === 'wall')    _siFloorPlanDraft.walls    = (_siFloorPlanDraft.walls    ||[]).filter(e => e.id !== id);
  if (kind === 'element') _siFloorPlanDraft.elements = (_siFloorPlanDraft.elements ||[]).filter(e => e.id !== id);
  si_refreshFloorPlanSVG();
}

function si_refreshFloorPlanSVG() {
  const wrap = document.getElementById(`si-fp-struct-wrap-${si_storeId}`);
  if (!wrap) return;
  wrap.innerHTML = si_renderFloorPlanSVG() + `
    <div class="si-fp-tool-overlay" id="si-fp-overlay-${si_storeId}"
      style="pointer-events:${si_floorPlanMode && _siActiveTool !== 'select' && _siActiveTool !== 'borrar' ? 'all' : 'none'}"
      onmousedown="si_onToolMousedown(event)"
      onmousemove="si_onToolMousemove(event)"
      ontouchstart="si_onToolTouchstart(event)">
    </div>`;
}

// ── Zone panel helpers ────────────────────────────────────

function si_centerZoneOnPlan(zoneId) {
  const el = document.querySelector(`[data-zone-id="${zoneId}"]`);
  if (!el) {
    // Zone not located — auto place it
    const zones   = si_zones_forStore(si_storeId);
    const zone    = zones.find(z => z.id === zoneId);
    const idx     = zones.filter(z => !z.layout && !_siLayoutDraft[z.id]).indexOf(zone);
    if (zone) _siLayoutDraft[zoneId] = { x: 5 + (idx % 3) * 30, y: 5 + Math.floor(idx/3) * 25, w: 22, h: 18 };
    si_refreshCroquisSection();
  } else {
    el.scrollIntoView({ behavior:'smooth', block:'nearest' });
    el.classList.add('si-zone-highlight');
    setTimeout(() => el.classList.remove('si-zone-highlight'), 1200);
  }
  // Refresh side panel
  const panel = document.getElementById(`si-fp-side-panel-${si_storeId}`);
  if (panel) panel.innerHTML = si_renderZonePanel();
}

function si_autoPlaceUnlocatedZones() {
  const zones    = si_zones_forStore(si_storeId).filter(z => z.status === 'Activa');
  const unlocated= zones.filter(z => !z.layout && !_siLayoutDraft[z.id]);
  const cols     = Math.max(2, Math.ceil(Math.sqrt(unlocated.length)));
  const cellW    = Math.max(12, Math.floor(90 / cols));
  const startX   = 5;
  const startY   = 60;
  unlocated.forEach((z, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    _siLayoutDraft[z.id] = { x: startX + col*cellW, y: startY + row*18, w: cellW - 2, h: 14 };
  });
  si_refreshCroquisSection();
}

window.si_renderInteractiveCroquis = si_renderInteractiveCroquis;
window.si_toggleLayoutEditMode     = si_toggleLayoutEditMode;
window.si_saveLayout               = si_saveLayout;
window.si_cancelLayout             = si_cancelLayout;
window.si_autoArrangeZones         = si_autoArrangeZones;
window.si_resetLayout              = si_resetLayout;
window.si_centerView               = si_centerView;
window.si_onZoneMousedown          = si_onZoneMousedown;
window.si_onZoneTouchstart         = si_onZoneTouchstart;
window.si_onResizeMousedown        = si_onResizeMousedown;
window.si_onResizeTouchstart       = si_onResizeTouchstart;
window.si_onZoneClick              = si_onZoneClick;
window.si_toggleFloorPlanMode      = si_toggleFloorPlanMode;
window.si_saveFloorPlan            = si_saveFloorPlan;
window.si_cancelFloorPlan          = si_cancelFloorPlan;
window.si_clearFloorPlan           = si_clearFloorPlan;
window.si_setFloorPlanTool         = si_setFloorPlanTool;
window.si_onToolMousedown          = si_onToolMousedown;
window.si_onToolMousemove          = si_onToolMousemove;
window.si_onToolTouchstart         = si_onToolTouchstart;
window.si_addFloorElement          = si_addFloorElement;
window.si_deleteFloorElement       = si_deleteFloorElement;
window.si_centerZoneOnPlan         = si_centerZoneOnPlan;
window.si_autoPlaceUnlocatedZones  = si_autoPlaceUnlocatedZones;
window.SI_FLOOR_ELEMENTS           = SI_FLOOR_ELEMENTS;
window.si_toggleFlowEditMode       = si_toggleFlowEditMode;
window.si_saveCustomerFlow         = si_saveCustomerFlow;
window.si_cancelCustomerFlow       = si_cancelCustomerFlow;
window.si_clearCustomerFlow        = si_clearCustomerFlow;
window.si_addFlowPointFromClick    = si_addFlowPointFromClick;
window.si_renderCustomerFlowLayer  = si_renderCustomerFlowLayer;
window.si_renderFlowEditPanel      = si_renderFlowEditPanel;
window.si_selectFlowPoint          = si_selectFlowPoint;
window.si_updateFlowPointType      = si_updateFlowPointType;
window.si_updateFlowPointLabel     = si_updateFlowPointLabel;
window.si_deleteFlowPoint          = si_deleteFlowPoint;
window.si_showFlowTooltip          = si_showFlowTooltip;
window.SI_FLOW_TYPES               = SI_FLOW_TYPES;
window.si_getStoreCampaigns        = si_getStoreCampaigns;
window.si_getCampaignStatus        = si_getCampaignStatus;
window.si_getActiveCampaignsForZone= si_getActiveCampaignsForZone;
window.si_calculateCampaignKPIs    = si_calculateCampaignKPIs;
window.si_renderCampaignsSection   = si_renderCampaignsSection;
window.si_openCampaignModal        = si_openCampaignModal;
window.si_saveCampaign             = si_saveCampaign;
window.si_deleteCampaign           = si_deleteCampaign;
window.si_campFilterChange         = si_campFilterChange;
window.SI_CAMPAIGN_TIPOS           = SI_CAMPAIGN_TIPOS;
window.SI_CAMPAIGN_ESTADOS         = SI_CAMPAIGN_ESTADOS;
