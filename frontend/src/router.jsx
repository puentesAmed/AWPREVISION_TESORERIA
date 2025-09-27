import React, { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppLayout } from '@/ui/AppLayout.jsx';
import { RequireAuth } from '@/ui/RequireAuth.jsx';


const LoginPage = lazy(()=> import('@/ui/pages/LoginPage.jsx'))
const DashboardPage = lazy(()=> import('@/ui/pages/DashboardPage.jsx'))
const Loader = <div className="container"><div className="card">Cargando…</div></div>
export const router = createBrowserRouter([
{ path: '/', element: <Navigate to="/dashboard" replace /> },
{ path: '/login', element: <Suspense fallback={Loader}><LoginPage/></Suspense> },
{
path: '/',
element: <RequireAuth><AppLayout/></RequireAuth>,
children: [
{ path: '/dashboard', element: <Suspense fallback={Loader}><DashboardPage/></Suspense> }
]
}
])
