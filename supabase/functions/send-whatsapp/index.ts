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

    const { claseId } = await req.json();

    if (!claseId) {
      throw new Error("claseId requerido");
    }

    // Obtener datos de la clase
    const { data: clase, error } = await supabase
      .from("clases_programadas")
      .select(`
        id, fecha, titulo_clase, notas,
        division_id, divisiones!inner(nombre, codigo_acceso),
        seccion_id, secciones!inner(nombre),
        material_id, materiales!inner(titulo),
        maestro_lider_id, maestro_users!maestro_lider_id(nombre),
        maestro_asistente_id, maestro_users!maestro_asistente_id(nombre)
      `)
      .eq("id", claseId)
      .single();

    if (error || !clase) throw new Error("Clase no encontrada");

    // Verificar si hay tareas
    const { data: tareas } = await supabase
      .from("tareas")
      .select("titulo")
      .eq("clase_programada_id", claseId);

    // Generar mensaje WhatsApp
    let mensaje = `📅 *CLASE PROGRAMADA* 📅\n\n`;
    mensaje += `📆 *Fecha:* ${new Date(clase.fecha).toLocaleDateString("es-ES")}\n`;
    mensaje += `👥 *División:* ${clase.divisiones.nombre} (${clase.divisiones.codigo_acceso})\n`;
    mensaje += `📖 *Tema:* ${clase.titulo_clase}\n`;
    mensaje += `📚 *Sección:* ${clase.secciones.nombre}\n`;

    if (clase.materiales) {
      mensaje += `📎 *Material:* ${clase.materiales.titulo}\n`;
    }

    mensaje += `👨‍🏫 *Maestro:* ${clase.maestro_users.nombre}`;
    if (clase.maestro_users_1) {
      mensaje += ` | 👥 *Asistente:* ${clase.maestro_users_1.nombre}`;
    }
    mensaje += `\n\n`;

    if (tareas && tareas.length > 0) {
      mensaje += `📝 *Tareas asignadas:*\n`;
      tareas.forEach((t, i) => {
        mensaje += `${i + 1}. ${t.titulo}\n`;
      });
      mensaje += `\n`;
    }

    if (clase.notas) {
      mensaje += `📝 *Notas:* ${clase.notas}\n\n`;
    }

    mensaje += `✅ *Por favor confirme asistencia*\n\n`;
    mensaje += `*IMR4 Niños - Plataforma Educativa*`;

    // Marcar notificación enviada
    await supabase
      .from("clases_programadas")
      .update({ 
        enviada_notificacion: true, 
        notificacion_enviada_en: new Date().toISOString() 
      })
      .eq("id", claseId);

    // Crear notificación in-app para el líder
    await supabase.from("notificaciones").insert({
      usuario_id: clase.maestro_lider_id,
      tipo: "whatsapp_enviado",
      titulo: "Notificación WhatsApp enviada",
      mensaje: `Mensaje enviado para la clase: ${clase.titulo_clase}`,
      datos_json: { clase_id: claseId },
    });

    return new Response(JSON.stringify({ 
      success: true, 
      mensaje,
      waUrl: `https://wa.me/?text=${encodeURIComponent(mensaje)}`
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (err) {
    console.error("send-whatsapp error:", err);
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});