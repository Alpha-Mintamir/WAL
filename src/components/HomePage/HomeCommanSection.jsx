"use client";
import React from "react";
import CommanHeadline from "../ReUseableComponents/CommanHeadline";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { Autoplay, FreeMode, Pagination } from "swiper/modules";
import BlurredServiceCard from "../Cards/BlurredServiceCard";
import { addCategory } from "@/redux/reducers/multiCategoriesSlice";
import { useRouter } from "next/router";
import { usePathname } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { useRTL } from "@/utils/Helper";

const HomeCommanSection = ({ data }) => {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch();

  const isRTL = useRTL();

  // Access selected category from Redux store
  const selectedCategories = useSelector(
    (state) => state.multiCategories.selectedCategories
  );
  const handleRouteCategory = (category) => {
    // Check if the category is already in selectedCategories
    const isCategorySelected = selectedCategories.some(
      (cat) => cat.slug === category.slug
    );

    // If the category is not already selected, dispatch the action and route to it
    if (!isCategorySelected) {
      // Dispatch the category details to Redux
      dispatch(addCategory(category));

      // Navigate to the category details page
      router.push(`/services/${pathname}/${category.slug}`);
    }
  };

  const breakpoints = {
    320: {
      slidesPerView: 1.5,
    },
    576: {
      slidesPerView: 3,
    },
    768: {
      slidesPerView: 3.5,
    },
    992: {
      slidesPerView: 4,
    },
    1200: {
      slidesPerView: 4.5,
    },
    1400: {
      slidesPerView: 5,
    },
    1600: {
      slidesPerView: 5.5,
    },
  };

  return (
    <div className="py-8">
      <div className="container mx-auto px-4 md:px-8 homeCommanSection">
        <CommanHeadline
          headline={data?.title}
          subHeadline={data?.description}
          link={""}
        />
        <div>
          <Swiper
            modules={[Autoplay, FreeMode,Pagination]} // Include FreeMode module
            spaceBetween={30}
            loop={true}
            key={isRTL}
            dir={isRTL ? "rtl" : "ltr"}
            autoplay={{ delay: 3000 }} // Autoplay functionality
            freeMode={true} // Enable free mode
            breakpoints={breakpoints} // Add breakpoints here
            navigation
            pagination={{
              clickable: true,
            }}
            className="mySwiper"
          >
            {data?.sub_categories.map((service) => (
              <SwiperSlide key={service.id}>
                <BlurredServiceCard
                  elem={service}
                  handleRouteChange={handleRouteCategory}
                />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </div>
  );
};

export default HomeCommanSection;
