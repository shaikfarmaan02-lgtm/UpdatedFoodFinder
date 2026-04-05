import axios from 'axios';

// Production backend URL
const API_BASE_URL = 'https://foodfinder-backend-pbsi.onrender.com/api';

// Role enum mapping from frontend to backend
export const ROLE_ENUM = {
  DONOR: "DONOR",
  NGO: "NGO",
  ADMIN: "ADMIN",
};

// Map frontend role values to backend enum
export const mapRoleToEnum = (role) => {
  const roleMap = {
    giver: ROLE_ENUM.DONOR,
    organization: ROLE_ENUM.NGO,
    finder: ROLE_ENUM.DONOR,
    admin: ROLE_ENUM.ADMIN,
    analyst: ROLE_ENUM.ADMIN,
    donor: ROLE_ENUM.DONOR,
    ngo: ROLE_ENUM.NGO,
  };
  return roleMap[role?.toLowerCase()] || role?.toUpperCase();
};

// Create axios instance with base URL
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests if it exists
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// API endpoints
export const API_ENDPOINTS = {
  // User endpoints
  USERS: '/users',
  REGISTER: '/users/register',
  LOGIN: '/users/login',
  PROFILE: '/users/profile',
  UPDATE_PROFILE: '/users/profile',
  
  // Food endpoints
  FOODS: '/foods',
  GET_FOOD: (id) => `/foods/${id}`,
  ADD_FOOD: '/foods',
  UPDATE_FOOD: (id) => `/foods/${id}`,
  DELETE_FOOD: (id) => `/foods/${id}`,
  
  // Request endpoints
  REQUESTS: '/requests',
  CREATE_REQUEST: '/requests',
  APPROVE_REQUEST: (id) => `/requests/${id}/approve`,
  REJECT_REQUEST: (id) => `/requests/${id}/reject`,
  
  // Admin endpoints
  PENDING_USERS: '/admin/users/pending',
  APPROVE_USER: (id) => `/admin/users/${id}/approve`,
  REJECT_USER: (id) => `/admin/users/${id}/reject`,
  DELETE_USER: (id) => `/admin/users/${id}`,
  USERS_LIST: '/admin/users',
  
  // Analytics endpoints
  ANALYTICS: '/analytics',
  DONATIONS_STATS: '/analytics/donations',
  DISTRIBUTION_STATS: '/analytics/distributions',
};

// API methods
export const userAPI = {
  register: (userData) => apiClient.post(API_ENDPOINTS.REGISTER, userData),
  login: (credentials) => apiClient.post(API_ENDPOINTS.LOGIN, credentials),
  getProfile: () => apiClient.get(API_ENDPOINTS.PROFILE),
  updateProfile: (userData) => apiClient.put(API_ENDPOINTS.UPDATE_PROFILE, userData),
  getAll: () => apiClient.get(API_ENDPOINTS.USERS),
};

export const foodAPI = {
  getAll: () => apiClient.get(API_ENDPOINTS.FOODS),
  getById: (id) => apiClient.get(API_ENDPOINTS.GET_FOOD(id)),
  create: (foodData) => apiClient.post(API_ENDPOINTS.ADD_FOOD, foodData),
  update: (id, foodData) => apiClient.put(API_ENDPOINTS.UPDATE_FOOD(id), foodData),
  delete: (id) => apiClient.delete(API_ENDPOINTS.DELETE_FOOD(id)),
};

export const requestAPI = {
  getAll: () => apiClient.get(API_ENDPOINTS.REQUESTS),
  create: (requestData) => apiClient.post(API_ENDPOINTS.CREATE_REQUEST, requestData),
  approve: (id) => apiClient.post(API_ENDPOINTS.APPROVE_REQUEST(id)),
  reject: (id) => apiClient.post(API_ENDPOINTS.REJECT_REQUEST(id)),
};

export const adminAPI = {
  getPendingUsers: () => apiClient.get(API_ENDPOINTS.PENDING_USERS),
  approveUser: (id) => apiClient.post(API_ENDPOINTS.APPROVE_USER(id)),
  rejectUser: (id) => apiClient.post(API_ENDPOINTS.REJECT_USER(id)),
  deleteUser: (id) => apiClient.delete(API_ENDPOINTS.DELETE_USER(id)),
  getAllUsers: () => apiClient.get(API_ENDPOINTS.USERS_LIST),
};

export const analyticsAPI = {
  getDonationsStats: () => apiClient.get(API_ENDPOINTS.DONATIONS_STATS),
  getDistributionStats: () => apiClient.get(API_ENDPOINTS.DISTRIBUTION_STATS),
  getAnalytics: () => apiClient.get(API_ENDPOINTS.ANALYTICS),
};

export default apiClient;
