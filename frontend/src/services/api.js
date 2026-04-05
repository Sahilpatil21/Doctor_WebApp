import axios from 'axios';

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD ? '/api' : 'http://localhost:5000/api');

const STORAGE_KEYS = {
  token: 'token',
  user: 'user',
};

const readStorage = (key) => {
  try {
    return window.localStorage.getItem(key);
  } catch (error) {
    console.error(`Unable to read ${key} from storage:`, error);
    return null;
  }
};

const clearStoredAuth = () => {
  try {
    window.localStorage.removeItem(STORAGE_KEYS.token);
    window.localStorage.removeItem(STORAGE_KEYS.user);
  } catch (error) {
    console.error('Unable to clear auth storage:', error);
  }
};

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = readStorage(STORAGE_KEYS.token);

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    // Only unwrap the data for auth endpoints (login, register, profile)
    // Other endpoints return the full response with success/status
    const url = response.config.url || '';
    if (url.includes('/auth/login') || url.includes('/auth/register') || url.includes('/auth/profile')) {
      return response.data?.data || response.data;
    }
    // For all other endpoints, return the full response
    return response.data;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      clearStoredAuth();
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    return Promise.reject(
      error.response?.data || { message: error.message || 'Request failed' }
    );
  }
);

// Auth API
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getProfile: () => api.get('/auth/profile'),
};

// Doctor API
export const doctorAPI = {
  getAll: (params = { available: true }) => api.get('/doctors', { params }),
  getById: (id) => api.get(`/doctors/${id}`),
  updateProfile: (data) => api.put('/doctors/profile', data),
  updateAvailability: (data) => api.put('/doctors/availability', data),
  getTodayAppointments: () => api.get('/doctors/appointments/today'),
  getPatientHistory: () => api.get('/doctors/patient-history'),
};

// Appointment API
export const appointmentAPI = {
  create: (data) => api.post('/appointments', data),
  getAll: (params) => api.get('/appointments', { params }),
  updateStatus: (id, data) => api.put(`/appointments/${id}/status`, data),
  cancel: (id, data) => api.delete(`/appointments/${id}`, { data }),
  getQueue: (doctorId, date) => api.get(`/appointments/queue/${doctorId}/${date}`),
  getMyAppointments: () => api.get('/appointments/my'),
};

export default api;
