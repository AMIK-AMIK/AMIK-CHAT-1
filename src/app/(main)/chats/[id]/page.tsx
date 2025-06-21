"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ChevronLeft, MoreHorizontal } from 'lucide-react';
import ChatView from '@/components/chat/ChatView';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { notFound } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { User } from '@/lib/types';
import { currentUserId } from '@/lib/data';

export default function ChatPage({ params }: { params: { id: string } }) {
  const [otherParticipant, setOtherParticipant] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChatInfo = async () => {
      try {
        const chatDocRef = doc(db, 'chats', params.id);
        const chatDoc = await getDoc(chatDocRef);

        if (!chatDoc.exists()) {
          notFound();
          return;
        }

        const chatData = chatDoc.data();
        const otherParticipantId = chatData.participantIds.find((id: string) => id !== currentUserId);

        if (otherParticipantId) {
          const userDocRef = doc(db, 'users', otherParticipantId);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            setOtherParticipant({ id: userDoc.id, ...userDoc.data() } as User);
          }
        }
      } catch (error) {
        console.error("Error fetching chat info:", error);
        notFound();
      } finally {
        setLoading(false);
      }
    };

    fetchChatInfo();
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex h-full flex-col items-center justify-center">
        <p>Loading chat...</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <header className="sticky top-0 z-10 flex items-center gap-4 border-b bg-background p-3">
        <Link href="/chats" className="p-1 rounded-md hover:bg-muted">
          <ChevronLeft className="h-6 w-6" />
        </Link>
        {otherParticipant ? (
          <>
            <Avatar className="h-10 w-10 border">
              <AvatarImage src={otherParticipant.avatarUrl} alt={otherParticipant.name} data-ai-hint="person avatar" />
              <AvatarFallback>{otherParticipant.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <h1 className="flex-1 truncate text-lg font-semibold">{otherParticipant.name}</h1>
          </>
        ) : (
          <div className="flex-1 h-10 bg-muted rounded-md animate-pulse" />
        )}
        <button className="p-1 rounded-md hover:bg-muted">
          <MoreHorizontal className="h-6 w-6" />
        </button>
      </header>
      <ChatView chatId={params.id} />
    </div>
  );
}
