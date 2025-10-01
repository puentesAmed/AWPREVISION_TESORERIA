import { Router } from "express";
import { totals } from "../controllers/reports.controller.js";

const r = Router();
r.get("/totals", totals);
export default r;