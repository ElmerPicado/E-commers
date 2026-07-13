import React, { useContext, useState, useMemo, useEffect } from 'react';
import { GalleryContext } from '../context/GalleryContext';
import { FileText, Video, Link as LinkIcon, Search, Download, ExternalLink } from 'lucide-react';
import './Recursos.css';

export default function Recursos() {
  const { resources, resourceCategories } = useContext(GalleryContext);

  const [activeCategory, setActiveCategory] = useState('all');
  const [activeType, setActiveType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const filteredResources = useMemo(() => {
    return resources.filter(res => {
      const matchCat = activeCategory === 'all' || res.category_id === activeCategory;
      const matchType = activeType === 'all' || res.type === activeType;
      const matchSearch = res.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (res.description || '').toLowerCase().includes(searchTerm.toLowerCase());
      return matchCat && matchType && matchSearch;
    });
  }, [resources, activeCategory, activeType, searchTerm]);

  return (
    <div className="recursos-page" style={{ paddingTop: '100px' }}>
      <header className="recursos-header">
        <h1>Biblioteca de Recursos</h1>
        <p>Material de estudio, enseñanzas y herramientas para tu crecimiento espiritual.</p>
      </header>

      <div className="recursos-container">
        
        {/* Filtros Superiores */}
        <div className="recursos-filters">
          <div className="search-bar">
            <Search size={20} className="search-icon" />
            <input 
              type="text" 
              placeholder="Buscar recursos..." 
              value={searchTerm} 
              onChange={e => setSearchTerm(e.target.value)} 
            />
          </div>

          <div className="type-filters">
            <button className={`type-btn ${activeType === 'all' ? 'active' : ''}`} onClick={() => setActiveType('all')}>Todos</button>
            <button className={`type-btn ${activeType === 'document' ? 'active' : ''}`} onClick={() => setActiveType('document')}><FileText size={16}/> Documentos</button>
            <button className={`type-btn ${activeType === 'video' ? 'active' : ''}`} onClick={() => setActiveType('video')}><Video size={16}/> Videos</button>
            <button className={`type-btn ${activeType === 'link' ? 'active' : ''}`} onClick={() => setActiveType('link')}><LinkIcon size={16}/> Enlaces</button>
          </div>
        </div>

        <div className="recursos-layout">
          {/* Sidebar de Categorías */}
          <aside className="recursos-sidebar">
            <h3>Categorías</h3>
            <div className="category-list">
              <button 
                className={`category-item ${activeCategory === 'all' ? 'active' : ''}`}
                onClick={() => setActiveCategory('all')}
              >
                Todas las categorías
              </button>
              {resourceCategories.map(cat => (
                <button 
                  key={cat.id}
                  className={`category-item ${activeCategory === cat.id ? 'active' : ''}`}
                  onClick={() => setActiveCategory(cat.id)}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </aside>

          {/* Grid de Recursos */}
          <div className="recursos-grid">
            {filteredResources.length === 0 ? (
              <div className="no-resources">
                <p>No se encontraron recursos que coincidan con tu búsqueda.</p>
              </div>
            ) : (
              filteredResources.map(res => (
                <div key={res.id} className="recurso-card">
                  <div className="recurso-icon">
                    {res.type === 'document' && <FileText size={32} />}
                    {res.type === 'video' && <Video size={32} />}
                    {res.type === 'link' && <LinkIcon size={32} />}
                  </div>
                  <div className="recurso-content">
                    <span className="recurso-category">
                      {resourceCategories.find(c => c.id === res.category_id)?.name || 'Sin categoría'}
                    </span>
                    <h4>{res.title}</h4>
                    {res.description && <p>{res.description}</p>}
                  </div>
                  <div className="recurso-actions">
                    <a href={res.file_url} target="_blank" rel="noopener noreferrer" className="btn-action">
                      {res.type === 'document' ? (
                        <><Download size={16} /> Descargar</>
                      ) : (
                        <><ExternalLink size={16} /> Ver Contenido</>
                      )}
                    </a>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
