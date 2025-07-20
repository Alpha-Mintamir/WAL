import { showPrice } from "@/utils/Helper";
import React from "react";
import { FcOk } from "react-icons/fc";
import { useTranslation } from "../Layout/TranslationContext";

const SubscriptionCard = ({ ele }) => {
  const t = useTranslation();

  // Create a features array dynamically based on the subscription data
  const features = [
    `Order Type: ${ele?.order_type === "limited" ? "Limited" : "Unlimited"}`,
    `Max Orders: ${ele?.max_order_limit || "Unlimited"}`,
    `Service Type: ${
      ele?.service_type === "limited" ? "Limited" : "Unlimited"
    }`,
    `Commission: ${
      ele?.is_commision === "yes"
        ? `${ele?.commission_percentage}% (Threshold: ${showPrice(
            ele?.commission_threshold
          )})`
        : "No Commission"
    }`,
    `Tax: ${ele?.tax_type === "included" ? "Included" : "Excluded"}`,
    `Discount Price: ${
      ele?.discount_price ? showPrice(ele?.discount_price) : "No Discount"
    }`,
  ];

  return (
    <div className="relative w-full p-6 card_bg border border-gray-200 rounded-[30px] transition-all duration-100 ease-in-out">
      {/* Plan Header */}
      <div className="mb-4">
        <span className="inline-block px-3 py-1 text-base font-medium primary_text_color light_bg_color primary_text_color rounded-sm">
          {ele?.name}
        </span>
      </div>

      {/* Price and Duration */}
      <div className="flex items-center flex-wrap justify-start gap-4">
        {/* Price and Discount */}
        <div className="flex items-center justify-start gap-4">
          <div>
            <span className="text-4xl font-extrabold">
              {showPrice(
                ele?.discount_price > 0 ? ele?.discount_price : ele?.price
              )}
            </span>
            {ele?.discount_price > 0 && (
              <span className="ml-2 text-lg font-medium text-gray-400 line-through">
                {showPrice(ele?.price)}
              </span>
            )}
          </div>
        </div>
        <div className="border-l-[1px] border-gray-200 p-2 rtl:border-r-[1px] rtl:border-l-[0px]">
          <p className="text-md font-medium">{t("duration")}</p>
          <p className="text-sm font-normal description_color">
            {ele?.duration} {t("days")}
          </p>
        </div>
      </div>

      {/* Description */}
      <div className="relative mt-4 light_bg_color rounded-sm break-words p-3 transition-all duration-1000 ease-in-out max-h-20 overflow-hidden hover:max-h-[500px] hover:overflow-auto">
        <span className="text-sm font-medium">{ele?.description}</span>
      </div>

      {/* Features List */}
      <ul className="mt-6 space-y-3 text-sm description_color">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center">
            <FcOk size={18} />
            <span className="ml-2 rtl:mr-2">{feature}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SubscriptionCard;
