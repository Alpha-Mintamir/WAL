"use client";
import { getCategoriesApi } from "@/api/apiRoutes";
import HomeCategoryCard from "@/components/Cards/HomeCategoryCard";
import Layout from "@/components/Layout/Layout";
import BreadCrumb from "@/components/ReUseableComponents/BreadCrumb";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  addCategory,
  clearCategories,
} from "../../redux/reducers/multiCategoriesSlice";
import { useTranslation } from "../Layout/TranslationContext";
import HomeCategoryCardSkeleton from "../Skeletons/HomeCategoryCardSkeleton";
import NoDataFound from "../ReUseableComponents/Error/NoDataFound";

const AllCategories = () => {
  const locationData = useSelector((state) => state?.location);
  const t = useTranslation();


  const [categories, setCategories] = useState([]); // State for all categories
  const [displayedCategories, setDisplayedCategories] = useState([]); // Categories to be shown initially
  const [total, setTotal] = useState(0); // Total number of categories
  const [loading, setLoading] = useState(false); // Loading state
  const router = useRouter();
  const dispatch = useDispatch();

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await getCategoriesApi({
        latitude: locationData?.lat,
        longitude: locationData?.lng,
      });
      setCategories(response?.data); // Store all categories
      setDisplayedCategories(response?.data.slice(0, 8)); // Display only the first 6 categories initially
      setTotal(response?.total);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories when component mounts
  useEffect(() => {
    fetchCategories();
  }, []);

  const handleRouteCategory = (category) => {
    dispatch(clearCategories());
    dispatch(addCategory(category));
    router.push(`/services/${category?.slug}`);
  };

  const handleLoadMore = () => {
    setDisplayedCategories(categories); // Display all categories after "Load More"
  };

  return (
    <Layout>
      <BreadCrumb firstEle={t("allServices")} firstEleLink="/services" />
      <section className="all-categories">
        <div className="commanSec mt-12 flex flex-col items-start justify-center gap-6 w-full container mx-auto">
          <div className="Headlines flex flex-col w-full">
            <span className="text-2xl font-semibold">{t("allServices")}</span>
            <span className="description_color">{total} {total === 1 ? t("service") : t("services")}</span>
          </div>
        
        </div>
        <div className="commanDataSec light_bg_color md:p-4 w-full mt-6">
          <div className="container mx-auto py-6">
            {loading ? (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {Array(12).fill(0).map((_, index) => (
                  <div key={index}>
                    <HomeCategoryCardSkeleton />
                  </div>
                ))}
              </div>
            ) : displayedCategories.length > 0 ? (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {displayedCategories.map((category, index) => (
                  <div key={index}>
                    <HomeCategoryCard
                      data={category}
                      handleRouteCategory={handleRouteCategory}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="w-full h-[60vh] flex items-center justify-center">
              <NoDataFound
                title={t("noServicesFound")}
                desc={t("noServicesFoundText")}
              />
            </div>
            )}
          </div>
        </div>
        {displayedCategories.length < total && (
          <div className="loadmore my-6 flex items-center justify-center">
            <button
              onClick={handleLoadMore}
              className="light_bg_color primary_text_color py-3 px-8 rounded-xl"
              disabled={loading} // Disable the button while loading
            >
              {t("loadMore")}
            </button>
          </div>
        )}
      </section>
    </Layout>
  );
};

export default AllCategories;
