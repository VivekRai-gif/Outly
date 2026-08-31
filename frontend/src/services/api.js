import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const checkHealth = async () => {
  try {
    const response = await api.get('/health');
    return response.data;
  } catch (error) {
    console.error('API Health Check Error:', error);
    throw error;
  }
};

/* ==================== DASHBOARD APIS ==================== */

export const getDashboardStats = async () => {
  const response = await api.get('/dashboard/stats');
  return response.data;
};

/* ==================== TEMPLATES APIS ==================== */

export const getTemplates = async (params = {}) => {
  const response = await api.get('/templates', { params });
  return response.data;
};

export const getTemplateById = async (id) => {
  const response = await api.get(`/templates/${id}`);
  return response.data;
};

export const createTemplate = async (templateData) => {
  const response = await api.post('/templates', templateData);
  return response.data;
};

export const duplicateTemplate = async (id) => {
  const response = await api.post(`/templates/${id}/duplicate`);
  return response.data;
};

export const deleteTemplate = async (id) => {
  const response = await api.delete(`/templates/${id}`);
  return response.data;
};

/* ==================== CONTACT APIS ==================== */

export const uploadPdf = async (file, onUploadProgress) => {
  const formData = new FormData();
  formData.append('pdf', file);

  const response = await api.post('/contacts/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      if (onUploadProgress && progressEvent.total) {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onUploadProgress(percentCompleted);
      }
    },
  });

  return response.data;
};

export const bulkSaveContacts = async (contacts) => {
  const response = await api.post('/contacts/bulk', { contacts });
  return response.data;
};

export const createContact = async (contactData) => {
  const response = await api.post('/contacts', contactData);
  return response.data;
};

export const checkReplies = async () => {
  const response = await api.post('/contacts/check-replies');
  return response.data;
};

export const getContacts = async (params = {}) => {
  const response = await api.get('/contacts', { params });
  return response.data;
};

export const getContactById = async (id) => {
  const response = await api.get(`/contacts/${id}`);
  return response.data;
};

export const getContactActivity = async (id) => {
  const response = await api.get(`/contacts/${id}/activity`);
  return response.data;
};

export const updateContact = async (id, data) => {
  const response = await api.put(`/contacts/${id}`, data);
  return response.data;
};

export const deleteContact = async (id) => {
  const response = await api.delete(`/contacts/${id}`);
  return response.data;
};

/* ==================== CAMPAIGN APIS ==================== */

export const createCampaign = async (campaignData) => {
  const response = await api.post('/campaigns', campaignData);
  return response.data;
};

export const getCampaigns = async (params = {}) => {
  const response = await api.get('/campaigns', { params });
  return response.data;
};

export const getCampaignById = async (id) => {
  const response = await api.get(`/campaigns/${id}`);
  return response.data;
};

export const getCampaignAnalytics = async (id) => {
  const response = await api.get(`/campaigns/${id}/analytics`);
  return response.data;
};

export const updateCampaign = async (id, campaignData) => {
  const response = await api.put(`/campaigns/${id}`, campaignData);
  return response.data;
};

export const deleteCampaign = async (id) => {
  const response = await api.delete(`/campaigns/${id}`);
  return response.data;
};

export const sendCampaign = async (id) => {
  const response = await api.post(`/campaigns/${id}/send`);
  return response.data;
};

export const pauseCampaign = async (id) => {
  const response = await api.post(`/campaigns/${id}/pause`);
  return response.data;
};

export const resumeCampaign = async (id) => {
  const response = await api.post(`/campaigns/${id}/resume`);
  return response.data;
};

/* ==================== AUTHENTICATION APIS ==================== */

export const loginUser = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  return response.data;
};

export const registerUser = async (userData) => {
  const response = await api.post('/auth/register', userData);
  return response.data;
};

export const logoutUser = async () => {
  const response = await api.post('/auth/logout');
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

/* ==================== GMAIL OAUTH & EMAIL DISPATCH APIS ==================== */

export const getGoogleAuthStatus = async () => {
  const response = await api.get('/auth/google/status');
  return response.data;
};

export const getGoogleAuthUrl = async () => {
  const response = await api.get('/auth/google');
  return response.data;
};

export const disconnectGoogleAuth = async () => {
  const response = await api.post('/auth/google/disconnect');
  return response.data;
};

export const sendTestEmail = async (testData) => {
  const response = await api.post('/emails/test', testData);
  return response.data;
};

export default api;

