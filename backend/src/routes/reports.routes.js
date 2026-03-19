import { Router } from "express";
import { totals } from "../controllers/reports.controller.js";
import { overdue, pendingOverdueByCounterparty, pendingPerAccountMonth } from '../controllers/reports.controller.js';

const r = Router();
r.get("/totals", totals);
r.get('/overdue', overdue);
r.get('/pending-overdue-by-counterparty', pendingOverdueByCounterparty);
r.get('/pending-per-account-month', pendingPerAccountMonth);
export default r;
