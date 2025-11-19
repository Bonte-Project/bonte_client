import { createRoot } from 'react-dom/client';
import { RouterProvider, createRouter } from '@tanstack/react-router';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Toaster } from '@/components/ui/sonner';
import { routeTree } from './routeTree.gen';
import './index.css';
import '@/styles/toast-provider.style.css';

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

const rootElement = document.getElementById('root');
if (rootElement && !rootElement.innerHTML) {
  const root = createRoot(rootElement);
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string;
  root.render(
    <GoogleOAuthProvider clientId={googleClientId}>
      <Toaster />
      <RouterProvider router={router} />
    </GoogleOAuthProvider>
  );
}
