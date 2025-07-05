"use client";

import type { Message } from "@/lib/types";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { Copy, Trash2, Languages, Loader2 } from "lucide-react";

interface MessageBubbleProps {
    message: Message;
    onDelete: (messageId: string) => void;
    onTranslate: (messageId: string, text: string) => void;
    translation?: string;
    isTranslating: boolean;
}

export default function MessageBubble({ message, onDelete, onTranslate, translation, isTranslating }: MessageBubbleProps) {
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const isSentByMe = message.senderId === currentUser?.uid;

  const handleCopy = () => {
    if (message.isDeleted) return;
    navigator.clipboard.writeText(message.text);
    toast({
        title: 'کاپی ہو گیا',
        description: 'پیغام کلپ بورڈ پر کاپی کر لیا گیا ہے۔',
    });
  }

  const content = (
    <div
      className={cn(
        "max-w-xs rounded-lg px-4 py-2 lg:max-w-md",
        isSentByMe
          ? "rounded-br-none bg-primary text-primary-foreground"
          : "rounded-bl-none bg-card text-card-foreground border",
        message.isDeleted && "bg-muted text-muted-foreground italic"
      )}
    >
      <p className="text-base" style={{ wordBreak: 'break-word' }}>
          {message.text}
      </p>
      {translation && !message.isDeleted && (
          <div className="pt-2 mt-2 border-t border-white/20">
              <p className="text-sm opacity-90">{translation}</p>
          </div>
      )}
      {isTranslating && (
          <div className="pt-2 mt-2 flex items-center gap-2 text-sm opacity-90">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>ترجمہ کیا جا رہا ہے...</span>
          </div>
      )}
    </div>
  );

  if (message.isDeleted) {
     return (
        <div className={cn("flex items-end gap-2", isSentByMe ? "justify-end" : "justify-start")}>
            {content}
        </div>
     );
  }

  return (
    <DropdownMenu>
        <DropdownMenuTrigger asChild>
            <div className={cn("flex items-end gap-2 cursor-pointer", isSentByMe ? "justify-end" : "justify-start")}>
                {content}
            </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent align={isSentByMe ? "end" : "start"} className="w-56">
            <DropdownMenuItem onClick={handleCopy}>
                <Copy className="mr-2 h-4 w-4" />
                <span>کاپی کریں</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onTranslate(message.id, message.text)}>
                <Languages className="mr-2 h-4 w-4" />
                <span>انگریزی میں ترجمہ کریں</span>
            </DropdownMenuItem>
            {isSentByMe && (
                <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10" onClick={() => onDelete(message.id)}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    <span>سب کے لیے حذف کریں</span>
                </DropdownMenuItem>
            )}
        </DropdownMenuContent>
    </DropdownMenu>
  );
}
