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

    const formData = await req.formData();
    const codigoEstudiante = formData.get("codigo_estudiante") as string;
    const tareaId = formData.get("tarea_id") as string;
    const file = formData.get("file") as File | null;
    const respuestaJson = formData.get("respuesta_json") as string | null;
    const urlEntrega = formData.get("url_entrega") as string | null;

    if (!codigoEstudiante || !tareaId) {
      throw new Error("codigo_estudiante y tarea_id son requeridos");
    }

    // Validar código de estudiante
    const { data: estData, error: estError } = await supabase
      .rpc("validar_codigo_estudiante", { p_codigo: codigoEstudiante.toUpperCase().trim() });

    if (estError || !estData || estData.length === 0) {
      throw new Error("Código de estudiante inválido");
    }

    const estudianteId = estData[0].id;

    // Verificar que la tarea existe y pertenece a la división del estudiante
    const { data: tarea } = await supabase
      .from("tareas")
      .select("id, clase_programada_id, fecha_entrega")
      .eq("id", tareaId)
      .single();

    if (!tarea) throw new Error("Tarea no encontrada");

    const { data: clase } = await supabase
      .from("clases_programadas")
      .select("division_id")
      .eq("id", tarea.clase_programada_id)
      .single();

    const { data: estudiante } = await supabase
      .from("estudiantes")
      .select("division_id")
      .eq("id", estudianteId)
      .single();

    if (!clase || !estudiante || clase.division_id !== estudiante.division_id) {
      throw new Error("No tienes acceso a esta tarea");
    }

    // Verificar si ya existe entrega
    const { data: existing } = await supabase
      .from("entregas_estudiantes")
      .select("id, estado")
      .eq("tarea_id", tareaId)
      .eq("estudiante_id", estudianteId)
      .single();

    let storagePath = null;

    if (file) {
      // Validar archivo
      const allowedTypes = [
        "application/pdf",
        "image/jpeg", "image/png", "image/webp", "image/gif",
        "video/mp4", "video/webm",
        "audio/mpeg", "audio/mp3", "audio/wav",
      ];
      if (!allowedTypes.includes(file.type)) {
        throw new Error(`Tipo de archivo no permitido: ${file.type}`);
      }
      if (file.size > 50 * 1024 * 1024) { // 50MB max para entregas
        throw new Error("Archivo demasiado grande (máx 50MB)");
      }

      const ext = file.name.split(".").pop();
      const filename = `${crypto.randomUUID()}.${ext}`;
      storagePath = `entregas/${tareaId}/${estudianteId}/${filename}`;

      const { error: uploadError } = await supabase.storage
        .from("entregas")
        .upload(storagePath, file, { contentType: file.type });

      if (uploadError) throw uploadError;
    }

    const updateData: Record<string, unknown> = {
      estado: "entregado",
      entregado_en: new Date().toISOString(),
      respuesta_json: respuestaJson ? JSON.parse(respuestaJson) : null,
      url_entrega: urlEntrega || null,
      storage_path: storagePath,
    };

    if (existing) {
      if (existing.estado === "revisado") {
        throw new Error("Esta entrega ya fue revisada y no puede modificarse");
      }
      const { error } = await supabase
        .from("entregas_estudiantes")
        .update(updateData)
        .eq("id", existing.id);
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from("entregas_estudiantes")
        .insert({
          tarea_id: tareaId,
          estudiante_id: estudianteId,
          ...updateData,
        });
      if (error) throw error;
    }

    // Notificar al maestro líder
    const { data: claseInfo } = await supabase
      .from("clases_programadas")
      .select("maestro_lider_id, titulo_clase")
      .eq("id", tarea.clase_programada_id)
      .single();

    if (claseInfo) {
      await supabase.from("notificaciones").insert({
        usuario_id: claseInfo.maestro_lider_id,
        tipo: "entrega_recibida",
        titulo: "Nueva entrega de estudiante",
        mensaje: `Entrega recibida para "${claseInfo.titulo_clase}"`,
        datos_json: { tarea_id: tareaId, estudiante_id: estudianteId },
      });
    }

    return new Response(JSON.stringify({ success: true, entrega_id: existing?.id || "new" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (err) {
    console.error("upload-entrega error:", err);
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});