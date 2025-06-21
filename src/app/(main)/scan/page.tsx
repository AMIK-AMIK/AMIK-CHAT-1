"use client";

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ChevronLeft, VideoOff, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';
import { Html5Qrcode, Html5QrcodeScannerState } from 'html5-qrcode';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function ScanPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const readerRef = useRef<HTMLDivElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!readerRef.current || scannerRef.current) return;

    const qrScanner = new Html5Qrcode(readerRef.current.id);
    scannerRef.current = qrScanner;

    const startScanning = async () => {
      try {
        await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        setHasCameraPermission(true);

        if (qrScanner.getState() === Html5QrcodeScannerState.SCANNING) {
            return;
        }

        qrScanner.start(
          { facingMode: 'environment' },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            rememberLastUsedCamera: true,
          },
          (decodedText, _decodedResult) => {
            if (!isProcessing) {
                handleScannedCode(decodedText);
            }
          },
          (errorMessage) => {
            // parse error, ignore it.
          }
        ).then(() => {
            setIsScanning(true);
        }).catch(err => {
            console.error("Scanner start error:", err);
            setHasCameraPermission(false);
            toast({ variant: 'destructive', title: 'Scanner Error', description: 'Could not start the camera scanner.' });
        });

      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
      }
    };
    
    startScanning();

    return () => {
      const qrScanner = scannerRef.current;
      if (qrScanner && qrScanner.getState() === Html5QrcodeScannerState.SCANNING) {
        qrScanner.stop().catch(err => console.error("Error stopping scanner:", err));
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [readerRef, isProcessing]);


  const handleScannedCode = async (code: string) => {
    if (!currentUser) return;

    setIsProcessing(true);
    if (scannerRef.current?.isScanning) {
        scannerRef.current.stop();
    }
    
    if (!code.startsWith('amik-chat-user://')) {
      toast({
        variant: 'destructive',
        title: 'Invalid QR Code',
        description: 'This is not a valid AMIK CHAT QR code.',
      });
      router.push('/chats');
      return;
    }

    const contactId = code.replace('amik-chat-user://', '');

    if (contactId === currentUser.uid) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: "You cannot add yourself as a contact.",
      });
      router.push('/chats');
      return;
    }

    try {
      const userDocRef = doc(db, 'users', contactId);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        toast({ variant: 'destructive', title: 'Error', description: 'User not found.' });
        router.push('/chats');
        return;
      }
      
      const contactRef = doc(db, 'users', currentUser.uid, 'contacts', contactId);
      await setDoc(contactRef, { addedAt: new Date() });

      const currentUserAsContactRef = doc(db, 'users', contactId, 'contacts', currentUser.uid);
      await setDoc(currentUserAsContactRef, { addedAt: new Date() });

      toast({
        title: 'Success!',
        description: `${userDoc.data().name} has been added to your contacts.`,
      });
      router.push('/contacts');
    } catch (error) {
      console.error("Error adding contact from QR code:", error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Something went wrong. Please try again.',
      });
      router.push('/chats');
    } finally {
        setIsProcessing(false);
    }
  };

  return (
    <div className="flex h-screen flex-col bg-black">
      <header className="sticky top-0 z-10 flex items-center gap-4 border-b border-zinc-800 bg-black p-3 text-white">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="hover:bg-zinc-800">
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <h1 className="flex-1 truncate text-lg font-semibold text-center">Scan</h1>
        <div className="w-10"></div>
      </header>
      <main className="flex-1 flex flex-col items-center justify-center p-4 relative">
        <div id="qr-reader" ref={readerRef} className="w-full max-w-sm aspect-square"></div>
        
        {hasCameraPermission === false && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 text-white p-4 text-center">
            <VideoOff className="h-16 w-16 mb-4" />
            <Alert variant="destructive" className="bg-transparent border-red-500 text-white">
                <AlertTitle>Camera Access Denied</AlertTitle>
                <AlertDescription>
                    Please enable camera permissions in your browser settings to scan QR codes.
                </AlertDescription>
            </Alert>
          </div>
        )}

        {isProcessing && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-white">
            <Loader2 className="h-16 w-16 animate-spin mb-4" />
            <p>Adding contact...</p>
          </div>
        )}
        
        {!isProcessing && <p className="mt-4 text-center text-white">
          {isScanning ? 'Place a QR code inside the frame to scan it.' : 'Initializing scanner...'}
        </p>}
      </main>
    </div>
  );
}
