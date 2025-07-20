"use client";
import React, { useState, useEffect, useRef } from "react";
import { GoogleMap, MarkerF } from "@react-google-maps/api";
import { FaSearch } from "react-icons/fa";
import { cn } from "@/lib/utils";
import { IoLocationOutline } from "react-icons/io5";
import { useTranslation } from "@/components/Layout/TranslationContext";
import { getPlacesDetailsForWebApi, getPlacesForWebApi } from "@/api/apiRoutes";
import { darkThemeStyles, useIsDarkMode } from "@/utils/Helper";

const containerStyle = { width: "100%", height: "100%" };

const Map = ({
  latitude,
  longitude,
  isLoaded,
  loadError,
  isClicked,
  onLocationChange,
}) => {
  // ✅ All hooks must be called first, before any return
  const t = useTranslation();
  const isDarkMode = useIsDarkMode();

  const [isLoading, setIsLoading] = useState(false);
  const [markerPosition, setMarkerPosition] = useState({});
  const [map, setMap] = useState(null);
  const [zoom, setZoom] = useState(14);

  const [searchInput, setSearchInput] = useState("");
  const [placeSuggestions, setPlaceSuggestions] = useState([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [isInputFocused, setIsInputFocused] = useState(false);

  const inputRef = useRef(null);
  const geocoder = new window.google.maps.Geocoder();

  // ✅ Move useEffect BEFORE any return statements
  useEffect(() => {
    const initialLat = latitude ? parseFloat(latitude) : 23.2387;
    const initialLng = longitude ? parseFloat(longitude) : 69.67;

    setMarkerPosition({ lat: initialLat, lng: initialLng });
    reverseGeocode(initialLat, initialLng);
  }, [latitude, longitude]);

  // ✅ More hooks before any return
  useEffect(() => {
    if (!searchInput.trim()) {
      setPlaceSuggestions([]);
      setActiveIndex(-1);
      return;
    }

    const fetchSuggestions = async () => {
      setIsLoading(true);
      try {
        const res = await getPlacesForWebApi({ input: searchInput });
        setPlaceSuggestions(res?.data?.data?.predictions || []);
        setActiveIndex(-1);
      } finally {
        setIsLoading(false);
      }
    };

    const debounce = setTimeout(fetchSuggestions, 500);
    return () => clearTimeout(debounce);
  }, [searchInput]);

  // ✅ Now return statements come AFTER hooks
  if (loadError) return <div>Error loading Google Maps</div>;
  if (!isLoaded) return <div>Loading...</div>;

  const reverseGeocode = (lat, lng) => {
    const latLng = new window.google.maps.LatLng(lat, lng);
    geocoder.geocode({ location: latLng }, (results, status) => {
      if (status === "OK" && results.length > 0) {
        const address = results[0]?.formatted_address || "Address not found";
        const city =
          results[0]?.address_components.find((c) =>
            c.types.includes("locality")
          )?.long_name || "City not found";

        onLocationChange({ lat, lng, address, city });
      }
    });
  };

  const handleMarkerDragEnd = (e) => {
    const newLat = e.latLng.lat();
    const newLng = e.latLng.lng();
    setMarkerPosition({ lat: newLat, lng: newLng });
    reverseGeocode(newLat, newLng);
  };

  const handlePlaceSelect = async (place) => {
    try {
      const placeDetailsRes = await getPlacesDetailsForWebApi({
        place_id: place?.place_id,
      });
      const placeDetails = placeDetailsRes?.data?.data?.results?.[0];

      if (!placeDetails) {
        console.error("No place details found");
        return;
      }

      const lat = placeDetails.geometry?.location?.lat;
      const lng = placeDetails.geometry?.location?.lng;

      if (lat && lng) {
        setMarkerPosition({ lat, lng });
        setZoom(18);

        if (map) map.panTo({ lat, lng });

        onLocationChange({
          lat,
          lng,
          address: placeDetails.formatted_address,
          city:
            placeDetails.address_components.find((c) =>
              c.types.includes("locality")
            )?.long_name || "City not found",
        });

        setSearchInput("");
        setPlaceSuggestions([]);
        setActiveIndex(-1);
        inputRef.current?.blur();
        setIsInputFocused(false);
      }
    } catch (error) {
      console.error("Failed to fetch place details:", error);
    }
  };

  const handleKeyDown = (e) => {
    if (placeSuggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      setActiveIndex((prev) =>
        prev < placeSuggestions.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      setActiveIndex((prev) =>
        prev > 0 ? prev - 1 : placeSuggestions.length - 1
      );
    } else if (e.key === "Enter" && activeIndex !== -1) {
      handlePlaceSelect(placeSuggestions[activeIndex]);
    }
  };

  return (
    <div className="relative w-full h-full">
      <div
        className={cn("absolute z-10 w-full p-4 transition-all duration-700", {
          "top-0 opacity-100": isClicked,
          "-top-16 opacity-0": !isClicked,
        })}
      >
        <div className="relative flex items-center gap-3 card_bg p-2 w-full border rounded-xl">
          <FaSearch />
          <input
            ref={inputRef}
            className="ml-2 focus:outline-none w-full text-sm sm:text-base bg-transparent"
            placeholder={t("enterLocation")}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsInputFocused(true)}
            onBlur={() => setTimeout(() => setIsInputFocused(false), 200)}
          />
        </div>

        {isInputFocused && placeSuggestions.length > 0 && (
          <div className="absolute z-10 w-full top-14 card_bg rounded-b-xl shadow-lg max-h-60 overflow-y-auto primary_text_color">
            {placeSuggestions.map((place, index) => (
              <div
                key={place.place_id}
                className={`cursor-pointer p-2 flex items-center gap-3 border-b border-dashed last:border-none ${
                  index === activeIndex ? "primary_bg_color text-white" : ""
                }`}
                onClick={() => handlePlaceSelect(place)}
              >
                <IoLocationOutline size={22} />
                <span>{place.description}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <GoogleMap
        className="map_box w-full relative"
        center={markerPosition}
        zoom={zoom}
        mapContainerStyle={containerStyle}
        options={{
          fullscreenControl: false,
          mapTypeControl: false,
          streetViewControl: false,
          zoomControl: true,
          styles: isDarkMode ? darkThemeStyles : [],
        }}
        onLoad={(mapInstance) => setMap(mapInstance)}
      >
        <MarkerF
          position={markerPosition}
          draggable
          onDragEnd={handleMarkerDragEnd}
        />
      </GoogleMap>
    </div>
  );
};

export default Map;
