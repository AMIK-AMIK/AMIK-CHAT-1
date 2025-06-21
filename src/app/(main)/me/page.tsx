"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { currentUser } from "@/lib/data";
import { ChevronRight, LogOut, Settings, UserCircle } from "lucide-react";

export default function MePage() {
  const router = useRouter();

  const handleLogout = () => {
    // In a real app, clear session/token here
    router.push('/login');
  };

  return (
    <div>
      <header className="sticky top-0 z-10 border-b bg-background/80 p-4 backdrop-blur-sm">
        <h1 className="text-xl font-bold">Me</h1>
      </header>

      <div className="p-4 space-y-6">
        <div className="flex items-center gap-4">
          <Avatar className="h-20 w-20 border">
            <AvatarImage src={currentUser.avatarUrl} alt={currentUser.name} data-ai-hint="profile person" />
            <AvatarFallback className="text-3xl">{currentUser.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-xl font-semibold">{currentUser.name}</p>
            <p className="text-muted-foreground">ChatSnap ID: {currentUser.id}</p>
          </div>
        </div>

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
