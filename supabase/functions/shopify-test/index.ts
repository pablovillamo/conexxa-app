// supabase/functions/shopify-test/index.ts

Deno.serve(async (req) => {
  try {
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ ok: false, error: "Método no permitido" }),
        { status: 405, headers: { "Content-Type": "application/json" } }
      );
    }

    const { shop, accessToken } = await req.json();

    if (!shop || !accessToken) {
      return new Response(
        JSON.stringify({
          ok: false,
          error: "Faltan shop o accessToken",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const cleanShop = String(shop)
      .replace("https://", "")
      .replace("http://", "")
      .replace("/", "")
      .trim();

    const shopifyUrl = `https://${cleanShop}/admin/api/2024-10/shop.json`;

    const shopifyResponse = await fetch(shopifyUrl, {
      method: "GET",
      headers: {
        "X-Shopify-Access-Token": accessToken,
        "Content-Type": "application/json",
      },
    });

    if (!shopifyResponse.ok) {
      return new Response(
        JSON.stringify({
          ok: false,
          status: shopifyResponse.status,
          error: "No se pudo validar la conexión con Shopify",
        }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    const data = await shopifyResponse.json();
    const shopData = data.shop;

    return new Response(
      JSON.stringify({
        ok: true,
        message: "Conexión Shopify válida",
        shop: {
          name: shopData?.name,
          email: shopData?.email,
          domain: shopData?.domain,
          myshopify_domain: shopData?.myshopify_domain,
          plan_name: shopData?.plan_name,
          currency: shopData?.currency,
          timezone: shopData?.iana_timezone,
        },
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        ok: false,
        error: error.message || "Error inesperado en shopify-test",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});