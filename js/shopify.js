console.log("[Shopify] loaded");

// ============================================================
// SHOPIFY CHECKLIST — VERSIÓN MEJORADA
// ============================================================
const SHOPIFY_CATEGORIES = [
  { id:'config', name:'1. Configuración Base de Shopify', icon:'⚙️', tasks:[
    'Configurar nombre de la tienda y URL',
    'Conectar dominio personalizado (DNS)',
    'Configurar moneda y región',
    'Configurar idioma de la tienda',
    'Configurar zonas de envío',
    'Configurar métodos de pago (Stripe, PayPal, etc.)',
    'Configurar impuestos por región',
    'Configurar correos transaccionales (SMTP)',
    'Configurar política de devoluciones',
    'Configurar política de privacidad',
    'Configurar términos y condiciones',
    'Configurar notificaciones de pedido',
  ]},
  { id:'tecnico', name:'2. Optimizaciones Técnicas', icon:'🔧', tasks:[
    'Instalar Google Analytics 4',
    'Instalar Meta Pixel',
    'Configurar Google Search Console',
    'Optimizar velocidad de carga (PageSpeed)',
    'Comprimir imágenes (WebP)',
    'Activar lazy loading',
    'Minificar CSS y JS',
    'Configurar redirects 301',
    'Activar SSL / HTTPS',
    'Revisar errores 404',
    'Configurar sitemap XML',
    'Configurar robots.txt',
  ]},
  { id:'estructura', name:'3. Estructura del Ecommerce', icon:'🏗️', tasks:[
    'Crear colecciones principales',
    'Crear menú de navegación',
    'Configurar búsqueda interna',
    'Crear página About / Historia de marca',
    'Crear FAQ / Preguntas frecuentes',
    'Crear página de contacto',
    'Crear blog (si aplica)',
    'Configurar filtros de colección',
    'Crear páginas de categorías optimizadas',
  ]},
  { id:'diseno', name:'4. Diseño y Branding Shopify', icon:'🎨', tasks:[
    'Seleccionar e instalar tema',
    'Configurar colores de marca',
    'Configurar tipografías',
    'Subir logo en alta resolución',
    'Diseñar hero / banner principal',
    'Diseñar sección de categorías',
    'Diseñar sección de testimonios',
    'Diseñar sección de marcas / trust badges',
    'Diseñar footer profesional',
    'Optimizar diseño mobile',
    'Agregar animaciones sutiles',
  ]},
  { id:'productos', name:'5. Productos', icon:'📦', tasks:[
    'Crear fichas de producto completas',
    'Optimizar títulos SEO de productos',
    'Optimizar descripciones (storytelling + SEO)',
    'Subir imágenes de alta calidad',
    'Agregar variantes (talla, color, etc.)',
    'Configurar precios y comparar precios',
    'Configurar SKUs e inventario',
    'Crear productos relacionados / upsell',
    'Agregar reseñas / social proof',
    'Configurar metafields de producto',
  ]},
  { id:'apps', name:'6. Apps e Integraciones', icon:'🔌', tasks:[
    'Instalar app de reseñas (Judge.me / Loox)',
    'Instalar app de email marketing (Klaviyo)',
    'Instalar app de recuperación de carrito',
    'Instalar app de popups y captura de leads',
    'Instalar app de chat / soporte',
    'Instalar app de suscripciones (si aplica)',
    'Instalar app de bundle / paquetes',
    'Configurar ManyChat + Shopify',
    'Configurar Zapier / Make automations',
  ]},
  { id:'operacion', name:'7. Operación Shopify', icon:'🚀', tasks:[
    'Capacitar al equipo en gestión de pedidos',
    'Configurar alertas de stock bajo',
    'Crear flujo de fulfillment',
    'Configurar reportes automáticos',
    'Crear SOP de atención al cliente',
    'Configurar devoluciones y reembolsos',
    'Crear calendario editorial de contenido',
    'Configurar backup automático',
  ]},
];

let shopifyStates = {};    // key -> 'done'|'skip'|'pending'
let shopifyNotes = {};     // key -> string
let openAccordions = new Set(); // set de catId abiertos

function getShopifyKey() { return 'shopify_' + (selectedClientId || 'unknown'); }
function getShopifyNotesKey() { return 'shopify_notes_' + (selectedClientId || 'unknown'); }

function loadShopifyStates() {
  try {
    const saved = localStorage.getItem(getShopifyKey());
    shopifyStates = saved ? JSON.parse(saved) : {};
  } catch(e) { shopifyStates = {}; }
  try {
    const savedNotes = localStorage.getItem(getShopifyNotesKey());
    shopifyNotes = savedNotes ? JSON.parse(savedNotes) : {};
  } catch(e) { shopifyNotes = {}; }
}

function saveShopifyStates() {
  localStorage.setItem(getShopifyKey(), JSON.stringify(shopifyStates));
  localStorage.setItem(getShopifyNotesKey(), JSON.stringify(shopifyNotes));
  updateShopifyKPIs();
}

function updateShopifyKPIs() {
  let total = 0, done = 0, pendingCount = 0;
  SHOPIFY_CATEGORIES.forEach(cat => {
    cat.tasks.forEach((_, i) => {
      const key = cat.id + '_' + i;
      const state = shopifyStates[key] || 'pending';
      // Solo cuenta en total las que NO son skip
      if (state !== 'skip') {
        total++;
        if (state === 'done') done++;
        else if (state === 'pending') pendingCount++;
      }
    });
  });
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  const pctEl = document.getElementById('shopify-pct');
  const pendEl = document.getElementById('shopify-pending');
  const doneEl = document.getElementById('shopify-done');
  if(pctEl) pctEl.textContent = pct + '%';
  if(pendEl) pendEl.textContent = pendingCount;
  if(doneEl) { doneEl.textContent = done; doneEl.style.color = done > 0 ? '#818CF8' : 'var(--gray)'; }
}

function renderShopifyChecklist(filterStr = '') {
  loadShopifyStates();
  const container = document.getElementById('shopify-checklist');
  if (!container) return;

  // Recoger los acordeones abiertos actualmente en el DOM antes de re-renderizar
  SHOPIFY_CATEGORIES.forEach(cat => {
    const tasksEl = document.getElementById('tasks-' + cat.id);
    if (tasksEl && tasksEl.classList.contains('open')) {
      openAccordions.add(cat.id);
    }
  });

  // Renderizar categorías (sin tareas pendientes)
  const categoriesHTML = SHOPIFY_CATEGORIES.map(cat => {
    // Filtrar tareas visibles (no-pendientes) que coincidan con el filtro
    const visibleTasks = cat.tasks
      .map((task, i) => ({ task, i }))
      .filter(({ task, i }) => {
        const state = shopifyStates[cat.id + '_' + i] || 'pending';
        // No mostrar 'pending' en la lista principal
        if (state === 'pending') return false;
        // Aplicar filtro de búsqueda
        if (filterStr && !task.toLowerCase().includes(filterStr.toLowerCase())) return false;
        return true;
      });

    // Para los contadores del header usar TODAS las tareas de la categoría
    const catDone = cat.tasks.filter((_, i) => shopifyStates[cat.id + '_' + i] === 'done').length;
    const catTotal = cat.tasks.length;
    const catPct = Math.round((catDone / catTotal) * 100);
    const isOpen = openAccordions.has(cat.id);

    return `<div class="shopify-category">
      <div class="shopify-cat-header" onclick="toggleShopifyCat('${cat.id}')">
        <span style="font-size:18px;">${cat.icon}</span>
        <span class="shopify-cat-title">${cat.name}</span>
        <span class="shopify-cat-progress">${catDone}/${catTotal}</span>
        <div class="shopify-cat-mini-bar"><div class="shopify-cat-mini-fill" style="width:${catPct}%"></div></div>
        <svg class="shopify-cat-chevron ${isOpen ? 'open' : ''}" viewBox="0 0 16 16" fill="none" id="chev-${cat.id}" style="width:14px;height:14px;color:var(--gray);"><path d="M4 6l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </div>
      <div class="shopify-tasks ${isOpen ? 'open' : ''}" id="tasks-${cat.id}">
        ${visibleTasks.length === 0 && !filterStr
          ? `<div style="padding:10px 12px;font-size:12px;color:var(--gray);font-style:italic;">Todas las tareas de esta sección están completadas, omitidas o en pendientes.</div>`
          : visibleTasks.map(({ task, i }) => {
              const key = cat.id + '_' + i;
              const state = shopifyStates[key] || 'pending';
              // state aquí solo puede ser 'done' o 'skip'
              const rowStyle = state === 'done'
                ? 'text-decoration:line-through;color:var(--gray);'
                : state === 'skip'
                  ? 'color:var(--red);opacity:.6;'
                  : '';
              return `<div class="shopify-task-row">
                <div class="shopify-task-name" style="${rowStyle}">${task}</div>
                <button class="task-state-btn task-state-done" title="Completado" onclick="setShopifyState('${cat.id}','${i}','done', event)">✅</button>
                <button class="task-state-btn task-state-skip" title="No necesario" onclick="setShopifyState('${cat.id}','${i}','skip', event)">❌</button>
                <button class="task-state-btn task-state-pending" title="Marcar como pendiente" onclick="setShopifyState('${cat.id}','${i}','pending', event)">🟡</button>
              </div>`;
            }).join('')
        }
      </div>
    </div>`;
  }).join('');

  // Renderizar bloque de tareas pendientes
  const pendingItems = [];
  SHOPIFY_CATEGORIES.forEach(cat => {
    cat.tasks.forEach((task, i) => {
      const key = cat.id + '_' + i;
      const state = shopifyStates[key] || 'pending';
      if (state === 'pending') {
        if (!filterStr || task.toLowerCase().includes(filterStr.toLowerCase())) {
          pendingItems.push({ catId: cat.id, catName: cat.name, catIcon: cat.icon, task, i, key });
        }
      }
    });
  });

  let pendingBlockHTML = '';
  if (pendingItems.length > 0 || !filterStr) {
    const itemsHTML = pendingItems.length === 0
      ? `<div class="shopify-pending-empty">No hay tareas en pendientes.</div>`
      : pendingItems.map(({ catId, catName, catIcon, task, i, key }) => {
          const savedNote = shopifyNotes[key] || '';
          return `<div class="shopify-pending-item">
            <div class="shopify-pending-item-top">
              <span class="shopify-pending-item-cat">${catIcon} ${catName.split('. ')[1] || catName}</span>
              <span class="shopify-pending-item-name">${task}</span>
              <div class="shopify-pending-item-actions">
                <button class="task-state-btn task-state-done" title="Marcar como completada" onclick="setShopifyState('${catId}','${i}','done', event)">✅</button>
                <button class="task-state-btn task-state-skip" title="No necesario" onclick="setShopifyState('${catId}','${i}','skip', event)">❌</button>
              </div>
            </div>
            <div class="shopify-pending-note-wrap">
              <textarea
                class="shopify-pending-note"
                id="note-${key}"
                placeholder="Añade una nota... Ej: Falta acceso a GoDaddy del cliente"
                rows="2"
                onblur="autoSaveNote('${key}')"
              >${savedNote}</textarea>
              <div style="display:flex;flex-direction:column;align-items:flex-end;gap:4px;">
                <button class="btn-save-note" onclick="saveShopifyNote('${key}')">Guardar nota</button>
                <span class="shopify-pending-note-saved" id="saved-${key}">✓ Guardado</span>
              </div>
            </div>
          </div>`;
        }).join('');

    pendingBlockHTML = `
      <div class="shopify-pending-block">
        <div class="shopify-pending-block-header">
          <span style="font-size:20px;">🟡</span>
          <span class="shopify-pending-block-title">Tareas Pendientes</span>
          <span class="shopify-pending-count">${pendingItems.length} tarea${pendingItems.length !== 1 ? 's' : ''}</span>
        </div>
        ${itemsHTML}
      </div>
    `;
  }

  container.innerHTML = categoriesHTML + pendingBlockHTML;
  updateShopifyKPIs();
}

/**
 * TOGGLE ACORDEÓN — Solo abre/cierra, sin re-renderizar todo.
 * Esto garantiza que al hacer click en el header, el acordeón
 * no se cierre por el re-renderizado de setShopifyState.
 */
function toggleShopifyCat(catId) {
  const tasksEl = document.getElementById('tasks-' + catId);
  const chevEl = document.getElementById('chev-' + catId);
  if (!tasksEl) return;
  const isOpen = tasksEl.classList.contains('open');
  if (isOpen) {
    tasksEl.classList.remove('open');
    if (chevEl) chevEl.classList.remove('open');
    openAccordions.delete(catId);
  } else {
    tasksEl.classList.add('open');
    if (chevEl) chevEl.classList.add('open');
    openAccordions.add(catId);
  }
}

/**
 * CAMBIAR ESTADO DE TAREA
 * Guarda el estado y re-renderiza preservando acordeones abiertos.
 * event.stopPropagation() evita que el click llegue al header del acordeón.
 */
function setShopifyState(catId, taskIdx, state, event) {
  if (event) event.stopPropagation();

  // Antes de re-renderizar, leer qué acordeones están abiertos en el DOM actual
  SHOPIFY_CATEGORIES.forEach(cat => {
    const el = document.getElementById('tasks-' + cat.id);
    if (el && el.classList.contains('open')) {
      openAccordions.add(cat.id);
    } else if (el && !el.classList.contains('open')) {
      // Solo quitar si está explícitamente cerrado (no si no existe aún)
      // Conservamos el que está en openAccordions si no está en DOM aún
    }
  });

  const key = catId + '_' + taskIdx;
  shopifyStates[key] = state;
  saveShopifyStates();

  // Re-renderizar conservando la búsqueda activa
  const searchInput = document.querySelector('#tab-shopify .search-input');
  const filterStr = searchInput ? searchInput.value : '';
  renderShopifyChecklist(filterStr);
}

function saveShopifyNote(key) {
  const textarea = document.getElementById('note-' + key);
  if (!textarea) return;
  shopifyNotes[key] = textarea.value.trim();
  localStorage.setItem(getShopifyNotesKey(), JSON.stringify(shopifyNotes));
  const savedEl = document.getElementById('saved-' + key);
  if (savedEl) {
    savedEl.classList.add('visible');
    setTimeout(() => savedEl.classList.remove('visible'), 2000);
  }
}

function autoSaveNote(key) {
  saveShopifyNote(key);
}

function filterShopifyTasks(val) {
  renderShopifyChecklist(val);
}

// ============================================================
// SHOPIFY PRODUCTS DASHBOARD
// ============================================================

function openShopifyMetrics() {
  showView('view-client-shopify');
  loadShopifyProducts();
}

async function loadShopifyProducts() {
  const section = document.getElementById('shopify-products-section');
  if (!section) return;

  section.innerHTML = `<div style="font-size:13px;color:var(--gray);padding:12px 0;">Cargando productos...</div>`;

  try {
    const { data: { session } } = await sb.auth.getSession();
    if (!session?.user) { section.innerHTML = ''; return; }

    const { data: products, error } = await sb
      .from('shopify_products')
      .select('*')
      .eq('user_id', session.user.id)
      .order('title', { ascending: true });

    if (error) throw error;
    renderShopifyProducts(products || []);
  } catch (err) {
    console.error('[ShopifyProducts] error:', err);
    const section = document.getElementById('shopify-products-section');
    if (section) section.innerHTML = `<div style="font-size:13px;color:var(--red);padding:12px 0;">Error cargando productos.</div>`;
  }
}

function renderShopifyProducts(products) {
  const section = document.getElementById('shopify-products-section');
  if (!section) return;

  const total = products.length;
  const active = products.filter(p => (p.status || '').toLowerCase() === 'active').length;

  if (total === 0) {
    section.innerHTML = `
      <div style="background:var(--black-card);border:1px solid var(--border);border-radius:14px;padding:32px;text-align:center;color:var(--gray);font-size:14px;">
        No hay productos sincronizados todavía.
      </div>`;
    return;
  }

  const cardsHTML = products.map(p => {
    const img = p.image_url || p.image || '';
    const title = p.title || 'Sin título';
    const vendor = p.vendor || '—';
    const price = p.price != null ? `$${parseFloat(p.price).toFixed(2)}` : '—';
    const inventory = p.inventory_quantity != null ? p.inventory_quantity : '—';
    const status = (p.status || 'unknown').toLowerCase();
    const statusColor = status === 'active' ? '#22C55E' : status === 'draft' ? '#F59E0B' : '#888780';
    const statusLabel = status === 'active' ? 'Activo' : status === 'draft' ? 'Borrador' : status;

    return `
      <div class="sp-card">
        <div class="sp-card-img">
          ${img
            ? `<img src="${img}" alt="${title}" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';" /><div class="sp-card-img-fallback" style="display:none;">📦</div>`
            : `<div class="sp-card-img-fallback">📦</div>`}
        </div>
        <div class="sp-card-body">
          <div class="sp-card-title">${title}</div>
          <div class="sp-card-vendor">${vendor}</div>
          <div class="sp-card-meta">
            <span class="sp-card-price">${price}</span>
            <span class="sp-card-inventory">Stock: ${inventory}</span>
            <span class="sp-card-status" style="color:${statusColor};">● ${statusLabel}</span>
          </div>
        </div>
      </div>`;
  }).join('');

  section.innerHTML = `
    <div class="sp-header">
      <div class="sp-header-title">Productos sincronizados</div>
      <div class="sp-header-counts">
        <span>${total} total</span>
        <span style="color:#22C55E;">${active} activos</span>
      </div>
    </div>
    <div class="sp-grid">${cardsHTML}</div>`;
}

window.openShopifyMetrics = openShopifyMetrics;
window.loadShopifyProducts = loadShopifyProducts;
window.renderShopifyProducts = renderShopifyProducts;
