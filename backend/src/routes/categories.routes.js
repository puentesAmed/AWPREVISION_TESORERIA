import { Router } from 'express';
import { list, create, update, remove } from '../controllers/categories.controller.js';

const r = Router();
r.get('/', list);
r.post('/', create);
r.put('/:id', update);
r.delete('/:id', remove);
export default r;