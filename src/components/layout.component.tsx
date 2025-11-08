// src\components\layout.component.tsx
import type { ReactNode } from 'react';
import { Header } from './header.component';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <>
      <Header />

      {/* КЛЮЧЕВОЕ: ml-64 добавляет отступ слева на десктопе, чтобы контент не заезжал под sidebar */}
      {/* На мобилях нет отступа, т.к. sidebar фиксированный и overlay */}
      <main className='lg:ml-64 min-h-screen bg-[#1e1416] overflow-auto'>
        <div className='p-6 lg:p-10 max-w-7xl mx-auto'>{children}</div>
      </main>
    </>
  );
}

export default Layout;
