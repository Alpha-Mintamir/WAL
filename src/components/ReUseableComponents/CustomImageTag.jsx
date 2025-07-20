"use client";
import React, { useEffect, useState, useRef } from "react";
import ImagePlaceholder from "../../assets/placeholder.svg";
import { store } from "@/redux/store";
import { placeholderImage } from "@/utils/Helper";

// Simple in-memory cache for images
const imageCache = new Map();

const CustomImageTag = ({ 
  src, 
  alt, 
  className,
  loadingBuilder, // Optional custom loading component
  errorBuilder, // Optional custom error component
  fadeInDuration = 300, // Duration for fade-in effect in ms
  cacheKey, // Optional custom cache key
  maxCacheSize = 100, // Maximum number of images to keep in cache
  retryCount = 2, // Number of retries for failed image loads
}) => {
  const settings = store.getState().settingsData?.settings?.web_settings;
  const placeholderLogo = settings?.web_half_logo || ImagePlaceholder;
  const [imageSrc, setImageSrc] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [retries, setRetries] = useState(0);
  const imgRef = useRef(null);
  const actualSrc = typeof src === "object" && src?.src ? src.src : src;
  const key = cacheKey || actualSrc;

  // Manage image cache
  const updateCache = (key, url) => {
    // If cache is full, remove oldest entry
    if (imageCache.size >= maxCacheSize && !imageCache.has(key)) {
      const oldestKey = imageCache.keys().next().value;
      imageCache.delete(oldestKey);
    }
    imageCache.set(key, url);
  };

  // Load image from cache or network
  const loadImage = () => {
    setIsLoading(true);
    setHasError(false);

    // If source is empty, use placeholder
    if (!actualSrc || actualSrc === "") {
      setImageSrc(placeholderLogo);
      setIsLoaded(true);
      setIsLoading(false);
      return;
    }

    // Check if image is already in cache
    if (imageCache.has(key)) {
      setImageSrc(imageCache.get(key));
      setIsLoaded(true);
      setIsLoading(false);
      return;
    }

    // Simulate network loading (can be replaced with actual fetch if needed)
    const img = new Image();
    img.onload = () => {
      updateCache(key, actualSrc);
      setImageSrc(actualSrc);
      setIsLoaded(true);
      setIsLoading(false);
    };
    
    img.onerror = () => {
      if (retries < retryCount) {
        setRetries(prev => prev + 1);
        // Retry loading with a delay
        setTimeout(() => loadImage(), 1000);
      } else {
        setHasError(true);
        setIsLoading(false);
        setImageSrc(placeholderLogo);
      }
    };
    
    img.src = actualSrc;
  };

  useEffect(() => {
    setRetries(0); // Reset retries when src changes
    loadImage();
    
    // Clear this image from cache when component unmounts if it was an error
    return () => {
      if (hasError && imageCache.has(key)) {
        imageCache.delete(key);
      }
    };
  }, [actualSrc, settings]);

  // Custom fade-in effect style
  const fadeInStyle = {
    opacity: isLoaded ? 1 : 0,
    transition: `opacity ${fadeInDuration}ms ease-in-out`,
  };

  // Handle image load event
  const handleLoad = () => {
    setIsLoaded(true);
    setIsLoading(false);
  };

  // Handle image error
  const handleError = () => {
    if (retries < retryCount) {
      setRetries(prev => prev + 1);
      // Try loading again
      setTimeout(() => {
        if (imgRef.current) {
          imgRef.current.src = actualSrc + `?retry=${retries}`;
        }
      }, 1000);
    } else {
      setHasError(true);
      setIsLoading(false);
      placeholderImage({ target: imgRef.current });
    }
  };

  // Default loading state with placeholder and pulse animation
  const defaultLoadingState = (
    <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-gray-50 bg-opacity-80 z-10">
      <img
        src={placeholderLogo}
        alt="loading"
        className="w-full h-full object-contain animate-pulse"
      />
    </div>
  );

  return (
    <div className={`relative ${className}`}>
      {/* Show loading placeholder with animate-pulse effect */}
      {isLoading && (
        loadingBuilder ? loadingBuilder() : defaultLoadingState
      )}
      
      {/* Show error state or the actual image */}
      {hasError && errorBuilder ? (
        errorBuilder()
      ) : (
        <img
          ref={imgRef}
          src={imageSrc}
          alt={alt}
          className={`${className} ${isLoaded ? 'block' : 'invisible'} w-full h-full object-cover`}
          style={fadeInStyle}
          onLoad={handleLoad}
          onError={handleError}
          loading="lazy"
        />
      )}
    </div>
  );
};

export default CustomImageTag;
