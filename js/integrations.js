console.log("✅ integrations.js cargado correctamente");

const supabase = window.supabaseClient;

async function testShopifyConnection() {
  try {
    const shopInput = document.getElementById("shopify-domain");
    const tokenInput = document.getElementById("shopify-token");
    const resultBox = document.getElementById("shopify-result");

    const shop_domain = shopInput.value.trim();
    const access_token = tokenInput.value.trim();

    if (!shop_domain) {
      resultBox.innerHTML = `
        <span style="color:#fca5a5;">
          Dominio Shopify requerido
        </span>
      `;
      return;
    }

    if (!access_token) {
      resultBox.innerHTML = `
        <span style="color:#fca5a5;">
          Access token requerido
        </span>
      `;
      return;
    }

    resultBox.innerHTML = `
      <span style="color:#a3a3a3;">
        Validando conexión...
      </span>
    `;

    const response = await fetch(
      "https://crgtdkbobxfbiicuxrfj.supabase.co/functions/v1/shopify-test",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          shop: shop_domain,
          access_token
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
      name,
      myshopify_domain,
      currency
    } = data.shop;

    const {
      data: authData,
      error: authError
    } = await supabase.auth.getUser();

    if (authError || !authData?.user) {
      resultBox.innerHTML = `
        <span style="color:#fca5a5;">
          Usuario no autenticado
        </span>
      `;
      return;
    }

    const user = authData.user;

    const {
      error: saveError
    } = await supabase
      .from("shopify_connections")
      .upsert({
        user_id: user.id,
        shop_domain,
        access_token,
        store_name: name,
        connected: true,
        updated_at: new Date().toISOString()
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
        Tienda: ${name}<br>
        Dominio: ${myshopify_domain}<br>
        Moneda: ${currency}
      </div>
    `;

  } catch (error) {
    console.error("Error validando Shopify:", error);

    const resultBox = document.getElementById("shopify-result");

    resultBox.innerHTML = `
      <span style="color:#fca5a5;">
        Error inesperado validando Shopify.
      </span>
    `;
  }
}

window.testShopifyConnection = testShopifyConnection;