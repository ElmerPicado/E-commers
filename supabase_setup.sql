-- ==========================================================
-- SCRIPT DE CONFIGURACIÓN COMPLETO PARA SUPABASE (IMR4)
-- Copia y pega este script en el editor SQL de tu panel de Supabase
-- ==========================================================

-- 1. Crear tabla de álbumes (galería)
CREATE TABLE IF NOT EXISTS albums (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  date TEXT NOT NULL,
  photos TEXT[] NOT NULL DEFAULT '{}',
  ministry_id TEXT NOT NULL DEFAULT 'unanimes',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Crear tabla de configuración de streaming (video y radio)
CREATE TABLE IF NOT EXISTS streaming_config (
  id TEXT PRIMARY KEY DEFAULT 'main',
  live_title TEXT NOT NULL DEFAULT 'Culto de Adoración - IMR4',
  live_url TEXT NOT NULL DEFAULT 'https://www.youtube.com/embed/5qap5aO4i9A',
  is_live BOOLEAN NOT NULL DEFAULT false,
  radio_title TEXT NOT NULL DEFAULT 'Radio IMR4 - Música de Bendición',
  radio_url TEXT NOT NULL DEFAULT 'https://stream.zeno.fm/f3s8m3n8vy8uv',
  is_radio_live BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Tabla de Secciones de Inicio (Estilo Banners PAS.cr)
CREATE TABLE IF NOT EXISTS home_sections (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT NOT NULL,
  bg_image TEXT NOT NULL,
  button_text TEXT,
  button_url TEXT,
  schedules JSONB NOT NULL DEFAULT '[]'::jsonb,
  order_index INTEGER NOT NULL
);

-- 4. Tabla de Ministerios Dinámicos
CREATE TABLE IF NOT EXISTS ministries (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  hero_title TEXT NOT NULL,
  hero_desc TEXT NOT NULL,
  accent_color TEXT NOT NULL,
  icon_name TEXT NOT NULL,
  pillars JSONB NOT NULL DEFAULT '[]'::jsonb,
  schedule TEXT NOT NULL,
  location TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_link TEXT NOT NULL
);

-- 5. Tabla de Próximas Actividades (Calendario)
CREATE TABLE IF NOT EXISTS activities (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT,
  ministry_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================================
-- INSERCIÓN DE DATOS INICIALES POR DEFECTO
-- ==========================================================

-- A. Configuración de Streaming
INSERT INTO streaming_config (
  id, live_title, live_url, is_live, radio_title, radio_url, is_radio_live
) VALUES (
  'main', 
  'Culto de Adoración y Palabra - IMR4 Domingo', 
  'https://www.youtube.com/embed/5qap5aO4i9A', 
  true, 
  'Radio IMR4 - Música de Bendición', 
  'https://stream.zeno.fm/f3s8m3n8vy8uv', 
  false
)
ON CONFLICT (id) DO NOTHING;

-- B. Banners de Inicio (Estilo PAS.cr)
INSERT INTO home_sections (id, title, subtitle, bg_image, button_text, button_url, schedules, order_index) VALUES
('hero', 'Iglesia Metodista Río Cuarto', 'Un espacio de gracia, fe y esperanza en Río Cuarto.', 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1600&q=80', 'Ver Culto en Vivo', '/live', '[]'::jsonb, 1),
('horarios_banner', 'Nuestros Horarios de Culto', 'Acompáñanos en nuestros horarios generales.', 'https://images.unsplash.com/photo-1438029071396-1e831a7fa6d8?w=1600&q=80', 'Ver en vivo', '/live', '[{"day": "Domingo", "time": "10:00 AM", "desc": "Culto de Adoración"}, {"day": "Domingo", "time": "18:00 PM", "desc": "Culto de Jóvenes"}]'::jsonb, 2)
ON CONFLICT (id) DO NOTHING;

-- C. Ministerios por Defecto
INSERT INTO ministries (id, name, description, hero_title, hero_desc, accent_color, icon_name, pillars, schedule, location, contact_email, contact_link) VALUES
('unanimes', 'Unánimes - Jóvenes', 'Nuestra red de jóvenes apasionados. Un espacio dinámico, moderno y lleno de propósito.', 'Un Solo Corazón, Una Sola Visión', 'Somos la juventud de IMR4. Un espacio diseñado especialmente para ti, donde conectamos con Dios.', '#06b6d4', 'Flame', '[{"icon": "Calendar", "title": "¿Cuándo nos reunimos?", "desc": "Sábados desde las 20:30 hs."}, {"icon": "MapPin", "title": "¿Dónde?", "desc": "Salón principal de IMR4."}, {"icon": "Users", "title": "Grupos Pequeños", "desc": "Reuniones semanales en hogares."}]'::jsonb, 'Sábados 20:30 hs', 'Salón Principal', 'jovenes@imr4.org', 'https://wa.me/1'),
('mujeres', 'Ministerio de Mujeres', 'Unidas en fe y amor. Encuentros, talleres y edificación espiritual.', 'Mujeres de Fe y Propósito', 'Un espacio dedicado al crecimiento espiritual y apoyo mutuo de las mujeres de IMR4.', '#dc2626', 'Heart', '[{"icon": "Coffee", "title": "Té y Comunión", "desc": "Meriendas especiales y charlas."}, {"icon": "BookOpen", "title": "Estudios Bíblicos", "desc": "Estudios de personajes bíblicos."}, {"icon": "Calendar", "title": "Reunión General", "desc": "Viernes quincenales 18:00 hs."}]'::jsonb, 'Viernes quincenales 18:00 hs', 'Salón de Conferencias', 'mujeres@imr4.org', 'https://wa.me/2'),
('hombres', 'Ministerio de Hombres', 'Forjando hombres de valor. Grupos de crecimiento y apoyo mutuo.', 'Hombres de Valor y Carácter', 'Equipando a los varones para liderar con integridad y servir a sus familias.', '#10b981', 'Shield', '[{"icon": "Users", "title": "Desayunos de Fe", "desc": "Un sábado al mes con devocional."}, {"icon": "Briefcase", "title": "Liderazgo", "desc": "Principios bíblicos y desarrollo."}, {"icon": "Calendar", "title": "Reunión de Crecimiento", "desc": "Viernes quincenales 20:00 hs."}]'::jsonb, 'Viernes quincenales 20:00 hs', 'Auditorio Secundario', 'hombres@imr4.org', 'https://wa.me/3'),
('ninos', 'IMR4 Niños', 'Formando el semillero de fe. Actividades lúdicas y lecciones de valores.', 'Aprendiendo y Creciendo Juntos', 'Un ambiente seguro y divertido para los niños de Río Cuarto.', '#f97316', 'Sun', '[{"icon": "Smile", "title": "Clases por Edades", "desc": "Grupos adaptados de 3 a 11 años."}, {"icon": "Sparkles", "title": "Juegos y Creatividad", "desc": "Manualidades y música interactiva."}, {"icon": "Calendar", "title": "Horarios de Domingo", "desc": "Domingos simultáneos a las 10:00 hs."}]'::jsonb, 'Domingos 10:00 hs', 'Aulas Infantiles', 'ninos@imr4.org', 'https://wa.me/4')
ON CONFLICT (id) DO NOTHING;

-- D. Actividades Iniciales
INSERT INTO activities (id, title, date, time, description, image_url, ministry_id) VALUES
('event-1', 'Campamento de Invierno Unánimes', '2026-07-25', '14:00', 'Tres días de comunión, plenarias y deportes al aire libre.', 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80', 'unanimes'),
('event-2', 'Taller de Finanzas para Hombres', '2026-07-18', '09:00', 'Principios prácticos para el manejo familiar de finanzas.', 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80', 'hombres'),
('event-3', 'Fiesta Infantil Día del Amigo', '2026-07-20', '16:00', 'Juegos, obras y merienda especial para los niños de la iglesia.', 'https://images.unsplash.com/photo-1485546246426-74dc88dec4d9?w=800&q=80', 'ninos')
ON CONFLICT (id) DO NOTHING;

-- ==========================================================
-- HABILTAR POLÍTICAS DE SEGURIDAD (RLS)
-- ==========================================================
ALTER TABLE albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE streaming_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE home_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE ministries ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- 1. Políticas Albums
DROP POLICY IF EXISTS "Lectura pública de álbumes" ON albums;
DROP POLICY IF EXISTS "Escritura pública de álbumes" ON albums;
CREATE POLICY "Lectura pública de álbumes" ON albums FOR SELECT USING (true);
CREATE POLICY "Escritura pública de álbumes" ON albums FOR ALL USING (true) WITH CHECK (true);

-- 2. Políticas Streaming Config
DROP POLICY IF EXISTS "Lectura pública de streaming" ON streaming_config;
DROP POLICY IF EXISTS "Escritura pública de streaming" ON streaming_config;
CREATE POLICY "Lectura pública de streaming" ON streaming_config FOR SELECT USING (true);
CREATE POLICY "Escritura pública de streaming" ON streaming_config FOR ALL USING (true) WITH CHECK (true);

-- 3. Políticas Home Sections
DROP POLICY IF EXISTS "Lectura pública home_sections" ON home_sections;
DROP POLICY IF EXISTS "Escritura pública home_sections" ON home_sections;
CREATE POLICY "Lectura pública home_sections" ON home_sections FOR SELECT USING (true);
CREATE POLICY "Escritura pública home_sections" ON home_sections FOR ALL USING (true) WITH CHECK (true);

-- 4. Políticas Ministries
DROP POLICY IF EXISTS "Lectura pública ministries" ON ministries;
DROP POLICY IF EXISTS "Escritura pública ministries" ON ministries;
CREATE POLICY "Lectura pública ministries" ON ministries FOR SELECT USING (true);
CREATE POLICY "Escritura pública ministries" ON ministries FOR ALL USING (true) WITH CHECK (true);

-- 5. Políticas Activities
DROP POLICY IF EXISTS "Lectura pública activities" ON activities;
DROP POLICY IF EXISTS "Escritura pública activities" ON activities;
CREATE POLICY "Lectura pública activities" ON activities FOR SELECT USING (true);
CREATE POLICY "Escritura pública activities" ON activities FOR ALL USING (true) WITH CHECK (true);

-- ==========================================================
-- ACTUALIZACIÓN DE ESQUEMA (V2 y Redes Sociales)
-- Añadiendo columnas solicitadas
-- ==========================================================
ALTER TABLE ministries ADD COLUMN IF NOT EXISTS logo_url TEXT;
ALTER TABLE ministries ADD COLUMN IF NOT EXISTS hero_image TEXT;
ALTER TABLE ministries ADD COLUMN IF NOT EXISTS instagram_url TEXT;
ALTER TABLE ministries ADD COLUMN IF NOT EXISTS contact_title TEXT;
ALTER TABLE ministries ADD COLUMN IF NOT EXISTS contact_desc TEXT;
ALTER TABLE ministries ADD COLUMN IF NOT EXISTS contact_button_text TEXT;
ALTER TABLE albums ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE albums ADD COLUMN IF NOT EXISTS drive_link TEXT;
ALTER TABLE streaming_config ADD COLUMN IF NOT EXISTS church_logo_url TEXT;
ALTER TABLE streaming_config ADD COLUMN IF NOT EXISTS facebook_url TEXT;
ALTER TABLE streaming_config ADD COLUMN IF NOT EXISTS instagram_url TEXT;
ALTER TABLE streaming_config ADD COLUMN IF NOT EXISTS church_email TEXT;
ALTER TABLE streaming_config ADD COLUMN IF NOT EXISTS church_description TEXT;
ALTER TABLE streaming_config ADD COLUMN IF NOT EXISTS youtube_channel_url TEXT;


-- ==========================================================
-- ACTUALIZACIÓN DE ESQUEMA (V3: Radio Programs)
-- ==========================================================
CREATE TABLE IF NOT EXISTS radio_programs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  host TEXT,
  schedule_time TEXT,
  image_url TEXT,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE radio_programs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Lectura pública radio_programs" ON radio_programs;
DROP POLICY IF EXISTS "Escritura pública radio_programs" ON radio_programs;
CREATE POLICY "Lectura pública radio_programs" ON radio_programs FOR SELECT USING (true);
CREATE POLICY "Escritura pública radio_programs" ON radio_programs FOR ALL USING (true) WITH CHECK (true);

-- Crear tabla de categorias de devocionales
CREATE TABLE IF NOT EXISTS devotional_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Crear tabla de devocionales
CREATE TABLE IF NOT EXISTS devotionals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  category_id UUID REFERENCES devotional_categories(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  author_name TEXT NOT NULL,
  author_bio TEXT,
  author_photo TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'published', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Habilitar RLS para devocionales
ALTER TABLE devotional_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE devotionals ENABLE ROW LEVEL SECURITY;

-- Políticas para categorias (públicas para leer, autenticados para escribir)
DROP POLICY IF EXISTS "Categorías son públicas" ON devotional_categories;
CREATE POLICY "Categorías son públicas"
  ON devotional_categories FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Solo autenticados pueden modificar categorías" ON devotional_categories;
CREATE POLICY "Solo autenticados pueden modificar categorías"
  ON devotional_categories FOR ALL
  USING (auth.role() = 'authenticated');

-- Políticas para devocionales (públicos pueden insertar y leer publicados, autenticados todo)
DROP POLICY IF EXISTS "Cualquiera puede insertar devocionales (pending)" ON devotionals;
CREATE POLICY "Cualquiera puede insertar devocionales (pending)"
  ON devotionals FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Cualquiera puede leer devocionales publicados" ON devotionals;
CREATE POLICY "Cualquiera puede leer devocionales publicados"
  ON devotionals FOR SELECT
  USING (status = 'published' OR auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Solo autenticados pueden modificar devocionales" ON devotionals;
CREATE POLICY "Solo autenticados pueden modificar devocionales"
  ON devotionals FOR UPDATE
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Solo autenticados pueden eliminar devocionales" ON devotionals;
CREATE POLICY "Solo autenticados pueden eliminar devocionales"
  ON devotionals FOR DELETE
  USING (auth.role() = 'authenticated');

-- Trigger para updated_at en devotionals
DROP TRIGGER IF EXISTS handle_updated_at_devotionals ON devotionals;
CREATE TRIGGER handle_updated_at_devotionals
BEFORE UPDATE ON devotionals
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- ACTUALIZACIÓN DE ESQUEMA (V4: Google Maps y Ubicaciones)
-- ==========================================================
ALTER TABLE streaming_config ADD COLUMN IF NOT EXISTS church_address TEXT;
ALTER TABLE streaming_config ADD COLUMN IF NOT EXISTS church_maps_url TEXT;
ALTER TABLE streaming_config ADD COLUMN IF NOT EXISTS church_name TEXT DEFAULT 'IMR4';
ALTER TABLE ministries ADD COLUMN IF NOT EXISTS location_url TEXT;
ALTER TABLE activities ADD COLUMN IF NOT EXISTS location_url TEXT;

-- ==========================================================
-- INSTRUCCIONES PARA EL ALMACENAMIENTO (STORAGE):
-- 1. Ve a "Storage" en el menú izquierdo de Supabase.
-- 2. Haz clic en "New Bucket".
-- 3. Nómbralo: "photos".
-- 4. Asegúrate de activar la opción "Public" (Público).
-- 5. Haz clic en "Save".
-- ==========================================================

-- ==========================================================
-- 6. Políticas de Almacenamiento (Para permitir subir fotos)
-- Estas políticas permiten subir, actualizar y eliminar archivos en el bucket "photos".
-- ==========================================================
DROP POLICY IF EXISTS "Lectura pública storage" ON storage.objects;
DROP POLICY IF EXISTS "Inserción pública storage" ON storage.objects;
DROP POLICY IF EXISTS "Actualización pública storage" ON storage.objects;
DROP POLICY IF EXISTS "Eliminación pública storage" ON storage.objects;

CREATE POLICY "Lectura pública storage" ON storage.objects FOR SELECT USING (bucket_id = 'photos');
CREATE POLICY "Inserción pública storage" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'photos');
CREATE POLICY "Actualización pública storage" ON storage.objects FOR UPDATE USING (bucket_id = 'photos');
CREATE POLICY "Eliminación pública storage" ON storage.objects FOR DELETE USING (bucket_id = 'photos');

-- ==========================================================
-- ACTUALIZACIÓN DE ESQUEMA (V5: Noticias y Blogs)
-- ==========================================================
CREATE TABLE IF NOT EXISTS blog_posts (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Lectura pública blog_posts" ON blog_posts;
DROP POLICY IF EXISTS "Escritura pública blog_posts" ON blog_posts;
CREATE POLICY "Lectura pública blog_posts" ON blog_posts FOR SELECT USING (true);
CREATE POLICY "Escritura pública blog_posts" ON blog_posts FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'historia';
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS video_url TEXT;

-- ==========================================================
-- ACTUALIZACIÓN DE ESQUEMA (V6: Administradores)
-- ==========================================================
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Lectura pública admin_users" ON admin_users;
DROP POLICY IF EXISTS "Escritura pública admin_users" ON admin_users;
CREATE POLICY "Lectura pública admin_users" ON admin_users FOR SELECT USING (true);
CREATE POLICY "Escritura pública admin_users" ON admin_users FOR ALL USING (true) WITH CHECK (true);

-- Insertar usuario maestro si no existe
INSERT INTO admin_users (username, password)
SELECT 'imr4', 'r1558'
WHERE NOT EXISTS (
  SELECT 1 FROM admin_users WHERE username = 'imr4'
);

-- ==========================================================
-- ACTUALIZACIÓN DE ESQUEMA (V7: Formularios de Contacto)
-- ==========================================================
CREATE TABLE IF NOT EXISTS contact_forms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre TEXT NOT NULL,
  apellido TEXT NOT NULL,
  edad INTEGER NOT NULL,
  sexo TEXT NOT NULL,
  telefono TEXT NOT NULL,
  estado TEXT NOT NULL DEFAULT 'no_leido',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE contact_forms ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Lectura pública contact_forms" ON contact_forms;
DROP POLICY IF EXISTS "Escritura pública contact_forms" ON contact_forms;

CREATE POLICY "Lectura pública contact_forms" ON contact_forms FOR SELECT USING (true);
CREATE POLICY "Escritura pública contact_forms" ON contact_forms FOR ALL USING (true) WITH CHECK (true);

-- ==========================================================
-- ACTUALIZACIÓN DE ESQUEMA (V8: Autores Frecuentes Devocionales)
-- ==========================================================
CREATE TABLE IF NOT EXISTS devotional_authors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE,
  name TEXT NOT NULL,
  bio TEXT,
  photo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================================
-- ACTUALIZACIÓN DE ESQUEMA (V3: Radio Programs)
-- ==========================================================
CREATE TABLE IF NOT EXISTS radio_programs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  host TEXT,
  schedule_time TEXT,
  image_url TEXT,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE radio_programs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Lectura pública radio_programs" ON radio_programs;
DROP POLICY IF EXISTS "Escritura pública radio_programs" ON radio_programs;

-- Trigger para radio (comentado porque la tabla radio_programs no usa updated_at)
-- DROP TRIGGER IF EXISTS handle_updated_at_radio ON radio_programs;
-- CREATE TRIGGER handle_updated_at_radio
-- BEFORE UPDATE ON radio_programs
-- FOR EACH ROW
-- EXECUTE FUNCTION public.handle_updated_at();

-- Crear tabla de categorias de devocionales
CREATE TABLE IF NOT EXISTS devotional_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Crear tabla de devocionales
CREATE TABLE IF NOT EXISTS devotionals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  category_id UUID REFERENCES devotional_categories(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  author_name TEXT NOT NULL,
  author_bio TEXT,
  author_photo TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'published', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Habilitar RLS para devocionales
ALTER TABLE devotional_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE devotionals ENABLE ROW LEVEL SECURITY;

-- Políticas para categorias (públicas para leer, autenticados para escribir)
DROP POLICY IF EXISTS "Categorías son públicas" ON devotional_categories;
DROP POLICY IF EXISTS "Solo autenticados pueden modificar categorías" ON devotional_categories;
CREATE POLICY "Acceso total devotional_categories" ON devotional_categories FOR ALL USING (true) WITH CHECK (true);

-- Políticas para devocionales
DROP POLICY IF EXISTS "Cualquiera puede insertar devocionales (pending)" ON devotionals;
DROP POLICY IF EXISTS "Cualquiera puede leer devocionales publicados" ON devotionals;
DROP POLICY IF EXISTS "Solo autenticados pueden modificar devocionales" ON devotionals;
DROP POLICY IF EXISTS "Solo autenticados pueden eliminar devocionales" ON devotionals;
CREATE POLICY "Acceso total devotionals" ON devotionals FOR ALL USING (true) WITH CHECK (true);

-- Trigger para updated_at en devotionals
DROP TRIGGER IF EXISTS handle_updated_at_devotionals ON devotionals;
CREATE TRIGGER handle_updated_at_devotionals
BEFORE UPDATE ON devotionals
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

DROP POLICY IF EXISTS "Lectura pública radio_programs" ON radio_programs;
CREATE POLICY "Lectura pública radio_programs" ON radio_programs FOR SELECT USING (true);
DROP POLICY IF EXISTS "Escritura pública radio_programs" ON radio_programs;
CREATE POLICY "Escritura pública radio_programs" ON radio_programs FOR ALL USING (true) WITH CHECK (true);

-- ==========================================================
-- ACTUALIZACIÓN DE ESQUEMA (V4: Google Maps y Ubicaciones)
-- ==========================================================
ALTER TABLE streaming_config ADD COLUMN IF NOT EXISTS church_address TEXT;
ALTER TABLE streaming_config ADD COLUMN IF NOT EXISTS church_maps_url TEXT;
ALTER TABLE streaming_config ADD COLUMN IF NOT EXISTS church_name TEXT DEFAULT 'IMR4';
ALTER TABLE ministries ADD COLUMN IF NOT EXISTS location_url TEXT;
ALTER TABLE activities ADD COLUMN IF NOT EXISTS location_url TEXT;

-- ==========================================================
-- INSTRUCCIONES PARA EL ALMACENAMIENTO (STORAGE):
-- 1. Ve a "Storage" en el menú izquierdo de Supabase.
-- 2. Haz clic en "New Bucket".
-- 3. Nómbralo: "photos".
-- 4. Asegúrate de activar la opción "Public" (Público).
-- 5. Haz clic en "Save".
-- ==========================================================

-- ==========================================================
-- 6. Políticas de Almacenamiento (Para permitir subir fotos)
-- Estas políticas permiten subir, actualizar y eliminar archivos en el bucket "photos".
-- ==========================================================
DROP POLICY IF EXISTS "Lectura pública storage" ON storage.objects;
DROP POLICY IF EXISTS "Inserción pública storage" ON storage.objects;
DROP POLICY IF EXISTS "Actualización pública storage" ON storage.objects;
DROP POLICY IF EXISTS "Eliminación pública storage" ON storage.objects;

CREATE POLICY "Lectura pública storage" ON storage.objects FOR SELECT USING (bucket_id = 'photos');
CREATE POLICY "Inserción pública storage" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'photos');
CREATE POLICY "Actualización pública storage" ON storage.objects FOR UPDATE USING (bucket_id = 'photos');
CREATE POLICY "Eliminación pública storage" ON storage.objects FOR DELETE USING (bucket_id = 'photos');

-- ==========================================================
-- ACTUALIZACIÓN DE ESQUEMA (V5: Noticias y Blogs)
-- ==========================================================
CREATE TABLE IF NOT EXISTS blog_posts (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Lectura pública blog_posts" ON blog_posts;
DROP POLICY IF EXISTS "Escritura pública blog_posts" ON blog_posts;
CREATE POLICY "Lectura pública blog_posts" ON blog_posts FOR SELECT USING (true);
CREATE POLICY "Escritura pública blog_posts" ON blog_posts FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'historia';
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS video_url TEXT;

-- ==========================================================
-- ACTUALIZACIÓN DE ESQUEMA (V6: Administradores)
-- ==========================================================
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Lectura pública admin_users" ON admin_users;
DROP POLICY IF EXISTS "Escritura pública admin_users" ON admin_users;
CREATE POLICY "Lectura pública admin_users" ON admin_users FOR SELECT USING (true);
CREATE POLICY "Escritura pública admin_users" ON admin_users FOR ALL USING (true) WITH CHECK (true);

-- Insertar usuario maestro si no existe
INSERT INTO admin_users (username, password)
SELECT 'imr4', 'r1558'
WHERE NOT EXISTS (
  SELECT 1 FROM admin_users WHERE username = 'imr4'
);

-- ==========================================================
-- ACTUALIZACIÓN DE ESQUEMA (V7: Formularios de Contacto)
-- ==========================================================
CREATE TABLE IF NOT EXISTS contact_forms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre TEXT NOT NULL,
  apellido TEXT NOT NULL,
  edad INTEGER NOT NULL,
  sexo TEXT NOT NULL,
  telefono TEXT NOT NULL,
  estado TEXT NOT NULL DEFAULT 'no_leido',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE contact_forms ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Lectura pública contact_forms" ON contact_forms;
DROP POLICY IF EXISTS "Escritura pública contact_forms" ON contact_forms;

CREATE POLICY "Lectura pública contact_forms" ON contact_forms FOR SELECT USING (true);
CREATE POLICY "Escritura pública contact_forms" ON contact_forms FOR ALL USING (true) WITH CHECK (true);

-- ==========================================================
-- ACTUALIZACIÓN DE ESQUEMA (V8: Autores Frecuentes Devocionales)
-- ==========================================================
CREATE TABLE IF NOT EXISTS devotional_authors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE,
  name TEXT NOT NULL,
  bio TEXT,
  photo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE devotional_authors ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Lectura pública devotional_authors" ON devotional_authors;
DROP POLICY IF EXISTS "Escritura pública devotional_authors" ON devotional_authors;

-- Lectura pública porque necesitamos buscar el autor por el código antes de enviar
CREATE POLICY "Lectura pública devotional_authors" ON devotional_authors FOR SELECT USING (true);
-- Escritura pública porque los invitados se auto-registran
CREATE POLICY "Escritura pública devotional_authors" ON devotional_authors FOR ALL USING (true) WITH CHECK (true);

-- ==========================================================
-- ACTUALIZACIÓN DE ESQUEMA (V9: Versículo y Oración en Devocionales)
-- ==========================================================
ALTER TABLE devotionals ADD COLUMN IF NOT EXISTS verse TEXT;
ALTER TABLE devotionals ADD COLUMN IF NOT EXISTS prayer TEXT;

-- ==========================================================
-- ACTUALIZACIÓN DE ESQUEMA (V10: Slugs Amigables para SEO)
-- ==========================================================
ALTER TABLE devotionals ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;

-- ==========================================================
-- ACTUALIZACIÓN DE ESQUEMA (V11: Biblioteca de Recursos)
-- ==========================================================

-- 1. Categorías de Recursos
CREATE TABLE IF NOT EXISTS resource_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE resource_categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Lectura pública resource_categories" ON resource_categories;
DROP POLICY IF EXISTS "Escritura pública resource_categories" ON resource_categories;
CREATE POLICY "Lectura pública resource_categories" ON resource_categories FOR SELECT USING (true);
CREATE POLICY "Escritura pública resource_categories" ON resource_categories FOR ALL USING (true) WITH CHECK (true);

-- Datos por defecto para categorías de recursos
INSERT INTO resource_categories (name, description) VALUES
('Material de Estudio', 'Documentos, PDFs y guías para estudio bíblico y grupos pequeños.'),
('Enseñanzas y Sermones', 'Videos y audios de prédicas y series de enseñanzas.')
ON CONFLICT DO NOTHING;

-- 2. Recursos (Archivos, Enlaces, Videos)
CREATE TABLE IF NOT EXISTS resources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  category_id UUID REFERENCES resource_categories(id) ON DELETE SET NULL,
  type TEXT NOT NULL, -- 'document', 'video', 'link'
  file_url TEXT, -- URL de Storage de Supabase o URL externa
  status TEXT NOT NULL DEFAULT 'published',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Lectura pública resources" ON resources;
DROP POLICY IF EXISTS "Escritura pública resources" ON resources;
CREATE POLICY "Lectura pública resources" ON resources FOR SELECT USING (true);
CREATE POLICY "Escritura pública resources" ON resources FOR ALL USING (true) WITH CHECK (true);

-- ==========================================================
-- ACTUALIZACIÓN DE ESQUEMA (V12: Comentarios en Devocionales)
-- ==========================================================
CREATE TABLE IF NOT EXISTS devotional_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  devotional_id UUID REFERENCES devotionals(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE devotional_comments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Lectura pública devotional_comments" ON devotional_comments;
DROP POLICY IF EXISTS "Escritura pública devotional_comments" ON devotional_comments;
CREATE POLICY "Lectura pública devotional_comments" ON devotional_comments FOR SELECT USING (true);
CREATE POLICY "Escritura pública devotional_comments" ON devotional_comments FOR INSERT WITH CHECK (true);
CREATE POLICY "Eliminar por admins devotional_comments" ON devotional_comments FOR DELETE USING (auth.role() = 'authenticated');

-- ==========================================================
-- ACTUALIZACIÓN DE ESQUEMA (V13: Peticiones de Oración)
-- ==========================================================
ALTER TABLE contact_forms ALTER COLUMN telefono DROP NOT NULL;
ALTER TABLE contact_forms ADD COLUMN IF NOT EXISTS prayer_request TEXT;

-- ==========================================================
-- ACTUALIZACIÓN DE ESQUEMA (V14: Fondo de Formulario de Devocionales)
-- ==========================================================
ALTER TABLE streaming_config ADD COLUMN IF NOT EXISTS form_bg_url TEXT;

-- ==========================================================
-- ACTUALIZACIÓN DE ESQUEMA (V15: Chat en Vivo en Tiempo Real)
-- ==========================================================
CREATE TABLE IF NOT EXISTS live_chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_name TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE live_chat_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Lectura pública chat" ON live_chat_messages;
DROP POLICY IF EXISTS "Escritura pública chat" ON live_chat_messages;
DROP POLICY IF EXISTS "Borrado de administradores" ON live_chat_messages;

CREATE POLICY "Lectura pública chat" ON live_chat_messages FOR SELECT USING (true);
CREATE POLICY "Escritura pública chat" ON live_chat_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Borrado de administradores" ON live_chat_messages FOR DELETE USING (true);

