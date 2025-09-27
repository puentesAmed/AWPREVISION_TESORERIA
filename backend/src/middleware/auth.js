import jwt from 'jsonwebtoken'
import env from '../config/env.js'

export function auth(req,res,next){
  const h = req.headers.authorization || ''
  const token = h.startsWith('Bearer ') ? h.slice(7) : null
  if(!token) return res.status(401).json({ error:'unauthorized' })
  try{ req.user = jwt.verify(token, env.JWT_SECRET); next() }
  catch{ res.status(401).json({ error:'invalid_token' }) }
}
export const roles = (...allowed)=> (req,res,next)=>{
  if(!req.user || !allowed.includes(req.user.role)) return res.status(403).json({ error:'forbidden' })
  next()
}
