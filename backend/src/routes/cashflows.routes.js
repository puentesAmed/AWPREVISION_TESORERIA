import { Router } from 'express'
import { auth, roles } from '../middleware/auth.js'
import { list, create, update, remove, postNow } from '../controllers/cashflows.controller.js'
const r = Router()
r.use(auth)
r.get('/', list)
r.post('/', roles('admin','fin'), create)
r.patch('/:id', roles('admin','fin'), update)
r.delete('/:id', roles('admin'), remove)
r.post('/:id/post', roles('admin','fin'), postNow)
export default r
