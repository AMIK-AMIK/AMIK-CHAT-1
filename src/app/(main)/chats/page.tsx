import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { chats, currentUser } from "@/lib/data";
import Link from "next/link";
import type { Chat } from "@/lib/types";

function ChatItem({ chat }: { chat: Chat }) {
  const otherParticipant = chat.participants.find(p => p.id !== currentUser.id);
  const lastMessage = chat.messages[chat.messages.length - 1];
  
  if (!otherParticipant || !lastMessage) return null;

  const unreadCount = chat.messages.filter(m => !m.isRead && m.senderId !== currentUser.id).length;

  return (
    <Link href={`/chats/${chat.id}`} className="block transition-colors hover:bg-muted/50">
      <div className="flex items-center gap-4 p-4">
        <Avatar className="h-12 w-12 border">
          <AvatarImage src={otherParticipant.avatarUrl} alt={otherParticipant.name} data-ai-hint="person avatar"/>
          <AvatarFallback>{otherParticipant.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-1 overflow-hidden">
          <div className="flex justify-between">
            <p className="font-semibold truncate">{otherParticipant.name}</p>
            <p className="text-xs text-muted-foreground">{lastMessage.timestamp}</p>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground truncate">{lastMessage.text}</p>
            {unreadCount > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                {unreadCount}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function ChatsPage() {
  return (
    <div>
      <header className="sticky top-0 z-10 border-b bg-background/80 p-4 backdrop-blur-sm">
        <h1 className="text-xl font-bold">Chats</h1>
      </header>
      <div className="divide-y">
        {chats.map(chat => (
          <ChatItem key={chat.id} chat={chat} />
        ))}
      </div>
    </div>
  );
}
