/*import { api } from "../lib/api";

export   const getTotals = async ({ from, to, account, groupBy='date', granularity='day'}) => {
    const res = await api.get("/reports/totals", { params: { from, to, account, groupBy, granularity } })
    return res.data
}


// NUEVOS:
export const getOverdueReport = (params = {}) =>
  api.get('/cashflows/reports/overdue', { params }).then(r => r.data);

export const getPendingTotalsByAccountMonth = (params = {}) =>
  api.get('/cashflows/reports/pending-totals-by-account-month', { params }).then(r => r.data);*/

import { api } from '@/lib/api.js';

export const getTotals = (params = {}) =>
  api.get('/reports/totals', { params }).then(r => r.data);

export const getOverdue = (params = {}) =>
  api.get('/reports/overdue', { params }).then(r => r.data);

export const getPendingPerAccountMonth = (params = {}) =>
  api.get('/reports/pending-per-account-month', { params }).then(r => r.data);
