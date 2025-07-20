"use client"
import React from "react";
import quote from "../../assets/quote2.svg";
import { CiStar } from "react-icons/ci";
import CustomImageTag from "../ReUseableComponents/CustomImageTag";

const ReviewCard = ({ review }) => {
  return (
    <div className="card_bg p-6 md:p-3 lg:p-6 rounded-[30px] mx-auto h-[333px] flex flex-col items-start justify-around gap-[24px]">
      {/* Quote Icon */}
      <div className="w-full h-full max-h-[200px] flex flex-col items-start gap-3 ">
        <div className="quote">
          <CustomImageTag
            src={quote?.src}
            className="w-[48px] h-[48px] opacity-20"
            alt="quote"
          />
        </div>

        {/* Review Text */}
        <p className="mb-6 line-clamp-5">{review?.comment}</p>
      </div>

      {/* Reviewer Info */}
      <div className="flex flex-col sm:flex-row  items-start justify-center gap-4 sm:items-center sm:justify-between sm:gap-0 w-full">
        <div className="flex items-center">
          <CustomImageTag
            src={review?.profile_image}
            alt={review?.user_name}
            className="w-12 h-12 rounded-full mr-3 md:mr-2"
          />
          <div className="flex flex-col items-start">
            <p className="font-bold line-clamp-1">{review?.user_name}</p>
            <p className="description_color text-sm line-clamp-1">{review?.partner_name}</p>
          </div>
        </div>
        {review.rating && (
          <div>
            <div className="flex items-center primary_bg_color rounded-full py-1 px-4 gap-1 text-white">
              <CiStar size={22} />
              <span className="font-bold">{review.rating}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewCard;
