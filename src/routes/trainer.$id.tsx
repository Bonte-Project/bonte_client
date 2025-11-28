import { createFileRoute } from '@tanstack/react-router';
import { useNavigate } from '@tanstack/react-router';
import { useAuthStore } from '@/store/auth.store';
import { useEffect } from 'react';
import { useParams } from '@tanstack/react-router';
import PublicTrainerProfilePage from '@/pages/public-trainer-profile.page';

export const Route = createFileRoute('/trainer/$id')({
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
  const { id } = useParams({ from: '/trainer/$id' });
  if (user) return <PublicTrainerProfilePage id={id} />;
  return null;
}
