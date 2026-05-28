import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    });
  }

  try {
    const body = await req.json();

    const { shop_domain, access_token, user_id } = body;

    if (!shop_domain || !access_token || !user_id) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Datos incompletos",
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const shopifyResponse = await fetch(
      `https://${shop_domain}/admin/api/2024-01/products.json`,
      {
        method: "GET",
        headers: {
          "X-Shopify-Access-Token": access_token,
          "Content-Type": "application/json",
        },
      }
    );

    const shopifyData = await shopifyResponse.json();

    const products = shopifyData.products || [];

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    for (const product of products) {
      await supabase.from("shopify_products").upsert({
        user_id,

        shopify_product_id: String(product.id),

        title: product.title,
        handle: product.handle,
        vendor: product.vendor,
        product_type: product.product_type,
        status: product.status,

        price: product.variants?.[0]?.price || 0,

        compare_at_price:
          product.variants?.[0]?.compare_at_price || 0,

        inventory_quantity:
          product.variants?.[0]?.inventory_quantity || 0,

        image_url: product.image?.src || null,

        updated_at: new Date().toISOString(),
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        synced_products: products.length,
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});