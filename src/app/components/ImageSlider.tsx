'use client'

import React from "react";
import Image, { StaticImageData } from "next/image";
import img1 from "@/assets/gallary/gallery1.jpg";
import img2 from "@/assets/gallary/gallery2.jpg";
import img3 from "@/assets/gallary/gallery3.jpg";
import img4 from "@/assets/gallary/gallery4.jpg";
import img5 from "@/assets/gallary/gallery5.jpg";

const images: StaticImageData[] = [img1, img2, img3, img4, img5];

const useImagesPerSlide = () => {
  const [imagesPerSlide, setImagesPerSlide] = React.useState(2);

  React.useEffect(() => {
    const update = () => {
      if (window.innerWidth < 640) {
        setImagesPerSlide(1);
      } else {
        setImagesPerSlide(2);
      }
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return imagesPerSlide;
};

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

  const nextSlide = () => {
    setCurrent((prev) => (prev + imagesPerSlide) % images.length);
  };

  const prevSlide = () => {
    setCurrent((prev) => (prev - imagesPerSlide + images.length) % images.length);
  };

  // Get visible images, wrapping around if needed
  const visibleImages = Array.from(
    { length: imagesPerSlide },
    (_, i) => images[(current + i) % images.length]
  );

  // Responsive image size
  const getImageSize = () => {
    if (typeof window !== "undefined" && window.innerWidth < 640) {
      return { width: 480, height: 360 }; // Mobile – larger
    }
    return { width: 720, height: 480 }; // Desktop – two large cards
  };
  const { width, height } = getImageSize();

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
    const onDown = (e: TouchEvent | MouseEvent) => {
      tracking = true;
      startX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
    };
    const onUp = (e: TouchEvent | MouseEvent) => {
      if (!tracking) return;
      const endX = 'changedTouches' in e ? e.changedTouches[0].clientX : (e as MouseEvent).clientX;
      const dx = endX - startX;
      if (Math.abs(dx) > 50) {
        if (dx < 0) nextSlide(); else prevSlide();
      }
      tracking = false;
    };
    container.addEventListener('touchstart', onDown, { passive: true });
    container.addEventListener('touchend', onUp, { passive: true });
    container.addEventListener('mousedown', onDown);
    container.addEventListener('mouseup', onUp);
    return () => {
      container.removeEventListener('touchstart', onDown as any);
      container.removeEventListener('touchend', onUp as any);
      container.removeEventListener('mousedown', onDown as any);
      container.removeEventListener('mouseup', onUp as any);
    };
  }, [imagesPerSlide]);

  // Reveal on scroll
  React.useEffect(() => {
    const cards = cardRefs.current.filter(Boolean) as HTMLDivElement[];
    if (cards.length === 0) return;
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((en) => {
        if (en.isIntersecting) en.target.classList.add('reveal');
      }),
      { threshold: 0.2 }
    );
    cards.forEach((c) => obs.observe(c));
    return () => obs.disconnect();
  }, [current, imagesPerSlide]);

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
      <div className="w-full flex flex-col items-center py-8">
        <div ref={containerRef} className="flex items-center justify-center gap-4 w-full">
          <button
            onClick={prevSlide}
            className="rounded-full bg-gray-200 hover:bg-gray-300 p-1.5 sm:p-2 w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center"
          >
            <svg
              className="w-4 h-4 sm:w-6 sm:h-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Grid layout - tailwind doesn't support dynamic cols directly */}
          <div
            className={`grid gap-4 w-full ${
              imagesPerSlide === 1 ? "grid-cols-1" : "sm:grid-cols-2"
            }`}
          >
            {visibleImages.map((src, idx) => (
              <div
                key={idx}
                ref={(el) => (cardRefs.current[idx] = el)}
                className="gallery-card group relative rounded-2xl overflow-hidden aspect-[4/3] bg-white cursor-pointer shadow-sm hover:shadow-xl transition-shadow duration-300"
                onClick={() => handleImageClick(src)}
                onMouseMove={(e) => handleCardMouseMove(e, idx)}
                onMouseLeave={() => handleCardMouseLeave(idx)}
              >
                <Image
                  src={src}
                  alt={`Gallery ${(current + idx) % images.length}`}
                  width={width}
                  height={height}
                  className="object-cover w-full h-full scale-100 group-hover:scale-[1.03] transition-transform duration-500"
                />
                <span className="shine" aria-hidden></span>
              </div>
            ))}
          </div>

          <button
            onClick={nextSlide}
            className="rounded-full bg-gray-200 hover:bg-gray-300 p-1.5 sm:p-2 w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center"
          >
            <svg
              className="w-4 h-4 sm:w-6 sm:h-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Dots */}
        <div className="flex gap-2 mt-4">
          {images.map((_, i) => (
            <span
              key={i}
              className={`w-2.5 h-2.5 rounded-full ${
                i === current ? "bg-orange-500" : "bg-gray-300"
              } transition-colors duration-300`}
            ></span>
          ))}
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

      <style>{`
        .gallery-card { transform-style: preserve-3d; transition: transform .15s ease-out; }
        .gallery-card .shine { position: absolute; inset: 0; background: radial-gradient(circle at 30% 20%, rgba(255,255,255,.35), transparent 40%); mix-blend-mode: screen; opacity: 0; transition: opacity .3s ease; }
        .gallery-card:hover .shine { opacity: .7; }
        .gallery-card.reveal { animation: galleryFadeUp .5s ease-out both; }
        @keyframes galleryFadeUp { from { transform: translateY(10px); opacity: .001; } to { transform: translateY(0); opacity: 1; } }
      `}</style>
    </>
  );
};

export default ImageSlider;
