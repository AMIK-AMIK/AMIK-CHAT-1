"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { collection, doc, getDoc, onSnapshot, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';
import type { User } from '@/lib/types';
import { ChevronLeft, Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';

export default function NewChatPage() {
  const [contacts, setContacts] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [creatingChat, setCreatingChat] = useState<string | null>(null); // Store ID of contact being processed
  const router = useRouter();
  const { user: currentUser, userData } = useAuth();

  useEffect(() => {
    if (!currentUser) return;
    const contactsColRef = collection(db, 'users', currentUser.uid, 'contacts');
    const unsubscribe = onSnapshot(contactsColRef, async (snapshot) => {
      try {
        if (snapshot.empty) {
          setContacts([]);
          setLoading(false);
          return;
        }
        const contactPromises = snapshot.docs.map(contactDoc => getDoc(doc(db, 'users', contactDoc.id)));
        const contactDocs = await Promise.all(contactPromises);
        const contactsData = contactDocs
          .filter(doc => doc.exists())
          .map(doc => ({ id: doc.id, ...doc.data() } as User));
        setContacts(contactsData);
      } catch (error) {
        console.error("Error fetching contacts:", error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [currentUser]);

  const handleSelectContact = async (contact: User) => {
    if (!currentUser || !userData) return;
    setCreatingChat(contact.id);
    
    const participantIds = [currentUser.uid, contact.id].sort();

    try {
      // Check if a chat already exists
      const q = query(collection(db, 'chats'), where('participantIds', '==', participantIds));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        // Chat exists, navigate to it
        const chatId = querySnapshot.docs[0].id;
        router.push(`/chats/${chatId}`);
      } else {
        // Chat doesn't exist, create it with denormalized data
        const newChatData = {
          participantIds: participantIds,
          participantsInfo: {
            [currentUser.uid]: {
              name: userData.name,
              avatarUrl: userData.avatarUrl,
            },
            [contact.id]: {
              name: contact.name,
              avatarUrl: contact.avatarUrl,
            },
          },
          createdAt: serverTimestamp(),
          lastMessage: null,
        };
        const newChatRef = await addDoc(collection(db, 'chats'), newChatData);
        router.push(`/chats/${newChatRef.id}`);
      }
    } catch (error) {
      console.error("Error creating or finding chat: ", error);
      setCreatingChat(null);
    }
  };

  return (
    <div>
      <header className="sticky top-0 z-10 flex items-center gap-4 border-b bg-background p-3">
        <Link href="/chats" className="p-1 rounded-md hover:bg-muted">
          <ChevronLeft className="h-6 w-6" />
        </Link>
        <h1 className="flex-1 truncate text-lg font-semibold">New Chat</h1>
      </header>
      <div className="divide-y">
        <h2 className="p-4 text-sm font-semibold text-muted-foreground">Choose a contact</h2>
        {loading ? (
           <div className="p-4 space-y-4">
            <div className="flex items-center gap-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <Skeleton className="h-5 w-32" />
            </div>
             <div className="flex items-center gap-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <Skeleton className="h-5 w-40" />
            </div>
          </div>
        ) : contacts.length > 0 ? (
          contacts.map(contact => (
            <div
              key={contact.id}
              onClick={() => handleSelectContact(contact)}
              className="flex items-center gap-4 p-4 hover:bg-muted/50 cursor-pointer"
            >
              <Avatar className="h-10 w-10 border">
                <AvatarImage src={contact.avatarUrl} alt={contact.name} data-ai-hint="person avatar" />
                <AvatarFallback>{contact.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <p className="font-semibold flex-1">{contact.name}</p>
              {creatingChat === contact.id && <Loader2 className="h-5 w-5 animate-spin" />}
            </div>
          ))
        ) : (
          <p className="p-4 text-center text-muted-foreground">You have no contacts to start a chat with. <Link href="/contacts/add" className='text-primary underline'>Add one!</Link></p>
        )}
      </div>
    </div>
  );
}
