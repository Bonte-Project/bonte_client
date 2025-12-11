import { createFileRoute } from '@tanstack/react-router';
import VerifyEmailPage from '@/pages/verify-email.page';

export const Route = createFileRoute('/verify-email')({
  component: RouteComponent,
});

function RouteComponent() {
  return <VerifyEmailPage />;
}
