console.log("✅ integrations.js cargado correctamente");

const SHOPIFY_EDGE_FUNCTION_URL =
  "https://crgtdkbobxfbiicuxrfj.supabase.co/functions/v1/shopify-test";

const SHOPIFY_SYNC_PRODUCTS_URL =
  "https://crgtdkbobxfbiicuxrfj.supabase.co/functions/v1/shopify-sync-products";

let currentShopifyConnection = null;

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
              <p>Conectá una tienda Shopify para sincronizar productos, ventas, clientes y métricas.</p>
            </div>
          </div>

          <div class="integration-info">
            <div><span>Dominio</span><strong class="shopify-domain">No conectado</strong></div>
            <div><span>Última sincronización</span><strong class="shopify-sync">Sin sincronizar</strong></div>
            <div><span>Estado</span><strong class="shopify-state">Esperando conexión</strong></div>
          </div>

          <div class="integration-actions">
            <button class="btn-primary" id="shopifyMainBtn" onclick="handleShopifyMainAction()">Conectar Shopify</button>
            <button class="btn-secondary" id="shopifySyncBtn" onclick="syncShopifyProducts()" disabled>Sincronizar productos</button>
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
  const { data: { session }, error } = await sb.auth.getSession();

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

    currentShopifyConnection = connection || null;

    if (!connection) {
      updateShopifyCardDisconnected();
      return;
    }

    updateShopifyCardConnected(connection);

  } catch (error) {
    console.error("Error cargando conexión Shopify:", error);
  }
}

function updateShopifyCardDisconnected() {
  const badge = document.querySelector(".integration-badge");
  const domain = document.querySelector(".shopify-domain");
  const sync = document.querySelector(".shopify-sync");
  const state = document.querySelector(".shopify-state");
  const mainBtn = document.getElementById("shopifyMainBtn");
  const syncBtn = document.getElementById("shopifySyncBtn");

  if (badge) {
    badge.classList.remove("connected");
    badge.classList.add("disconnected");
    badge.innerText = "Desconectado";
  }

  if (domain) domain.innerText = "No conectado";
  if (sync) sync.innerText = "Sin sincronizar";
  if (state) state.innerText = "Esperando conexión";

  if (mainBtn) mainBtn.innerText = "Conectar Shopify";
  if (syncBtn) syncBtn.disabled = true;
}

function updateShopifyCardConnected(connection) {
  const badge = document.querySelector(".integration-badge");
  const domain = document.querySelector(".shopify-domain");
  const sync = document.querySelector(".shopify-sync");
  const state = document.querySelector(".shopify-state");
  const mainBtn = document.getElementById("shopifyMainBtn");
  const syncBtn = document.getElementById("shopifySyncBtn");

  if (badge) {
    badge.classList.remove("disconnected");
    badge.classList.add("connected");
    badge.innerText = "Conectado";
  }

  if (domain) {
    domain.innerText =
      connection.myshopify_domain ||
      connection.shop_domain ||
      "Tienda conectada";
  }

  if (sync) {
    sync.innerText =
      connection.last_sync_at
        ? new Date(connection.last_sync_at).toLocaleString("es-CR")
        : "Conexión lista";
  }

  if (state) state.innerText = "Shopify conectado";

  if (mainBtn) mainBtn.innerText = "Gestionar Shopify";
  if (syncBtn) syncBtn.disabled = false;
}

function handleShopifyMainAction() {
  if (currentShopifyConnection) {
    openShopifyManageModal();
  } else {
    openShopifyConnectionModal();
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

          <p style="font-size:12px;color:#a3a3a3;margin-top:8px;">
            No necesitás pegar token manual. La conexión usa credenciales seguras desde Supabase Edge Functions.
          </p>

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

function openShopifyManageModal() {
  const existing = document.getElementById("shopifyModal");
  if (existing) existing.remove();

  const domain =
    currentShopifyConnection?.myshopify_domain ||
    currentShopifyConnection?.shop_domain ||
    "Tienda conectada";

  const modal = `
    <div class="shopify-modal-overlay" id="shopifyModal">
      <div class="shopify-modal">
        <div class="shopify-modal-header">
          <h2>Shopify conectado</h2>
          <button onclick="closeShopifyModal()">✕</button>
        </div>

        <div class="shopify-modal-body">
          <div style="background:rgba(34,197,94,.08);border:1px solid rgba(34,197,94,.25);border-radius:14px;padding:14px;margin-bottom:16px;">
            <div style="color:#86efac;font-weight:700;margin-bottom:6px;">Conexión activa</div>
            <div style="font-size:13px;color:#a3a3a3;">Dominio: ${domain}</div>
          </div>

          <button class="btn-primary" onclick="syncShopifyProducts()">
            Sincronizar productos
          </button>

          <button class="btn-secondary" style="margin-top:10px;" onclick="closeShopifyModal()">
            Cerrar
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
  const resultBox = document.getElementById("shopifyTestResult");
  const button = document.getElementById("shopifyConnectBtn");

  const shop_domain = domainInput?.value.trim();

  if (!resultBox) return;

  if (!shop_domain) {
    resultBox.innerHTML = `<span style="color:#fca5a5;">Ingresá el dominio Shopify.</span>`;
    return;
  }

  try {
    if (button) {
      button.disabled = true;
      button.innerText = "Validando...";
    }

    resultBox.innerHTML = `<span style="color:#a3a3a3;">Validando conexión segura...</span>`;

    const user = await getCurrentUser();

    const response = await fetch(SHOPIFY_EDGE_FUNCTION_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        shop_domain,
        user_id: user.id
      })
    });

    const data = await response.json();

    if (!data.success) {
      console.error(data);
      resultBox.innerHTML = `<span style="color:#fca5a5;">${data.error || "Error conectando Shopify"}</span>`;
      return;
    }

    resultBox.innerHTML = `<span style="color:#a3a3a3;">Guardando conexión...</span>`;

    const existing = await getLatestShopifyConnection(user.id);

    const payload = {
      user_id: user.id,
      provider: "shopify",
      status: "connected",
      shop_domain,
      myshopify_domain: data.shop?.myshopify_domain || shop_domain,
      shop_name: data.shop?.name || null,
      shop_email: data.shop?.email || null,
      currency: data.shop?.currency || null,
      plan_name: data.shop?.plan_name || null,
      connection_type: "custom_app_client_credentials",
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

    currentShopifyConnection = { ...existing, ...payload };

    updateShopifyCardConnected(currentShopifyConnection);

    resultBox.innerHTML = `
      <div style="color:#86efac;font-weight:700;margin-bottom:6px;">
        Shopify conectado correctamente
      </div>
      <div style="font-size:13px;color:#a3a3a3;">
        Dominio: ${data.shop?.myshopify_domain || shop_domain}<br>
        Tienda: ${data.shop?.name || "Sin nombre"}
      </div>
    `;

    setTimeout(() => {
      closeShopifyModal();
    }, 1400);

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
  const syncButton = document.getElementById("shopifySyncBtn");
  const syncText = document.querySelector(".shopify-sync");
  const resultBox = document.getElementById("shopifyTestResult");

  try {
    if (syncButton) {
      syncButton.disabled = true;
      syncButton.innerText = "Sincronizando...";
    }

    if (syncText) syncText.innerText = "Sincronizando productos...";
    if (resultBox) resultBox.innerHTML = `<span style="color:#a3a3a3;">Sincronizando productos...</span>`;

    const user = await getCurrentUser();
    const connection = currentShopifyConnection || await getLatestShopifyConnection(user.id);

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
      if (resultBox) resultBox.innerHTML = `<span style="color:#fca5a5;">${data.error || "Error sincronizando productos"}</span>`;
      return;
    }

    const nowIso = new Date().toISOString();

    if (connection.id) {
      await sb
        .from("shopify_connections")
        .update({
          last_sync_at: nowIso,
          updated_at: nowIso
        })
        .eq("id", connection.id);
    }

    currentShopifyConnection = {
      ...connection,
      last_sync_at: nowIso,
      updated_at: nowIso
    };

    const formattedDate = new Date(nowIso).toLocaleString("es-CR");

    if (syncText) {
      syncText.innerText = `${data.synced_products} productos · ${formattedDate}`;
    }

    if (resultBox) {
      resultBox.innerHTML = `<span style="color:#86efac;">✅ ${data.synced_products} productos sincronizados</span>`;
    }

    alert(`✅ ${data.synced_products} productos sincronizados`);

  } catch (error) {
    console.error(error);

    if (syncText) syncText.innerText = "Error inesperado";
    if (resultBox) resultBox.innerHTML = `<span style="color:#fca5a5;">Error inesperado sincronizando productos</span>`;

    alert("Error inesperado sincronizando productos");
  } finally {
    if (syncButton) {
      syncButton.disabled = false;
      syncButton.innerText = "Sincronizar productos";
    }

    await loadShopifyConnectionState();
  }
}

window.renderIntegrationsModule = renderIntegrationsModule;
window.openIntegrationsView = openIntegrationsView;
window.handleShopifyMainAction = handleShopifyMainAction;
window.openShopifyConnectionModal = openShopifyConnectionModal;
window.openShopifyManageModal = openShopifyManageModal;
window.closeShopifyModal = closeShopifyModal;
window.testShopifyConnection = testShopifyConnection;
window.syncShopifyProducts = syncShopifyProducts;