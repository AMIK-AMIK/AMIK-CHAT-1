
"use client";

import * as React from 'react';
import { PopoverContent } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import type { Message } from "@/lib/types";
import { Copy, Forward, SmilePlus, Languages, Trash, Trash2, Plus } from "lucide-react";

interface ChatMessageActionsProps {
  message: Message;
  onDeleteForEveryone: (messageId: string) => void;
  onTranslate: (messageId: string, text: string) => void;
  onForward: () => void;
  onReact: () => void;
  onDeleteForMe: () => void;
  onCopy: (text: string) => void;
}

export default function ChatMessageActions({
  message,
  onDeleteForEveryone,
  onTranslate,
  onForward,
  onReact,
  onDeleteForMe,
  onCopy
}: ChatMessageActionsProps) {
  const { user: currentUser } = useAuth();
  const [popoverOpen, setPopoverOpen] = React.useState(false);

  if (!message) return null;

  const isSentByMe = message.senderId === currentUser?.uid;

  const reactions = ["👍", "❤️", "😂", "😯", "😢", "🙏"];

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
      onClick: () => onCopy(message.text),
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
      className: "text-destructive hover:text-destructive focus:text-destructive"
    },
    {
      label: "سب کے لیے حذف کریں",
      icon: Trash2,
      onClick: () => onDeleteForEveryone(message.id),
      show: isSentByMe,
      className: "text-destructive hover:text-destructive focus:text-destructive"
    }
  ];

  const handleActionClick = (action: () => void) => {
    action();
    // find a way to close the popover
  };

  return (
    <PopoverContent className="w-60 p-1" side={isSentByMe ? "left" : "right"} align="center">
        <div className="flex items-center justify-between p-1 mb-1 border-b">
            {reactions.map((r, i) => (
                <Button key={i} variant="ghost" size="icon" className="h-8 w-8 text-xl" onClick={onReact}>{r}</Button>
            ))}
             <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onReact}>
                <Plus className="h-5 w-5" />
            </Button>
        </div>
        <div className="flex flex-col gap-0.5">
            {actions.map((action, index) => (
                action.show && (
                    <Button
                        key={index}
                        variant="ghost"
                        className={`justify-start px-2 py-1.5 h-auto text-base ${action.className || ''}`}
                        onClick={() => handleActionClick(action.onClick)}
                    >
                        <action.icon className="mr-3 h-5 w-5" />
                        <span>{action.label}</span>
                    </Button>
                )
            ))}
        </div>
    </PopoverContent>
  );
}
