"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Users, UserPlus } from "lucide-react";
import ContactSuggestions from "@/components/contacts/ContactSuggestions";
import { Button } from "@/components/ui/button";
import { collection, doc, getDoc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { currentUserId } from '@/lib/data';
import type { User } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';

function ContactItem({ contact }: { contact: User }) {
  return (
    <div className="flex items-center gap-4 p-4">
      <Avatar className="h-10 w-10 border">
        <AvatarImage src={contact.avatarUrl} alt={contact.name} data-ai-hint="person avatar" />
        <AvatarFallback>{contact.name.charAt(0)}</AvatarFallback>
      </Avatar>
      <div className="flex-1 overflow-hidden">
        <p className="font-semibold truncate">{contact.name}</p>
      </div>
    </div>
  );
}

export default function ContactsPage() {
  const [contacts, setContacts] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const contactsColRef = collection(db, 'users', currentUserId, 'contacts');
    
    const unsubscribe = onSnapshot(contactsColRef, async (snapshot) => {
      try {
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
  }, []);

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
              <ContactItem key={contact.id} contact={contact} />
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
