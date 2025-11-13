import { createFileRoute } from '@tanstack/react-router';
import ForgotPassword from '@/pages/forgot-password.page';

export const Route = createFileRoute('/forgot-password')({
  component: RouteComponent,
});

function RouteComponent() {
  return <ForgotPassword />;
}
