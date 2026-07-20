import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import AppRouter from './routes/AppRouter'; // En español: rutas/AppRouter o routes/AppRouter. Espera, el folder es src/routes/AppRouter.tsx o src/rutas/AppRouter.tsx? 
// Let's check: We created it as d:/Totti/FACULTAD/kiosco/frontend/src/rutas/AppRouter.tsx
// So we import from './rutas/AppRouter'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppRouter />
      <Toaster
        position="top-right"
        toastOptions={{
          className: 'dark:bg-zinc-900 dark:text-white dark:border-zinc-800 border text-sm rounded-xl',
          duration: 4000,
        }}
      />
    </QueryClientProvider>
  );
}

export default App;
