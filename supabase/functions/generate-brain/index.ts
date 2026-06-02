import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Supabase Edge Functions hard limit: 150s
// Claude claude-sonnet-4-6 at ~4000 output tokens: ~50-80s — safe
const MODEL = "claude-sonnet-4-6";
const MAX_TOKENS = 4096;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return jsonResponse({ ok: true });
  }

  if (req.method !== "POST") {
    return jsonResponse({ ok: false, error: "Método no permitido. Usá POST." }, 405);
  }

  try {
    const body = await req.json();
    const prompt = body.prompt;

    if (!prompt || typeof prompt !== "string" || prompt.trim().length < 10) {
      return jsonResponse({ ok: false, error: "Prompt requerido y debe tener al menos 10 caracteres." }, 400);
    }

    const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
    if (!ANTHROPIC_API_KEY) {
      return jsonResponse({
        ok: false,
        error: "Falta ANTHROPIC_API_KEY en Supabase Secrets.",
      }, 500);
    }

    console.log(`[generate-brain] modelo: ${MODEL} | prompt chars: ${prompt.length} | max_tokens: ${MAX_TOKENS}`);

    const t0 = Date.now();

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
    });

    const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
    console.log(`[generate-brain] respuesta Anthropic en ${elapsed}s — status: ${response.status}`);

    const responseText = await response.text();

    let data;
    try {
      data = JSON.parse(responseText);
    } catch {
      return jsonResponse({
        ok: false,
        error: "Anthropic no devolvió JSON válido.",
        detail: responseText.slice(0, 300),
      }, 500);
    }

    if (!response.ok) {
      console.error("[generate-brain] Error Anthropic:", data);
      return jsonResponse({
        ok: false,
        error: data.error?.message || "Error en la API de Anthropic.",
        detail: data,
      }, response.status);
    }

    if (!data.content || data.content.length === 0) {
      return jsonResponse({ ok: false, error: "Claude no devolvió contenido." }, 500);
    }

    console.log(
      `[generate-brain] éxito — output tokens: ${data.usage?.output_tokens || "?"} | stop_reason: ${data.stop_reason}`
    );

    return jsonResponse({
      ok: true,
      content: data.content,
      usage: data.usage,
      model: data.model,
      stop_reason: data.stop_reason,
    });

  } catch (err) {
    console.error("[generate-brain] excepción:", err?.message);
    return jsonResponse({
      ok: false,
      error: err?.message || "Error inesperado en generate-brain.",
    }, 500);
  }
});

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}
