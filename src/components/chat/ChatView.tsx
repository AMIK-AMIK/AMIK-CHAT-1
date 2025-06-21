"use client";

import { useState, useRef, useEffect } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Chat, Message } from "@/lib/types";
import { currentUser } from "@/lib/data";
import { SendHorizonal } from "lucide-react";
import MessageBubble from "./MessageBubble";
import { Label } from "@/components/ui/label";

export default function ChatView({ chat }: { chat: Chat }) {
  const [messages, setMessages] = useState<Message[]>(chat.messages);
  const [newMessage, setNewMessage] = useState("");
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight;
      }
    }
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() === "") return;
    
    const message: Message = {
      id: `msg-${Date.now()}`,
      text: newMessage,
      timestamp: format(new Date(), 'p'),
      senderId: currentUser.id,
      isRead: true,
    };

    setMessages([...messages, message]);
    setNewMessage("");
  };

  return (
    <div className="flex h-full flex-col">
      <ScrollArea className="flex-1" ref={scrollAreaRef}>
        <div className="space-y-4 p-4">
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
        </div>
      </ScrollArea>
      <div className="border-t bg-background p-4">
        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          <Label htmlFor="message-input" className="sr-only">
            Type a message
          </Label>
          <Input
            id="message-input"
            name="message-input"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            autoComplete="off"
            className="text-base"
          />
          <Button type="submit" size="icon" disabled={!newMessage.trim()}>
            <SendHorizonal className="h-5 w-5" />
            <span className="sr-only">Send</span>
          </Button>
        </form>
      </div>
    </div>
  );
}
