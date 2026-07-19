import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

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

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Missing Authorization header");

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) throw new Error("Invalid token");

    // Verificar que es maestro_lider o admin_maestros
    const { data: perfil } = await supabase
      .from("maestro_users")
      .select("role, division_id, nombre")
      .eq("id", user.id)
      .single();

    if (!perfil || !["maestro_lider", "admin_maestros"].includes(perfil.role)) {
      throw new Error("Solo líderes y admins pueden crear clases");
    }

    const body = await req.json();
    const {
      fecha,
      division_id,
      seccion_id,
      material_id,
      maestro_asistente_id,
      titulo_clase,
      notas,
      enviar_notificacion = false,
    } = body;

    if (!fecha || !division_id || !seccion_id || !titulo_clase) {
      throw new Error("Fecha, división, sección y título son requeridos");
    }

    // Validar que el líder pertenece a la división (si no es admin)
    if (perfil.role === "maestro_lider" && perfil.division_id !== division_id) {
      throw new Error("Solo puedes crear clases para tu división");
    }

    // Validar que el asistente (si hay) pertenece a la división
    if (maestro_asistente_id) {
      const { data: asistente } = await supabase
        .from("maestro_users")
        .select("division_id")
        .eq("id", maestro_asistente_id)
        .single();
      if (asistente && asistente.division_id !== division_id) {
        throw new Error("El asistente debe ser de la misma división");
      }
    }

    // Crear clase
    const { data: clase, error: claseError } = await supabase
      .from("clases_programadas")
      .insert({
        fecha,
        division_id,
        seccion_id,
        material_id: material_id || null,
        maestro_lider_id: user.id,
        maestro_asistente_id: maestro_asistente_id || null,
        titulo_clase,
        notas,
      })
      .select()
      .single();

    if (claseError) throw claseError;

    // Generar mensaje WhatsApp
    const { data: mensajeWhatsapp } = await supabase
      .rpc("generar_mensaje_whatsapp_clase", { p_clase_id: clase.id });

    let notificacionEnviada = false;

    if (enviar_notificacion && mensajeWhatsapp) {
      // Notificar a líder
      await supabase.from("notificaciones").insert({
        usuario_id: user.id,
        tipo: "clase_programada",
        titulo: "Clase programada",
        mensaje: `Clase "${titulo_clase}" programada para ${new Date(fecha).toLocaleDateString("es-ES")}`,
        datos_json: { clase_id: clase.id },
      });

      // Notificar a asistente si hay
      if (maestro_asistente_id) {
        await supabase.from("notificaciones").insert({
          usuario_id: maestro_asistente_id,
          tipo: "clase_programada",
          titulo: "Nueva asignación como asistente",
          mensaje: `Fuiste asignado como asistente en "${titulo_clase}" el ${new Date(fecha).toLocaleDateString("es-ES")}`,
          datos_json: { clase_id: clase.id },
        });
      }

      // Marcar como enviada
      await supabase
        .from("clases_programadas")
        .update({ 
          enviada_notificacion: true, 
          notificacion_enviada_en: new Date().toISOString() 
        })
        .eq("id", clase.id);

      notificacionEnviada = true;
    }

    return new Response(JSON.stringify({ 
      success: true, 
      clase,
      mensaje_whatsapp: mensajeWhatsapp,
      notificacion_enviada: notificacionEnviada,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (err) {
    console.error("crear-clase error:", err);
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});