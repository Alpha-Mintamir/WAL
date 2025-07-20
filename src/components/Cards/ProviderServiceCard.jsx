"use client";
import CustomImageTag from "../ReUseableComponents/CustomImageTag";

const ProviderServiceCard = ({ title, description, imageUrl, number }) => {
  return (
    <div className="card_bg rounded-[30px] mx-auto group custom-shadow">
      <div className="p-4 md:p-6">
        <div className="flex flex-row justify-between items-center md:items-center mb-4 border-b border-gray-300 pb-4 rtl:flex-row-reverse">
          <div>
            <h2 className="text-xl md:text-[28px] leading-5 lg:leading-9 font-medium">
              {title}
            </h2>
          </div>
          <div
            className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mt-2 md:mt-0 outlined_text transition-all duration-300 ease-in-out rounded-full p-2 flex items-center justify-center"
            data-text={number.toString().padStart(2, "0")}
          >
            {number.toString().padStart(2, "0")}
          </div>
        </div>
        {/* <p className="text-sm md:description_text description_color font-normal mb-4 line-clamp-3">
          {description}
        </p> */}
      </div>
      <div className="relative p-6">
        <CustomImageTag
          src={imageUrl}
          alt={title}
          className="w-full h-[180px] object-cover rounded-[16px]"
        />
      </div>
    </div>
  );
};

export default ProviderServiceCard;
