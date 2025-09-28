import React from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppLayout } from './ui/AppLayout.jsx'
import { LoginPage } from './ui/pages/LoginPage.jsx'
import { DashboardPage } from './ui/pages/DashboardPage.jsx'
import { CashflowsPage } from './ui/pages/CashflowsPage.jsx'
import { AccountsPage } from './ui/pages/AccountsPage.jsx'
import { ImportPage } from './ui/pages/ImportPage.jsx'
import { SettingsPage } from './ui/pages/SettingsPage.jsx'
import { ScenariosPage } from './ui/pages/ScenariosPage/ScenariosPage.jsx'
import { RequireAuth } from './ui/RequireAuth.jsx'


export const router = createBrowserRouter([
    { path: '/', element: <Navigate to="/dashboard" replace /> },
    { path: '/login', element: <LoginPage/> },
    { path: '/', element: <RequireAuth><AppLayout/></RequireAuth>,
        children: [
            { path: '/dashboard', element: <DashboardPage/> },
            { path: '/cashflows', element: <CashflowsPage/> },
            { path: '/accounts', element: <AccountsPage/> },
            { path: '/import', element: <ImportPage/> },
            { path: '/settings', element: <SettingsPage/> },
            { path: '/scenarios', element: <ScenariosPage/> }
        ] }
])