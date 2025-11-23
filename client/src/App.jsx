import React, { useState, useEffect } from 'react';
import { Eye, Download, Search, Grid, List, Star, Code, Layers, Zap, X, Upload, Plus, Trash2, Lock, LogOut, RefreshCw, AlertCircle, User, Award, TrendingUp, Gift, Crown, Sparkles, LogIn, UserPlus } from 'lucide-react';
import { api } from './services/api';

const categories = ['All', 'Dashboard', 'Cards', 'Forms', 'Tables', 'Landing', 'Navigation'];
const gradients = ['from-indigo-500 to-purple-600', 'from-pink-500 to-rose-600', 'from-emerald-500 to-teal-600', 'from-amber-500 to-orange-600', 'from-blue-500 to-cyan-600', 'from-violet-500 to-purple-600'];

// Badge icons mapping
const badgeIcons = {
  rookie: '🌱',
  contributor: '📦',
  star: '⭐',
  legend: '👑',
  milestone_100: '💯',
  milestone_500: '🚀',
  milestone_1000: '🏆',
  milestone_5000: '👑'
};

// Auth Modal (Login/Register)
function AuthModal({ onClose, onSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ email: '', password: '', username: '', displayName: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = isLogin 
        ? await api.login(form.email, form.password)
        : await api.register({ 
            email: form.email, 
            password: form.password, 
            username: form.username,
            displayName: form.displayName || form.username
          });

      if (data.success) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        onSuccess(data.user, data.token);
        onClose();
      } else {
        setError(data.message || 'Authentication failed');
      }
    } catch (e) {
      setError('Connection error. Is the server running?');
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-gray-900 rounded-2xl max-w-md w-full border border-gray-700" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            {isLogin ? <LogIn size={20} /> : <UserPlus size={20} />}
            {isLogin ? 'Login to S3Learn' : 'Join S3Learn'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-700 rounded-lg">
            <X className="text-gray-400" size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 flex items-center gap-2">
              <AlertCircle size={18} />{error}
            </div>
          )}

          {!isLogin && (
            <>
              <input
                type="text"
                placeholder="Username"
                value={form.username}
                onChange={e => setForm({...form, username: e.target.value})}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-indigo-500 focus:outline-none"
                required
              />
              <input
                type="text"
                placeholder="Display Name (optional)"
                value={form.displayName}
                onChange={e => setForm({...form, displayName: e.target.value})}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-indigo-500 focus:outline-none"
              />
            </>
          )}

          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={e => setForm({...form, email: e.target.value})}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-indigo-500 focus:outline-none"
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={e => setForm({...form, password: e.target.value})}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-indigo-500 focus:outline-none"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <><RefreshCw size={18} className="animate-spin" /> Processing...</> : (isLogin ? 'Login' : 'Create Account')}
          </button>

          <p className="text-center text-gray-400 text-sm">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
              }}
              className="text-indigo-400 hover:text-indigo-300"
            >
              {isLogin ? 'Sign up' : 'Login'}
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}

// Preview Modal with Interactive Demo
function PreviewModal({ component, onClose }) {
  const [viewMode, setViewMode] = useState('preview'); // 'preview' or 'interactive'
  const [iframeLoaded, setIframeLoaded] = useState(false);
  
  // Generate interactive preview URL (CodeSandbox embed URL)
  const getInteractivePreviewUrl = () => {
    // For now, we'll use the preview image, but you can later add a demoUrl field to components
    // that points to CodeSandbox, StackBlitz, or your own hosted demo
    return component.demoUrl || null;
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-gray-900 rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden border border-gray-700" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div>
            <h3 className="text-xl font-bold text-white">{component.name}</h3>
            <div className="flex items-center gap-3 text-sm text-gray-400 mt-1">
              <span>{component.category}</span>
              <span>•</span>
              <span>{component.downloads} downloads</span>
              {component.creator && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    by <span className="text-indigo-400">{component.creator.displayName || component.creatorName}</span>
                  </span>
                </>
              )}
            </div>
          </div>
          <div className="flex gap-3">
            {getInteractivePreviewUrl() && (
              <div className="flex gap-1 bg-gray-800 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('preview')}
                  className={`px-3 py-1.5 rounded text-sm transition ${
                    viewMode === 'preview' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Eye size={16} className="inline mr-1" /> Preview
                </button>
                <button
                  onClick={() => setViewMode('interactive')}
                  className={`px-3 py-1.5 rounded text-sm transition ${
                    viewMode === 'interactive' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Zap size={16} className="inline mr-1" /> Interactive
                </button>
              </div>
            )}
            <button onClick={() => api.downloadComponent(component._id)} className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg text-white font-medium flex items-center gap-2 hover:opacity-90 transition">
              <Download size={18} /> Download
            </button>
            <button onClick={onClose} className="p-2 hover:bg-gray-700 rounded-lg transition">
              <X className="text-gray-400" size={24} />
            </button>
          </div>
        </div>
        <div className="p-6 bg-gray-950">
          <div className="rounded-xl overflow-hidden bg-gradient-to-br from-indigo-500/20 to-purple-600/20" style={{ height: '70vh' }}>
            {viewMode === 'interactive' && getInteractivePreviewUrl() ? (
              <div className="relative w-full h-full">
                {!iframeLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <RefreshCw className="animate-spin text-indigo-400" size={32} />
                  </div>
                )}
                <iframe
                  src={getInteractivePreviewUrl()}
                  className="w-full h-full bg-white"
                  onLoad={() => setIframeLoaded(true)}
                  title={`${component.name} interactive demo`}
                  sandbox="allow-scripts allow-same-origin allow-modals"
                />
              </div>
            ) : component.previewImage ? (
              <img src={api.getPreviewUrl(component.previewImage)} alt={component.name} className="w-full h-full object-contain" />
            ) : (
              <div className="flex items-center justify-center h-full text-center p-8">
                <div>
                  <Layers className="mx-auto text-indigo-400 mb-4" size={64} />
                  <p className="text-white text-xl font-semibold">{component.name}</p>
                  <p className="text-gray-400 mt-2">{component.description}</p>
                </div>
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

// Creator Dashboard
function CreatorDashboard({ user, token, onClose, onUploadSuccess, onLogout }) {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', category: 'Dashboard', tags: '', description: '', demoUrl: '' });
  const [files, setFiles] = useState({ zip: null, preview: null });
  const [activeTab, setActiveTab] = useState('stats'); // stats, upload, profile

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const data = await api.getStats(token);
      if (data.success) {
        setStats(data.stats);
      }
    } catch (e) {
      console.error('Failed to fetch stats');
    }
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
    if (form.demoUrl) formData.append('demoUrl', form.demoUrl);
    formData.append('zipFile', files.zip);
    formData.append('previewImage', files.preview);

    try {
      const data = await api.uploadComponent(formData, token);
      if (data.success) {
        setForm({ name: '', category: 'Dashboard', tags: '', description: '', demoUrl: '' });
        setFiles({ zip: null, preview: null });
        alert('🎉 Component uploaded successfully!');
        if (onUploadSuccess) onUploadSuccess();
        fetchStats();
      } else {
        setError(data.message || 'Upload failed');
      }
    } catch (e) {
      setError('Upload failed. Check your connection.');
    }
    setLoading(false);
  };

  const getNextMilestone = () => {
    const milestones = [100, 500, 1000, 5000];
    const current = stats?.totalDownloads || 0;
    return milestones.find(m => m > current) || 10000;
  };

  const getMilestoneProgress = () => {
    const next = getNextMilestone();
    const prev = [0, 100, 500, 1000, 5000].reverse().find(m => m < next);
    const current = stats?.totalDownloads || 0;
    return ((current - prev) / (next - prev)) * 100;
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-gray-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-auto border border-gray-700" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
              {user.displayName?.[0] || user.username[0]}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{user.displayName || user.username}</h2>
              <p className="text-sm text-gray-400">Level {user.level} Creator</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={onLogout} className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm flex items-center gap-2">
              <LogOut size={16} /> Logout
            </button>
            <button onClick={onClose} className="p-2 hover:bg-gray-700 rounded-lg">
              <X className="text-gray-400" size={24} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-700">
          {[
            { id: 'stats', label: 'Dashboard', icon: TrendingUp },
            { id: 'upload', label: 'Upload', icon: Upload },
            { id: 'rewards', label: 'Rewards', icon: Gift }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 ${
                  activeTab === tab.id
                    ? 'border-b-2 border-indigo-500 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Icon size={18} />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="p-5">
          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 flex items-center gap-2">
              <AlertCircle size={18} />{error}
            </div>
          )}

          {/* Stats Tab */}
          {activeTab === 'stats' && stats && (
            <div className="space-y-4">
              {/* Stats Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Uploads', value: stats.totalUploads, icon: Upload, color: 'from-blue-500 to-cyan-600' },
                  { label: 'Downloads', value: stats.totalDownloads, icon: Download, color: 'from-emerald-500 to-teal-600' },
                  { label: 'Level', value: stats.level, icon: Award, color: 'from-amber-500 to-orange-600' },
                  { label: 'Points', value: stats.points, icon: Star, color: 'from-purple-500 to-pink-600' }
                ].map((stat, i) => {
                  const Icon = stat.icon;
                  return (
                    <div key={i} className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                      <div className={`w-10 h-10 bg-gradient-to-r ${stat.color} rounded-lg flex items-center justify-center mb-2`}>
                        <Icon className="text-white" size={20} />
                      </div>
                      <p className="text-2xl font-bold text-white">{stat.value}</p>
                      <p className="text-sm text-gray-400">{stat.label}</p>
                    </div>
                  );
                })}
              </div>

              {/* Milestone Progress */}
              <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <TrendingUp size={20} /> Next Milestone
                  </h3>
                  <span className="text-indigo-400 font-semibold">{stats.totalDownloads} / {getNextMilestone()}</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-500"
                    style={{ width: `${Math.min(getMilestoneProgress(), 100)}%` }}
                  />
                </div>
                <p className="text-sm text-gray-400 mt-2">
                  {getNextMilestone() - stats.totalDownloads} more downloads to unlock rewards!
                </p>
              </div>

              {/* Badges */}
              {stats.badges && stats.badges.length > 0 && (
                <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <Award size={20} /> Your Badges
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {stats.badges.map((badge, i) => (
                      <div key={i} className="px-4 py-2 bg-gray-700 rounded-lg border border-gray-600 flex items-center gap-2">
                        <span className="text-2xl">{badgeIcons[badge.type] || '🏅'}</span>
                        <span className="text-white capitalize">{badge.type.replace('_', ' ')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Upload Tab */}
          {activeTab === 'upload' && (
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Component Name *"
                value={form.name}
                onChange={e => setForm({...form, name: e.target.value})}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-indigo-500 focus:outline-none"
              />

              <select
                value={form.category}
                onChange={e => setForm({...form, category: e.target.value})}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-indigo-500 focus:outline-none"
              >
                {categories.filter(c => c !== 'All').map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>

              <input
                type="text"
                placeholder="Tags (comma separated)"
                value={form.tags}
                onChange={e => setForm({...form, tags: e.target.value})}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-indigo-500 focus:outline-none"
              />

              <textarea
                placeholder="Description"
                value={form.description}
                onChange={e => setForm({...form, description: e.target.value})}
                rows={3}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-indigo-500 focus:outline-none resize-none"
              />

              <input
                type="url"
                placeholder="Demo URL (optional) - CodeSandbox, StackBlitz, or live demo"
                value={form.demoUrl || ''}
                onChange={e => setForm({...form, demoUrl: e.target.value})}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-indigo-500 focus:outline-none"
              />

              <div className="grid grid-cols-2 gap-3">
                <label className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition ${files.zip ? 'border-emerald-500 bg-emerald-500/10' : 'border-gray-600 hover:border-indigo-500'}`}>
                  <Upload className={`mx-auto mb-1 ${files.zip ? 'text-emerald-400' : 'text-gray-500'}`} size={24} />
                  <p className={`text-sm truncate ${files.zip ? 'text-emerald-400' : 'text-gray-400'}`}>
                    {files.zip?.name || 'Upload .zip *'}
                  </p>
                  <input type="file" accept=".zip" className="hidden" onChange={e => setFiles({...files, zip: e.target.files[0]})} />
                </label>
                <label className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition ${files.preview ? 'border-emerald-500 bg-emerald-500/10' : 'border-gray-600 hover:border-indigo-500'}`}>
                  <Upload className={`mx-auto mb-1 ${files.preview ? 'text-emerald-400' : 'text-gray-500'}`} size={24} />
                  <p className={`text-sm truncate ${files.preview ? 'text-emerald-400' : 'text-gray-400'}`}>
                    {files.preview?.name || 'Preview image *'}
                  </p>
                  <input type="file" accept="image/*" className="hidden" onChange={e => setFiles({...files, preview: e.target.files[0]})} />
                </label>
              </div>

              <button
                onClick={handleUpload}
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? <><RefreshCw size={18} className="animate-spin" /> Uploading...</> : <><Plus size={18} /> Upload Component</>}
              </button>

              <div className="space-y-2">
                <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-lg p-4">
                  <p className="text-indigo-300 text-sm">
                    💡 <strong>Tip:</strong> High-quality components with good previews get more downloads and help you reach milestones faster!
                  </p>
                </div>
                <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
                  <p className="text-purple-300 text-sm">
                    <Zap size={14} className="inline mr-1" />
                    <strong>Interactive Demo:</strong> Add a CodeSandbox or StackBlitz URL so users can try your component live!
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Rewards Tab */}
          {activeTab === 'rewards' && stats && (
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-indigo-500/20 to-purple-600/20 border border-indigo-500/30 rounded-xl p-5">
                <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                  <Gift size={24} /> Reward System
                </h3>
                <p className="text-gray-300">Earn rewards as your components reach download milestones!</p>
              </div>

              {/* Milestones */}
              <div className="space-y-3">
                {[
                  { milestone: 100, title: 'Rising Star 🌟', desc: 'Special badge & recognition', reached: stats.totalDownloads >= 100 },
                  { milestone: 500, title: 'Featured Creator ⭐', desc: 'Your components get featured', reached: stats.totalDownloads >= 500 },
                  { milestone: 1000, title: 'Master Creator 🏆', desc: 'Digital certificate of excellence', reached: stats.totalDownloads >= 1000 },
                  { milestone: 5000, title: 'Legend Status 👑', desc: 'Exclusive gift package', reached: stats.totalDownloads >= 5000 }
                ].map((reward, i) => (
                  <div
                    key={i}
                    className={`p-4 rounded-xl border ${
                      reward.reached
                        ? 'bg-emerald-500/10 border-emerald-500/50'
                        : 'bg-gray-800 border-gray-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className={`font-semibold ${reward.reached ? 'text-emerald-400' : 'text-white'}`}>
                          {reward.title}
                        </h4>
                        <p className="text-sm text-gray-400">{reward.desc}</p>
                        <p className="text-xs text-gray-500 mt-1">{reward.milestone} downloads</p>
                      </div>
                      {reward.reached ? (
                        <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xl">✓</span>
                        </div>
                      ) : (
                        <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
                          <Lock className="text-gray-500" size={20} />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Claimed Rewards */}
              {stats.rewards && stats.rewards.length > 0 && (
                <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <Crown size={20} className="text-yellow-400" /> Claimed Rewards
                  </h3>
                  <div className="space-y-2">
                    {stats.rewards.map((reward, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                        <div>
                          <p className="text-white font-medium">{reward.title}</p>
                          <p className="text-sm text-gray-400">{reward.description}</p>
                        </div>
                        <span className="text-emerald-400 text-sm">✓ Unlocked</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Main App Component
export default function App() {
  const [components, setComponents] = useState([]);
  const [stats, setStats] = useState({ components: 0, downloads: 0, categories: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [viewMode, setViewMode] = useState('grid');
  const [preview, setPreview] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    // Check for existing auth
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    fetchData();
  }, [category, search]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [compRes, statsRes] = await Promise.all([
        api.getComponents({ category: category !== 'All' ? category : '', search }),
        api.getComponentStats()
      ]);
      if (compRes.success) setComponents(compRes.data);
      if (statsRes.success) setStats(statsRes.data);
    } catch (e) {
      console.error('Failed to fetch data');
    }
    setLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setToken(null);
    setShowDashboard(false);
  };

  const handleAuthSuccess = (userData, userToken) => {
    setUser(userData);
    setToken(userToken);
  };

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
              <p className="text-xs text-gray-500">Create, Share, Earn</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {user ? (
              <button
                onClick={() => setShowDashboard(true)}
                className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg text-sm font-medium flex items-center gap-2"
              >
                <User size={16} />
                Dashboard
              </button>
            ) : (
              <button
                onClick={() => setShowAuth(true)}
                className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg text-sm font-medium flex items-center gap-2"
              >
                <LogIn size={16} />
                Login / Join
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative py-16 px-4 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full mb-6">
          <Sparkles className="text-indigo-400" size={16} />
          <span className="text-indigo-300 text-sm">Join Our Creator Community & Earn Rewards</span>
        </div>
        <h2 className="text-4xl md:text-5xl font-bold mb-6">
          Share Your React UI Components
          <span className="block mt-2 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Earn Recognition & Rewards
          </span>
        </h2>
        <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
          Upload your components, track downloads, and unlock exclusive rewards at milestones.
          Get featured when you reach 500 downloads. Win prizes at 1000+!
        </p>
        <div className="relative max-w-xl mx-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
          <input
            type="text"
            placeholder="Search components..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-gray-900 border border-gray-700 rounded-2xl text-white placeholder-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>
      </section>

      {/* Stats */}
      <section className="relative px-4 pb-8">
        <div className="max-w-3xl mx-auto grid grid-cols-3 gap-4">
          {[
            { l: 'Components', v: stats.components },
            { l: 'Downloads', v: stats.downloads?.toLocaleString() },
            { l: 'Creators', v: stats.categories }
          ].map((s, i) => (
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
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  category === cat
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="flex gap-1 bg-gray-800 rounded-lg p-1">
            <button onClick={() => setViewMode('grid')} className={`p-2 rounded ${viewMode === 'grid' ? 'bg-gray-700' : ''}`}>
              <Grid size={18} className={viewMode === 'grid' ? 'text-white' : 'text-gray-500'} />
            </button>
            <button onClick={() => setViewMode('list')} className={`p-2 rounded ${viewMode === 'list' ? 'bg-gray-700' : ''}`}>
              <List size={18} className={viewMode === 'list' ? 'text-white' : 'text-gray-500'} />
            </button>
          </div>
        </div>
      </section>

      {/* Components */}
      <section className="relative px-4 pb-20">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="text-center py-20">
              <RefreshCw className="mx-auto animate-spin text-indigo-400" size={32} />
              <p className="text-gray-400 mt-4">Loading...</p>
            </div>
          ) : components.length === 0 ? (
            <div className="text-center py-20">
              <Code className="mx-auto text-gray-600" size={48} />
              <p className="text-gray-400 mt-4">No components found</p>
            </div>
          ) : (
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
              {components.map((comp, idx) => (
                <div key={comp._id} className={`group bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden hover:border-gray-700 transition-all hover:shadow-xl hover:shadow-purple-500/10 ${viewMode === 'list' ? 'flex' : ''}`}>
                  <div className={`relative overflow-hidden ${viewMode === 'list' ? 'w-48 flex-shrink-0' : 'aspect-video'}`}>
                    <div className={`absolute inset-0 bg-gradient-to-br ${gradients[idx % gradients.length]} opacity-30`} />
                    {comp.previewImage ? (
                      <img src={api.getPreviewUrl(comp.previewImage)} alt={comp.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Layers className="text-white/50" size={48} />
                      </div>
                    )}
                    <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 bg-black/50 backdrop-blur rounded-full">
                      <Star className="text-yellow-400 fill-yellow-400" size={12} />
                      <span className="text-xs text-white">{comp.stars}</span>
                    </div>
                  </div>
                  <div className="p-5 flex-1">
                    <div className="flex justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-white group-hover:text-indigo-400 transition">{comp.name}</h3>
                        <p className="text-sm text-gray-500">{comp.category}</p>
                        {comp.creator && (
                          <p className="text-xs text-indigo-400 mt-1">
                            by {comp.creator.displayName || comp.creatorName}
                            {comp.creator.level > 5 && <span className="ml-1">👑</span>}
                          </p>
                        )}
                      </div>
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Download size={12} />{comp.downloads}
                      </span>
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
        <p className="text-gray-500 text-sm">Made with ❤️ for creators • <span className="text-indigo-400">s3learn.com</span></p>
      </footer>

      {/* Modals */}
      {preview && <PreviewModal component={preview} onClose={() => setPreview(null)} />}
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} onSuccess={handleAuthSuccess} />}
      {showDashboard && user && token && (
        <CreatorDashboard
          user={user}
          token={token}
          onClose={() => setShowDashboard(false)}
          onUploadSuccess={fetchData}
          onLogout={handleLogout}
        />
      )}
    </div>
  );
}
