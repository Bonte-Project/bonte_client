import { createFileRoute } from '@tanstack/react-router';
import TrainersPage from '@/pages/trainers.page';

export const Route = createFileRoute('/trainers')({
  component: RouteComponent,
});

function RouteComponent() {
  return <TrainersPage />;
}
