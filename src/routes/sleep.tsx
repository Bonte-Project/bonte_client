import SleepPage from '@/pages/sleep.page';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/sleep')({
  component: RouteComponent,
});

function RouteComponent() {
  return <SleepPage />;
}
