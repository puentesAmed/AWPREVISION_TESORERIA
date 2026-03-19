import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import env from '../config/env.js'
import User from '../models/User.js'

function signUserToken(user) {
  return jwt.sign(
    { sub: user.id, email: user.email, role: user.role, name: user.name },
    env.JWT_SECRET,
    { expiresIn: '12h' }
  )
}

function sanitizeUser(user) {
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
  }
}

export async function register(req, res) {
  const { email, password, name, role = 'fin' } = req.body

  if (!email || !password || !name) {
    return res.status(400).json({ error: 'email, password y name son obligatorios' })
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'password debe tener al menos 6 caracteres' })
  }

  const normalizedEmail = String(email).trim().toLowerCase()
  const cleanName = String(name).trim()

  const existing = await User.findOne({ email: normalizedEmail }).lean()
  if (existing) {
    return res.status(409).json({ error: 'email ya registrado' })
  }

  const passwordHash = await bcrypt.hash(password, 10)
  const user = await User.create({
    email: normalizedEmail,
    passwordHash,
    name: cleanName,
    role,
  })

  const token = signUserToken(user)
  res.status(201).json({ token, user: sanitizeUser(user) })
}

export async function login(req, res) {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ error: 'email y password son obligatorios' })
  }

  const normalizedEmail = String(email).trim().toLowerCase()
  const user = await User.findOne({ email: normalizedEmail })

  if (!user) return res.status(401).json({ error: 'invalid' })

  const ok = await bcrypt.compare(password, user.passwordHash)
  if (!ok) return res.status(401).json({ error: 'invalid' })

  const token = signUserToken(user)
  res.json({ token, user: sanitizeUser(user) })
}
