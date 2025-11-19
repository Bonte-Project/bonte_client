import ActivityPage from '@/pages/activity.page';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/activity')({
  component: RouteComponent,
});

function RouteComponent() {
  return <ActivityPage />;
}
