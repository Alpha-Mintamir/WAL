"use client";
import { ManageCartApi, removeCartApi } from "@/api/apiRoutes";
import { removeFromCart, setCartData } from "@/redux/reducers/cartSlice";
import { isLogin, showPrice, useRTL } from "@/utils/Helper";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  FaClock,
  FaMinus,
  FaPlus,
  FaStar,
  FaTrash,
  FaUserFriends,
} from "react-icons/fa";
import { FaArrowRightLong } from "react-icons/fa6";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { useTranslation } from "../Layout/TranslationContext";
import CustomImageTag from "../ReUseableComponents/CustomImageTag";

const ProviderDetailsServiceCard = ({ slug, provider, data, compnayName }) => {
  const t = useTranslation();
  const isLoggedIn = isLogin();
  const dispatch = useDispatch();
  const isRTL = useRTL();

  // Get initial quantities from Redux
  const cart = useSelector((state) => state.cart.items);
  const [qty, setQuantities] = useState({});
  const [animationClass, setAnimationClasses] = useState({});

  // Sync state with Redux on component mount
  useEffect(() => {
    const initialQuantities = {};
    cart?.forEach((item) => {
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
      if (currentQuantity >= data?.max_quantity_allowed) {
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
          dispatch(removeFromCart(id));
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
    <div className="flex flex-col md:flex-row items-center px-4 py-4 mt-4 gap-2 card_bg border rounded-lg shadow-sm space-y-4 sm:space-y-0 sm:space-x-4">
      <div className="relative w-full md:w-32 h-32">
        <CustomImageTag
          src={data?.image_of_the_service}
          alt="Service"
          className="object-cover w-full h-full rounded-lg"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent rounded-lg" />
        {data?.discount > 0 && (
          <span className="absolute top-0 left-0 bottom-3 mx-auto px-2 py-1 text-base sm:text-xl font-extrabold text-white rounded flex items-end justify-center w-full">
            <span className="w-1/2 text-center">
              {data?.discount}% {t("off")}
            </span>
          </span>
        )}
      </div>

      <div className={`flex-1 w-full ${isRTL ? "md:mr-4" : "md:ml-4"}`}>
        <h2 className="text-base sm:text-lg font-semibold line-clamp-1">{data?.title}</h2>
        <p className="text-xs sm:text-sm description_color line-clamp-2">
          {data?.description}
        </p>
        <div className="flex flex-wrap items-center justify-between mt-2">
          <div className="flex flex-col items-start text-xs sm:text-sm description_color space-y-2 w-full">
            <div
              className={`flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""
                }`}
            >
              <span
                className={`flex items-center ${isRTL ? "flex-row-reverse" : ""
                  }`}
              >
                <FaUserFriends
                  className={`${isRTL ? "ml-1" : "mr-1"} primary_text_color`}
                />
                {data?.number_of_members_required}
              </span>
              <span
                className={`flex items-center ${isRTL ? "flex-row-reverse" : ""
                  }`}
              >
                <FaClock
                  className={`${isRTL ? "ml-1" : "mr-1"} primary_text_color`}
                />
                {data?.duration}
              </span>
              {data?.rating > 0 && (
                <div
                  className={`flex items-center ${isRTL ? "flex-row-reverse" : ""
                    }`}
                >
                  <FaStar className="text-yellow-500" />
                  <span
                    className={`${isRTL ? "mr-1" : "ml-1"} text-sm font-bold`}
                  >
                    {parseFloat(data?.rating).toFixed(1)} {/* Convert to number and display 2 decimal places */}
                  </span>
                </div>
              )}
            </div>
            <div className="flex flex-col md:flex-row justify-between items-center w-full gap-2">
              <div
                className={`flex items-center justify-between md:justify-start w-full xl:w-fit gap-2 ${isRTL ? "flex-row-reverse" : ""
                  }`}
              >
                {data?.discounted_price > 0 ? (
                  <div className="flex items-center gap-2">
                    <span className="text-base sm:text-lg font-bold">
                      {showPrice(data?.price_with_tax)}
                    </span>
                    <span className="text-xs sm:text-sm description_color line-through">
                      {showPrice(data?.original_price_with_tax)}
                    </span>
                  </div>
                ) : (
                  <span className="text-base sm:text-lg font-bold">
                    {showPrice(data?.price_with_tax)}
                  </span>
                )}
                <Link
                  href={`/provider-details/${slug}/${data?.slug}`}
                  title={`${compnayName}/${data?.slug}`}
                >
                  <span
                    className={`group text-base font-normal primary_text_color transition-all duration-500 w-full flex items-center ${isRTL ? "flex-row-reverse" : ""
                      } justify-between md:justify-start gap-2`}
                  >
                    <span className="group-hover:underline">
                      {t("viewMore")}
                    </span>
                    <span className="relative hidden md:inline-block overflow-hidden">
                      <FaArrowRightLong
                        size={16}
                        className={`${isRTL ? "rotate-180" : ""
                          } translate-x-[-10px] opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-transform duration-300 ease-out`}
                      />
                    </span>
                  </span>
                </Link>
              </div>

              {data?.id && qty[data.id] > 0 ? (
                <button className="px-4 py-2 mt-2 text-xs sm:text-sm font-medium light_bg_color primary_text_color rounded-md overflow-hidden w-full xl:w-fit">
                  <span
                    className={`flex items-center justify-between gap-6 ${isRTL ? "flex-row-reverse" : ""
                      }`}
                  >
                    {qty[data.id] > 1 ? (
                      <span onClick={() => handleRemoveQuantity(data.id)}>
                        <FaMinus />
                      </span>
                    ) : (
                      <span onClick={() => handleRemoveItem(data.id)}>
                        <FaTrash size={16} />
                      </span>
                    )}
                    <span
                      className={`relative ${animationClass[data.id]
                        } transition-transform duration-300`}
                    >
                      {qty[data.id]}
                    </span>
                    <span onClick={() => handleAddQuantity(data.id)}>
                      <FaPlus />
                    </span>
                  </span>
                </button>
              ) : (
                <button
                  className="w-full xl:w-fit px-4 py-2 mt-2 text-xs sm:text-sm font-medium light_bg_color primary_text_color rounded-md"
                  onClick={(e) => handleAddToCart(e, data)}
                >
                  {t("addToCart")}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderDetailsServiceCard;
