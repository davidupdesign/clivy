"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { LayoutGrid, Settings, LogOut, Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Projects", icon: LayoutGrid },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export default function MobileSidebar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();

  // Close drawer on route change
const prevPathname = useRef(pathname);
useEffect(() => {
  if (prevPathname.current !== pathname) {
    setOpen(false);
    prevPathname.current = pathname;
  }
}, [pathname]);

  // Lock body scroll when open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  function isActive(href: string) {
    if (href === "/dashboard") {
      return pathname === "/dashboard" ||
        (pathname.startsWith("/dashboard/") && !pathname.startsWith("/dashboard/settings"));
    }
    return pathname.startsWith(href);
  }

  const initial = session?.user?.name?.charAt(0)?.toUpperCase() ?? "?";

  return (
    <>
      {/* Top bar — visible only on mobile */}
      <div className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between h-14 px-4 border-b bg-card md:hidden">
        <Link href="/dashboard" className="text-xl font-bold tracking-tight">
          Clivy
        </Link>
        <button
          onClick={() => setOpen(true)}
          className="p-2 -mr-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* Overlay + Drawer */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 bg-black/40 md:hidden"
              onClick={() => setOpen(false)}
            />
            {/* Drawer */}
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 400, damping: 35 }}
              className="fixed top-0 left-0 bottom-0 z-50 w-72 bg-card border-r flex flex-col md:hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b">
                <Link href="/dashboard" className="text-xl font-bold tracking-tight">
                  Clivy
                </Link>
                <button
                  onClick={() => setOpen(false)}
                  className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Nav */}
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

              {/* User */}
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
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}