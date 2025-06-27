"use client";

import BottomNav from "@/components/BottomNav";
import { useAuth } from '@/hooks/useAuth';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import type { Chat } from "@/lib/types";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export default function MainAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { toast, dismiss } = useToast();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;

    // Use a Set to track messages we've already shown notifications for in this session.
    // This prevents spamming notifications on reconnect or for the same message.
    const notifiedMessageKeys = new Set<string>();

    const chatsQuery = query(
      collection(db, 'chats'),
      where('participantIds', 'array-contains', user.uid)
    );

    const unsubscribe = onSnapshot(chatsQuery, (snapshot) => {
      snapshot.docChanges().forEach(async (change) => {
        // We only care about new or updated chats
        if (change.type === 'added' || change.type === 'modified') {
          const chat = change.doc.data() as Chat;
          const chatId = change.doc.id;
          const { lastMessage } = chat;

          const isViewingChat = pathname === `/chats/${chatId}`;

          // Conditions for showing a notification:
          // 1. There is a last message.
          // 2. It was sent by someone else.
          // 3. It's unread.
          // 4. The user is NOT currently viewing that specific chat.
          if (lastMessage && lastMessage.senderId !== user.uid && !lastMessage.isRead && !isViewingChat) {
            const messageTimestamp = lastMessage.timestamp?.toMillis() ?? Date.now();
            const messageKey = `${chatId}-${messageTimestamp}`;

            // 5. We haven't already shown a notification for this exact message.
            if (notifiedMessageKeys.has(messageKey)) {
              return;
            }
            notifiedMessageKeys.add(messageKey);

            const senderInfo = chat.participantsInfo?.[lastMessage.senderId];
            if (!senderInfo) return;

            const toastId = `new-message-${messageKey}`;
            
            toast({
              id: toastId,
              className: "bg-primary text-primary-foreground p-2 rounded-full cursor-pointer w-auto max-w-[320px] shadow-lg data-[state=open]:sm:slide-in-from-bottom-full",
              duration: 6000,
              description: (
                <div 
                  className="flex items-center gap-2" 
                  onClick={() => {
                    router.push(`/chats/${chatId}`);
                    dismiss(toastId);
                  }}
                >
                  <Avatar className="h-8 w-8 border">
                    <AvatarImage src={senderInfo.avatarUrl} alt={senderInfo.name} data-ai-hint="person avatar" />
                    <AvatarFallback>{senderInfo.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 overflow-hidden">
                    <p className="font-semibold truncate">{senderInfo.name}</p>
                    <p className="text-sm truncate">{lastMessage.text}</p>
                  </div>
                </div>
              )
            });
          }
        }
      });
    },
    (error) => {
      console.error("Firestore permission error in main layout:", error);
      if (error.code === 'permission-denied') {
        toast({
          variant: "destructive",
          title: "Permissions Error",
          description: "Could not load chat list. Please check your Firestore security rules to allow querying the 'chats' collection.",
          duration: 10000,
        });
      }
    });

    return () => unsubscribe();
  }, [user, pathname, router, toast, dismiss]);

  if (loading || !user) {
    return (
      <div className="flex h-screen items-center justify-center">
         <div className="w-full max-w-sm space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-12 w-full" />
         </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex h-screen max-w-2xl flex-col bg-background">
      <main className="flex-1 overflow-y-auto pb-20">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
