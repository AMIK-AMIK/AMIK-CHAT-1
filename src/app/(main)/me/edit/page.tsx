"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChevronLeft, Loader2, RefreshCw } from "lucide-react";

const profileFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }).max(50),
  avatarUrl: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal('')),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function EditProfilePage() {
  const router = useRouter();
  const { userData, updateProfile, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: "",
      avatarUrl: "",
    },
  });

  const avatarUrl = form.watch("avatarUrl");
  const name = form.watch("name");

  useEffect(() => {
    if (userData) {
      form.reset({
        name: userData.name || "",
        avatarUrl: userData.avatarUrl || "",
      });
    }
  }, [userData, form]);

  async function onSubmit(data: ProfileFormValues) {
    setIsSubmitting(true);
    try {
      await updateProfile({ 
        name: data.name,
        // If avatarUrl is empty or not a valid URL (e.g., after clearing), generate a placeholder.
        avatarUrl: data.avatarUrl || `https://placehold.co/100x100.png?text=${data.name.charAt(0).toUpperCase()}`
      });
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
      router.push("/me");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: "Something went wrong while updating your profile.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }
  
  const generateNewAvatar = () => {
    const currentName = form.getValues("name") || 'A';
    // Add a timestamp to ensure the URL is unique and bypasses browser cache
    const newAvatar = `https://placehold.co/100x100.png?text=${currentName.charAt(0).toUpperCase()}&c=${Date.now()}`;
    form.setValue('avatarUrl', newAvatar, { shouldDirty: true });
  }

  if (authLoading) {
    return (
      <div className="p-4">
        <Card>
          <CardHeader>
            <CardTitle>Loading...</CardTitle>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <header className="sticky top-0 z-10 flex items-center gap-4 border-b bg-background p-3">
        <Link href="/me" className="p-1 rounded-md hover:bg-muted">
          <ChevronLeft className="h-6 w-6" />
        </Link>
        <h1 className="flex-1 truncate text-lg font-semibold">Edit Profile</h1>
      </header>

      <div className="p-4">
        <Card>
          <CardHeader>
            <CardTitle>Your Information</CardTitle>
            <CardDescription>Update your username and profile photo.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="flex flex-col items-center gap-4 pt-4">
                   <Avatar className="h-24 w-24 border">
                      <AvatarImage src={avatarUrl || ''} alt={name} data-ai-hint="profile person"/>
                      <AvatarFallback className="text-4xl">
                        {(name || 'A').charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  <Button type="button" variant="outline" onClick={generateNewAvatar}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Generate New Avatar
                  </Button>
                </div>

                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input placeholder="Your name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button type="submit" disabled={isSubmitting} className="w-full">
                  {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Save Changes
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
