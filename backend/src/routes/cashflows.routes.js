import { Router } from 'express'
import { list,createCashflow,updateCashflow,removeCashflow,calendar, upcoming, importCashflows, monthly } from '../controllers/cashflows.controller.js'
import multer from 'multer';


const r=Router(); 
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });



r.get('/',list); 
r.get('/calendar',calendar); 
r.get('/upcoming', upcoming);
r.get('/monthly', monthly);    

r.post('/',createCashflow);
r.put('/:id',updateCashflow); 
r.delete('/:id',removeCashflow);
r.post('/import', upload.single('file'), importCashflows);


export default r