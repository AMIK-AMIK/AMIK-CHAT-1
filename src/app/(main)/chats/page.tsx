"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, doc, getDoc, orderBy, limit, getDocs } from 'firebase/firestore';
import type { Chat, User, Message } from '@/lib/types';
import { currentUserId } from '@/lib/data';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Search, Plus, MessageCircle, UserPlus, ScanLine, Landmark } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

function ChatItem({ chat }: { chat: Chat }) {
  const otherParticipant = chat.participants.find(p => p.id !== currentUserId);
  const [time, setTime] = useState('');

  useEffect(() => {
    if (chat.lastMessage?.timestamp) {
      try {
        setTime(formatDistanceToNow(chat.lastMessage.timestamp.toDate(), { addSuffix: true }));
      } catch (e) {
        setTime('just now');
      }
    }
  }, [chat.lastMessage?.timestamp]);

  if (!otherParticipant) return null;

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
            {chat.lastMessage && <p className="text-xs text-muted-foreground">{time}</p>}
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

          const messagesQuery = query(collection(db, `chats/${chatDoc.id}/messages`), orderBy('timestamp', 'desc'), limit(1));
          const messagesSnapshot = await getDocs(messagesQuery);
          const lastMessage = messagesSnapshot.empty ? null : {id: messagesSnapshot.docs[0].id, ...messagesSnapshot.docs[0].data()} as Message;

          return {
            id: chatDoc.id,
            participants: [currentUserData, otherParticipant],
            participantIds: participantIds,
            lastMessage: lastMessage
          };
        })
      );
      
      chatsData.sort((a, b) => {
        const timeA = a.lastMessage?.timestamp?.toDate()?.getTime() || 0;
        const timeB = b.lastMessage?.timestamp?.toDate()?.getTime() || 0;
        return timeB - timeA;
      });

      setChats(chatsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div>
      <header className="sticky top-0 z-10 flex items-center justify-between border-b bg-background p-4">
        <h1 className="text-xl font-bold">AMIK CHAT</h1>
        <div className="flex items-center gap-2">
           <Button variant="ghost" size="icon" className="h-8 w-8">
              <Search className="h-5 w-5" />
              <span className="sr-only">Search</span>
            </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Plus className="h-5 w-5" />
                <span className="sr-only">New Chat</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <MessageCircle className="mr-2 h-4 w-4" />
                <span>New Chat</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <UserPlus className="mr-2 h-4 w-4" />
                <span>Add Contacts</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <ScanLine className="mr-2 h-4 w-4" />
                <span>Scan</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Landmark className="mr-2 h-4 w-4" />
                <span>Money</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
      <div className="divide-y">
        {loading ? (
          <p className="p-4 text-center text-muted-foreground">Loading chats...</p>
        ) : chats.length > 0 ? (
          chats.map(chat => (
            <ChatItem key={chat.id} chat={chat} />
          ))
        ) : (
           <p className="p-4 text-center text-muted-foreground">No chats found.</p>
        )}
      </div>
    </div>
  );
}
