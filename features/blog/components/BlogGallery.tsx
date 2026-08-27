"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

type BlogGalleryProps = {
  images: string[];
  title: string;
  actionFullscreen?: boolean;
};

export default function BlogGallery({
  images,
  title,
  actionFullscreen = true,
}: BlogGalleryProps) {
  const [current, setCurrent] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const safeImages = images.filter(
    (image) => typeof image === "string" && image.length > 0,
  );

  useEffect(() => {
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setFullscreen(false);
    }
    if (fullscreen) {
      document.addEventListener("keydown", closeOnEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", closeOnEscape);
      document.body.style.overflow = "";
    };
  }, [fullscreen]);

  if (!safeImages.length)
    return (
      <div className="h-64 sm:h-96 bg-primary-900 flex items-center justify-center">
        <span className="text-primary-400 text-xl">The Wild Oasis Journal</span>
      </div>
    );
  const previous = () =>
    setCurrent((index) => (index - 1 + safeImages.length) % safeImages.length);
  const next = () => setCurrent((index) => (index + 1) % safeImages.length);
  const image = (
    <Image
      src={safeImages[current]}
      alt={title}
      fill
      className="object-contain"
      sizes="100vw"
      priority
    />
  );

  return (
    <>
      <div className="relative h-64 sm:h-96 bg-primary-900">
        {image}
        {safeImages.length > 1 && (
          <>
            <button
              type="button"
              onClick={previous}
              aria-label="Previous image"
              className="absolute left-3 top-1/2 -translate-y-1/2 bg-primary-950/80 text-primary-50 text-3xl w-10 h-10"
            >
              &#8249;
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="Next image"
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-primary-950/80 text-primary-50 text-3xl w-10 h-10"
            >
              &#8250;
            </button>
          </>
        )}
        {actionFullscreen && (
          <button
            type="button"
            onClick={() => setFullscreen(true)}
            aria-label="Open image fullscreen"
            className="absolute right-3 bottom-3 bg-primary-950/80 text-primary-50 px-3 py-2"
          >
            &#x26F6;
          </button>
        )}
        {safeImages.length > 1 && (
          <span className="absolute bottom-3 left-3 bg-primary-950/80 text-primary-50 px-3 py-2">
            {current + 1} / {safeImages.length}
          </span>
        )}
      </div>
      {fullscreen && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label={`${title} image viewer`}
        >
          <div className="relative w-full h-full">
            {image}
            <button
              type="button"
              onClick={() => setFullscreen(false)}
              aria-label="Close fullscreen viewer"
              className="absolute top-3 right-3 bg-white/20 text-white text-2xl w-10 h-10"
            >
              &times;
            </button>
            {safeImages.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={previous}
                  aria-label="Previous image"
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-white text-5xl"
                >
                  &#8249;
                </button>
                <button
                  type="button"
                  onClick={next}
                  aria-label="Next image"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white text-5xl"
                >
                  &#8250;
                </button>
                <span className="absolute bottom-3 left-1/2 -translate-x-1/2 text-white">
                  {current + 1} / {safeImages.length}
                </span>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
