import ShootDetail from "@/components/ShootDetail";
import { getShoots } from "@/lib/firestore";

export async function generateStaticParams() {
  try {
    const shoots = await getShoots();
    const params = shoots.map((shoot) => ({ id: shoot.id }));
    if (!params.some((p) => p.id === "preview")) {
      params.push({ id: "preview" });
    }
    return params;
  } catch (err) {
    console.warn("Could not fetch shoots during static build:", err);
    return [{ id: "preview" }];
  }
}

export default function ShootPage() {
  return <ShootDetail />;
}
