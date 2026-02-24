// @ts-nocheck

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import Sidebar from "@/components/sidebar";

import MobileSidebar from "@/components/mobile-sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }


  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <MobileSidebar />
      <main className="flex-1 md:ml-64 p-5 pt-19 md:p-10 md:pt-10">
        <div className="max-w-6xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
