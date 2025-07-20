"use client";
import React from "react";
import { ArrowRight } from "lucide-react";
import { useRTL } from "@/utils/Helper";
import CustomImageTag from "../ReUseableComponents/CustomImageTag";
import { useTranslation } from "../Layout/TranslationContext";

const BlurredServiceCard = ({ elem, handleRouteChange }) => {
  const t = useTranslation();
  const isRTL = useRTL();
  
  return (
    <div
      className="relative w-full h-[200px] lg:h-[345px] rounded-2xl overflow-hidden cursor-pointer group"
      onClick={() => handleRouteChange(elem)}
    >
      <CustomImageTag
        className="w-full h-full absolute inset-0 bg-cover bg-center transition-transform duration-300"
        src={elem?.category_image || elem?.image}
        alt={`${elem?.name}`}
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold line-clamp-2">{elem?.name}</h3>
          {elem?.total_providers === undefined && (
            <ArrowRight
              className={`opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                isRTL ? "rotate-180" : "rotate-0"
              }`}
              size={20}
            />
          )}
        </div>
      {elem?.total_providers !== undefined && (
          <div className="flex items-center justify-between mt-1">
            <span className="text-sm">
              {elem?.total_providers} {elem?.total_providers === 1 ? t("provider") : t("providers")}
            </span>
            <ArrowRight
              className={`opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                isRTL ? "rotate-180" : "rotate-0"
              }`}
              size={20}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default BlurredServiceCard;
