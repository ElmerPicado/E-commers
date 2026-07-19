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
      throw new Error("Solo líderes y admins pueden subir materiales");
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const seccionId = formData.get("seccion_id") as string;
    const titulo = formData.get("titulo") as string;
    const descripcion = formData.get("descripcion") as string;
    const tipo = formData.get("tipo") as "archivo" | "enlace";
    const urlExterno = formData.get("url_externo") as string;
    const publicadoEnWeb = formData.get("publicado_en_web") === "true";

    if (!file && tipo === "archivo") throw new Error("Archivo requerido");
    if (!urlExterno && tipo === "enlace") throw new Error("URL requerida");
    if (!seccionId || !titulo) throw new Error("Sección y título requeridos");

    let storagePath = null;
    let mimeType = null;
    let tamañoBytes = 0;

    if (file) {
      // Validar tipo MIME
      const allowedTypes = [
        "application/pdf",
        "image/jpeg", "image/png", "image/webp", "image/gif",
        "video/mp4", "video/webm",
        "audio/mpeg", "audio/mp3", "audio/wav",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-powerpoint",
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      ];
      if (!allowedTypes.includes(file.type)) {
        throw new Error(`Tipo de archivo no permitido: ${file.type}`);
      }
      if (file.size > 100 * 1024 * 1024) { // 100MB max
        throw new Error("Archivo demasiado grande (máx 100MB)");
      }

      mimeType = file.type;
      tamañoBytes = file.size;

      // Subir a Storage
      const ext = file.name.split(".").pop();
      const filename = `${crypto.randomUUID()}.${ext}`;
      storagePath = `materiales/${seccionId}/${filename}`;

      const { error: uploadError } = await supabase.storage
        .from("materiales")
        .upload(storagePath, file, { contentType: file.type });

      if (uploadError) throw uploadError;
    }

    // Guardar en BD
    const { data: material, error: dbError } = await supabase
      .from("materiales")
      .insert({
        seccion_id: seccionId,
        titulo,
        descripcion,
        tipo,
        storage_path: storagePath,
        url_externo: urlExterno || null,
        mime_type: mimeType,
        tamaño_bytes: tamañoBytes,
        creado_por: user.id,
        publicado_en_web: publicadoEnWeb,
      })
      .select()
      .single();

    if (dbError) throw dbError;

    // Notificar a maestros de la división (si aplica)
    if (perfil.division_id) {
      await supabase.from("notificaciones").insert({
        usuario_id: user.id, // también al creador
        tipo: "material_nuevo",
        titulo: "Nuevo material disponible",
        mensaje: `"${titulo}" se agregó a la biblioteca`,
        datos_json: { material_id: material.id, seccion_id: seccionId },
      });
    }

    return new Response(JSON.stringify({ success: true, material }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (err) {
    console.error("upload-material error:", err);
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});