import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return jsonResponse({ success: true });
  }

  try {
    const body = await req.json();
    const shopDomain = normalizeShopDomain(body.shop_domain);
    const userId = body.user_id;

    if (!shopDomain || !userId) {
      return jsonResponse({ success: false, error: "Faltan shop_domain o user_id." }, 400);
    }

    const SHOPIFY_CLIENT_ID = Deno.env.get("SHOPIFY_CLIENT_ID");
    const SHOPIFY_CLIENT_SECRET = Deno.env.get("SHOPIFY_CLIENT_SECRET");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!SHOPIFY_CLIENT_ID || !SHOPIFY_CLIENT_SECRET) {
      return jsonResponse({ success: false, error: "Faltan credenciales Shopify en Supabase Secrets." }, 500);
    }

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return jsonResponse({ success: false, error: "Faltan credenciales Supabase." }, 500);
    }

    const tokenResponse = await fetch(`https://${shopDomain}/admin/oauth/access_token`, {
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

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok || !tokenData.access_token) {
      return jsonResponse({
        success: false,
        status: tokenResponse.status,
        error: tokenData.error_description || tokenData.error || "No se pudo generar token Shopify.",
        detail: tokenData,
      }, 401);
    }

    const productsResponse = await fetch(
      `https://${shopDomain}/admin/api/2026-01/products.json?limit=250`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "X-Shopify-Access-Token": tokenData.access_token,
        },
      }
    );

    const productsData = await productsResponse.json();

    if (!productsResponse.ok) {
      return jsonResponse({
        success: false,
        status: productsResponse.status,
        error: "Shopify rechazó la consulta de productos.",
        detail: productsData,
      }, 401);
    }

    const products = productsData.products || [];
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const rows = products.map((product: any) => {
      const firstVariant = product.variants?.[0] || {};

      return {
        user_id: userId,
        shopify_product_id: String(product.id),
        title: product.title || null,
        handle: product.handle || null,
        vendor: product.vendor || null,
        product_type: product.product_type || null,
        status: product.status || null,
        price: firstVariant.price ? Number(firstVariant.price) : 0,
        compare_at_price: firstVariant.compare_at_price ? Number(firstVariant.compare_at_price) : null,
        inventory_quantity:
          typeof firstVariant.inventory_quantity === "number"
            ? firstVariant.inventory_quantity
            : 0,
        image_url: product.image?.src || null,
        updated_at: new Date().toISOString(),
      };
    });

    if (rows.length > 0) {
      const { error } = await supabaseAdmin
        .from("shopify_products")
        .upsert(rows, { onConflict: "user_id,shopify_product_id" });

      if (error) {
        return jsonResponse({ success: false, error: "Error guardando productos.", detail: error }, 500);
      }
    }

    return jsonResponse({
      success: true,
      synced_products: rows.length,
    });

  } catch (error) {
    return jsonResponse({
      success: false,
      error: error?.message || "Error inesperado sincronizando productos.",
    }, 500);
  }
});

function normalizeShopDomain(value: unknown): string {
  if (!value) return "";
  return String(value).replace("https://", "").replace("http://", "").replace(/\/+$/, "").trim();
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}