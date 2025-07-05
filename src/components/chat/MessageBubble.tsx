
"use client";

import type { Message } from "@/lib/types";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { Popover, PopoverTrigger } from "@/components/ui/popover";
import ChatMessageActions from './ChatMessageActions';

interface MessageBubbleProps {
    message: Message;
    translation?: string;
    isTranslating: boolean;
    onDeleteForEveryone: (messageId: string) => void;
    onTranslate: (messageId: string, text: string) => void;
    onForward: () => void;
    onReact: () => void;
    onDeleteForMe: () => void;
    onCopy: (text: string) => void;
}

export default function MessageBubble({ message, translation, isTranslating, ...handlers }: MessageBubbleProps) {
  const { user: currentUser } = useAuth();
  const isSentByMe = message.senderId === currentUser?.uid;

  return (
    <div className={cn("flex items-end gap-2", isSentByMe ? "justify-end" : "justify-start")}>
      <Popover>
        <PopoverTrigger asChild>
          <div
            className={cn(
              "max-w-sm rounded-lg px-4 py-2 lg:max-w-lg cursor-pointer",
              isSentByMe
                ? "rounded-br-none bg-primary text-primary-foreground"
                : "rounded-bl-none bg-card text-card-foreground border",
              message.isDeleted && "bg-muted text-muted-foreground italic"
            )}
            onContextMenu={(e) => e.preventDefault()}
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
        </PopoverTrigger>
        <ChatMessageActions message={message} {...handlers} />
      </Popover>
    </div>
  );
}
