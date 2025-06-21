import { Users } from "lucide-react";
import ContactSuggestions from "@/components/contacts/ContactSuggestions";

export default function ContactsPage() {
  return (
    <div>
      <header className="sticky top-0 z-10 border-b bg-background p-4">
        <h1 className="text-xl font-bold">Contacts</h1>
      </header>

      <div className="p-4">
        <ContactSuggestions />
      </div>

      <div className="border-t">
        <h2 className="p-4 text-sm font-semibold text-muted-foreground">My Contacts</h2>
        <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
          <Users className="h-16 w-16 mb-4" />
          <h3 className="text-lg font-semibold">Contacts coming soon</h3>
          <p className="text-sm">This feature is currently under development.</p>
        </div>
      </div>
    </div>
  );
}
