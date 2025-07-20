"use client";
import { search_services_providers } from "@/api/apiRoutes";
import { setActiveTab } from "@/redux/reducers/helperSlice";
import { convertToSlug, isMobile, placeholderImage, useRTL } from "@/utils/Helper";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import { FaSearch } from "react-icons/fa";
import { IoSearch } from "react-icons/io5";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import "swiper/css";
import { Autoplay } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import NearbyProviderCard from "../Cards/NearbyProviderCard";
import Layout from "../Layout/Layout";
import { useTranslation } from "../Layout/TranslationContext";
import ProviderDetailsServiceCard from "../Provider/ProviderDetailsServiceCard";
import BreadCrumb from "../ReUseableComponents/BreadCrumb";
import CustomImageTag from "../ReUseableComponents/CustomImageTag";
import NoDataFound from "../ReUseableComponents/Error/NoDataFound";
import MiniLoader from "../ReUseableComponents/MiniLoader";
import { Skeleton } from "../ui/skeleton";
import NearbyProviderCardSkeleton from "../Skeletons/NearbyProviderCardSkeleton";
import Link from "next/link";
import { GoChevronRight } from "react-icons/go";

const SearchSkeleton = () => {
  return (
    <div className="card_bg rounded-xl w-full flex flex-col gap-3 py-3 px-4 md:p-6">
      {/* Header Section */}
      <div className="flex items-center justify-start gap-2">
        <Skeleton className="w-12 h-12 rounded-lg" />{" "}
        {/* Provider Image Skeleton */}
        <div className="provider_detail flex items-start justify-between w-full">
          <div className="flex flex-col gap-2">
            <Skeleton className="w-24 h-4" /> {/* Username Skeleton */}
            <Skeleton className="w-40 h-5" /> {/* Company Name Skeleton */}
          </div>
          <Skeleton className="w-20 h-8 rounded-lg" />{" "}
          {/* View All Button Skeleton */}
        </div>
      </div>

      {/* Services Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
        {[1, 2].map((_, index) => (
          <Skeleton key={index} className="w-full h-28 rounded-lg" />
        ))}
      </div>
    </div>
  );
};

const Search = () => {
  const t = useTranslation();
  const isRTL = useRTL();
  const isMobileView = isMobile();

  const router = useRouter();
  const slug = router?.query?.slug;
  const formattedSlug = slug ? slug.replace(/-/g, " ") : "";

  const type = router?.query?.type;
  const swiperRef = useRef(null);

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
      slidesPerView: 2.1,
    },
  };
  const locationData = useSelector((state) => state?.location);
  const [searchQuery, setSearchQuery] = useState(formattedSlug);
  const [activeTabType, setActiveTabType] = useState(type ? type : "service");

  const [servicesData, setServicesData] = useState([]);
  const [providersData, setProvidersData] = useState([]);
  const [total, setTotal] = useState("");

  const limit = 6;
  const [offset, setOffset] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMoreData, setHasMoreData] = useState(true);

  const handleTabChange = (type) => {
    router.push(`/search/${slug}?type=${type}`);
    setActiveTabType(type); // Local state for UI update
    setActiveTab(type); // Redux state if needed globally
    setOffset(0);
  };

  const fetchServicesAndProviders = async (isLoadMore, newOffset) => {
    setIsLoading(true);
    try {
      const response = await search_services_providers({
        type: activeTabType,
        search: searchQuery ? searchQuery : "",
        latitude: locationData?.lat,
        longitude: locationData?.lng,
        limit: limit,
        offset: isLoadMore ? newOffset : 0,
      });
      const fetchedServices = response?.data?.Services || [];
      const fetchedProviders = response?.data?.providers || [];
      const fetchedTotal = response?.data?.total || 0;

      setTotal(fetchedTotal);
      setHasMoreData(
        (isLoadMore ? [...servicesData, ...fetchedServices] : fetchedServices)
          .length < fetchedTotal
      );

      isLoadMore
        ? setServicesData((prev) => [...prev, ...fetchedServices])
        : setServicesData(fetchedServices);
      isLoadMore
        ? setProvidersData((prev) => [...prev, ...fetchedProviders])
        : setProvidersData(fetchedProviders);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (router.isReady) {
      fetchServicesAndProviders(false, 0);
    }
  }, [activeTabType, router.isReady]);

  const handleViewAll = (slug, tab) => {
    router.push(`/provider-details/${slug}`);
    setActiveTab(tab);
  };

  const handleSearchServiceOrProvider = () => {
    if (!searchQuery.trim()) {
      // Show a toast error when search query is empty
      toast.error(t("pleaseTypeServiceOrProviderName"));
      return; // Exit the function
    }
    const slug = convertToSlug(searchQuery); // Convert the search query to a slug

    // Navigate to the search page
    router.push(`/search/${slug}?type=${activeTabType}`);
  };

  const handleLoadMore = () => {
    if (!hasMoreData || isLoading) return;
    const newOffset = offset + limit;
    setOffset(newOffset);
    fetchServicesAndProviders(true, newOffset);
  };
  return (
    <Layout>
      <BreadCrumb firstEle={t("search")} firstEleLink={`/search/${slug}?type=${activeTabType}`} />
      <section className="search">
        <div className="container mx-auto">
          {/* search query */}
          <div>
            <span className="text-2xl font-medium mb-2 block sm:block md:inline">
              {t("gettingResultFor")}{" "}
              <span className="primary_text_color capitalize">
                "{formattedSlug}"
              </span>
            </span>
            <p className="text-sm description_color mb-6">
              {total} {t("results")}
            </p>
          </div>
          {/* search filter */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 mb-6 ">
            <div className="col-span-12 lg:col-span-4 xl:col-span-3 order-2 sm:order-1">
              <div className="flex border p-3 rounded-xl w-full">
                <button
                  className={`w-full px-6 py-2 text-base transition-all duration-150 ${activeTabType === "service"
                    ? "light_bg_color primary_text_color"
                    : ""
                    } rounded-lg`}
                  onClick={() => handleTabChange("service")}
                >
                  {t("services")}
                </button>
                <button
                  className={`w-full px-6 py-2 text-base transition-all duration-150 ${activeTabType === "provider"
                    ? "light_bg_color primary_text_color"
                    : ""
                    } rounded-lg`}
                  onClick={() => handleTabChange("provider")}
                >
                  {t("providers")}
                </button>
              </div>
            </div>

            <div className="col-span-12 lg:col-span-8 xl:col-span-9 order-1 sm:order-2">
              <div className="relative flex items-center gap-2 border p-3 rounded-xl w-full">
                <div className="flex items-center gap-1 w-full py-2">
                  <IoSearch size={20} className="primary_text_color" />
                  <input
                    type="text"
                    placeholder={t("searchHere")}
                    className="focus:outline-none bg-transparent w-full"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <button
                  onClick={handleSearchServiceOrProvider}
                  className="transition-all duration-150 rounded primary_bg_color px-2 md:px-6 py-2 text-white"
                >
                  {/* Display 'Search' on larger screens */}
                  <span className="hidden md:inline">{t("search")}</span>

                  {/* Display the search icon on smaller screens */}
                  <span className="inline md:hidden">
                    <FaSearch size={20} />
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* search data */}
        <div className="light_bg_color py-10">
          <div className="container mx-auto">
            {activeTabType === "service" ? (
              <>
                <div className="grid grid-cols-1 gap-4">
                  {isLoading ? (
                    // Render 3 skeleton loaders
                    [...Array(limit)].map((_, index) => (
                      <SearchSkeleton key={index} />
                    ))
                  ) : servicesData?.length > 0 ? (
                    servicesData?.map((service, index) => (
                      <>
                        <div
                          className="card_bg rounded-xl w-full flex flex-col gap-3 py-3 px-4  md:p-6"
                          key={index}
                        >
                          <div className="flex items-center justify-start gap-2">
                            <div className="w-12 h-12">
                              <CustomImageTag
                                src={service?.provider?.image}
                                alt={""}
                                placeholder={placeholderImage}
                                w={0}
                                h={0}
                                className="w-full h-full object-cover rounded-lg"
                              />
                            </div>
                            <div className="provider_detail flex items-start justify-between w-full">
                              <div className="flex flex-col">
                                <span className="text-sm description_color flex-nowrap">
                                  {service?.provider?.username}
                                </span>
                                <span className="text-lg font-semibold whitespace-nowrap overflow-hidden text-ellipsis max-w-[120px] md:max-w-full">
                                  {service?.provider?.company_name}
                                </span>
                              </div>
                              {service?.provider?.services.length > 2 && (
                                <div>
                                  <button
                                    className="p-2  bg-none md:primary_bg_color md:text-white rounded-lg"
                                    onClick={() =>
                                      handleViewAll(
                                        service?.provider?.id,
                                        "services"
                                      )
                                    }
                                  >
                                    {isMobileView ? <GoChevronRight size={20} /> : t("viewAll")}
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                          {service?.provider?.services?.length > 2 ? (
                            <div className="services_data flex justify-center">
                              <Swiper
                                spaceBetween={20}
                                slidesPerView={2}
                                breakpoints={breakpoints}
                                dir={isRTL ? "rtl" : "ltr"}
                                key={isRTL}
                                modules={[Autoplay]}
                                onSwiper={(swiper) => {
                                  swiperRef.current = swiper;
                                }}
                                className="custom-swiper"
                              >
                                {service?.provider?.services.map(
                                  (service, index) => (
                                    <SwiperSlide key={index}>
                                      <ProviderDetailsServiceCard
                                        slug={service?.provider_slug}
                                        data={service}
                                        compnayName={service?.provider?.company_name}
                                      />
                                    </SwiperSlide>
                                  )
                                )}
                              </Swiper>
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                              {service?.provider?.services.map(
                                (service, index) => (
                                  <div key={index}>
                                    <ProviderDetailsServiceCard
                                      slug={service?.provider_slug}
                                      data={service}
                                    />
                                  </div>
                                )
                              )}
                            </div>
                          )}
                        </div>
                      </>
                    ))
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <NoDataFound
                        title={t("noSearchResults")}
                        desc={t("noSearchResulltsText")}
                      />
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                {isLoading ? (
                  // Render skeleton loaders for NearbyProviderCard
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {[...Array(limit)].map((_, index) => (
                      <NearbyProviderCardSkeleton key={index} />
                    ))}
                  </div>
                ) : providersData?.length > 0 ? (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {providersData?.map((provider, index) => (
                      <Link
                        key={index}
                        href={`/provider-details/${provider?.provider_slug}`}
                        title={provider?.name}
                      >
                        <NearbyProviderCard provider={provider} />
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <NoDataFound
                      title={t("noSearchResults")}
                      desc={t("noSearchResulltsText")}
                    />
                  </div>
                )}
              </>
            )}
          </div>
          <div className="flex items-center justify-center w-full mt-4">
            {hasMoreData && (
              <div className="flex items-center justify-center w-full mt-4">
                <button
                  onClick={handleLoadMore}
                  className="light_bg_color primary_text_color py-3 px-8 rounded-xl"
                  disabled={isLoading}
                >
                  {isLoading ? <MiniLoader /> : t("loadMore")}
                </button>
              </div>
            )}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Search;
