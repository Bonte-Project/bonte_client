import { ChatPage } from '@/pages/chat.page';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/chat')({
  component: Index,
});

function Index() {
  return <ChatPage />;
}
