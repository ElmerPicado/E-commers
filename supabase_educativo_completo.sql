-- ============================================================
-- IMR4 - PLATAFORMA EDUCATIVA MAESTROS + AULAS VIRTUALES
-- Ejecutar en Supabase SQL Editor (proyecto existente)
-- ============================================================

-- Extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- 1. ENUMS
-- ============================================================
CREATE TYPE maestro_role AS ENUM ('maestro', 'maestro_lider', 'admin_maestros');
CREATE TYPE material_tipo AS ENUM ('archivo', 'enlace');
CREATE TYPE tarea_tipo AS ENUM ('video', 'archivo', 'cuestionario');
CREATE TYPE entrega_estado AS ENUM ('pendiente', 'entregado', 'revisado');

-- ============================================================
-- 2. TABLA: DIVISIONES (Grupos de niños)
-- ============================================================
CREATE TABLE divisiones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    codigo_acceso VARCHAR(20) UNIQUE NOT NULL, -- ej: "GENESIS-2026"
    activa BOOLEAN DEFAULT TRUE,
    orden INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_divisiones_codigo ON divisiones(codigo_acceso);
CREATE INDEX idx_divisiones_activa ON divisiones(activa);

-- ============================================================
-- 3. TABLA: SECCIONES (Categorías anidadas para biblioteca)
-- ============================================================
CREATE TABLE secciones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT,
    parent_id UUID REFERENCES secciones(id) ON DELETE SET NULL,
    orden INT DEFAULT 0,
    activa BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_secciones_parent ON secciones(parent_id);
CREATE INDEX idx_secciones_activa ON secciones(activa);

-- ============================================================
-- 4. TABLA: MAESTRO_USERS (Perfil extendido de auth.users)
-- ============================================================
CREATE TABLE maestro_users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    nombre VARCHAR(150) NOT NULL,
    telefono VARCHAR(30),
    whatsapp VARCHAR(30),
    role maestro_role DEFAULT 'maestro',
    division_id UUID REFERENCES divisiones(id) ON DELETE SET NULL,
    avatar_url TEXT,
    activo BOOLEAN DEFAULT TRUE,
    ultimo_acceso TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_maestro_users_role ON maestro_users(role);
CREATE INDEX idx_maestro_users_division ON maestro_users(division_id);
CREATE INDEX idx_maestro_users_activo ON maestro_users(activo);

-- ============================================================
-- 5. TABLA: MATERIALES (Biblioteca)
-- ============================================================
CREATE TABLE materiales (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    seccion_id UUID NOT NULL REFERENCES secciones(id) ON DELETE RESTRICT,
    titulo VARCHAR(200) NOT NULL,
    descripcion TEXT,
    tipo material_tipo NOT NULL DEFAULT 'archivo',
    storage_path TEXT,          -- path en Supabase Storage (bucket: materiales)
    url_externo TEXT,           -- si tipo = 'enlace'
    mime_type VARCHAR(100),
    tamaño_bytes BIGINT,
    creado_por UUID NOT NULL REFERENCES maestro_users(id) ON DELETE RESTRICT,
    publicado_en_web BOOLEAN DEFAULT FALSE, -- para videoteca
    orden INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_materiales_seccion ON materiales(seccion_id);
CREATE INDEX idx_materiales_creado_por ON materiales(creado_por);
CREATE INDEX idx_materiales_tipo ON materiales(tipo);

-- ============================================================
-- 6. TABLA: CLASES_PROGRAMADAS (Calendario / Roles)
-- ============================================================
CREATE TABLE clases_programadas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    fecha DATE NOT NULL,
    division_id UUID NOT NULL REFERENCES divisiones(id) ON DELETE RESTRICT,
    seccion_id UUID NOT NULL REFERENCES secciones(id) ON DELETE RESTRICT,
    material_id UUID REFERENCES materiales(id) ON DELETE SET NULL,
    maestro_lider_id UUID NOT NULL REFERENCES maestro_users(id) ON DELETE RESTRICT,
    maestro_asistente_id UUID REFERENCES maestro_users(id) ON DELETE SET NULL,
    titulo_clase VARCHAR(200) NOT NULL,
    notas TEXT,
    enviada_notificacion BOOLEAN DEFAULT FALSE,
    notificacion_enviada_en TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_clases_fecha ON clases_programadas(fecha);
CREATE INDEX idx_clases_division ON clases_programadas(division_id);
CREATE INDEX idx_clases_lider ON clases_programadas(maestro_lider_id);
CREATE INDEX idx_clases_asistente ON clases_programadas(maestro_asistente_id);

-- ============================================================
-- 7. TABLA: ESTUDIANTES (Niños con código de acceso)
-- ============================================================
CREATE TABLE estudiantes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    division_id UUID NOT NULL REFERENCES divisiones(id) ON DELETE RESTRICT,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    codigo_unico VARCHAR(30) UNIQUE NOT NULL, -- para login estudiante
    fecha_nacimiento DATE,
    tutor_nombre VARCHAR(200),
    tutor_telefono VARCHAR(30),
    tutor_email VARCHAR(255),
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_estudiantes_division ON estudiantes(division_id);
CREATE INDEX idx_estudiantes_codigo ON estudiantes(codigo_unico);
CREATE INDEX idx_estudiantes_activo ON estudiantes(activo);

-- ============================================================
-- 8. TABLA: TAREAS (Aula virtual)
-- ============================================================
CREATE TABLE tareas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clase_programada_id UUID NOT NULL REFERENCES clases_programadas(id) ON DELETE CASCADE,
    titulo VARCHAR(200) NOT NULL,
    descripcion TEXT,
    tipo tarea_tipo NOT NULL DEFAULT 'archivo',
    contenido_json JSONB,        -- para cuestionarios: {preguntas: [...]}
    url_recurso TEXT,            -- video URL, archivo path, etc.
    storage_path TEXT,           -- si archivo subido a Storage
    fecha_asignada DATE DEFAULT CURRENT_DATE,
    fecha_entrega DATE,
    creada_por UUID NOT NULL REFERENCES maestro_users(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tareas_clase ON tareas(clase_programada_id);
CREATE INDEX idx_tareas_fecha_entrega ON tareas(fecha_entrega);
CREATE INDEX idx_tareas_creada_por ON tareas(creada_por);

-- ============================================================
-- 9. TABLA: ENTREGAS_ESTUDIANTES
-- ============================================================
CREATE TABLE entregas_estudiantes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tarea_id UUID NOT NULL REFERENCES tareas(id) ON DELETE CASCADE,
    estudiante_id UUID NOT NULL REFERENCES estudiantes(id) ON DELETE CASCADE,
    estado entrega_estado DEFAULT 'pendiente',
    respuesta_json JSONB,        -- respuestas a cuestionario
    url_entrega TEXT,            -- archivo subido, enlace, etc.
    storage_path TEXT,
    entregado_en TIMESTAMPTZ,
    nota DECIMAL(4,2),           -- 0.00 a 10.00
    feedback TEXT,
    revisado_por UUID REFERENCES maestro_users(id) ON DELETE SET NULL,
    revisado_en TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(tarea_id, estudiante_id) -- una entrega por tarea/estudiante
);

CREATE INDEX idx_entregas_tarea ON entregas_estudiantes(tarea_id);
CREATE INDEX idx_entregas_estudiante ON entregas_estudiantes(estudiante_id);
CREATE INDEX idx_entregas_estado ON entregas_estudiantes(estado);

-- ============================================================
-- 10. TABLA: NOTIFICACIONES (In-app)
-- ============================================================
CREATE TABLE notificaciones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID NOT NULL REFERENCES maestro_users(id) ON DELETE CASCADE,
    tipo VARCHAR(50) NOT NULL,   -- 'nueva_clase', 'material_nuevo', 'entrega_pendiente', etc.
    titulo VARCHAR(200) NOT NULL,
    mensaje TEXT,
    datos_json JSONB,            -- {clase_id, tarea_id, etc.}
    leida BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notificaciones_usuario ON notificaciones(usuario_id, leida, created_at DESC);

-- ============================================================
-- 11. FUNCIONES Y TRIGGERS
-- ============================================================

-- Trigger updated_at genérico
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger updated_at a todas las tablas
DO $$
DECLARE
    t TEXT;
BEGIN
    FOR t IN
        SELECT tablename FROM pg_tables
        WHERE schemaname = 'public'
        AND tablename IN (
            'divisiones','secciones','maestro_users','materiales',
            'clases_programadas','estudiantes','tareas',
            'entregas_estudiantes','notificaciones'
        )
    LOOP
        EXECUTE format('
            DROP TRIGGER IF EXISTS trigger_updated_at ON %I;
            CREATE TRIGGER trigger_updated_at
            BEFORE UPDATE ON %I
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
        ', t, t);
    END LOOP;
END $$;

-- Función: Generar código único para estudiante
CREATE OR REPLACE FUNCTION generar_codigo_estudiante(p_division_codigo TEXT)
RETURNS TEXT AS $$
DECLARE
    v_codigo TEXT;
    v_contador INT;
BEGIN
    SELECT COUNT(*) + 1 INTO v_contador
    FROM estudiantes e
    JOIN divisiones d ON e.division_id = d.id
    WHERE d.codigo_acceso = p_division_codigo;
    
    v_codigo := UPPER(p_division_codigo) || '-' || LPAD(v_contador::TEXT, 3, '0');
    RETURN v_codigo;
END;
$$ LANGUAGE plpgsql;

-- Función: Crear notificación
CREATE OR REPLACE FUNCTION crear_notificacion(
    p_usuario_id UUID,
    p_tipo TEXT,
    p_titulo TEXT,
    p_mensaje TEXT,
    p_datos JSONB DEFAULT '{}'::JSONB
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO notificaciones (usuario_id, tipo, titulo, mensaje, datos_json)
    VALUES (p_usuario_id, p_tipo, p_titulo, p_mensaje, p_datos);
END;
$$ LANGUAGE plpgsql;

-- Función: Notificar asignación de clase (para WhatsApp)
CREATE OR REPLACE FUNCTION generar_mensaje_whatsapp_clase(p_clase_id UUID)
RETURNS TEXT AS $$
DECLARE
    v_mensaje TEXT;
    v_clase RECORD;
    v_division TEXT;
    v_seccion TEXT;
    v_material TEXT;
    v_lider TEXT;
    v_asistente TEXT;
BEGIN
    SELECT cp.*, d.nombre as div_nombre, s.nombre as sec_nombre,
           m.titulo as mat_titulo,
           ml.nombre as lider_nombre,
           ma.nombre as asistente_nombre
    INTO v_clase
    FROM clases_programadas cp
    JOIN divisiones d ON cp.division_id = d.id
    JOIN secciones s ON cp.seccion_id = s.id
    LEFT JOIN materiales m ON cp.material_id = m.id
    JOIN maestro_users ml ON cp.maestro_lider_id = ml.id
    LEFT JOIN maestro_users ma ON cp.maestro_asistente_id = ma.id
    WHERE cp.id = p_clase_id;
    
    v_mensaje := '📅 *CLASE PROGRAMADA* 📅' || E'\n\n';
    v_mensaje := v_mensaje || '📆 *Fecha:* ' || TO_CHAR(v_clase.fecha, 'DD/MM/YYYY') || E'\n';
    v_mensaje := v_mensaje || '👥 *División:* ' || v_clase.div_nombre || E'\n';
    v_mensaje := v_mensaje || '📖 *Tema:* ' || v_clase.titulo_clase || E'\n';
    v_mensaje := v_mensaje || '📚 *Sección:* ' || v_clase.sec_nombre || E'\n';
    
    IF v_clase.mat_titulo IS NOT NULL THEN
        v_mensaje := v_mensaje || '📎 *Material:* ' || v_clase.mat_titulo || E'\n';
    END IF;
    
    v_mensaje := v_mensaje || '👨‍🏫 *Maestro:* ' || v_clase.lider_nombre;
    IF v_clase.asistente_nombre IS NOT NULL THEN
        v_mensaje := v_mensaje || ' | 👥 *Asistente:* ' || v_clase.asistente_nombre;
    END IF;
    v_mensaje := v_mensaje || E'\n\n';
    
    -- Verificar si hay tareas
    IF EXISTS (SELECT 1 FROM tareas WHERE clase_programada_id = p_clase_id) THEN
        v_mensaje := v_mensaje || '📝 *Tareas asignadas:* Sí' || E'\n';
    END IF;
    
    v_mensaje := v_mensaje || E'\n✅ *Por favor confirme asistencia*';
    v_mensaje := v_mensaje || E'\n\n_IMR4 Niños - Plataforma Educativa_';
    
    RETURN v_mensaje;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- 12. ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE divisiones ENABLE ROW LEVEL SECURITY;
ALTER TABLE secciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE maestro_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE materiales ENABLE ROW LEVEL SECURITY;
ALTER TABLE clases_programadas ENABLE ROW LEVEL SECURITY;
ALTER TABLE estudiantes ENABLE ROW LEVEL SECURITY;
ALTER TABLE tareas ENABLE ROW LEVEL SECURITY;
ALTER TABLE entregas_estudiantes ENABLE ROW LEVEL SECURITY;
ALTER TABLE notificaciones ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- POLÍTICAS: DIVISIONES
-- ============================================================
-- Todos los maestros autenticados pueden ver divisiones activas
CREATE POLICY "divisiones_select_maestros" ON divisiones
    FOR SELECT TO authenticated
    USING (activa = TRUE);

-- Solo admin_maestros y maestro_lider pueden gestionar
CREATE POLICY "divisiones_all_admin_lider" ON divisiones
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM maestro_users
            WHERE id = auth.uid()
            AND role IN ('admin_maestros', 'maestro_lider')
            AND activo = TRUE
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM maestro_users
            WHERE id = auth.uid()
            AND role IN ('admin_maestros', 'maestro_lider')
            AND activo = TRUE
        )
    );

-- ============================================================
-- POLÍTICAS: SECCIONES
-- ============================================================
CREATE POLICY "secciones_select_maestros" ON secciones
    FOR SELECT TO authenticated
    USING (activa = TRUE);

CREATE POLICY "secciones_all_admin_lider" ON secciones
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM maestro_users
            WHERE id = auth.uid()
            AND role IN ('admin_maestros', 'maestro_lider')
            AND activo = TRUE
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM maestro_users
            WHERE id = auth.uid()
            AND role IN ('admin_maestros', 'maestro_lider')
            AND activo = TRUE
        )
    );

-- ============================================================
-- POLÍTICAS: MAESTRO_USERS
-- ============================================================
-- Cada usuario ve su propio perfil
CREATE POLICY "maestro_users_select_own" ON maestro_users
    FOR SELECT TO authenticated
    USING (id = auth.uid());

-- Líderes y admins ven todos los de su división (o todos si admin)
CREATE POLICY "maestro_users_select_lider_admin" ON maestro_users
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM maestro_users mu
            WHERE mu.id = auth.uid()
            AND mu.activo = TRUE
            AND (
                mu.role = 'admin_maestros'
                OR (mu.role = 'maestro_lider' AND mu.division_id = maestro_users.division_id)
            )
        )
    );

-- Solo admins pueden insertar/actualizar/borrar usuarios
CREATE POLICY "maestro_users_all_admin" ON maestro_users
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM maestro_users
            WHERE id = auth.uid()
            AND role = 'admin_maestros'
            AND activo = TRUE
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM maestro_users
            WHERE id = auth.uid()
            AND role = 'admin_maestros'
            AND activo = TRUE
        )
    );

-- ============================================================
-- POLÍTICAS: MATERIALES
-- ============================================================
-- Maestros ven materiales de secciones activas
CREATE POLICY "materiales_select_maestros" ON materiales
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM secciones s
            WHERE s.id = materiales.seccion_id
            AND s.activa = TRUE
        )
    );

-- Líderes y admins pueden gestionar materiales
CREATE POLICY "materiales_all_lider_admin" ON materiales
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM maestro_users
            WHERE id = auth.uid()
            AND role IN ('admin_maestros', 'maestro_lider')
            AND activo = TRUE
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM maestro_users
            WHERE id = auth.uid()
            AND role IN ('admin_maestros', 'maestro_lider')
            AND activo = TRUE
        )
    );

-- ============================================================
-- POLÍTICAS: CLASES_PROGRAMADAS
-- ============================================================
-- Maestros ven clases de su división (líder/asistente) o todas si admin
CREATE POLICY "clases_select_maestros" ON clases_programadas
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM maestro_users mu
            WHERE mu.id = auth.uid()
            AND mu.activo = TRUE
            AND (
                mu.role = 'admin_maestros'
                OR mu.role = 'maestro_lider'
                OR (mu.role = 'maestro' AND (
                    mu.id = clases_programadas.maestro_lider_id
                    OR mu.id = clases_programadas.maestro_asistente_id
                ))
            )
        )
    );

-- Solo líderes y admins pueden crear/editar/borrar clases
CREATE POLICY "clases_all_lider_admin" ON clases_programadas
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM maestro_users
            WHERE id = auth.uid()
            AND role IN ('admin_maestros', 'maestro_lider')
            AND activo = TRUE
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM maestro_users
            WHERE id = auth.uid()
            AND role IN ('admin_maestros', 'maestro_lider')
            AND activo = TRUE
        )
    );

-- ============================================================
-- POLÍTICAS: ESTUDIANTES
-- ============================================================
-- Líderes y admins ven estudiantes de sus divisiones
CREATE POLICY "estudiantes_select_lider_admin" ON estudiantes
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM maestro_users mu
            WHERE mu.id = auth.uid()
            AND mu.activo = TRUE
            AND (
                mu.role = 'admin_maestros'
                OR (mu.role = 'maestro_lider' AND mu.division_id = estudiantes.division_id)
            )
        )
    );

-- Solo líderes y admins pueden gestionar estudiantes
CREATE POLICY "estudiantes_all_lider_admin" ON estudiantes
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM maestro_users mu
            WHERE mu.id = auth.uid()
            AND mu.activo = TRUE
            AND (
                mu.role = 'admin_maestros'
                OR (mu.role = 'maestro_lider' AND mu.division_id = estudiantes.division_id)
            )
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM maestro_users mu
            WHERE mu.id = auth.uid()
            AND mu.activo = TRUE
            AND (
                mu.role = 'admin_maestros'
                OR (mu.role = 'maestro_lider' AND mu.division_id = estudiantes.division_id)
            )
        )
    );

-- ============================================================
-- POLÍTICAS: TAREAS
-- ============================================================
-- Maestros ven tareas de sus clases
CREATE POLICY "tareas_select_maestros" ON tareas
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM maestro_users mu
            JOIN clases_programadas cp ON cp.id = tareas.clase_programada_id
            WHERE mu.id = auth.uid()
            AND mu.activo = TRUE
            AND (
                mu.role = 'admin_maestros'
                OR mu.id = cp.maestro_lider_id
                OR mu.id = cp.maestro_asistente_id
            )
        )
    );

-- Líderes y admins gestionan tareas
CREATE POLICY "tareas_all_lider_admin" ON tareas
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM maestro_users mu
            JOIN clases_programadas cp ON cp.id = tareas.clase_programada_id
            WHERE mu.id = auth.uid()
            AND mu.activo = TRUE
            AND (
                mu.role = 'admin_maestros'
                OR mu.id = cp.maestro_lider_id
            )
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM maestro_users mu
            JOIN clases_programadas cp ON cp.id = tareas.clase_programada_id
            WHERE mu.id = auth.uid()
            AND mu.activo = TRUE
            AND (
                mu.role = 'admin_maestros'
                OR mu.id = cp.maestro_lider_id
            )
        )
    );

-- ============================================================
-- POLÍTICAS: ENTREGAS_ESTUDIANTES
-- ============================================================
-- Maestros (líder/asistente) ven entregas de sus tareas
CREATE POLICY "entregas_select_maestros" ON entregas_estudiantes
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM maestro_users mu
            JOIN tareas t ON t.id = entregas_estudiantes.tarea_id
            JOIN clases_programadas cp ON cp.id = t.clase_programada_id
            WHERE mu.id = auth.uid()
            AND mu.activo = TRUE
            AND (
                mu.role = 'admin_maestros'
                OR mu.id = cp.maestro_lider_id
                OR mu.id = cp.maestro_asistente_id
            )
        )
    );

-- Estudiantes ven SUS propias entregas (política separada para auth de estudiantes)
-- Nota: Los estudiantes usan login por código, no Supabase Auth directamente
-- Esta política es para cuando el maestro consulta entregas

-- Estudiantes insertan/actualizan sus entregas
CREATE POLICY "entregas_insert_estudiante" ON entregas_estudiantes
    FOR INSERT TO authenticated
    WITH CHECK (
        -- Validación vía función en frontend/edge function
        TRUE
    );

CREATE POLICY "entregas_update_estudiante" ON entregas_estudiantes
    FOR UPDATE TO authenticated
    USING (
        -- El estudiante solo actualiza su entrega pendiente
        entregas_estudiantes.estudiante_id IN (
            SELECT id FROM estudiantes WHERE codigo_unico = current_setting('app.current_student_codigo', TRUE)
        )
        AND entregas_estudiantes.estado = 'pendiente'
    )
    WITH CHECK (
        entregas_estudiantes.estudiante_id IN (
            SELECT id FROM estudiantes WHERE codigo_unico = current_setting('app.current_student_codigo', TRUE)
        )
    );

-- Maestros (líder) actualizan estado/nota/feedback
CREATE POLICY "entregas_update_maestro" ON entregas_estudiantes
    FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM maestro_users mu
            JOIN tareas t ON t.id = entregas_estudiantes.tarea_id
            JOIN clases_programadas cp ON cp.id = t.clase_programada_id
            WHERE mu.id = auth.uid()
            AND mu.activo = TRUE
            AND (
                mu.role = 'admin_maestros'
                OR mu.id = cp.maestro_lider_id
            )
        )
    );

-- ============================================================
-- POLÍTICAS: NOTIFICACIONES
-- ============================================================
CREATE POLICY "notificaciones_select_own" ON notificaciones
    FOR SELECT TO authenticated
    USING (usuario_id = auth.uid());

CREATE POLICY "notificaciones_update_own" ON notificaciones
    FOR UPDATE TO authenticated
    USING (usuario_id = auth.uid())
    WITH CHECK (usuario_id = auth.uid());

CREATE POLICY "notificaciones_insert_system" ON notificaciones
    FOR INSERT TO authenticated
    WITH CHECK (TRUE); -- Edge functions insertan

-- ============================================================
-- 13. STORAGE BUCKETS (Ejecutar en Storage o via Dashboard)
-- ============================================================
-- buckets: 'materiales', 'entregas', 'avatares'
-- Políticas de Storage se configuran en Dashboard > Storage > Policies
-- Ejemplo para bucket 'materiales':
--   - SELECT: authenticated users
--   - INSERT: authenticated users with role IN ('admin_maestros', 'maestro_lider')
--   - UPDATE/DELETE: owner or admin_maestros

-- ============================================================
-- 14. DATOS INICIALES (SEED)
-- ============================================================

-- División de ejemplo
INSERT INTO divisiones (nombre, descripcion, codigo_acceso, orden) VALUES
('Génesis', 'Niños 6-8 años - Primeros pasos en la fe', 'GENESIS-2026', 1),
('Éxodo', 'Niños 9-11 años - Caminando con Jesús', 'EXODO-2026', 2),
('Promesa', 'Pre-adolescentes 12-14 años - Creciendo en fe', 'PROMESA-2026', 3)
ON CONFLICT (codigo_acceso) DO NOTHING;

-- Secciones anidadas de ejemplo
WITH s1 AS (
    INSERT INTO secciones (nombre, descripcion, parent_id, orden) VALUES
    ('Antiguo Testamento', 'Historias y personajes del AT', NULL, 1),
    ('Nuevo Testamento', 'Vida de Jesús y la iglesia primitiva', NULL, 2),
    ('Valores Cristianos', 'Enseñanzas prácticas para la vida', NULL, 3),
    ('Navidad y Pascua', 'Celebraciones especiales', NULL, 4)
    ON CONFLICT DO NOTHING
    RETURNING id, nombre
),
s2 AS (
    INSERT INTO secciones (nombre, descripcion, parent_id, orden)
    SELECT 'Génesis: La Creación', 'Dios crea el mundo', id, 1 FROM s1 WHERE nombre = 'Antiguo Testamento'
    UNION ALL SELECT 'Éxodo: La Liberación', 'Moisés y el pueblo de Israel', id, 2 FROM s1 WHERE nombre = 'Antiguo Testamento'
    UNION ALL SELECT 'Los Evangelios', 'Vida y enseñanzas de Jesús', (SELECT id FROM s1 WHERE nombre = 'Nuevo Testamento'), 1
    UNION ALL SELECT 'Hechos de los Apóstoles', 'Nacimiento de la iglesia', (SELECT id FROM s1 WHERE nombre = 'Nuevo Testamento'), 2
    UNION ALL SELECT 'El Amor', 'Amar a Dios y al prójimo', (SELECT id FROM s1 WHERE nombre = 'Valores Cristianos'), 1
    UNION ALL SELECT 'La Obediencia', 'Seguir a Jesús', (SELECT id FROM s1 WHERE nombre = 'Valores Cristianos'), 2
    ON CONFLICT DO NOTHING
)
SELECT 1;

-- ============================================================
-- 15. USUARIO SUPER-ADMIN: imr4
-- ============================================================
-- INSTRUCCIONES:
-- 1. En Supabase Dashboard > Authentication > Users > "Add user"
--    Email: imr4@imr4.org (o el que uses)
--    Password: [segura]
--    Auto Confirm: ON
-- 2. Copiar el UUID generado y reemplazar 'REEMPLAZAR_CON_UUID_DE_AUTH' abajo
-- 3. Ejecutar este bloque:

-- INSERT INTO maestro_users (id, email, nombre, role, activo)
-- VALUES (
--     'REEMPLAZAR_CON_UUID_DE_AUTH',
--     'imr4@imr4.org',
--     'IMR4 Admin',
--     'admin_maestros',
--     TRUE
-- )
-- ON CONFLICT (id) DO UPDATE SET
--     role = 'admin_maestros',
--     activo = TRUE,
--     nombre = 'IMR4 Admin';

-- ============================================================
-- 16. FUNCIÓN RPC PARA LOGIN ESTUDIANTE (por código)
-- ============================================================
CREATE OR REPLACE FUNCTION validar_codigo_estudiante(p_codigo TEXT)
RETURNS TABLE (
    id UUID,
    nombre TEXT,
    apellido TEXT,
    division_id UUID,
    division_nombre TEXT,
    division_codigo TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT e.id, e.nombre, e.apellido, e.division_id, d.nombre, d.codigo_acceso
    FROM estudiantes e
    JOIN divisiones d ON e.division_id = d.id
    WHERE e.codigo_unico = UPPER(TRIM(p_codigo))
    AND e.activo = TRUE
    AND d.activa = TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- 17. FUNCIÓN RPC: OBTENER CLASES DE MAESTRO (Dashboard)
-- ============================================================
CREATE OR REPLACE FUNCTION obtener_clases_maestro(p_maestro_id UUID, p_desde DATE DEFAULT CURRENT_DATE, p_hasta DATE DEFAULT (CURRENT_DATE + INTERVAL '30 days'))
RETURNS TABLE (
    id UUID,
    fecha DATE,
    division_id UUID,
    division_nombre TEXT,
    seccion_id UUID,
    seccion_nombre TEXT,
    material_id UUID,
    material_titulo TEXT,
    maestro_lider_id UUID,
    maestro_lider_nombre TEXT,
    maestro_asistente_id UUID,
    maestro_asistente_nombre TEXT,
    titulo_clase TEXT,
    notas TEXT,
    enviada_notificacion BOOLEAN,
    tareas_count INT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        cp.id, cp.fecha, cp.division_id, d.nombre as division_nombre,
        cp.seccion_id, s.nombre as seccion_nombre,
        cp.material_id, m.titulo as material_titulo,
        cp.maestro_lider_id, ml.nombre as maestro_lider_nombre,
        cp.maestro_asistente_id, ma.nombre as maestro_asistente_nombre,
        cp.titulo_clase, cp.notas, cp.enviada_notificacion,
        COUNT(t.id) as tareas_count
    FROM clases_programadas cp
    JOIN divisiones d ON cp.division_id = d.id
    JOIN secciones s ON cp.seccion_id = s.id
    LEFT JOIN materiales m ON cp.material_id = m.id
    JOIN maestro_users ml ON cp.maestro_lider_id = ml.id
    LEFT JOIN maestro_users ma ON cp.maestro_asistente_id = ma.id
    LEFT JOIN tareas t ON t.clase_programada_id = cp.id
    WHERE (cp.maestro_lider_id = p_maestro_id OR cp.maestro_asistente_id = p_maestro_id)
    AND cp.fecha BETWEEN p_desde AND p_hasta
    GROUP BY cp.id, d.nombre, s.nombre, m.titulo, ml.nombre, ma.nombre
    ORDER BY cp.fecha ASC, cp.created_at ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- 18. FUNCIÓN RPC: OBTENER TAREAS DE ESTUDIANTE (Aula Virtual)
-- ============================================================
CREATE OR REPLACE FUNCTION obtener_tareas_estudiante(p_estudiante_id UUID)
RETURNS TABLE (
    tarea_id UUID,
    tarea_titulo TEXT,
    tarea_descripcion TEXT,
    tarea_tipo tarea_tipo,
    tarea_fecha_entrega DATE,
    clase_fecha DATE,
    clase_titulo TEXT,
    division_nombre TEXT,
    seccion_nombre TEXT,
    url_recurso TEXT,
    contenido_json JSONB,
    estado entrega_estado,
    entregado_en TIMESTAMPTZ,
    nota DECIMAL(4,2),
    feedback TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.id as tarea_id, t.titulo as tarea_titulo, t.descripcion as tarea_descripcion,
        t.tipo as tarea_tipo, t.fecha_entrega as tarea_fecha_entrega,
        cp.fecha as clase_fecha, cp.titulo_clase as clase_titulo,
        d.nombre as division_nombre, s.nombre as seccion_nombre,
        t.url_recurso, t.contenido_json,
        COALESCE(ee.estado, 'pendiente') as estado,
        ee.entregado_en, ee.nota, ee.feedback
    FROM tareas t
    JOIN clases_programadas cp ON t.clase_programada_id = cp.id
    JOIN divisiones d ON cp.division_id = d.id
    JOIN secciones s ON cp.seccion_id = s.id
    LEFT JOIN entregas_estudiantes ee ON ee.tarea_id = t.id AND ee.estudiante_id = p_estudiante_id
    WHERE cp.division_id = (SELECT division_id FROM estudiantes WHERE id = p_estudiante_id)
    AND t.fecha_entrega >= CURRENT_DATE - INTERVAL '30 days'
    ORDER BY t.fecha_entrega ASC, t.created_at ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- 19. FUNCIÓN RPC: ENTREGAR TAREA (Estudiante)
-- ============================================================
CREATE OR REPLACE FUNCTION entregar_tarea_estudiante(
    p_tarea_id UUID,
    p_estudiante_id UUID,
    p_respuesta_json JSONB DEFAULT NULL,
    p_url_entrega TEXT DEFAULT NULL,
    p_storage_path TEXT DEFAULT NULL
)
RETURNS TABLE (
    success BOOLEAN,
    mensaje TEXT,
    entrega_id UUID
) AS $$
DECLARE
    v_entrega_id UUID;
    v_existente BOOLEAN;
BEGIN
    -- Verificar que la tarea existe y pertenece a la división del estudiante
    IF NOT EXISTS (
        SELECT 1 FROM tareas t
        JOIN clases_programadas cp ON t.clase_programada_id = cp.id
        JOIN estudiantes e ON e.division_id = cp.division_id
        WHERE t.id = p_tarea_id AND e.id = p_estudiante_id
    ) THEN
        RETURN QUERY SELECT FALSE, 'Tarea no encontrada o no autorizada', NULL;
        RETURN;
    END IF;

    -- Verificar si ya existe entrega
    SELECT id INTO v_entrega_id FROM entregas_estudiantes
    WHERE tarea_id = p_tarea_id AND estudiante_id = p_estudiante_id;

    IF v_entrega_id IS NOT NULL THEN
        -- Actualizar entrega existente
        UPDATE entregas_estudiantes
        SET 
            estado = 'entregado',
            respuesta_json = COALESCE(p_respuesta_json, respuesta_json),
            url_entrega = COALESCE(p_url_entrega, url_entrega),
            storage_path = COALESCE(p_storage_path, storage_path),
            entregado_en = NOW(),
            updated_at = NOW()
        WHERE id = v_entrega_id
        RETURNING id INTO v_entrega_id;
        
        RETURN QUERY SELECT TRUE, 'Entrega actualizada correctamente', v_entrega_id;
    ELSE
        -- Crear nueva entrega
        INSERT INTO entregas_estudiantes (tarea_id, estudiante_id, estado, respuesta_json, url_entrega, storage_path, entregado_en)
        VALUES (p_tarea_id, p_estudiante_id, 'entregado', p_respuesta_json, p_url_entrega, p_storage_path, NOW())
        RETURNING id INTO v_entrega_id;
        
        RETURN QUERY SELECT TRUE, 'Entrega realizada correctamente', v_entrega_id;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- 20. FUNCIÓN RPC: REVISAR ENTREGA (Maestro Líder)
-- ============================================================
CREATE OR REPLACE FUNCTION revisar_entrega_maestro(
    p_entrega_id UUID,
    p_maestro_id UUID,
    p_estado entrega_estado,
    p_nota DECIMAL(4,2) DEFAULT NULL,
    p_feedback TEXT DEFAULT NULL
)
RETURNS TABLE (
    success BOOLEAN,
    mensaje TEXT
) AS $$
DECLARE
    v_tarea_id UUID;
    v_lider_id UUID;
BEGIN
    -- Verificar que el maestro es líder de la clase
    SELECT t.id, cp.maestro_lider_id INTO v_tarea_id, v_lider_id
    FROM entregas_estudiantes ee
    JOIN tareas t ON ee.tarea_id = t.id
    JOIN clases_programadas cp ON t.clase_programada_id = cp.id
    WHERE ee.id = p_entrega_id;

    IF v_lider_id IS NULL OR v_lider_id != p_maestro_id THEN
        RETURN QUERY SELECT FALSE, 'No autorizado para revisar esta entrega';
        RETURN;
    END IF;

    UPDATE entregas_estudiantes
    SET 
        estado = p_estado,
        nota = p_nota,
        feedback = p_feedback,
        revisado_por = p_maestro_id,
        revisado_en = NOW(),
        updated_at = NOW()
    WHERE id = p_entrega_id;

    RETURN QUERY SELECT TRUE, 'Entrega revisada correctamente';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- 21. PERMISOS PARA FUNCIONES RPC
-- ============================================================
GRANT EXECUTE ON FUNCTION validar_codigo_estudiante(TEXT) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION obtener_clases_maestro(UUID, DATE, DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION obtener_tareas_estudiante(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION entregar_tarea_estudiante(UUID, UUID, JSONB, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION revisar_entrega_maestro(UUID, UUID, entrega_estado, DECIMAL, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION generar_mensaje_whatsapp_clase(UUID) TO authenticated;

-- ============================================================
-- FIN DEL SCRIPT
-- ============================================================
-- Para verificar que todo se creó correctamente:
-- SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;
-- SELECT * FROM divisiones;
-- SELECT * FROM secciones ORDER BY parent_id NULLS FIRST, orden;