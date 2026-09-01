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

  it("handles double-tap gesture to toggle quick-zoom between 1x and 2.5x", () => {
    render(<ImageGallery images={mockImages} />);

    // Open first image
    const thumbnails = screen.getAllByAltText("DSC01234.JPG");
    fireEvent.click(thumbnails[0]);

    // Reset Zoom button should not be present at 1x
    expect(screen.queryByText("Reset Zoom [1x]")).not.toBeInTheDocument();

    const imagesWithAlt = screen.getAllByAltText("DSC01234.JPG");
    const modalImg = imagesWithAlt[1];
    const slide = modalImg.closest("div[class*='cursor-grab']");
    expect(slide).toBeTruthy();

    // First tap
    fireEvent.touchStart(slide!, {
      touches: [{ clientX: 100, clientY: 100 }],
    });
    fireEvent.touchEnd(slide!, { touches: [] });

    // Second tap within 300ms at close coordinates
    fireEvent.touchStart(slide!, {
      touches: [{ clientX: 102, clientY: 101 }],
    });
    fireEvent.touchEnd(slide!, { touches: [] });

    // Should now be zoomed in to 2.5x, revealing the "Reset Zoom [1x]" button
    expect(screen.getByText("Reset Zoom [1x]")).toBeInTheDocument();

    // Another double tap toggles zoom back to 1x
    fireEvent.touchStart(slide!, {
      touches: [{ clientX: 100, clientY: 100 }],
    });
    fireEvent.touchEnd(slide!, { touches: [] });

    fireEvent.touchStart(slide!, {
      touches: [{ clientX: 102, clientY: 101 }],
    });
    fireEvent.touchEnd(slide!, { touches: [] });

    expect(screen.queryByText("Reset Zoom [1x]")).not.toBeInTheDocument();
  });

  it("handles pinch-to-zoom gesture calculation to scale dynamically", () => {
    render(<ImageGallery images={mockImages} />);

    // Open first image
    const thumbnails = screen.getAllByAltText("DSC01234.JPG");
    fireEvent.click(thumbnails[0]);
    const imagesWithAlt = screen.getAllByAltText("DSC01234.JPG");
    const modalImg = imagesWithAlt[1];
    const slide = modalImg.closest("div[class*='cursor-grab']");

    // Pinch start: 2 touches 100px apart
    fireEvent.touchStart(slide!, {
      touches: [
        { clientX: 100, clientY: 100 },
        { clientX: 200, clientY: 100 },
      ],
    });

    // Pinch move: 2 touches moved to 200px apart (2x distance factor)
    fireEvent.touchMove(slide!, {
      touches: [
        { clientX: 50, clientY: 100 },
        { clientX: 250, clientY: 100 },
      ],
    });

    // Reset Zoom button should be visible as scale > 1
    expect(screen.getByText("Reset Zoom [1x]")).toBeInTheDocument();

    // Clicking "Reset Zoom [1x]" resets scale to 1
    fireEvent.click(screen.getByText("Reset Zoom [1x]"));
    expect(screen.queryByText("Reset Zoom [1x]")).not.toBeInTheDocument();
  });

  it("automatically resets zoom when navigating slides or closing modal", () => {
    render(<ImageGallery images={mockImages} />);

    // Open first image
    const thumbnails = screen.getAllByAltText("DSC01234.JPG");
    fireEvent.click(thumbnails[0]);
    const imagesWithAlt = screen.getAllByAltText("DSC01234.JPG");
    const modalImg = imagesWithAlt[1];
    const slide = modalImg.closest("div[class*='cursor-grab']");

    // Trigger double tap to zoom in
    fireEvent.touchStart(slide!, {
      touches: [{ clientX: 100, clientY: 100 }],
    });
    fireEvent.touchEnd(slide!, { touches: [] });
    fireEvent.touchStart(slide!, {
      touches: [{ clientX: 100, clientY: 100 }],
    });
    fireEvent.touchEnd(slide!, { touches: [] });

    expect(screen.getByText("Reset Zoom [1x]")).toBeInTheDocument();

    // Navigate to next slide via button
    const nextBtn = screen.getByRole("button", { name: "Next image" });
    fireEvent.click(nextBtn);

    // Zoom should be reset on next slide
    expect(screen.getByText("2 / 3")).toBeInTheDocument();
    expect(screen.queryByText("Reset Zoom [1x]")).not.toBeInTheDocument();

    // Zoom in on slide 2
    const imagesWithAlt2 = screen.getAllByAltText("DSC01235.JPG");
    const modalImg2 = imagesWithAlt2[1];
    const slide2 = modalImg2.closest("div[class*='cursor-grab']");
    fireEvent.touchStart(slide2!, {
      touches: [{ clientX: 100, clientY: 100 }],
    });
    fireEvent.touchEnd(slide2!, { touches: [] });
    fireEvent.touchStart(slide2!, {
      touches: [{ clientX: 100, clientY: 100 }],
    });
    fireEvent.touchEnd(slide2!, { touches: [] });
    expect(screen.getByText("Reset Zoom [1x]")).toBeInTheDocument();

    // Close modal
    fireEvent.click(screen.getByText("Close ✕"));
    expect(screen.queryByText("Reset Zoom [1x]")).not.toBeInTheDocument();
  });

  it("clamps pinch-to-zoom scaling between 1x and 4x", () => {
    render(<ImageGallery images={mockImages} />);

    // Open first image
    const thumbnails = screen.getAllByAltText("DSC01234.JPG");
    fireEvent.click(thumbnails[0]);
    const imagesWithAlt = screen.getAllByAltText("DSC01234.JPG");
    const modalImg = imagesWithAlt[1];
    const slide = modalImg.closest("div[class*='cursor-grab']");

    // Pinch start: 100px apart
    fireEvent.touchStart(slide!, {
      touches: [
        { clientX: 100, clientY: 100 },
        { clientX: 200, clientY: 100 },
      ],
    });

    // Pinch inward: 50px apart (factor 0.5x -> should clamp to 1x)
    fireEvent.touchMove(slide!, {
      touches: [
        { clientX: 100, clientY: 100 },
        { clientX: 150, clientY: 100 },
      ],
    });
    // At scale 1x, Reset Zoom button should not appear
    expect(screen.queryByText("Reset Zoom [1x]")).not.toBeInTheDocument();

    // Pinch out extremely far: 1000px apart (factor 10x -> should clamp to 4x)
    fireEvent.touchMove(slide!, {
      touches: [
        { clientX: 0, clientY: 100 },
        { clientX: 1000, clientY: 100 },
      ],
    });
    expect(screen.getByText("Reset Zoom [1x]")).toBeInTheDocument();
  });
});
