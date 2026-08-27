"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/useAuth";

const isMock =
  typeof process !== "undefined"
    ? !process.env.NEXT_PUBLIC_FIREBASE_API_KEY
    : true;

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isMock && !loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  if (isMock) return <>{children}</>;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-dvh">
        <span className="text-sm tracking-widest uppercase" style={{ color: "var(--muted-foreground)" }}>
          Loading…
        </span>
      </div>
    );
  }

  if (!user) return null;

  return <>{children}</>;
}
