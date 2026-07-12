import React, { useContext } from 'react';
import { GalleryContext } from '../context/GalleryContext';
import { Clock, Play, BookOpen } from 'lucide-react';

export default function Historia() {
  const { blogPosts } = useContext(GalleryContext);

  // Filtrar solo los de la categoría 'historia' y ordenarlos
  const historyBlocks = blogPosts
    .filter(post => !post.category || post.category === 'historia')
    .sort((a, b) => a.order_index - b.order_index);

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-16">
      {/* Hero Section */}
      <section className="relative py-20 bg-blue-900 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img 
            src="https://images.unsplash.com/photo-1438029071396-1e831a7fa6d8?w=1600&q=80" 
            alt="Fondo historia" 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative max-w-5xl mx-auto px-6 text-center z-10">
          <BookOpen className="h-16 w-16 mx-auto mb-6 text-blue-300" />
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">
            Nuestra Historia
          </h1>
          <p className="text-xl md:text-2xl font-light text-blue-100 max-w-3xl mx-auto">
            Descubre cómo Dios ha guiado cada paso de nuestra iglesia desde sus inicios hasta el día de hoy.
          </p>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        {historyBlocks.length === 0 ? (
          <div className="text-center text-gray-500 py-20">
            <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg">Pronto compartiremos más detalles sobre nuestra historia.</p>
          </div>
        ) : (
          <div className="relative">
            {/* Línea central vertical */}
            <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-blue-200 via-blue-400 to-blue-200 rounded-full"></div>
            
            <div className="space-y-16 md:space-y-24">
              {historyBlocks.map((block, index) => {
                const isEven = index % 2 === 0;
                return (
                  <div key={block.id} className={`relative flex flex-col md:flex-row items-center ${isEven ? 'md:flex-row-reverse' : ''}`}>
                    
                    {/* Marcador del timeline */}
                    <div className="hidden md:flex absolute left-1/2 transform -translate-x-1/2 items-center justify-center w-12 h-12 bg-white rounded-full border-4 border-blue-500 shadow-xl z-10">
                      <span className="text-blue-500 font-bold">{index + 1}</span>
                    </div>

                    {/* Contenido (Texto) */}
                    <div className={`w-full md:w-1/2 p-6 md:p-12 ${isEven ? 'md:pr-16 text-left' : 'md:pl-16 text-left md:text-right'}`}>
                      <h3 className="text-3xl font-bold text-gray-800 mb-4">{block.title}</h3>
                      <p className="text-gray-600 leading-relaxed text-lg whitespace-pre-line">
                        {block.content}
                      </p>
                    </div>

                    {/* Media (Imagen o Video) */}
                    <div className={`w-full md:w-1/2 px-6 ${isEven ? 'md:pl-12' : 'md:pr-12'}`}>
                      {(block.image_url || block.video_url) ? (
                        <div className="relative rounded-2xl overflow-hidden shadow-2xl transition-transform duration-300 hover:scale-[1.02] bg-white group">
                          {block.video_url ? (
                            <div className="aspect-w-16 aspect-h-9 w-full">
                              <iframe 
                                src={block.video_url} 
                                title={block.title}
                                className="w-full h-full min-h-[300px]"
                                frameBorder="0" 
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                allowFullScreen
                              ></iframe>
                            </div>
                          ) : (
                            <img 
                              src={block.image_url} 
                              alt={block.title} 
                              className="w-full h-auto object-cover max-h-[400px]"
                            />
                          )}
                        </div>
                      ) : (
                        <div className="hidden md:block w-full h-32"></div> /* Spacer if no image */
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
