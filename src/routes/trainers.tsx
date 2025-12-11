import { createFileRoute } from '@tanstack/react-router';
import { useNavigate } from '@tanstack/react-router';
import { useAuthStore } from '@/store/auth.store';
import { useEffect } from 'react';
import TrainersPage from '@/pages/trainers.page';

export const Route = createFileRoute('/trainers')({
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
  }, [user, navigate]);
  if (user) return <TrainersPage />;
  return null;
}
