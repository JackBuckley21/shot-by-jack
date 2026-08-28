"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/useAuth";

export default function Nav() {
  const { user, signOut } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  return (
    <header className="relative w-full z-40 flex items-center justify-between px-8 py-6">
      <Link
        href="/"
        className="font-serif text-xl tracking-tight"
        style={{ fontFamily: "var(--font-serif)", color: "var(--foreground)" }}
      >
        Shot By Jack
      </Link>
      <nav
        className="flex items-center gap-6 text-sm font-light tracking-widest uppercase"
        style={{ color: "var(--muted-foreground)" }}
      >
        {user ? (
          <>
            <Link
              href="/admin"
              className="transition-colors hover:opacity-100"
              style={{ color: pathname === "/admin" ? "var(--foreground)" : "inherit" }}
            >
              Admin
            </Link>
            <button
              onClick={handleSignOut}
              className="transition-colors cursor-pointer"
              style={{ color: "inherit", background: "none", border: "none", font: "inherit" }}
            >
              Sign out
            </button>
          </>
        ) : (
          <Link
            href="/login"
            className="transition-colors hover:opacity-80"
            style={{ color: "inherit" }}
          >
            Admin
          </Link>
        )}
      </nav>
    </header>
  );
}
