
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
import { useToast } from '@/hooks/use-toast';

function formatUrduDistanceToNow(date: Date): string {
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 2) return "ابھی ابھی";
    if (seconds < 60) return `${seconds} سیکنڈ پہلے`;
    
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} منٹ پہلے`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} گھنٹے پہلے`;
    
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days} دن پہلے`;

    const months = Math.floor(days / 30);
    if (months < 12) return `${months} مہینے پہلے`;

    const years = Math.floor(days / 365);
    return `${years} سال پہلے`;
}

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
          setTime(formatUrduDistanceToNow(date));
        } catch (e) {
          setTime('ابھی ابھی');
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
      <div className="flex items-center gap-4 p-4">
        <Avatar className="h-12 w-12 border">
          <AvatarImage src={otherParticipant.avatarUrl} alt={otherParticipant.name} data-ai-hint="person avatar" />
          <AvatarFallback>{otherParticipant.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-1 overflow-hidden">
          <div className="flex items-center justify-between">
            <p className="font-semibold truncate text-base">{otherParticipant.name}</p>
            {hasMounted && chat.lastMessage && <p className="text-xs text-muted-foreground">{time}</p>}
          </div>
          <p className="text-sm text-muted-foreground truncate">{chat.lastMessage?.text || 'ابھی تک کوئی پیغام نہیں'}</p>
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
        toast({ variant: "destructive", title: "خرابی", description: "چیٹس حاصل نہیں کی جا سکیں۔ براہ کرم اپنا کنکشن چیک کریں یا بعد میں دوبارہ کوشش کریں۔" });
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
                <span className="sr-only">شامل کریں</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => router.push('/chats/new')}>
                <MessageCircle className="mr-2 h-4 w-4" />
                <span>نئی چیٹ</span>
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => router.push('/contacts/add')}>
                <UserPlus className="mr-2 h-4 w-4" />
                <span>رابطے شامل کریں</span>
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => router.push('/scan')}>
                <ScanLine className="mr-2 h-4 w-4" />
                <span>اسکین</span>
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => router.push('/money')}>
                <Landmark className="mr-2 h-4 w-4" />
                <span>پیسے</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
       <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input 
            placeholder="تلاش کریں" 
            className="pl-10"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      <div className="divide-y">
        {loading ? (
          <p className="p-4 text-center text-muted-foreground">چیٹس لوڈ ہو رہی ہیں...</p>
        ) : filteredChats.length > 0 ? (
          filteredChats.map(chat => (
            currentUser && <ChatItem key={chat.id} chat={chat} currentUserId={currentUser.uid} />
          ))
        ) : (
           <p className="p-4 text-center text-muted-foreground">کوئی چیٹ نہیں ملی۔</p>
        )}
      </div>
    </div>
  );
}
