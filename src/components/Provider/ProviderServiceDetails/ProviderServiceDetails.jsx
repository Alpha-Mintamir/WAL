"use client";
import React, { useState, useEffect, useRef } from "react";
import Layout from "../../Layout/Layout";
import BreadCrumb from "../../ReUseableComponents/BreadCrumb";
import { FaClock, FaStar } from "react-icons/fa6";
import { FaMinus, FaPlus, FaTrash, FaUserFriends } from "react-icons/fa";
import { IoIosDocument } from "react-icons/io";
import FaqAccordion from "../../ReUseableComponents/FaqAccordion.jsx";
import Rating from "../Rating.jsx";
import { Progress } from "@/components/ui/progress";
import { isLogin, showPrice } from "@/utils/Helper";
import CustomImageTag from "@/components/ReUseableComponents/CustomImageTag";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import {
  allServices,
  getRatings,
  ManageCartApi,
  removeCartApi,
} from "@/api/apiRoutes";
import Lightbox from "@/components/ReUseableComponents/CustomLightBox/LightBox";
import MiniLoader from "@/components/ReUseableComponents/MiniLoader";
import toast from "react-hot-toast";
import { removeItemFromCart, setCartData } from "@/redux/reducers/cartSlice";
import { useTranslation } from "@/components/Layout/TranslationContext";
import ReviewCard from "@/components/Cards/ReviewCard";

const ProviderServiceDetails = () => {
  const t = useTranslation();

  const router = useRouter();
  const slug = router.query.slug;
  // Extract providerId and serviceId
  let providerId, serviceId;
  if (Array.isArray(slug) && slug.length >= 2) {
    [providerId, serviceId] = slug.slice(-2); // Get the last two elements
  }

  const textRef = useRef(null);
  const locationData = useSelector((state) => state?.location);

  const [serviceData, setServiceData] = useState({});
  const [isExpanded, setIsExpanded] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isloadMore, setIsloadMore] = useState(false);
  const [reviewsData, setReviewsData] = useState([]);
  const [totalReviews, setTotalReviews] = useState(0);
  const limit = 5;
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    if (textRef.current) {
      const { scrollHeight, offsetHeight } = textRef.current;
      setIsOverflowing(scrollHeight > offsetHeight);
    }
  }, [serviceData?.description]);

  const openLightbox = (index) => {
    setCurrentImageIndex(index);
    setIsLightboxOpen(true);
  };

  const closeLightbox = () => {
    setIsLightboxOpen(false);
  };

  const fetchServiceDetails = async () => {
    try {
      const res = await allServices({
        latitude: locationData?.lat,
        longitude: locationData?.lng,
        slug: serviceId,
        provider_slug: providerId,
      });

      if (res?.error === false) {
        setServiceData(res?.data[0]);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (serviceId) {
      fetchServiceDetails();
    }
  }, [serviceId]);
  const rating = serviceData?.average_rating;
  const totalRating = serviceData?.total_ratings;
  // Mock data for ratings and their counts
  const ratingData = [
    { rating: 5, count: serviceData?.rating_5 || 0 },
    { rating: 4, count: serviceData?.rating_4 || 0 },
    { rating: 3, count: serviceData?.rating_3 || 0 },
    { rating: 2, count: serviceData?.rating_2 || 0 },
    { rating: 1, count: serviceData?.rating_1 || 0 },
  ];

  const fetchReviews = async (append = false, customOffset = offset) => {
    if (append) {
      setIsloadMore(true); // Set Load More button state to loading
    } else {
      setLoading(true); // Set initial fetch to loading
    }
    try {
      const response = await getRatings({
        limit: limit,
        offset: customOffset,
        provider_slug: providerId,
        slug: serviceId,
      });
      if (response?.error === false) {
        setReviewsData((prevReviews) =>
          append ? [...prevReviews, ...response?.data] : response?.data
        );
        setTotalReviews(response?.total);
      } else {
        setReviewsData([]);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
      setIsloadMore(false);
    }
  };

  const handleLoadMore = async () => {
    // Compute the new offset value
    const newOffset = offset + limit;
    setOffset(newOffset); // Update the state for offset

    // Pass the computed offset directly to fetchAllProviders
    await fetchReviews(true, newOffset); // Ensure the correct offset is used
  };

  useEffect(() => {
    fetchReviews(false, 0);
  }, []);

  const isLoggedIn = isLogin();
  const dispatch = useDispatch();

  // Get initial quantities from Redux
  const cart = useSelector((state) => state.cart.items);
  const [qty, setQuantities] = useState({});
  const [animationClass, setAnimationClasses] = useState({});

  // Sync state with Redux on component mount
  useEffect(() => {
    const initialQuantities = {};
    cart.forEach((item) => {
      if (item.id && item.qty) {
        initialQuantities[item.id] = item.qty;
      }
    });
    setQuantities(initialQuantities);
  }, [cart]);

  const handleAddQuantity = async (id) => {
    try {
      const currentQuantity = parseInt(qty[id], 10);

      // Check if the current quantity is greater than the maximum allowed
      if (currentQuantity >= serviceData?.max_quantity_allowed) {
        toast.error(t("maxQtyReached"));
        return;
      }

      const newQuantity = currentQuantity + 1;

      // Call API to update the cart
      const response = await ManageCartApi({
        id,
        qty: newQuantity,
      });

      if (response.error === false) {
        // Update local state
        setAnimationClasses((prev) => ({ ...prev, [id]: "slide-in" }));
        setQuantities((prevQuantities) => ({
          ...prevQuantities,
          [id]: newQuantity,
        }));

        // Update Redux state
        const cartData = response;
        const structuredCartItems = cartData?.data.map((item) => ({
          ...item,
          ...item.servic_details,
        }));

        dispatch(
          setCartData({
            provider: cartData,
            items: structuredCartItems || [],
          })
        );

        toast.success(t("serviceUpdatedSuccessFullyToCart"));

        // Reset animation
        setTimeout(() => {
          setAnimationClasses((prev) => ({ ...prev, [id]: "" }));
        }, 300);
      } else {
        toast.error(response?.message);
      }
    } catch (error) {
      console.error("Error while adding quantity:", error);
      toast.error("Failed to add quantity");
    }
  };

  const handleRemoveQuantity = async (id) => {
    try {
      const currentQty = qty[id];

      if (currentQty > 1) {
        // If quantity is greater than 1, decrement it
        const response = await ManageCartApi({ id, qty: currentQty - 1 });

        if (response.error === false) {
          // Update local state
          setAnimationClasses((prev) => ({ ...prev, [id]: "slide-out" }));
          setQuantities((prevQuantities) => ({
            ...prevQuantities,
            [id]: currentQty - 1,
          }));

          // Update Redux state
          const cartData = response;
          const structuredCartItems = cartData?.data.map((item) => ({
            ...item,
            ...item.servic_details,
          }));

          dispatch(
            setCartData({
              provider: cartData,
              items: structuredCartItems || [],
            })
          );
          toast.success(t("serviceUpdatedSuccessFullyToCart"));

          // Reset animation
          setTimeout(() => {
            setAnimationClasses((prev) => ({ ...prev, [id]: "" }));
          }, 300);
        }
      }
    } catch (error) {
      console.error("Error while removing quantity:", error);
      toast.error("Failed to update cart.");
    }
  };

  const handleRemoveItem = async (id) => {
    try {
      const currentQty = Number(qty[id]);
      if (currentQty === 1) {
        // If quantity is 1, remove the item from the cart
        const response = await removeCartApi({ itemId: id });

        if (response.error === false) {
          // Update local state
          const updatedQuantities = { ...qty };
          delete updatedQuantities[id];
          setQuantities(updatedQuantities);

          // Update Redux state
          dispatch(removeItemFromCart(id));
          toast.success(t("serviceRemovedSuccessFullyFromCart"));
        } else {
          toast.error(response?.message);
        }
      }
    } catch (error) {
      console.error("Error while removing quantity:", error);
      toast.error("Failed to update cart.");
    }
  };

  const handleAddToCart = async (e, data) => {
    e.preventDefault();

    if (!isLoggedIn) {
      toast.error(t("plzLoginfirst"));
      return false;
    }

    // // Ensure provider data is available
    // if (!provider || !provider.provider_id || !provider.company_name) {
    //   toast.error("Provider data is missing or invalid.");
    //   console.error("Invalid provider data:", provider);
    //   return false;
    // }

    try {
      // Call API to add the item to the cart
      const response = await ManageCartApi({ id: data.id, qty: 1 });

      if (response.error === false) {
        // Update local state
        setQuantities((prev) => ({ ...prev, [data.id]: 1 }));

        // Update Redux state
        const cartData = response;
        const structuredCartItems = cartData?.data.map((item) => ({
          ...item,
          ...item.servic_details,
        }));

        dispatch(
          setCartData({
            provider: cartData,
            items: structuredCartItems || [],
          })
        );

        toast.success(t("serviceAddedSuccessFullyToCart"));
      } else {
        toast.error(response?.message);
      }
    } catch (error) {
      console.error("Error while adding to cart:", error);
      toast.error("Failed to add item to cart");
    }
  };

  return (
    <Layout>
      <BreadCrumb
        firstEle={t("providers")}
        secEle={t("providerDetails")}
        thirdEle={t("serviceDetails")}
        firstEleLink="/providers"
        SecEleLink={`/provider-details/${providerId}`}
        thirdEleLink={`/provider-details/${providerId}/${serviceId}`}
      />
      <section className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pb-6">
          {/* Left Section */}
          <div className="col-span-12 lg:col-span-4">
            <div className="service_image h-[300px] lg:h-[540px] sticky top-40">
              <CustomImageTag
                src={serviceData?.image_of_the_service}
                alt="service_image"
                className="w-full h-full object-cover rounded-xl"
              />
            </div>
          </div>

          {/* Right Section */}
          <div className="col-span-12 lg:col-span-8">
            {/* service details */}
            <div className="flex flex-col">
              <span className="text-lg lg:text-[28px] font-extrabold">
                {serviceData?.title}{" "}
              </span>
              <div className="mt-4">
                <p
                  className={`text-sm description_color leading-relaxed transition-opacity duration-300 ${isExpanded ? "opacity-100" : "line-clamp-2 opacity-80"
                    }`}
                >
                  {serviceData?.description}
                </p>
                {isOverflowing && (
                  <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="font-medium underline text-sm mt-1"
                  >
                    {isExpanded ? t("showLess") : t("readMore")}
                  </button>
                )}
              </div>

              <div className="flex items-center gap-4 sm:gap-6 mt-7">
                {serviceData?.total_ratings > 0 && (
                  <>
                    <span className="flex items-center gap-1">
                      <FaStar className="text-yellow-500" />
                      <span className="ml-1 text-sm font-bold">
                        {serviceData?.total_ratings}
                      </span>
                    </span>
                    <span className="border border-gray-500 h-3"></span>
                  </>
                )}
                {serviceData?.number_of_members_required > 0 && (
                  <>
                    <span className="flex items-center gap-1">
                      <FaUserFriends className="mr-1 primary_text_color" />
                      <span className="ml-1 text-sm flex items-center gap-1">
                        <span> {serviceData?.number_of_members_required}</span> <span className="hidden lg:block"> {t("persons")}</span>
                      </span>
                    </span>
                    <span className="border border-gray-500 h-3"></span>
                  </>
                )}
                {serviceData?.duration && (
                  <span className="flex items-center gap-1 pl-2">
                    <FaClock className="mr-1 primary_text_color" />
                    <span className="ml-1 text-sm flex items-center gap-1">
                      <span> {serviceData?.duration}</span> <span className="hidden lg:block"> {t("minutes")}</span>
                    </span>
                  </span>
                )}
              </div>

              <div className="flex items-center gap-8 mt-7">
                {serviceData?.discounted_price > 0 ? (
                  <div className="flex flex-col gap-1">
                    <span className="text-base sm:text-[28px] font-semibold">
                      {showPrice(serviceData?.discounted_price)}
                    </span>
                    <span className="text-xs sm:text-lg primary_text_color line-through">
                      {showPrice(serviceData?.price)}
                    </span>
                  </div>
                ) : (
                  <span className="primary_text_color text-base sm:text-[28px] font-semibold">
                    {showPrice(serviceData?.price)}
                  </span>
                )}
                {serviceData?.id && qty[serviceData.id] > 0 ? (
                  <button className="px-4 py-2 mt-2 text-xs sm:text-sm font-medium light_bg_color primary_text_color rounded-md overflow-hidden w-full xl:w-fit">
                    <span className="flex items-center justify-between gap-6">
                      {qty[serviceData.id] > 1 ? (
                        <span
                          onClick={() => handleRemoveQuantity(serviceData.id)}
                        >
                          <FaMinus />
                        </span>
                      ) : (
                        <span onClick={() => handleRemoveItem(serviceData.id)}>
                          <FaTrash size={16} />
                        </span>
                      )}
                      <span
                        className={`relative ${animationClass[serviceData.id]
                          } transition-transform duration-300`}
                      >
                        {qty[serviceData.id]}
                      </span>
                      <span onClick={() => handleAddQuantity(serviceData.id)}>
                        <FaPlus />
                      </span>
                    </span>
                  </button>
                ) : (
                  <button
                    className="w-full xl:w-fit px-4 py-2 mt-2 text-xs sm:text-sm font-medium light_bg_color primary_text_color rounded-md"
                    onClick={(e) => handleAddToCart(e, serviceData)}
                  >
                    {t("addToCart")}
                  </button>
                )}
              </div>
              <hr className="text-gray-300 my-7" />
            </div>

            {/* About Service */}
            {serviceData?.long_description && (
              <div className="flex flex-col">
                <span className="text-lg lg:text-2xl font-extrabold">
                  {t("aboutService")}{" "}
                </span>
                <div className="mt-4">
                  <p
                    className="text-sm description_color"
                    dangerouslySetInnerHTML={{
                      __html: serviceData?.long_description || "",
                    }}
                  ></p>
                </div>
              </div>
            )}
            {/* Gallary Section */}
            {serviceData?.other_images?.length > 0 && (
              <div className="flex flex-col">
                <span className="text-lg lg:text-2xl font-extrabold my-7">
                  {t("gallery")}{" "}
                </span>

                <div className="photos grid grid-cols-3 md:grid-cols-6 gap-4">
                  {serviceData?.other_images.slice(0, 6).map((image, index) => (
                    <div
                      className="photo cursor-pointer"
                      key={index}
                      onClick={() => openLightbox(index)}
                    >
                      <div className="relative rounded-md overflow-hidden">
                        <CustomImageTag
                          src={image}
                          alt="service_images"
                          className="w-full h-[96px] object-cover"
                        />
                        {/* Show "+X More" on the last image if there are more than 6 images */}
                        {index === 5 &&
                          serviceData?.other_images.length > 6 && (
                            <div className="absolute inset-0 bg-gray-900 bg-opacity-70 flex justify-center items-center">
                              <span className="text-md font-bold text-white">
                                +{serviceData?.other_images.length - 6}{" "}
                                {t("more")}
                              </span>
                            </div>
                          )}
                      </div>
                    </div>
                  ))}
                </div>
                {isLightboxOpen && (
                  <Lightbox
                    isLightboxOpen={isLightboxOpen}
                    images={serviceData.other_images} // Pass all images to the Lightbox
                    initialIndex={currentImageIndex} // Start at the clicked image
                    onClose={closeLightbox} // Close handler
                  />
                )}
              </div>
            )}

            {/* Brochure/Files */}
            {serviceData?.files?.length > 0 && (
              <div className="flex flex-col">
                <span className="text-lg lg:text-2xl font-extrabold my-7">
                  {t("brochureAndFiles")}{" "}
                </span>
                <div className="flex flex-row flex-wrap items-center gap-4">
                  {serviceData?.files?.map((file, index) => {
                    // Extract the file name without extension
                    const fileName = file
                      .split("/")
                      .pop()
                      .split(".")
                      .slice(0, -1)
                      .join(".");

                    return (
                      <a
                        key={index}
                        href={file} // File URL
                        download // Ensures the file is downloaded
                        target="_blank"
                        className="relative flex items-center border rounded-[8px] p-4 gap-4 overflow-hidden group cursor-pointer no-underline"
                      >
                        {/* Icon and File Name */}
                        <div className="flex items-center gap-4 transition-opacity duration-300 group-hover:opacity-0">
                          <IoIosDocument
                            size={22}
                            className="primary_text_color"
                          />
                          <span className="text-base font-medium">
                            {fileName}
                          </span>
                        </div>

                        {/* Hover Overlay */}
                        <div className="absolute inset-0 primary_bg_color flex justify-center items-center text-white text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          {t("download")}
                        </div>
                      </a>
                    );
                  })}
                </div>
              </div>
            )}
            {/* FAQS Section */}
            {serviceData?.faqs?.length > 0 && (
              <>
                <div className="flex flex-col">
                  <span className="text-lg lg:text-2xl font-extrabold my-7">
                    {t("faqs")}{" "}
                  </span>
                  <div className="faqs w-full flex flex-col gap-4">
                    {serviceData?.faqs.map((faq, index) => (
                      <FaqAccordion faq={faq} key={index} />
                    ))}
                  </div>
                </div>
                <hr className="text-gray-300 my-7" />
              </>
            )}
            <div className="service-reviews">
              <span className="text-2xl font-semibold">
                {t("ratingAndReviews")}
              </span>
              <div className="grid grid-cols-12 border rounded-md mt-6 px-[18px] py-4 gap-4">
                <div className="col-span-12 md:col-span-3">
                  <div className="flex flex-col items-center justify-center w-full h-full light_bg_color rounded-md px-4 py-6">
                    <span className="text-[28px] font-medium primary_text_color">
                      {rating}
                    </span>
                    <Rating rating={rating} />
                    <span className="mt-2 text-base description_color">
                      {totalRating} {t("ratings")}
                    </span>
                  </div>
                </div>
                <div className="col-span-12 md:col-span-9">
                  {ratingData.map((item) => {
                    const progressPercentage =
                      totalRating > 0
                        ? Math.round((item.count / totalRating) * 100) // Round to nearest whole number
                        : 0;

                    return (
                      <div className="rating_progress mb-2" key={item.rating}>
                        <div className="flex gap-4 items-center">
                          <span>{item.rating}</span>
                          <Progress
                            value={progressPercentage}
                            className="progress flex-1 h-2 mx-2 rounded-lg"
                            style={{ fill: "#4caf50" }}
                          />
                          <span>{progressPercentage}%</span>{" "}
                          {/* Display whole number percentage */}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="space-y-8 mt-6">
                {reviewsData.map((review) => (
                  <ReviewCard
                    review={review}
                    key={review.id}
                    isLightboxOpen={isLightboxOpen}
                    currentImageIndex={currentImageIndex}
                    openLightbox={openLightbox}
                    closeLightbox={closeLightbox}
                  />
                ))}
              </div>

              {/* Load More Button */}
              <div className="flex items-center justify-center mt-6">
                {isloadMore ? (
                  <button className="primary_bg_color primary_text_color py-3 px-8 rounded-xl">
                    <MiniLoader />
                  </button>
                ) : (
                  reviewsData.length < totalReviews && (
                    <button
                      onClick={handleLoadMore}
                      className="light_bg_color primary_text_color py-3 px-8 rounded-xl"
                      disabled={isloadMore}
                    >
                      {t("loadMore")}
                    </button>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default ProviderServiceDetails;
