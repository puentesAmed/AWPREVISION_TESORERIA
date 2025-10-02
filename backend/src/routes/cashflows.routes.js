/*import { Router } from 'express'
import { roles } from '../middleware/auth.js'
import { list, create, update, remove, postNow } from '../controllers/cashflows.controller.js'
const r = Router()

r.get('/', list)
r.post('/', roles('admin','fin'), create)
r.patch('/:id', roles('admin','fin'), update)
r.delete('/:id', roles('admin'), remove)
r.post('/:id/post', roles('admin','fin'), postNow)
export default r
*/

import { Router } from 'express'
import { list,createCashflow,updateCashflow,removeCashflow,calendar, upcoming, importCashflows } from '../controllers/cashflows.controller.js'
import multer from 'multer';


const r=Router(); 
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });



r.get('/',list); 
r.get('/calendar',calendar); 
r.get('/upcoming', upcoming);
r.post('/',createCashflow);
r.put('/:id',updateCashflow); 
r.delete('/:id',removeCashflow);
r.post('/import', upload.single('file'), importCashflows);


export default r