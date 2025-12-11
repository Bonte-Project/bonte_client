import { createRootRoute, Outlet, redirect, useRouterState } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/router-devtools';
import Layout from '@/components/layout.component';
import { useAuthStore } from '@/store/auth.store';
import { Header } from '@/components/header.component';

const RootLayout = () => {
  const routerState = useRouterState();
  const isChatPage = routerState.location.pathname.startsWith('/chat');

  return (
    <>
      {isChatPage ? (
        <>
          <Header />
          <Outlet />
        </>
      ) : (
        <Layout>
          <Outlet />
        </Layout>
      )}
      <TanStackRouterDevtools />
    </>
  );
};

export const Route = createRootRoute({
  component: RootLayout,
  beforeLoad: async ({ location }) => {
    const publicPaths = ['/login', '/register', '/verify-email', '/forgot-password'];
    const isPublicPath = publicPaths.some(path => location.pathname.startsWith(path));

    const { user, fetchMe } = useAuthStore.getState();

    if (!user) {
      try {
        await fetchMe();
      } catch (error) {
        console.warn('Failed to fetch user:', error);
      }
    }

    const currentUser = useAuthStore.getState().user;

    if (!currentUser && !isPublicPath) {
      // eslint-disable-next-line @typescript-eslint/only-throw-error
      throw redirect({
        to: '/login',
        search: {
          redirect: location.pathname,
        },
      });
    }

    if (currentUser && (location.pathname === '/login' || location.pathname === '/register')) {
      // eslint-disable-next-line @typescript-eslint/only-throw-error
      throw redirect({
        to: '/profile',
      });
    }
  },
});
