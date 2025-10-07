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
  const [imagesPerSlide, setImagesPerSlide] = React.useState(4);

  React.useEffect(() => {
    const update = () => {
      if (window.innerWidth < 640) {
        setImagesPerSlide(1);
      } else {
        setImagesPerSlide(4);
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
      return { width: 375, height: 300 }; // Mobile
    }
    return { width: 400, height: 300 }; // Desktop (smaller so 4 fit)
  };
  const { width, height } = getImageSize();

  const handleImageClick = (img: StaticImageData) => {
    setModalImg(img);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setModalImg(null);
  };

  return (
    <>
      <div className="w-full flex flex-col items-center py-8">
        <div className="flex items-center justify-center gap-4 w-full">
          <button
            onClick={prevSlide}
            className="p-2 rounded-full bg-gray-200 hover:bg-gray-300"
          >
            <svg
              width="24"
              height="24"
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
              imagesPerSlide === 1 ? "grid-cols-1" : "grid-cols-4"
            }`}
          >
            {visibleImages.map((src, idx) => (
              <div
                key={idx}
                className="rounded-xl overflow-hidden aspect-video bg-gray-100 cursor-pointer"
                onClick={() => handleImageClick(src)}
              >
                <Image
                  src={src}
                  alt={`Gallery ${(current + idx) % images.length}`}
                  width={width}
                  height={height}
                  className="object-cover w-full h-full"
                />
              </div>
            ))}
          </div>

          <button
            onClick={nextSlide}
            className="p-2 rounded-full bg-gray-200 hover:bg-gray-300"
          >
            <svg
              width="24"
              height="24"
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
              className={`w-3 h-3 rounded-full ${
                i === current ? "bg-orange-500" : "bg-gray-300"
              }`}
            ></span>
          ))}
        </div>
      </div>

      {/* Modal for large image */}
      {modalOpen && modalImg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)'}}>
          <div className="relative bg-white rounded-xl shadow-lg p-4 flex flex-col items-center" style={{width: '600px', height: '400px'}}>
            <button
              className="absolute top-2 right-2 text-2xl text-gray-700 hover:text-red-500 bg-white rounded-full p-2 shadow"
              onClick={handleCloseModal}
              aria-label="Close"
            >
              &times;
            </button>
            <div className="flex items-center justify-center w-full h-full">
              <Image
                src={modalImg}
                alt="Large Gallery"
                width={560}
                height={360}
                className="object-contain w-[560px] h-[360px] rounded-lg"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ImageSlider;
