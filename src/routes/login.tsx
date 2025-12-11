import { createFileRoute } from '@tanstack/react-router';
import { useNavigate } from '@tanstack/react-router';
import { useAuthStore } from '@/store/auth.store';
import { useEffect } from 'react';
import LoginPage from '@/pages/login.page';

export const Route = createFileRoute('/login')({
  component: RouteComponent,
});

function RouteComponent() {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      void navigate({ to: '/profile' });
      return;
    }
  }, [user, navigate]);

  if (!user) return <LoginPage />;
  return null;
}
