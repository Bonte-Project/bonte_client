import { createFileRoute } from '@tanstack/react-router';
import { useNavigate } from '@tanstack/react-router';
import { useAuthStore } from '@/store/auth.store';
import { useEffect } from 'react';
import RegisterPage from '@/pages/register.page';

export const Route = createFileRoute('/register')({
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

  if (!user) return <RegisterPage />;
  return null;
}
