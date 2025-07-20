"use client";
import {
  addTransactionsApi,
  applyRateServiceApi,
  changeOrderStatusApi,
  createRazorOrderApi,
  getCartApi,
  getOrdersApi,
} from "@/api/apiRoutes";
import Layout from "@/components/Layout/Layout";
import BreadCrumb from "@/components/ReUseableComponents/BreadCrumb";
import CustomImageTag from "@/components/ReUseableComponents/CustomImageTag";
import Lightbox from "@/components/ReUseableComponents/CustomLightBox/LightBox";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  DownloadInvoice,
  getPaymentStatusAdditionalChargeUI,
  getPaymentStatusUI,
  isLogin,
  isMobile,
  paymentModes,
  showPrice,
  statusColors,
  statusNames,
} from "@/utils/Helper";
import dayjs from "dayjs";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { BsChatSquareDotsFill } from "react-icons/bs";
import {
  FaChevronDown,
  FaRegCalendarCheck,
  FaRegClock,
  FaStar
} from "react-icons/fa";
import { CgNotes } from "react-icons/cg";

import { IoLocationOutline, IoPhonePortraitOutline } from "react-icons/io5";
import toast from "react-hot-toast";
import SideNavigation from "../ProfilePages/SideNavigation";
import SelectDateAndTimeDrawer from "@/components/ReUseableComponents/Drawers/SelectDateAndTimeDrawer";
import { MdArrowBackIosNew } from "react-icons/md";
import MiniLoader from "@/components/ReUseableComponents/MiniLoader";
import { useTranslation } from "@/components/Layout/TranslationContext";
import withAuth from "@/components/Layout/withAuth";
import PaymentMethodDrawer from "@/components/ReUseableComponents/Dialogs/PaymentMethodDrawer";
import { useSelector } from "react-redux";
import stripe from "../../../assets/stripe.png";
import paypal from "../../../assets/paypal.png";
import paystack from "../../../assets/paystack.png";
import flutterwave from "../../../assets/flutterwave.png";
import razorpay from "../../../assets/razorpay.png";
import cod from "../../../assets/cod.png";
import Stripe from "stripe";
import StripePayment from "@/components/Checkout/PaymentGateways/StripePayment";
import PaystackPop from "@paystack/inline-js";
import RateServiceDialog from "@/components/ReUseableComponents/Dialogs/RateServiceDialog";
import { setReorderMode } from "@/redux/reducers/reorderSlice";
import { getChatData } from "@/redux/reducers/helperSlice";
import { store } from "@/redux/store";
import { useDispatch } from "react-redux";
import NoDataFound from "@/components/ReUseableComponents/Error/NoDataFound";
import { Skeleton } from "@/components/ui/skeleton";
import BookingDetailsPage from "@/components/Skeletons/BookingDetailsPage";

const BookingDetails = () => {
  const t = useTranslation();
  const router = useRouter();
  const dispatch = useDispatch();
  const slug = router?.query?.slug;
  const settingsData = useSelector((state) => state?.settingsData);
  const [bookingData, setBookingData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isReviewLightBox, setIsReviewLightBox] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [lightboxReviewImages, setLightboxReviewImages] = useState([]);
  const [scheduleDrawerOpen, setScheduleDrawerOpen] = useState(false);
  const [reviewImagesCurrentImageIndex, setReviewImagesCurrentImageIndex] =
    useState(0);
  const [isIsStartedWorkLightboxOpen, setIsStartedWorkLightboxOpen] =
    useState(false);
  const [startedWorkCurrentImageIndex, setStartedWorkCurrentImageIndex] =
    useState(0);
  const [isIsEndedWorkLightboxOpen, setIsEndedWorkLightboxOpen] =
    useState(false);
  const [endedWorkCurrentImageIndex, setEndedWorkCurrentImageIndex] =
    useState(0);
  const [expandedItems, setExpandedItems] = useState({});
  const [isPaymentDrawerOpen, setIsPaymentDrawerOpen] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [isRateServiceOpen, setIsRateServiceOpen] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState(null);
  const [selectedCustomJobRequestId, setSelectedCustomJobRequestId] =
    useState(null);
  const [existingReview, setExistingReview] = useState(null);

  const userDetails = useSelector((state) => state?.userData?.data);
  const userEmail = userDetails?.email;

  const openLightboxStartedWork = (index) => {
    setStartedWorkCurrentImageIndex(index);
    setIsStartedWorkLightboxOpen(true);
  };

  const closeLightboxStartedWork = () => {
    setIsStartedWorkLightboxOpen(false);
  };
  const openLightboxEndedWork = (index) => {
    setEndedWorkCurrentImageIndex(index);
    setIsEndedWorkLightboxOpen(true);
  };

  const closeLightboxEndedWork = () => {
    setIsEndedWorkLightboxOpen(false);
  };
  // Function to open the Lightbox
  const openLightboxReview = (images, index) => {
    setLightboxReviewImages(images);
    setReviewImagesCurrentImageIndex(index);
    setIsReviewLightBox(true);
  };

  const closeLightboxReview = () => {
    setIsReviewLightBox(false);
  };

  const fetchBookingDetails = async () => {
    try {
      setIsLoading(true);
      const response = await getOrdersApi({
        slug: slug,
      });
      if (response?.error === false) {
        setBookingData(response?.data[0]);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (slug && router.isReady) {
      fetchBookingDetails();
    }
  }, [slug, router.isReady]);

  // Calculate subtotal only if total exists and is greater than 0
  const subTotal = bookingData?.total > 0
    ? (bookingData?.total || 0) - (bookingData?.tax_amount || 0)
    : 0;

  const priceBreakdown = [
    {
      label: t("subTotal"),
      amount: subTotal
    },
    {
      label: t("visitingCharges"),
      amount: bookingData?.visiting_charges,
      prefix: "+",
    },
    {
      label: `${t("promocode")} (${bookingData?.promo_code || ""})`,
      amount: bookingData?.promo_discount,
      prefix: "-",
    },
    {
      label: t("additionalCharges"),
      amount: bookingData?.total_additional_charge,
      prefix: "+",
      subCharges: bookingData?.additional_charges,
    },
  ];

  // Add tax only if total is greater than 0 and tax_amount exists
  if (bookingData?.total > 0 && bookingData?.tax_amount > 0) {
    priceBreakdown.push({
      label: t("tax"),
      amount: bookingData?.tax_amount,
      prefix: "+",
    });
  }

  // Filter out items with zero or undefined amounts
  const finalPriceBreakdown = priceBreakdown.filter(
    (item) => item.amount && item.amount > 0
  );

  const statusColor =
    statusColors[bookingData?.status?.toLowerCase()] || "#6b7280"; // Default to gray if status is unknown
  const statusName = statusNames[bookingData?.status];

  const handleCopyOtp = (otp) => {
    if (!otp) return;

    // Copy to clipboard
    navigator.clipboard
      .writeText(otp)
      .then(() => {
        // Show success toast
        toast.success("OTP copied to clipboard!");
      })
      .catch(() => {
        // Show error toast
        toast.error("Failed to copy OTP. Please try again.");
      });
  };

  // additional charges
  const additionalCharges = bookingData?.additional_charges;
  const totalAdditionalCharges = bookingData?.total_additional_charge;
  const [selectedMethod, setSelectedMethod] = useState(null);

  const handleRecheduleBooking = (e) => {
    e.preventDefault();
    setScheduleDrawerOpen(true);
  };
  const handleOrderCancel = async (e) => {
    e.preventDefault();

    try {
      const response = await changeOrderStatusApi({
        order_id: bookingData?.id,
        status: "cancelled",
      });
      if (response?.error === false) {
        toast.success(response?.message);
        setBookingData(response?.data?.data[0]);
      } else {
        toast.error(response?.message);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleGoback = () => {
    if (bookingData?.custom_job_request_id) {
      router.push("/requested-bookings");
    } else {
      router.push("/general-bookings");
    }
  };

  const toggleExpand = (idx) => {
    setExpandedItems((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  // payment method

  const paymentSettings = settingsData?.settings?.payment_gateways_settings;
  const isPayOnlineAllowed = bookingData?.is_online_payment_allowed === 1;
  const isPayLaterAllowed = bookingData?.is_pay_later_allowed === 1;

  const stripeCurrencyCode = paymentSettings?.stripe_currency;

  const razorpayKey = paymentSettings?.razorpay_key;
  const razorpayCurrencyCode = paymentSettings?.razorpay_currency;

  const paystackCurrencyCode = paymentSettings?.paystack_currency;

  let stripe_secret = paymentSettings?.stripe_secret_key;
  const stripeX = new Stripe(stripe_secret);
  const [clientKey, setClientKey] = useState("");
  const [open, setOpen] = useState(false);

  const paymentMethods = [
    {
      method: "Stripe",
      methodIcon: stripe,
      methodType: "stripe",
      status: isPayOnlineAllowed ? paymentSettings?.stripe_status : "disable",
    },
    {
      method: "Paypal",
      methodIcon: paypal,
      methodType: "paypal",
      status: isPayOnlineAllowed ? paymentSettings?.paypal_status : "disable",
    },
    {
      method: "Paystack",
      methodIcon: paystack,
      methodType: "paystack",
      status: isPayOnlineAllowed ? paymentSettings?.paystack_status : "disable",
    },
    {
      method: "Razorpay",
      methodIcon: razorpay,
      methodType: "razorpay",
      status: isPayOnlineAllowed
        ? paymentSettings?.razorpayApiStatus
        : "disable",
    },
    {
      method: "Flutterwave",
      methodIcon: flutterwave,
      methodType: "flutterwave",
      status: isPayOnlineAllowed
        ? paymentSettings?.flutterwave_status
        : "disable",
    },
    {
      method: "Pay on Service",
      methodIcon: cod,
      methodType: "cod",
      status: isPayLaterAllowed ? paymentSettings?.cod_setting : "disable",
    },
  ];

  const enabledPaymentMethods = paymentMethods.filter(
    (method) => method.status === "enable" || method.status === 1
  );

  const handlePayAdditionalCharges = () => {
    setIsPaymentDrawerOpen(true);
  };

  const handleCODPayment = async (paymentMethod, order_id) => {
    try {
      const response = await addTransactionsApi({
        order_id: order_id,
        status: "pending",
        is_additional_charge: 1,
        payment_method: paymentMethod.toLowerCase(),
      });
      fetchBookingDetails();
      toast.success(response?.message);
      setIsPaymentDrawerOpen(false);
    } catch (error) {
      console.log(error);
    }
  };

  const createPaymentIntent = async (order_id, transactionID) => {
    if (totalAdditionalCharges) {
      try {
        const paymentIntent = await stripeX.paymentIntents.create({
          amount: Math.round(totalAdditionalCharges * 100), // Amount in cents
          currency: stripeCurrencyCode,
          description: "payment",
          metadata: {
            order_id: order_id,
            additional_charges_transaction_id: transactionID,
          },
          // Add other parameters as needed
        });
        setClientKey(paymentIntent.client_secret);
        setOpen(true); // Open the Stripe payment modal

        // Handle the created payment intent here
      } catch (error) {
        console.error("Error creating payment intent:", error);
        // Handle any errors here
      }
    }
  };

  const handleStripePayment = async (paymentMethod, order_id) => {
    try {
      const response = await addTransactionsApi({
        order_id: order_id,
        status: "pending",
        is_additional_charge: 1,
        payment_method: paymentMethod.toLowerCase(),
      });
      if (response?.error === false) {
        const transactionID = response?.data?.id;
        createPaymentIntent(order_id, transactionID);
      } else {
        toast.error(response?.message);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handlePaypalPayment = async (paymentMethod, order_id) => {
    try {
      // Place the order first
      const orderResponse = await addTransactionsApi({
        order_id: order_id,
        status: "pending",
        is_additional_charge: 1,
        payment_method: paymentMethod.toLowerCase(),
      });
      if (orderResponse?.error === false) {
        const paypalUrl = orderResponse?.paypal_link; // Get paypalUrl URL from the response
        const transactionID = orderResponse?.data?.id;

        if (paypalUrl) {
          // Open PayPal URL in the current window
          window.location.href = paypalUrl;
        } else {
          toast.error("Paypal URL not found in the response.");
        }
      } else {
        toast.error(orderResponse.message || "Failed to place order.");
      }
    } catch (error) {
      console.error("Error during Paypal payment:", error);
      toast.error(t("somethingWentWrong"));
    }
  };

  // Handle Paystack Payment
  const handlePaystackPayment = async (paymentMethod, order_id) => {
    try {
      // Place the order first
      const orderResponse = await addTransactionsApi({
        order_id: order_id,
        status: "pending",
        is_additional_charge: 1,
        payment_method: paymentMethod.toLowerCase(),
      });
      if (orderResponse?.error === false) {
        const transactionID = orderResponse.data.id;

        if (!userEmail) {
          toast.error(
            "Please update your email address to proceed with Paystack payment."
          );
          return;
        }

        // Define Paystack success and close handlers
        const onSuccess = async (reference) => {
          try {
            const transactionResponse = await addTransactionsApi({
              order_id: order_id,
              status: "success",
              is_additional_charge: 1,
              payment_method: paymentMethod.toLowerCase(),
            });

            if (transactionResponse.error === false) {
              toast.success("Payment successful! Your order has been placed.");
              router.push(
                `/payment-status?order_id=${order_id}&status=successful`
              );
            } else {
              toast.error(
                transactionResponse.message ||
                "Failed to update transaction status."
              );
            }
          } catch (error) {
            console.error("Error updating transaction:", error);
            toast.error("Something went wrong. Please try again.");
          }
        };

        const onClose = async () => {
          try {
            await addTransactionsApi({
              order_id: order_id,
              status: "cancelled",
              is_additional_charge: 1,
              payment_method: paymentMethod.toLowerCase(),
            });
            toast.info(t("paymentCancelled"));
            router.push(
              `/payment-status?order_id=${order_id}&status=cancelled`
            );
          } catch (error) {
            console.error("Error updating transaction:", error);
            toast.error("Something went wrong. Please try again.");
          }
        };

        // Initialize Paystack payment
        const paystack = new PaystackPop();
        paystack.newTransaction({
          key: paymentSettings?.paystack_key, // Paystack public key
          email: userEmail, // User's email
          amount: totalAdditionalCharges * 100, // Amount in kobo
          currency: paystackCurrencyCode, // Default to NGN if not specified
          reference: `order_${order_id}_${new Date().getTime()}`, // Unique reference
          metadata: {
            order_id: order_id, // Include order ID in metadata
            additional_charges_transaction_id: transactionID,
          },
          onSuccess: onSuccess,
          onClose: onClose,
        });
      } else {
        toast.error(orderResponse.message || "Failed to place order.");
      }
    } catch (error) {
      console.error("Error during Paystack payment:", error);
      toast.error("Something went wrong. Please try again.");
    }
  };

  // handle razorpay payment
  const handleRazorpayPayment = async (paymentMethod, order_id) => {
    try {
      // Place the order first
      const orderResponse = await addTransactionsApi({
        order_id: order_id,
        status: "pending",
        is_additional_charge: 1,
        payment_method: paymentMethod.toLowerCase(),
      });
      if (orderResponse?.error === false) {
        const transactionID = orderResponse.data.id;
        // Create Razorpay order
        const razorpayOrderResponse = await createRazorOrderApi({
          orderId: order_id,
          is_additional_charge: 1,
        });

        if (razorpayOrderResponse.error === false) {
          const razorpayOrderId = razorpayOrderResponse.data.id;

          // Razorpay options
          const options = {
            key: razorpayKey, // Razorpay key from settings
            // amount: totalAdditionalCharges * 100, // Amount in paise
            currency: razorpayCurrencyCode, // Currency from settings
            name: process.env.NEXT_PUBLIC_APP_NAME, // Your app name
            order_id: razorpayOrderId, // Razorpay order ID
            notes: {
              order_id: order_id,
              additional_charges_transaction_id: transactionID,
            },
            description: "Payment for Your Product", // Payment description
            handler: async function (response) {
              if (response.razorpay_payment_id) {
                // Payment successful
                await addTransactionsApi({
                  order_id: order_id,
                  status: "success",
                  is_additional_charge: 1,
                  payment_method: paymentMethod.toLowerCase(),
                })
                  .then((res) => {
                    if (res.error === false) {
                      toast.success(t("paymentSuccessful"));
                      router.push(
                        `/payment-status?order_id=${order_id}&status=successful`
                      );
                    } else {
                      toast.error(
                        res.message || "Failed to update transaction status."
                      );
                    }
                  })
                  .catch((error) => {
                    console.error("Error updating transaction:", error);
                    toast.error(t("somethingWentWrong"));
                  });
              }
            },
            theme: {
              color: "#3399cc", // Customize Razorpay theme color
            },
            modal: {
              ondismiss: async function () {
                // Handle payment popup dismissal
                await addTransactionsApi({
                  order_id: order_id,
                  status: "cancelled",
                  is_additional_charge: 1,
                  payment_method: paymentMethod.toLowerCase(),
                })
                  .then((res) => {
                    toast.error(t("paymentCancelled"));
                    router.push(
                      `/payment-status?order_id=${order_id}&status=failed`
                    );
                  })
                  .catch((error) => {
                    console.error("Error updating transaction:", error);
                    toast.error(t("somethingWentWrong"));
                  });
              },
            },
          };

          // Open Razorpay payment popup
          const razorpayInstance = new window.Razorpay(options);
          razorpayInstance.open();
        } else {
          toast.error(
            razorpayOrderResponse.message || "Failed to create Razorpay order."
          );
        }
      } else {
        toast.error(orderResponse.message || "Failed to place order.");
      }
    } catch (error) {
      console.error("Error during Razorpay payment:", error);
      toast.error(t("somethingWentWrong"));
    }
  };

  // Handle Flutterwave Payment
  const handleFlutterwavePayment = async (paymentMethod, order_id) => {
    try {
      // Place the order first
      const orderResponse = await addTransactionsApi({
        order_id: order_id,
        status: "pending",
        is_additional_charge: 1,
        payment_method: paymentMethod.toLowerCase(),
      });
      if (orderResponse?.error === false) {
        const flutterwaveUrl = orderResponse?.flutterwave_link; // Get flutterwaveUrl URL from the response
        const transactionID = orderResponse?.data?.id;

        if (flutterwaveUrl) {
          // Open PayPal URL in the current window
          window.location.href = flutterwaveUrl;
        } else {
          toast.error("Flutterwave URL not found in the response.");
        }
      } else {
        toast.error(orderResponse.message || "Failed to place order.");
      }
    } catch (error) {
      console.error("Error during Flutterwave payment:", error);
      toast.error(t("somethingWentWrong"));
    }
  };

  const proceedToPayment = (paymentMethod, order_id) => {
    switch (paymentMethod.toLowerCase()) {
      case "cod":
        handleCODPayment(paymentMethod, order_id);
        break;
      case "stripe":
        handleStripePayment(paymentMethod, order_id);
        break;
      case "paypal":
        handlePaypalPayment(paymentMethod, order_id);
        break;
      case "paystack":
        handlePaystackPayment(paymentMethod, order_id);
        break;
      case "razorpay":
        handleRazorpayPayment(paymentMethod, order_id);
        break;
      case "flutterwave":
        handleFlutterwavePayment(paymentMethod, order_id);
        break;
      default:
        toast.error(t("invalidPaymentMethodSelected"));
    }
  };
  const handlePaymentSubmit = async (paymentMethod) => {
    const order_id = bookingData?.id;
    proceedToPayment(paymentMethod, order_id);
  };

  useEffect(() => { }, [selectedMethod]);

  const handleRateService = (id, existingReview = null, isCustomJob) => {
    if (isCustomJob) {
      setSelectedCustomJobRequestId(id);
    } else {
      setSelectedServiceId(id);
    }
    setIsRateServiceOpen(true);
    if (existingReview) {
      setExistingReview(existingReview);
    } else {
      setExistingReview(null);
    }
  };

  const handleSubmitReview = async (formData) => {
    try {
      const response = await applyRateServiceApi({
        id: selectedServiceId ? selectedServiceId : "",
        rating: formData.rating,
        comment: formData.comment,
        images: formData?.images,
        custom_job_request_id: selectedCustomJobRequestId
          ? selectedCustomJobRequestId
          : "",
      });
      if (response?.error === false) {
        toast.success(response?.message);
        fetchBookingDetails();
        setIsRateServiceOpen(false);
      } else {
        toast.error(response?.message);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleReOrder = async (id) => {
    try {
      const response = await getCartApi({
        order_id: id,
      });

      if (response.error === false) {
        const reorderData = response.data?.reorder_data;

        // Dispatch with flattened structure
        dispatch(
          setReorderMode({
            isReOrder: true,
            orderId: id,
            provider: {
              provider_id: reorderData.provider_id,
              provider_name: reorderData.provider_names,
              company_name: reorderData.company_name,
              visiting_charges: reorderData.visiting_charges,
              at_doorstep: reorderData.at_doorstep,
              at_store: reorderData.at_store,
              is_pay_later_allowed: reorderData.is_pay_later_allowed,
              is_online_payment_allowed: reorderData.is_online_payment_allowed,
              sub_total: reorderData.sub_total,
              overall_amount: reorderData.overall_amount,
            },
            items: reorderData.data,
          })
        );

        toast.success(t("serviceAddedToCart"));
        router.push("/checkout");
      } else {
        toast.error(response?.message || t("failedToReorder"));
      }
    } catch (error) {
      console.error("Reorder error:", error);
      toast.error(t("somethingWentWrong"));
    }
  };
  const isLoggedIn = isLogin();

  const settings = store.getState().settingsData?.settings;

  const isPostBookingChatAvailable =
    settings?.general_settings?.allow_post_booking_chat === "1";

  const isProviderPostBookingChatAvailable =
    bookingData?.post_booking_chat === "1";

  const handleChat = (e) => {
    e.preventDefault();
    if (!isLoggedIn) {
      toast.error(t("plzLoginfirst"));
      return false;
    }
    try {
      getChatData({
        booking_id: bookingData?.id,
        partner_id: bookingData?.partner_id,
        partner_name: bookingData?.company_name,
        image: bookingData?.profile_image,
        order_status: bookingData?.status,
      });
      router.push("/chats");
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    // Handle browser back button
    const handlePopState = (event) => {
      if (bookingData?.custom_job_request_id) {
        router.replace("/requested-bookings");
      } else {
        router.replace("/general-bookings");
      }
    };

    // Add event listener for browser back button
    window.addEventListener('popstate', handlePopState);

    // Cleanup
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [bookingData]);


  return (
    <Layout>
      <BreadCrumb firstEle={t("bookingDetails")} isMobile={isMobile} />

      <section className="profile_sec md:my-12">
        <div className="container mx-auto">
          <div className="grid grid-cols-12 gap-6">
            {/* Sidebar */}
            <div className="col-span-12 lg:col-span-3 hidden md:block">
              <SideNavigation />
            </div>

            {/* Main Content */}
            {isLoading ? (
              <BookingDetailsPage />
            ) : bookingData ? (
              <div className="col-span-12 lg:col-span-9">
                <div className="flex flex-col gap-6">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={handleGoback}
                      className="background_color p-3 rounded-lg"
                      title={t("back")}
                    >
                      <MdArrowBackIosNew size={18} />
                    </button>

                    <div className="page-headline text-xl sm:text-2xl md:text-3xl font-semibold">
                      <span>{t("bookingDetails")}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-6">
                    <main className="w-full space-y-6">
                      {/* Provider details  */}
                      <section className="space-y-4">
                        <h2 className="description_color">{t("provider")}</h2>
                        <div className="flex  items-start md:items-center gap-3 md:gap-4 justify-between flex-row ">
                          <div className="flex flex-col md:flex-row gap-3 ">
                            <Avatar className="h-[52px] w-[52px] rounded-[4px]">
                              <AvatarImage
                                src={bookingData?.profile_image}
                                alt=""
                                width={0}
                                height={0}
                              />
                            </Avatar>
                            <div className="flex-1">
                              <h3 className=" text-base sm:text-lg font-medium">
                                {bookingData?.company_name}
                              </h3>
                              <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2">
                                  <span className="description_color">
                                    {t("invoice")}
                                  </span>
                                  <span className="">
                                    {bookingData?.invoice_no}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="description_color text-base">
                              {t("status")}
                            </div>
                            <div className="flex items-center gap-2">
                              {/* Render the status text with dynamic color */}
                              <span
                                className="text-lg capitalize"
                                style={{ color: statusColor }}
                              >
                                {t(statusName)}
                              </span>
                              {/* Render the status dot with dynamic background color */}
                              <div
                                className="w-[18px] h-[18px] rounded-full flex items-center justify-center"
                                style={{ backgroundColor: `${statusColor}29` }} // Lighter background
                              >
                                <div
                                  className="w-2 h-2 rounded-full"
                                  style={{ backgroundColor: statusColor }} // Solid dot color
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between w-full gap-4 flex-col md:flex-row">
                          <div className="flex gap-4 w-full md:w-auto">
                            {isPostBookingChatAvailable &&
                              isProviderPostBookingChatAvailable && (
                                <button
                                  className={`p-3 rounded-lg flex items-center gap-2 ${bookingData?.status === "cancelled" ||
                                    bookingData?.status === "completed"
                                    ? "background_color description_color cursor-not-allowed" // Disabled styles
                                    : "light_bg_color primary_text_color" // Default styles
                                    }`}
                                  disabled={
                                    bookingData?.status === "cancelled" ||
                                    bookingData?.status === "completed"
                                  }
                                  onClick={handleChat}
                                >
                                  <BsChatSquareDotsFill size={22} />
                                </button>
                              )}
                            {(bookingData?.status === "awaiting" ||
                              bookingData?.status === "confirmed") && (
                                <button
                                  className="p-3 border border_color rounded-lg bg-transparent primary_text_color"
                                  onClick={(e) => {
                                    handleRecheduleBooking(e);
                                  }}
                                >
                                  {t("rechedule")}
                                </button>
                              )}
                            {bookingData?.status === "completed" &&
                              (downloading ? (
                                <button className="primary_bg_color primary_text_color py-3 px-8 rounded-xl w-full">
                                  <MiniLoader />
                                </button>
                              ) : (
                                <button
                                  className="rounded-[8px] light_bg_color border-none flex items-center justify-center p-[10px] primary_text_color w-full"
                                  onClick={() =>
                                    DownloadInvoice(
                                      bookingData?.id,
                                      setDownloading
                                    )
                                  }
                                >
                                  {t("downloadInvoice")}
                                </button>
                              ))}
                            {bookingData?.is_otp_enalble === "1" &&
                              bookingData?.status !== "completed" && (
                                <div className="flex items-center gap-2">
                                  <span className="description_color">
                                    {t("otp")}:
                                  </span>
                                  <button
                                    className="p-2 rounded-lg background_color"
                                    onClick={() =>
                                      handleCopyOtp(bookingData?.otp)
                                    }
                                  >
                                    {bookingData?.otp}
                                  </button>
                                </div>
                              )}
                          </div>
                          <div className="w-full md:w-auto">
                            {bookingData?.status === "booking_ended" &&
                              bookingData?.additional_charges.length > 0 &&
                              bookingData?.payment_status_of_additional_charge ===
                              "" && (
                                <button
                                  className="p-3 border border_color rounded-lg primary_text_color"
                                  onClick={handlePayAdditionalCharges}
                                >
                                  {t("payAdditionalCharges")}
                                </button>
                              )}
                            {bookingData?.is_cancelable === 1 &&
                              bookingData?.status !== "cancelled" && (
                                <button
                                  className="p-3 border rounded-lg description_color"
                                  onClick={(e) => handleOrderCancel(e)}
                                >
                                  {t("cancelBooking")}
                                </button>
                              )}
                            {bookingData?.is_reorder_allowed === "1" &&
                              bookingData?.status === "completed" && (
                                <>
                                  <button
                                    className="p-3 border border_color rounded-lg primary_text_color w-full"
                                    onClick={() =>
                                      handleReOrder(bookingData.id)
                                    }
                                  >
                                    {t("reBook")}
                                  </button>
                                </>
                              )}
                          </div>
                        </div>
                      </section>

                      <Separator />
                      {/* Booking Scheduled Details */}
                      {bookingData?.starting_time &&
                        bookingData?.ending_time &&
                        bookingData?.date_of_service && (
                          <>
                            <section className="space-y-4">
                              <div className="flex flex-col gap-1 w-full">
                                <h2 className="description_color">
                                  {t("scheduledOn")}
                                </h2>
                                <div className="flex max-[350px]:flex-wrap gap-6 w-full">
                                  <div className="flex items-center gap-3">
                                    <FaRegCalendarCheck
                                      size={22}
                                      className="primary_text_color "
                                    />

                                    <span className="md:text-lg font-normal">
                                      {bookingData?.date_of_service}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <FaRegClock
                                      size={22}
                                      className="primary_text_color"
                                    />

                                    <span className="md:text-lg font-normal">
                                      {dayjs(
                                        `1970-01-01T${bookingData?.starting_time}`
                                      ).format("hh:mm A")}{" "}
                                      -{" "}
                                      {dayjs(
                                        `1970-01-01T${bookingData?.ending_time}`
                                      ).format("hh:mm A")}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </section>

                            <Separator />
                          </>
                        )}
                      {/* Booking Location details */}
                      <>
                        <section className="space-y-4">
                          <div className="flex items-center gap-2">
                            <h2 className="description_color">
                              {t("scheduledAt")}
                            </h2>{" "}
                            <span className="description_color">|</span>
                            <span className="primary_text_color">
                              {bookingData?.address_id === "0"
                                ? t("store")
                                : t("doorstep")}
                            </span>
                          </div>
                          <>
                            {/* {bookingData?.address_id > "0" && ( */}
                            <div className="flex items-start md:items-center gap-3">
                              <IoLocationOutline
                                size={22}
                                className="primary_text_color min-w-[22px] mt-1 md:mt-0"
                              />

                              <div className="">
                                <h3 className="text-lg font-normal break-all">
                                  {bookingData?.address_id > "0"
                                    ? bookingData?.address
                                      .replace(/,+/g, ",") // Replace multiple commas with a single comma
                                      .replace(/^,|,$/g, "") // Remove leading and trailing commas
                                    : bookingData?.partner_address
                                      .replace(/,+/g, ",") // Replace multiple commas with a single comma
                                      .replace(/^,|,$/g, "") // Remove leading and trailing commas
                                  }
                                </h3>
                              </div>
                            </div>
                            {/* )} */}
                            {(bookingData?.provider_no || bookingData?.partner_no || bookingData?.customer_no) && (
                              <div className="flex items-center gap-3">
                                <IoPhonePortraitOutline
                                  size={22}
                                  className="primary_text_color min-w-[22px]"
                                />
                                <a
                                  href={`tel:${bookingData?.address_id === "0"
                                    ? bookingData?.provider_no || bookingData?.partner_no
                                    : bookingData?.customer_no
                                    }`}
                                >
                                  <span className="text-lg font-normal">
                                    {bookingData?.address_id === "0"
                                      ? bookingData?.provider_no || bookingData?.partner_no
                                      : bookingData?.customer_no}
                                  </span>
                                </a>
                              </div>
                            )}

                          </>
                        </section>

                        <Separator />
                      </>
                      {Boolean(bookingData?.services?.[0]?.service_short_description || bookingData?.remarks) && (
                        <>
                          <section className="space-y-4" aria-labelledby="provider-notes">
                            <div className="flex flex-col gap-4">
                              <h2 id="provider-notes" className="description_color">
                                {bookingData?.custom_job_request_id ? t("providerNotes") : t("notes")}
                              </h2>
                              <div className="flex items-center gap-3">
                                <CgNotes
                                  size={22}
                                  className="primary_text_color min-w-[22px]"
                                  aria-hidden="true"
                                />
                                <div>
                                  <h3 className="text-lg font-normal break-all">
                                    {bookingData?.services?.[0]?.service_short_description || bookingData?.remarks || ''}
                                  </h3>
                                </div>
                              </div>
                            </div>
                          </section>
                          <Separator />
                        </>
                      )}

                      {/* Booked Services Details  */}
                      {bookingData?.services?.length > 0 && (
                        <>
                          <section className="space-y-4">
                            <h2 className="description_color">
                              {bookingData?.services?.length === 1 ? t("service") : t("services")}
                            </h2>
                            <div className="space-y-6">
                              {bookingData?.services?.map((service) => (
                                <div key={service.id} className="space-y-3">
                                  <div className="flex items-center gap-6">
                                    <Avatar className="h-[48px] w-[48px] rounded-[4px]">
                                      <AvatarImage
                                        src={service?.image}
                                        alt=""
                                        width={0}
                                        height={0}
                                      />
                                    </Avatar>
                                    <div className="flex-1">
                                      <h3 className="text-base font-medium">
                                        {service?.service_title}
                                      </h3>
                                      <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium primary_text_color">
                                          {showPrice(service?.sub_total)}
                                        </span>
                                        <span className="text-sm description_color">
                                          x{service?.quantity}
                                        </span>
                                      </div>
                                    </div>
                                    {bookingData?.status === "completed" ? (
                                      <>
                                        {service?.rating ? (
                                          <div className="text-right space-y-2">
                                            <div className="flex items-center gap-1">
                                              <FaStar
                                                className="text-[#FF9900]"
                                                size={18}
                                              />
                                              <span className="text-sm">
                                                {service.rating}
                                              </span>
                                            </div>
                                            <button
                                              className="primary_text_color underline"
                                              onClick={() =>
                                                handleRateService(
                                                  service?.custom_job_request_id
                                                    ? service?.custom_job_request_id
                                                    : service?.service_id,
                                                  {
                                                    _id: service?.service_id,
                                                    rating: service?.rating,
                                                    comment: service?.comment,
                                                    images:
                                                      service?.images || [],
                                                  },
                                                  Boolean(
                                                    service?.custom_job_request_id
                                                  ),
                                                  service // Passed here
                                                )
                                              }
                                            >
                                              {t("edit")}
                                            </button>
                                          </div>
                                        ) : (
                                          <button
                                            className="bg-[#ff99001f] gap-2 flex items-center rounded-lg p-2 text-[#FF9900]"
                                            onClick={() =>
                                              handleRateService(
                                                service?.custom_job_request_id
                                                  ? service?.custom_job_request_id
                                                  : service?.service_id,
                                                null,
                                                Boolean(
                                                  service?.custom_job_request_id
                                                )
                                              )
                                            }
                                          >
                                            <FaStar size={18} />
                                            {t("rate")}
                                          </button>
                                        )}
                                      </>
                                    ) : null}
                                  </div>
                                  {bookingData?.status === "completed" &&
                                    service?.comment && (
                                      <>
                                        <p className="description_color">
                                          {service?.comment}
                                        </p>
                                        <div className="flex gap-3">
                                          {service?.images?.map((img, idx) => (
                                            <div
                                              className="photo cursor-pointer"
                                              key={idx}
                                              onClick={() =>
                                                openLightboxReview(
                                                  service?.images,
                                                  idx
                                                )
                                              }
                                            >
                                              <CustomImageTag
                                                key={idx}
                                                src={img}
                                                alt="image"
                                                className="w-16 h-16 object-cover rounded"
                                              />
                                            </div>
                                          ))}
                                        </div>
                                      </>
                                    )}
                                </div>
                              ))}
                            </div>
                          </section>

                          <Separator />
                        </>
                      )}

                      {/* Pyament Details */}
                      <section className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 md:gap-6 lg:gap-8">
                          {/* Payment Method */}
                          <div className="flex flex-col gap-2 w-full">
                            <h2 className="description_color">
                              {t("paymentWith")}
                            </h2>
                            <div className="flex flex-wrap items-center gap-3 w-full">
                              {paymentModes.map((paymentMode) => {
                                if (
                                  paymentMode.method ===
                                  bookingData?.payment_method
                                ) {
                                  return (
                                    <div
                                      key={paymentMode.method}
                                      className="flex items-center gap-3"
                                    >
                                      <Avatar className="h-[48px] w-[48px] rounded-[4px]">
                                        <AvatarImage
                                          src={paymentMode.icon}
                                          alt={paymentMode.method}
                                          width={48}
                                          height={48}
                                        />
                                      </Avatar>
                                      <span className="text-sm sm:text-base md:text-lg font-medium capitalize">
                                        {t(paymentMode.method)}
                                      </span>
                                    </div>
                                  );
                                }
                                return null;
                              })}
                            </div>
                          </div>

                          {/* Payment Status */}
                          <div className="flex flex-col gap-2 w-full">
                            <h2 className="description_color">
                              {t("paymentStatus")}
                            </h2>
                            <div className="flex flex-wrap items-center gap-3 w-full">
                              {["success", "pending", "failed"].includes(
                                bookingData?.payment_status || "pending"
                              ) && (
                                  <div
                                    className={`flex items-center gap-3 p-3 text-sm md:text-base rounded-[4px] ${getPaymentStatusUI(
                                      bookingData?.payment_status || "pending"
                                    )?.bgClass
                                      }`}
                                  >
                                    <div className="flex items-center justify-center">
                                      {
                                        getPaymentStatusUI(
                                          bookingData?.payment_status || "pending"
                                        )?.icon
                                      }
                                    </div>
                                    <span className="text-md font-medium capitalize">
                                      {t(
                                        getPaymentStatusUI(
                                          bookingData?.payment_status || "pending"
                                        )?.iconText
                                      )}
                                    </span>
                                  </div>
                                )}
                            </div>
                          </div>
                        </div>
                      </section>
                      {bookingData?.additional_charges?.length > 0 &&
                        bookingData.payment_method_of_additional_charge && (
                          <>
                            <section className="space-y-4">
                              <div className="grid sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-2">
                                {/* Additional Charges Payment Method */}
                                <div className="flex flex-col gap-1 w-full">
                                  <h2 className="description_color">
                                    {t("additionalChargesPayWith")}
                                  </h2>
                                  <div className="flex gap-6 w-full">
                                    {/* Iterate over paymentModes and find the one matching the payment method */}
                                    {paymentModes.map((paymentMode) => {
                                      if (
                                        paymentMode.method ===
                                        bookingData?.payment_method_of_additional_charge
                                      ) {
                                        return (
                                          <div
                                            key={paymentMode.method}
                                            className="flex items-center gap-3"
                                          >
                                            <Avatar className="h-[48px] w-[48px] rounded-[4px]">
                                              <AvatarImage
                                                src={paymentMode.icon} // Use the icon for the matched payment method
                                                alt={paymentMode.method}
                                                width={48}
                                                height={48}
                                              />
                                            </Avatar>
                                            <span className="text-lg font-medium capitalize">
                                              {t(paymentMode.method)}
                                            </span>
                                          </div>
                                        );
                                      }
                                      return null; // Don't render anything if no match is found
                                    })}
                                  </div>
                                </div>

                                {/* Additional Charges Payment Status */}
                                <div className="flex flex-col gap-1 w-full">
                                  <h2 className="description_color">
                                    {t("additionalchargesPaymentStatus")}
                                  </h2>
                                  <div className="flex gap-6 w-full">
                                    {/* Check for valid payment status */}
                                    {bookingData?.payment_status_of_additional_charge && (
                                      <div
                                        className={`flex items-center gap-3 p-3 rounded-[4px] ${getPaymentStatusAdditionalChargeUI(
                                          bookingData?.payment_status_of_additional_charge ||
                                          "pending"
                                        )?.bgClass
                                          } `}
                                      >
                                        <div className="flex items-center justify-center">
                                          {/* Render appropriate icon based on status */}
                                          {
                                            getPaymentStatusAdditionalChargeUI(
                                              bookingData?.payment_status_of_additional_charge ||
                                              "pending"
                                            )?.icon
                                          }
                                        </div>
                                        <span className="text-md font-medium capitalize">
                                          {t(
                                            getPaymentStatusAdditionalChargeUI(
                                              bookingData?.payment_status_of_additional_charge ||
                                              "pending"
                                            )?.iconText
                                          )}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </section>
                          </>
                        )}
                      <Separator />

                      {/* Workd Proof details  */}
                      {bookingData?.work_started_proof?.length > 0 && (
                        <>
                          <section className="space-y-4">
                            <h2 className="description_color">
                              {t("workStartedProof")}
                            </h2>
                            <div className="flex gap-3">
                              {bookingData?.work_started_proof?.map(
                                (img, index) => (
                                  <div
                                    className="photo cursor-pointer"
                                    key={index}
                                    onClick={() =>
                                      openLightboxStartedWork(index)
                                    }
                                  >
                                    <CustomImageTag
                                      src={img}
                                      alt={"proof"}
                                      className="w-16 h-16 object-cover rounded"
                                    />
                                  </div>
                                )
                              )}
                            </div>
                          </section>
                          <Separator />
                        </>
                      )}
                      {/* Workd Proof details  */}
                      {bookingData?.work_completed_proof?.length > 0 && (
                        <>
                          <section className="space-y-4">
                            <h2 className="description_color">
                              {t("workEndedProof")}
                            </h2>
                            <div className="flex gap-3">
                              {bookingData?.work_completed_proof?.map(
                                (img, index) => (
                                  <div
                                    className="photo cursor-pointer"
                                    key={index}
                                    onClick={() => openLightboxEndedWork(index)}
                                  >
                                    <CustomImageTag
                                      src={img}
                                      alt={"proof"}
                                      className="w-16 h-16 object-cover rounded"
                                    />
                                  </div>
                                )
                              )}
                            </div>
                          </section>

                          {/* <Separator /> */}
                        </>
                      )}

                      {/* Booking Summery */}
                      <Card className="light_bg_color border-color">
                        <CardContent className="space-y-6 p-4">
                          {finalPriceBreakdown.length > 0 ? (
                            <>
                              {finalPriceBreakdown.map((item, idx) => (
                                <div key={idx} className="flex flex-col">
                                  <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                      <span>{item.label}</span>
                                      {item.subCharges?.length > 0 && (
                                        <button
                                          onClick={() => toggleExpand(idx)}
                                          className="transition-transform duration-200 ease-in-out"
                                          aria-expanded={expandedItems[idx]}
                                          aria-label={expandedItems[idx] ? "Collapse details" : "Expand details"}
                                        >
                                          <FaChevronDown
                                            className={`transition-transform duration-200 ease-in-out primary_text_color ${expandedItems[idx] ? "rotate-180" : ""
                                              }`}
                                            aria-hidden="true"
                                          />
                                        </button>
                                      )}
                                    </div>
                                    <span>
                                      {item.prefix || ""}
                                      {showPrice(item.amount)}
                                    </span>
                                  </div>

                                  {item.subCharges?.length > 0 && (
                                    <div
                                      className={`overflow-hidden transition-all duration-200 ease-in-out ${expandedItems[idx] ? "max-h-[500px] mt-2" : "max-h-0"
                                        }`}
                                    >
                                      {item.subCharges?.map((subCharge, subIndex) => (
                                        <div
                                          key={subIndex}
                                          className="flex justify-between items-center pl-2 py-1 text-sm description_color"
                                        >
                                          <span>{subCharge.name}</span>
                                          <span className="pr-[2px]">
                                            {showPrice(subCharge.charge)}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              ))}
                              <Separator />
                            </>
                          ) : null}

                          {/* Final Price - Always shown */}
                          <div className="flex justify-between font-bold text-lg">
                            <span>{t("finalPrice")}</span>
                            <span className="primary_text_color">
                              {showPrice(bookingData?.final_total || 0)}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    </main>
                  </div>
                </div>
              </div>
            ) : (
              <div className="col-span-12 lg:col-span-9">
                <div className="w-full h-full min-h-[400px] flex items-center justify-center">
                  <NoDataFound
                    title={t("noBookingDetailsFound")}
                    desc={t("noBookingDetailsFoundText")}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {isIsStartedWorkLightboxOpen && (
        <Lightbox
          isLightboxOpen={isIsStartedWorkLightboxOpen}
          images={bookingData?.work_started_proof} // Pass all images to the Lightbox
          initialIndex={startedWorkCurrentImageIndex} // Start at the clicked image
          onClose={closeLightboxStartedWork} // Close handler
        />
      )}
      {isIsEndedWorkLightboxOpen && (
        <Lightbox
          isLightboxOpen={isIsEndedWorkLightboxOpen}
          images={bookingData?.work_completed_proof} // Pass all images to the Lightbox
          initialIndex={endedWorkCurrentImageIndex} // Start at the clicked image
          onClose={closeLightboxEndedWork} // Close handler
        />
      )}
      {isReviewLightBox && (
        <Lightbox
          isLightboxOpen={isReviewLightBox}
          images={lightboxReviewImages} // Pass all images to the Lightbox
          initialIndex={reviewImagesCurrentImageIndex} // Start at the clicked image
          onClose={closeLightboxReview} // Close handler
        />
      )}

      {scheduleDrawerOpen && (
        <SelectDateAndTimeDrawer
          open={scheduleDrawerOpen}
          orderID={bookingData?.id}
          providerId={bookingData?.partner_id}
          customJobId={bookingData?.custom_job_request_id}
          onClose={() => setScheduleDrawerOpen(false)}
          isRechedule={true}
          advance_booking_days={bookingData?.advance_booking_days}
        />
      )}

      {isPaymentDrawerOpen && (
        <PaymentMethodDrawer
          open={isPaymentDrawerOpen}
          onClose={() => setIsPaymentDrawerOpen(false)}
          onSubmit={handlePaymentSubmit}
          enabledPaymentMethods={enabledPaymentMethods}
          amount={showPrice(totalAdditionalCharges)}
          isLoading={isProcessingPayment}
          selectedMethod={selectedMethod}
          setSelectedMethod={setSelectedMethod}
        />
      )}
      {selectedMethod === "Stripe" && (
        <StripePayment
          t={t}
          clientKey={clientKey}
          amount={totalAdditionalCharges}
          orderID={bookingData?.id}
          open={open}
          setOpen={setOpen}
          isAdditionalCharge={true}
        />
      )}
      {isRateServiceOpen && (
        <RateServiceDialog
          selectedServiceId={selectedServiceId}
          open={isRateServiceOpen}
          onClose={() => {
            setIsRateServiceOpen(false);
            setExistingReview(null);
          }}
          onSubmit={handleSubmitReview}
          t={t}
          isEditMode={!!existingReview}
          existingReview={existingReview}
        />
      )}
    </Layout>
  );
};

export default withAuth(BookingDetails);
