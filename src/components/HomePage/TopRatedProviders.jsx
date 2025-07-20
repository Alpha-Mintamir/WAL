import React, { useRef, useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Scrollbar } from "swiper/modules"; // Import Scrollbar
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/scrollbar"; // Import Swiper scrollbar CSS
import ProviderCard from "../Cards/ProviderCard";
import CommanCenterText from "../ReUseableComponents/CommanCenterText";
import { useRTL } from "@/utils/Helper";

const TopProviders = ({ data }) => {
  const swiperRef = useRef(null);
  const isRTL = useRTL();
  const [filteredProviders, setFilteredProviders] = useState([]);
  const [shouldLoop, setShouldLoop] = useState(true);
  const [hasValidData, setHasValidData] = useState(false);

  useEffect(() => {
    // Filter providers
    const filtered = data?.providers?.filter(
      (provider) => provider?.total_rating > 0 && provider?.services?.length > 0
    ) || [];
    
    setFilteredProviders(filtered);
    setHasValidData(filtered.length > 0);
    
    // Disable loop if we don't have enough providers
    setShouldLoop(filtered.length > 3);
  }, [data]);

  // If no valid data after filtering, don't render the section
  if (!hasValidData) return null;

  const breakpoints = {
    320: {
      slidesPerView: 1,
    },
    375: {
      slidesPerView: 1,
    },
    576: {
      slidesPerView: 1.3,
    },
    768: {
      slidesPerView: 1.5,
    },
    992: {
      slidesPerView: 2,
    },
    1200: {
      slidesPerView: 2.5,
    },
    1400: {
      slidesPerView: 3,
    },
  };

  
  return (
    <section className="top_providers card_bg p-[40px] lg:p-[80px]">
      <div className="container mx-auto">
        <CommanCenterText
          highlightedText={data?.short_headline}
          title={data?.title}
          description={data?.description}
        />
        <div className="provider_list flex justify-center mt-5">
          <Swiper
            dir={isRTL ? "rtl" : "ltr"}
            spaceBetween={20}
            slidesPerView={2}
            breakpoints={breakpoints}
            onSwiper={(swiper) => {
              swiperRef.current = swiper;
            }}
            key={isRTL}
            loop={shouldLoop}
            modules={[Scrollbar, Autoplay]}
            autoplay={{
              delay: 2500,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            scrollbar={{
              hide: false,
              draggable: true,
              dragSize: 100, // Adjust the size of the drag handle
            }}
            className="custom-swiper" // Add a custom class for styling
          >
            {filteredProviders.map((provider, index) => (
              <SwiperSlide key={index}>
                <ProviderCard provider={provider} />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </section>
  );
};

export default TopProviders;
