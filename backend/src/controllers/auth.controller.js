import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import env from '../config/env.js'
import User from '../models/User.js'

export async function register(req,res){
  const { email, password, name, role='fin' } = req.body
  const passwordHash = await bcrypt.hash(password, 10)
  const u = await User.create({ email, passwordHash, name, role })
  res.status(201).json({ id: u.id })
}
export async function login(req,res){
  const { email, password } = req.body
  const u = await User.findOne({ email })
  if(!u) return res.status(401).json({ error:'invalid' })
  const ok = await bcrypt.compare(password, u.passwordHash)
  if(!ok) return res.status(401).json({ error:'invalid' })
  const token = jwt.sign({ sub:u.id, email:u.email, role:u.role, name:u.name }, env.JWT_SECRET, { expiresIn:'12h' })
  res.json({ token, user:{ id:u.id, email:u.email, role:u.role, name:u.name } })
}
