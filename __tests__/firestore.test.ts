import { describe, it, expect } from "vitest";
import { sortShootsByDateDesc, type Shoot } from "@/lib/firestore";

describe("Firestore shoot sorting", () => {
  it("sorts shoots in descending order by date (YYYY-MM-DD)", () => {
    const unsortedShoots: Partial<Shoot>[] = [
      { id: "1", name: "Shoot 1", date: "2024-01-15" },
      { id: "2", name: "Shoot 2", date: "2024-12-31" },
      { id: "3", name: "Shoot 3", date: "2023-06-20" },
      { id: "4", name: "Shoot 4", date: "2024-08-10" },
    ];

    const sorted = sortShootsByDateDesc(unsortedShoots);

    expect(sorted.map((s) => s.id)).toEqual(["2", "4", "1", "3"]);
    expect(sorted.map((s) => s.date)).toEqual([
      "2024-12-31",
      "2024-08-10",
      "2024-01-15",
      "2023-06-20",
    ]);
  });

  it("handles empty arrays gracefully", () => {
    const sorted = sortShootsByDateDesc([]);
    expect(sorted).toEqual([]);
  });

  it("handles shoots with missing or empty date strings", () => {
    const shoots: Partial<Shoot>[] = [
      { id: "1", name: "No Date", date: "" },
      { id: "2", name: "Dated", date: "2024-05-01" },
      { id: "3", name: "Earlier", date: "2023-01-01" },
    ];

    const sorted = sortShootsByDateDesc(shoots);
    expect(sorted[0].id).toBe("2");
    expect(sorted[1].id).toBe("3");
    expect(sorted[2].id).toBe("1");
  });
});
