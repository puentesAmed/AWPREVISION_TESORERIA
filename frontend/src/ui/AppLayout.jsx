import React from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../state/auth.js'
export function AppLayout(){
  const { user, logout } = useAuth(); const nav = useNavigate()
  return (
    <div>
      <header className="header-container">
        <nav className="nav">
          <strong>Previsión de Tesorería</strong>
          <NavLink to="/dashboard">Dashboard</NavLink>
          <NavLink to="/cashflows">Flujos</NavLink>
          <NavLink to="/accounts">Cuentas</NavLink>
          <NavLink to="/import">Importar</NavLink>
          <NavLink to="/settings">Ajustes</NavLink>
          <NavLink to="/scenarios">Escenarios</NavLink>
        </nav>
        <div className='user'>
          <span>{user?.name}</span>
          <button className="btn" onClick={()=>{ logout(); nav('/login') }}>Salir</button>
        </div>
      </header>
      <main className="container"><Outlet/></main>
    </div>
  )
}
