"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronRight, LogOut, Settings, UserCircle, QrCode, Plus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";


export default function MePage() {
  const router = useRouter();
  const { userData, user } = useAuth();
  
  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  return (
    <div>
      <header className="sticky top-0 z-10 flex items-center justify-between border-b bg-background p-4">
        <h1 className="text-xl font-bold">میں</h1>
         <Button variant="ghost" size="icon" className="h-8 w-8">
            <Plus className="h-5 w-5" />
            <span className="sr-only">شامل کریں</span>
          </Button>
      </header>

      <div className="p-4 space-y-6">
        {userData && user ? (
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20 border">
              <AvatarImage src={userData.avatarUrl} alt={userData.name} data-ai-hint="profile person" />
              <AvatarFallback className="text-3xl">{userData.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="text-xl font-semibold">{userData.name}</p>
              <p className="text-muted-foreground break-all">اے ایم آئی کے گفتگو شناخت: {user.uid}</p>
            </div>
            <Link href="/qr" className="p-2 rounded-md hover:bg-muted">
              <QrCode className="h-6 w-6 text-muted-foreground" />
            </Link>
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
              <Link href="/me/edit" className="flex items-center p-4 transition-colors hover:bg-muted/50">
                <UserCircle className="h-6 w-6 text-accent mr-4" />
                <span className="flex-1 font-medium">پروفائل میں ترمیم کریں</span>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </Link>
              <Link href="/me/settings" className="flex items-center p-4 transition-colors hover:bg-muted/50">
                <Settings className="h-6 w-6 text-accent mr-4" />
                <span className="flex-1 font-medium">ترتیبات</span>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </Link>
            </div>
          </CardContent>
        </Card>
        
        <Button variant="destructive" className="w-full" onClick={handleLogout}>
          <LogOut className="h-4 w-4" />
          کھاتہ خروج
        </Button>
      </div>
    </div>
  );
}
