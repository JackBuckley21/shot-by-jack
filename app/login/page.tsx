"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { useAuth } from "@/lib/useAuth";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await signIn(email, password);
      router.push("/admin");
    } catch {
      setError("Invalid credentials. Check your Firebase Authentication setup.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh flex items-center justify-center px-8">
      <motion.div
        className="w-full max-w-sm"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <p className="text-xs tracking-widest uppercase mb-2" style={{ color: "var(--accent)" }}>
          Admin
        </p>
        <h1
          className="text-4xl mb-10"
          style={{ fontFamily: "var(--font-serif)", color: "var(--foreground)" }}
        >
          Sign in
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label className="text-xs tracking-widest uppercase" style={{ color: "var(--muted-foreground)" }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 text-sm bg-transparent outline-none"
              style={{ border: "1px solid var(--border)", color: "var(--foreground)", borderRadius: "var(--radius)" }}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs tracking-widest uppercase" style={{ color: "var(--muted-foreground)" }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 text-sm bg-transparent outline-none"
              style={{ border: "1px solid var(--border)", color: "var(--foreground)", borderRadius: "var(--radius)" }}
            />
          </div>

          {error && (
            <p className="text-xs" style={{ color: "#e57373" }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 text-sm tracking-widest uppercase font-medium transition-opacity disabled:opacity-40 cursor-pointer mt-2"
            style={{
              backgroundColor: "var(--primary)",
              color: "var(--primary-foreground)",
              border: "none",
              borderRadius: "var(--radius)",
              fontFamily: "inherit",
            }}
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
