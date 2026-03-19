import { api } from '@/lib/api.js';

export const getTotals = (params = {}) =>
  api.get('/reports/totals', { params }).then(r => r.data);

export const getOverdue = (params = {}) =>
  api.get('/reports/overdue', { params }).then(r => r.data);

export const getPendingOverdueByCounterparty = (params = {}) =>
  api.get('/reports/pending-overdue-by-counterparty', { params }).then(r => r.data);

export const getPendingPerAccountMonth = (params = {}) =>
  api.get('/reports/pending-per-account-month', { params }).then(r => r.data);
