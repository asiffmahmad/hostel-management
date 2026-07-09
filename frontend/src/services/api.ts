import axios from 'axios';
import nprogress from 'nprogress';
import 'nprogress/nprogress.css';
import { encryptPayload, decryptPayload } from '@/utils/crypto';

nprogress.configure({ showSpinner: false, speed: 400 });

let activeRequests = 0;

const getBaseUrl = () => {
  let url = import.meta.env.VITE_API_URL || 'http://localhost:8080';
  url = url.replace(/\/+$/, '');
  return url.endsWith('/api') ? url : `${url}/api`;
};

const api = axios.create({
  baseURL: getBaseUrl(),
  withCredentials: true, // Always send the HttpOnly auth_token cookie with every request
});

api.interceptors.request.use(
  (config) => {
    activeRequests++;
    if (activeRequests === 1) nprogress.start();
    
    // Encrypt payload if data exists and it's a JSON request (or default content-type)
    // Avoid encrypting FormData (file uploads)
    if (config.data && !(config.data instanceof FormData)) {
      try {
        const encrypted = encryptPayload(config.data);
        config.data = { payload: encrypted };
        // Ensure content-type is json
        if (!config.headers['Content-Type']) {
          config.headers['Content-Type'] = 'application/json';
        }
      } catch (e) {
        console.error('Payload encryption failed:', e);
      }
    }
    
    return config;
  },
  (error) => {
    activeRequests--;
    if (activeRequests === 0) nprogress.done();
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    activeRequests--;
    if (activeRequests === 0) nprogress.done();
    
    // Decrypt payload if response contains { payload: "..." }
    if (response.data && response.data.payload) {
      try {
        response.data = decryptPayload(response.data.payload);
      } catch (e) {
        console.error('Payload decryption failed:', e);
      }
    }
    
    return response;
  },
  (error) => {
    activeRequests--;
    if (activeRequests === 0) nprogress.done();
    
    // Also decrypt error payloads if they exist
    if (error.response?.data?.payload) {
      try {
        error.response.data = decryptPayload(error.response.data.payload);
      } catch (e) {
        console.error('Error payload decryption failed:', e);
      }
    }

    if (error.response?.status === 401) {
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
