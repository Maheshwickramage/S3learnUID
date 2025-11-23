const API = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

export const api = {
  // Auth
  async register(userData) {
    const res = await fetch(`${API}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    return res.json();
  },
  async login(email, password) {
    const res = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return res.json();
  },
  async getProfile(token) {
    const res = await fetch(`${API}/auth/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return res.json();
  },
  async getStats(token) {
    const res = await fetch(`${API}/auth/stats`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return res.json();
  },
  async updateProfile(token, data) {
    const res = await fetch(`${API}/auth/profile`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  async getCreator(username) {
    const res = await fetch(`${API}/auth/creator/${username}`);
    return res.json();
  },
  
  // Components
  async getComponents(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API}/components?${query}`);
    return res.json();
  },
  async getComponentStats() {
    const res = await fetch(`${API}/components/meta/stats`);
    return res.json();
  },
  downloadComponent(id) {
    window.open(`${API}/components/download/${id}`, '_blank');
  },
  getPreviewUrl: (img) => `${API.replace('/api', '')}/uploads/previews/${img}`,
  
  // Creator actions (requires auth)
  async verifyAdminKey(adminKey) {
    const res = await fetch(`${API}/admin/verify`, {
      method: 'GET',
      headers: { 'x-admin-key': adminKey }
    });
    return res.json();
  },
  async uploadComponent(formData, token) {
    const res = await fetch(`${API}/admin/upload`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    });
    return res.json();
  },
  async deleteComponent(id, token) {
    const res = await fetch(`${API}/admin/components/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return res.json();
  }
};
