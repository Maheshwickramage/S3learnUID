import React, { useState, useEffect } from 'react';
import { Eye, Download, Search, Grid, List, Star, Code, Layers, Zap, X, Upload, Plus, Trash2, Lock, LogOut, RefreshCw, AlertCircle, User, Award, TrendingUp, Gift, Crown, Sparkles, LogIn, UserPlus, Play } from 'lucide-react';
import { api } from './services/api';
import RewardPopup from './components/RewardPopup';

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
    <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-md w-full border-2 border-blue-100 shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b-2 border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            {isLogin ? <LogIn size={20} className="text-blue-600" /> : <UserPlus size={20} className="text-blue-600" />}
            {isLogin ? 'Login to S3Learn' : 'Join S3Learn'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-blue-100 rounded-lg transition">
            <X className="text-gray-600" size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border-2 border-red-200 rounded-lg text-red-700 flex items-center gap-2 font-medium">
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
                className="w-full px-4 py-3 bg-gray-50 border-2 border-blue-100 rounded-lg text-gray-800 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100 placeholder-gray-400"
                required
              />
              <input
                type="text"
                placeholder="Display Name (optional)"
                value={form.displayName}
                onChange={e => setForm({...form, displayName: e.target.value})}
                className="w-full px-4 py-3 bg-gray-50 border-2 border-blue-100 rounded-lg text-gray-800 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100 placeholder-gray-400"
              />
            </>
          )}

          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={e => setForm({...form, email: e.target.value})}
            className="w-full px-4 py-3 bg-gray-50 border-2 border-blue-100 rounded-lg text-gray-800 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100 placeholder-gray-400"
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={e => setForm({...form, password: e.target.value})}
            className="w-full px-4 py-3 bg-gray-50 border-2 border-blue-100 rounded-lg text-gray-800 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100 placeholder-gray-400"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition"
          >
            {loading ? <><RefreshCw size={18} className="animate-spin" /> Processing...</> : (isLogin ? 'Login' : 'Create Account')}
          </button>

          <p className="text-center text-gray-600 text-sm">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
              }}
              className="text-blue-600 hover:text-blue-700 font-semibold"
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
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  
  // Generate interactive preview URL (CodeSandbox embed URL)
  const getInteractivePreviewUrl = () => {
    return component.demoUrl || null;
  };

  // Get all images for gallery (main preview + additional images)
  const getAllImages = () => {
    const images = [component.previewUrl];
    if (component.imagesUrls && component.imagesUrls.length > 0) {
      images.push(...component.imagesUrls);
    }
    return images;
  };

  const allImages = getAllImages();
  const hasMultipleImages = allImages.length > 1;
  const hasVideo = component.previewVideo && component.previewVideoUrl;

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
            <button onClick={() => handleDownload(component)} className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg text-white font-medium flex items-center gap-2 hover:opacity-90 transition">
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
            ) : hasVideo ? (
              <video 
                controls 
                poster={allImages[0]}
                className="w-full h-full object-contain bg-black"
              >
                <source src={component.previewVideoUrl} type="video/mp4" />
                <source src={component.previewVideoUrl} type="video/webm" />
                Your browser doesn't support video playback.
              </video>
            ) : (
              <div className="relative w-full h-full">
                <img 
                  src={allImages[selectedImageIndex]} 
                  alt={`${component.name} - View ${selectedImageIndex + 1}`} 
                  className="w-full h-full object-contain" 
                />
                
                {/* Image Gallery Navigation */}
                {hasMultipleImages && (
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 bg-black/50 backdrop-blur-sm px-4 py-2 rounded-full">
                    {allImages.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedImageIndex(idx)}
                        className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition ${
                          selectedImageIndex === idx ? 'border-blue-500 scale-110' : 'border-transparent hover:border-gray-400'
                        }`}
                      >
                        <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
                
                {/* Image Counter */}
                {hasMultipleImages && (
                  <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full text-white text-sm">
                    {selectedImageIndex + 1} / {allImages.length}
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Media Type Indicator */}
          <div className="flex gap-2 mt-3 justify-center">
            {hasVideo && (
              <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-xs flex items-center gap-1">
                <Play size={12} /> Video Available
              </span>
            )}
            {hasMultipleImages && (
              <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs flex items-center gap-1">
                <Layers size={12} /> {allImages.length} Images
              </span>
            )}
            {getInteractivePreviewUrl() && (
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-xs flex items-center gap-1">
                <Zap size={12} /> Interactive Demo
              </span>
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
  const [uploadProgress, setUploadProgress] = useState(0);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', category: 'Dashboard', tags: '', description: '', demoUrl: '' });
  const [files, setFiles] = useState({ zip: null, preview: null, images: [], video: null });
  const [activeTab, setActiveTab] = useState('stats'); // stats, upload, profile
  const [newReward, setNewReward] = useState(null);
  const [showRewardPopup, setShowRewardPopup] = useState(false);

  useEffect(() => {
    fetchStats();
    checkForNewRewards();
  }, []);

  const checkForNewRewards = async () => {
    try {
      const data = await api.checkMilestones(token);
      if (data.success && data.newRewards && data.newRewards.length > 0) {
        // Show popup for the first new reward
        setNewReward(data.newRewards[0]);
        setShowRewardPopup(true);
      }
    } catch (error) {
      console.error('Check rewards error:', error);
    }
  };

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
    setUploadProgress(0);
    setError('');

    const formData = new FormData();
    formData.append('name', form.name);
    formData.append('category', form.category);
    formData.append('tags', form.tags);
    formData.append('description', form.description);
    if (form.demoUrl) formData.append('demoUrl', form.demoUrl);
    formData.append('zipFile', files.zip);
    formData.append('previewImage', files.preview);
    // Add multiple images (max 5)
    files.images.forEach(img => formData.append('images', img));
    if (files.video) formData.append('previewVideo', files.video);

    try {
      const data = await api.uploadComponent(formData, token, (progress) => {
        setUploadProgress(progress);
      });
      if (data.success) {
        setUploadProgress(100);
        setForm({ name: '', category: 'Dashboard', tags: '', description: '', demoUrl: '' });
        setFiles({ zip: null, preview: null, images: [], video: null });
        setTimeout(() => setUploadProgress(0), 1000);
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

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getTotalFileSize = () => {
    let total = 0;
    if (files.zip) total += files.zip.size;
    if (files.preview) total += files.preview.size;
    if (files.images) files.images.forEach(img => total += img.size);
    if (files.video) total += files.video.size;
    return total;
  };

  const getMaxFileSize = () => {
    return 100; // 100MB in MB
  };

  const isFileSizeValid = () => {
    const totalBytes = getTotalFileSize();
    const maxBytes = getMaxFileSize() * 1024 * 1024;
    return totalBytes <= maxBytes;
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
    <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-auto border-2 border-blue-200 shadow-2xl" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b-2 border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-500/30">
              {user.displayName?.[0] || user.username[0]}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">{user.displayName || user.username}</h2>
              <p className="text-sm text-gray-600 font-medium">Level {user.level} Creator</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={onLogout} className="px-4 py-2 bg-red-50 hover:bg-red-100 rounded-lg text-sm flex items-center gap-2 text-red-600 font-medium border border-red-200 transition">
              <LogOut size={16} /> Logout
            </button>
            <button onClick={onClose} className="p-2 hover:bg-blue-100 rounded-lg transition">
              <X className="text-gray-600" size={24} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b-2 border-blue-100 bg-gray-50">
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
                className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 font-medium transition ${
                  activeTab === tab.id
                    ? 'border-b-2 border-blue-500 text-blue-600 bg-white'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-white/50'
                }`}
              >
                <Icon size={18} />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="p-5 bg-gradient-to-br from-gray-50 to-blue-50/30">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border-2 border-red-200 rounded-lg text-red-700 flex items-center gap-2 font-medium">
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
                    <div key={i} className="bg-white rounded-xl p-4 border-2 border-blue-100 shadow-sm hover:shadow-md transition">
                      <div className={`w-10 h-10 bg-gradient-to-r ${stat.color} rounded-lg flex items-center justify-center mb-2 shadow-lg`}>
                        <Icon className="text-white" size={20} />
                      </div>
                      <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                      <p className="text-sm text-gray-600 font-medium">{stat.label}</p>
                    </div>
                  );
                })}
              </div>

              {/* Milestone Progress */}
              <div className="bg-white rounded-xl p-5 border-2 border-blue-100 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <TrendingUp size={20} className="text-blue-600" /> Next Milestone
                  </h3>
                  <span className="text-blue-600 font-semibold">{stats.totalDownloads} / {getNextMilestone()}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-500 shadow-sm"
                    style={{ width: `${Math.min(getMilestoneProgress(), 100)}%` }}
                  />
                </div>
                <p className="text-sm text-gray-600 mt-2 font-medium">
                  {getNextMilestone() - stats.totalDownloads} more downloads to unlock rewards!
                </p>
              </div>

              {/* Badges */}
              {stats.badges && stats.badges.length > 0 && (
                <div className="bg-white rounded-xl p-5 border-2 border-blue-100 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <Award size={20} className="text-yellow-600" /> Your Badges
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {stats.badges.map((badge, i) => (
                      <div key={i} className="px-4 py-2 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border-2 border-yellow-200 flex items-center gap-2 shadow-sm">
                        <span className="text-2xl">{badgeIcons[badge.type] || '🏅'}</span>
                        <span className="text-gray-800 capitalize font-medium">{badge.type.replace('_', ' ')}</span>
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
                className="w-full px-4 py-3 bg-gray-50 border-2 border-blue-100 rounded-lg text-gray-800 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100 placeholder-gray-400"
              />

              <select
                value={form.category}
                onChange={e => setForm({...form, category: e.target.value})}
                className="w-full px-4 py-3 bg-gray-50 border-2 border-blue-100 rounded-lg text-gray-800 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100"
              >
                {categories.filter(c => c !== 'All').map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>

              <input
                type="text"
                placeholder="Tags (comma separated)"
                value={form.tags}
                onChange={e => setForm({...form, tags: e.target.value})}
                className="w-full px-4 py-3 bg-gray-50 border-2 border-blue-100 rounded-lg text-gray-800 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100 placeholder-gray-400"
              />

              <textarea
                placeholder="Description"
                value={form.description}
                onChange={e => setForm({...form, description: e.target.value})}
                rows={3}
                className="w-full px-4 py-3 bg-gray-50 border-2 border-blue-100 rounded-lg text-gray-800 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100 resize-none placeholder-gray-400"
              />

              <input
                type="url"
                placeholder="Demo URL (optional) - CodeSandbox, StackBlitz, or live demo"
                value={form.demoUrl || ''}
                onChange={e => setForm({...form, demoUrl: e.target.value})}
                className="w-full px-4 py-3 bg-gray-50 border-2 border-blue-100 rounded-lg text-gray-800 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100 placeholder-gray-400"
              />

              <div className="grid grid-cols-3 gap-3">
                <label className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition ${files.zip ? 'border-emerald-500 bg-emerald-500/10' : 'border-gray-600 hover:border-indigo-500'}`}>
                  <Upload className={`mx-auto mb-1 ${files.zip ? 'text-emerald-400' : 'text-gray-500'}`} size={24} />
                  <p className={`text-sm truncate ${files.zip ? 'text-emerald-400' : 'text-gray-400'}`}>
                    {files.zip?.name || 'Upload .zip *'}
                  </p>
                  {files.zip && (
                    <p className="text-xs text-emerald-300 mt-1">{formatFileSize(files.zip.size)}</p>
                  )}
                  <input type="file" accept=".zip" className="hidden" onChange={e => setFiles({...files, zip: e.target.files[0]})} />
                </label>
                <label className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition ${files.preview ? 'border-emerald-500 bg-emerald-500/10' : 'border-gray-600 hover:border-indigo-500'}`}>
                  <Upload className={`mx-auto mb-1 ${files.preview ? 'text-emerald-400' : 'text-gray-500'}`} size={24} />
                  <p className={`text-sm truncate ${files.preview ? 'text-emerald-400' : 'text-gray-400'}`}>
                    {files.preview?.name || 'Preview image *'}
                  </p>
                  {files.preview && (
                    <p className="text-xs text-emerald-300 mt-1">{formatFileSize(files.preview.size)}</p>
                  )}
                  <input type="file" accept="image/*" className="hidden" onChange={e => setFiles({...files, preview: e.target.files[0]})} />
                </label>
                <label className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition ${files.video ? 'border-indigo-500 bg-indigo-500/10' : 'border-gray-600 hover:border-indigo-500'}`}>
                  <Upload className={`mx-auto mb-1 ${files.video ? 'text-indigo-400' : 'text-gray-500'}`} size={24} />
                  <p className={`text-sm truncate ${files.video ? 'text-indigo-400' : 'text-gray-400'}`}>
                    {files.video?.name || 'Video (optional)'}
                  </p>
                  {files.video && (
                    <p className="text-xs text-indigo-300 mt-1">{formatFileSize(files.video.size)}</p>
                  )}
                  <input type="file" accept="video/*" className="hidden" onChange={e => setFiles({...files, video: e.target.files[0]})} />
                </label>
              </div>

              {/* Additional Images Section (Max 5) */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                  Additional Images (Max 5)
                  <span className="text-xs text-gray-500">Optional - Show multiple views of your component</span>
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {[...Array(5)].map((_, idx) => {
                    const hasImage = files.images[idx];
                    return (
                      <label 
                        key={idx}
                        className={`relative border-2 border-dashed rounded-lg p-3 text-center cursor-pointer transition aspect-square flex flex-col items-center justify-center ${
                          hasImage ? 'border-blue-500 bg-blue-500/10' : 'border-gray-600 hover:border-blue-500'
                        } ${files.images.length >= 5 && !hasImage ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {hasImage ? (
                          <>
                            <img src={URL.createObjectURL(hasImage)} alt={`Preview ${idx+1}`} className="w-full h-full object-cover rounded" />
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                const newImages = [...files.images];
                                newImages.splice(idx, 1);
                                setFiles({...files, images: newImages});
                              }}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition"
                            >
                              <X size={12} />
                            </button>
                          </>
                        ) : (
                          <>
                            <Plus className="text-gray-500" size={20} />
                            <p className="text-xs text-gray-500 mt-1">{idx + 1}</p>
                          </>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          disabled={files.images.length >= 5 && !hasImage}
                          onChange={e => {
                            if (e.target.files[0]) {
                              const newImages = [...files.images];
                              if (hasImage) {
                                newImages[idx] = e.target.files[0];
                              } else {
                                newImages.push(e.target.files[0]);
                              }
                              setFiles({...files, images: newImages});
                            }
                          }}
                        />
                      </label>
                    );
                  })}
                </div>
                {files.images.length > 0 && (
                  <p className="text-xs text-blue-400 flex items-center gap-1">
                    <Sparkles size={12} /> {files.images.length} image{files.images.length > 1 ? 's' : ''} added
                  </p>
                )}
              </div>

              {/* File Size Info */}
              {(files.zip || files.preview || files.video) && (
                <div className={`flex items-center justify-between p-3 rounded-lg border ${
                  isFileSizeValid() 
                    ? 'bg-gray-800 border-gray-700' 
                    : 'bg-red-500/10 border-red-500/30'
                }`}>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${isFileSizeValid() ? 'bg-emerald-400' : 'bg-red-400'}`} />
                    <span className={`text-sm font-medium ${isFileSizeValid() ? 'text-gray-300' : 'text-red-400'}`}>
                      Total Size: {formatFileSize(getTotalFileSize())}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500">
                    Max: {getMaxFileSize()} MB
                  </span>
                </div>
              )}

              {/* Upload Progress */}
              {loading && uploadProgress > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-indigo-400 font-medium">Uploading...</span>
                    <span className="text-white font-bold">{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-300 ease-out"
                      style={{ width: `${uploadProgress}%` }}
                    >
                      <div className="h-full w-full bg-white/20 animate-pulse" />
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={handleUpload}
                disabled={loading || !isFileSizeValid()}
                className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? <><RefreshCw size={18} className="animate-spin" /> Uploading {uploadProgress}%...</> : <><Plus size={18} /> Upload Component</>}
              </button>

              {/* Error Display */}
              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-start gap-3">
                  <AlertCircle className="text-red-400 flex-shrink-0 mt-0.5" size={18} />
                  <p className="text-red-300 text-sm">{error}</p>
                </div>
              )}

              {/* File Size Warning */}
              {!isFileSizeValid() && (files.zip || files.preview || files.video) && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-start gap-3">
                  <AlertCircle className="text-red-400 flex-shrink-0 mt-0.5" size={18} />
                  <div>
                    <p className="text-red-300 text-sm font-semibold">File size exceeds limit!</p>
                    <p className="text-red-300/80 text-xs mt-1">
                      Total size is {formatFileSize(getTotalFileSize())}. Maximum allowed is {getMaxFileSize()} MB.
                    </p>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-lg p-4">
                  <p className="text-indigo-300 text-sm">
                    💡 <strong>Tip:</strong> High-quality components with good previews and demo videos get more downloads! Videos are optional but highly recommended.
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
              <div className="bg-gradient-to-r from-blue-100 to-indigo-100 border-2 border-blue-200 rounded-xl p-5 shadow-sm">
                <h3 className="text-xl font-bold text-gray-800 mb-2 flex items-center gap-2">
                  <Gift size={24} className="text-blue-600" /> Reward System
                </h3>
                <p className="text-gray-700 font-medium">Earn rewards as your components reach download milestones!</p>
              </div>

              {/* Milestones */}
              <div className="space-y-3">
                {[
                  { milestone: 100, title: 'Rising Star 🌟', type: 'Badge', desc: 'Special badge & profile recognition', icon: '🏅', reached: stats.totalDownloads >= 100 },
                  { milestone: 500, title: 'Featured Creator ⭐', type: 'Premium T-Shirt', desc: 'Exclusive S3Learn branded t-shirt', icon: '👕', reached: stats.totalDownloads >= 500 },
                  { milestone: 1000, title: 'Master Creator 🏆', type: 'Certificate', desc: 'Digital certificate of excellence', icon: '📜', reached: stats.totalDownloads >= 1000 },
                  { milestone: 5000, title: 'Legend Status 👑', type: 'Gift Package', desc: 'Exclusive merchandise gift package', icon: '🎁', reached: stats.totalDownloads >= 5000 }
                ].map((reward, i) => (
                  <div
                    key={i}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      reward.reached
                        ? 'bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-400 shadow-lg shadow-emerald-500/20'
                        : 'bg-white border-blue-100 hover:border-blue-200 shadow-sm'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-3xl flex-shrink-0 shadow-md ${
                        reward.reached ? 'bg-gradient-to-br from-yellow-400 to-orange-500' : 'bg-gray-100'
                      }`}>
                        {reward.reached ? reward.icon : <Lock className="text-gray-400" size={24} />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className={`font-bold text-lg ${reward.reached ? 'text-emerald-600' : 'text-gray-800'}`}>
                              {reward.title}
                            </h4>
                            <p className={`text-sm font-medium ${reward.reached ? 'text-emerald-600' : 'text-blue-600'}`}>
                              🎁 Reward: {reward.type}
                            </p>
                            <p className="text-sm text-gray-600 mt-1">{reward.desc}</p>
                          </div>
                          {reward.reached && (
                            <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                              <span className="text-white text-xl">✓</span>
                            </div>
                          )}
                        </div>
                        <div className="mt-3 flex items-center gap-2">
                          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className={`h-full transition-all ${
                                reward.reached ? 'bg-gradient-to-r from-emerald-400 to-teal-500' : 'bg-blue-300'
                              }`}
                              style={{ width: reward.reached ? '100%' : `${Math.min((stats.totalDownloads / reward.milestone) * 100, 100)}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-600 font-medium whitespace-nowrap">
                            {stats.totalDownloads}/{reward.milestone}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Claimed Rewards Section */}
              {stats.claimedRewards && stats.claimedRewards.length > 0 && (
                <div className="bg-white rounded-xl p-6 border-2 border-yellow-300 shadow-lg">
                  <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Crown size={24} className="text-yellow-600" /> Your Claimed Rewards
                  </h3>
                  <div className="space-y-3">
                    {stats.claimedRewards.map((reward) => (
                      <div 
                        key={reward._id} 
                        className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border-2 border-blue-100 hover:border-blue-300 transition shadow-sm"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center flex-shrink-0 shadow-md">
                              {reward.type === 't-shirt' && <span className="text-2xl">👕</span>}
                              {reward.type === 'cap' && <span className="text-2xl">🧢</span>}
                              {reward.type === 'certificate' && <span className="text-2xl">📜</span>}
                              {reward.type === 'gift-package' && <span className="text-2xl">🎁</span>}
                              {reward.type === 'badge' && <span className="text-2xl">🏅</span>}
                            </div>
                            <div className="flex-1">
                              <h4 className="text-gray-800 font-semibold text-lg">{reward.title}</h4>
                              <p className="text-gray-600 text-sm mt-1 font-medium">
                                {reward.milestone} downloads milestone
                              </p>
                              {reward.shippingInfo && (
                                <div className="mt-2 text-xs text-gray-600">
                                  <p>📦 Shipping to: {reward.shippingInfo.city}, {reward.shippingInfo.country}</p>
                                  {reward.shippingInfo.size && (
                                    <p>📏 Size: {reward.shippingInfo.size}</p>
                                  )}
                                </div>
                              )}
                              {reward.trackingNumber && (
                                <p className="mt-2 text-xs text-blue-600 font-medium">
                                  🚚 Tracking: {reward.trackingNumber}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium shadow-sm ${
                              reward.status === 'delivered' ? 'bg-emerald-100 text-emerald-700 border border-emerald-300' :
                              reward.status === 'shipped' ? 'bg-blue-100 text-blue-700 border border-blue-300' :
                              reward.status === 'processing' ? 'bg-yellow-100 text-yellow-700 border border-yellow-300' :
                              reward.status === 'address-submitted' ? 'bg-purple-100 text-purple-700 border border-purple-300' :
                              'bg-gray-100 text-gray-700 border border-gray-300'
                            }`}>
                              {reward.status === 'delivered' && '✓ Delivered'}
                              {reward.status === 'shipped' && '🚚 Shipped'}
                              {reward.status === 'processing' && '⏳ Processing'}
                              {reward.status === 'address-submitted' && '📝 Submitted'}
                              {reward.status === 'pending' && '⏸️ Pending'}
                            </span>
                            {reward.deliveredAt && (
                              <span className="text-xs text-gray-600 font-medium">
                                {new Date(reward.deliveredAt).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg border-2 border-blue-200">
                    <p className="text-sm text-blue-700 flex items-center gap-2 font-medium">
                      <Gift size={16} />
                      Keep uploading quality components to unlock more rewards!
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      {showRewardPopup && newReward && (
        <RewardPopup
          reward={newReward}
          onClose={() => {
            setShowRewardPopup(false);
            setNewReward(null);
          }}
          onSubmit={async (addressData) => {
            try {
              const result = await api.submitShippingAddress(newReward._id, addressData, token);
              if (result.success) {
                alert('🎉 Shipping information submitted successfully! We will process your reward soon.');
                setShowRewardPopup(false);
                setNewReward(null);
                fetchStats(); // Refresh stats to show claimed rewards
              } else {
                alert(result.message || 'Failed to submit shipping information');
              }
            } catch (error) {
              console.error('Submit shipping error:', error);
              alert('An error occurred while submitting your information');
            }
          }}
        />
      )}
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

  const handleDownload = async (component) => {
    try {
      // Track the download first
      const result = await api.trackDownload(component._id, token);
      
      if (result.success) {
        if (result.alreadyDownloaded) {
          alert('You have already downloaded this component. Opening download link...');
        }
        
        // Open the S3 URL
        window.open(component.zipUrl, '_blank');
        
        // Refresh data to show updated download count
        fetchData();
      } else {
        alert('Failed to track download: ' + result.message);
      }
    } catch (error) {
      console.error('Download error:', error);
      alert('Download failed. Please try again.');
    }
  };

  const handleAuthSuccess = (userData, userToken) => {
    setUser(userData);
    setToken(userToken);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-indigo-50 text-gray-800">
      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200/40 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 -left-40 w-80 h-80 bg-sky-200/40 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}} />
        <div className="absolute -bottom-40 right-1/3 w-80 h-80 bg-indigo-200/40 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}} />
      </div>

      {/* Header */}
      <header className="relative border-b border-blue-200 bg-white/90 backdrop-blur-xl sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Layers className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">S3Learn</h1>
              <p className="text-xs text-gray-600">Create, Share, Earn</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {user ? (
              <button
                onClick={() => setShowDashboard(true)}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg text-sm font-medium flex items-center gap-2 text-white shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition"
              >
                <User size={16} />
                Dashboard
              </button>
            ) : (
              <button
                onClick={() => setShowAuth(true)}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg text-sm font-medium flex items-center gap-2 text-white shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition"
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
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 border border-blue-300 rounded-full mb-6 shadow-sm">
          <Sparkles className="text-blue-600" size={16} />
          <span className="text-blue-700 text-sm font-medium">Join Our Creator Community & Earn Rewards</span>
        </div>
        <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-800">
          Share Your React UI Components
          <span className="block mt-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-600 bg-clip-text text-transparent">
            Earn Recognition & Rewards
          </span>
        </h2>
        <p className="text-gray-600 mb-8 max-w-2xl mx-auto text-lg">
          Upload your components, track downloads, and unlock exclusive rewards at milestones.
          Get featured when you reach 500 downloads. Win prizes at 1000+!
        </p>
        <div className="relative max-w-xl mx-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search components..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white border-2 border-blue-200 rounded-2xl text-gray-800 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100 shadow-sm"
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
            <div key={i} className="text-center p-4 bg-white rounded-xl border-2 border-blue-100 shadow-sm hover:shadow-md transition">
              <p className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">{s.v}+</p>
              <p className="text-gray-600 text-sm font-medium">{s.l}</p>
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
                className={`px-4 py-2 rounded-lg text-sm font-medium transition shadow-sm ${
                  category === cat
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-blue-500/30'
                    : 'bg-white text-gray-700 hover:text-blue-600 hover:bg-blue-50 border border-blue-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="flex gap-1 bg-white border-2 border-blue-100 rounded-lg p-1 shadow-sm">
            <button onClick={() => setViewMode('grid')} className={`p-2 rounded transition ${viewMode === 'grid' ? 'bg-blue-500 shadow-sm' : 'hover:bg-blue-50'}`}>
              <Grid size={18} className={viewMode === 'grid' ? 'text-white' : 'text-gray-600'} />
            </button>
            <button onClick={() => setViewMode('list')} className={`p-2 rounded transition ${viewMode === 'list' ? 'bg-blue-500 shadow-sm' : 'hover:bg-blue-50'}`}>
              <List size={18} className={viewMode === 'list' ? 'text-white' : 'text-gray-600'} />
            </button>
          </div>
        </div>
      </section>

      {/* Components */}
      <section className="relative px-4 pb-20">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="text-center py-20">
              <RefreshCw className="mx-auto animate-spin text-blue-500" size={32} />
              <p className="text-gray-600 mt-4 font-medium">Loading amazing components...</p>
            </div>
          ) : components.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border-2 border-blue-100 shadow-sm">
              <Code className="mx-auto text-gray-400" size={48} />
              <p className="text-gray-600 mt-4 font-medium">No components found</p>
            </div>
          ) : (
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
              {components.map((comp, idx) => (
                <div key={comp._id} className={`group bg-white rounded-2xl border-2 border-blue-100 overflow-hidden hover:border-blue-300 transition-all hover:shadow-xl hover:shadow-blue-500/20 ${viewMode === 'list' ? 'flex' : ''}`}>
                  <div className={`relative overflow-hidden ${viewMode === 'list' ? 'w-48 flex-shrink-0' : 'aspect-video'}`}>
                    <div className={`absolute inset-0 bg-gradient-to-br ${gradients[idx % gradients.length]} opacity-20`} />
                    {comp.previewImage ? (
                      <img src={comp.previewUrl} alt={comp.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
                        <Layers className="text-blue-300" size={48} />
                      </div>
                    )}
                    {comp.previewVideo && (
                      <div className="absolute top-3 left-3 px-2 py-1 bg-blue-500 rounded-full flex items-center gap-1 shadow-lg">
                        <Zap className="text-white" size={12} />
                        <span className="text-xs text-white font-medium">Video</span>
                      </div>
                    )}
                    <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 bg-white/90 backdrop-blur rounded-full shadow-sm">
                      <Star className="text-yellow-500 fill-yellow-500" size={12} />
                      <span className="text-xs text-gray-700 font-medium">{comp.stars}</span>
                    </div>
                  </div>
                  <div className="p-5 flex-1">
                    <div className="flex justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-800 group-hover:text-blue-600 transition">{comp.name}</h3>
                        <p className="text-sm text-gray-600 font-medium">{comp.category}</p>
                        {comp.creator && (
                          <p className="text-xs text-blue-600 mt-1">
                            by {comp.creator.displayName || comp.creatorName}
                            {comp.creator.level > 5 && <span className="ml-1">👑</span>}
                          </p>
                        )}
                      </div>
                      <span className="text-xs text-gray-500 flex items-center gap-1 font-medium">
                        <Download size={12} />{comp.downloads}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1 mb-4">
                      {comp.tags?.slice(0, 3).map(t => <span key={t} className="px-2 py-0.5 bg-blue-50 border border-blue-200 rounded text-xs text-blue-700 font-medium">#{t}</span>)}
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => setPreview(comp)} className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition text-gray-700 border border-gray-200">
                        <Eye size={16} /> Preview
                      </button>
                      <button onClick={() => handleDownload(comp)} className="flex-1 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg text-sm font-medium flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-blue-500/30 transition text-white shadow-md shadow-blue-500/20">
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
