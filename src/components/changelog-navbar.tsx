// @ts-nocheck
"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { Home, LogIn, LayoutGrid, LogOut } from "lucide-react";
import { toast } from "sonner";

const dropdownVariants = {
  hidden: { opacity: 0, scale: 0.95, y: -4 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.2, ease: "easeOut" } },
  exit: { opacity: 0, scale: 0.95, y: -4, transition: { duration: 0.15, ease: "easeIn" } },
};

const itemVariants = {
  hidden: { opacity: 0, x: -8 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { duration: 0.2, delay: i * 0.05 },
  }),
};

export default function ChangelogNavbar() {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { data: session } = useSession();
  const pathname = usePathname();

  // Close when clicking outside
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const signInHref = `/login?callbackUrl=${encodeURIComponent(pathname)}`;

  const navItems = session
    ? [
        { href: "/", label: "Home", icon: Home },
        { href: "/dashboard", label: "Dashboard", icon: LayoutGrid },
      ]
    : [
        { href: "/", label: "Home", icon: Home },
        { href: signInHref, label: "Sign up / Log in", icon: LogIn },
      ];

  const handleSignOut = async () => {
    setOpen(false);
    await signOut({ redirect: false });
    toast.success("Signed out successfully");
  };

  return (
    <div ref={containerRef} className="fixed top-0 left-0 z-50">
      {/* Clivy logo */}
      <div className="p-6 pb-4">
        <button
          onClick={() => setOpen(!open)}
          className="text-2xl font-bold hover:opacity-70 transition-opacity cursor-pointer"
        >
          Clivy
        </button>
      </div>

      {/* Small dropdown with nav links */}
      <AnimatePresence>
        {open && (
          <motion.div
            variants={dropdownVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="ml-6 bg-card border rounded-lg shadow-lg overflow-hidden origin-top-left"
          >
            <div className="p-2.5 space-y-1">
              {navItems.map(({ href, label, icon: Icon }, i) => (
                <motion.div
                  key={href}
                  custom={i}
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <Link
                    href={href}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 rounded-md text-base text-muted-foreground hover:text-foreground hover:bg-muted transition-colors whitespace-nowrap"
                  >
                    <Icon className="h-5 w-5" />
                    {label}
                  </Link>
                </motion.div>
              ))}

              {/* Sign out — separated with a divider */}
              {session && (
                <>
                  <div className="border-t mx-2 my-1" />
                  <motion.div
                    custom={navItems.length}
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    <button
                      onClick={handleSignOut}
                      className="flex items-center gap-3 px-4 py-2.5 rounded-md text-base text-muted-foreground hover:text-foreground hover:bg-muted transition-colors whitespace-nowrap w-full cursor-pointer"
                    >
                      <LogOut className="h-5 w-5" />
                      Sign out
                    </button>
                  </motion.div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
