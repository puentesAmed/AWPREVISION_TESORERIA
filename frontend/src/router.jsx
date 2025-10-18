import React from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppLayout } from './ui/layouts/AppLayout.jsx'
import { LoginPage } from './ui/pages/LoginPage.jsx'
import { CalendarPage } from './ui/pages/CalendarPage.jsx'
import { TotalsPage } from './ui/pages/TotalsPage.jsx'
import { AccountsPage } from './ui/pages/AccountsPage.jsx'
import { ImportPage } from './ui/pages/ImportPage.jsx'
import { SettingsPage } from './ui/pages/SettingsPage.jsx'
import { DashboardPage } from './ui/pages/DashboardPage.jsx'
import { RequireAuth } from './ui/RequiereAuth.jsx';




export const router = createBrowserRouter([
    //{ path: '/', element: <Navigate to="/dashboard" replace /> },
    { path: '/login', element: <LoginPage/> },
    { path: '/', element: <AppLayout/>,
        children: [
            { path: 'calendar', element:<CalendarPage/> },
            { path: '/dashboard', element: <DashboardPage/> },

            { path: '/accounts', element:
                <RequireAuth allowedRoles={['admin']}>
                    <AccountsPage/>
                </RequireAuth>   
            },
            { path: '/import', element:
                <RequireAuth allowedRoles={['admin']}>
                    <ImportPage/> 
                </RequireAuth>
            },  
            
            { path: '/settings', element: 
                <RequireAuth allowedRoles={['admin']}>
                    <SettingsPage/>
                </RequireAuth> 
            },            
            { path: 'totals', element:<TotalsPage/> },
            { index: true, element: <CalendarPage/> },
            

        ]
    
    }
])