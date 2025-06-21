import { Users, UserPlus } from "lucide-react";
import ContactSuggestions from "@/components/contacts/ContactSuggestions";
import { Button } from "@/components/ui/button";

export default function ContactsPage() {
  return (
    <div>
      <header className="sticky top-0 z-10 flex items-center justify-between border-b bg-background p-4">
        <h1 className="text-xl font-bold">Contacts</h1>
         <Button variant="ghost" size="icon" className="h-8 w-8">
            <UserPlus className="h-5 w-5" />
            <span className="sr-only">Add Contact</span>
          </Button>
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
