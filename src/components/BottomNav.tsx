"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, MessageSquare, Users, User } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/chats", icon: MessageSquare, label: "Chats" },
  { href: "/contacts", icon: Users, label: "Contacts" },
  { href: "/discover", icon: Compass, label: "Discover" },
  { href: "/me", icon: User, label: "Me" },
];

export default function BottomNav() {
  const pathname = usePathname();

  // Unread count logic removed as it requires a more complex real-time listener setup.
  // This can be added back as a future enhancement.

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-10 mx-auto max-w-2xl border-t bg-background">
      <nav className="flex items-center justify-around p-1">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          
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
              </div>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </footer>
  );
}
