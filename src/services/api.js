import { auth } from '../firebase/firebase';

class ApiService {
  constructor() {
    this.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';
  }

  async request(endpoint, options = {}) {
    try {
      // Get Firebase ID token
      const token = await auth.currentUser?.getIdToken();
      
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  }

  // Authentication methods
  async validateToken(idToken) {
    return this.request('/auth/validate-token', {
      method: 'POST',
      body: JSON.stringify({ idToken })
    });
  }

  async getCurrentUser() {
    return this.request('/auth/me');
  }

  // Campaign methods
  async getCampaigns(params = {}) {
    const query = new URLSearchParams(params);
    return this.request(`/campaigns?${query}`);
  }

  async getCampaign(id) {
    return this.request(`/campaigns/${id}`);
  }

  async createCampaign(data) {
    return this.request('/campaigns', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async updateCampaign(id, data) {
    return this.request(`/campaigns/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async deleteCampaign(id) {
    return this.request(`/campaigns/${id}`, {
      method: 'DELETE'
    });
  }

  async getCampaignAnalytics(id) {
    return this.request(`/campaigns/${id}/analytics`);
  }

  // User methods
  async getUsers(params = {}) {
    const query = new URLSearchParams(params);
    return this.request(`/users?${query}`);
  }

  async getUser(id) {
    return this.request(`/users/${id}`);
  }

  async updateUser(id, data) {
    return this.request(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async getUserStats(id) {
    return this.request(`/users/${id}/stats`);
  }

  // Donation methods
  async getDonations(params = {}) {
    const query = new URLSearchParams(params);
    return this.request(`/donations?${query}`);
  }

  async getCampaignDonations(serviceCode, params = {}) {
    const query = new URLSearchParams(params);
    return this.request(`/donations/campaign/${serviceCode}?${query}`);
  }

  async getFundraiserDonations(referalCode, params = {}) {
    const query = new URLSearchParams(params);
    return this.request(`/donations/fundraiser/${referalCode}?${query}`);
  }

  // Analytics methods
  async getDashboardAnalytics() {
    return this.request('/analytics/dashboard');
  }

  async getAllCampaignsAnalytics() {
    return this.request('/analytics/campaigns');
  }

  async getFundraiserAnalytics(params = {}) {
    const query = new URLSearchParams(params);
    return this.request(`/analytics/fundraisers?${query}`);
  }
}

// Create singleton instance
const apiService = new ApiService();

export default apiService; 