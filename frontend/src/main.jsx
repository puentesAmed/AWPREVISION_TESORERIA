import React from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { router } from './router.jsx';
import { ScenariosProvider } from './context/ScenariosContext.jsx'; // 👈 importar provider
import './styles/style.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 30000,
    },
  },
});

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ScenariosProvider> {/* 👈 ahora toda la app tiene acceso al contexto */}
        <RouterProvider router={router} />
      </ScenariosProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
