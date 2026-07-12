import React, { createContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../supabaseClient';

export const GalleryContext = createContext();

const DEFAULT_ALBUMS = [
  {
    id: 'album-1',
    title: 'Reunión de Jóvenes Unánimes',
    ministry_id: 'unanimes',
    date: '2026-07-04',
    photos: [
      'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=800&auto=format&fit=crop&q=80'
    ]
  },
  {
    id: 'album-2',
    title: 'Té Especial de Mujeres',
    ministry_id: 'mujeres',
    date: '2026-06-20',
    photos: [
      'https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&auto=format&fit=crop&q=80'
    ]
  },
  {
    id: 'album-3',
    title: 'Encuentro de Hombres de Fe',
    ministry_id: 'hombres',
    date: '2026-06-15',
    photos: [
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format&fit=crop&q=80'
    ]
  },
  {
    id: 'album-4',
    title: 'Fiesta del Día del Niño',
    ministry_id: 'ninos',
    date: '2026-06-01',
    photos: [
      'https://images.unsplash.com/photo-1485546246426-74dc88dec4d9?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1533227268222-75874d1c2978?w=800&auto=format&fit=crop&q=80'
    ]
  }
];

const DEFAULT_LIVESTREAM = {
  isLive: true,
  title: 'Culto de Adoración y Palabra - IMR4 Domingo',
  videoUrl: 'https://www.youtube.com/embed/5qap5aO4i9A',
  churchName: 'IMR4',
  churchLogo: '',
  facebookUrl: '',
  instagramUrl: '',
  churchAddress: 'Río Cuarto, Córdoba, Argentina',
  churchMapsUrl: '',
  churchEmail: 'contacto@imr4.org',
  churchDescription: 'Una comunidad apasionada por compartir la gracia, fe y esperanza en Río Cuarto. Buscamos impactar vidas a través del amor y el servicio integral.',
  youtubeChannelUrl: '',
  chatMessages: [
    { id: 1, user: 'Carlos M.', text: '¡Bendiciones a toda la iglesia!' },
    { id: 2, user: 'María P.', text: 'Hola a todos desde Río Cuarto.' },
    { id: 3, user: 'Lucas G.', text: 'Unánimes listos para la palabra.' }
  ]
};

const DEFAULT_RADIO = {
  isLive: false,
  title: 'Radio IMR4 - Música de Bendición',
  audioUrl: 'https://stream.zeno.fm/f3s8m3n8vy8uv',
  isPlaying: false
};

const DEFAULT_HOME_SECTIONS = [
  {
    id: 'hero',
    title: 'Iglesia Metodista Río Cuarto',
    subtitle: 'Un espacio de gracia, fe y esperanza en Río Cuarto.',
    bg_image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1600&q=80',
    button_text: 'Ver Culto en Vivo',
    button_url: '/live',
    order_index: 1
  },
  {
    id: 'horarios_banner',
    title: 'Nuestros Horarios de Culto',
    subtitle: 'Te invitamos a participar de nuestras reuniones generales los domingos por la mañana y la tarde.',
    bg_image: 'https://images.unsplash.com/photo-1438029071396-1e831a7fa6d8?w=1600&q=80',
    button_text: 'Ver Horarios de Reunión',
    button_url: '/live',
    order_index: 2
  }
];

const DEFAULT_MINISTRIES = [
  {
    id: 'unanimes',
    name: 'Unánimes - Jóvenes',
    description: 'Nuestra red de jóvenes apasionados. Un espacio dinámico, moderno y lleno de propósito.',
    hero_title: 'Un Solo Corazón, Una Sola Visión',
    hero_desc: 'Somos la juventud de IMR4. Un espacio diseñado especialmente para ti, donde conectamos con Dios.',
    accent_color: '#06b6d4',
    icon_name: 'Flame',
    pillars: [
      { icon: 'Calendar', title: '¿Cuándo nos reunimos?', desc: 'Sábados desde las 20:30 hs.' },
      { icon: 'MapPin', title: '¿Dónde?', desc: 'Salón principal de IMR4.' },
      { icon: 'Users', title: 'Grupos Pequeños', desc: 'Reuniones semanales en hogares.' }
    ],
    schedule: 'Sábados 20:30 hs',
    location: 'Salón Principal',
    contact_email: 'jovenes@imr4.org',
    contact_link: 'https://wa.me/1'
  },
  {
    id: 'mujeres',
    name: 'Ministerio de Mujeres',
    description: 'Unidas en fe y amor. Encuentros, talleres y edificación espiritual.',
    hero_title: 'Mujeres de Fe y Propósito',
    hero_desc: 'Un espacio dedicado al crecimiento espiritual y apoyo mutuo de las mujeres de IMR4.',
    accent_color: '#dc2626',
    icon_name: 'Heart',
    pillars: [
      { icon: 'Coffee', title: 'Té y Comunión', desc: 'Meriendas especiales y charlas.' },
      { icon: 'BookOpen', title: 'Estudios Bíblicos', desc: 'Estudios de personajes bíblicos.' },
      { icon: 'Calendar', title: 'Reunión General', desc: 'Viernes quincenales 18:00 hs.' }
    ],
    schedule: 'Viernes quincenales 18:00 hs',
    location: 'Salón de Conferencias',
    contact_email: 'mujeres@imr4.org',
    contact_link: 'https://wa.me/2'
  },
  {
    id: 'hombres',
    name: 'Ministerio de Hombres',
    description: 'Forjando hombres de valor. Grupos de crecimiento y apoyo mutuo.',
    hero_title: 'Hombres de Valor y Carácter',
    hero_desc: 'Equipando a los varones para liderar con integridad y servir a sus familias.',
    accent_color: '#10b981',
    icon_name: 'Shield',
    pillars: [
      { icon: 'Users', title: 'Desayunos de Fe', desc: 'Un sábado al mes con devocional.' },
      { icon: 'Briefcase', title: 'Liderazgo', desc: 'Principios bíblicos y desarrollo.' },
      { icon: 'Calendar', title: 'Reunión de Crecimiento', desc: 'Viernes quincenales 20:00 hs.' }
    ],
    schedule: 'Viernes quincenales 20:00 hs',
    location: 'Auditorio Secundario',
    contact_email: 'hombres@imr4.org',
    contact_link: 'https://wa.me/3'
  },
  {
    id: 'ninos',
    name: 'IMR4 Niños',
    description: 'Formando el semillero de fe. Actividades lúdicas y lecciones de valores.',
    hero_title: 'Aprendiendo y Creciendo Juntos',
    hero_desc: 'Un ambiente seguro y divertido para los niños de Río Cuarto.',
    accent_color: '#f97316',
    icon_name: 'Sun',
    pillars: [
      { icon: 'Smile', title: 'Clases por Edades', desc: 'Grupos adaptados de 3 a 11 años.' },
      { icon: 'Sparkles', title: 'Juegos y Creatividad', desc: 'Manualidades y música interactiva.' },
      { icon: 'Calendar', title: 'Horarios de Domingo', desc: 'Domingos simultáneos a las 10:00 hs.' }
    ],
    schedule: 'Domingos 10:00 hs',
    location: 'Aulas Infantiles',
    location_url: '',
    contact_email: 'ninos@imr4.org',
    contact_link: 'https://wa.me/4'
  }
];

const DEFAULT_RADIO_PROGRAMS = [
  {
    id: 'rp-1',
    title: 'Despertar con Propósito',
    host: 'Pastor Mario',
    schedule_time: 'Lunes a Viernes 08:00 AM',
    image_url: 'https://images.unsplash.com/photo-1593697821252-0c9137d9fc45?w=800&q=80',
    description: 'Comienza tu día con una palabra de aliento y esperanza.',
    is_active: true
  },
  {
    id: 'rp-2',
    title: 'Juventud sin Filtro',
    host: 'Red Juvenil Unánimes',
    schedule_time: 'Sábados 05:00 PM',
    image_url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&q=80',
    description: 'Música, debates y entrevistas para los jóvenes de hoy.',
    is_active: true
  }
];

const DEFAULT_ACTIVITIES = [
  {
    id: 'event-1',
    title: 'Campamento de Invierno Unánimes',
    date: '2026-07-25',
    time: '14:00',
    description: 'Tres días de comunión, plenarias y deportes al aire libre.',
    image_url: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80',
    ministry_id: 'unanimes'
  },
  {
    id: 'event-2',
    title: 'Taller de Finanzas para Hombres',
    date: '2026-07-18',
    time: '09:00',
    description: 'Principios prácticos para el manejo familiar de finanzas.',
    image_url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80',
    ministry_id: 'hombres'
  },
  {
    id: 'event-3',
    title: 'Fiesta Infantil Día del Amigo',
    date: '2026-07-20',
    time: '16:00',
    description: 'Juegos, obras y merienda especial para los niños de la iglesia.',
    image_url: 'https://images.unsplash.com/photo-1485546246426-74dc88dec4d9?w=800&q=80',
    ministry_id: 'ninos'
  }
];

const DEFAULT_BLOG_POSTS = [
  {
    id: 'blog-1',
    title: '¡Bienvenidos a nuestra nueva web!',
    content: 'Estamos muy felices de presentarles nuestra nueva página web, donde podrán encontrar toda la información sobre nuestros ministerios, horarios y próximas actividades.',
    image_url: 'https://images.unsplash.com/photo-1510590337019-5ef8d3d32116?w=800&q=80',
    video_url: '',
    category: 'noticia',
    order_index: 1,
    created_at: new Date().toISOString()
  }
];

export const GalleryProvider = ({ children }) => {
  const [albums, setAlbums] = useState(() => {
    if (!isSupabaseConfigured) {
      const saved = localStorage.getItem('imr4_albums');
      return saved ? JSON.parse(saved) : DEFAULT_ALBUMS;
    }
    return [];
  });

  const [livestream, setLivestream] = useState(() => {
    if (!isSupabaseConfigured) {
      const saved = localStorage.getItem('imr4_livestream');
      return saved ? JSON.parse(saved) : DEFAULT_LIVESTREAM;
    }
    return { ...DEFAULT_LIVESTREAM, isLive: false };
  });

  const [radio, setRadio] = useState(() => {
    if (!isSupabaseConfigured) {
      const saved = localStorage.getItem('imr4_radio');
      return saved ? JSON.parse(saved) : DEFAULT_RADIO;
    }
    return DEFAULT_RADIO;
  });

  // Dynamic content states
  const [blogPosts, setBlogPosts] = useState(() => {
    if (!isSupabaseConfigured) {
      const saved = localStorage.getItem('imr4_blog_posts');
      return saved ? JSON.parse(saved) : DEFAULT_BLOG_POSTS;
    }
    return [];
  });

  const [homeSections, setHomeSections] = useState(() => {
    if (!isSupabaseConfigured) {
      const saved = localStorage.getItem('imr4_home_sections');
      return saved ? JSON.parse(saved) : DEFAULT_HOME_SECTIONS;
    }
    return [];
  });

  const [ministries, setMinistries] = useState(() => {
    if (!isSupabaseConfigured) {
      const saved = localStorage.getItem('imr4_ministries');
      return saved ? JSON.parse(saved) : DEFAULT_MINISTRIES;
    }
    return [];
  });

  const [activities, setActivities] = useState(() => {
    if (!isSupabaseConfigured) {
      const saved = localStorage.getItem('imr4_activities');
      return saved ? JSON.parse(saved) : DEFAULT_ACTIVITIES;
    }
    return [];
  });

  const [radioPrograms, setRadioPrograms] = useState(() => {
    if (!isSupabaseConfigured) {
      const saved = localStorage.getItem('imr4_radio_programs');
      return saved ? JSON.parse(saved) : DEFAULT_RADIO_PROGRAMS;
    }
    return DEFAULT_RADIO_PROGRAMS;
  });

  const [donationsConfig, setDonationsConfig] = useState({
    hero_image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=1600&q=80',
    title: 'Diezmos y Ofrendas',
    message: 'Traed todos los diezmos al alfolí y haya alimento en mi casa; y probadme ahora en esto, dice Jehová de los ejércitos, si no os abriré las ventanas de los cielos, y derramaré sobre vosotros bendición hasta que sobreabunde. (Malaquías 3:10)',
    sinpe_number: '8888-8888',
    bank_accounts: []
  });

  // Auth States
  const [adminUser, setAdminUser] = useState(null);
  const [adminUsersList, setAdminUsersList] = useState([]);

  // Local storage backups syncing
  useEffect(() => {
    if (!isSupabaseConfigured) {
      localStorage.setItem('imr4_blog_posts', JSON.stringify(blogPosts));
    }
  }, [blogPosts]);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      localStorage.setItem('imr4_albums', JSON.stringify(albums));
    }
  }, [albums]);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      localStorage.setItem('imr4_livestream', JSON.stringify(livestream));
    }
  }, [livestream]);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      localStorage.setItem('imr4_radio', JSON.stringify(radio));
    }
  }, [radio]);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      localStorage.setItem('imr4_home_sections', JSON.stringify(homeSections));
    }
  }, [homeSections]);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      localStorage.setItem('imr4_ministries', JSON.stringify(ministries));
    }
  }, [ministries]);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      localStorage.setItem('imr4_activities', JSON.stringify(activities));
    }
  }, [activities]);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      localStorage.setItem('imr4_radio_programs', JSON.stringify(radioPrograms));
    }
  }, [radioPrograms]);

  // Fetch Supabase data function
  const fetchSupabaseData = async () => {
    try {
      // 1. Albums
      const { data: dbAlbums } = await supabase.from('albums').select('*').order('date', { ascending: false });
      if (dbAlbums) setAlbums(dbAlbums);

      // 2. Stream config
      const { data: streamConfig } = await supabase.from('streaming_config').select('*').eq('id', 'main').single();
      if (streamConfig) {
        setLivestream(prev => ({
          ...prev,
          title: streamConfig.live_title,
          videoUrl: streamConfig.live_url,
          isLive: streamConfig.is_live,
          churchName: streamConfig.church_name || 'IMR4',
          churchLogo: streamConfig.church_logo_url || '',
          facebookUrl: streamConfig.facebook_url || '',
          instagramUrl: streamConfig.instagram_url || '',
          churchAddress: streamConfig.church_address || 'Río Cuarto, Córdoba, Argentina',
          churchMapsUrl: streamConfig.church_maps_url || '',
          churchEmail: streamConfig.church_email || 'contacto@imr4.org',
          churchDescription: streamConfig.church_description || 'Una comunidad apasionada por compartir la gracia, fe y esperanza en Río Cuarto. Buscamos impactar vidas a través del amor y el servicio integral.',
          youtubeChannelUrl: streamConfig.youtube_channel_url || ''
        }));
        setRadio(prev => ({
          ...prev,
          title: streamConfig.radio_title,
          audioUrl: streamConfig.radio_url,
          isLive: streamConfig.is_radio_live
        }));
      }

      // 3. Home Sections
        const { data: homeSectionsData, error: hsError } = await supabase.from('home_sections').select('*').order('order_index');
        if (!hsError && homeSectionsData) {
          setHomeSections(homeSectionsData.map(sec => ({
            ...sec,
            schedules: typeof sec.schedules === 'string' ? JSON.parse(sec.schedules) : (sec.schedules || [])
          })));
        }// 4. Ministries
      const { data: dbMin } = await supabase.from('ministries').select('*');
      if (dbMin && dbMin.length > 0) setMinistries(dbMin);

      // 5. Activities
      const { data: dbAct } = await supabase.from('activities').select('*').order('date', { ascending: true });
      if (dbAct) setActivities(dbAct);

      // 6. Radio Programs
      const { data: dbRadioProg } = await supabase.from('radio_programs').select('*').order('schedule_time');
      if (dbRadioProg) setRadioPrograms(dbRadioProg);

      // 7. Blog Posts
      const { data: dbBlogs } = await supabase.from('blog_posts').select('*').order('order_index');
      if (dbBlogs) setBlogPosts(dbBlogs);

      // 8. Donations Config
      const { data: dbDonations } = await supabase.from('donations_config').select('*').eq('id', 'main').single();
      if (dbDonations) {
        setDonationsConfig({
          hero_image: dbDonations.hero_image,
          title: dbDonations.title,
          message: dbDonations.message,
          sinpe_number: dbDonations.sinpe_number,
          bank_accounts: typeof dbDonations.bank_accounts === 'string' ? JSON.parse(dbDonations.bank_accounts) : (dbDonations.bank_accounts || [])
        });
      }
    } catch (e) {
      console.error('Error fetching data from Supabase:', e);
    }
  };

  useEffect(() => {
    if (isSupabaseConfigured) {
      fetchSupabaseData();

      // Realtime subscription setup
      const streamSub = supabase
        .channel('realtime:streaming_config')
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'streaming_config', filter: 'id=eq.main' }, (payload) => {
          const updated = payload.new;
          setLivestream(prev => ({
            ...prev,
            title: updated.live_title,
            videoUrl: updated.live_url,
            isLive: updated.is_live,
            churchName: updated.church_name || 'IMR4',
            churchLogo: updated.church_logo_url || '',
            facebookUrl: updated.facebook_url || '',
            instagramUrl: updated.instagram_url || '',
            churchAddress: updated.church_address || 'Río Cuarto, Córdoba, Argentina',
            churchMapsUrl: updated.church_maps_url || '',
            youtubeChannelUrl: updated.youtube_channel_url || ''
          }));
          setRadio(prev => ({
            ...prev,
            title: updated.radio_title,
            audioUrl: updated.radio_url,
            isLive: updated.is_radio_live
          }));
        })
        .subscribe();

      const tablesSub = supabase
        .channel('realtime:db_changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'albums' }, () => fetchSupabaseData())
        .on('postgres_changes', { event: '*', schema: 'public', table: 'home_sections' }, () => fetchSupabaseData())
        .on('postgres_changes', { event: '*', schema: 'public', table: 'ministries' }, () => fetchSupabaseData())
        .on('postgres_changes', { event: '*', schema: 'public', table: 'activities' }, () => fetchSupabaseData())
        .on('postgres_changes', { event: '*', schema: 'public', table: 'radio_programs' }, () => fetchSupabaseData())
        .on('postgres_changes', { event: '*', schema: 'public', table: 'blog_posts' }, () => fetchSupabaseData())
        .on('postgres_changes', { event: '*', schema: 'public', table: 'donations_config' }, () => fetchSupabaseData())
        .subscribe();

      return () => {
        supabase.removeChannel(streamSub);
        supabase.removeChannel(tablesSub);
      };
    }
  }, []);

  // Gallery methods
  const addAlbum = async (album) => {
    if (isSupabaseConfigured) {
      await supabase.from('albums').insert(album);
    } else {
      setAlbums((prev) => [album, ...prev]);
    }
  };

  const deleteAlbum = async (id) => {
    if (isSupabaseConfigured) {
      await supabase.from('albums').delete().eq('id', id);
    } else {
      setAlbums((prev) => prev.filter((album) => album.id !== id));
    }
  };

  const updateAlbum = async (id, updates) => {
    if (isSupabaseConfigured) {
      await supabase.from('albums').update(updates).eq('id', id);
    }
    setAlbums((prev) => prev.map((album) => (album.id === id ? { ...album, ...updates } : album)));
  };

  const addPhotoToAlbum = async (albumId, photoUrl) => {
    if (isSupabaseConfigured) {
      const { data: album } = await supabase.from('albums').select('photos').eq('id', albumId).single();
      if (album) {
        const updatedPhotos = [...album.photos, photoUrl];
        await supabase.from('albums').update({ photos: updatedPhotos }).eq('id', albumId);
        
        // Reflejar cambio en la UI instantáneamente
        setAlbums((prev) =>
          prev.map((a) => (a.id === albumId ? { ...a, photos: updatedPhotos } : a))
        );
      }
    } else {
      setAlbums((prev) =>
        prev.map((album) => {
          if (album.id === albumId) {
            return { ...album, photos: [...album.photos, photoUrl] };
          }
          return album;
        })
      );
    }
  };

  const removePhotoFromAlbum = async (albumId, photoUrl) => {
    if (isSupabaseConfigured) {
      const { data: album } = await supabase.from('albums').select('photos').eq('id', albumId).single();
      if (album) {
        const updatedPhotos = album.photos.filter((url) => url !== photoUrl);
        await supabase.from('albums').update({ photos: updatedPhotos }).eq('id', albumId);
        
        // Reflejar cambio en la UI instantáneamente
        setAlbums((prev) =>
          prev.map((a) => (a.id === albumId ? { ...a, photos: updatedPhotos } : a))
        );
        
        // Try to delete the actual file from Supabase storage (optional cleanup)
        try {
          const urlParts = photoUrl.split('/');
          const fileName = urlParts[urlParts.length - 1];
          const pathName = `${albumId}/${fileName}`;
          await supabase.storage.from('photos').remove([pathName]);
        } catch (e) {
          console.error("Could not delete file from storage, only removed from album record:", e);
        }
      }
    } else {
      setAlbums((prev) =>
        prev.map((album) => {
          if (album.id === albumId) {
            return { ...album, photos: album.photos.filter((url) => url !== photoUrl) };
          }
          return album;
        })
      );
    }
  };

  // Livestream/Radio control methods
  const updateLivestream = async (updates) => {
    if (isSupabaseConfigured) {
      await supabase.from('streaming_config').update({
        live_title: updates.title,
        live_url: updates.videoUrl,
        is_live: updates.isLive,
        church_name: updates.churchName,
        church_logo_url: updates.churchLogo,
        facebook_url: updates.facebookUrl,
        instagram_url: updates.instagramUrl,
        church_address: updates.churchAddress,
        church_maps_url: updates.churchMapsUrl,
        church_email: updates.churchEmail,
        church_description: updates.churchDescription,
        youtube_channel_url: updates.youtubeChannelUrl
      }).eq('id', 'main');
    } else {
      setLivestream((prev) => ({ ...prev, ...updates }));
    }
  };

  const updateRadio = async (updates) => {
    if (isSupabaseConfigured) {
      await supabase.from('streaming_config').update({
        radio_title: updates.title,
        radio_url: updates.audioUrl,
        is_radio_live: updates.isLive
      }).eq('id', 'main');
    } else {
      setRadio((prev) => ({ ...prev, ...updates }));
    }
  };

  // Home Sections methods
  const addHomeSection = async (section) => {
    if (isSupabaseConfigured) {
      await supabase.from('home_sections').insert(section);
      setHomeSections((prev) => [...prev, section].sort((a,b) => a.order_index - b.order_index));
    } else {
      setHomeSections((prev) => [...prev, section].sort((a,b) => a.order_index - b.order_index));
    }
  };

  const deleteHomeSection = async (id) => {
    if (isSupabaseConfigured) {
      await supabase.from('home_sections').delete().eq('id', id);
      setHomeSections((prev) => prev.filter((sec) => sec.id !== id));
    } else {
      setHomeSections((prev) => prev.filter((sec) => sec.id !== id));
    }
  };

  const updateHomeSection = async (id, updates) => {
    if (isSupabaseConfigured) {
      const dbUpdates = { ...updates };
      // if schedules is provided, stringify or leave it if passing directly as jsonb (supabase js supports object)
      await supabase.from('home_sections').update(dbUpdates).eq('id', id);
    }
    setHomeSections(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  // Ministries methods
  const addMinistry = async (ministry) => {
    if (isSupabaseConfigured) {
      await supabase.from('ministries').insert(ministry);
      setMinistries((prev) => [...prev, ministry]);
    } else {
      setMinistries((prev) => [...prev, ministry]);
    }
  };

  const deleteMinistry = async (id) => {
    if (isSupabaseConfigured) {
      await supabase.from('ministries').delete().eq('id', id);
      setMinistries((prev) => prev.filter((m) => m.id !== id));
    } else {
      setMinistries((prev) => prev.filter((m) => m.id !== id));
    }
  };

  const updateMinistry = async (id, updates) => {
    if (isSupabaseConfigured) {
      await supabase.from('ministries').update(updates).eq('id', id);
      setMinistries((prev) =>
        prev.map((m) => (m.id === id ? { ...m, ...updates } : m))
      );
    } else {
      setMinistries((prev) =>
        prev.map((m) => (m.id === id ? { ...m, ...updates } : m))
      );
    }
  };

  // Activities methods
  const addActivity = async (activity) => {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('activities').insert(activity).select();
      if (!error && data) {
        setActivities((prev) => [...prev, data[0]].sort((a,b) => a.date.localeCompare(b.date)));
      }
    } else {
      setActivities((prev) => [...prev, activity].sort((a,b) => a.date.localeCompare(b.date)));
    }
  };

  const deleteActivity = async (id) => {
    if (isSupabaseConfigured) {
      await supabase.from('activities').delete().eq('id', id);
      setActivities((prev) => prev.filter((act) => act.id !== id));
    } else {
      setActivities((prev) => prev.filter((act) => act.id !== id));
    }
  };

  const updateActivity = async (id, updates) => {
    if (isSupabaseConfigured) {
      await supabase.from('activities').update(updates).eq('id', id);
      setActivities((prev) => prev.map((act) => act.id === id ? { ...act, ...updates } : act));
    } else {
      setActivities((prev) => prev.map((act) => act.id === id ? { ...act, ...updates } : act));
    }
  };

  // Radio Programs methods
  const addRadioProgram = async (program) => {
    if (isSupabaseConfigured) {
      await supabase.from('radio_programs').insert(program);
      setRadioPrograms((prev) => [...prev, program]);
    } else {
      setRadioPrograms((prev) => [...prev, program]);
    }
  };

  const updateRadioProgram = async (id, updates) => {
    if (isSupabaseConfigured) {
      await supabase.from('radio_programs').update(updates).eq('id', id);
      setRadioPrograms((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
    } else {
      setRadioPrograms((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
    }
  };

  const deleteRadioProgram = async (id) => {
    if (isSupabaseConfigured) {
      await supabase.from('radio_programs').delete().eq('id', id);
      setRadioPrograms((prev) => prev.filter((p) => p.id !== id));
    } else {
      setRadioPrograms((prev) => prev.filter((p) => p.id !== id));
    }
  };

  // Blog Posts methods
  const addBlogPost = async (post) => {
    if (isSupabaseConfigured) {
      await supabase.from('blog_posts').insert(post);
      setBlogPosts((prev) => [...prev, post].sort((a,b) => a.order_index - b.order_index));
    } else {
      setBlogPosts((prev) => [...prev, post].sort((a,b) => a.order_index - b.order_index));
    }
  };

  const updateBlogPost = async (id, updates) => {
    if (isSupabaseConfigured) {
      await supabase.from('blog_posts').update(updates).eq('id', id);
      setBlogPosts((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)).sort((a,b) => a.order_index - b.order_index));
    } else {
      setBlogPosts((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)).sort((a,b) => a.order_index - b.order_index));
    }
  };

  const deleteBlogPost = async (id) => {
    if (isSupabaseConfigured) {
      await supabase.from('blog_posts').delete().eq('id', id);
      setBlogPosts((prev) => prev.filter((p) => p.id !== id));
    } else {
      setBlogPosts((prev) => prev.filter((p) => p.id !== id));
    }
  };

  const addChatMessage = (msg) => {
    setLivestream((prev) => ({
      ...prev,
      chatMessages: [...prev.chatMessages, { id: Date.now(), ...msg }]
    }));
  };

  const updateDonationsConfig = async (updates) => {
    if (isSupabaseConfigured) {
      await supabase.from('donations_config').update(updates).eq('id', 'main');
      setDonationsConfig((prev) => ({ ...prev, ...updates }));
    } else {
      setDonationsConfig((prev) => ({ ...prev, ...updates }));
    }
  };

  // Auth & Admin Users Methods
  const login = async (username, password) => {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('username', username)
        .eq('password', password)
        .single();
      
      if (data && !error) {
        setAdminUser(data);
        return { success: true };
      } else {
        return { success: false, message: 'Usuario o contraseña incorrectos' };
      }
    } else {
      // Fake login for local dev
      if (username === 'imr4' && password === 'r1558') {
        const user = { username: 'imr4' };
        setAdminUser(user);
        return { success: true };
      }
      return { success: false, message: 'Usuario o contraseña incorrectos' };
    }
  };

  const logout = () => {
    setAdminUser(null);
  };

  const fetchAdminUsers = async () => {
    if (isSupabaseConfigured) {
      const { data } = await supabase.from('admin_users').select('id, username, created_at');
      if (data) setAdminUsersList(data);
    } else {
      setAdminUsersList([{ id: 'local-1', username: 'imr4' }]);
    }
  };

  const addAdminUser = async (username, password) => {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('admin_users').insert({ username, password }).select('id, username, created_at').single();
      if (data && !error) {
        setAdminUsersList(prev => [...prev, data]);
        return { success: true };
      }
      return { success: false, message: error?.message || 'Error al crear usuario' };
    } else {
      return { success: false, message: 'Supabase no está configurado.' };
    }
  };

  const deleteAdminUser = async (id) => {
    if (isSupabaseConfigured) {
      await supabase.from('admin_users').delete().eq('id', id);
      setAdminUsersList(prev => prev.filter(u => u.id !== id));
    }
  };

  return (
    <GalleryContext.Provider
      value={{
        albums,
        livestream,
        radio,
        homeSections,
        ministries,
        activities,
        radioPrograms,
        addAlbum,
        deleteAlbum,
        updateAlbum,
        addPhotoToAlbum,
        removePhotoFromAlbum,
        updateLivestream,
        updateRadio,
        addHomeSection,
        deleteHomeSection,
        updateHomeSection,
        addMinistry,
        deleteMinistry,
        updateMinistry,
        addActivity,
        deleteActivity,
        updateActivity,
        addRadioProgram,
        updateRadioProgram,
        deleteRadioProgram,
        blogPosts,
        addBlogPost,
        updateBlogPost,
        deleteBlogPost,
        donationsConfig,
        updateDonationsConfig,
        addChatMessage,
        adminUser,
        adminUsersList,
        login,
        logout,
        fetchAdminUsers,
        addAdminUser,
        deleteAdminUser
      }}
    >
      {children}
    </GalleryContext.Provider>
  );
};
