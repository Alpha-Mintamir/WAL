import { getCategoriesApi, getProviders } from "@/api/apiRoutes";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useState } from "react";
import { FaSearch } from "react-icons/fa";
import { useSelector } from "react-redux";
import NearbyProviderCard from "../Cards/NearbyProviderCard";
import Layout from "../Layout/Layout";
import BreadCrumb from "../ReUseableComponents/BreadCrumb";
import NearbyProviderCardSkeleton from "../Skeletons/NearbyProviderCardSkeleton";
import MiniLoader from "../ReUseableComponents/MiniLoader";
import NoDataFound from "../ReUseableComponents/Error/NoDataFound";
import { useTranslation } from "../Layout/TranslationContext";
import Link from "next/link";
import { IoFilterOutline } from "react-icons/io5";

const AllProviders = () => {
  const locationData = useSelector((state) => state?.location);
  const t = useTranslation();
  const [providers, setProviders] = useState([]);
  const [total, setTotal] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState("popularity");
  const [category, setCategory] = useState();
  const [offset, setOffset] = useState(0); // Offset for pagination
  const limit = 9; // Number of providers per fetch
  const [loading, setLoading] = useState(false); // To manage button loading state
  const [isloadMore, setIsloadMore] = useState(false);
  const [categories, setCategories] = useState([]); // State for all categories

  const fetchCategories = async () => {
    try {
      const response = await getCategoriesApi({
        latitude: locationData?.lat,
        longitude: locationData?.lng,
      });
      setCategories(response?.data); // Store all categories
    } catch (error) {
      console.log(error);
    } finally {
    }
  };

  const handleSearchChange = (e) => setSearchQuery(e.target.value);
  const handleSortChange = (value) => setSortOption(value);
  const handleCategoryChange = (value) => setCategory(value);

  const fetchAllProviders = async (append = false, customOffset = offset) => {
    if (append) {
      setIsloadMore(true); // Set Load More button state to loading
    } else {
      setLoading(true); // Set initial fetch to loading
    }
    try {
      const response = await getProviders({
        latitude: locationData?.lat,
        longitude: locationData?.lng,
        offset: customOffset, // Use the passed offset value
        limit: limit,
        filter: sortOption ? sortOption : "",
        search: searchQuery ? searchQuery : "",
        category_id: category ? category : "",
      });

      setTotal(response?.total);

      // Append new providers if "append" is true
      setProviders((prevProviders) =>
        append ? [...prevProviders, ...response?.data] : response?.data
      );
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false); // Stop initial loading state
      setIsloadMore(false); // Stop Load More button loading state
    }
  };

  const handleLoadMore = async () => {
    // Compute the new offset value
    const newOffset = offset + limit;
    setOffset(newOffset); // Update the state for offset

    // Pass the computed offset directly to fetchAllProviders
    await fetchAllProviders(true, newOffset); // Ensure the correct offset is used
  };
  const handleSerch = () => {
    fetchAllProviders();
  };

  // Fetch categories when component mounts
  // useEffect(() => {
  //   fetchCategories();
  // }, []);

  // Initial Fetch
  useEffect(() => {
    fetchAllProviders(false, 0);
  }, [sortOption, category]);

  const [filter, setFilter] = useState(false)

  return (
    <Layout>
      <BreadCrumb firstEle={t("providers")} firstEleLink={"/providers"} />

      <section className="all-providers">
        <div className="commanSec mt-12 flex flex-col items-start justify-center gap-6 w-full container mx-auto">
          <div className="Headlines flex flex-col w-full">
            <span className="text-2xl font-semibold">{t("all_providers")}</span>
            <span className="description_color">
              {providers?.length} {t("of")} {total} {total === 1 ? t("provider") : t("providers")}
            </span>
          </div>

          {/* Search and Sort */}
          <div className={`filterSec flex items-center justify-between mt-4 gap-y-3 gap-x-4 md:gap-4 w-full relative flex-wrap ${filter ? 'h-28' : 'h-12'} md:h-full transition-all duration-300 overflow-hidden`}>
            {/* Search Input */}
            <div className="w-[50%] md:w-max flex items-center justify-between gap-2 px-4 py-2 border rounded-md description_color flex-grow">
              <div className="flex items-center gap-2 w-full">
                <FaSearch size={18} className="description_color" />
                <input
                  type="text"
                  placeholder={t("searchHere")}
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="w-full focus:outline-none bg-transparent"
                />
              </div>
              <div>
                <button
                  onClick={handleSerch}
                  className="absolute top-[9px] right-16 w-max md:w-auto md:relative md:top-0 md:right-0 md:block transition-all duration-300 border hover:border_color text-xs sm:text-base px-2 py-1 md:px-4 md:py-2 background_color hover:primary_bg_color description_color hover:text-white rounded-lg"
                >
                  {t("search")}
                </button>

              </div>
            </div>

            {/* Category Filter */}
            {/* <div className="flex items-center space-x-2">
              <span className="description_color">Category</span>
              <Select onValueChange={handleCategoryChange} value={category}>
                <SelectTrigger className="w-[180px] px-4 py-2 border rounded-md description_color focus:outline-none focus:ring-0 focus:ring-transparent">
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent className="p-0">
                  {categories && categories?.map((category, index) => (
                    <SelectItem key={category?.id} value={category?.id}>
                      {category?.name}
                    </SelectItem>
                  ))}


                </SelectContent>
              </Select>
            </div> */}

            {/* Filter */}
            <div className="hidden md:flex items-center space-x-2 gap-2">
              <span className="description_color">{t("filter")}</span>
              <Select onValueChange={handleSortChange} value={sortOption}>
                <SelectTrigger className="w-[180px] px-4 py-2 border rounded-md description_color focus:outline-none focus:ring-0 focus:ring-transparent">
                  <SelectValue placeholder="Select Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="popularity">{t("popularity")}</SelectItem>
                  <SelectItem value="discount">
                    {t("dicountHightoLow")}
                  </SelectItem>
                  <SelectItem value="ratings">{t("ratings")}</SelectItem>
                  {/* <SelectItem value="ascending">Ascending Order</SelectItem>
                  <SelectItem value="descending">Descending Order</SelectItem> */}
                </SelectContent>
              </Select>
            </div>

            <div className="light_bg_color primary_text_color p-2 rounded-lg cursor-pointer md:hidden" onClick={() => setFilter(!filter)}>
              <IoFilterOutline size={26} />
            </div>

            <div className="w-full flex items-center space-x-2 gap-2 p-2 rounded-2xl md:hidden light_bg_color primary_text_color">
              <span className="description_color">{t("filter")}</span>
              <Select onValueChange={handleSortChange} value={sortOption}>
                <SelectTrigger className="w-[180px] px-4 py-2 border rounded-md description_color focus:outline-none focus:ring-0 focus:ring-transparent">
                  <SelectValue placeholder="Select Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="popularity">{t("popularity")}</SelectItem>
                  <SelectItem value="discount">
                    {t("dicountHightoLow")}
                  </SelectItem>
                  <SelectItem value="ratings">{t("ratings")}</SelectItem>
                  {/* <SelectItem value="ascending">Ascending Order</SelectItem>
                  <SelectItem value="descending">Descending Order</SelectItem> */}
                </SelectContent>
              </Select>
            </div>

          </div>
        </div>

        {/* Providers List */}
        <div className="commanDataSec light_bg_color p-4 w-full mt-6">
          <div className="container mx-auto py-6">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: limit }).map((_, index) => (
                  <NearbyProviderCardSkeleton key={index} />
                ))}
              </div>
            ) : providers?.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {providers.map((provider, index) => (
                  <div key={index}>
                    <Link
                      href={`/provider-details/${provider?.slug}`}
                      title={provider?.name}
                    >
                      <NearbyProviderCard provider={provider} />
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              // Empty State
              <div className="w-full h-[60vh] flex items-center justify-center">
                <NoDataFound
                  title={t("noProviderFound")}
                  desc={t("noProviderFoundText")}
                />
              </div>
            )}
          </div>
        </div>

        {/* Load More Button */}
        <div className="loadmore my-6 flex items-center justify-center">
          {isloadMore ? (
            <button className="primary_bg_color primary_text_color py-3 px-8 rounded-xl">
              <MiniLoader />
            </button>
          ) : (
            providers?.length < total && (
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
      </section>
    </Layout>
  );
};

export default AllProviders;
