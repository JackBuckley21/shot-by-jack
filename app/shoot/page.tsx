"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import ShootDetail from "@/components/ShootDetail";

function ShootContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id") || "";
  return <ShootDetail shootId={id} />;
}

export default function ShootPage() {
  return (
    <Suspense>
      <ShootContent />
    </Suspense>
  );
}
