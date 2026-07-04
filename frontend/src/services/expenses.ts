import api from './api';
import type { Expense } from '@/types';

export const getExpenses = (hostelId?: number) => {
  if (!hostelId) {
    return api.get('/expenses');
  }
  return api.get(`/expenses/hostel/${hostelId}`);
};

export const getExpense = (id: number) => {
  return api.get(`/expenses/${id}`);
};

export const createExpense = (data: Expense) => {
  return api.post('/expenses', data);
};

export const updateExpense = (id: number, data: Expense) => {
  return api.put(`/expenses/${id}`, data);
};

export const deleteExpense = (id: number) => {
  return api.delete(`/expenses/${id}`);
};
