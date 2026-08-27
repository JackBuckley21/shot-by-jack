import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-dvh flex items-center justify-center">
      <div className="text-center">
        <p className="text-xs tracking-widest uppercase mb-4" style={{ color: "var(--accent)" }}>
          404
        </p>
        <h1
          className="text-6xl mb-8"
          style={{ fontFamily: "var(--font-serif)", color: "var(--foreground)" }}
        >
          Not found
        </h1>
        <Link href="/" className="text-xs tracking-widest uppercase" style={{ color: "var(--muted-foreground)" }}>
          ← Back to archive
        </Link>
      </div>
    </div>
  );
}
