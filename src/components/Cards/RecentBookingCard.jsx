"use client";
import {
  DownloadInvoice,
  isLogin,
  showPrice,
  statusColors,
  statusNames,
} from "@/utils/Helper";
import React, { useState } from "react";
import { TbMessageDots } from "react-icons/tb";
import CustomImageTag from "../ReUseableComponents/CustomImageTag";
import MiniLoader from "../ReUseableComponents/MiniLoader";
import Link from "next/link";
import { useTranslation } from "../Layout/TranslationContext";
import { getChatData } from "@/redux/reducers/helperSlice";
import { useRouter } from "next/router";
import toast from "react-hot-toast";
import { store } from "@/redux/store";

const RecentBookingCard = ({ booking }) => {
  const t = useTranslation();
  const router = useRouter();
  const isLoggedIn = isLogin();
  const [downloading, setDownloading] = useState(false);
  const service = booking?.services[0];
  const statusColor = statusColors[booking?.status?.toLowerCase()] || "#6b7280"; // Default to gray if status is unknown
  const statusName = statusNames[booking?.status];


  const settings = store.getState().settingsData?.settings;

  const isPostBookingChatAvailable =
    settings?.general_settings?.allow_post_booking_chat === "1";

  const isProviderPostBookingChatAvailable =
    booking?.post_booking_chat === "1";

  const handleChat = (e, booking) => {
    e.preventDefault();
    if (!isLoggedIn) {
      toast.error(t("plzLoginfirst"));
      return false;
    }
    try {
      getChatData({
        booking_id: booking?.id,
        partner_id: booking?.partner_id,
        partner_name: booking?.company_name,
        image: booking?.profile_image,
        order_status: booking?.status,
      });
      router.push("/chats");
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <div className="card_bg rounded-[18px] border p-6 flex flex-col items-center justify-center hover:border_color transition-all duration-300">
      {/* status section */}
      <div className="flex items-center justify-between w-full border-b border-[#2121212E] pb-[18px]">
        <span className="text-base font-normal description_color">
          {t("status")}
        </span>
        <span
          className="text-base font-semibold primary_text_color capitalize"
          style={{ color: statusColor }}
        >
           {t(statusName)}
        </span>
      </div>

      {/* service details */}
      <div className="flex items-start justify-between gap-4 w-full pt-[18px]">
        <div className={`flex flex-col justify-start items-start`}>
          <div className="flex items-center justify-start gap-4">
            <div className="h-12 w-12 min-w-12 min-h-12 rounded-md">
              <CustomImageTag
                src={service?.image}
                alt={service?.title}
                className="w-full h-full object-cover rounded-md"
              />
            </div>
            <div className="flex flex-col justify-start">
              <span className="text-base font-medium line-clamp-1">{service?.title}</span>
              <span className="flex items-center text-sm font-medium text-[#2121219E] dark:text-white gap-2">
                <span>{showPrice(service?.price)}</span>
                <span>x{service?.quantity}</span>
              </span>
            </div>
          </div>
          {/* {booking.serviceCount > 1 && */}
          <div
            className={`w-full text-[#2121219E] dark:text-white text-base font-normal ${
              booking?.services.length > 1 ? "pt-[16px]" : "pt-[40px]"
            }`}
          >
            {booking?.services.length > 1 && (
              <span>
                +{booking?.services.length - 1} {t("moreServices")}
              </span>
            )}
          </div>
          {/* } */}
        </div>
        <div className="text-base font-medium">
          <span>{showPrice(booking?.total)}</span>
        </div>
      </div>
      {/* provider and view */}
      <div
        className={`w-full flex flex-col justify-center items-start gap-[18px] ${
          booking?.serviceCount > 1 ? "pt-[18px]" : "pt-[18px]"
        }`}
      >
        <div className="flex items-center justify-start gap-1 text-base font-normal w-full">
          <span className="text-[#2121219E] dark:text-white"> {t("by")}</span>
          <span> {booking?.company_name}</span>
        </div>
      </div>

      {booking?.status === "completed" ? (
        <div className="flex flex-col md:flex-row gap-[18px] items-center justify-center w-full pt-[18px] text-sm md:text-base">
          {downloading ? (
            <button className="primary_bg_color primary_text_color py-3 px-8 rounded-xl  w-full">
              <MiniLoader />
            </button>
          ) : (
            <button
              className="rounded-[8px] light_bg_color border-none flex items-center justify-center p-[10px] primary_text_color w-full"
              onClick={() => DownloadInvoice(booking?.id, setDownloading)}
            >
              {t("downloadInvoice")}
            </button>
          )}
          <button className="w-full primary_bg_color p-[10px] rounded-[8px] text-white">
            <Link href={`/booking/${booking?.slug}`}>{t("viewBooking")}</Link>
          </button>
        </div>
      ) : (
        <div className="flex gap-[18px] items-center justify-center w-full pt-[18px]">
          {isPostBookingChatAvailable && isProviderPostBookingChatAvailable && (
            <button className="rounded-[8px] light_bg_color border-none flex items-center justify-center p-[10px] primary_text_color w-fit" onClick={(e) => handleChat(e,booking)}>
              <TbMessageDots size={24} />
            </button>
          )}
          <button className="w-full primary_bg_color p-[10px] rounded-xl text-white">
            <Link href={`/booking/${booking?.slug}`}>{t("viewBooking")}</Link>
          </button>
        </div>
      )}
    </div>
  );
};

export default RecentBookingCard;
