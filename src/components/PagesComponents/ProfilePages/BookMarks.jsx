"use client";
import react, { useState, useEffect } from "react";
import Layout from "@/components/Layout/Layout";
import BreadCrumb from "@/components/ReUseableComponents/BreadCrumb";
import SideNavigation from "./SideNavigation";
import NearbyProviderCard from "@/components/Cards/NearbyProviderCard";
import { bookmark } from "@/api/apiRoutes";
import { useSelector } from "react-redux";
import Link from "next/link";
import toast from "react-hot-toast";
import MiniLoader from "@/components/ReUseableComponents/MiniLoader";
import NearbyProviderCardSkeleton from "@/components/Skeletons/NearbyProviderCardSkeleton";
import NoDataFound from "@/components/ReUseableComponents/Error/NoDataFound";
import { useTranslation } from "@/components/Layout/TranslationContext";
import withAuth from "@/components/Layout/withAuth";
import { isMobile } from "@/utils/Helper";

const BookMarks = () => {
  const t = useTranslation();

  const locationData = useSelector((state) => state?.location);
  const [providersData, setProvidersData] = useState([]);
  const [total, setTotal] = useState(0);
  const limit = 6; // Number of providers per fetch
  const [offset, setOffset] = useState(0); // Offset for pagination
  const [loading, setLoading] = useState(false); // To manage button loading state
  const [isloadMore, setIsloadMore] = useState(false);

  const fetchBookMarks = async (append = false, customOffset = offset) => {
    if (append) {
      setIsloadMore(true); // Set Load More button state to loading
    } else {
      setLoading(true); // Set initial fetch to loading
    }
    try {
      const response = await bookmark({
        type: "list",
        lat: locationData?.lat,
        lng: locationData?.lng,
        limit: limit,
        offset: customOffset,
      });
      setProvidersData((prevProviders) =>
        append ? [...prevProviders, ...response?.data] : response?.data
      );
      setTotal(response?.total);
    } catch (error) {
      console.log(error);
    } finally {
      setIsloadMore(false);
      setLoading(false);
    }
  };
  const handleLoadMore = async () => {
    // Compute the new offset value
    const newOffset = offset + limit;
    setOffset(newOffset); // Update the state for offset

    // Pass the computed offset directly to fetchAllProviders
    await fetchBookMarks(true, newOffset); // Ensure the correct offset is used
  };
  useEffect(() => {
    fetchBookMarks(false, 0);
  }, []);

  const handleRemoveBookMark = async (e, provider) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const res = await bookmark({
        type: "remove",
        lat: locationData?.lat,
        lng: locationData?.lng,
        partner_id: provider?.partner_id,
      });

      if (res?.error === false) {
        // Remove the provider from the list
        setProvidersData((prevProviders) =>
          prevProviders.filter((p) => p.partner_id !== provider.partner_id)
        );
        setTotal(total - 1);
        toast.success(res?.message);
      } else {
        toast.error(res?.message);
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Layout>
      <BreadCrumb firstEle={t("bookmarks")} firstEleLink="/bookmarks" isMobile={isMobile}/>
      <section className="profile_sec md:my-12">
        <div className="container mx-auto">
          {/* Grid layout */}
          <div className="grid grid-cols-12 gap-6">
            {/* Sidebar */}
            <div className="col-span-12 lg:col-span-3 hidden md:block">
              <SideNavigation />
            </div>

            {/* Main Content */}
            <div className="lg:col-span-9 col-span-12">
              <div className="flex flex-col gap-6">
                <div className="page-headline text-2xl sm:text-3xl font-semibold">
                  <span>{t("bookmarks")}</span>
                </div>
                {/* Show Loading State */}
                {loading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-1 xl:grid-cols-2 gap-6">
                    {Array.from({ length: limit }).map((_, index) => (
                      <NearbyProviderCardSkeleton key={index} />
                    ))}
                  </div>
                ) : providersData.length === 0 ? (
                  // Empty State
                  <div className="w-full h-[60vh] flex items-center justify-center">
                    <NoDataFound
                      title={t("noBookmarks")}
                      desc={t("noBookmarksText")}
                    />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-1 xl:grid-cols-2 gap-6">
                    {providersData.map((provider, index) => (
                      <Link
                        href={`/provider-details/${provider?.slug}`}
                        title={provider?.name}
                        key={index}
                      >
                        <NearbyProviderCard
                          provider={provider}
                          isBookmark={true}
                          handleRemoveBookMark={handleRemoveBookMark}
                        />
                      </Link>
                    ))}
                  </div>
                )}

                {/* Load More Button */}
                <div className="loadmore my-6 flex items-center justify-center">
                  {isloadMore ? (
                    <button className="primary_bg_color primary_text_color py-3 px-8 rounded-xl">
                      <MiniLoader />
                    </button>
                  ) : (
                    providersData.length < total && (
                      <button
                        onClick={handleLoadMore}
                        className="light_bg_color primary_text_color py-3 px-8 rounded-xl"
                        disabled={isloadMore}
                      >
                        {t("loadMore")}
                      </button>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default withAuth(BookMarks);
