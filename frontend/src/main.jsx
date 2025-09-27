import React from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import { router } from './router.jsx';
import '../src/styles/style.css'
import App from './App.jsx'

const queryClient = new QueryClient({

  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime:30_000
    }
  }
});

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </React.StrictMode>,
)
