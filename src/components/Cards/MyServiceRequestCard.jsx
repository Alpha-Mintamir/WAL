import { customJobStatusColors, customJobStatusNames, showPrice } from "@/utils/Helper";
import Link from "next/link";
import React from "react";
import { useTranslation } from "../Layout/TranslationContext";
import CustomImageTag from "../ReUseableComponents/CustomImageTag";

const MyServiceRequestCard = ({ data }) => {
  const t = useTranslation();

  const statusName = customJobStatusNames[data?.status];
  const statusColor =
    customJobStatusColors[data?.status?.toLowerCase()] || "#6b7280";
  const remainingBidsCount = data?.total_bids > 3 ? data?.total_bids - 3 : 0;
  
  return (
    <div className="border rounded-lg p-3 md:p-4 flex flex-col gap-4 card_bg shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="background_color text-sm font-medium px-2 py-1 rounded-md">
            {data?.category_name}
          </span>
        </div>
        <span className="text-sm font-medium" style={{ color: statusColor }}>
          {t(statusName)}
        </span>
      </div>

      {/* Title */}
      <h3 className="text-lg font-semibold">{data?.service_title}</h3>

      {/* Budget */}
      <div>
        <p className="description_color text-sm">{t("budget")}</p>
        <p className="font-medium">
          {showPrice(data?.min_price)} {t("to")} {showPrice(data?.max_price)}
        </p>
      </div>

      {/* Divider */}
      <hr className="description_color" />

      {/* Bids */}
      <div className="flex md:items-center justify-between flex-col md:flex-row gap-3">
        {data?.bidders.length > 0 ? (
          <div className="flex items-center gap-2">
            <p className="text-sm primary_text_color font-medium">{t("bids")}</p>
            <div className="flex items-center -space-x-2">
              {/* Display up to 4 images */}
              {data?.bidders.slice(0, 3).map((bid, index) => (
                <CustomImageTag
                  key={index}
                  src={bid?.provider_image}
                  alt={`Bidder ${index + 1}`}
                  className="w-8 h-8 rounded-full border border-white object-cover"
                />
              ))}

              {/* If more than 4 bids, show +count */}
              {remainingBidsCount > 0 && (
                <span className="w-8 h-8 rounded-full primary_bg_color text-white flex items-center justify-center font-normal">
                  +{remainingBidsCount}
                </span>
              )}
            </div>
          </div>
        ) : (
          <p className="description_color">{t("noBidsAvailable")}</p>
        )}
        <Link href={`/my-service-request-details/${data?.id}`}>
        <button className="light_bg_color primary_text_color px-4 py-2 rounded-md font-medium w-full">
          {t("viewDetails")}
        </button>
        </Link>
      </div>
    </div>
  );
};

export default MyServiceRequestCard;
