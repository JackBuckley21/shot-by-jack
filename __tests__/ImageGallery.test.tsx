import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ImageGallery from "@/components/ImageGallery";
import type { ShootImage } from "@/lib/firestore";

vi.mock("motion/react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("motion/react")>();
  return {
    ...actual,
    AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  };
});

describe("ImageGallery component", () => {
  const mockImages: ShootImage[] = [
    {
      id: "img-1",
      url: "https://example.com/photo1.jpg",
      name: "DSC01234.JPG",
      order: 0,
      path: "shoots/1/photo1.jpg",
      meta: {
        camera: "ILCE-6400",
        lens: "E 35mm F1.8 OSS",
        shutterSpeed: "1/500s",
        aperture: "f/2.8",
        iso: "ISO 200",
        focalLength: "35mm",
      },
      createdAt: null,
    },
    {
      id: "img-2",
      url: "https://example.com/photo2.jpg",
      name: "DSC01235.JPG",
      order: 1,
      path: "shoots/1/photo2.jpg",
      meta: {
        camera: "ILCE-6400",
        lens: "Sigma 18-50mm F2.8",
        shutterSpeed: "1/250s",
        aperture: "f/4.0",
        iso: "ISO 400",
      },
      createdAt: null,
    },
    {
      id: "img-3",
      url: "https://example.com/photo3.jpg",
      name: "DSC01236.JPG",
      order: 2,
      path: "shoots/1/photo3.jpg",
      createdAt: null,
    },
  ];

  it("renders empty state when no images are provided", () => {
    render(<ImageGallery images={[]} />);
    expect(screen.getByText("No images yet")).toBeInTheDocument();
  });

  it("renders the image grid with all thumbnail items", () => {
    render(<ImageGallery images={mockImages} />);

    expect(screen.getByAltText("DSC01234.JPG")).toBeInTheDocument();
    expect(screen.getByAltText("DSC01235.JPG")).toBeInTheDocument();
    expect(screen.getByAltText("DSC01236.JPG")).toBeInTheDocument();
  });

  it("opens the modal on image thumbnail click", () => {
    render(<ImageGallery images={mockImages} />);

    const firstThumb = screen.getByAltText("DSC01234.JPG");
    fireEvent.click(firstThumb);

    expect(screen.getByText("1 / 3")).toBeInTheDocument();
    expect(screen.getByText("Close ✕")).toBeInTheDocument();
  });

  it("supports keyboard navigation with ArrowRight, ArrowLeft, and Escape", async () => {
    render(<ImageGallery images={mockImages} />);

    // Open first image
    fireEvent.click(screen.getByAltText("DSC01234.JPG"));
    expect(screen.getByText("1 / 3")).toBeInTheDocument();

    // Navigate next
    fireEvent.keyDown(window, { key: "ArrowRight" });
    expect(screen.getByText("2 / 3")).toBeInTheDocument();

    // Navigate previous
    fireEvent.keyDown(window, { key: "ArrowLeft" });
    expect(screen.getByText("1 / 3")).toBeInTheDocument();

    // Close on Escape
    fireEvent.keyDown(window, { key: "Escape" });
    await waitFor(() => {
      expect(screen.queryByText("Close ✕")).not.toBeInTheDocument();
    });
  });

  it("handles on-screen navigation arrow buttons", () => {
    render(<ImageGallery images={mockImages} />);

    // Open first image modal
    fireEvent.click(screen.getByAltText("DSC01234.JPG"));
    expect(screen.getByText("1 / 3")).toBeInTheDocument();

    const nextBtn = screen.getByRole("button", { name: "Next image" });
    const prevBtn = screen.getByRole("button", { name: "Previous image" });

    fireEvent.click(nextBtn);
    expect(screen.getByText("2 / 3")).toBeInTheDocument();

    fireEvent.click(prevBtn);
    expect(screen.getByText("1 / 3")).toBeInTheDocument();
  });

  it("renders EXIF metadata overlay correctly", () => {
    render(<ImageGallery images={mockImages} />);

    // Open first image with complete EXIF
    fireEvent.click(screen.getByAltText("DSC01234.JPG"));

    expect(screen.getByText("ILCE-6400")).toBeInTheDocument();
    expect(screen.getByText("E 35mm F1.8 OSS")).toBeInTheDocument();
    expect(screen.getByText("1/500s")).toBeInTheDocument();
    expect(screen.getByText("f/2.8")).toBeInTheDocument();
    expect(screen.getByText("ISO 200")).toBeInTheDocument();
    expect(screen.getByText("35mm")).toBeInTheDocument();
  });

  it("renders 'No EXIF metadata' when image lacks EXIF data", () => {
    render(<ImageGallery images={mockImages} />);

    // Open third image without EXIF
    fireEvent.click(screen.getByAltText("DSC01236.JPG"));

    expect(screen.getByText("No EXIF metadata")).toBeInTheDocument();
  });
});
