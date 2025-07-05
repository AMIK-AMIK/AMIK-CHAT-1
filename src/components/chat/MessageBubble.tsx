
"use client";

import type { Message } from "@/lib/types";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface MessageBubbleProps {
    message: Message;
    onShowActions: (message: Message) => void;
    translation?: string;
    isTranslating: boolean;
}

export default function MessageBubble({ message, onShowActions, translation, isTranslating }: MessageBubbleProps) {
  const { user: currentUser } = useAuth();
  const isSentByMe = message.senderId === currentUser?.uid;

  return (
    <div className={cn("flex items-end gap-2", isSentByMe ? "justify-end" : "justify-start")}>
      <div 
        className="cursor-pointer" 
        onClick={() => onShowActions(message)}
      >
        <div
          className={cn(
            "max-w-sm rounded-lg px-4 py-2 lg:max-w-lg",
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
              <div className="pt-2 mt-2 border-t border-primary-foreground/20 dark:border-primary-foreground/10">
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
      </div>
    </div>
  );
}
