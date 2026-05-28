console.log("✅ integrations.js cargado correctamente");

const SHOPIFY_EDGE_FUNCTION_URL =
  "https://crgtdkbobxfbiicuxrfj.supabase.co/functions/v1/shopify-test";

const SHOPIFY_SYNC_PRODUCTS_URL =
  "https://crgtdkbobxfbiicuxrfj.supabase.co/functions/v1/shopify-sync-products";

function renderIntegrationsModule() {
  const root = document.getElementById("integrations-root");

  if (!root) return;

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
              <span class="integration-badge disconnected">Desconectado</span>
              <h2>Shopify</h2>
              <p>Conectá una tienda Shopify para sincronizar ventas, productos, clientes y métricas.</p>
            </div>
          </div>

          <div class="integration-info">
            <div><span>Dominio</span><strong class="shopify-domain">No conectado</strong></div>
            <div><span>Última sincronización</span><strong class="shopify-sync">Sin sincronizar</strong></div>
            <div><span>Estado</span><strong class="shopify-state">Esperando conexión</strong></div>
          </div>

          <div class="integration-actions">
            <button class="btn-primary" onclick="openShopifyConnectionModal()">Conectar Shopify</button>
            <button class="btn-secondary" onclick="syncShopifyProducts()">Sincronizar productos</button>
          </div>
        </article>
      </div>
    </section>
  `;
}

async function openIntegrationsView() {
  showView("view-client-integrations");

  setTimeout(async () => {
    renderIntegrationsModule();
    await loadShopifyConnectionState();
  }, 50);
}

async function getCurrentUser() {
  const {
    data: { session },
    error
  } = await sb.auth.getSession();

  if (error || !session?.user) {
    throw new Error("Usuario no autenticado");
  }

  return session.user;
}

async function getLatestShopifyConnection(userId) {
  const { data, error } = await sb
    .from("shopify_connections")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })
    .limit(1);

  if (error) throw error;

  return data?.[0] || null;
}

async function loadShopifyConnectionState() {
  try {
    const user = await getCurrentUser();
    const connection = await getLatestShopifyConnection(user.id);

    if (!connection) return;

    updateShopifyCardState(
      {
        shop: {
          myshopify_domain: connection.myshopify_domain,
          domain: connection.shop_domain,
          name: connection.shop_name,
          currency: connection.currency
        }
      },
      connection.shop_domain
    );
  } catch (error) {
    console.error("Error cargando conexión Shopify:", error);
  }
}

function openShopifyConnectionModal() {
  const existing = document.getElementById("shopifyModal");
  if (existing) existing.remove();

  const modal = `
    <div class="shopify-modal-overlay" id="shopifyModal">
      <div class="shopify-modal">
        <div class="shopify-modal-header">
          <h2>Conectar Shopify</h2>
          <button onclick="closeShopifyModal()">✕</button>
        </div>

        <div class="shopify-modal-body">
          <label>Dominio Shopify</label>
          <input type="text" id="shopifyDomain" placeholder="mitienda.myshopify.com">

          <label>Admin API Access Token</label>
          <input type="password" id="shopifyToken" placeholder="shpat_xxxxx">

          <button class="btn-primary" id="shopifyConnectBtn" onclick="testShopifyConnection()">
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
  const button = document.getElementById("shopifyConnectBtn");

  const shop_domain = domainInput?.value.trim();
  const access_token = tokenInput?.value.trim();

  if (!resultBox) return;

  if (!shop_domain || !access_token) {
    resultBox.innerHTML = `<span style="color:#fca5a5;">Completá dominio y token.</span>`;
    return;
  }

  try {
    if (button) {
      button.disabled = true;
      button.innerText = "Validando...";
    }

    resultBox.innerHTML = `<span style="color:#a3a3a3;">Validando conexión...</span>`;

    const response = await fetch(SHOPIFY_EDGE_FUNCTION_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ shop: shop_domain })
    });

    const data = await response.json();

    if (!data.success) {
      resultBox.innerHTML = `<span style="color:#fca5a5;">${data.error || "Error conectando Shopify"}</span>`;
      return;
    }

    resultBox.innerHTML = `<span style="color:#a3a3a3;">Guardando conexión...</span>`;

    const user = await getCurrentUser();
    const existing = await getLatestShopifyConnection(user.id);

    const payload = {
      user_id: user.id,
      provider: "shopify",
      status: "connected",
      shop_domain,
      access_token,
      myshopify_domain: data.shop?.myshopify_domain || null,
      shop_name: data.shop?.name || null,
      shop_email: data.shop?.email || null,
      currency: data.shop?.currency || null,
      plan_name: data.shop?.plan_name || null,
      connection_type: "custom_app",
      updated_at: new Date().toISOString()
    };

    let saveError;

    if (existing?.id) {
      const { error } = await sb
        .from("shopify_connections")
        .update(payload)
        .eq("id", existing.id);

      saveError = error;
    } else {
      const { error } = await sb
        .from("shopify_connections")
        .insert(payload);

      saveError = error;
    }

    if (saveError) {
      console.error(saveError);
      resultBox.innerHTML = `<span style="color:#fca5a5;">Error guardando conexión: ${saveError.message}</span>`;
      return;
    }

    resultBox.innerHTML = `
      <div style="color:#86efac;font-weight:700;margin-bottom:6px;">
        Shopify conectado correctamente
      </div>
      <div style="font-size:13px;color:#a3a3a3;">
        Tienda: ${data.shop?.name || "Sin nombre"}<br>
        Dominio: ${data.shop?.myshopify_domain || shop_domain}<br>
        Moneda: ${data.shop?.currency || "--"}
      </div>
    `;

    updateShopifyCardState(data, shop_domain);

  } catch (error) {
    console.error("Error validando Shopify:", error);
    resultBox.innerHTML = `<span style="color:#fca5a5;">${error.message || "Error inesperado validando Shopify."}</span>`;
  } finally {
    if (button) {
      button.disabled = false;
      button.innerText = "Validar conexión";
    }
  }
}

async function syncShopifyProducts() {
  const syncButton = document.querySelector(".btn-secondary");
  const syncText = document.querySelector(".shopify-sync");

  try {
    if (syncButton) {
      syncButton.disabled = true;
      syncButton.innerText = "Sincronizando...";
    }

    if (syncText) {
      syncText.innerText = "Sincronizando productos...";
    }

    const user = await getCurrentUser();
    const connection = await getLatestShopifyConnection(user.id);

    if (!connection) {
      alert("No existe conexión Shopify");
      return;
    }

    const response = await fetch(SHOPIFY_SYNC_PRODUCTS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        shop_domain: connection.shop_domain,
        user_id: user.id
      })
    });

    const data = await response.json();

    if (!data.success) {
      console.error(data);
      alert(data.error || "Error sincronizando productos");

      if (syncText) syncText.innerText = "Error sincronizando";
      return;
    }

    const now = new Date();
    const formattedDate =
      now.toLocaleDateString("es-CR") +
      " " +
      now.toLocaleTimeString("es-CR", {
        hour: "2-digit",
        minute: "2-digit"
      });

    if (syncText) {
      syncText.innerText = `${data.synced_products} productos · ${formattedDate}`;
    }

    alert(`✅ ${data.synced_products} productos sincronizados`);

  } catch (error) {
    console.error(error);

    if (syncText) syncText.innerText = "Error inesperado";

    alert("Error inesperado sincronizando productos");
  } finally {
    if (syncButton) {
      syncButton.disabled = false;
      syncButton.innerText = "Sincronizar productos";
    }
  }
}

function updateShopifyCardState(data, fallbackDomain) {
  const badge = document.querySelector(".integration-badge");
  const domain = document.querySelector(".shopify-domain");
  const sync = document.querySelector(".shopify-sync");
  const state = document.querySelector(".shopify-state");

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
    sync.innerText = "Sincronización inicial lista";
  }

  if (state) {
    state.innerText = "Shopify conectado";
  }
}

window.renderIntegrationsModule = renderIntegrationsModule;
window.openIntegrationsView = openIntegrationsView;
window.openShopifyConnectionModal = openShopifyConnectionModal;
window.closeShopifyModal = closeShopifyModal;
window.testShopifyConnection = testShopifyConnection;
window.syncShopifyProducts = syncShopifyProducts;