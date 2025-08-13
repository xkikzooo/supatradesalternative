import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/sidebar";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="relative flex min-h-screen">
      <Sidebar />
      <div className="flex-1 pl-52">
        <main className="flex-1 pl-8 pr-12 py-8">
          {children}
        </main>
      </div>
    </div>
  );
} 