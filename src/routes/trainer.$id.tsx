import PublicTrainerProfilePage from '@/pages/public-trainer-profile.page';
import { createFileRoute } from '@tanstack/react-router';
import { useParams } from '@tanstack/react-router';

export const Route = createFileRoute('/trainer/$id')({
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = useParams({ from: '/trainer/$id' });
  return <PublicTrainerProfilePage id={id} />;
}
