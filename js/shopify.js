console.log("[Shopify] loaded");

let shopifyStates = {};
let openAccordions = new Set();
let lastAdminShopifyDashboardUserId = null;

const SHOPIFY_CATEGORIES = [
  { id:'base', icon:'⚙️', name:'1. Configuración Base de Shopify', tasks:[
    'Configuración general de tienda','Configuración moneda','Configuración idioma','Configuración impuestos','Configuración checkout','Configuración métodos de pago','Configuración envíos','Configuración dominio','Configuración DNS','Configuración correo corporativo','Configuración políticas','Configuración notificaciones'
  ]},
  { id:'tech', icon:'🔧', name:'2. Optimizaciones Técnicas', tasks:[
    'Optimización velocidad','Optimización mobile','Optimización desktop','Compresión imágenes WebP','Activar lazy loading','Minificar CSS','Minificar JS','Configurar redirects 301','Activar SSL HTTPS','Revisar errores 404','Configurar sitemap XML','Configurar robots.txt'
  ]},
  { id:'structure', icon:'🏗️', name:'3. Estructura del Ecommerce', tasks:[
    'Home optimizada','Colecciones organizadas','Navegación clara','Menú mobile','Filtros colección','Búsqueda funcional','Ficha producto optimizada','Carrito optimizado','Checkout limpio'
  ]},
  { id:'branding', icon:'🎨', name:'4. Diseño y Branding Shopify', tasks:[
    'Diseño responsive','Paleta colores','Tipografías','Diseño banners','Diseño colección','Diseño producto','Iconografía','Consistencia visual','Optimización UX','Optimización UI','Diseño conversión'
  ]},
  { id:'products', icon:'📦', name:'5. Productos', tasks:[
    'SEO productos','Títulos optimizados','Descripciones optimizadas','Imágenes optimizadas','ALT imágenes','Precios correctos','Stock correcto','Variantes correctas','Colecciones correctas','Cross selling'
  ]},
  { id:'apps', icon:'🔌', name:'6. Apps e Integraciones', tasks:[
    'Google Analytics','Google Search Console','Meta Pixel','Klaviyo','WhatsApp','Email marketing','Apps reviews','Apps upsells','Apps automatización'
  ]}
];

function loadShopifyStates() {
  const key = 'shopify_checklist_states_' + (selectedClientId || currentUser?.id || 'general');
  const saved = localStorage.getItem(key);
  shopifyStates = saved ? JSON.parse(saved) : {};
}

function saveShopifyStates() {
  const key = 'shopify_checklist_states_' + (selectedClientId || currentUser?.id || 'general');
  localStorage.setItem(key, JSON.stringify(shopifyStates));
}

function updateShopifyKPIs() {
  const totalTasks = SHOPIFY_CATEGORIES.reduce((acc, cat) => acc + cat.tasks.length, 0);
  const done = Object.values(shopifyStates).filter(v => v === 'done').length;
  const pending = totalTasks - done;
  const pct = totalTasks > 0 ? Math.round((done / totalTasks) * 100) : 0;

  const pctEl = document.getElementById('shopify-pct') || document.getElementById('shopify-progress-pct');
  const pendingEl = document.getElementById('shopify-pending') || document.getElementById('shopify-pending-count');
  const doneEl = document.getElementById('shopify-done') || document.getElementById('shopify-done-count');

  if (pctEl) pctEl.textContent = pct + '%';
  if (pendingEl) pendingEl.textContent = pending;
  if (doneEl) doneEl.textContent = done;
}

function setShopifyState(catId, index, state, event) {
  if (event) event.stopPropagation();
  shopifyStates[catId + '_' + index] = state;
  saveShopifyStates();
  renderShopifyChecklist();
}

function toggleShopifyCat(catId) {
  const el = document.getElementById('tasks-' + catId);
  const chev = document.getElementById('chev-' + catId);
  if (!el) return;

  el.classList.toggle('open');
  if (chev) chev.classList.toggle('open');

  if (el.classList.contains('open')) openAccordions.add(catId);
  else openAccordions.delete(catId);
}

function filterShopifyTasks(value) {
  renderShopifyChecklist(value);
}

function ensureAdminShopifyDashboardLoaded() {
  const tab = document.getElementById('tab-shopify');
  if (!tab || !tab.classList.contains('active')) return;
  if (!selectedClientId) return;

  if (lastAdminShopifyDashboardUserId === selectedClientId) return;
  lastAdminShopifyDashboardUserId = selectedClientId;

  loadShopifyDashboard(selectedClientId, 'admin');
}

function renderShopifyChecklist(filterStr = '') {
  loadShopifyStates();

  const container = document.getElementById('shopify-checklist');
  if (!container) return;

  ensureAdminShopifyDashboardLoaded();

  const categoriesHTML = SHOPIFY_CATEGORIES.map(cat => {
    const visibleTasks = cat.tasks
      .map((task, i) => ({ task, i }))
      .filter(({ task }) => !filterStr || task.toLowerCase().includes(filterStr.toLowerCase()));

    const catDone = cat.tasks.filter((_, i) => shopifyStates[cat.id + '_' + i] === 'done').length;
    const catTotal = cat.tasks.length;
    const catPct = Math.round((catDone / catTotal) * 100);
    const isOpen = openAccordions.has(cat.id);

    return `
      <div class="shopify-category">
        <div class="shopify-cat-header" onclick="toggleShopifyCat('${cat.id}')">
          <span style="font-size:18px;">${cat.icon}</span>
          <span class="shopify-cat-title">${cat.name}</span>
          <span class="shopify-cat-progress">${catDone}/${catTotal}</span>
          <div class="shopify-cat-mini-bar">
            <div class="shopify-cat-mini-fill" style="width:${catPct}%"></div>
          </div>
          <svg class="shopify-cat-chevron ${isOpen ? 'open' : ''}" viewBox="0 0 16 16" fill="none" id="chev-${cat.id}" style="width:14px;height:14px;color:var(--gray);">
            <path d="M4 6l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>

        <div class="shopify-tasks ${isOpen ? 'open' : ''}" id="tasks-${cat.id}">
          ${visibleTasks.map(({ task, i }) => {
            const key = cat.id + '_' + i;
            const state = shopifyStates[key] || 'pending';
            const rowStyle = state === 'done'
              ? 'text-decoration:line-through;color:var(--gray);'
              : state === 'skip'
                ? 'color:var(--red);opacity:.6;'
                : '';

            return `
              <div class="shopify-task-row">
                <div class="shopify-task-name" style="${rowStyle}">${task}</div>
                <button class="task-state-btn task-state-done" title="Completado" onclick="setShopifyState('${cat.id}','${i}','done', event)">✅</button>
                <button class="task-state-btn task-state-skip" title="No necesario" onclick="setShopifyState('${cat.id}','${i}','skip', event)">❌</button>
                <button class="task-state-btn task-state-pending" title="Pendiente" onclick="setShopifyState('${cat.id}','${i}','pending', event)">🟡</button>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }).join('');

  container.innerHTML = categoriesHTML;
  updateShopifyKPIs();
}

function openShopifyMetrics() {
  showView('view-client-shopify');
  loadShopifyDashboard(currentUser?.id, 'client');
}

async function loadShopifyDashboard(userId, mode = 'client') {
  const section = getShopifyDashboardContainer(mode);

  if (!section) {
    console.warn('[ShopifyDashboard] contenedor no encontrado:', mode);
    return;
  }

  if (!userId) {
    section.innerHTML = `
      <div style="background:var(--black-card);border:1px solid var(--border);border-radius:14px;padding:24px;color:var(--gray);font-size:13px;">
        No se encontró el usuario/cliente.
      </div>
    `;
    return;
  }

  section.innerHTML = `
    <div style="font-size:13px;color:var(--gray);padding:12px 0;">
      Cargando dashboard Shopify...
    </div>
  `;

  try {
    const { data: products, error: productsError } = await sb
      .from('shopify_products')
      .select('*')
      .eq('user_id', userId)
      .order('title', { ascending: true });

    if (productsError) throw productsError;

    const { data: orders, error: ordersError } = await sb
      .from('shopify_orders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at_shopify', { ascending: false });

    if (ordersError) throw ordersError;

    renderShopifyDashboard(products || [], {
      userId,
      mode,
      orders: orders || []
    });

  } catch (err) {
    console.error('[ShopifyDashboard] error:', err);

    section.innerHTML = `
      <div style="background:rgba(239,68,68,.08);border:1px solid rgba(239,68,68,.25);border-radius:14px;padding:20px;color:#fca5a5;font-size:13px;">
        Error cargando dashboard Shopify.
      </div>
    `;
  }
}
function getShopifyDashboardContainer(mode = 'client') {
  if (mode === 'admin') {
    let adminContainer = document.getElementById('admin-shopify-dashboard');

    if (!adminContainer) {
      const tab = document.getElementById('tab-shopify');
      if (!tab) return null;

      tab.insertAdjacentHTML(
        'afterbegin',
        `<div id="admin-shopify-dashboard" style="margin-bottom:28px;"></div>`
      );

      adminContainer = document.getElementById('admin-shopify-dashboard');
    }

    return adminContainer;
  }

  let clientContainer =
    document.getElementById('shopify-products-section') ||
    document.getElementById('client-shopify-dashboard');

  return clientContainer;
}

function renderShopifyDashboard(products = [], options = {}) {
  const { mode = 'client', orders = [] } = options;

  const container = getShopifyDashboardContainer(mode);
  if (!container) return;

  const totalProducts = products.length;

  const activeProducts = products.filter(
    p => (p.status || '').toLowerCase() === 'active'
  ).length;

  const draftProducts = products.filter(
    p => (p.status || '').toLowerCase() === 'draft'
  ).length;

  const inventory = products.reduce((acc, p) => {
    return acc + Number(p.inventory_quantity || p.inventory || 0);
  }, 0);

  const outOfStock = products.filter(
    p => Number(p.inventory_quantity || p.inventory || 0) <= 0
  ).length;

  const withoutImage = products.filter(
    p => !(p.image_url || p.image || p.image_src)
  ).length;

  const totalOrders = orders.length;

  const paidOrders = orders.filter(order => {
    const status = (order.financial_status || '').toLowerCase();
    return status === 'paid' || status === 'partially_paid';
  });

  const totalSales = paidOrders.reduce((sum, order) => {
    return sum + Number(order.total_price || 0);
  }, 0);

  const avgTicket = paidOrders.length > 0
    ? totalSales / paidOrders.length
    : 0;

  const refundedOrders = orders.filter(order => {
    return (order.financial_status || '').toLowerCase() === 'refunded';
  }).length;

  const fulfilledOrders = orders.filter(order => {
    return (order.fulfillment_status || '').toLowerCase() === 'fulfilled';
  }).length;

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const sales7Days = paidOrders
    .filter(order =>
      order.created_at_shopify &&
      new Date(order.created_at_shopify) >= sevenDaysAgo
    )
    .reduce((sum, order) =>
      sum + Number(order.total_price || 0), 0);

  const sales30Days = paidOrders
    .filter(order =>
      order.created_at_shopify &&
      new Date(order.created_at_shopify) >= thirtyDaysAgo
    )
    .reduce((sum, order) =>
      sum + Number(order.total_price || 0), 0);

  const pendingOrders = orders.filter(order => {
    const status = (order.financial_status || '').toLowerCase();

    return (
      status !== 'paid' &&
      status !== 'partially_paid' &&
      status !== 'refunded'
    );
  }).length;

  const topProducts = products.slice(0, mode === 'admin' ? 6 : 24);

  if (totalProducts === 0 && totalOrders === 0) {
    container.innerHTML = `
      <div style="background:var(--black-card);border:1px solid var(--border);border-radius:14px;padding:24px;color:var(--gray);font-size:13px;margin-bottom:20px;">
        No hay datos Shopify sincronizados todavía.
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div style="background:var(--black-card);border:1px solid var(--border);border-radius:18px;padding:22px;margin-bottom:24px;">
      <div style="display:flex;justify-content:space-between;gap:16px;align-items:flex-start;flex-wrap:wrap;margin-bottom:18px;">
        <div>
          <div style="font-size:12px;font-family:'DM Mono',monospace;letter-spacing:.08em;text-transform:uppercase;color:var(--green);margin-bottom:6px;">
            Shopify Metrics Engine
          </div>

          <h3 style="margin:0;font-size:20px;">
            ${mode === 'admin' ? 'Mini dashboard Shopify del cliente' : 'Dashboard Shopify'}
          </h3>

          <p style="margin:6px 0 0;color:var(--gray);font-size:13px;">
            Ventas, pedidos, productos e insights sincronizados desde Shopify.
          </p>
        </div>

        <div style="font-size:12px;color:var(--gray);font-family:'DM Mono',monospace;">
          ${totalProducts} productos · ${totalOrders} pedidos
        </div>
      </div>

      <div class="metrics-preview-grid" style="margin-bottom:20px;">
        ${renderShopifyMetricCard('VENTAS TOTALES', formatMoney(totalSales), `${paidOrders.length} pedidos pagados`)}
        ${renderShopifyMetricCard('VENTAS 7 DÍAS', formatMoney(sales7Days), 'Última semana')}
        ${renderShopifyMetricCard('VENTAS 30 DÍAS', formatMoney(sales30Days), 'Últimos 30 días')}
        ${renderShopifyMetricCard('PEDIDOS', totalOrders, `${fulfilledOrders} entregados`)}
        ${renderShopifyMetricCard('PENDIENTES', pendingOrders, 'Pago pendiente')}
        ${renderShopifyMetricCard('TICKET PROM.', formatMoney(avgTicket), 'Promedio por pedido')}
        ${renderShopifyMetricCard('PRODUCTOS', totalProducts, `${activeProducts} activos`)}
        ${renderShopifyMetricCard('INVENTARIO', inventory, `${outOfStock} sin stock`)}
        ${renderShopifyMetricCard('SIN IMAGEN', withoutImage, 'Revisar SEO visual')}
      </div>

      <div style="background:rgba(34,197,94,.08);border:1px solid rgba(34,197,94,.22);border-radius:14px;padding:16px;margin-bottom:20px;">
        <div style="font-size:12px;font-family:'DM Mono',monospace;letter-spacing:.08em;text-transform:uppercase;color:var(--green);margin-bottom:10px;">
          Insights iniciales
        </div>

        <div style="display:grid;gap:8px;">
          ${totalSales > 0
            ? renderInsightLine(`La tienda registra ${formatMoney(totalSales)} en ventas pagadas sincronizadas.`)
            : renderInsightLine('Aún no se detectan ventas pagadas sincronizadas.')}

          ${sales7Days > 0
            ? renderInsightLine(`En los últimos 7 días se registran ${formatMoney(sales7Days)} en ventas.`)
            : renderInsightLine('No se detectan ventas pagadas en los últimos 7 días.')}

          ${sales30Days > 0
            ? renderInsightLine(`En los últimos 30 días se registran ${formatMoney(sales30Days)} en ventas.`)
            : renderInsightLine('No se detectan ventas pagadas en los últimos 30 días.')}

          ${avgTicket > 0
            ? renderInsightLine(`El ticket promedio actual es de ${formatMoney(avgTicket)}.`)
            : renderInsightLine('El ticket promedio aparecerá cuando existan pedidos pagados.')}

          ${withoutImage > 0
            ? renderInsightLine(`Hay ${withoutImage} productos sin imagen. Esto puede afectar confianza, SEO y conversión.`)
            : renderInsightLine('Todos los productos tienen imagen principal.')}

          ${outOfStock > 0
            ? renderInsightLine(`Hay ${outOfStock} productos sin stock. Revisar si son productos estratégicos.`)
            : renderInsightLine('No se detectan productos sin stock.')}

          ${refundedOrders > 0
            ? renderInsightLine(`Hay ${refundedOrders} pedidos reembolsados. Revisar causas de devolución o cancelación.`)
            : renderInsightLine('No se detectan pedidos reembolsados en esta sincronización.')}
        </div>
      </div>

      <div class="sp-header">
        <div class="sp-header-title">Productos sincronizados</div>
        <div class="sp-header-counts">
          <span>${totalProducts} total</span>
          <span style="color:#22C55E;">${activeProducts} activos</span>
        </div>
      </div>

      <div class="sp-grid">
        ${topProducts.map(renderShopifyProductCard).join('')}
      </div>
    </div>
  `;
}
function renderShopifyMetricCard(label, value, sub) {
  return `
    <div class="metric-preview-card">
      <div class="metric-preview-label">${label}</div>
      <div class="metric-preview-val">${value}</div>
      <div class="metric-preview-trend" style="color:var(--gray);">${sub}</div>
    </div>
  `;
}

function renderInsightLine(text) {
  return `
    <div style="padding:10px 14px;background:rgba(0,0,0,.22);border-radius:10px;font-size:13px;color:#86EFAC;">
      ${text}
    </div>
  `;
}

function renderShopifyProductCard(product) {
  const img = product.image_url || product.image || product.image_src || '';
  const title = product.title || 'Sin título';
  const vendor = product.vendor || '—';
  const price = product.price != null ? formatMoney(product.price) : '—';
  const inventory = product.inventory_quantity ?? product.inventory ?? '—';
  const status = (product.status || 'unknown').toLowerCase();
  const statusColor = status === 'active' ? '#22C55E' : status === 'draft' ? '#F59E0B' : '#888780';

  return `
    <div class="sp-card">
      <div class="sp-card-img">
        ${
          img
            ? `<img src="${img}" alt="${title}" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';"><div class="sp-card-img-fallback" style="display:none;">📦</div>`
            : `<div class="sp-card-img-fallback">📦</div>`
        }
      </div>
      <div class="sp-card-body">
        <div class="sp-card-title">${title}</div>
        <div class="sp-card-vendor">${vendor}</div>
        <div class="sp-card-meta">
          <span class="sp-card-price">${price}</span>
          <span class="sp-card-inventory">Stock: ${inventory}</span>
          <span class="sp-card-status" style="color:${statusColor};">● ${status}</span>
        </div>
      </div>
    </div>
  `;
}

function formatMoney(value) {
  const amount = Number(value || 0);

  return new Intl.NumberFormat('es-CR', {
    style: 'currency',
    currency: 'CRC',
    maximumFractionDigits: 0
  }).format(amount);
}

async function loadShopifyProducts(userId) {
  return loadShopifyDashboard(userId || currentUser?.id, 'client');
}

function renderShopifyProducts(products) {
  return renderShopifyDashboard(products, { mode: 'client' });
}

window.renderShopifyChecklist = renderShopifyChecklist;
window.toggleShopifyCat = toggleShopifyCat;
window.filterShopifyTasks = filterShopifyTasks;
window.setShopifyState = setShopifyState;
window.openShopifyMetrics = openShopifyMetrics;
window.loadShopifyDashboard = loadShopifyDashboard;
window.renderShopifyDashboard = renderShopifyDashboard;
window.loadShopifyProducts = loadShopifyProducts;
window.renderShopifyProducts = renderShopifyProducts;