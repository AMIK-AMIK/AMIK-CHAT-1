"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageCircle, Users, User } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/chats", icon: MessageCircle, label: "Chats" },
  { href: "/contacts", icon: Users, label: "Contacts" },
  { href: "/me", icon: User, label: "Me" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-10 mx-auto max-w-2xl border-t bg-card/95 backdrop-blur-sm">
      <nav className="flex items-center justify-around p-2">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 rounded-md px-4 py-2 text-sm font-medium transition-colors",
                isActive ? "text-primary" : "text-muted-foreground hover:text-primary"
              )}
            >
              <item.icon className="h-6 w-6" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </footer>
  );
}
