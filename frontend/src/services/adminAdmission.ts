import axios from '@/services/api';

/** Service functions for admin admission management */
export const getPending = (hostelCode?: string) =>
  hostelCode ? axios.get(`/admin/admissions/pending?hostelCode=${hostelCode}`)
    : axios.get('/admin/admissions/pending');
export const approve = (id: number) => axios.post(`/admin/admissions/${id}/approve`);
export const reject = (id: number, reason: string) => axios.post(`/admin/admissions/${id}/reject`, { reason });
