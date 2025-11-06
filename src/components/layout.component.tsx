import type { ReactNode } from 'react';
import { Header } from './header.component';

interface LayoutProps {
  children: ReactNode;
}

/**
 * Layout компонент - главная обёртка для всех страниц приложения
 * Содержит Header, который отображается на всех страницах
 * Управляет главной сеткой приложения
 *
 * @example
 * <Layout>
 *   <YourPageContent />
 * </Layout>
 */
export function Layout({ children }: LayoutProps) {
  return (
    <div className='flex min-h-screen bg-[#1e1416]'>
      {/* Header/Sidebar */}
      <Header />

      {/* Main Content Area */}
      <main className='flex-1 p-6 lg:p-10 overflow-auto'>
        <div className='max-w-7xl mx-auto'>{children}</div>
      </main>
    </div>
  );
}

export default Layout;
