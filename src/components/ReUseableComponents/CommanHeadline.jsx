import Link from "next/link";
import React from "react";
import { useTranslation } from "../Layout/TranslationContext";

const CommanHeadline = ({ headline, subHeadline, link }) => {
  const t = useTranslation();

  return (
    <div className="flex items-center md:items-end justify-between w-full pb-[32px]">
      <div className="flex flex-col items-start justify-start gap-2">
        <span className="text-lg md:text-3xl font-semibold">{headline}</span>
        <span className="primary_text_color text-sm md:text-base font-normal">
          {subHeadline}
        </span>
      </div>
      {link &&
      <div className="hover:primary_bg_color rounded-md transition-colors duration-500 hover:text-white px-6 py-2">
        <Link
          href={link}
          className="text-nowrap text-sm md:text-base text-center font-normal md:text-end"
          title={t("viewAll")}
          >
          {t("viewAll")}
        </Link>
      </div>
        }
    </div>
  );
};

export default CommanHeadline;
