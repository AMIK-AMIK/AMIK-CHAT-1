"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, MessageSquare, Users, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { chats, currentUser } from "@/lib/data";

const navItems = [
  { href: "/chats", icon: MessageSquare, label: "Chats" },
  { href: "/contacts", icon: Users, label: "Contacts" },
  { href: "/discover", icon: Compass, label: "Discover" },
  { href: "/me", icon: User, label: "Me" },
];

export default function BottomNav() {
  const pathname = usePathname();
  const unreadChatsCount = chats.filter(c => c.messages.some(m => !m.isRead && m.senderId !== currentUser.id)).length;

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-10 mx-auto max-w-2xl border-t bg-background">
      <nav className="flex items-center justify-around p-1">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const isChats = item.href === "/chats";
          const badgeCount = isChats ? unreadChatsCount : 0;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 rounded-md px-4 py-1 text-xs font-medium transition-colors w-1/4",
                isActive ? "text-primary" : "text-muted-foreground hover:text-primary"
              )}
            >
              <div className="relative">
                <item.icon className="h-7 w-7" />
                {badgeCount > 0 && (
                  <span className="absolute -top-1 -right-2 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-destructive p-0.5 text-xs text-destructive-foreground">
                    {badgeCount}
                  </span>
                )}
              </div>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </footer>
  );
}
