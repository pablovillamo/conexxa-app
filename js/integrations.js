console.log("✅ integrations.js cargado correctamente");

const SHOPIFY_EDGE_FUNCTION_URL =
  "https://crgtdkbobxfbiicuxrfj.supabase.co/functions/v1/shopify-test";

const SHOPIFY_SYNC_PRODUCTS_URL =
  "https://crgtdkbobxfbiicuxrfj.supabase.co/functions/v1/shopify-sync-products";

function renderIntegrationsModule() {
  const root = document.getElementById("integrations-root");

  if (!root) {
    console.error("❌ integrations-root no encontrado");
    return;
  }

  root.innerHTML = `
    <section class="integrations-page">
      <div class="integrations-header">
        <p class="section-kicker">Integraciones</p>

        <h1>Conexiones Ecommerce</h1>

        <p class="section-description">
          Conectá herramientas externas para convertir el tracker
          en un sistema operativo ecommerce.
        </p>
      </div>

      <div class="integrations-grid">

        <article class="integration-card">

          <div class="integration-card-header">
            <div>
              <span class="integration-badge disconnected">
                Desconectado
              </span>

              <h2>Shopify</h2>

              <p>
                Conectá una tienda Shopify para sincronizar ventas,
                productos, clientes y métricas.
              </p>
            </div>
          </div>

          <div class="integration-info">

            <div>
              <span>Dominio</span>
              <strong class="shopify-domain">
                No conectado
              </strong>
            </div>

            <div>
              <span>Última sincronización</span>
              <strong class="shopify-sync">
                Sin sincronizar
              </strong>
            </div>

            <div>
              <span>Estado</span>
              <strong class="shopify-state">
                Esperando conexión
              </strong>
            </div>

          </div>

          <div class="integration-actions">

            <button
              class="btn-primary"
              onclick="openShopifyConnectionModal()"
            >
              Conectar Shopify
            </button>

            <button
              class="btn-secondary"
              onclick="syncShopifyProducts()"
            >
              Sincronizar productos
            </button>

          </div>

        </article>

      </div>
    </section>
  `;
}

function openIntegrationsView() {
  showView("view-client-integrations");

  setTimeout(() => {
    renderIntegrationsModule();
  }, 50);
}

function openShopifyConnectionModal() {
  const existing = document.getElementById("shopifyModal");

  if (existing) existing.remove();

  const modal = `
    <div class="shopify-modal-overlay" id="shopifyModal">

      <div class="shopify-modal">

        <div class="shopify-modal-header">
          <h2>Conectar Shopify</h2>

          <button onclick="closeShopifyModal()">
            ✕
          </button>
        </div>

        <div class="shopify-modal-body">

          <label>Dominio Shopify</label>

          <input
            type="text"
            id="shopifyDomain"
            placeholder="mitienda.myshopify.com"
          >

          <label>Admin API Access Token</label>

          <input
            type="password"
            id="shopifyToken"
            placeholder="shpat_xxxxx"
          >

          <button
            class="btn-primary"
            onclick="testShopifyConnection()"
          >
            Validar conexión
          </button>

          <div id="shopifyTestResult"></div>

        </div>

      </div>

    </div>
  `;

  document.body.insertAdjacentHTML("beforeend", modal);
}

function closeShopifyModal() {
  const modal = document.getElementById("shopifyModal");

  if (modal) modal.remove();
}

async function testShopifyConnection() {
  const domainInput = document.getElementById("shopifyDomain");
  const tokenInput = document.getElementById("shopifyToken");
  const resultBox = document.getElementById("shopifyTestResult");

  const shop_domain = domainInput?.value.trim();
  const access_token = tokenInput?.value.trim();

  if (!shop_domain || !access_token) {
    resultBox.innerHTML = `
      <span style="color:#fca5a5;">
        Completá dominio y token.
      </span>
    `;
    return;
  }

  resultBox.innerHTML = `
    <span style="color:#a3a3a3;">
      Validando conexión...
    </span>
  `;

  try {

    const response = await fetch(
      SHOPIFY_EDGE_FUNCTION_URL,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          shop: shop_domain
        })
      }
    );

    const data = await response.json();

    if (!data.success) {
      resultBox.innerHTML = `
        <span style="color:#fca5a5;">
          ${data.error || "Error conectando Shopify"}
        </span>
      `;
      return;
    }

    const {
      data: { session },
      error: sessionError
    } = await sb.auth.getSession();

    if (sessionError || !session?.user) {
      throw new Error("Usuario no autenticado");
    }

    const user = session.user;

    const { error: saveError } = await sb
      .from("shopify_connections")
      .upsert({
        user_id: user.id,

        provider: "shopify",

        status: "connected",

        shop_domain,

        access_token,

        myshopify_domain:
          data.shop?.myshopify_domain || null,

        shop_name:
          data.shop?.name || null,

        shop_email:
          data.shop?.email || null,

        currency:
          data.shop?.currency || null,

        plan_name:
          data.shop?.plan_name || null,

        connection_type:
          "custom_app",

        updated_at:
          new Date().toISOString()
      });

    if (saveError) {
      console.error(saveError);

      resultBox.innerHTML = `
        <span style="color:#fca5a5;">
          Error guardando conexión Shopify
        </span>
      `;

      return;
    }

    resultBox.innerHTML = `
      <div style="color:#86efac;font-weight:700;margin-bottom:6px;">
        Shopify conectado correctamente
      </div>

      <div style="font-size:13px;color:#a3a3a3;">
        Tienda: ${data.shop?.name || "Sin nombre"}<br>
        Dominio:
        ${data.shop?.myshopify_domain || shop_domain}<br>
        Moneda:
        ${data.shop?.currency || "--"}
      </div>
    `;

    updateShopifyCardState(data, shop_domain);

  } catch (error) {
    console.error("Error validando Shopify:", error);

    resultBox.innerHTML = `
      <span style="color:#fca5a5;">
        Error inesperado validando Shopify.
      </span>
    `;
  }
}

async function syncShopifyProducts() {

  try {

    const {
      data: { session },
      error: sessionError
    } = await sb.auth.getSession();

    if (sessionError || !session?.user) {
      alert("Usuario no autenticado");
      return;
    }

    const user = session.user;

    const {
      data: connection,
      error: connectionError
    } = await sb
      .from("shopify_connections")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (connectionError || !connection) {
      alert("No existe conexión Shopify");
      return;
    }

    alert("Sincronizando productos Shopify...");

    const response = await fetch(
      SHOPIFY_SYNC_PRODUCTS_URL,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          shop_domain: connection.shop_domain,
          access_token: connection.access_token,
          user_id: user.id
        })
      }
    );

    const data = await response.json();

    if (!data.success) {

      console.error(data);

      alert(
        data.error || "Error sincronizando productos"
      );

      return;
    }

    alert(
      `Productos sincronizados: ${data.synced_products}`
    );

    const sync = document.querySelector(".shopify-sync");

    if (sync) {
      sync.innerText =
        `${data.synced_products} productos sincronizados`;
    }

  } catch (error) {

    console.error(error);

    alert(
      "Error inesperado sincronizando productos"
    );
  }
}

function updateShopifyCardState(data, fallbackDomain) {

  const badge =
    document.querySelector(".integration-badge");

  const domain =
    document.querySelector(".shopify-domain");

  const sync =
    document.querySelector(".shopify-sync");

  const state =
    document.querySelector(".shopify-state");

  if (badge) {
    badge.classList.remove("disconnected");

    badge.classList.add("connected");

    badge.innerText = "Conectado";
  }

  if (domain) {
    domain.innerText =
      data.shop?.myshopify_domain ||
      data.shop?.domain ||
      fallbackDomain;
  }

  if (sync) {
    sync.innerText =
      "Sincronización inicial lista";
  }

  if (state) {
    state.innerText =
      "Shopify conectado";
  }
}

window.renderIntegrationsModule =
  renderIntegrationsModule;

window.openIntegrationsView =
  openIntegrationsView;

window.openShopifyConnectionModal =
  openShopifyConnectionModal;

window.closeShopifyModal =
  closeShopifyModal;

window.testShopifyConnection =
  testShopifyConnection;

window.syncShopifyProducts =
  syncShopifyProducts;