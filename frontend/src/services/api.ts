import axios from 'axios';
import nprogress from 'nprogress';
import 'nprogress/nprogress.css';

nprogress.configure({ showSpinner: false, speed: 400 });

let activeRequests = 0;

const getBaseUrl = () => {
  let url = import.meta.env.VITE_API_URL || 'http://localhost:8080';
  url = url.replace(/\/+$/, ''); // Remove trailing slashes
  return url.endsWith('/api') ? url : `${url}/api`;
};

const api = axios.create({
  baseURL: getBaseUrl(),
});

api.interceptors.request.use((config) => {
  activeRequests++;
  if (activeRequests === 1) {
    nprogress.start();
  }
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  activeRequests--;
  if (activeRequests === 0) {
    nprogress.done();
  }
  return Promise.reject(error);
});

api.interceptors.response.use(
  (response) => {
    activeRequests--;
    if (activeRequests === 0) {
      nprogress.done();
    }
    return response;
  },
  (error) => {
    activeRequests--;
    if (activeRequests === 0) {
      nprogress.done();
    }
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
