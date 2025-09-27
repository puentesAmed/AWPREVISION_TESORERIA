import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'
import env from './config/env.js'
import authRoutes from './routes/auth.routes.js'
import accountRoutes from './routes/accounts.routes.js'
import cashflowRoutes from './routes/cashflows.routes.js'
import miscRoutes from './routes/misc.routes.js'

const app = express()
app.use(helmet())
app.use(cors({ origin: env.CORS_ORIGIN }))
app.use(express.json({ limit: '1mb' }))
app.use(morgan('dev'))
app.use(rateLimit({ windowMs: 60_000, max: 120 }))

app.use('/api/auth', authRoutes)
app.use('/api/accounts', accountRoutes)
app.use('/api/cashflows', cashflowRoutes)
app.use('/api', miscRoutes)

app.get('/health', (_,res)=> res.json({ ok:true }))
export default app
