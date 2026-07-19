import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { divisionId, cantidad = 1 } = await req.json();

    if (!divisionId) throw new Error("divisionId requerido");

    const { data: division } = await supabase
      .from("divisiones")
      .select("id, codigo_acceso")
      .eq("id", divisionId)
      .single();

    if (!division) throw new Error("División no encontrada");

    const codigos = [];
    const base = division.codigo_acceso;

    for (let i = 0; i < cantidad; i++) {
      // Buscar el último número usado
      const { data: ultimos } = await supabase
        .from("estudiantes")
        .select("codigo_unico")
        .ilike("codigo_unico", `${base}-%`)
        .order("codigo_unico", { ascending: false })
        .limit(1);

      let nextNum = 1;
      if (ultimos && ultimos.length > 0) {
        const last = ultimos[0].codigo_unico.split("-").pop();
        nextNum = parseInt(last) + 1;
      }

      const codigo = `${base}-${String(nextNum).padStart(3, "0")}`;

      const { data: estudiante, error } = await supabase
        .from("estudiantes")
        .insert({
          division_id: divisionId,
          nombre: `Estudiante ${nextNum}`,
          apellido: "",
          codigo_unico: codigo,
        })
        .select("id, codigo_unico")
        .single();

      if (error) throw error;
      codigos.push({ codigo: estudiante.codigo_unico, estudiante_id: estudiante.id });
    }

    return new Response(JSON.stringify({ success: true, codigos }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (err) {
    console.error("generate-student-code error:", err);
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});