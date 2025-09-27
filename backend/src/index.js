import { createServer } from 'http'
import app from './app.js'
import { connectMongo } from './config/mongo.js'
import env from './config/env.js'

await connectMongo(env.MONGO_URI)
createServer(app).listen(env.PORT, () => console.log(`API ${env.PORT}`))
