import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders(),
    });
  }

  try {
    if (req.method !== "POST") {
      return jsonResponse({ success: false, error: "Método no permitido" }, 405);
    }

    const { shop_domain, access_token } = await req.json();

    if (!shop_domain || !access_token) {
      return jsonResponse({
        success: false,
        error: "Faltan shop_domain o access_token",
      }, 400);
    }

    const cleanDomain = String(shop_domain)
      .replace("https://", "")
      .replace("http://", "")
      .replace(/\/$/, "")
      .trim();

    const shopifyUrl = `https://${cleanDomain}/admin/api/2026-01/shop.json`;

    const response = await fetch(shopifyUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": access_token,
      },
    });

    if (!response.ok) {
      return jsonResponse({
        success: false,
        status: response.status,
        error: "Shopify rechazó la conexión. Revisá dominio o token.",
      }, 401);
    }

    const data = await response.json();
    const shop = data.shop;

    return jsonResponse({
      success: true,
      message: "Conexión Shopify válida",
      shop: {
        name: shop?.name,
        email: shop?.email,
        domain: shop?.domain,
        myshopify_domain: shop?.myshopify_domain,
        plan_name: shop?.plan_name,
        currency: shop?.currency,
        timezone: shop?.iana_timezone,
      },
    });
  } catch (error) {
    return jsonResponse({
      success: false,
      error: error?.message || "Error inesperado en shopify-test",
    }, 500);
  }
});

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders(),
      "Content-Type": "application/json",
    },
  });
}