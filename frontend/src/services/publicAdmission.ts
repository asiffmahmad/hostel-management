import axios from 'axios';

const getBaseUrl = () => {
  let url = import.meta.env.VITE_API_URL || 'http://localhost:8080';
  url = url.replace(/\/+$/, ''); // Remove trailing slashes
  return url.endsWith('/api') ? url : `${url}/api`;
};

// Create a raw axios instance for public APIs (no auth headers, no 401 redirects)
const publicApi = axios.create({
  baseURL: getBaseUrl(),
});

/**
 * Service for public admission endpoints (no authentication required).
 */
export const getHostels = () => publicApi.get('/public/hostels');
export const getRooms = (hostelId: number) => publicApi.get(`/public/hostels/${hostelId}/rooms`);
export const getVacantBeds = (roomId: number) => publicApi.get(`/public/rooms/${roomId}/beds`);
export const submitRequest = (data: any) => publicApi.post('/public/admission/requests', data);
