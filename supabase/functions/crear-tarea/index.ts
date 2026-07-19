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
      .select("role, division_id")
      .eq("id", user.id)
      .single();

    if (!perfil || !["maestro_lider", "admin_maestros"].includes(perfil.role)) {
      throw new Error("Solo líderes y admins pueden crear tareas");
    }

    const body = await req.json();
    const {
      clase_programada_id,
      titulo,
      descripcion,
      tipo,
      contenido_json,
      url_recurso,
      fecha_entrega,
    } = body;

    if (!clase_programada_id || !titulo || !tipo) {
      throw new Error("Clase, título y tipo son requeridos");
    }

    // Verificar que la clase pertenece al líder (o es admin)
    const { data: clase } = await supabase
      .from("clases_programadas")
      .select("maestro_lider_id, division_id")
      .eq("id", clase_programada_id)
      .single();

    if (!clase) throw new Error("Clase no encontrada");
    if (perfil.role === "maestro_lider" && clase.maestro_lider_id !== user.id) {
      throw new Error("Solo puedes crear tareas en tus clases");
    }

    // Subir archivo si se envía en formData (manejado por upload-material)
    // Aquí solo guardamos la referencia

    const { data: tarea, error: tareaError } = await supabase
      .from("tareas")
      .insert({
        clase_programada_id,
        titulo,
        descripcion,
        tipo,
        contenido_json: contenido_json || null,
        url_recurso: url_recurso || null,
        fecha_entrega: fecha_entrega || null,
        creada_por: user.id,
      })
      .select()
      .single();

    if (tareaError) throw tareaError;

    // Crear entregas pendientes para todos los estudiantes de la división
    const { data: estudiantes } = await supabase
      .from("estudiantes")
      .select("id")
      .eq("division_id", clase.division_id)
      .eq("activo", true);

    if (estudiantes && estudiantes.length > 0) {
      const entregas = estudiantes.map(e => ({
        tarea_id: tarea.id,
        estudiante_id: e.id,
        estado: "pendiente",
      }));

      const { error: entregasError } = await supabase
        .from("entregas_estudiantes")
        .insert(entregas);

      if (entregasError) console.error("Error creando entregas:", entregasError);
    }

    // Notificar a estudiantes (in-app, verán al entrar)
    // Notificar a maestros
    await supabase.from("notificaciones").insert({
      usuario_id: user.id,
      tipo: "tarea_creada",
      titulo: "Nueva tarea asignada",
      mensaje: `Tarea "${titulo}" creada para la clase`,
      datos_json: { tarea_id: tarea.id, clase_id: clase_programada_id },
    });

    return new Response(JSON.stringify({ success: true, tarea }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (err) {
    console.error("crear-tarea error:", err);
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});