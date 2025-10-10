import { createServer } from 'http'
import app from './app.js'
import { connectMongo } from './config/mongo.js'
import env from './config/env.js'
import reportsRoutes from './routes/reports.routes.js';


await connectMongo(env.MONGO_URI)

app.use('/api/reports', reportsRoutes);


createServer(app).listen(env.PORT, () => console.log(`API ${env.PORT}`))
