import NutritionPage from '@/pages/nutrition.page';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/nutrition')({
  component: RouteComponent,
});

function RouteComponent() {
  return <NutritionPage />;
}
