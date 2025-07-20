"use client";
import React from "react";
import CustomImageTag from "../ReUseableComponents/CustomImageTag";
import { IoMdNotifications } from "react-icons/io";
import { useTranslation } from "../Layout/TranslationContext";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

const NotificationCard = ({ data }) => {
  const t = useTranslation();
  const router = useRouter();

  // Function to determine the redirect URL based on notification type
  const getRedirectUrl = (data) => {
    console.log(data);
    if (data?.type === "provider") {
      if (!data?.provider_slug) {
        toast.error(t("providerNotAvailable"));
        return "";
      }
      return `/provider-details/${data?.provider_slug}`;
    } else if (data?.type === "category") {
      // Handle both main categories and subcategories
      let categoryRoute = '/services';

      // If parent_category_slugs array exists and has items, use them to build the path
      if (data?.parent_category_slugs && data?.parent_category_slugs.length > 0) {
        // Add all parent category slugs in order
        categoryRoute += `/${data.parent_category_slugs.join('/')}`;
        // Add the current category slug at the end
        if (!data.category_slug) {
          toast.error(t("categoryNotAvailable"));
          return "";
        }
        categoryRoute += `/${data.category_slug}`;
      } else {
        // If no parent categories, just use the category slug
        if (!data.category_slug) {
          toast.error(t("categoryNotAvailable"));
          return "";
        }
        categoryRoute += `/${data.category_slug}`;
      }

      return categoryRoute;
    } else if (data?.type === "url" && data?.url) {
      return data.url;
    }
    return "";
  };


  const isRedirectable = data?.type === "provider" || data?.type === "category" || data?.type === "url";

  // Handle redirect when card is clicked
  const handleRedirect = (data) => {
    const url = getRedirectUrl(data);
    if (!url) return;

    // For external URLs, open in a new tab
    if (data?.type === "url") {
      window.open(url, "_blank", "noopener,noreferrer");
    } else {
      // For internal navigation, use router
      router.push(url);
    }
  };

  // Function to format the date display
  const formatTimeDisplay = (dateString) => {
    const now = new Date();
    const sentDate = new Date(dateString);
    const diffInMs = now - sentDate;
    const diffInMinutes = diffInMs / (1000 * 60);
    const diffInHours = diffInMs / (1000 * 60 * 60);

    // If less than 1 minute, show "Just now"
    if (diffInMinutes < 1) {
      return t("just_now");
    }
    // If less than 60 minutes, show minutes ago
    else if (diffInMinutes < 60) {
      const minutes = Math.floor(diffInMinutes);
      return `${minutes} ${minutes === 1 ? t("minute_ago") : t("minutes_ago")}`;
    }
    // If less than 24 hours, show hours ago
    else if (diffInHours < 24) {
      const hours = Math.floor(diffInHours);
      return `${hours} ${hours === 1 ? t("hour_ago") : t("hours_ago")}`;
    }
    // Otherwise show the date in DD-MM-YYYY format
    else {
      return sentDate.toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    }
  };

  return (
    <div
      className={`flex items-start justify-between border-b last:border-b-0 p-4 gap-4 first:rounded-t-xl last:rounded-b-xl
      ${isRedirectable ? "hover:light_bg_color transition-all duration-300 cursor-pointer" : ""}`}
      onClick={() => isRedirectable && handleRedirect(data)}
      role={isRedirectable ? "button" : "none"}
      tabIndex={isRedirectable ? 0 : -1}
      onKeyDown={(e) => {
        if (isRedirectable && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          handleRedirect();
        }
      }}
    >
      {/* Image */}
      {data?.image ? (
        <div className="w-16 h-16 rounded overflow-hidden">
          <CustomImageTag
            src={data?.image}
            alt={data?.title}
            className="w-full h-full object-cover"
            width={0}
            height={0}
            loading="lazy"
          />
        </div>
      ) :
        <div className="w-16 h-16 rounded overflow-hidden light_bg_color primary_text_color flex items-center justify-center">
          <IoMdNotifications size={40} />
        </div>}
      {/* Notification Content */}
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg">{data?.title}</h3>
          <div className="description_color text-sm whitespace-nowrap">
            {formatTimeDisplay(data?.date_sent)}
          </div>
        </div>
        <p className="text-sm description_color mb-2 text-wrap max-w-[80%]">{data?.message}</p>

      </div>
    </div>
  );
};

export default NotificationCard;
