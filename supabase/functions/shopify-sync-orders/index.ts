import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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

    const userId = body.user_id || body.client_id;
    const shopDomain = normalizeShopDomain(body.shop_domain || body.shop);

    if (!userId || !shopDomain) {
      return jsonResponse(
        {
          success: false,
          error: "Faltan user_id/client_id o shop_domain.",
        },
        400
      );
    }

    const SHOPIFY_CLIENT_ID = Deno.env.get("SHOPIFY_CLIENT_ID");
    const SHOPIFY_CLIENT_SECRET = Deno.env.get("SHOPIFY_CLIENT_SECRET");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

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

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return jsonResponse(
        {
          success: false,
          error: "Faltan credenciales Supabase.",
        },
        500
      );
    }

    const tokenResponse = await fetch(
      `https://${shopDomain}/admin/oauth/access_token`,
      {
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
      }
    );

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
            "Shopify no devolvió JSON al generar token. Revisá dominio, app instalada, scopes o Client Credentials.",
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
          detail: tokenData,
        },
        401
      );
    }

    const ordersResponse = await fetch(
      `https://${shopDomain}/admin/api/2026-01/orders.json?status=any&limit=250`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "X-Shopify-Access-Token": tokenData.access_token,
        },
      }
    );

    const ordersText = await ordersResponse.text();

    let ordersData;

    try {
      ordersData = JSON.parse(ordersText);
    } catch {
      return jsonResponse(
        {
          success: false,
          status: ordersResponse.status,
          error: "Shopify orders.json no devolvió JSON.",
          detail: ordersText.slice(0, 500),
        },
        500
      );
    }

    if (!ordersResponse.ok) {
      return jsonResponse(
        {
          success: false,
          status: ordersResponse.status,
          error: "Shopify rechazó la consulta de órdenes.",
          detail: ordersData,
        },
        401
      );
    }

    const orders = ordersData.orders || [];

    const supabaseAdmin = createClient(
      SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY
    );

    const rows = orders.map((order: any) => ({
      user_id: userId,

      shopify_order_id: String(order.id),

      order_number: order.order_number ? String(order.order_number) : null,
      name: order.name || null,
      email: order.email || null,

      financial_status: order.financial_status || null,
      fulfillment_status: order.fulfillment_status || null,

      currency: order.currency || null,

      total_price: Number(order.total_price || 0),
      subtotal_price: Number(order.subtotal_price || 0),
      total_tax: Number(order.total_tax || 0),
      total_discounts: Number(order.total_discounts || 0),

      customer_id: order.customer?.id ? String(order.customer.id) : null,
      customer_first_name: order.customer?.first_name || null,
      customer_last_name: order.customer?.last_name || null,

      processed_at: order.processed_at || null,
      created_at_shopify: order.created_at || null,
      updated_at_shopify: order.updated_at || null,

      updated_at: new Date().toISOString(),
    }));

    if (rows.length > 0) {
      const { error } = await supabaseAdmin
        .from("shopify_orders")
        .upsert(rows, {
          onConflict: "user_id,shopify_order_id",
        });

      if (error) {
        return jsonResponse(
          {
            success: false,
            error: "Error guardando órdenes.",
            detail: error,
          },
          500
        );
      }
    }

    await supabaseAdmin
      .from("shopify_connections")
      .update({
        last_sync_at: new Date().toISOString(),
        status: "connected",
        access_token: "client_credentials",
      })
      .eq("shop_domain", shopDomain);

    return jsonResponse({
      success: true,
      shop_domain: shopDomain,
      synced_orders: rows.length,
    });
  } catch (error: any) {
    return jsonResponse(
      {
        success: false,
        error: error?.message || "Error inesperado sincronizando órdenes.",
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