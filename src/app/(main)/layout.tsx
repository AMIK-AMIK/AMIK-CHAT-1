"use client";

import BottomNav from "@/components/BottomNav";
import { useAuth } from '@/hooks/useAuth';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot, getDoc, doc } from "firebase/firestore";
import type { Message, User } from "@/lib/types";
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
    
    const chatsQuery = query(collection(db, 'chats'), where('participantIds', 'array-contains', user.uid));
    
    const messageUnsubscribes: {[key: string]: () => void} = {};

    const chatsUnsubscribe = onSnapshot(chatsQuery, (chatsSnapshot) => {
        chatsSnapshot.docChanges().forEach((change) => {
            const chatId = change.doc.id;
            if (change.type === "added" || change.type === "modified") {
                if (messageUnsubscribes[chatId]) return;

                const messagesQuery = query(collection(db, 'chats', chatId, 'messages'));
                const messagesUnsubscribe = onSnapshot(messagesQuery, (messagesSnapshot) => {
                    messagesSnapshot.docChanges().forEach(async (msgChange) => {
                        if (msgChange.type === "added") {
                            const message = { id: msgChange.doc.id, ...msgChange.doc.data() } as Message;
                            const isViewingChat = pathname === `/chats/${chatId}`;
                            
                            if (message.senderId !== user.uid && !message.isRead && !isViewingChat) {
                                // Prevent notifications for old messages on initial load
                                const messageAge = message.timestamp ? Date.now() - message.timestamp.toDate().getTime() : 0;
                                if (message.timestamp && messageAge > 10000) { // 10s grace period
                                    return;
                                }

                                const senderDoc = await getDoc(doc(db, 'users', message.senderId));
                                if (!senderDoc.exists()) return;

                                const sender = { id: senderDoc.id, ...senderDoc.data() } as User;
                                const toastId = `new-message-${message.id}`;
                                
                                toast({
                                    id: toastId,
                                    variant: 'destructive',
                                    className: "p-2 rounded-full cursor-pointer w-auto max-w-[320px] shadow-lg data-[state=open]:sm:slide-in-from-bottom-full",
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
                                                <AvatarImage src={sender.avatarUrl} alt={sender.name} data-ai-hint="person avatar" />
                                                <AvatarFallback>{sender.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 overflow-hidden">
                                                <p className="font-semibold text-white truncate">{sender.name}</p>
                                                <p className="text-sm text-white truncate">{message.text}</p>
                                            </div>
                                        </div>
                                    )
                                });
                            }
                        }
                    });
                });
                messageUnsubscribes[chatId] = messagesUnsubscribe;
            } else if (change.type === "removed") {
                if (messageUnsubscribes[chatId]) {
                    messageUnsubscribes[chatId]();
                    delete messageUnsubscribes[chatId];
                }
            }
        });
    });

    return () => {
        chatsUnsubscribe();
        Object.values(messageUnsubscribes).forEach(unsub => unsub());
    }
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
