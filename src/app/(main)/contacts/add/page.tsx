"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { currentUserId } from '@/lib/data';

export default function AddContactPage() {
  const [contactId, setContactId] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactId.trim() || loading) return;

    setLoading(true);

    try {
      if (contactId.trim() === currentUserId) {
         toast({
          variant: 'destructive',
          title: 'Error',
          description: "You cannot add yourself as a contact.",
        });
        return;
      }
      
      const userDocRef = doc(db, 'users', contactId.trim());
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'User not found. Please check the ID.',
        });
        return;
      }

      const contactRef = doc(db, 'users', currentUserId, 'contacts', contactId.trim());
      await setDoc(contactRef, {
        addedAt: new Date(),
      });

      // Also add current user to the other person's contact list
      const currentUserAsContactRef = doc(db, 'users', contactId.trim(), 'contacts', currentUserId);
      await setDoc(currentUserAsContactRef, {
        addedAt: new Date(),
      });


      toast({
        title: 'Success!',
        description: `${userDoc.data().name} has been added to your contacts.`,
      });
      router.push('/contacts');

    } catch (error) {
      console.error("Error adding contact:", error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Something went wrong. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <header className="sticky top-0 z-10 flex items-center gap-4 border-b bg-background p-3">
        <Link href="/contacts" className="p-1 rounded-md hover:bg-muted">
          <ChevronLeft className="h-6 w-6" />
        </Link>
        <h1 className="flex-1 truncate text-lg font-semibold">Add Contact</h1>
      </header>
      <div className="p-4">
        <Card>
          <CardHeader>
            <CardTitle>Add a New Contact</CardTitle>
            <CardDescription>
              Enter the AMIK CHAT ID of the user you want to add.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleAddContact}>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="contact-id">AMIK CHAT ID</Label>
                <Input
                  id="contact-id"
                  placeholder="e.g., user-2"
                  value={contactId}
                  onChange={(e) => setContactId(e.target.value)}
                  required
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Add Contact
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
