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

    const { 
      tipo,           // 'material_nuevo', 'clase_programada', 'tarea_creada', 'entrega_recibida'
      titulo,
      mensaje,
      divisionId,     // opcional: solo notificar a maestros de esta división
      rolObjetivo,    // opcional: 'maestro', 'maestro_lider', 'admin_maestros'
      excluirUsuarioId, // opcional: no notificar al que disparó la acción
      datosJson = {}
    } = await req.json();

    if (!tipo || !titulo || !mensaje) {
      throw new Error("tipo, titulo y mensaje son requeridos");
    }

    let query = supabase
      .from("maestro_users")
      .select("id")
      .eq("activo", true);

    if (divisionId) {
      query = query.eq("division_id", divisionId);
    }
    if (rolObjetivo) {
      query = query.eq("role", rolObjetivo);
    }
    if (excluirUsuarioId) {
      query = query.neq("id", excluirUsuarioId);
    }

    const { data: maestros } = await query;

    if (!maestros || maestros.length === 0) {
      return new Response(JSON.stringify({ success: true, notificados: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const notificaciones = maestros.map(m => ({
      usuario_id: m.id,
      tipo,
      titulo,
      mensaje,
      datos_json: datosJson,
    }));

    const { error } = await supabase.from("notificaciones").insert(notificaciones);
    if (error) throw error;

    return new Response(JSON.stringify({ success: true, notificados: maestros.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (err) {
    console.error("notify-maestros error:", err);
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});