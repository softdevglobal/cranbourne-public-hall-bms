'use client'

import React from "react";
import Image, { StaticImageData } from "next/image";
import img1 from "@/assets/gallary/gallery1.jpg";
import img2 from "@/assets/gallary/gallery2.jpg";
import img3 from "@/assets/gallary/gallery3.jpg";
import img4 from "@/assets/gallary/gallery4.jpg";
import img5 from "@/assets/gallary/gallery5.jpg";

const images: StaticImageData[] = [img1, img2, img3, img4, img5];

const useImagesPerSlide = () => 1; // Full-width: always 1 image per slide

const ImageSlider: React.FC = () => {
  const [current, setCurrent] = React.useState(0);
  const imagesPerSlide = useImagesPerSlide();
  const [modalOpen, setModalOpen] = React.useState(false);
  const [modalImg, setModalImg] = React.useState<StaticImageData | null>(null);
  const [modalSize, setModalSize] = React.useState<{ width: number; height: number } | null>(null);
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const cardRefs = React.useRef<Array<HTMLDivElement | null>>([]);

  // Infinite auto-scroll
  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + imagesPerSlide) % images.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [imagesPerSlide]);

  const nextSlide = React.useCallback(() => {
    setCurrent((prev) => (prev + imagesPerSlide) % images.length);
  }, [imagesPerSlide]);

  const prevSlide = React.useCallback(() => {
    setCurrent((prev) => (prev - imagesPerSlide + images.length) % images.length);
  }, [imagesPerSlide]);

  const currentImage = images[current % images.length];

  const handleImageClick = (img: StaticImageData) => {
    setModalImg(img);
    setModalOpen(true);
    setModalSize(null);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setModalImg(null);
  };

  // Close on ESC
  React.useEffect(() => {
    if (!modalOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') handleCloseModal(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [modalOpen]);

  // Swipe support
  React.useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    let startX = 0;
    let tracking = false;

    const onTouchStart = (e: TouchEvent) => {
      tracking = true;
      startX = e.touches[0].clientX;
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (!tracking) return;
      const endX = e.changedTouches[0].clientX;
      const dx = endX - startX;
      if (Math.abs(dx) > 50) {
        if (dx < 0) nextSlide(); else prevSlide();
      }
      tracking = false;
    };

    const onMouseDown = (e: MouseEvent) => {
      tracking = true;
      startX = e.clientX;
    };

    const onMouseUp = (e: MouseEvent) => {
      if (!tracking) return;
      const endX = e.clientX;
      const dx = endX - startX;
      if (Math.abs(dx) > 50) {
        if (dx < 0) nextSlide(); else prevSlide();
      }
      tracking = false;
    };

    container.addEventListener('touchstart', onTouchStart, { passive: true });
    container.addEventListener('touchend', onTouchEnd, { passive: true });
    container.addEventListener('mousedown', onMouseDown);
    container.addEventListener('mouseup', onMouseUp);
    return () => {
      container.removeEventListener('touchstart', onTouchStart);
      container.removeEventListener('touchend', onTouchEnd);
      container.removeEventListener('mousedown', onMouseDown);
      container.removeEventListener('mouseup', onMouseUp);
    };
  }, [imagesPerSlide, nextSlide, prevSlide]);

  // No reveal animation for full-width hero-style gallery

  const handleCardMouseMove = (e: React.MouseEvent<HTMLDivElement>, idx: number) => {
    const card = cardRefs.current[idx];
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width; // 0..1
    const y = (e.clientY - rect.top) / rect.height; // 0..1
    const rx = (0.5 - y) * 8; // tilt up/down
    const ry = (x - 0.5) * 8; // tilt left/right
    card.style.transform = `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg)`;
  };
  const handleCardMouseLeave = (idx: number) => {
    const card = cardRefs.current[idx];
    if (card) card.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg)';
  };

  return (
    <>
      <div className="relative w-full">
        <div ref={containerRef} className="relative w-full h-[55vh] sm:h-[65vh] md:h-[75vh] bg-black overflow-hidden">
          <Image
            src={currentImage}
            alt={`Gallery ${current % images.length}`}
            fill
            priority
            sizes="100vw"
            className="object-cover w-full h-full"
            onClick={() => handleImageClick(currentImage)}
          />

          {/* Prev */}
          <button
            onClick={prevSlide}
            className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/40 hover:bg-black/60 p-2 sm:p-3 text-white"
            aria-label="Previous image"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7"/></svg>
          </button>

          {/* Next */}
          <button
            onClick={nextSlide}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/40 hover:bg-black/60 p-2 sm:p-3 text-white"
            aria-label="Next image"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg>
          </button>

          {/* Dots */}
          <div className="absolute inset-x-0 bottom-4 flex items-center justify-center gap-2">
            {images.map((_, i) => (
              <span
                key={i}
                className={`w-2.5 h-2.5 rounded-full ${i === current ? "bg-white" : "bg-white/40"}`}
              ></span>
            ))}
          </div>
        </div>
      </div>

      {/* Modal for large image */}
      {modalOpen && modalImg && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center cursor-zoom-out"
            onClick={handleCloseModal}
            style={{backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', background: 'rgba(0,0,0,0.45)'}}
          >
          <div
            className="relative animate-zoom cursor-default"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: modalSize ? `${modalSize.width}px` : 'min(92vw, 1600px)',
              height: modalSize ? `${modalSize.height}px` : 'min(86vh, 900px)'
            }}
          >
            <button
              className="absolute top-2 right-2 text-white/90 hover:text-white bg-black/60 hover:bg-black/80 rounded-full p-2"
              onClick={handleCloseModal}
              aria-label="Close"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
            </button>
            <Image
              src={modalImg}
              alt="Large Gallery"
              width={2000}
              height={1500}
              className="block object-contain w-full h-full"
              onLoadingComplete={({ naturalWidth, naturalHeight }) => {
                const vw = Math.min(window.innerWidth * 0.92, 1600);
                const vh = Math.min(window.innerHeight * 0.86, 900);
                const scale = Math.min(vw / naturalWidth, vh / naturalHeight);
                setModalSize({ width: Math.floor(naturalWidth * scale), height: Math.floor(naturalHeight * scale) });
              }}
            />
          </div>
          <style>{`@keyframes zoomIn { from { transform: scale(.96); opacity: 0 } to { transform: scale(1); opacity: 1 } } .animate-zoom{ animation: zoomIn .25s ease-out both; }`}</style>
        </div>
      )}

      {/* No extra styles needed for full-bleed layout */}
    </>
  );
};

export default ImageSlider;
