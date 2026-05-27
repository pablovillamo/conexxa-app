// ============================================================
// VILLAMO GROWTH — INTEGRATIONS MODULE
// FASE 1: Shopify UI Base
// ============================================================

console.log("✅ integrations.js cargado correctamente");

function renderIntegrationsModule() {
  const mainContent = document.getElementById("integrations-root");

  if (!mainContent) {
    console.error("❌ No se encontró #integrations-root para renderizar Integraciones");
    return;
  }

  mainContent.innerHTML = `
    <section class="integrations-page">
      <div class="integrations-header">
        <div>
          <p class="section-kicker">Integraciones</p>
          <h1>Conexiones Ecommerce</h1>
          <p class="section-description">
            Conectá herramientas externas para convertir el tracker en un sistema operativo ecommerce.
          </p>
        </div>
      </div>

      <div class="integrations-grid">
        <article class="integration-card">
          <div class="integration-card-header">
            <div>
              <span class="integration-badge disconnected">Desconectado</span>
              <h2>Shopify</h2>
              <p>Conectá una tienda Shopify para sincronizar ventas, productos, clientes y métricas.</p>
            </div>
<div class="integration-icon shopify-logo">
  <svg viewBox="0 0 24 24" fill="none">
    <path
      d="M17.615 6.558c-.014-.098-.09-.147-.18-.154-.063-.007-1.282-.084-1.282-.084s-.84-.833-.924-.917c-.084-.084-.252-.056-.315-.035-.007 0-.16.049-.42.126-.252-.728-.7-1.401-1.485-1.401-.021 0-.042 0-.063.007-.224-.294-.504-.42-.742-.42-1.849 0-2.73 2.31-3.01 3.486-.728.224-1.247.385-1.31.406-.406.126-.42.14-.476.525-.042.287-1.1 8.485-1.1 8.485l7.08 1.324 3.836-.959s2.611-10.563 2.59-10.689z"
      fill="#95BF47"
    />
    <path
      d="M17.435 6.404c-.014-.098-.09-.147-.18-.154-.063-.007-1.282-.084-1.282-.084s-.84-.833-.924-.917a.236.236 0 00-.133-.063l-1.94 12.587 3.836-.959s2.611-10.563 2.623-10.41z"
      fill="#5E8E3E"
    />
    <path
      d="M12.334 8.043l-.476 1.436s-.42-.224-.924-.224c-.756 0-.798.476-.798.595 0 .651 1.695.903 1.695 2.429 0 1.205-.763 1.982-1.793 1.982-1.24 0-1.877-.77-1.877-.77l.329-1.086s.651.56 1.198.56c.364 0 .511-.287.511-.497 0-.847-1.394-.882-1.394-2.282 0-1.177.84-2.317 2.541-2.317.651 0 .987.175.987.175z"
      fill="#fff"
    />
  </svg>
</div>          </div>

          <div class="integration-info">
            <div>
              <span>Dominio</span>
              <strong>No conectado</strong>
            </div>
            <div>
              <span>Última sincronización</span>
              <strong>Sin sincronizar</strong>
            </div>
            <div>
              <span>Estado</span>
              <strong>Esperando conexión</strong>
            </div>
          </div>

          <div class="integration-actions">
            <button class="btn-primary" onclick="openShopifyConnectionModal()">
              Conectar Shopify
            </button>
            <button class="btn-secondary" disabled>
              Sincronizar
            </button>
          </div>
        </article>
      </div>
    </section>
  `;
}

function openShopifyConnectionModal() {
  const existingModal = document.getElementById("shopifyModal");
  if (existingModal) existingModal.remove();

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
          <input type="password" id="shopifyToken" placeholder="shpat_...">

          <button class="btn-primary" onclick="testShopifyConnection()">
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

window.closeShopifyModal = closeShopifyModal;
window.renderIntegrationsModule = renderIntegrationsModule;
window.openShopifyConnectionModal = openShopifyConnectionModal;
// ============================================================
// OPEN INTEGRATIONS VIEW
// ============================================================

function openIntegrationsView() {
  showView("view-client-integrations");

  setTimeout(() => {
    renderIntegrationsModule();
  }, 50);
}

window.openIntegrationsView = openIntegrationsView;