import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import ShootCard from "@/components/ShootCard";
import type { Shoot } from "@/lib/firestore";

describe("ShootCard component", () => {
  const mockShoot: Shoot = {
    id: "london-fog-2024",
    name: "London Fog & Street Lights",
    date: "2024-11-14",
    description: "Atmospheric evening stroll around Southbank.",
    coverUrl: "https://example.com/cover.webp",
    coverPath: "covers/cover.webp",
    imageCount: 18,
    createdAt: null,
  };

  it("renders shoot title, formatted date, image count, and link target", () => {
    render(<ShootCard shoot={mockShoot} index={0} />);

    expect(screen.getByText("London Fog & Street Lights")).toBeInTheDocument();
    expect(screen.getByText("2024-11-14")).toBeInTheDocument();
    expect(screen.getByText("18 images")).toBeInTheDocument();
    expect(screen.getByText("Atmospheric evening stroll around Southbank.")).toBeInTheDocument();

    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/shoot?id=london-fog-2024");
  });

  it("renders cover image with loading='lazy' and decoding='async' attributes", () => {
    render(<ShootCard shoot={mockShoot} index={0} />);

    const coverImage = screen.getByAltText("London Fog & Street Lights");
    expect(coverImage).toBeInTheDocument();
    expect(coverImage).toHaveAttribute("src", "https://example.com/cover.webp");
    expect(coverImage).toHaveAttribute("loading", "lazy");
    expect(coverImage).toHaveAttribute("decoding", "async");
  });

  it("renders fallback placeholder when coverUrl is missing", () => {
    const shootNoCover: Shoot = {
      ...mockShoot,
      id: "no-cover-shoot",
      coverUrl: "",
    };

    render(<ShootCard shoot={shootNoCover} index={1} />);
    expect(screen.getByText("No cover")).toBeInTheDocument();
  });
});
