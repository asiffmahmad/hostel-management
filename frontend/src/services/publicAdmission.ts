import axios from '@/services/api';

/**
 * Service for public admission endpoints (no authentication required).
 */
export const getHostels = () => axios.get('/public/hostels');
export const getRooms = (hostelId: number) => axios.get(`/public/hostels/${hostelId}/rooms`);
export const getVacantBeds = (roomId: number) => axios.get(`/public/rooms/${roomId}/beds`);
export const submitRequest = (data: any) => axios.post('/public/admission/requests', data);
