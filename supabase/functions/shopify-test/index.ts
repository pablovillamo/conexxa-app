import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return jsonResponse({ success: true, message: "CORS OK" });
  }

  try {
    if (req.method !== "POST") {
      return jsonResponse(
        {
          success: false,
          error: "Método no permitido. Usá POST.",
        },
        405
      );
    }

    const body = await req.json();
    const shop = normalizeShopDomain(body.shop || body.shop_domain);

    if (!shop) {
      return jsonResponse(
        {
          success: false,
          error: "Shop domain requerido",
        },
        400
      );
    }

    const SHOPIFY_CLIENT_ID = Deno.env.get("SHOPIFY_CLIENT_ID");
    const SHOPIFY_CLIENT_SECRET = Deno.env.get("SHOPIFY_CLIENT_SECRET");

    if (!SHOPIFY_CLIENT_ID || !SHOPIFY_CLIENT_SECRET) {
      return jsonResponse(
        {
          success: false,
          error:
            "Faltan SHOPIFY_CLIENT_ID o SHOPIFY_CLIENT_SECRET en Supabase Secrets.",
        },
        500
      );
    }

    const tokenUrl = `https://${shop}/admin/oauth/access_token`;

    const tokenResponse = await fetch(tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        client_id: SHOPIFY_CLIENT_ID,
        client_secret: SHOPIFY_CLIENT_SECRET,
        grant_type: "client_credentials",
      }),
    });

    const tokenText = await tokenResponse.text();

    let tokenData;

    try {
      tokenData = JSON.parse(tokenText);
    } catch {
      return jsonResponse(
        {
          success: false,
          status: tokenResponse.status,
          error:
            "Shopify no devolvió JSON. Puede ser dominio incorrecto, app no instalada, scopes sin release, o Client Credentials no permitido.",
          shop,
          detail: tokenText.slice(0, 500),
        },
        500
      );
    }

    if (!tokenResponse.ok || !tokenData.access_token) {
      return jsonResponse(
        {
          success: false,
          status: tokenResponse.status,
          error:
            tokenData.error_description ||
            tokenData.error ||
            "No se pudo generar access token Shopify.",
          shop,
          tokenData,
        },
        401
      );
    }

    const shopResponse = await fetch(
      `https://${shop}/admin/api/2026-01/shop.json`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "X-Shopify-Access-Token": tokenData.access_token,
        },
      }
    );

    const shopText = await shopResponse.text();

    let shopData;

    try {
      shopData = JSON.parse(shopText);
    } catch {
      return jsonResponse(
        {
          success: false,
          status: shopResponse.status,
          error: "Shopify /shop.json no devolvió JSON.",
          detail: shopText.slice(0, 500),
        },
        500
      );
    }

    if (!shopResponse.ok) {
      return jsonResponse(
        {
          success: false,
          status: shopResponse.status,
          error: "Token generado, pero Shopify rechazó /shop.json.",
          detail: shopData,
        },
        401
      );
    }

    const shopInfo = shopData.shop;

    return jsonResponse({
      success: true,
      message: "Conexión Shopify válida",
      shop: {
        name: shopInfo?.name,
        email: shopInfo?.email,
        domain: shopInfo?.domain,
        myshopify_domain: shopInfo?.myshopify_domain,
        plan_name: shopInfo?.plan_name,
        currency: shopInfo?.currency,
        timezone: shopInfo?.iana_timezone,
      },
    });
  } catch (error) {
    return jsonResponse(
      {
        success: false,
        error: error?.message || "Error inesperado en shopify-test.",
      },
      500
    );
  }
});

function normalizeShopDomain(value: unknown): string {
  if (!value) return "";

  return String(value)
    .replace("https://", "")
    .replace("http://", "")
    .replace(/\/+$/, "")
    .trim();
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}