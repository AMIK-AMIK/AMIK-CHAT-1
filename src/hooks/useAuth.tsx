"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import type { User } from '@/lib/types';

interface AuthContextType {
  user: FirebaseUser | null;
  userData: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, userData: null, loading: true });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeDoc: () => void = () => {};

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      unsubscribeDoc();

      if (firebaseUser) {
        setLoading(true);
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        
        const userDocSnap = await getDoc(userDocRef);
        if (!userDocSnap.exists()) {
          const nameFromEmail = firebaseUser.email ? firebaseUser.email.split('@')[0] : 'New User';
          try {
            await setDoc(userDocRef, {
              name: nameFromEmail,
              avatarUrl: `https://placehold.co/100x100.png?text=${nameFromEmail.charAt(0).toUpperCase()}`
            });
          } catch (error) {
            console.error("Failed to create user document for existing auth user:", error);
          }
        }
        
        unsubscribeDoc = onSnapshot(userDocRef, (doc) => {
          if (doc.exists()) {
            setUserData({ id: doc.id, ...doc.data() } as User);
          } else {
            setUserData(null);
          }
          setLoading(false);
        });

        setUser(firebaseUser);
      } else {
        setUser(null);
        setUserData(null);
        setLoading(false);
      }
    });

    return () => {
        unsubscribeAuth();
        unsubscribeDoc();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, userData, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
