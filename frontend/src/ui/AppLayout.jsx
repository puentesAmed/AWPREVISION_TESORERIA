import React from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '@/state/auth.js'

export function AppLayout(){
    const { user, logout } = useAuth(); 
    const nav = useNavigate()
        return (
            <>
                <div>
                    <header className="container">
                        <nav>
                            <strong>App</strong>
                            <NavLink to="/dashboard">Dashboard</NavLink>
                        </nav>
                        <div>
                            <span>{user?.name}</span>
                            <button className="btn" onClick={()=>{ logout(); nav('/login') }}>Salir</button>
                        </div>
                    </header>
                    <main className="container"><Outlet/></main>
                </div>
            </>
        )
    }