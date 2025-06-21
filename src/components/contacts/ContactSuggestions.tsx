"use client";

import { useFormState, useFormStatus } from "react-dom";
import { suggestContacts } from "@/ai/flows/suggest-contacts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, Wand2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";

const initialState = {
  suggestedContacts: [],
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto">
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
      Suggest Contacts
    </Button>
  );
}

export default function ContactSuggestions() {
  const [state, formAction] = useFormState(suggestContacts, initialState);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Smart Contact Suggestions</CardTitle>
        <CardDescription>
          Let AI suggest new contacts based on your profile and communication patterns.
        </CardDescription>
      </CardHeader>
      <form action={formAction}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="profileInformation">Your Profile Information</Label>
            <Textarea
              id="profileInformation"
              name="profileInformation"
              placeholder="e.g., Software engineer at Acme Inc. Interested in AI and web development."
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="communicationPatterns">Your Communication Patterns</Label>
            <Textarea
              id="communicationPatterns"
              name="communicationPatterns"
              placeholder="e.g., Frequently chat with the design team and project managers. Often discuss project deadlines and feature implementations."
              required
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col-reverse sm:flex-row sm:justify-between items-center gap-4">
           <p className="text-sm text-muted-foreground">Powered by Genkit AI</p>
          <SubmitButton />
        </CardFooter>
      </form>
      
      {state.suggestedContacts && state.suggestedContacts.length > 0 && (
         <CardContent>
            <Alert>
              <Wand2 className="h-4 w-4" />
              <AlertTitle>Here are some suggestions!</AlertTitle>
              <AlertDescription>
                <ul className="mt-2 list-disc pl-5 space-y-1">
                  {state.suggestedContacts.map((contact, index) => (
                    <li key={index}>{contact}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
         </CardContent>
      )}
    </Card>
  );
}
