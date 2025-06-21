"use client";

import { useRouter } from 'next/navigation';
import QRCode from 'react-qr-code';
import { useAuth } from '@/hooks/useAuth';
import { ChevronLeft, MoreHorizontal, MessageCircle } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';

export default function QrCodePage() {
  const router = useRouter();
  const { user, userData } = useAuth();

  const qrValue = user ? `amik-chat-user://${user.uid}` : '';

  return (
    <div className="flex h-screen flex-col bg-background">
      <header className="sticky top-0 z-10 flex items-center justify-between bg-background p-3">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <Button variant="ghost" size="icon">
          <MoreHorizontal className="h-6 w-6" />
        </Button>
      </header>

      <main className="flex flex-1 flex-col items-center justify-between p-8 text-center">
        <div className="flex-grow flex flex-col items-center justify-center space-y-6">
          {userData ? (
            <>
              <div className="flex items-center gap-4 self-start">
                <Avatar className="h-16 w-16 border">
                  <AvatarImage src={userData.avatarUrl} alt={userData.name} data-ai-hint="profile person" />
                  <AvatarFallback className="text-2xl">{userData.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-xl font-bold text-left">{userData.name}</p>
                  <p className="text-muted-foreground text-left">Pakistan</p> {/* Placeholder */}
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg shadow-md relative">
                  <QRCode
                    value={qrValue}
                    size={256}
                    fgColor="hsl(var(--primary))"
                    bgColor="#FFFFFF"
                    level="H"
                  />
                  <div className="absolute top-1/2 left-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 bg-white p-1 flex items-center justify-center rounded-md border shadow-md">
                    <MessageCircle className="h-10 w-10 text-primary" />
                  </div>
              </div>

              <p className="text-muted-foreground">Scan the QR code to add me as friend</p>
            </>
          ) : (
            <div className="space-y-6 flex flex-col items-center">
                <div className="flex items-center gap-4 self-start w-full">
                    <Skeleton className="h-16 w-16 rounded-full" />
                    <div className="space-y-2">
                       <Skeleton className="h-6 w-32" />
                       <Skeleton className="h-4 w-24" />
                    </div>
                </div>
                <Skeleton className="h-[288px] w-[288px] rounded-lg" />
                <Skeleton className="h-4 w-48" />
            </div>
          )}
        </div>

        <footer className="w-full max-w-sm pb-4">
          <div className="flex items-center justify-center space-x-2">
            <Button variant="link" className="text-muted-foreground hover:text-primary px-2" onClick={() => router.push('/scan')}>Scan</Button>
            <Separator orientation="vertical" className="h-4" />
            <Button variant="link" className="text-muted-foreground hover:text-primary px-2">Change Style</Button>
            <Separator orientation="vertical" className="h-4" />
            <Button variant="link" className="text-muted-foreground hover:text-primary px-2">Save Image</Button>
          </div>
        </footer>
      </main>
    </div>
  );
}
