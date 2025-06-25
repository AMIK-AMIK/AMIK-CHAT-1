"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import type { Chat } from '@/lib/types';
import { useAuth } from '@/hooks/useAuth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Search, Plus, MessageCircle, UserPlus, ScanLine, Landmark } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

function ChatItem({ chat, currentUserId }: { chat: Chat; currentUserId: string }) {
  const otherParticipantId = chat.participantIds.find(id => id !== currentUserId);
  const otherParticipant = otherParticipantId ? chat.participantsInfo[otherParticipantId] : null;
  const [time, setTime] = useState('');
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    if (!hasMounted) return;

    let timeoutId: NodeJS.Timeout;
    const updateFuzzyTime = () => {
      if (chat.lastMessage?.timestamp) {
        try {
          const date = chat.lastMessage.timestamp.toDate();
          setTime(formatDistanceToNow(date, { addSuffix: true }));
        } catch (e) {
          setTime('just now');
        }
      } else {
        setTime('');
      }
      timeoutId = setTimeout(updateFuzzyTime, 60000); // update every minute
    };

    updateFuzzyTime();
    return () => clearTimeout(timeoutId);
  }, [chat.lastMessage?.timestamp, hasMounted]);

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
            {hasMounted && chat.lastMessage && <p className="text-xs text-muted-foreground">{time}</p>}
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
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!currentUser) return;
    
    // Fetch chats without ordering to avoid needing a composite index.
    // We will sort the chats on the client-side.
    const q = query(
      collection(db, 'chats'),
      where('participantIds', 'array-contains', currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      setLoading(true);
      const chatsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
      })) as Chat[];
      
      // Sort chats by the most recent message timestamp.
      chatsData.sort((a, b) => {
        const timeA = a.lastMessage?.timestamp?.toDate()?.getTime() || a.createdAt?.toDate()?.getTime() || 0;
        const timeB = b.lastMessage?.timestamp?.toDate()?.getTime() || b.createdAt?.toDate()?.getTime() || 0;
        return timeB - timeA;
      });

      setChats(chatsData);
      setLoading(false);
    }, (error) => {
        console.error("Error fetching chats: ", error);
        setLoading(false);
        toast({ variant: "destructive", title: "Error", description: "Could not fetch chats. Please check your connection or try again later." });
    });

    return () => unsubscribe();
  }, [currentUser, toast]);
  
  const filteredChats = chats.filter(chat => {
    if (!currentUser) return false;
    const otherParticipantId = chat.participantIds.find(id => id !== currentUser.uid);
    if (!otherParticipantId) return false;
    
    const otherParticipant = chat.participantsInfo[otherParticipantId];
    return otherParticipant?.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div>
      <header className="sticky top-0 z-10 flex items-center justify-between border-b bg-background p-4">
        <h1 className="text-xl font-bold">AMIK CHAT</h1>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Plus className="h-5 w-5" />
                <span className="sr-only">New Chat</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => router.push('/contacts')}>
                <MessageCircle className="mr-2 h-4 w-4" />
                <span>New Chat</span>
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => router.push('/contacts/add')}>
                <UserPlus className="mr-2 h-4 w-4" />
                <span>Add Contacts</span>
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => router.push('/scan')}>
                <ScanLine className="mr-2 h-4 w-4" />
                <span>Scan</span>
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => router.push('/money')}>
                <Landmark className="mr-2 h-4 w-4" />
                <span>Money</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
       <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input 
            placeholder="Search" 
            className="pl-10"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      <div className="divide-y">
        {loading ? (
          <p className="p-4 text-center text-muted-foreground">Loading chats...</p>
        ) : filteredChats.length > 0 ? (
          filteredChats.map(chat => (
            currentUser && <ChatItem key={chat.id} chat={chat} currentUserId={currentUser.uid} />
          ))
        ) : (
           <p className="p-4 text-center text-muted-foreground">No chats found.</p>
        )}
      </div>
    </div>
  );
}
