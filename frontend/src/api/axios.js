import axios from 'axios';

const API = axios.create({ baseURL: '/api' });

// Attach JWT token to every request if available
API.interceptors.request.use((config) => {
  const userInfo = localStorage.getItem('userInfo');
  if (userInfo) {
    try {
      const { token } = JSON.parse(userInfo);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (err) {
      console.error('Error parsing userInfo from localStorage:', err);
    }
  }
  return config;
});

// Handle global responses, especially 401 Unauthorized
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If it's a 401, the token is likely invalid or expired
      console.warn('Unauthorized request (401). Redirecting to login...');
      localStorage.removeItem('userInfo');
      // Use window.location to ensure a full refresh and redirect
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default API;
