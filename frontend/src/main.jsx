/*import React from 'react';
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
      <ScenariosProvider> 
      </ScenariosProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
*/

import React from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ChakraProvider, ColorModeScript } from '@chakra-ui/react';
import theme from './ui/theme.js'; // 👈 tu tema extendido
import { router } from './router.jsx';
import { ScenariosProvider } from './context/ScenariosContext.jsx';
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
      <ScenariosProvider>
        <ChakraProvider theme={theme}>   {/* 👈 envolvemos aquí */}
          <ColorModeScript initialColorMode={theme.config.initialColorMode} />
          <RouterProvider router={router} />
        </ChakraProvider>
      </ScenariosProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
