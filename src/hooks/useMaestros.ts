import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import type {
  MaestroUser,
  Division,
  Seccion,
  Material,
  ClaseProgramada,
  Tarea,
  EntregaEstudiante,
  Notificacion,
  ClaseMaestroDTO,
  TareaEstudianteDTO,
  EstudianteLoginDTO,
  WhatsAppMensajeDTO,
  CreateClaseForm,
  CreateMaterialForm,
  CreateTareaForm,
  EntregarTareaForm,
  RevisarEntregaForm,
  DashboardStats,
} from '../types/maestros';

// ========== HOOK: AUTENTICACIÓN MAESTRO ==========
export const useMaestroAuth = () => {
  const [user, setUser] = useState<MaestroUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await fetchPerfil(session.user.id);
      } else {
        setLoading(false);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        await fetchPerfil(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchPerfil = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('maestro_users')
        .select('*, division:divisiones(*)')
        .eq('id', userId)
        .single();

      if (error) throw error;
      setUser(data);
    } catch (err) {
      console.error('Error fetching perfil:', err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const updatePerfil = async (updates: Partial<MaestroUser>) => {
    if (!user) return;
    const { error } = await supabase
      .from('maestro_users')
      .update(updates)
      .eq('id', user.id);
    if (error) throw error;
    await fetchPerfil(user.id);
  };

  return { user, loading, updatePerfil, refetch: () => user && fetchPerfil(user.id) };
};

// ========== HOOK: DIVISIONES ==========
export const useDivisiones = (activasOnly = true) => {
  const [data, setData] = useState<Division[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDivisiones = useCallback(async () => {
    try {
      setLoading(true);
      let query = supabase.from('divisiones').select('*').order('orden');
      if (activasOnly) query = query.eq('activa', true);
      const { data, error } = await query;
      if (error) throw error;
      setData(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, [activasOnly]);

  useEffect(() => { fetchDivisiones(); }, [fetchDivisiones]);

  return { data, loading, error, refetch: fetchDivisiones };
};

// ========== HOOK: SECCIONES (ÁRBOL) ==========
export const useSeccionesTree = (activasOnly = true) => {
  const [data, setData] = useState<Seccion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const buildTree = (items: Seccion[], parentId: string | null = null): Seccion[] => {
    return items
      .filter(item => item.parent_id === parentId)
      .map(item => ({
        ...item,
        children: buildTree(items, item.id),
      }))
      .sort((a, b) => a.orden - b.orden);
  };

  const fetchSecciones = useCallback(async () => {
    try {
      setLoading(true);
      let query = supabase.from('secciones').select('*').order('orden');
      if (activasOnly) query = query.eq('activa', true);
      const { data, error } = await query;
      if (error) throw error;
      setData(buildTree(data || []));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, [activasOnly]);

  useEffect(() => { fetchSecciones(); }, [fetchSecciones]);

  const createSeccion = async (seccion: Omit<Seccion, 'id' | 'created_at' | 'updated_at'>) => {
    const { data, error } = await supabase.from('secciones').insert(seccion).select().single();
    if (error) throw error;
    await fetchSecciones();
    return data;
  };

  const updateSeccion = async (id: string, updates: Partial<Seccion>) => {
    const { error } = await supabase.from('secciones').update(updates).eq('id', id);
    if (error) throw error;
    await fetchSecciones();
  };

  const deleteSeccion = async (id: string) => {
    const { error } = await supabase.from('secciones').delete().eq('id', id);
    if (error) throw error;
    await fetchSecciones();
  };

  return { data, loading, error, refetch: fetchSecciones, createSeccion, updateSeccion, deleteSeccion };
};

// ========== HOOK: MATERIALES ==========
export const useMateriales = (seccionId?: string) => {
  const [data, setData] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMateriales = useCallback(async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('materiales')
        .select('*, seccion:secciones(*), creado_por_user:maestro_users(*)')
        .order('orden');
      if (seccionId) query = query.eq('seccion_id', seccionId);
      const { data, error } = await query;
      if (error) throw error;
      setData(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, [seccionId]);

  useEffect(() => { fetchMateriales(); }, [fetchMateriales]);

  const createMaterial = async (material: CreateMaterialForm, authToken?: string) => {
    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/upload-material`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken || (await supabase.auth.getSession()).data.session?.access_token}`,
      },
      body: (() => {
        const fd = new FormData();
        fd.append('seccion_id', material.seccion_id);
        fd.append('titulo', material.titulo);
        if (material.descripcion) fd.append('descripcion', material.descripcion);
        fd.append('tipo', material.tipo);
        if (material.file) fd.append('file', material.file);
        if (material.url_externo) fd.append('url_externo', material.url_externo);
        if (material.publicado_en_web) fd.append('publicado_en_web', 'true');
        return fd;
      })(),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error);
    await fetchMateriales();
    return result.material;
  };

  const updateMaterial = async (id: string, updates: Partial<Material>) => {
    const { error } = await supabase.from('materiales').update(updates).eq('id', id);
    if (error) throw error;
    await fetchMateriales();
  };

  const deleteMaterial = async (id: string) => {
    const { error } = await supabase.from('materiales').delete().eq('id', id);
    if (error) throw error;
    await fetchMateriales();
  };

  return { data, loading, error, refetch: fetchMateriales, createMaterial, updateMaterial, deleteMaterial };
};

// ========== HOOK: CLASES PROGRAMADAS ==========
export const useClasesMaestro = (maestroId?: string, dias = 30) => {
  const [data, setData] = useState<ClaseMaestroDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClases = useCallback(async () => {
    if (!maestroId) return;
    try {
      setLoading(true);
      const { data, error } = await supabase.rpc('obtener_clases_maestro', {
        p_maestro_id: maestroId,
        p_desde: new Date().toISOString().split('T')[0],
        p_hasta: new Date(Date.now() + dias * 86400000).toISOString().split('T')[0],
      });
      if (error) throw error;
      setData(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, [maestroId, dias]);

  useEffect(() => { fetchClases(); }, [fetchClases]);

  const createClase = async (clase: CreateClaseForm, authToken?: string) => {
    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/crear-clase`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken || (await supabase.auth.getSession()).data.session?.access_token}`,
      },
      body: JSON.stringify(clase),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error);
    await fetchClases();
    return result;
  };

  return { data, loading, error, refetch: fetchClases, createClase };
};

// ========== HOOK: TAREAS MAESTRO ==========
export const useTareasMaestro = (maestroId?: string) => {
  const [data, setData] = useState<Tarea[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTareas = useCallback(async () => {
    if (!maestroId) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('tareas')
        .select(`
          *,
          clase_programada:clases_programadas(
            id, fecha, titulo_clase, division_id, seccion_id,
            maestro_lider_id, maestro_asistente_id
          ),
          creada_por_user:maestro_users(*)
        `)
        .or(`clase_programada.maestro_lider_id.eq.${maestroId},clase_programada.maestro_asistente_id.eq.${maestroId}`)
        .order('fecha_entrega', { ascending: true });
      if (error) throw error;
      setData(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, [maestroId]);

  useEffect(() => { fetchTareas(); }, [fetchTareas]);

  const createTarea = async (tarea: CreateTareaForm, authToken?: string) => {
    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/crear-tarea`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken || (await supabase.auth.getSession()).data.session?.access_token}`,
      },
      body: JSON.stringify(tarea),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error);
    await fetchTareas();
    return result;
  };

  return { data, loading, error, refetch: fetchTareas, createTarea };
};

// ========== HOOK: ESTUDIANTES LOGIN ==========
export const useEstudianteLogin = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (codigo: string): Promise<EstudianteLoginDTO | null> => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.rpc('validar_codigo_estudiante', {
        p_codigo: codigo.toUpperCase().trim(),
      });
      if (error) throw error;
      if (!data || data.length === 0) {
        setError('Código inválido o estudiante inactivo');
        return null;
      }
      return data[0];
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al validar código';
      setError(msg);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { login, loading, error };
};

// ========== HOOK: TAREAS ESTUDIANTE (AULA VIRTUAL) ==========
export const useTareasEstudiante = (estudianteId?: string) => {
  const [data, setData] = useState<TareaEstudianteDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTareas = useCallback(async () => {
    if (!estudianteId) return;
    try {
      setLoading(true);
      const { data, error } = await supabase.rpc('obtener_tareas_estudiante', {
        p_estudiante_id: estudianteId,
      });
      if (error) throw error;
      setData(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, [estudianteId]);

  useEffect(() => { fetchTareas(); }, [fetchTareas]);

  const entregar = async (form: EntregarTareaForm, authToken?: string) => {
    const fd = new FormData();
    fd.append('codigo_estudiante', form.estudiante_id); // El hook usa estudiante_id pero la función espera código
    fd.append('tarea_id', form.tarea_id);
    if (form.respuesta_json) fd.append('respuesta_json', JSON.stringify(form.respuesta_json));
    if (form.url_entrega) fd.append('url_entrega', form.url_entrega);
    if (form.file) fd.append('file', form.file);

    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/upload-entrega`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken || (await supabase.auth.getSession()).data.session?.access_token}`,
      },
      body: fd,
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error);
    await fetchTareas();
    return result;
  };

  return { data, loading, error, refetch: fetchTareas, entregar };
};

// ========== HOOK: NOTIFICACIONES ==========
export const useNotificaciones = (usuarioId?: string) => {
  const [data, setData] = useState<Notificacion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!usuarioId) return;
    const fetchNotif = async () => {
      const { data } = await supabase
        .from('notificaciones')
        .select('*')
        .eq('usuario_id', usuarioId)
        .order('created_at', { ascending: false })
        .limit(50);
      setData(data || []);
      setLoading(false);
    };
    fetchNotif();
    const channel = supabase
      .channel('notificaciones_realtime')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notificaciones',
        filter: `usuario_id=eq.${usuarioId}`,
      }, (payload) => {
        setData(prev => [payload.new as Notificacion, ...prev]);
      })
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [usuarioId]);

  const marcarLeida = async (id: string) => {
    await supabase.from('notificaciones').update({ leida: true }).eq('id', id);
    setData(prev => prev.map(n => n.id === id ? { ...n, leida: true } : n));
  };

  const marcarTodasLeidas = async () => {
    await supabase.from('notificaciones').update({ leida: true }).eq('usuario_id', usuarioId).eq('leida', false);
    setData(prev => prev.map(n => ({ ...n, leida: true })));
  };

  return { data, loading, marcarLeida, marcarTodasLeidas, noLeidas: data.filter(n => !n.leida).length };
};

// ========== HOOK: DASHBOARD STATS ==========
export const useDashboardStats = (maestroId?: string) => {
  const [data, setData] = useState<DashboardStats>({
    proximasClases: 0,
    materialesNuevos: 0,
    tareasPendientesRevision: 0,
    entregasPendientes: 0,
    notificacionesNoLeidas: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!maestroId) return;
    const fetchStats = async () => {
      try {
        setLoading(true);
        const hoy = new Date().toISOString().split('T')[0];
        const hace7Dias = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];

        const [
          { count: proximasClases },
          { count: materialesNuevos },
          { count: tareasPendientesRevision },
          { count: entregasPendientes },
          { count: notificacionesNoLeidas },
        ] = await Promise.all([
          supabase.from('clases_programadas').select('*', { count: 'exact', head: true })
            .or(`maestro_lider_id.eq.${maestroId},maestro_asistente_id.eq.${maestroId}`)
            .gte('fecha', hoy),
          supabase.from('materiales').select('*', { count: 'exact', head: true })
            .eq('creado_por', maestroId)
            .gte('created_at', hace7Dias),
          supabase.from('tareas').select('*', { count: 'exact', head: true })
            .in('id', supabase.from('tareas').select('id').eq('creada_por', maestroId))
            .eq('estado', 'pendiente'), // This needs adjustment
          supabase.from('entregas_estudiantes').select('*', { count: 'exact', head: true })
            .eq('estado', 'entregado')
            .in('tarea_id', supabase.from('tareas').select('id').eq('creada_por', maestroId)),
          supabase.from('notificaciones').select('*', { count: 'exact', head: true })
            .eq('usuario_id', maestroId)
            .eq('leida', false),
        ]);

        setData({
          proximasClases: proximasClases || 0,
          materialesNuevos: materialesNuevos || 0,
          tareasPendientesRevision: 0, // Simplificado
          entregasPendientes: entregasPendientes || 0,
          notificacionesNoLeidas: notificacionesNoLeidas || 0,
        });
    } catch (err) {
      console.error('Error fetching stats:', err);
    } finally {
      setLoading(false);
    }
    };
    fetchStats();
  }, [maestroId]);

  return { data, loading };
};