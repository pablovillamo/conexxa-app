alert('SHOPIFY JS NUEVO CARGADO');
console.log('✅ integrations.js cargado correctamente');

let shopifyStates = {};
let openAccordions = new Set();
let lastAdminShopifyDashboardUserId = null;

/* =========================================================
   SHOPIFY CHECKLIST DATA
========================================================= */

const SHOPIFY_CATEGORIES = [
  {
    id: 'base',
    icon: '⚙️',
    name: '1. Configuración Base de Shopify',
    tasks: [
      'Configuración general de tienda',
      'Configuración moneda',
      'Configuración idioma',
      'Configuración impuestos',
      'Configuración checkout',
      'Configuración métodos de pago',
      'Configuración envíos',
      'Configuración dominio',
      'Configuración DNS',
      'Configuración correo corporativo',
      'Configuración políticas',
      'Configuración notificaciones'
    ]
  },

  {
    id: 'tech',
    icon: '🔧',
    name: '2. Optimizaciones Técnicas',
    tasks: [
      'Optimización velocidad',
      'Optimización mobile',
      'Optimización desktop',
      'Compresión imágenes WebP',
      'Activar lazy loading',
      'Minificar CSS',
      'Minificar JS',
      'Configurar redirects 301',
      'Activar SSL HTTPS',
      'Revisar errores 404',
      'Configurar sitemap XML',
      'Configurar robots.txt'
    ]
  },

  {
    id: 'structure',
    icon: '🏗️',
    name: '3. Estructura del Ecommerce',
    tasks: [
      'Home optimizada',
      'Colecciones organizadas',
      'Navegación clara',
      'Menú mobile',
      'Filtros colección',
      'Búsqueda funcional',
      'Ficha producto optimizada',
      'Carrito optimizado',
      'Checkout limpio'
    ]
  },

  {
    id: 'branding',
    icon: '🎨',
    name: '4. Diseño y Branding Shopify',
    tasks: [
      'Diseño responsive',
      'Paleta colores',
      'Tipografías',
      'Diseño banners',
      'Diseño colección',
      'Diseño producto',
      'Iconografía',
      'Consistencia visual',
      'Optimización UX',
      'Optimización UI',
      'Diseño conversión'
    ]
  },

  {
    id: 'products',
    icon: '📦',
    name: '5. Productos',
    tasks: [
      'SEO productos',
      'Títulos optimizados',
      'Descripciones optimizadas',
      'Imágenes optimizadas',
      'ALT imágenes',
      'Precios correctos',
      'Stock correcto',
      'Variantes correctas',
      'Colecciones correctas',
      'Cross selling'
    ]
  },

  {
    id: 'apps',
    icon: '🔌',
    name: '6. Apps e Integraciones',
    tasks: [
      'Google Analytics',
      'Google Search Console',
      'Meta Pixel',
      'Klaviyo',
      'WhatsApp',
      'Email marketing',
      'Apps reviews',
      'Apps upsells',
      'Apps automatización'
    ]
  }
];

/* =========================================================
   STORAGE
========================================================= */

function loadShopifyStates() {

  const saved =
    localStorage.getItem(
      'shopify_checklist_states'
    );

  shopifyStates =
    saved ? JSON.parse(saved) : {};
}

function saveShopifyStates() {

  localStorage.setItem(
    'shopify_checklist_states',
    JSON.stringify(shopifyStates)
  );
}

/* =========================================================
   KPI
========================================================= */

function updateShopifyKPIs() {

  const totalTasks =
    SHOPIFY_CATEGORIES.reduce(
      (acc, cat) => acc + cat.tasks.length,
      0
    );

  const done =
    Object.values(shopifyStates)
      .filter(v => v === 'done')
      .length;

  const pending =
    totalTasks - done;

  const pct =
    Math.round((done / totalTasks) * 100);

  const pctEl =
    document.getElementById(
      'shopify-progress-pct'
    );

  const pendingEl =
    document.getElementById(
      'shopify-pending-count'
    );

  const doneEl =
    document.getElementById(
      'shopify-done-count'
    );

  if (pctEl) pctEl.textContent = pct + '%';
  if (pendingEl) pendingEl.textContent = pending;
  if (doneEl) doneEl.textContent = done;
}

/* =========================================================
   TASK STATES
========================================================= */

function setShopifyState(
  catId,
  index,
  state,
  event
) {

  event.stopPropagation();

  shopifyStates[
    catId + '_' + index
  ] = state;

  saveShopifyStates();

  renderShopifyChecklist();
}

/* =========================================================
   ACCORDION
========================================================= */

function toggleShopifyCat(catId) {

  const el =
    document.getElementById(
      'tasks-' + catId
    );

  const chev =
    document.getElementById(
      'chev-' + catId
    );

  if (!el) return;

  el.classList.toggle('open');

  if (chev) {
    chev.classList.toggle('open');
  }

  if (el.classList.contains('open')) {
    openAccordions.add(catId);
  } else {
    openAccordions.delete(catId);
  }
}

/* =========================================================
   FILTER
========================================================= */

function filterShopifyTasks(value) {
  renderShopifyChecklist(value);
}

/* =========================================================
   ADMIN SHOPIFY DASHBOARD
========================================================= */

function ensureAdminShopifyDashboardLoaded() {

  const tab =
    document.getElementById('tab-shopify');

  if (!tab) return;

  if (!tab.classList.contains('active')) {
    return;
  }

  if (!selectedClientId) return;

  if (
    lastAdminShopifyDashboardUserId ===
    selectedClientId
  ) {
    return;
  }

  lastAdminShopifyDashboardUserId =
    selectedClientId;

  loadShopifyDashboard(
    selectedClientId,
    'admin'
  );
}

/* =========================================================
   CHECKLIST RENDER
========================================================= */

function renderShopifyChecklist(
  filterStr = ''
) {

  ensureAdminShopifyDashboardLoaded();

  loadShopifyStates();

  const container =
    document.getElementById(
      'shopify-checklist'
    );

  if (!container) return;

  SHOPIFY_CATEGORIES.forEach(cat => {

    const tasksEl =
      document.getElementById(
        'tasks-' + cat.id
      );

    if (
      tasksEl &&
      tasksEl.classList.contains('open')
    ) {
      openAccordions.add(cat.id);
    }
  });

  const categoriesHTML =
    SHOPIFY_CATEGORIES.map(cat => {

      const visibleTasks =
        cat.tasks
          .map((task, i) => ({ task, i }))
          .filter(({ task }) => {

            if (
              filterStr &&
              !task
                .toLowerCase()
                .includes(
                  filterStr.toLowerCase()
                )
            ) {
              return false;
            }

            return true;
          });

      const catDone =
        cat.tasks.filter(
          (_, i) =>
            shopifyStates[
              cat.id + '_' + i
            ] === 'done'
        ).length;

      const catTotal =
        cat.tasks.length;

      const catPct =
        Math.round(
          (catDone / catTotal) * 100
        );

      const isOpen =
        openAccordions.has(cat.id);

      return `
        <div class="shopify-category">

          <div
            class="shopify-cat-header"
            onclick="toggleShopifyCat('${cat.id}')"
          >

            <span style="font-size:18px;">
              ${cat.icon}
            </span>

            <span class="shopify-cat-title">
              ${cat.name}
            </span>

            <span class="shopify-cat-progress">
              ${catDone}/${catTotal}
            </span>

            <div class="shopify-cat-mini-bar">
              <div
                class="shopify-cat-mini-fill"
                style="width:${catPct}%"
              ></div>
            </div>

            <svg
              class="shopify-cat-chevron ${isOpen ? 'open' : ''}"
              viewBox="0 0 16 16"
              fill="none"
              id="chev-${cat.id}"
              style="width:14px;height:14px;color:var(--gray);"
            >
              <path
                d="M4 6l4 4 4-4"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>

          </div>

          <div
            class="shopify-tasks ${isOpen ? 'open' : ''}"
            id="tasks-${cat.id}"
          >

            ${
              visibleTasks.map(
                ({ task, i }) => {

                  const key =
                    cat.id + '_' + i;

                  const state =
                    shopifyStates[key] ||
                    'pending';

                  const rowStyle =
                    state === 'done'
                      ? 'text-decoration:line-through;color:var(--gray);'
                      : state === 'skip'
                        ? 'color:var(--red);opacity:.6;'
                        : '';

                  return `
                    <div class="shopify-task-row">

                      <div
                        class="shopify-task-name"
                        style="${rowStyle}"
                      >
                        ${task}
                      </div>

                      <button
                        class="task-state-btn task-state-done"
                        title="Completado"
                        onclick="setShopifyState('${cat.id}','${i}','done', event)"
                      >
                        ✅
                      </button>

                      <button
                        class="task-state-btn task-state-skip"
                        title="No necesario"
                        onclick="setShopifyState('${cat.id}','${i}','skip', event)"
                      >
                        ❌
                      </button>

                      <button
                        class="task-state-btn task-state-pending"
                        title="Pendiente"
                        onclick="setShopifyState('${cat.id}','${i}','pending', event)"
                      >
                        🟡
                      </button>

                    </div>
                  `;
                }
              ).join('')
            }

          </div>

        </div>
      `;
    }).join('');

  container.innerHTML =
    categoriesHTML;

  updateShopifyKPIs();
}

/* =========================================================
   CLIENT DASHBOARD
========================================================= */

function openShopifyMetrics() {

  showView('view-client-shopify');

  loadShopifyDashboard(
    currentUser?.id,
    'client'
  );
}

/* =========================================================
   LOAD DASHBOARD
========================================================= */

async function loadShopifyDashboard(
  userId,
  mode = 'client'
) {

  const section =
    getShopifyDashboardContainer(mode);

  if (!section) {
    console.warn(
      '[ShopifyDashboard] contenedor no encontrado:',
      mode
    );
    return;
  }

  if (!userId) {

    section.innerHTML = `
      <div style="
        background:var(--black-card);
        border:1px solid var(--border);
        border-radius:14px;
        padding:24px;
        color:var(--gray);
        font-size:13px;
      ">
        No se encontró el usuario/cliente.
      </div>
    `;

    return;
  }

  section.innerHTML = `
    <div style="
      font-size:13px;
      color:var(--gray);
      padding:12px 0;
    ">
      Cargando dashboard Shopify...
    </div>
  `;

  try {

    const {
      data: products,
      error
    } = await sb
      .from('shopify_products')
      .select('*')
      .eq('user_id', userId)
      .order('title', {
        ascending: true
      });

    if (error) throw error;

    renderShopifyDashboard(
      products || [],
      {
        userId,
        mode
      }
    );

  } catch (err) {

    console.error(
      '[ShopifyDashboard] error:',
      err
    );

    section.innerHTML = `
      <div style="
        background:rgba(239,68,68,.08);
        border:1px solid rgba(239,68,68,.25);
        border-radius:14px;
        padding:20px;
        color:#fca5a5;
        font-size:13px;
      ">
        Error cargando dashboard Shopify.
      </div>
    `;
  }
}

/* =========================================================
   DASHBOARD CONTAINER
========================================================= */

function getShopifyDashboardContainer(
  mode = 'client'
) {

  if (mode === 'admin') {
    return document.getElementById(
      'admin-shopify-dashboard'
    );
  }

  return document.getElementById(
    'client-shopify-dashboard'
  );
}

/* =========================================================
   DASHBOARD RENDER
========================================================= */

function renderShopifyDashboard(
  products = [],
  options = {}
) {

  const {
    mode = 'client'
  } = options;

  const container =
    getShopifyDashboardContainer(mode);

  if (!container) return;

  const totalProducts =
    products.length;

  const activeProducts =
    products.filter(
      p => p.status === 'active'
    ).length;

  const inventory =
    products.reduce(
      (acc, p) =>
        acc + (p.inventory || 0),
      0
    );

  const topProducts =
    products.slice(0, 6);

  container.innerHTML = `
    <div class="shopify-dashboard-grid">

      <div class="shopify-metric-card">
        <div class="shopify-metric-label">
          Productos
        </div>

        <div class="shopify-metric-value">
          ${totalProducts}
        </div>
      </div>

      <div class="shopify-metric-card">
        <div class="shopify-metric-label">
          Activos
        </div>

        <div class="shopify-metric-value">
          ${activeProducts}
        </div>
      </div>

      <div class="shopify-metric-card">
        <div class="shopify-metric-label">
          Inventario
        </div>

        <div class="shopify-metric-value">
          ${inventory}
        </div>
      </div>

    </div>

    <div class="shopify-products-grid">

      ${
        topProducts.map(product => {

          return `
            <div class="shopify-product-card">

              <div class="shopify-product-image">
                ${
                  product.image_src
                    ? `
                      <img
                        src="${product.image_src}"
                        alt="${product.title}"
                      />
                    `
                    : '📦'
                }
              </div>

              <div class="shopify-product-info">

                <div class="shopify-product-title">
                  ${product.title || 'Sin título'}
                </div>

                <div class="shopify-product-vendor">
                  ${product.vendor || ''}
                </div>

                <div class="shopify-product-price">
                  ₡${Number(
                    product.price || 0
                  ).toLocaleString()}
                </div>

              </div>

            </div>
          `;
        }).join('')
      }

    </div>
  `;
}

/* =========================================================
   GLOBALS
========================================================= */

window.renderShopifyChecklist =
  renderShopifyChecklist;

window.toggleShopifyCat =
  toggleShopifyCat;

window.filterShopifyTasks =
  filterShopifyTasks;

window.setShopifyState =
  setShopifyState;

window.openShopifyMetrics =
  openShopifyMetrics;

window.loadShopifyDashboard =
  loadShopifyDashboard;