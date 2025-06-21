import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { contacts } from "@/lib/data";
import ContactSuggestions from "@/components/contacts/ContactSuggestions";
import type { User } from "@/lib/types";

function ContactItem({ contact }: { contact: User }) {
  return (
    <div className="flex items-center gap-4 p-4">
      <Avatar className="h-12 w-12 border">
        <AvatarImage src={contact.avatarUrl} alt={contact.name} data-ai-hint="person avatar" />
        <AvatarFallback>{contact.name.charAt(0)}</AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <p className="font-semibold">{contact.name}</p>
      </div>
    </div>
  );
}

export default function ContactsPage() {
  return (
    <div>
      <header className="sticky top-0 z-10 border-b bg-background/80 p-4 backdrop-blur-sm">
        <h1 className="text-xl font-bold">Contacts</h1>
      </header>

      <div className="p-4">
        <ContactSuggestions />
      </div>

      <div className="border-t">
        <h2 className="p-4 text-sm font-semibold text-muted-foreground">My Contacts ({contacts.length})</h2>
        <div className="divide-y">
          {contacts.map(contact => (
            <ContactItem key={contact.id} contact={contact} />
          ))}
        </div>
      </div>
    </div>
  );
}
