"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Users, UserPlus, Loader2 } from "lucide-react";
import ContactSuggestions from "@/components/contacts/ContactSuggestions";
import { Button } from "@/components/ui/button";
import { collection, doc, getDoc, onSnapshot, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';
import type { User } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';

function ContactItem({ contact, onClick, isCreatingChat }: { contact: User; onClick: () => void; isCreatingChat: boolean; }) {
  return (
    <div
      onClick={onClick}
      className="flex items-center gap-4 p-4 hover:bg-muted/50 cursor-pointer"
    >
      <Avatar className="h-10 w-10 border">
        <AvatarImage src={contact.avatarUrl} alt={contact.name} data-ai-hint="person avatar" />
        <AvatarFallback>{contact.name.charAt(0)}</AvatarFallback>
      </Avatar>
      <div className="flex-1 overflow-hidden">
        <p className="font-semibold truncate">{contact.name}</p>
      </div>
       {isCreatingChat && <Loader2 className="h-5 w-5 animate-spin" />}
    </div>
  );
}

export default function ContactsPage() {
  const [contacts, setContacts] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const { user: currentUser, userData } = useAuth();
  const router = useRouter();
  const [creatingChat, setCreatingChat] = useState<string | null>(null);

  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    };
    
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
  
  const handleStartChat = async (contact: User) => {
    if (!currentUser || !userData || creatingChat) return;
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
        // Chat doesn't exist, create it
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
    } finally {
      setCreatingChat(null);
    }
  };

  return (
    <div>
      <header className="sticky top-0 z-10 flex items-center justify-between border-b bg-background p-4">
        <h1 className="text-xl font-bold">Contacts</h1>
        <Link href="/contacts/add">
           <Button variant="ghost" size="icon" className="h-8 w-8">
              <UserPlus className="h-5 w-5" />
              <span className="sr-only">Add Contact</span>
            </Button>
        </Link>
      </header>

      <div className="p-4">
        <ContactSuggestions />
      </div>

      <div className="border-t">
        <h2 className="p-4 text-sm font-semibold text-muted-foreground">My Contacts</h2>
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
          <div className="divide-y">
            {contacts.map(contact => (
              <ContactItem 
                key={contact.id} 
                contact={contact} 
                onClick={() => handleStartChat(contact)}
                isCreatingChat={creatingChat === contact.id}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
            <Users className="h-16 w-16 mb-4" />
            <h3 className="text-lg font-semibold">No Contacts Yet</h3>
            <p className="text-sm">Use the '+' button to add new contacts.</p>
          </div>
        )}
      </div>
    </div>
  );
}
