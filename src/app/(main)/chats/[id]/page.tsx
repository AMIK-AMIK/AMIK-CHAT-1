import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { chats, currentUser } from '@/lib/data';
import ChatView from '@/components/chat/ChatView';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { notFound } from 'next/navigation';

export default function ChatPage({ params }: { params: { id: string } }) {
  const chat = chats.find(c => c.id === params.id);

  if (!chat) {
    notFound();
  }

  const otherParticipant = chat.participants.find(p => p.id !== currentUser.id);

  return (
    <div className="flex h-full flex-col">
      <header className="sticky top-0 z-10 flex items-center gap-4 border-b bg-background/80 p-3 backdrop-blur-sm">
        <Link href="/chats" className="p-1 rounded-md hover:bg-muted">
          <ChevronLeft className="h-6 w-6" />
        </Link>
        {otherParticipant && (
          <>
            <Avatar className="h-10 w-10 border">
              <AvatarImage src={otherParticipant.avatarUrl} alt={otherParticipant.name} data-ai-hint="person avatar" />
              <AvatarFallback>{otherParticipant.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <h1 className="flex-1 truncate text-lg font-semibold">{otherParticipant.name}</h1>
          </>
        )}
      </header>
      <ChatView chat={chat} />
    </div>
  );
}
