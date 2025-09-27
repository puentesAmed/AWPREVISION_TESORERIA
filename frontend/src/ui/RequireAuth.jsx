import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../state/auth.js'
export function RequireAuth({ children }){
  const { user } = useAuth(); const loc = useLocation()
  if (!user) return <Navigate to="/login" replace state={{ from: loc }} />
  return <>{children}</>
}
