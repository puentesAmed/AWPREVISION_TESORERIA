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
import scenariosRoutes from './routes/scenarios.routes.js'
import reportsRoutes from './routes/reports.routes.js'
import counterpartiesRoutes from './routes/counterparties.routes.js'
import categoriesRoutes from './routes/categories.routes.js'

const ORIGINS = env.CORS_ORIGINS

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || ORIGINS.includes(origin)) return cb(null, true)
    return cb(new Error('Not allowed by CORS'))
  },
  credentials: true,
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization']
}))

const app = express()
app.use(helmet())
/*app.use(cors({ 
    origin: env.CORS_ORIGIN, 
    credentials: true,
    methods: ["GET","POST","PUT", "PATCH","DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
}))*/

app.options('*', cors())
app.use(express.json({ limit: '1mb' }))
app.use(morgan('dev'))
app.use(rateLimit({ windowMs: 60_000, max: 120 }))

app.use('/api/auth', authRoutes)
app.use('/api/accounts', accountRoutes)
app.use('/api/counterparties', counterpartiesRoutes)

app.use('/api/cashflows', cashflowRoutes)
app.use('/api/reports', reportsRoutes)
app.use('/api/scenarios', scenariosRoutes)
app.use('/api', miscRoutes)
app.use('/api/categories', categoriesRoutes)

app.get('/health', (_,res)=> res.json({ ok:true }))
export default app
