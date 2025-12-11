import { createFileRoute } from '@tanstack/react-router';
import { useNavigate } from '@tanstack/react-router';
import { useAuthStore } from '@/store/auth.store';
import { useEffect } from 'react';
import ForgotPassword from '@/pages/forgot-password.page';

export const Route = createFileRoute('/forgot-password')({
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

  if (!user) return <ForgotPassword />;
  return null;
}
