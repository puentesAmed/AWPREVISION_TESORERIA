import { createServer } from 'http'
import app from './app.js'
import { connectMongo } from './config/mongo.js'
import env from './config/env.js'
import reportsRoutes from './routes/reports.routes.js';
import Cashflow from './models/Cashflow.js'   // <-- importa el modelo

/*await connectMongo(env.MONGO_URI)
await Cashflow.syncIndexes()                 // <-- crea/actualiza índice unique+sparse

app.use('/api/reports', reportsRoutes);


createServer(app).listen(env.PORT, () => console.log(`API ${env.PORT}`))
*/

try {
  await connectMongo(env.MONGO_URI)
  await Cashflow.syncIndexes() // externalId unique+sparse

  app.use('/api/reports', reportsRoutes)

  createServer(app).listen(env.PORT, () => {
    console.log(`API ${env.PORT}`)
  })
} catch (err) {
  console.error('Fallo de arranque:', err)
  process.exit(1)
}