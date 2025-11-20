import NutritionPage from '@/pages/nutrition.page';
import { createFileRoute } from '@tanstack/react-router';
import { useNavigate } from '@tanstack/react-router';
import { useAuthStore } from '@/store/auth.store';
import { useEffect } from 'react';

export const Route = createFileRoute('/nutrition')({
  component: RouteComponent,
});

function RouteComponent() {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      void navigate({ to: '/' });
      return;
    }

    switch (user.role) {
      case 'admin':
        void navigate({ to: '/' });
        break;
      case 'trainer':
        void navigate({ to: '/' });
        break;
    }
  }, [user, navigate]);

  if (!user) return null;

  if (user.role === 'user') {
    return <NutritionPage />;
  }

  return null;
}
