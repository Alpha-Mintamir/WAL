"use client";
import React, { useRef } from "react";
import StepCard from "./StepCard";
import linesbg1 from "@/assets/lines1.svg";
import linesbg2 from "@/assets/lines2.svg";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Scrollbar } from "swiper/modules"; // Import Scrollbar
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/scrollbar"; // Import Swiper scrollbar CSS
import CommanCenterText from "../ReUseableComponents/CommanCenterText";
import { useRTL } from "@/utils/Helper";
import CustomImageTag from "../ReUseableComponents/CustomImageTag";

const SuccessfullProvider = ({ data }) => {
  const swiperRef = useRef(null);

  const isRTL = useRTL();

  const breakpoints = {
    320: {
      slidesPerView: 1,
    },
    375: {
      slidesPerView: 1,
    },
    576: {
      slidesPerView: 1.1,
    },
    768: {
      slidesPerView: 1.3,
    },
    992: {
      slidesPerView: 1.5,
    },
    1200: {
      slidesPerView: 2,
    },
    1400: {
      slidesPerView: 2,
    },
  };

  return (
    <div className="successfull relative">
      <div className="py-8 md:py-20 container mx-auto">
        {/* Section Header */}

        <CommanCenterText
          highlightedText={data?.short_headline}
          title={data?.title}
          description={data?.description}
        />

        <div className="relative bg-[#0277FA0A] overflow-hidden rounded-[30px] py-10 px-4 md:px-8 md:py-20 lg:px-16">
          <img
            loading="lazy"
            src={linesbg1.src}
            alt="linesbg1.src"
            className="absolute top-0 right-0 -z-10 w-auto h-auto bg-no-repeat"
          />
          {/* Steps Section */}
          <div className="becomeProviderSteps flex justify-center">
            <Swiper
              autoplay={{
                delay: 2500,
                disableOnInteraction: false,
              }}
              loop={false}
              spaceBetween={20}
              slidesPerView={2}
              key={isRTL}
              dir={isRTL ? "rtl" : "ltr"}
              breakpoints={breakpoints}
              onSwiper={(swiper) => {
                swiperRef.current = swiper;
              }}
              modules={[Scrollbar, Autoplay]}
              scrollbar={{
                hide: false,
                draggable: true,
                dragSize: 100, // Adjust the size of the drag handle
              }}
              className="custom-swiper" // Add a custom class for styling
            >
              {data?.steps.map((step, index) => (
                <SwiperSlide key={index}>
                  <StepCard data={step} number={index + 1} />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
          <img
            loading="lazy"
            src={linesbg2.src}
            alt="linesbg2.src"
            className="absolute bottom-0 left-0 -z-10 w-auto h-auto bg-no-repeat"
          />
        </div>
      </div>
    </div>
  );
};

export default SuccessfullProvider;
