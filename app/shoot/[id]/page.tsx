"use client";

import { use } from "react";
import ShootDetail from "@/components/ShootDetail";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ShootPage({ params }: PageProps) {
  const { id } = use(params);
  return <ShootDetail shootId={id} />;
}
