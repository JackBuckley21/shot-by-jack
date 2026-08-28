import ShootDetail from "@/components/ShootDetail";

export function generateStaticParams() {
  // Required by Next.js static export: at least one entry must be returned
  return [{ id: "preview" }];
}

export default function ShootPage() {
  return <ShootDetail />;
}
