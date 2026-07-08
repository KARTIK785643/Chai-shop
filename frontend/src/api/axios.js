import axios from 'axios';

let baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

if (baseURL) {
  const cleanedUrl = baseURL.trim().replace(/\/+$/, '');
  if (!cleanedUrl.endsWith('/api')) {
    baseURL = `${cleanedUrl}/api`;
  } else {
    baseURL = cleanedUrl;
  }
}

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});


api.interceptors.request.use(
  (config) => {
    const user = JSON.parse(localStorage.getItem('chaispot_user'));
    if (user && user.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
