import { createFileRoute } from '@tanstack/react-router';
import { useNavigate } from '@tanstack/react-router';
import { useAuthStore } from '@/store/auth.store';
import { useEffect } from 'react';
import TrainerProfilePage from '@/pages/trainer-profile.page';

export const Route = createFileRoute('/trainer-profile')({
  component: RouteComponent,
});

function RouteComponent() {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      void navigate({ to: '/login' });
      return;
    }

    switch (user.role) {
      case 'admin':
        void navigate({ to: '/' });
        break;
      case 'user':
        void navigate({ to: '/profile' });
        break;
    }
  }, [user, navigate]);

  if (!user) return null;

  if (user.role === 'trainer') {
    return <TrainerProfilePage />;
  }

  return null;
}
