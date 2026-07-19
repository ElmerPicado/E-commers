export type MaestroRole = 'maestro' | 'maestro_lider' | 'admin_maestros';
export type MaterialTipo = 'archivo' | 'enlace';
export type TareaTipo = 'video' | 'archivo' | 'cuestionario';
export type EntregaEstado = 'pendiente' | 'entregado' | 'revisado';

export interface Division {
  id: string;
  nombre: string;
  descripcion: string | null;
  codigo_acceso: string;
  activa: boolean;
  orden: number;
  created_at: string;
  updated_at: string;
}

export interface Seccion {
  id: string;
  nombre: string;
  descripcion: string | null;
  parent_id: string | null;
  orden: number;
  activa: boolean;
  created_at: string;
  updated_at: string;
  children?: Seccion[];
}

export interface MaestroUser {
  id: string;
  email: string;
  nombre: string;
  telefono: string | null;
  whatsapp: string | null;
  role: MaestroRole;
  division_id: string | null;
  avatar_url: string | null;
  activo: boolean;
  ultimo_acceso: string | null;
  created_at: string;
  updated_at: string;
  division?: Division | null;
}

export interface Material {
  id: string;
  seccion_id: string;
  titulo: string;
  descripcion: string | null;
  tipo: MaterialTipo;
  storage_path: string | null;
  url_externo: string | null;
  mime_type: string | null;
  tamano_bytes: number | null;
  creado_por: string;
  publicado_en_web: boolean;
  orden: number;
  created_at: string;
  updated_at: string;
  seccion?: Seccion;
  creado_por_user?: MaestroUser;
}

export interface ClaseProgramada {
  id: string;
  fecha: string;
  division_id: string;
  seccion_id: string;
  material_id: string | null;
  maestro_lider_id: string;
  maestro_asistente_id: string | null;
  titulo_clase: string;
  notas: string | null;
  enviada_notificacion: boolean;
  notificacion_enviada_en: string | null;
  created_at: string;
  updated_at: string;
  division?: Division;
  seccion?: Seccion;
  material?: Material | null;
  maestro_lider?: MaestroUser;
  maestro_asistente?: MaestroUser | null;
  tareas_count?: number;
}

export interface Estudiante {
  id: string;
  division_id: string;
  nombre: string;
  apellido: string;
  codigo_unico: string;
  fecha_nacimiento: string | null;
  tutor_nombre: string | null;
  tutor_telefono: string | null;
  tutor_email: string | null;
  activo: boolean;
  created_at: string;
  updated_at: string;
  division?: Division;
}

export interface Tarea {
  id: string;
  clase_programada_id: string;
  titulo: string;
  descripcion: string | null;
  tipo: TareaTipo;
  contenido_json: Record<string, unknown> | null;
  url_recurso: string | null;
  storage_path: string | null;
  fecha_asignada: string;
  fecha_entrega: string | null;
  creada_por: string;
  created_at: string;
  updated_at: string;
  clase_programada?: ClaseProgramada;
  creada_por_user?: MaestroUser;
}

export interface EntregaEstudiante {
  id: string;
  tarea_id: string;
  estudiante_id: string;
  estado: EntregaEstado;
  respuesta_json: Record<string, unknown> | null;
  url_entrega: string | null;
  storage_path: string | null;
  entregado_en: string | null;
  nota: number | null;
  feedback: string | null;
  revisado_por: string | null;
  revisado_en: string | null;
  created_at: string;
  updated_at: string;
  tarea?: Tarea;
  estudiante?: Estudiante;
  revisado_por_user?: MaestroUser;
}

export interface Notificacion {
  id: string;
  usuario_id: string;
  tipo: string;
  titulo: string;
  mensaje: string;
  datos_json: Record<string, unknown>;
  leida: boolean;
  created_at: string;
}

// ========== TIPOS PARA RPC ==========

export interface ClaseMaestroDTO {
  id: string;
  fecha: string;
  division_id: string;
  division_nombre: string;
  seccion_id: string;
  seccion_nombre: string;
  material_id: string | null;
  material_titulo: string | null;
  maestro_lider_id: string;
  maestro_lider_nombre: string;
  maestro_asistente_id: string | null;
  maestro_asistente_nombre: string | null;
  titulo_clase: string;
  notas: string | null;
  enviada_notificacion: boolean;
  tareas_count: number;
}

export interface TareaEstudianteDTO {
  tarea_id: string;
  tarea_titulo: string;
  tarea_descripcion: string;
  tarea_tipo: TareaTipo;
  tarea_fecha_entrega: string | null;
  clase_fecha: string;
  clase_titulo: string;
  division_nombre: string;
  seccion_nombre: string;
  url_recurso: string | null;
  contenido_json: Record<string, unknown> | null;
  estado: EntregaEstado;
  entregado_en: string | null;
  nota: number | null;
  feedback: string | null;
}

export interface EstudianteLoginDTO {
  id: string;
  nombre: string;
  apellido: string;
  division_id: string;
  division_nombre: string;
  division_codigo: string;
}

export interface WhatsAppMensajeDTO {
  success: boolean;
  mensaje: string;
  waUrl: string;
}

export interface UploadResponse {
  success: boolean;
  error?: string;
  path?: string;
  publicUrl?: string;
}

// ========== FORM TYPES ==========

export interface CreateClaseForm {
  fecha: string;
  division_id: string;
  seccion_id: string;
  material_id?: string;
  maestro_asistente_id?: string;
  titulo_clase: string;
  notas?: string;
  enviar_whatsapp?: boolean;
}

export interface CreateMaterialForm {
  seccion_id: string;
  titulo: string;
  descripcion?: string;
  tipo: MaterialTipo;
  file?: File;
  url_externo?: string;
  publicado_en_web?: boolean;
}

export interface CreateTareaForm {
  clase_programada_id: string;
  titulo: string;
  descripcion?: string;
  tipo: TareaTipo;
  contenido_json?: Record<string, unknown>;
  url_recurso?: string;
  file?: File;
  fecha_entrega?: string;
}

export interface EntregarTareaForm {
  tarea_id: string;
  estudiante_id: string;
  respuesta_json?: Record<string, unknown>;
  url_entrega?: string;
  file?: File;
}

export interface RevisarEntregaForm {
  entrega_id: string;
  maestro_id: string;
  estado: EntregaEstado;
  nota?: number;
  feedback?: string;
}

// ========== UI TYPES ==========

export interface SeccionTreeNode extends Seccion {
  children: SeccionTreeNode[];
  level: number;
  isOpen?: boolean;
}

export interface DashboardStats {
  proximasClases: number;
  materialesNuevos: number;
  tareasPendientesRevision: number;
  entregasPendientes: number;
  notificacionesNoLeidas: number;
}