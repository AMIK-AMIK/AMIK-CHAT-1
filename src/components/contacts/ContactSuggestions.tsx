"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
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
      رابطے تجویز کریں
    </Button>
  );
}

export default function ContactSuggestions() {
  const [state, formAction] = useActionState(suggestContacts, initialState);

  return (
    <Card>
      <CardHeader>
        <CardTitle>اسمارٹ رابطے کی تجاویز</CardTitle>
        <CardDescription>
          AI کو اپنی پروفائل اور مواصلاتی نمونوں کی بنیاد پر نئے رابطے تجویز کرنے دیں۔
        </CardDescription>
      </CardHeader>
      <form action={formAction}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="profileInformation">آپ کی پروفائل کی معلومات</Label>
            <Textarea
              id="profileInformation"
              name="profileInformation"
              placeholder="مثال کے طور پر، Acme Inc. میں سافٹ ویئر انجینئر۔ AI اور ویب ڈویلپمنٹ میں دلچسپی۔"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="communicationPatterns">آپ کے مواصلاتی نمونے</Label>
            <Textarea
              id="communicationPatterns"
              name="communicationPatterns"
              placeholder="مثال کے طور پر، ڈیزائن ٹیم اور پروجیکٹ مینیجرز کے ساتھ اکثر چیٹ کریں۔ اکثر پروجیکٹ کی آخری تاریخوں اور فیچر کے نفاذ پر تبادلہ خیال کریں۔"
              required
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col-reverse sm:flex-row sm:justify-between items-center gap-4">
           <p className="text-sm text-muted-foreground">جینیٹک اے آئی سے تقویت یافتہ</p>
          <SubmitButton />
        </CardFooter>
      </form>
      
      {state.suggestedContacts && state.suggestedContacts.length > 0 && (
         <CardContent>
            <Alert>
              <Wand2 className="h-4 w-4" />
              <AlertTitle>یہاں کچھ تجاویز ہیں!</AlertTitle>
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
