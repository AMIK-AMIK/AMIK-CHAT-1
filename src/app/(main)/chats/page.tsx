import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { chats, currentUser } from "@/lib/data";
import Link from "next/link";
import type { Chat } from "@/lib/types";
import { Plus, Search } from "lucide-react";

function ChatItem({ chat }: { chat: Chat }) {
  const otherParticipant = chat.participants.find(p => p.id !== currentUser.id);
  const lastMessage = chat.messages[chat.messages.length - 1];
  
  if (!otherParticipant || !lastMessage) return null;

  const unreadCount = chat.messages.filter(m => !m.isRead && m.senderId !== currentUser.id).length;

  return (
    <Link href={`/chats/${chat.id}`} className="block transition-colors hover:bg-muted/50">
      <div className="flex items-center gap-4 px-4 py-3">
        <div className="relative">
          <Avatar className="h-12 w-12 border">
            <AvatarImage src={otherParticipant.avatarUrl} alt={otherParticipant.name} data-ai-hint="person avatar"/>
            <AvatarFallback>{otherParticipant.name.charAt(0)}</AvatarFallback>
          </Avatar>
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-destructive p-0.5 text-[10px] text-destructive-foreground">
              {unreadCount}
            </span>
          )}
        </div>
        <div className="flex-1 overflow-hidden">
          <div className="flex justify-between items-center">
            <p className="font-semibold truncate text-base">{otherParticipant.name}</p>
            <p className="text-xs text-muted-foreground">{lastMessage.timestamp}</p>
          </div>
          <p className="text-sm text-muted-foreground truncate">{lastMessage.text}</p>
        </div>
      </div>
    </Link>
  );
}

export default function ChatsPage() {
  return (
    <div>
      <header className="sticky top-0 z-10 flex items-center justify-between border-b bg-background p-4">
        <h1 className="text-xl font-bold">WeChat</h1>
        <div className="flex items-center gap-5">
            <Search className="h-5 w-5 text-foreground" />
            <Plus className="h-6 w-6 text-foreground" />
        </div>
      </header>
      <div className="divide-y">
        {chats.map(chat => (
          <ChatItem key={chat.id} chat={chat} />
        ))}
      </div>
    </div>
  );
}
