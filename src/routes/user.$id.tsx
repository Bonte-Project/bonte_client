import { createFileRoute } from '@tanstack/react-router';
import { useNavigate } from '@tanstack/react-router';
import { useAuthStore } from '@/store/auth.store';
import { useEffect } from 'react';
import { useParams } from '@tanstack/react-router';
import PublicProfilePage from '@/pages/public-profile.page';

export const Route = createFileRoute('/user/$id')({
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
  if (user) return <PublicProfilePage id={id} />;
  return null;
}
