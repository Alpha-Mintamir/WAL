import React, { useState } from "react";
import ProviderServiceCard from "../Cards/ProviderServiceCard";
import CommanCenterText from "../ReUseableComponents/CommanCenterText";
import { useTranslation } from "../Layout/TranslationContext";
const ProviderServices = ({ data }) => {
  const t = useTranslation();

  console.log(data)

  const [visibleServices, setVisibleServices] = useState(6);

  const loadMore = () => {
    setVisibleServices((prevVisibleServices) => prevVisibleServices + 6);
  };

  return (
    <div className="provider services relative bg-[#0277FA0A]">
      <div className="py-8 md:py-20 container mx-auto">
        {/* Section Header */}
        <CommanCenterText
          highlightedText={data?.short_headline}
          title={data?.title}
          description={data?.description}
        />

        <div className="">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {data?.categories.slice(0, visibleServices).map((cate, index) => (
              <div key={index} className="fade-in">
                <ProviderServiceCard
                  title={cate?.name}
                  description={cate.description}
                  imageUrl={cate.category}
                  number={index + 1}
                />
              </div>
            ))}
          </div>

          {/* Load More Button */}
          {visibleServices < data?.categories?.length && (
            <div className="flex justify-center mt-8">
              <button
                className="px-6 py-2 bg-[#2D2C2F] text-white font-semibold rounded-lg hover:primary_bg_color transition-colors duration-300"
                onClick={loadMore}
              >
                {t("loadMore")}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProviderServices;
