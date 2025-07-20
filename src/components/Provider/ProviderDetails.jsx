"use client";
import React, { useEffect, useState, useRef } from "react";
import Layout from "../Layout/Layout";
import BreadCrumb from "../ReUseableComponents/BreadCrumb";
import { FaStar } from "react-icons/fa6";
import { IoLocationOutline } from "react-icons/io5";
import { CiBookmarkPlus } from "react-icons/ci";
import { HiOutlineChatBubbleOvalLeftEllipsis } from "react-icons/hi2";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import ProviderServiceTab from "./ProviderServiceTab";
import ProviderAboutTab from "./ProviderAboutTab";
import ProviderReviewTab from "./ProviderReviewTab";
import ProviderOfferTab from "./ProviderOfferTab";
import { useDispatch, useSelector } from "react-redux";
import { isLogin, showDistance } from "@/utils/Helper";
import CustomImageTag from "../ReUseableComponents/CustomImageTag";
import { useRouter } from "next/router";
import { allServices, bookmark, getProviders } from "@/api/apiRoutes";
import Lightbox from "../ReUseableComponents/CustomLightBox/LightBox";
import { BsFillBookmarkCheckFill } from "react-icons/bs";
import toast from "react-hot-toast";
import {
  getChatData,
  selectActiveTab,
  setActiveTab,
} from "@/redux/reducers/helperSlice";
import { useTranslation } from "../Layout/TranslationContext";
import { store } from "@/redux/store";
import Share from "../ReUseableComponents/Share/Share";
import OpenInAppDrawer from "../ReUseableComponents/Drawers/OpenInAppDrawer";
import ProviderDetailsSkeleton from "../Skeletons/ProviderDetailsSkeleton";

const ProviderDetails = () => {
  const t = useTranslation();
  const providerAboutRef = useRef(null);
  const isLoggedIn = isLogin();

  const dispatch = useDispatch(); // Initialize dispatch
  const router = useRouter();
  const activeTab = useSelector(selectActiveTab);

  const locationData = useSelector((state) => state?.location);
  const slug = router.query.slug[0];
  const isShare = router.query.share;

  const [isOpenInApp, setIsOpenInApp] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const [visibleSpecIndex, setVisibleSpecIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState("price-high-to-low");
  const [providerData, setProviderData] = useState({});
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [serviceData, setServiceData] = useState([]);
  const limit = 5;
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(false); // To manage button loading state
  const [isloadMore, setIsloadMore] = useState(false);
  const [total, setTotal] = useState(0);
  const [isBookMarked, setIsBookMarked] = useState(false);

  const settings = store.getState().settingsData?.settings;

  const isPreBookingChatAvailable =
    settings?.general_settings?.allow_pre_booking_chat === "1";

  const isProviderPreBookingChatAvailable =
    providerData?.pre_booking_chat === "1";

  const handleTabChange = (tab) => {
    dispatch(setActiveTab(tab));
  };

  const providerSpecs = [
    { text: "250+ Bookings Completed" },
    { text: "150+ Happy Clients" },
    { text: "5+ Years of Experience" },
    { text: "Top Rated Provider" },
  ];

  // Cycle through provider specs
  useEffect(() => {
    const timer = setInterval(() => {
      setVisibleSpecIndex(
        (prevIndex) => (prevIndex + 1) % providerSpecs.length
      );
    }, 2000); // Change every 2 seconds
    return () => clearInterval(timer);
  }, [providerSpecs.length]);

  // Check if About Us section is overflowing
  useEffect(() => {
    if (providerAboutRef.current) {
      const lineHeight = parseFloat(
        getComputedStyle(providerAboutRef.current).lineHeight
      );
      const maxLinesHeight = lineHeight * 4; // Height for 4 lines
      setIsOverflowing(providerAboutRef.current.scrollHeight > maxLinesHeight);
    }
  }, [providerData]);

  const handleSearchChange = (e) => setSearchQuery(e.target.value);
  const handleSortChange = (value) => setSortOption(value);

  const openLightbox = (index) => {
    setCurrentImageIndex(index);
    setIsLightboxOpen(true);
  };

  const closeLightbox = () => {
    setIsLightboxOpen(false);
  };

  const fetchProviders = async () => {
    try {
      setLoading(true);
      const response = await getProviders({
        latitude: locationData?.lat,
        longitude: locationData?.lng,
        slug: slug,
      });
      if (response?.error === false) {
        setProviderData(response?.data[0]);
        setLoading(false);
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (slug) {
      fetchProviders();
    }
  }, [slug]);

  const fetchServices = async (append = false, customOffset = offset) => {
    if (append) {
      setIsloadMore(true); // Set Load More button state to loading
    } else {
      setLoading(true); // Set initial fetch to loading
    }
    try {
      const response = await allServices({
        // partner_id: slug,
        provider_slug: slug,
        offset: customOffset, // Use the passed offset value
        limit: limit,
      });
      if (response.error === false) {
        setServiceData((prevServices) =>
          append ? [...prevServices, ...response?.data] : response?.data
        );
        setTotal(response?.total);
      } else {
        setServiceData([]);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false); // Stop initial loading state
      setIsloadMore(false); // Stop Load More button loading state
    }
  };

  const handleLoadMore = async () => {
    // Compute the new offset value
    const newOffset = offset + limit;
    setOffset(newOffset); // Update the state for offset

    // Pass the computed offset directly to fetchAllProviders
    await fetchServices(true, newOffset); // Ensure the correct offset is used
  };

  useEffect(() => {
    if (activeTab === "services") {
      fetchServices(false, 0);
    }
  }, [activeTab]);

  useEffect(() => {
    if (providerData?.is_bookmarked === "1") {
      setIsBookMarked(true);
    }
  }, [providerData]);

  const handleAddBookMark = async () => {
    if (isLoggedIn) {
      try {
        const res = await bookmark({
          type: "add",
          lat: locationData?.lat,
          lng: locationData?.lng,
          partner_id: providerData?.partner_id,
        });
        if (res?.error === false) {
          setIsBookMarked(true);

          toast.success(res?.message);
        } else {
          toast.error(res?.message);
          setIsBookMarked(false);
        }
      } catch (error) {
        console.log(error);
      }
    } else {
      toast.error(t("plzLoginfirst"));
    }
  };

  const handleRemoveBookMark = async () => {
    if (isLoggedIn) {
      try {
        const res = await bookmark({
          type: "remove",
          lat: locationData?.lat,
          lng: locationData?.lng,
          partner_id: providerData?.partner_id,
        });
        if (res?.error === false) {
          setIsBookMarked(false);

          toast.success(res?.message);
        } else {
          toast.error(res?.message);
          setIsBookMarked(true);
        }
      } catch (error) {
        console.log(error);
      }
    } else {
      toast.error(t("plzLoginfirst"));
    }
  };

  const handleChat = (e) => {
    e.preventDefault();
    if (!isLoggedIn) {
      toast.error(t("plzLoginfirst"));
      return false;
    }
    try {
      // Set chat data for pre-booking chat
      getChatData({
        booking_id: null,  // Explicitly set to null for pre-booking
        partner_id: providerData?.partner_id,
        partner_name: providerData?.company_name,
        image: providerData?.image,
        order_status: "",
        is_pre_booking: true  // Add flag to indicate pre-booking chat
      });
      
      // Navigate to chats page
      router.push("/chats");
    } catch (error) {
      console.log(error);
      toast.error(t("errorStartingChat"));
    }
  };

  // Function to check if the device is mobile or tablet
  const isMobileOrTablet = () => window.innerWidth <= 1024; // Adjust breakpoint as needed



  useEffect(() => {
    if (isShare && isMobileOrTablet()) {
      setIsOpenInApp(true);
    } else {
      setIsOpenInApp(false);
    }
  }, [isShare]);

  return (
    <Layout>
      <BreadCrumb
        firstEle={t("providers")}
        secEle={t("providerDetails")}
        firstEleLink="/providers"
        SecEleLink={`/provider-details/${slug}`}

      />
      {loading ? (
        <ProviderDetailsSkeleton />
      ) : (
        <>
          <section className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pb-6">
              {/* Left Section */}
              <div className="col-span-12 lg:col-span-4">
                <div className="sticky top-36">
                  <div className="flex flex-col gap-4">
                    {/* Service Details */}
                    <div className="rounded-[18px] bg-[#F5FAFF] dark:card_bg shadow-sm border border-gray-200">
                      <div className="w-full h-[220px] overflow-hidden p-6 pb-0">
                        <CustomImageTag
                          src={providerData?.banner_image}
                          alt={providerData?.company_name}
                          className="w-full h-full object-cover rounded-xl"
                        />
                      </div>
                      <div className="p-5">
                        <div className="flex flex-col sm:flex-row items-start gap-3">
                          <div className="w-14 h-14 rounded-xl overflow-hidden border border-gray-100">
                            <CustomImageTag
                              src={providerData?.image}
                              alt={providerData?.company_name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white ">
                              {providerData?.company_name}
                            </h3>
                            <div className="flex items-center gap-3 mt-1">
                              {providerData?.ratings > 0 && (
                                <div
                                  className="flex items-center gap-1  cursor-pointer hover:underline"
                                  onClick={() => handleTabChange("reviews")}
                                >
                                  <FaStar className="w-3.5 h-3.5 text-yellow-400" />
                                  <span className="text-sm font-medium">
                                    {providerData?.ratings}
                                  </span>
                                </div>
                              )}
                              {providerData?.distance > 0 && (
                                <div
                                  className="flex items-center gap-1  cursor-pointer text-sm description_color hover:underline"
                                  onClick={() => handleTabChange("about")}
                                >
                                  <IoLocationOutline
                                    className="primary_text_color font-bold"
                                    size={16}
                                  />
                                  {showDistance(providerData?.distance)}
                                </div>
                              )}
                              {providerData?.total_services > 0 && (
                                <div
                                  className="text-sm primary_text_color font-medium cursor-pointer hover:underline"
                                  onClick={() => handleTabChange("services")}
                                >
                                  {providerData?.total_services} {t("services")}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="mt-4 space-y-4">
                          <p
                            ref={providerAboutRef}
                            className={`text-sm description_color leading-relaxed ${!isExpanded ? "line-clamp-4" : ""
                              } transition-all duration-300`}
                          >
                            {providerData?.about}
                          </p>
                          {isOverflowing && (
                            <button
                              className="text-sm hover:underline"
                              onClick={() => setIsExpanded(!isExpanded)}
                            >
                              {isExpanded ? t("viewLess") : t("viewMore")}
                            </button>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-4">
                          {isBookMarked ? (
                            <button
                              className="card_bg dark:light_bg_color primary_text_color p-2 rounded-sm"
                              onClick={handleRemoveBookMark}
                            >
                              <BsFillBookmarkCheckFill size={24} />
                            </button>
                          ) : (
                            <button
                              className="card_bg dark:light_bg_color p-2 rounded-sm"
                              onClick={handleAddBookMark}
                            >
                              <CiBookmarkPlus size={24} />
                            </button>
                          )}

                          <Share title={providerData?.company_name} />

                          {isPreBookingChatAvailable &&
                            isProviderPreBookingChatAvailable && (
                              <button
                                className="card_bg dark:light_bg_color p-2 rounded-sm"
                                onClick={handleChat}
                              >
                                <HiOutlineChatBubbleOvalLeftEllipsis
                                  size={24}
                                />
                              </button>
                            )}
                        </div>
                      </div>
                    </div>

                    {/* Provider Specs */}
                    {/* {providerSpecs.length > 0 && (
                  <div className="mt-4 relative">
                    <div
                      className={`p-3 rounded-sm flex items-center justify-center gap-1 ${
                        [
                          "bg-blue-200",
                          "bg-green-200",
                          "bg-yellow-200",
                          "bg-red-200",
                        ][visibleSpecIndex]
                      }`}
                    >
                      <RiVerifiedBadgeFill
                        size={20}
                        className={`mr-2 ${
                          [
                            "primary_text_color",
                            "text-green-500",
                            "text-yellow-500",
                            "text-red-500",
                          ][visibleSpecIndex]
                        }`}
                      />
                      <div className="flex flex-col w-full py-3">
                        {providerSpecs.map((spec, index) => (
                          <span
                            key={index}
                            className={`text-sm font-medium absolute top-[13px] transition-all duration-300 ease-in-out transform ${
                              [
                                "primary_text_color",
                                "text-green-500",
                                "text-yellow-500",
                                "text-red-500",
                              ][visibleSpecIndex]
                            } ${
                              index === visibleSpecIndex
                                ? "opacity-100 animate-slide-up"
                                : "opacity-0 translate-y-4"
                            }`}
                          >
                            {spec.text}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )} */}

                    {/* Photo Gallary section */}
                    {providerData?.other_images?.length > 0 && (
                      <div className="light_bg_color rounded-lg overflow-hidden mt-4 relative p-5">
                        <div>
                          <h2 className="text-[20px] font-semibold">
                            {t("photos")}
                          </h2>
                          <div className="photos grid grid-cols-3 gap-4 mt-6">
                            {providerData?.other_images
                              ?.slice(0, 4)
                              .map((image, index) => (
                                <div
                                  className="photo cursor-pointer"
                                  key={index}
                                  onClick={() => openLightbox(index)}
                                >
                                  <CustomImageTag
                                    src={image}
                                    alt={`other_image_${index}`}
                                    className="rounded-md w-full h-[80px] object-contain md:object-cover"
                                  />
                                </div>
                              ))}

                            {providerData?.other_images?.length >= 5 && (
                              <div className="photo col-span-2 cursor-pointer">
                                <div
                                  className="relative rounded-md overflow-hidden"
                                  onClick={() => openLightbox(4)}
                                >
                                  <CustomImageTag
                                    src={providerData?.other_images[4]}
                                    alt={providerData?.company_name}
                                    className="w-full h-[80px] object-cover"
                                  />
                                  {providerData?.other_images?.length > 5 && (
                                    <div className="absolute inset-0 bg-gray-900 bg-opacity-70 flex justify-center items-center">
                                      <span className="text-md font-bold text-white">
                                        +{providerData.other_images.length - 5} {t("more")}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                            {isLightboxOpen && (
                              <Lightbox
                                isLightboxOpen={isLightboxOpen}
                                images={providerData.other_images} // Pass all images to the Lightbox
                                initialIndex={currentImageIndex} // Start at the clicked image
                                onClose={closeLightbox} // Close handler
                              />
                            )}
                          </div>
                        </div>

                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Section */}
              <div className="col-span-12 lg:col-span-8">
                <Tabs className="w-full" value={activeTab}>
                  <TabsList className="light_bg_color rounded-md w-full h-full flex gap-2 p-2 overflow-x-auto md:overflow-x-hidden scrollbar-none justify-start md:justify-center">
                    <style jsx global>{`
                      .scrollbar-none {
                        -ms-overflow-style: none;
                        scrollbar-width: none;
                      }
                      .scrollbar-none::-webkit-scrollbar {
                        display: none;
                      }
                    `}</style>

                    <TabsTrigger
                      value="services"
                      className={`${activeTab === "services"
                        ? "primary_bg_color !text-white"
                        : "bg-white text-black"
                        } px-6 md:px-4 py-2 rounded-md font-medium w-full text-center`}
                      onClick={() => handleTabChange("services")}
                    >
                      {t("services")}
                    </TabsTrigger>
                    <TabsTrigger
                      value="about"
                      className={`${activeTab === "about"
                        ? "primary_bg_color !text-white"
                        : "bg-white text-black"
                        } px-6 md:px-4 py-2 rounded-md font-medium w-full text-center`}
                      onClick={() => handleTabChange("about")}
                    >
                      {t("about")}
                    </TabsTrigger>
                    <TabsTrigger
                      value="reviews"
                      className={`${activeTab === "reviews"
                        ? "primary_bg_color !text-white"
                        : "bg-white text-black"
                        } px-6 md:px-4 py-2 rounded-md font-medium w-full text-center`}
                      onClick={() => handleTabChange("reviews")}
                    >
                      {t("reviews")}
                    </TabsTrigger>
                    <TabsTrigger
                      value="offers"
                      className={`${activeTab === "offers"
                        ? "primary_bg_color !text-white"
                        : "bg-white text-black"
                        } px-6 md:px-4 py-2 rounded-md font-medium w-full text-center`}
                      onClick={() => handleTabChange("offers")}
                    >
                      {t("offers")}
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="services">
                    <ProviderServiceTab
                      slug={slug}
                      isloadMore={isloadMore}
                      loading={loading}
                      serviceData={serviceData}
                      total={total}
                      handleLoadMore={handleLoadMore}
                      compnayName={providerData?.company_name}
                    />
                  </TabsContent>
                  <TabsContent value="about">
                    <ProviderAboutTab providerData={providerData} />
                  </TabsContent>
                  <TabsContent value="reviews">
                    <ProviderReviewTab
                      providerData={providerData}
                      slug={slug}
                    />
                  </TabsContent>
                  <TabsContent value="offers">
                    <ProviderOfferTab providerSlug={slug} />
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </section>
          <OpenInAppDrawer
            IsOpenInApp={isOpenInApp}
            OnHide={() => setIsOpenInApp(false)}
            systemSettingsData={settings}
          />
        </>
      )}
    </Layout>
  );
};

export default ProviderDetails;
