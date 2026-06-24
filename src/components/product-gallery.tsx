"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X, ZoomIn } from "lucide-react";

type ProductGalleryProps = {
  images: string[];
  name: string;
  discountLabel?: string;
};

export function ProductGallery({
  images,
  name,
  discountLabel,
}: ProductGalleryProps) {
  const gallery = images.length ? images : [];
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [lens, setLens] = useState({ x: 50, y: 50 });

  const activeImage = gallery[active] ?? gallery[0];

  const step = useCallback(
    (direction: number) => {
      setActive((current) => {
        const next = (current + direction + gallery.length) % gallery.length;
        return next;
      });
    },
    [gallery.length],
  );

  // Keyboard control while the lightbox is open.
  useEffect(() => {
    if (!lightbox) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setLightbox(false);
      if (event.key === "ArrowRight") step(1);
      if (event.key === "ArrowLeft") step(-1);
    }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [lightbox, step]);

  function handleMove(event: React.MouseEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    setLens({ x, y });
  }

  return (
    <div className="space-y-3">
      {/* Main image — hover to magnify, click to open lightbox */}
      <div
        className="group relative aspect-square cursor-zoom-in overflow-hidden rounded-2xl border border-[var(--line)] bg-white"
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
        onMouseMove={handleMove}
        onClick={() => setLightbox(true)}
        role="button"
        tabIndex={0}
        aria-label={`Zoom ${name}`}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") setLightbox(true);
        }}
      >
        {discountLabel ? (
          <span className="absolute left-4 top-4 z-20 rounded-full bg-[var(--danger)] px-3 py-1.5 text-xs font-semibold text-white">
            {discountLabel}
          </span>
        ) : null}

        <div
          className="absolute inset-0 transition-transform duration-200 ease-out will-change-transform"
          style={{
            transform: hovering ? "scale(2)" : "scale(1)",
            transformOrigin: `${lens.x}% ${lens.y}%`,
          }}
        >
          <Image
            src={activeImage}
            alt={name}
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
            priority
          />
        </div>

        <span className="pointer-events-none absolute bottom-4 right-4 z-20 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-[var(--ink)] opacity-0 shadow-sm backdrop-blur transition group-hover:opacity-100">
          <ZoomIn size={14} />
          Hover to zoom · click to expand
        </span>
      </div>

      {/* Thumbnails */}
      {gallery.length > 1 ? (
        <div className="grid grid-cols-4 gap-3">
          {gallery.map((imageUrl, index) => (
            <button
              key={`${imageUrl}-${index}`}
              type="button"
              onClick={() => setActive(index)}
              className={`relative aspect-square overflow-hidden rounded-xl border bg-white transition ${
                index === active
                  ? "border-[var(--danger)] ring-2 ring-[rgba(194,90,60,0.25)]"
                  : "border-[var(--line)] hover:border-[var(--ink)]"
              }`}
              aria-label={`View ${name} image ${index + 1}`}
              aria-pressed={index === active}
            >
              <Image
                src={imageUrl}
                alt={`${name} thumbnail ${index + 1}`}
                fill
                sizes="25vw"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      ) : null}

      {/* Lightbox */}
      {lightbox ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
          onClick={() => setLightbox(false)}
          role="dialog"
          aria-modal="true"
          aria-label={`${name} image viewer`}
        >
          <button
            type="button"
            onClick={() => setLightbox(false)}
            className="absolute right-4 top-4 grid size-11 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
            aria-label="Close viewer"
          >
            <X size={20} />
          </button>

          {gallery.length > 1 ? (
            <>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  step(-1);
                }}
                className="absolute left-4 grid size-11 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
                aria-label="Previous image"
              >
                <ChevronLeft size={22} />
              </button>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  step(1);
                }}
                className="absolute right-4 grid size-11 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/20 sm:right-20"
                aria-label="Next image"
              >
                <ChevronRight size={22} />
              </button>
            </>
          ) : null}

          <div
            className="relative h-[78vh] w-full max-w-4xl"
            onClick={(event) => event.stopPropagation()}
          >
            <Image
              src={activeImage}
              alt={name}
              fill
              sizes="100vw"
              className="object-contain"
            />
          </div>

          <p className="absolute bottom-5 left-1/2 -translate-x-1/2 text-sm font-medium text-white/80">
            {active + 1} / {gallery.length}
          </p>
        </div>
      ) : null}
    </div>
  );
}
