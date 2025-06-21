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
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';

export default function AddContactPage() {
  const [contactId, setContactId] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const { user: currentUser } = useAuth();

  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactId.trim() || loading || !currentUser) return;

    setLoading(true);
    const trimmedId = contactId.trim();

    try {
      if (trimmedId === currentUser.uid) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: "You cannot add yourself as a contact.",
        });
        setLoading(false);
        return;
      }
      
      const userDocRef = doc(db, 'users', trimmedId);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        toast({
          variant: 'destructive',
          title: 'User Not Found',
          description: 'No user exists with that ID. Please check and try again.',
        });
        setLoading(false);
        return;
      }
      
      const contactData = userDoc.data();

      const existingContactRef = doc(db, 'users', currentUser.uid, 'contacts', trimmedId);
      const existingContactSnap = await getDoc(existingContactRef);

      if (existingContactSnap.exists()) {
          toast({
              title: 'Already a Contact',
              description: `${contactData.name} is already in your contacts.`,
          });
          setContactId('');
          setLoading(false);
          return;
      }

      // Add the new contact to the current user's list.
      // This is a one-way add to prevent security rule violations.
      const newContactRef = doc(db, 'users', currentUser.uid, 'contacts', trimmedId);
      await setDoc(newContactRef, { addedAt: serverTimestamp() });

      toast({
        title: 'Success!',
        description: `${contactData.name} has been added to your contacts.`,
      });
      router.push('/contacts');

    } catch (error) {
      console.error("Error adding contact:", error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Something went wrong while adding the contact. Please try again.',
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
              Enter the unique AMIK CHAT ID of the user you want to add.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleAddContact}>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="contact-id">AMIK CHAT ID</Label>
                <Input
                  id="contact-id"
                  placeholder="e.g., fJ...xZ"
                  value={contactId}
                  onChange={(e) => setContactId(e.target.value)}
                  required
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={loading || !currentUser} className="w-full">
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
