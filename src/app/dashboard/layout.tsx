// @ts-nocheck

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";

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
      {/* sidebar */}
      <aside className="w-64 border-r bg-muted/40 p-6">
        <h2 className="text-xl font-bold mb-8">Clivy</h2>
        <nav className="space-y-2">
          <a
            href="/dashboard"
            className="block px-3 py-2 rounded-md text-sm hover:bg-muted"
          >
            Projects
          </a>
          <a
            href="/dashboard/settings"
            className="block px-3 py-2 rounded-md text-sm hover:bg-muted"
          >
            Settings
          </a>
        </nav>
      </aside>

      {/* content */}
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
