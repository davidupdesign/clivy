// @ts-nocheck
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { LayoutGrid, Settings, LogOut } from "lucide-react";

// Navigation items — easy to extend later
const NAV_ITEMS = [
  { href: "/dashboard", label: "Projects", icon: LayoutGrid },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  function isActive(href: string) {
    if (href === "/dashboard") {
      return pathname === "/dashboard" ||
        (pathname.startsWith("/dashboard/") && !pathname.startsWith("/dashboard/settings"));
    }
    return pathname.startsWith(href);
  }

  const initial = session?.user?.name?.charAt(0)?.toUpperCase() ?? "?";

  return (
    <aside className="fixed top-0 left-0 h-screen w-64 border-r bg-card flex flex-col">
      {/* Logo */}
      <div className="px-7 py-6 border-b">
        <Link href="/dashboard" className="text-2xl font-bold tracking-tight">
          Clivy
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 pt-6">
        <p className="px-3 mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Menu
        </p>
        <div className="space-y-1">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-3 rounded-lg text-base transition-colors ${
                isActive(href)
                  ? "bg-accent text-foreground font-medium border-l-2 border-foreground"
                  : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
              }`}
            >
              <Icon className="h-5 w-5" />
              {label}
            </Link>
          ))}
        </div>
      </nav>

      {/* User section at bottom */}
      <div className="border-t px-5 py-5 flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-base font-medium shrink-0">
          {initial}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-base font-medium truncate">
            {session?.user?.name ?? "User"}
          </p>
          {session?.user?.email && (
            <p className="text-sm text-muted-foreground truncate">
              {session.user.email}
            </p>
          )}
        </div>

        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          title="Sign out"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </div>
    </aside>
  );
}
