"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronRight, LogOut, Settings, UserCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { currentUserId } from "@/lib/data";
import type { User } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";


export default function MePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const userDoc = await getDoc(doc(db, 'users', currentUserId));
      if (userDoc.exists()) {
        setUser({id: userDoc.id, ...userDoc.data()} as User);
      }
    }
    fetchUser();
  }, [])

  const handleLogout = () => {
    // In a real app, clear session/token here
    router.push('/login');
  };

  return (
    <div>
      <header className="sticky top-0 z-10 border-b bg-background p-4">
        <h1 className="text-xl font-bold">Me</h1>
      </header>

      <div className="p-4 space-y-6">
        {user ? (
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20 border">
              <AvatarImage src={user.avatarUrl} alt={user.name} data-ai-hint="profile person" />
              <AvatarFallback className="text-3xl">{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-xl font-semibold">{user.name}</p>
              <p className="text-muted-foreground">AMIK CHAT ID: {user.id}</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <Skeleton className="h-20 w-20 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-40" />
            </div>
          </div>
        )}

        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              <Link href="#" className="flex items-center p-4 transition-colors hover:bg-muted/50">
                <UserCircle className="mr-4 h-6 w-6 text-accent" />
                <span className="flex-1 font-medium">Edit Profile</span>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </Link>
              <Link href="#" className="flex items-center p-4 transition-colors hover:bg-muted/50">
                <Settings className="mr-4 h-6 w-6 text-accent" />
                <span className="flex-1 font-medium">Settings</span>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </Link>
            </div>
          </CardContent>
        </Card>
        
        <Button variant="destructive" className="w-full" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Log Out
        </Button>
      </div>
    </div>
  );
}
