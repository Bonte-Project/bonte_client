import type { ReactNode } from 'react';
import { Header } from './header.component';

interface ChatLayoutProps {
  children: ReactNode;
}

export const ChatLayout = ({ children }: ChatLayoutProps) => {
  return (
    <>
      <Header />
      <main className='lg:ml-64 min-h-screen bg-[#1e1416] overflow-hidden'>
        <div className='h-screen'>{children}</div>
      </main>
    </>
  );
};

export default ChatLayout;
