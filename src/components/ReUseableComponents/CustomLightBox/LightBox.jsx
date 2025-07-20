import React, { useState, useEffect } from "react";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { MdClose } from "react-icons/md";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import CustomImageTag from "../CustomImageTag";

const Lightbox = ({ images, initialIndex = 0, onClose, isLightboxOpen }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex || 0);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  };

  const handleThumbnailClick = (index) => {
    setCurrentIndex(index);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "ArrowLeft") handlePrev();
      if (event.key === "ArrowRight") handleNext();
      if (event.key === "Escape") onClose(); // Close on Escape key
    };

    if (isLightboxOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isLightboxOpen]);

  return (
    <Dialog open={isLightboxOpen}>
      <div className="perent fixed inset-0 bg-black bg-opacity-10 backdrop-blur-sm z-50">
        {/* Dialog Content */}
        <DialogContent className="flex flex-col items-center bg-transparent border-none text-white p-4 max-w-7xl mx-auto rounded-lg shadow-none">
          <button
            onClick={onClose}
            className="absolute top-2 right-2 text-white text-xl rtl:left-2 rtl:right-auto z-10 p-2"
            aria-label="Close"
          >
            <MdClose size={24} />
          </button>

          {/* Main Image Section */}
          <div className="flex items-center justify-center w-full mb-4 h-[70vh] relative">
            {images?.length > 1 && (
              <button
                className="absolute left-0 text-white text-3xl p-2"
                onClick={handlePrev}
                aria-label="Previous"
              >
                <FaArrowLeft />
              </button>
            )}
            <div className="flex items-center justify-center mx-auto  max-w-[60vh] md:max-w-[30vw] max-h-[80vh] md:max-h-[60vh]">
              <CustomImageTag
                src={images[currentIndex]}
                alt={`Image ${currentIndex}`}
                className="w-full h-full object-contain mx-4  max-w-[60vh] md:max-w-[30vw] max-h-[80vh] md:max-h-[60vh]"
              />
            </div>
            {images?.length > 1 && (
              <button
                className="absolute right-0 text-white text-3xl p-2"
                onClick={handleNext}
                aria-label="Next"
              >
                <FaArrowRight />
              </button>
            )}
          </div>

          {/* Footer Thumbnails */}
          <div className="flex items-center overflow-x-auto mt-4 gap-1 justify-center relative z-50 w-3/4">
            {images?.map((image, index) => (
              <div
                key={index}
                onClick={() => handleThumbnailClick(index)}
                style={{ pointerEvents: "auto" }}
              >
                <CustomImageTag
                  src={image}
                  alt={`Thumbnail ${index}`}
                  className={`w-16 h-16 object-cover cursor-pointer ${index === currentIndex
                    ? "border-2 border_color"
                    : "border border-gray-300"
                    } rounded-md`}
                />
              </div>
            ))}
          </div>
        </DialogContent>
      </div>
    </Dialog>
  );
};

export default Lightbox;
