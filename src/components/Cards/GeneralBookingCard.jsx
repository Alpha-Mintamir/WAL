"use client";
import {
  isLogin,
  showPrice,
  statusColors,
  statusNames,
} from "@/utils/Helper";

import React from "react";
import { BsChatSquareDotsFill } from "react-icons/bs";
import { FaRegCalendarCheck, FaRegClock } from "react-icons/fa";
import CustomImageTag from "../ReUseableComponents/CustomImageTag";
import dayjs from "dayjs";
import Link from "next/link";
import { useTranslation } from "../Layout/TranslationContext";
import { getChatData } from "@/redux/reducers/helperSlice";
import { useRouter } from "next/router";
import { getCartApi } from "@/api/apiRoutes";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { setReorderMode } from "@/redux/reducers/reorderSlice";
import { store } from "@/redux/store";

const GeneralBookingCard = ({ data }) => {
  const t = useTranslation();
  const router = useRouter();
  const dispatch = useDispatch();
  const isLoggedIn = isLogin();
  const services = data?.services;
  const isCompleted = data?.status === "completed";
  const statusName = statusNames[data?.status];
  const statusColor = statusColors[data?.status?.toLowerCase()] || "#6b7280";

  const settings = store.getState().settingsData?.settings;

  const isPostBookingChatAvailable =
    settings?.general_settings?.allow_post_booking_chat === "1";

  const isProviderPostBookingChatAvailable =
    data?.post_booking_chat === "1";

  const handleChat = (e) => {
    e.preventDefault();
    if (!isLoggedIn) {
      toast.error(t("plzLoginfirst"));
      return false;
    }
    try {
      getChatData({
        booking_id: data?.id,
        partner_id: data?.partner_id,
        partner_name: data?.company_name,
        image: data?.profile_image,
        order_status: data?.status,
      });
      router.push("/chats");
    } catch (error) {
      console.log(error);
    }
  };
  const handleReOrder = async () => {
    try {
      const response = await getCartApi({
        order_id: data?.id,
      });

      if (response.error === false) {
        const reorderData = response.data?.reorder_data;

        // Dispatch with flattened structure
        dispatch(
          setReorderMode({
            isReOrder: true,
            orderId: data?.id,
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
  return (
    <div className="border rounded-lg p-4 flex flex-col justify-between gap-4 card_bg">
      {/* Top Section */}
      <div className="flex flex-wra md:flex-nowrap items-center justify-between gap-4 w-full">
        <div className="flex items-center gap-4 w-3/4">
          {/* Image */}
          <div className="w-16 h-16 rounded-md overflow-hidden  min-w-16">
            <CustomImageTag
              src={services[0]?.image}
              alt={services[0]?.service_title}
              className="w-full h-full object-cover"
            />
          </div>
          {/* Service Details */}
          <div>
            <h2 className="font-semibold text-lg line-clamp-1">
              {services[0]?.service_title}
            </h2>
            <div className="flex flex-wrap items-center gap-4">

              {services.length > 1 && (
                <p className="description_color">
                  +{services?.length - 1}
                  {t("moreServices")}
                </p>
              )}
              <p className="primary_text_color">
                {showPrice(data?.final_total)}

              </p>
            </div>
          </div>
        </div>
        {/* Status */}
        <div className="flex flex-col items-start md:items-end justify-center w-1/4">
          <span className="text-sm description_color">{t("status")}</span>
          <span className="status capitalize text-sm sm:text-base" style={{ color: statusColor }}>
            {t(statusName)}
          </span>
        </div>
      </div>
      {/* Middle Section */}
      <div className="w-full flex flex-col gap-4">

        <div
          className={`flex flex-col gap-2 ${services.length === 1 ? "mt-5 md:mt-10" : ""
            }`}
        >
          <span className="description_color">{t("schedule")}</span>
          <div className="flex flex-wrap items-center gap-4">
            <span className="flex items-center gap-1">
              <FaRegCalendarCheck size={18} className="primary_text_color" />
              <span> {data?.date_of_service}</span>
            </span>
            <span className="flex items-center gap-1">
              <FaRegClock size={18} className="primary_text_color" />
              <span>
                {" "}
                {dayjs(`1970-01-01T${data?.starting_time}`).format(
                  "hh:mm A"
                )} -{" "}
                {dayjs(`1970-01-01T${data?.ending_time}`).format("hh:mm A")}
              </span>
            </span>
          </div>
        </div>
        <hr />
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="text-sm w-full md:w-auto">
            <span className="description_color">{t("by")}</span>{" "}
            <span className="font-semibold">{data?.company_name}</span>
          </p>
          {data?.is_otp_enalble === "1" && !isCompleted && (
            <p className="text-sm w-full md:w-auto">
              <span className="description_color">{t("otp")}</span>{" "}
              <span className="font-semibold">{data?.otp}</span>
            </p>
          )}
        </div>
      </div>
      {/* Action Buttons */}
      <div className="flex items-center gap-3">
        {isCompleted ? (
          <>
            <Link href={`/booking/${data?.slug}`} className="w-full">
              <button className="p-3 border border_color rounded-lg bg-transparent primary_text_color max-[350px]:w-max w-full">
                {t("viewBooking")}
              </button>
            </Link>
            {data?.is_reorder_allowed === "1" && (
              <button
                className="p-3 border rounded-lg primary_bg_color text-white w-full"
                onClick={handleReOrder}
              >
                {t("reBook")}
              </button>
            )}
          </>
        ) : (
          <>
            {isPostBookingChatAvailable && isProviderPostBookingChatAvailable && data?.status !== "cancelled" && (
              <button
                className="light_bg_color primary_text_color p-3 rounded-lg"
                onClick={handleChat}
              >
                <BsChatSquareDotsFill size={22} />
              </button>
            )}
            <Link href={`/booking/${data?.slug}`} className="w-full">
              <button className="p-3 border border_color rounded-lg bg-transparent primary_text_color w-full">
                {t("viewBooking")}
              </button>
            </Link>
          </>
        )}
      </div>
    </div>
  );
};

export default GeneralBookingCard;
