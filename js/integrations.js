console.log("✅ integrations.js cargado correctamente");

const SHOPIFY_EDGE_FUNCTION_URL =
  "https://crgtdkbobxfbiicuxrfj.supabase.co/functions/v1/shopify-test";

function getSupabaseClient() {
  return sb;
}

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
                Conectá una tienda Shopify para sincronizar
                ventas, productos, clientes y métricas.
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
            placeholder="shpat_..."
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

  const domainInput =
    document.getElementById("shopifyDomain");

  const tokenInput =
    document.getElementById("shopifyToken");

  const resultBox =
    document.getElementById("shopifyTestResult");

  const shop_domain =
    domainInput?.value.trim();

  const access_token =
    tokenInput?.value.trim();

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

    const supabaseClient = getSupabaseClient();

    const {
      data: userData,
      error: userError
    } = await supabaseClient.auth.getUser();

    if (userError || !userData?.user) {

      resultBox.innerHTML = `
        <span style="color:#fca5a5;">
          Usuario no autenticado
        </span>
      `;

      return;
    }

    const user = userData.user;

    const shop = data.shop;

    const {
      error: saveError
    } = await supabaseClient
      .from("shopify_connections")
      .upsert({

        user_id: user.id,

        provider: "shopify",

        status: "connected",

        connection_type: "custom_app",

        shop_domain: shop.domain,

        myshopify_domain:
          shop.myshopify_domain,

        shop_name: shop.name,

        shop_email: shop.email,

        currency: shop.currency,

        plan_name: shop.plan_name,

        access_token: access_token,

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
      <div
        style="
          color:#86efac;
          font-weight:700;
          margin-bottom:6px;
        "
      >
        Shopify conectado correctamente
      </div>

      <div
        style="
          font-size:13px;
          color:#a3a3a3;
        "
      >
        Tienda: ${shop.name}<br>
        Dominio: ${shop.myshopify_domain}<br>
        Moneda: ${shop.currency}
      </div>
    `;

    updateShopifyCardState(data);

  } catch (error) {

    console.error(
      "Error validando Shopify:",
      error
    );

    resultBox.innerHTML = `
      <span style="color:#fca5a5;">
        Error inesperado validando Shopify.
      </span>
    `;
  }
}

function updateShopifyCardState(data) {

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
      "-";
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