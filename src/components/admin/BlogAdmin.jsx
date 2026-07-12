import React, { useState, useContext } from 'react';
import { Plus, Trash2, Edit, Save, Video, Image as ImageIcon, AlignLeft, AlertTriangle } from 'lucide-react';
import { GalleryContext } from '../../context/GalleryContext';
import { v4 as uuidv4 } from 'uuid';

export default function BlogAdmin({ triggerSuccess }) {
  const { blogPosts, addBlogPost, updateBlogPost, deleteBlogPost } = useContext(GalleryContext);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [category, setCategory] = useState('historia');
  const [orderIndex, setOrderIndex] = useState(1);
  
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  const resetForm = () => {
    setTitle('');
    setContent('');
    setImageUrl('');
    setVideoUrl('');
    setCategory('historia');
    setOrderIndex(blogPosts.length > 0 ? Math.max(...blogPosts.map(p => p.order_index || 0)) + 1 : 1);
    setIsEditing(false);
    setEditId(null);
  };

  const handleEdit = (post) => {
    setTitle(post.title);
    setContent(post.content);
    setImageUrl(post.image_url || '');
    setVideoUrl(post.video_url || '');
    setCategory(post.category || 'historia');
    setOrderIndex(post.order_index || 1);
    setIsEditing(true);
    setEditId(post.id);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const postData = {
      title,
      content,
      image_url: imageUrl,
      video_url: videoUrl,
      category,
      order_index: parseInt(orderIndex, 10),
    };

    if (isEditing) {
      await updateBlogPost(editId, postData);
      triggerSuccess('Bloque actualizado correctamente');
    } else {
      postData.id = `blog-${uuidv4()}`;
      postData.created_at = new Date().toISOString();
      await addBlogPost(postData);
      triggerSuccess('Bloque creado correctamente');
    }
    
    resetForm();
  };

  const handleDelete = async (id) => {
    await deleteBlogPost(id);
    setShowDeleteConfirm(null);
    triggerSuccess('Bloque eliminado');
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Historia y Blogs</h2>
        <p className="text-gray-600 mt-1">Gestiona los bloques de contenido para la página de "Nuestra Historia" o futuras noticias.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">
          {isEditing ? 'Editar Bloque' : 'Crear Nuevo Bloque'}
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
              <input 
                type="text" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ej. Nuestros Inicios"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sección (Categoría)</label>
              <select 
                value={category} 
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="historia">Nuestra Historia</option>
                <option value="noticia">Blog / Noticias</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contenido (Texto principal)</label>
            <textarea 
              value={content} 
              onChange={(e) => setContent(e.target.value)}
              required
              rows={4}
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Escribe la historia o descripción aquí..."
            ></textarea>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">URL de Imagen (Opcional)</label>
              <div className="relative">
                <ImageIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <input 
                  type="text" 
                  value={imageUrl} 
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://..."
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">URL de Video de YouTube (Opcional)</label>
              <div className="relative">
                <Video className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <input 
                  type="text" 
                  value={videoUrl} 
                  onChange={(e) => setVideoUrl(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://www.youtube.com/embed/..."
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Usa el formato /embed/ para YouTube.</p>
            </div>
          </div>
          
          <div className="w-1/3">
            <label className="block text-sm font-medium text-gray-700 mb-1">Orden de aparición</label>
            <input 
              type="number" 
              value={orderIndex} 
              onChange={(e) => setOrderIndex(e.target.value)}
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
            {isEditing && (
              <button 
                type="button" 
                onClick={resetForm}
                className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
            )}
            <button 
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              {isEditing ? <Save className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
              {isEditing ? 'Guardar Cambios' : 'Añadir Bloque'}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Bloques Existentes</h3>
        
        {blogPosts.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No hay bloques creados aún.</p>
        ) : (
          <div className="space-y-4">
            {blogPosts.map((post) => (
              <div key={post.id} className="flex flex-col md:flex-row items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                <div className="flex-1 w-full">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded uppercase">
                      {post.category || 'historia'}
                    </span>
                    <span className="text-gray-500 text-sm font-medium">Orden: {post.order_index}</span>
                  </div>
                  <h4 className="font-bold text-gray-800 text-lg">{post.title}</h4>
                  <p className="text-gray-600 text-sm line-clamp-2 mt-1">{post.content}</p>
                </div>
                
                <div className="flex items-center gap-2 mt-4 md:mt-0">
                  <button 
                    onClick={() => handleEdit(post)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Editar"
                  >
                    <Edit className="h-5 w-5" />
                  </button>
                  
                  {showDeleteConfirm === post.id ? (
                    <div className="flex items-center bg-red-50 rounded-lg p-1 border border-red-200">
                      <span className="text-sm text-red-800 px-2 font-medium">¿Eliminar?</span>
                      <button 
                        onClick={() => handleDelete(post.id)}
                        className="p-1.5 text-white bg-red-600 hover:bg-red-700 rounded transition-colors"
                      >
                        Sí
                      </button>
                      <button 
                        onClick={() => setShowDeleteConfirm(null)}
                        className="p-1.5 ml-1 text-gray-600 hover:bg-gray-200 rounded transition-colors"
                      >
                        No
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => setShowDeleteConfirm(post.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
