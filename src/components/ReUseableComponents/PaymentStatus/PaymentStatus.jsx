"use client";
import React, { useEffect } from "react";
import { useRouter } from "next/router";
import Lottie from "lottie-react"; // For animations
import successAnimation from "../../../../public/animations/success.json"; // Success animation
import failedAnimation from "../../../../public/animations/failure.json"; // Failed animation
import { useTranslation } from "@/components/Layout/TranslationContext";
import { useDispatch, useSelector } from "react-redux";
import { clearCart, clearChekoutData } from "@/redux/reducers/cartSlice";
import { clearReorder } from "@/redux/reducers/reorderSlice";

const PaymentStatus = () => {
  const t = useTranslation();
  const router = useRouter();
  const dispatch = useDispatch();
  const { status, payment_status, order_id } = router.query;
  const isReorderMode = useSelector(state => state.reorder.isReOrder);
  
  // Simplify to just success or failed status
  const isSuccess = status === "successful" || payment_status === 'Completed';
  
  // Handle back button press - redirect to home
  useEffect(() => {
    // Add state to history so we can detect back button press
    window.history.pushState({ paymentStatusPage: true }, '');
    
    const handleBackButton = () => {
      // Prevent default back behavior
      router.push('/');
      
      // Clear cart and checkout data
      dispatch(clearChekoutData());
      if (isReorderMode) {
        dispatch(clearReorder());
      } else {
        dispatch(clearCart());
      }
    };
    
    // Listen for popstate event (browser back button)
    window.addEventListener('popstate', handleBackButton);
    
    // Cleanup
    return () => {
      window.removeEventListener('popstate', handleBackButton);
    };
  }, [dispatch, isReorderMode, router]);
  
  // Handle navigation to home
  const handleGoHome = () => {
    router.push("/");
    dispatch(clearChekoutData());
    if (isReorderMode) {
      dispatch(clearReorder());
    } else {
      dispatch(clearCart());
    }
  };

  // Handle navigation to order details
  const handleGoToOrderDetails = () => {
    if (order_id) {
      dispatch(clearChekoutData());
      if (isReorderMode) {
        dispatch(clearReorder());
      } else {
        dispatch(clearCart());
      }
      router.push(`/booking/inv-${order_id}`);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen light_bg_color">
      <div className="card_bg p-8 rounded-lg shadow-lg text-center max-w-md w-full">
        {/* Animation - only show for success */}
        <div className="flex justify-center mb-6">
          <Lottie
            animationData={isSuccess ? successAnimation : failedAnimation}
            loop={false}
            style={{ width: 250, height: 250 }}
          />
        </div>

        {/* Status Text based on status - simplified to just success or failed */}
        <h1 className="text-2xl font-bold mb-4">
          {isSuccess ? t("paymentSuccess") : t("paymentFailed")}
        </h1>
        
        <p className="description_color mb-8">
          {isSuccess ? t("paymentSuccessText") : t("paymentFailedText")}
        </p>

        {/* Buttons */}
        <div className="flex flex-col space-y-4">
          {/* Show view booking details button for all statuses */}
          <button
            onClick={handleGoToOrderDetails}
            className="w-full primary_bg_color p-3 rounded-lg text-white"
          >
            {t("viewBookingDetails")}
          </button>
          
          <button
            onClick={handleGoHome}
            className="w-full light_bg_color p-3 rounded-lg primary_text_color"
          >
            {t("goHome")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentStatus;
