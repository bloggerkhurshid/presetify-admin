import { useState, useEffect } from 'react';
import { Plus, Trash2, Folder as FolderIcon, X, Loader2, Edit2 } from 'lucide-react';
import api from '../api';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  // Form State
  const [name, setName] = useState('');
  const [file, setFile] = useState(null);

  // Edit State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editCategoryId, setEditCategoryId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editImage, setEditImage] = useState(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('get_categories.php');
      if (res.data.status) {
        setCategories(res.data.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    try {
      const res = await api.post('delete_category.php', { id });
      if (res.data.status) {
        setCategories(categories.filter(c => c.id !== id));
      } else {
        alert(res.data.message || 'Error deleting');
      }
    } catch (err) {
      console.error(err);
      alert('Error deleting');
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!name) {
      alert('Please enter a category name');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('name', name);
    if (file) {
      formData.append('image', file);
    }

    try {
      const res = await api.post('create_category.php', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.status) {
        setIsModalOpen(false);
        setFile(null);
        setName('');
        fetchData();
      } else {
        alert(res.data.message || 'Error creating category');
      }
    } catch (err) {
      console.error(err);
      alert('Error connecting to server');
    } finally {
      setUploading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editCategoryId || !editName) return;

    setUpdating(true);
    try {
      const formData = new FormData();
      formData.append('id', editCategoryId);
      formData.append('name', editName);
      if (editImage) formData.append('image', editImage);

      const res = await api.post('update_category.php', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.status) {
        setIsEditModalOpen(false);
        fetchData();
      } else {
        alert(res.data.message || 'Error updating category');
      }
    } catch (err) {
      console.error(err);
      alert('Error updating category');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <>
      <div className="space-y-8 animate-in fade-in duration-700">
      
        {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white/70 backdrop-blur-xl p-6 sm:p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50 gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Categories</h2>
          <p className="text-sm sm:text-base text-gray-500 mt-1">Manage app categories and their cover images</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full sm:w-auto bg-gray-900 hover:bg-black text-white px-6 py-3 rounded-2xl font-medium flex items-center justify-center gap-2 transition-all duration-300 hover:scale-[1.02] active:scale-95 shadow-lg shadow-gray-900/20"
        >
          <Plus size={18} strokeWidth={2.5} />
          Create Category
        </button>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex justify-center py-32">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900"></div>
        </div>
      ) : categories.length === 0 ? (
        <div className="text-center py-32 bg-white/70 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50">
          <FolderIcon className="mx-auto text-gray-300 mb-4" size={56} strokeWidth={1} />
          <p className="text-gray-500 text-lg">No categories created yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
          {categories.map((cat) => (
            <div key={cat.id} className="group relative bg-white rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] transition-all duration-500 border border-white/50">
              <div className="aspect-[4/3] bg-gray-100 relative overflow-hidden flex items-center justify-center">
                {cat.image ? (
                  <img
                    src={`https://api.devkayy.in/${cat.image}`}
                    alt={cat.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                ) : (
                  <FolderIcon size={40} className="text-gray-300" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <button
                    onClick={() => {
                      setEditCategoryId(cat.id);
                      setEditName(cat.name);
                      setEditImage(null);
                      setIsEditModalOpen(true);
                    }}
                    className="bg-white/90 hover:bg-white text-gray-800 p-2.5 rounded-xl backdrop-blur-md transition-all duration-300 hover:scale-110 shadow-sm"
                    title="Edit"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(cat.id)}
                    className="bg-white/90 hover:bg-red-500 hover:text-white text-red-500 p-2.5 rounded-xl backdrop-blur-md transition-all duration-300 hover:scale-110 shadow-sm"
                    title="Delete"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              <div className="p-5 text-center">
                <h3 className="font-semibold text-gray-900 truncate text-base">{cat.name}</h3>
              </div>
            </div>
          ))}
        </div>
      )}
      </div>

      {/* Upload Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
          <div className="bg-white/90 backdrop-blur-xl rounded-[2rem] shadow-[0_20px_60px_rgb(0,0,0,0.1)] border border-white/50 w-full max-w-md max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-300">
            <div className="px-6 py-6 sm:px-8 sm:py-6 flex justify-between items-center sticky top-0 bg-white/90 backdrop-blur-xl z-10 border-b border-gray-100/50">
              <h3 className="font-bold text-gray-900 text-xl tracking-tight">Create Category</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-900 hover:rotate-90 transition-all duration-300 bg-gray-100 hover:bg-gray-200 p-2 rounded-full">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleUpload} className="px-6 pb-6 sm:px-8 sm:pb-8 pt-4 space-y-6">
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-700">Category Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 bg-white/50 border border-gray-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900/20 focus:border-gray-900/30 transition-all text-sm"
                  placeholder="e.g. Wedding, Moody"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-700">Cover Image <span className="text-gray-400 font-normal">(Optional)</span></label>
                <div className="border-2 border-dashed border-gray-200 rounded-2xl p-4 text-center hover:bg-gray-50/50 hover:border-gray-300 transition-all">
                  <input
                    type="file"
                    accept="*/*"
                    onChange={(e) => setFile(e.target.files[0])}
                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-5 file:rounded-xl file:border-0 file:text-sm file:font-medium file:bg-gray-900 file:text-white hover:file:bg-black transition-all cursor-pointer"
                  />
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={uploading}
                  className="w-full bg-gray-900 hover:bg-black text-white font-medium py-3.5 rounded-xl transition-all duration-300 disabled:opacity-70 disabled:scale-100 hover:scale-[1.02] active:scale-95 shadow-lg shadow-gray-900/20 flex justify-center items-center gap-2"
                >
                  {uploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Creating...
                    </>
                  ) : (
                    'Create Category'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
          <div className="bg-white/90 backdrop-blur-xl rounded-[2rem] shadow-[0_20px_60px_rgb(0,0,0,0.1)] border border-white/50 w-full max-w-md max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-300">
            <div className="px-6 py-6 sm:px-8 sm:py-6 flex justify-between items-center sticky top-0 bg-white/90 backdrop-blur-xl z-10 border-b border-gray-100/50">
              <h3 className="font-bold text-gray-900 text-xl tracking-tight">Edit Category</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-gray-900 hover:rotate-90 transition-all duration-300 bg-gray-100 hover:bg-gray-200 p-2 rounded-full">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleUpdate} className="px-6 pb-6 sm:px-8 sm:pb-8 pt-4 space-y-6">
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-700">Category Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-4 py-3 bg-white/50 border border-gray-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900/20 focus:border-gray-900/30 transition-all text-sm"
                  placeholder="e.g. Wedding, Moody"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-700">Replace Cover Image <span className="text-gray-400 font-normal">(Optional)</span></label>
                <div className="border-2 border-dashed border-gray-200 rounded-2xl p-4 text-center hover:bg-gray-50/50 hover:border-gray-300 transition-all">
                  <input
                    type="file"
                    accept="*/*"
                    onChange={(e) => setEditImage(e.target.files[0])}
                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-5 file:rounded-xl file:border-0 file:text-sm file:font-medium file:bg-gray-900 file:text-white hover:file:bg-black transition-all cursor-pointer"
                  />
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={updating}
                  className="w-full bg-gray-900 hover:bg-black text-white font-medium py-3.5 rounded-xl transition-all duration-300 disabled:opacity-70 disabled:scale-100 hover:scale-[1.02] active:scale-95 shadow-lg shadow-gray-900/20 flex justify-center items-center gap-2"
                >
                  {updating ? (
                    <><Loader2 size={18} className="animate-spin" /> Saving...</>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Categories;
