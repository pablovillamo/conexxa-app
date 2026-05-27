// ============================================================
// VILLAMO GROWTH — INTEGRATIONS MODULE
// FASE 1: Shopify UI Base
// ============================================================

console.log("✅ integrations.js cargado correctamente");

function renderIntegrationsModule() {
  const mainContent = document.getElementById("mainContent");

  if (!mainContent) {
    console.error("❌ No se encontró #mainContent para renderizar Integraciones");
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
            <div class="integration-icon">S</div>
          </div>

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
  alert("Próximo paso: aquí abriremos el formulario para conectar Shopify.");
}

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