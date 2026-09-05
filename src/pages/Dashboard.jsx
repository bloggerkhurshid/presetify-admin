import { useState, useEffect } from 'react';
import { Plus, Trash2, Image as ImageIcon, X, Loader2, Edit2, Smartphone, Bell, Layers } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../api';

const Dashboard = () => {
  const [wallpapers, setWallpapers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Pagination State
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPresets, setTotalPresets] = useState(0);
  const [totalDevices, setTotalDevices] = useState(0);
  const [totalCategoriesCount, setTotalCategoriesCount] = useState(0);

  // Form State
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [file, setFile] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);

  // Edit State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editPresetId, setEditPresetId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editCategoryId, setEditCategoryId] = useState('');
  const [editFile, setEditFile] = useState(null);
  const [editThumbnailFile, setEditThumbnailFile] = useState(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchData(1);
  }, []);

  const fetchData = async (currentPage = page) => {
    setLoading(true);
    try {
      const [wpRes, catRes, statsRes] = await Promise.all([
        api.get(`list_wallpapers.php?page=${currentPage}&limit=20`),
        api.get('get_categories.php'),
        api.get('get_dashboard_stats.php').catch(() => ({ data: { status: false } }))
      ]);
      // Note: Live server list_wallpapers.php might not have status: true yet
      if (wpRes.data.data) {
        setWallpapers(wpRes.data.data);
        if (wpRes.data.pagination) {
          setTotalPages(wpRes.data.pagination.total_pages);
          if (wpRes.data.pagination.total_items !== undefined) {
            setTotalPresets(wpRes.data.pagination.total_items);
          }
        }
      }
      if (catRes.data.status) {
        const cats = catRes.data.data || [];
        setCategories(cats);
        setTotalCategoriesCount(cats.length);
      }
      if (statsRes.data.status && statsRes.data.data) {
        if (statsRes.data.data.total_devices !== undefined) {
          setTotalDevices(statsRes.data.data.total_devices);
        }
        if (statsRes.data.data.total_presets !== undefined && !wpRes.data.pagination?.total_items) {
          setTotalPresets(statsRes.data.data.total_presets);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this preset?')) return;
    try {
      const res = await api.post('delete_wallpaper.php', { id });
      if (res.data.status) {
        setWallpapers(wallpapers.filter(w => w.id !== id));
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
    
    // Prevent double clicking / duplicate uploads
    if (uploading) return;

    if (!file) {
      alert('Please select a DNG preset file');
      return;
    }
    
    if (!thumbnailFile) {
      alert('A thumbnail image is required to display the preset in the app.');
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    const formData = new FormData();
    if (title) formData.append('title', title);
    if (categoryId) formData.append('category_id', categoryId);
    formData.append('image', file);
    if (thumbnailFile) formData.append('thumbnail', thumbnailFile);

    try {
      const res = await api.post('add_wallpaper.php', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        }
      });
      if (res.data.status) {
        setIsModalOpen(false);
        setFile(null);
        setThumbnailFile(null);
        setTitle('');
        setCategoryId('');
        fetchData();
      } else {
        alert(res.data.message || 'Error uploading');
      }
    } catch (err) {
      console.error(err);
      alert('Error uploading');
    } finally {
      setUploading(false);
    }
  };

  const handleAutoAnalyze = async () => {
    if (!thumbnailFile) {
      alert("Please select a thumbnail first.");
      return;
    }
    
    setIsAnalyzing(true);
    try {
      const formData = new FormData();
      formData.append('image', thumbnailFile);
      formData.append('categories', JSON.stringify(categories.map(c => ({ id: c.id, name: c.name }))));
      
      const res = await api.post('analyze_thumbnail.php', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      if (res.data.status && res.data.data) {
        if (res.data.data.title) setTitle(res.data.data.title);
        if (res.data.data.category_id) setCategoryId(res.data.data.category_id);
      } else {
        alert(res.data.message || 'AI analysis failed');
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Error communicating with AI API');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editPresetId || !editCategoryId) return;

    setUpdating(true);
    try {
      const formData = new FormData();
      formData.append('id', editPresetId);
      formData.append('title', editTitle);
      formData.append('category_id', editCategoryId);
      if (editFile) formData.append('image', editFile);
      if (editThumbnailFile) formData.append('thumbnail', editThumbnailFile);

      const res = await api.post('update_wallpaper.php', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.status) {
        setIsEditModalOpen(false);
        fetchData();
      } else {
        alert(res.data.message || 'Error updating preset');
      }
    } catch (err) {
      console.error(err);
      alert('Error updating preset');
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
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Presets Dashboard</h2>
          <p className="text-sm sm:text-base text-gray-500 mt-1">Manage presets, monitor installed user devices, and send push notifications.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <Link
            to="/notifications"
            className="w-full sm:w-auto bg-white hover:bg-gray-50 text-gray-900 border border-gray-200 px-5 py-3 rounded-2xl font-medium flex items-center justify-center gap-2 transition-all duration-300 hover:scale-[1.02] active:scale-95 shadow-sm"
          >
            <Bell size={18} className="text-indigo-600" />
            Send Push
          </Link>
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full sm:w-auto bg-gray-900 hover:bg-black text-white px-6 py-3 rounded-2xl font-medium flex items-center justify-center gap-2 transition-all duration-300 hover:scale-[1.02] active:scale-95 shadow-lg shadow-gray-900/20"
          >
            <Plus size={18} strokeWidth={2.5} />
            Upload Preset
          </button>
        </div>
      </div>

      {/* Stats Counter Cards Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white/70 backdrop-blur-xl p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0 shadow-sm">
            <Smartphone size={24} />
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-gray-400">Installed Devices</div>
            <div className="text-2xl sm:text-3xl font-bold text-gray-900 mt-0.5 tracking-tight">{totalDevices}</div>
            <div className="text-xs text-indigo-600 mt-0.5 font-medium">Active App Installations</div>
          </div>
        </div>

        <div className="bg-white/70 backdrop-blur-xl p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0 shadow-sm">
            <ImageIcon size={24} />
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-gray-400">Total Presets</div>
            <div className="text-2xl sm:text-3xl font-bold text-gray-900 mt-0.5 tracking-tight">{totalPresets}</div>
            <div className="text-xs text-amber-600 mt-0.5 font-medium">Live DNG Filters</div>
          </div>
        </div>

        <div className="bg-white/70 backdrop-blur-xl p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0 shadow-sm">
            <Layers size={24} />
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-gray-400">Categories</div>
            <div className="text-2xl sm:text-3xl font-bold text-gray-900 mt-0.5 tracking-tight">{totalCategoriesCount}</div>
            <div className="text-xs text-emerald-600 mt-0.5 font-medium">Active Collections</div>
          </div>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex justify-center py-32">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900"></div>
        </div>
      ) : wallpapers.length === 0 ? (
        <div className="text-center py-32 bg-white/70 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50">
          <ImageIcon className="mx-auto text-gray-300 mb-4" size={56} strokeWidth={1} />
          <p className="text-gray-500 text-lg">No presets uploaded yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
          {wallpapers.map((wp) => (
            <div key={wp.id} className="group relative bg-white rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] transition-all duration-500 border border-white/50">
              <div className="aspect-[3/4] bg-gray-100 relative overflow-hidden">
                <img
                  src={`https://api.devkayy.in/${wp.thumbnail_path}`}
                  alt={wp.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <button
                    onClick={() => {
                      setEditPresetId(wp.id);
                      setEditTitle(wp.title);
                      setEditCategoryId(wp.category_id);
                      setEditFile(null);
                      setEditThumbnailFile(null);
                      setIsEditModalOpen(true);
                    }}
                    className="bg-white/90 hover:bg-white text-gray-800 p-2.5 rounded-xl backdrop-blur-md transition-all duration-300 hover:scale-110 shadow-sm"
                    title="Edit"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(wp.id)}
                    className="bg-white/90 hover:bg-red-500 hover:text-white text-red-500 p-2.5 rounded-xl backdrop-blur-md transition-all duration-300 hover:scale-110 shadow-sm"
                    title="Delete"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              <div className="p-5">
                <h3 className="font-semibold text-gray-900 truncate text-base">{wp.title}</h3>
                <p className="text-sm text-gray-500 mt-0.5">{wp.category_name || 'Uncategorized'}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {!loading && totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-8 pb-4">
          <button
            onClick={() => {
              const newPage = Math.max(1, page - 1);
              setPage(newPage);
              fetchData(newPage);
            }}
            disabled={page === 1}
            className="px-5 py-2.5 bg-white border border-gray-200/60 rounded-xl font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-50 disabled:pointer-events-none transition-all shadow-sm"
          >
            Previous
          </button>
          <span className="text-gray-500 font-medium px-4">
            Page <span className="text-gray-900">{page}</span> of <span className="text-gray-900">{totalPages}</span>
          </span>
          <button
            onClick={() => {
              const newPage = Math.min(totalPages, page + 1);
              setPage(newPage);
              fetchData(newPage);
            }}
            disabled={page === totalPages}
            className="px-5 py-2.5 bg-white border border-gray-200/60 rounded-xl font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-50 disabled:pointer-events-none transition-all shadow-sm"
          >
            Next
          </button>
        </div>
      )}
      </div>

      {/* Upload Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
          <div className="bg-white/90 backdrop-blur-xl rounded-[2rem] shadow-[0_20px_60px_rgb(0,0,0,0.1)] border border-white/50 w-full max-w-md max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-300">
            <div className="px-6 py-6 sm:px-8 sm:py-6 flex justify-between items-center sticky top-0 bg-white/90 backdrop-blur-xl z-10 border-b border-gray-100/50">
              <h3 className="font-bold text-gray-900 text-xl tracking-tight">Upload Preset</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-900 hover:rotate-90 transition-all duration-300 bg-gray-100 hover:bg-gray-200 p-2 rounded-full">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpload} className="px-6 pb-6 sm:px-8 sm:pb-8 pt-4 space-y-6">
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-700">Preset File (DNG)</label>
                <div className="border-2 border-dashed border-gray-200 rounded-2xl p-4 text-center hover:bg-gray-50/50 hover:border-gray-300 transition-all">
                  <input
                    type="file"
                    accept="*/*"
                    onChange={(e) => setFile(e.target.files[0])}
                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-5 file:rounded-xl file:border-0 file:text-sm file:font-medium file:bg-gray-900 file:text-white hover:file:bg-black transition-all cursor-pointer"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-700">Thumbnail</label>
                <div className="border-2 border-dashed border-gray-200 rounded-2xl p-4 text-center hover:bg-gray-50/50 hover:border-gray-300 transition-all">
                  <input
                    type="file"
                    accept="*/*"
                    onChange={(e) => setThumbnailFile(e.target.files[0])}
                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-5 file:rounded-xl file:border-0 file:text-sm file:font-medium file:bg-gray-100 file:text-gray-900 hover:file:bg-gray-200 transition-all cursor-pointer"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="block text-sm font-medium text-gray-700">Title <span className="text-gray-400 font-normal">(Optional)</span></label>
                  <button 
                    type="button" 
                    onClick={handleAutoAnalyze}
                    disabled={isAnalyzing || !thumbnailFile}
                    className="text-xs font-medium bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-2.5 py-1 rounded-md hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {isAnalyzing ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                        <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 10.5264 0 5.962 5.962 0 0 0 5.5682 3.1202 5.9525 5.9525 0 0 0 1.7181 14.1789a5.9847 5.9847 0 0 0 .5157 4.9108 6.0462 6.0462 0 0 0 6.5098 2.9A6.0651 6.0651 0 0 0 13.4736 24a5.962 5.962 0 0 0 4.9582-3.1202 5.9525 5.9525 0 0 0 3.8501-11.0587ZM13.4736 22.3768a4.4373 4.4373 0 0 1-3.6934-2.0353l.1423-.0831 4.5422-2.628v-5.234l3.1951 1.8447v6.6908a4.4447 4.4447 0 0 1-4.1862 1.4449ZM3.38 15.6599a4.4442 4.4442 0 0 1-.3832-4.1866l.1425.083 4.5422 2.628v5.234l-3.195-1.8447-3.3444-1.932a4.4534 4.4534 0 0 1 2.2379-3.9817ZM2.626 8.3188A4.4377 4.4377 0 0 1 5.9897 5.76l-.0712.124-2.2711 3.9427h5.234L5.6873 11.671 2.343 9.7391A4.4447 4.4447 0 0 1 2.626 8.3188ZM10.5264 1.6232a4.4373 4.4373 0 0 1 3.6934 2.0353l-.1423.0831-4.5422 2.628v5.234l-3.1951-1.8447V3.068a4.4447 4.4447 0 0 1 4.1862-1.4449Zm10.0936 6.7169a4.4442 4.4442 0 0 1 .3832 4.1866l-.1425-.083-4.5422-2.628v-5.234l3.195 1.8447 3.3444 1.932a4.4534 4.4534 0 0 1-2.2379 3.9817Zm.754-7.3411a4.4377 4.4377 0 0 1-3.3637 2.5588l.0712-.124 2.2711-3.9427H15.118l3.1951-1.8445 3.3443 1.9319a4.4447 4.4447 0 0 1-.2831 1.4203ZM12 15.2268a3.2268 3.2268 0 1 1 0-6.4536 3.2268 3.2268 0 0 1 0 6.4536Z"/>
                      </svg>
                    )}
                    Auto Generate AI
                  </button>
                </div>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 bg-white/50 border border-gray-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900/20 focus:border-gray-900/30 transition-all text-sm"
                  placeholder="e.g. Moody Brown"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-700">Category</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-4 py-3 bg-white/50 border border-gray-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900/20 focus:border-gray-900/30 transition-all text-sm"
                >
                  <option value="">Select Category (Optional)</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={uploading}
                  className="w-full bg-gray-900 hover:bg-black text-white font-medium py-3.5 rounded-xl transition-all duration-300 disabled:opacity-70 disabled:scale-100 hover:scale-[1.02] active:scale-95 shadow-lg shadow-gray-900/20 flex justify-center items-center gap-2 relative overflow-hidden"
                >
                  {uploading ? (
                    <>
                      <div 
                        className="absolute left-0 top-0 bottom-0 bg-white/20 transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                      <Loader2 size={18} className="animate-spin relative z-10" />
                      <span className="relative z-10">Uploading... {uploadProgress}%</span>
                    </>
                  ) : (
                    'Upload Preset'
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
              <h3 className="font-bold text-gray-900 text-xl tracking-tight">Edit Preset</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-gray-900 hover:rotate-90 transition-all duration-300 bg-gray-100 hover:bg-gray-200 p-2 rounded-full">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="px-6 pb-6 sm:px-8 sm:pb-8 pt-4 space-y-6">
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-700">Preset Title</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-4 py-3 bg-white/50 border border-gray-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900/20 focus:border-gray-900/30 transition-all text-sm"
                  placeholder="e.g. Moody Brown"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-700">Category</label>
                <select
                  value={editCategoryId}
                  onChange={(e) => setEditCategoryId(e.target.value)}
                  className="w-full px-4 py-3 bg-white/50 border border-gray-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900/20 focus:border-gray-900/30 transition-all text-sm"
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-700">Replace Preset File (DNG) <span className="text-gray-400 font-normal">(Optional)</span></label>
                <div className="border-2 border-dashed border-gray-200 rounded-2xl p-4 text-center hover:bg-gray-50/50 hover:border-gray-300 transition-all">
                  <input
                    type="file"
                    accept="*/*"
                    onChange={(e) => setEditFile(e.target.files[0])}
                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-5 file:rounded-xl file:border-0 file:text-sm file:font-medium file:bg-gray-900 file:text-white hover:file:bg-black transition-all cursor-pointer"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-700">Replace Thumbnail <span className="text-gray-400 font-normal">(Optional)</span></label>
                <div className="border-2 border-dashed border-gray-200 rounded-2xl p-4 text-center hover:bg-gray-50/50 hover:border-gray-300 transition-all">
                  <input
                    type="file"
                    accept="*/*"
                    onChange={(e) => setEditThumbnailFile(e.target.files[0])}
                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-5 file:rounded-xl file:border-0 file:text-sm file:font-medium file:bg-gray-100 file:text-gray-900 hover:file:bg-gray-200 transition-all cursor-pointer"
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

export default Dashboard;
