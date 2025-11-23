import React, { useState, useEffect } from 'react';
import { Eye, Download, Search, Grid, List, Star, Code, Layers, Zap, X, Upload, Plus, Trash2, Lock, LogOut, RefreshCw, AlertCircle } from 'lucide-react';
import { api } from './services/api';

const categories = ['All', 'Dashboard', 'Cards', 'Forms', 'Tables', 'Landing', 'Navigation'];
const gradients = ['from-indigo-500 to-purple-600', 'from-pink-500 to-rose-600', 'from-emerald-500 to-teal-600', 'from-amber-500 to-orange-600', 'from-blue-500 to-cyan-600', 'from-violet-500 to-purple-600'];

// Mock data for demo mode
const mockData = [
  { _id: '1', name: 'Modern Dashboard', category: 'Dashboard', downloads: 1234, stars: 4.8, tags: ['admin', 'charts'], description: 'Admin dashboard' },
  { _id: '2', name: 'E-Commerce Card', category: 'Cards', downloads: 892, stars: 4.6, tags: ['shop'], description: 'Product card' },
  { _id: '3', name: 'Login Form', category: 'Forms', downloads: 2156, stars: 4.9, tags: ['auth'], description: 'Login form' },
  { _id: '4', name: 'Pricing Table', category: 'Tables', downloads: 756, stars: 4.5, tags: ['pricing'], description: 'Pricing' },
  { _id: '5', name: 'Hero Section', category: 'Landing', downloads: 1567, stars: 4.7, tags: ['landing'], description: 'Hero' },
  { _id: '6', name: 'Navbar', category: 'Navigation', downloads: 3421, stars: 4.8, tags: ['nav'], description: 'Navigation' },
];

// Preview Modal
function PreviewModal({ component, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-gray-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-gray-700" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div>
            <h3 className="text-xl font-bold text-white">{component.name}</h3>
            <p className="text-gray-400 text-sm">{component.category} • {component.downloads} downloads</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => api.downloadComponent(component._id)} className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg text-white font-medium flex items-center gap-2">
              <Download size={18} /> Download
            </button>
            <button onClick={onClose} className="p-2 hover:bg-gray-700 rounded-lg"><X className="text-gray-400" size={24} /></button>
          </div>
        </div>
        <div className="p-6 bg-gray-950">
          <div className="aspect-video rounded-xl overflow-hidden bg-gradient-to-br from-indigo-500/20 to-purple-600/20 flex items-center justify-center">
            {component.previewImage ? (
              <img src={api.getPreviewUrl(component.previewImage)} alt={component.name} className="w-full h-full object-cover" />
            ) : (
              <div className="text-center p-8">
                <Layers className="mx-auto text-indigo-400 mb-4" size={64} />
                <p className="text-white text-xl font-semibold">{component.name}</p>
                <p className="text-gray-400 mt-2">{component.description}</p>
              </div>
            )}
          </div>
        </div>
        <div className="p-4 border-t border-gray-700 flex gap-2 flex-wrap">
          {component.tags?.map(tag => <span key={tag} className="px-3 py-1 bg-gray-800 rounded-full text-sm text-gray-300">#{tag}</span>)}
        </div>
      </div>
    </div>
  );
}

// Admin Panel
function AdminPanel({ onClose, onUploadSuccess }) {
  const [adminKey, setAdminKey] = useState('');
  const [isAuth, setIsAuth] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', category: 'Dashboard', tags: '', description: '' });
  const [files, setFiles] = useState({ zip: null, preview: null });

  const handleAuth = async () => {
    if (!adminKey) {
      setError('Please enter admin key');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const data = await api.verifyAdminKey(adminKey);
      if (data.success) {
        setIsAuth(true);
        setError('');
      } else {
        setError(data.message || 'Invalid admin key');
      }
    } catch (e) {
      setError('Cannot connect to server');
    }
    setLoading(false);
  };

  const handleUpload = async () => {
    if (!form.name || !files.zip || !files.preview) {
      setError('Fill all required fields'); return;
    }
    setLoading(true);
    setError('');
    
    const formData = new FormData();
    formData.append('name', form.name);
    formData.append('category', form.category);
    formData.append('tags', form.tags);
    formData.append('description', form.description);
    formData.append('zipFile', files.zip);
    formData.append('previewImage', files.preview);
    
    try {
      const data = await api.uploadComponent(formData, adminKey);
      if (data.success) {
        setForm({ name: '', category: 'Dashboard', tags: '', description: '' });
        setFiles({ zip: null, preview: null });
        alert('Component uploaded successfully!');
        if (onUploadSuccess) onUploadSuccess();
      } else {
        setError(data.message || 'Upload failed');
      }
    } catch (e) {
      setError('Upload failed. Is server running?');
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-gray-900 rounded-2xl max-w-xl w-full max-h-[90vh] overflow-auto border border-gray-700" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white flex items-center gap-2"><Lock size={20} /> Admin Panel</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-700 rounded-lg"><X className="text-gray-400" size={24} /></button>
        </div>
        
        <div className="p-5">
          {error && <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 flex items-center gap-2"><AlertCircle size={18} />{error}</div>}
          
          {!isAuth ? (
            <div className="space-y-4">
              <p className="text-gray-400">Enter your admin secret key (default: 1234)</p>
              <input type="password" placeholder="Admin Secret Key" value={adminKey} onChange={e => setAdminKey(e.target.value)} onKeyDown={e => e.key === 'Enter' && !loading && handleAuth()}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-indigo-500 focus:outline-none" />
              <button onClick={handleAuth} disabled={loading} className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-50">
                {loading ? <><RefreshCw size={18} className="animate-spin" /> Verifying...</> : 'Authenticate'}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-emerald-400 text-sm">✓ Authenticated</span>
                <button onClick={() => setIsAuth(false)} className="text-gray-400 text-sm flex items-center gap-1 hover:text-white"><LogOut size={14} /> Logout</button>
              </div>
              
              <input type="text" placeholder="Component Name *" value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-indigo-500 focus:outline-none" />
              
              <select value={form.category} onChange={e => setForm({...form, category: e.target.value})}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-indigo-500 focus:outline-none">
                {categories.filter(c => c !== 'All').map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
              
              <input type="text" placeholder="Tags (comma separated)" value={form.tags} onChange={e => setForm({...form, tags: e.target.value})}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-indigo-500 focus:outline-none" />
              
              <textarea placeholder="Description" value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={2}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-indigo-500 focus:outline-none resize-none" />
              
              <div className="grid grid-cols-2 gap-3">
                <label className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition ${files.zip ? 'border-emerald-500 bg-emerald-500/10' : 'border-gray-600 hover:border-indigo-500'}`}>
                  <Upload className={`mx-auto mb-1 ${files.zip ? 'text-emerald-400' : 'text-gray-500'}`} size={24} />
                  <p className={`text-sm truncate ${files.zip ? 'text-emerald-400' : 'text-gray-400'}`}>{files.zip?.name || 'Upload .zip *'}</p>
                  <input type="file" accept=".zip" className="hidden" onChange={e => setFiles({...files, zip: e.target.files[0]})} />
                </label>
                <label className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition ${files.preview ? 'border-emerald-500 bg-emerald-500/10' : 'border-gray-600 hover:border-indigo-500'}`}>
                  <Upload className={`mx-auto mb-1 ${files.preview ? 'text-emerald-400' : 'text-gray-500'}`} size={24} />
                  <p className={`text-sm truncate ${files.preview ? 'text-emerald-400' : 'text-gray-400'}`}>{files.preview?.name || 'Preview image *'}</p>
                  <input type="file" accept="image/*" className="hidden" onChange={e => setFiles({...files, preview: e.target.files[0]})} />
                </label>
              </div>
              
              <button onClick={handleUpload} disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-50">
                {loading ? <><RefreshCw size={18} className="animate-spin" /> Uploading...</> : <><Plus size={18} /> Upload Component</>}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Main App
export default function App() {
  const [components, setComponents] = useState([]);
  const [stats, setStats] = useState({ components: 0, downloads: 0, categories: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [viewMode, setViewMode] = useState('grid');
  const [preview, setPreview] = useState(null);
  const [showAdmin, setShowAdmin] = useState(false);
  const [isDemo, setIsDemo] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [compRes, statsRes] = await Promise.all([
        api.getComponents({ category: category !== 'All' ? category : '', search }),
        api.getStats()
      ]);
      if (compRes.success) {
        setComponents(compRes.data);
        setIsDemo(false);
      } else throw new Error();
      if (statsRes.success) setStats(statsRes.data);
    } catch {
      // Fallback to demo data
      setComponents(mockData.filter(c => (category === 'All' || c.category === category) && (!search || c.name.toLowerCase().includes(search.toLowerCase()))));
      setStats({ components: mockData.length, downloads: 10000, categories: 6 });
      setIsDemo(true);
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [category, search]);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 -left-40 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}} />
        <div className="absolute -bottom-40 right-1/3 w-80 h-80 bg-pink-500/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}} />
      </div>

      {/* Header */}
      <header className="relative border-b border-gray-800 bg-gray-900/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Layers className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">S3Learn</h1>
              <p className="text-xs text-gray-500">{isDemo ? '⚡ Demo Mode' : '✓ Connected'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setShowAdmin(true)} className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm font-medium transition">Admin</button>
            <a href="https://github.com" target="_blank" className="hidden sm:flex px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg text-sm font-medium">⭐ GitHub</a>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative py-16 px-4 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full mb-6">
          <Zap className="text-indigo-400" size={16} /><span className="text-indigo-300 text-sm">100% Free & Open Source</span>
        </div>
        <h2 className="text-4xl md:text-5xl font-bold mb-6">Beautiful React UI <span className="block mt-2 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">Components Library</span></h2>
        <p className="text-gray-400 mb-8 max-w-xl mx-auto">Download production-ready React components. Preview, download, and ship faster.</p>
        <div className="relative max-w-xl mx-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
          <input type="text" placeholder="Search components..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-gray-900 border border-gray-700 rounded-2xl text-white placeholder-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
        </div>
      </section>

      {/* Stats */}
      <section className="relative px-4 pb-8">
        <div className="max-w-3xl mx-auto grid grid-cols-3 gap-4">
          {[{ l: 'Components', v: stats.components }, { l: 'Downloads', v: stats.downloads?.toLocaleString() }, { l: 'Categories', v: stats.categories }].map((s, i) => (
            <div key={i} className="text-center p-4 bg-gray-900/50 rounded-xl border border-gray-800">
              <p className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">{s.v}+</p>
              <p className="text-gray-500 text-sm">{s.l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Filters */}
      <section className="relative px-4 pb-8">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <button key={cat} onClick={() => setCategory(cat)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${category === cat ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}>
                {cat}
              </button>
            ))}
          </div>
          <div className="flex gap-1 bg-gray-800 rounded-lg p-1">
            <button onClick={() => setViewMode('grid')} className={`p-2 rounded ${viewMode === 'grid' ? 'bg-gray-700' : ''}`}><Grid size={18} className={viewMode === 'grid' ? 'text-white' : 'text-gray-500'} /></button>
            <button onClick={() => setViewMode('list')} className={`p-2 rounded ${viewMode === 'list' ? 'bg-gray-700' : ''}`}><List size={18} className={viewMode === 'list' ? 'text-white' : 'text-gray-500'} /></button>
          </div>
        </div>
      </section>

      {/* Components */}
      <section className="relative px-4 pb-20">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="text-center py-20"><RefreshCw className="mx-auto animate-spin text-indigo-400" size={32} /><p className="text-gray-400 mt-4">Loading...</p></div>
          ) : components.length === 0 ? (
            <div className="text-center py-20"><Code className="mx-auto text-gray-600" size={48} /><p className="text-gray-400 mt-4">No components found</p></div>
          ) : (
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
              {components.map((comp, idx) => (
                <div key={comp._id} className={`group bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden hover:border-gray-700 transition-all hover:shadow-xl hover:shadow-purple-500/10 ${viewMode === 'list' ? 'flex' : ''}`}>
                  <div className={`relative overflow-hidden ${viewMode === 'list' ? 'w-48 flex-shrink-0' : 'aspect-video'}`}>
                    <div className={`absolute inset-0 bg-gradient-to-br ${gradients[idx % gradients.length]} opacity-30`} />
                    {comp.previewImage ? (
                      <img src={api.getPreviewUrl(comp.previewImage)} alt={comp.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center"><Layers className="text-white/50" size={48} /></div>
                    )}
                    <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 bg-black/50 backdrop-blur rounded-full">
                      <Star className="text-yellow-400 fill-yellow-400" size={12} /><span className="text-xs text-white">{comp.stars}</span>
                    </div>
                  </div>
                  <div className="p-5 flex-1">
                    <div className="flex justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-white group-hover:text-indigo-400 transition">{comp.name}</h3>
                        <p className="text-sm text-gray-500">{comp.category}</p>
                      </div>
                      <span className="text-xs text-gray-500 flex items-center gap-1"><Download size={12} />{comp.downloads}</span>
                    </div>
                    <div className="flex flex-wrap gap-1 mb-4">
                      {comp.tags?.slice(0, 3).map(t => <span key={t} className="px-2 py-0.5 bg-gray-800 rounded text-xs text-gray-400">#{t}</span>)}
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => setPreview(comp)} className="flex-1 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition">
                        <Eye size={16} /> Preview
                      </button>
                      <button onClick={() => api.downloadComponent(comp._id)} className="flex-1 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg text-sm font-medium flex items-center justify-center gap-2 hover:opacity-90 transition">
                        <Download size={16} /> Download
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t border-gray-800 py-8 px-4 text-center">
        <p className="text-gray-500 text-sm">Made with ❤️ for developers • <span className="text-indigo-400">s3learn.com</span></p>
      </footer>

      {/* Modals */}
      {preview && <PreviewModal component={preview} onClose={() => setPreview(null)} />}
      {showAdmin && <AdminPanel onClose={() => setShowAdmin(false)} onUploadSuccess={fetchData} />}
    </div>
  );
}