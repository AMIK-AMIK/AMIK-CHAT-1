
"use client";

import type { Message } from "@/lib/types";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { Loader2, CornerUpRight } from "lucide-react";
import { Popover, PopoverTrigger } from "@/components/ui/popover";
import ChatMessageActions from './ChatMessageActions';

interface MessageBubbleProps {
    message: Message;
    translation?: string;
    isTranslating: boolean;
    onDeleteForEveryone: (messageId: string) => void;
    onTranslate: (messageId: string, text: string) => void;
    onForward: (message: Message) => void;
    onReact: (messageId: string, emoji: string) => void;
    onDeleteForMe: () => void;
    onCopy: (text: string) => void;
}

export default function MessageBubble({ message, translation, isTranslating, ...handlers }: MessageBubbleProps) {
  const { user: currentUser } = useAuth();
  const isSentByMe = message.senderId === currentUser?.uid;

  const hasReactions = message.reactions && Object.values(message.reactions).some(uids => uids.length > 0);

  return (
    <div className={cn("flex flex-col", isSentByMe ? "items-end" : "items-start")}>
      <Popover>
        <PopoverTrigger asChild>
          <div
            className={cn(
              "group relative max-w-sm rounded-lg px-3 py-2 lg:max-w-lg cursor-pointer",
              isSentByMe
                ? "rounded-br-none bg-primary text-primary-foreground"
                : "rounded-bl-none bg-card text-card-foreground border",
              message.isDeleted && "bg-muted text-muted-foreground italic",
              hasReactions && "pb-5"
            )}
            onContextMenu={(e) => e.preventDefault()}
          >
            {message.isForwarded && !message.isDeleted && (
              <div className="flex items-center gap-1 text-xs opacity-70 mb-1">
                  <CornerUpRight className="h-3 w-3" />
                  <span>فارورڈ شدہ</span>
              </div>
            )}
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
            {hasReactions && (
              <div className={cn("absolute -bottom-3 flex items-center gap-0.5 z-10", isSentByMe ? "right-2" : "left-2")}>
                  {Object.entries(message.reactions!).map(([emoji, uids]) => (
                      uids.length > 0 && (
                          <div key={emoji} className="flex items-center bg-background border rounded-full px-1.5 py-0.5 shadow-sm text-xs">
                              <span>{emoji}</span>
                              {uids.length > 1 && <span className="ml-1 text-muted-foreground">{uids.length}</span>}
                          </div>
                      )
                  ))}
              </div>
            )}
          </div>
        </PopoverTrigger>
        <ChatMessageActions message={message} {...handlers} />
      </Popover>
    </div>
  );
}
