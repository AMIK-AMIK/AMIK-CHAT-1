import BottomNav from "@/components/BottomNav";

export default function MainAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto flex h-screen max-w-2xl flex-col bg-background">
      <main className="flex-1 overflow-y-auto pb-20">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
