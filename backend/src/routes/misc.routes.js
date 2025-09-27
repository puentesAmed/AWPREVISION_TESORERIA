import { Router } from 'express'
import { auth } from '../middleware/auth.js'
import { forecast } from '../controllers/forecast.controller.js'
const r = Router()
r.use(auth)
r.get('/forecast', forecast)
// r.get('/kpis', kpisController)
// r.post('/import/bank-tx', uploadCsv, importController)
export default r
