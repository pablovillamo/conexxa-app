// ============================================================
// VILLAMO GROWTH — INTEGRATIONS MODULE
// ============================================================

console.log("✅ integrations.js cargado correctamente");

const SHOPIFY_EDGE_FUNCTION_URL =
  "https://crgtdkbobxfbiicuxrfj.supabase.co/functions/v1/shopify-test";

// ============================================================
// RENDER MODULE
// ============================================================

function renderIntegrationsModule() {
  const mainContent = document.getElementById("integrations-root");

  if (!mainContent) {
    console.error("❌ No se encontró #integrations-root");
    return;
  }

  mainContent.innerHTML = `
    <section class="integrations-page">

      <div class="integrations-header">
        <div>

          <p class="section-kicker">
            Integraciones
          </p>

          <h1>
            Conexiones Ecommerce
          </h1>

          <p class="section-description">
            Conectá herramientas externas para convertir
            el tracker en un sistema operativo ecommerce.
          </p>

        </div>
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

            <button
              class="btn-secondary"
              disabled
            >
              Sincronizar
            </button>

          </div>

        </article>

      </div>

    </section>
  `;
}

// ============================================================
// OPEN MODAL
// ============================================================

function openShopifyConnectionModal() {

  const existingModal =
    document.getElementById("shopifyModal");

  if (existingModal) {
    existingModal.remove();
  }

  const modal = `
    <div
      class="shopify-modal-overlay"
      id="shopifyModal"
    >

      <div class="shopify-modal">

        <div class="shopify-modal-header">

          <h2>Conectar Shopify</h2>

          <button onclick="closeShopifyModal()">
            ✕
          </button>

        </div>

        <div class="shopify-modal-body">

          <label>
            Dominio Shopify
          </label>

          <input
            type="text"
            id="shopifyDomain"
            placeholder="mitienda.myshopify.com"
          >

          <label>
            Admin API Access Token
          </label>

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

  document.body.insertAdjacentHTML(
    "beforeend",
    modal
  );
}

// ============================================================
// CLOSE MODAL
// ============================================================

function closeShopifyModal() {

  const modal =
    document.getElementById("shopifyModal");

  if (modal) {
    modal.remove();
  }
}

// ============================================================
// OPEN VIEW
// ============================================================

function openIntegrationsView() {

  showView("view-client-integrations");

  setTimeout(() => {
    renderIntegrationsModule();
  }, 50);
}

// ============================================================
// TEST SHOPIFY CONNECTION
// ============================================================

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

  if (!resultBox) return;

  // ==========================================================
  // VALIDATIONS
  // ==========================================================

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

    // ========================================================
    // FETCH EDGE FUNCTION
    // ========================================================

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

    // ========================================================
    // SHOPIFY ERROR
    // ========================================================

    if (!data.success) {

      resultBox.innerHTML = `
        <span style="color:#fca5a5;">
          ${data.error || "Error conectando Shopify"}
        </span>
      `;

      return;
    }

    // ========================================================
    // SHOP DATA
    // ========================================================

    const {
      name,
      email,
      domain,
      myshopify_domain,
      currency,
      plan_name,
    } = data.shop;

    // ========================================================
    // SUPABASE CLIENT
    // ========================================================

    const supabaseClient =
      window.supabaseClient ||
      window.supabase ||
      supabase;

    if (!supabaseClient) {
      throw new Error(
        "Supabase client no disponible"
      );
    }

    // ========================================================
    // GET USER
    // ========================================================

    const {
      data: userData,
    } = await supabaseClient.auth.getUser();

    const user = userData?.user;

    if (!user) {
      throw new Error(
        "Usuario no autenticado"
      );
    }

    // ========================================================
    // SAVE CONNECTION
    // ========================================================

    const {
      error: saveError
    } = await supabaseClient
      .from("shopify_connections")
      .upsert({

        user_id: user.id,

        provider: "shopify",

        status: "connected",

        connection_type: "custom_app",

        shop_domain: domain,

        myshopify_domain,

        shop_name: name,

        shop_email: email,

        currency,

        plan_name,

        access_token,

        updated_at:
          new Date().toISOString(),

      });

    // ========================================================
    // SAVE ERROR
    // ========================================================

    if (saveError) {

      console.error(saveError);

      resultBox.innerHTML = `
        <span style="color:#fca5a5;">
          Error guardando conexión Shopify
        </span>
      `;

      return;
    }

    // ========================================================
    // SUCCESS UI
    // ========================================================

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
        Tienda: ${name}<br>
        Dominio: ${myshopify_domain}<br>
        Moneda: ${currency}
      </div>
    `;

    // ========================================================
    // UPDATE CARD
    // ========================================================

    updateShopifyCardState(
      data,
      shop_domain
    );

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

// ============================================================
// UPDATE CARD UI
// ============================================================

function updateShopifyCardState(
  data,
  fallbackDomain
) {

  const statusBadge =
    document.querySelector(
      ".integration-badge"
    );

  const domainText =
    document.querySelector(
      ".shopify-domain"
    );

  const syncText =
    document.querySelector(
      ".shopify-sync"
    );

  const stateText =
    document.querySelector(
      ".shopify-state"
    );

  if (statusBadge) {

    statusBadge.classList.remove(
      "disconnected"
    );

    statusBadge.classList.add(
      "connected"
    );

    statusBadge.innerText =
      "Conectado";
  }

  if (domainText) {

    domainText.innerText =
      data.shop?.myshopify_domain ||
      data.shop?.domain ||
      fallbackDomain;
  }

  if (syncText) {

    syncText.innerText =
      "Sincronización inicial lista";
  }

  if (stateText) {

    stateText.innerText =
      "Shopify conectado";
  }
}

// ============================================================
// EXPORTS
// ============================================================

window.renderIntegrationsModule =
  renderIntegrationsModule;

window.openShopifyConnectionModal =
  openShopifyConnectionModal;

window.closeShopifyModal =
  closeShopifyModal;

window.openIntegrationsView =
  openIntegrationsView;

window.testShopifyConnection =
  testShopifyConnection;