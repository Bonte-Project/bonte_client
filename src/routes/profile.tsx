import { createFileRoute } from '@tanstack/react-router';
import { useNavigate } from '@tanstack/react-router';
import { useAuthStore } from '@/store/auth.store';
import { useEffect } from 'react';
import ProfilePage from '@/pages/profile.page';

export const Route = createFileRoute('/profile')({
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
      case 'trainer':
        void navigate({ to: '/trainer-profile' });
        break;
    }
  }, [user, navigate]);

  if (!user) return null;

  if (user.role === 'user') {
    return <ProfilePage />;
  }

  return null;
}
