
"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import type { Message } from "@/lib/types";
import { Copy, Forward, SmilePlus, Languages, Trash, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ChatMessageActionsProps {
  message: Message | null;
  isOpen: boolean;
  onClose: () => void;
  onDeleteForEveryone: (messageId: string) => void;
  onTranslate: (messageId: string, text: string) => void;
  onForward: () => void;
  onReact: () => void;
  onDeleteForMe: () => void;
}

export default function ChatMessageActions({
  message,
  isOpen,
  onClose,
  onDeleteForEveryone,
  onTranslate,
  onForward,
  onReact,
  onDeleteForMe
}: ChatMessageActionsProps) {
  const { user: currentUser } = useAuth();
  const { toast } = useToast();

  if (!message) return null;

  const isSentByMe = message.senderId === currentUser?.uid;

  const handleCopy = () => {
    if (message.isDeleted) return;
    navigator.clipboard.writeText(message.text);
    toast({
        title: 'کاپی ہو گیا',
        description: 'پیغام کلپ بورڈ پر کاپی کر لیا گیا ہے۔',
    });
    onClose();
  };
  
  const actions = [
    {
      label: "ردعمل دیں",
      icon: SmilePlus,
      onClick: onReact,
      show: !message.isDeleted,
    },
    {
      label: "کاپی کریں",
      icon: Copy,
      onClick: handleCopy,
      show: !message.isDeleted,
    },
    {
      label: "فارورڈ کریں",
      icon: Forward,
      onClick: onForward,
      show: !message.isDeleted,
    },
    {
      label: "ترجمہ کریں",
      icon: Languages,
      onClick: () => onTranslate(message.id, message.text),
      show: !message.isDeleted,
    },
    {
      label: "میرے لیے حذف کریں",
      icon: Trash,
      onClick: onDeleteForMe,
      show: true,
      className: "text-destructive focus:text-destructive"
    },
    {
      label: "سب کے لیے حذف کریں",
      icon: Trash2,
      onClick: () => onDeleteForEveryone(message.id),
      show: isSentByMe,
      className: "text-destructive focus:text-destructive"
    }
  ];

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="bottom" className="rounded-t-lg">
        <SheetHeader className="pb-4">
          <SheetTitle className="text-center">اختیارات</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col gap-1">
            {actions.map((action, index) => (
                action.show && (
                    <Button
                        key={index}
                        variant="ghost"
                        className={`justify-start p-4 text-base ${action.className || ''}`}
                        onClick={action.onClick}
                    >
                        <action.icon className="mr-4 h-5 w-5" />
                        <span>{action.label}</span>
                    </Button>
                )
            ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}
