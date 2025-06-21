"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, doc, getDoc, orderBy, limit } from 'firebase/firestore';
import type { Chat, User, Message } from '@/lib/types';
import { currentUserId } from '@/lib/data';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlusCircle, Search } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

function ChatItem({ chat }: { chat: Chat }) {
  const otherParticipant = chat.participants.find(p => p.id !== currentUserId);

  if (!otherParticipant) return null;

  const getTimestamp = () => {
    if (!chat.lastMessage?.timestamp) return '';
    try {
      return formatDistanceToNow(chat.lastMessage.timestamp.toDate(), { addSuffix: true });
    } catch (e) {
      return 'just now';
    }
  }

  return (
    <Link href={`/chats/${chat.id}`} className="block transition-colors hover:bg-muted/50">
      <div className="flex items-center gap-4 px-4 py-3">
        <Avatar className="h-12 w-12 border">
          <AvatarImage src={otherParticipant.avatarUrl} alt={otherParticipant.name} data-ai-hint="person avatar" />
          <AvatarFallback>{otherParticipant.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-1 overflow-hidden">
          <div className="flex justify-between items-center">
            <p className="font-semibold truncate text-base">{otherParticipant.name}</p>
            {chat.lastMessage && <p className="text-xs text-muted-foreground">{getTimestamp()}</p>}
          </div>
          <p className="text-sm text-muted-foreground truncate">{chat.lastMessage?.text || 'No messages yet'}</p>
        </div>
      </div>
    </Link>
  );
}

export default function ChatsPage() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const q = query(
      collection(db, 'chats'),
      where('participantIds', 'array-contains', currentUserId)
    );

    const unsubscribe = onSnapshot(q, async (querySnapshot) => {
      const chatsData: Chat[] = await Promise.all(
        querySnapshot.docs.map(async (chatDoc) => {
          const chatData = chatDoc.data();
          const participantIds = chatData.participantIds;
          
          const otherParticipantId = participantIds.find((id: string) => id !== currentUserId);
          const userDoc = await getDoc(doc(db, 'users', otherParticipantId));
          const otherParticipant = { id: userDoc.id, ...userDoc.data() } as User;
          const currentUserDoc = await getDoc(doc(db, 'users', currentUserId));
          const currentUserData = { id: currentUserDoc.id, ...currentUserDoc.data() } as User;

          // Get last message
          const messagesQuery = query(collection(db, `chats/${chatDoc.id}/messages`), orderBy('timestamp', 'desc'), limit(1));
          const messagesSnapshot = await getDoc(messagesQuery as any);
          const lastMessage = messagesSnapshot.docs.map(d => ({id: d.id, ...d.data()}))[0] as Message | null;

          return {
            id: chatDoc.id,
            participants: [currentUserData, otherParticipant],
            participantIds: participantIds,
            lastMessage: lastMessage
          };
        })
      );
      setChats(chatsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredChats = chats.filter(chat => {
    const otherParticipant = chat.participants.find(p => p.id !== currentUserId);
    return otherParticipant?.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div>
      <header className="sticky top-0 z-10 flex items-center justify-between border-b bg-background p-4">
        <h1 className="text-xl font-bold">AMIK CHAT</h1>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <PlusCircle className="h-5 w-5" />
            <span className="sr-only">New Chat</span>
          </Button>
        </div>
      </header>
      <div className="p-4 border-b bg-muted/30">
        <div className="relative">
          <Label htmlFor="search-chats" className="sr-only">Search chats</Label>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input 
            id="search-chats" 
            name="search-chats" 
            placeholder="Search" 
            className="pl-10 w-full" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      <div className="divide-y">
        {loading ? (
          <p className="p-4 text-center text-muted-foreground">Loading chats...</p>
        ) : filteredChats.length > 0 ? (
          filteredChats.map(chat => (
            <ChatItem key={chat.id} chat={chat} />
          ))
        ) : (
           <p className="p-4 text-center text-muted-foreground">No chats found.</p>
        )}
      </div>
    </div>
  );
}
