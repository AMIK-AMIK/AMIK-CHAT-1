import type { Message } from "@/lib/types";
import { currentUser } from "@/lib/data";
import { cn } from "@/lib/utils";

export default function MessageBubble({ message }: { message: Message }) {
  const isSentByMe = message.senderId === currentUser.id;

  return (
    <div className={cn("flex items-end gap-2", isSentByMe ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-xs rounded-lg px-4 py-2 lg:max-w-md",
          isSentByMe
            ? "rounded-br-none bg-primary text-primary-foreground"
            : "rounded-bl-none bg-card text-card-foreground border"
        )}
      >
        <p className="text-base" style={{ wordBreak: 'break-word' }}>{message.text}</p>
      </div>
    </div>
  );
}
