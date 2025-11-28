import PublicProfilePage from '@/pages/public-profile.page';
import { createFileRoute } from '@tanstack/react-router';
import { useParams } from '@tanstack/react-router';

export const Route = createFileRoute('/user/$id')({
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = useParams({ from: '/user/$id' });
  return <PublicProfilePage id={id} />;
}
