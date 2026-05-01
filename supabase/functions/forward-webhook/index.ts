import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const WEBHOOK_URL = "https://hook.eu1.make.com/fo8n7s4g33vakd3z27ldkgvrmoa6sztt";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const body = await req.json();
    const { table, row_id, payload } = body as {
      table: "orders" | "profiles";
      row_id: string;
      payload: Record<string, unknown>;
    };

    if (!["orders", "profiles"].includes(table) || !row_id) {
      return new Response(JSON.stringify({ error: "Invalid input" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    let status = "sent";
    let errorMsg: string | null = null;

    try {
      const res = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        status = "failed";
        errorMsg = `HTTP ${res.status}: ${await res.text().catch(() => "")}`.slice(0, 500);
      }
    } catch (e) {
      status = "failed";
      errorMsg = (e instanceof Error ? e.message : String(e)).slice(0, 500);
    }

    await supabase
      .from(table)
      .update({ webhook_status: status, webhook_error: errorMsg })
      .eq("id", row_id);

    return new Response(JSON.stringify({ status, error: errorMsg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});