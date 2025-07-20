import React, { useState, useEffect } from "react";
import { Progress } from "@/components/ui/progress";
import Rating from "./Rating";
import ProviderReviewCard from "./ProviderReviewCard";
import { getRatings } from "@/api/apiRoutes";
import MiniLoader from "../ReUseableComponents/MiniLoader";
import NoDataFound from "../ReUseableComponents/Error/NoDataFound";
import { useTranslation } from "../Layout/TranslationContext";
import { Skeleton } from "../ui/skeleton";
import ReviewCard from "../Cards/ReviewCard";

const ProviderReviewTab = ({ providerData, slug }) => {
  const t = useTranslation();

  const rating = providerData?.ratings;
  const totalRating = providerData?.number_of_ratings || 0;

  const ratingData = [
    { rating: 5, count: providerData?.["5_star"] || 0 },
    { rating: 4, count: providerData?.["4_star"] || 0 },
    { rating: 3, count: providerData?.["3_star"] || 0 },
    { rating: 2, count: providerData?.["2_star"] || 0 },
    { rating: 1, count: providerData?.["1_star"] || 0 },
  ];

  const [loading, setLoading] = useState(true);
  const [isLoadMore, setIsLoadMore] = useState(false);
  const [reviewsData, setReviewsData] = useState([]);
  const [totalReviews, setTotalReviews] = useState(0);
  const limit = 5;
  const [offset, setOffset] = useState(0);

  const fetchReviews = async (append = false, customOffset = offset) => {
    append ? setIsLoadMore(true) : setLoading(true);
    try {
      const response = await getRatings({
        partner_id: providerData?.partner_id,
        limit,
        offset: customOffset,
        provider_slug: slug,
      });
      if (response?.error === false) {
        setReviewsData((prev) =>
          append ? [...prev, ...response.data] : response.data
        );
        setTotalReviews(response?.total);
      } else {
        setReviewsData([]);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setIsLoadMore(false);
    }
  };

  const handleLoadMore = async () => {
    const newOffset = offset + limit;
    setOffset(newOffset);
    await fetchReviews(true, newOffset);
  };

  useEffect(() => {
    fetchReviews(false, 0);
  }, []);

  const RatingSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-12 border rounded-md px-4 py-6 gap-4 animate-pulse">
      <div className="col-span-12 md:col-span-3">
        <div className="flex flex-col items-center justify-center w-full h-full rounded-md px-4 py-6">
          <Skeleton className="h-8 w-16 mb-2" />
          <Skeleton className="h-5 w-24 mb-2" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>
      <div className="col-span-12 md:col-span-9 space-y-4">
        {[...Array(5)].map((_, index) => (
          <div className="flex gap-4 items-center" key={index}>
            <Skeleton className="h-4 w-6" />
            <Skeleton className="h-2 flex-1 rounded-lg" />
            <Skeleton className="h-4 w-10" />
          </div>
        ))}
      </div>
    </div>
  );

  const ReviewCardSkeleton = () => (
    <div className="p-4 border rounded-md animate-pulse space-y-2">
      <Skeleton className="h-6 w-1/3 mb-2" />
      <Skeleton className="h-4 w-2/3 mb-1" />
      <Skeleton className="h-4 w-full mb-1" />
      <Skeleton className="h-4 w-5/6" />
    </div>
  );

  if (loading) {
    return (
      <>
        <RatingSkeleton />
        <div className="space-y-4 mt-8">
          {[...Array(3)].map((_, index) => (
            <ReviewCardSkeleton key={index} />
          ))}
        </div>
      </>
    );
  }

  return reviewsData.length > 0 ? (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-12 border rounded-md px-4 py-6 gap-4">
        <div className="col-span-12 md:col-span-3">
          <div className="flex flex-col items-center justify-center w-full h-full light_bg_color rounded-md px-4 py-6">
            <span className="text-[28px] font-medium primary_text_color">
              {rating}
            </span>
            <Rating rating={rating} />
            <span className="mt-2 text-base description_color">
              {totalRating} {t("ratings")}
            </span>
          </div>
        </div>
        <div className="col-span-12 md:col-span-9">
          {ratingData.map((item) => {
            const progressPercentage =
              totalRating > 0
                ? Math.round((item.count / totalRating) * 100) // Round to nearest whole number
                : 0;

            return (
              <div className="rating_progress mb-4" key={item.rating}>
                <div className="flex gap-4 items-center">
                  <span>{item.rating}</span>
                  <Progress
                    value={progressPercentage}
                    className="progress flex-1 h-2 mx-2 rounded-lg"
                  />
                  <span>{progressPercentage}%</span>{" "}
                  {/* Show whole number percentage */}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="reviews mt-8">
        <span className="text-2xl font-semibold">{t("reviews")}</span>
        <div className="space-y-8 mt-6">
          {reviewsData.map((review) => (
            <ReviewCard review={review} key={review.id} />
          ))}
        </div>
        <div className="flex items-center justify-center mt-6">
          {isLoadMore ? (
            <button className="primary_bg_color primary_text_color py-3 px-8 rounded-xl">
              <MiniLoader />
            </button>
          ) : (
            reviewsData.length < totalReviews && (
              <button
                onClick={handleLoadMore}
                className="light_bg_color primary_text_color py-3 px-8 rounded-xl"
                disabled={isLoadMore}
              >
                {t("loadMore")}
              </button>
            )
          )}
        </div>
      </div>
    </div>
  ) : (
    <div className="w-full h-[60vh] flex items-center justify-center">
      <NoDataFound title={t("noRatings")} desc={t("noRatingsText")} />
    </div>
  );
};

export default ProviderReviewTab;
