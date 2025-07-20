import React, { useState, useEffect } from "react";
import { FaSearch } from "react-icons/fa";
import ProviderDetailsServiceCard from "./ProviderDetailsServiceCard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import MiniLoader from "../ReUseableComponents/MiniLoader";
import ProviderDetailsServiceCardSkeleton from "../Skeletons/ProviderDetailsServiceCardSkeleton";
import NoDataFound from "../ReUseableComponents/Error/NoDataFound";
import { useTranslation } from "../Layout/TranslationContext";

const ProviderServiceTab = ({
  slug,
  provider,
  isloadMore,
  loading,
  serviceData,
  total,
  handleLoadMore,
  compnayName,
}) => {
  const t = useTranslation();

  return (
    <>
      {/* Search and Sort */}
      {/* <div className="flex flex-wrap sm:flex-nowrap items-center justify-between mt-4 gap-4">
        <div className="flex items-center gap-2 px-4 py-2 border rounded-md border-gray-300 w-full">
          <FaSearch size={18} className="description_color" />
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full focus-visible:outline-none"
            
          />
        </div>
        <div className="flex items-center space-x-2 w-full sm:w-8/12 sm:justify-end">
          <span className="description_color">Short By</span>
          <Select onValueChange={handleSortChange} value={sortOption}>
            <SelectTrigger className="w-[180px] px-4 py-2 border rounded-md border-gray-300 focus:outline-none focus:ring-0 focus:ring-transparent">
              <SelectValue placeholder="Sort By" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="price-high-to-low">
                Price High To Low
              </SelectItem>
              <SelectItem value="price-low-to-high">
                Price Low To High
              </SelectItem>
              <SelectItem value="rating-high-to-low">
                Rating High To Low
              </SelectItem>
              <SelectItem value="rating-low-to-high">
                Rating Low To High
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div> */}

      {/* Services */}
      <div>
        {loading ? (
          Array(5)
            .fill(0)
            .map((_, index) => (
              <div key={index}>
                <ProviderDetailsServiceCardSkeleton />
              </div>
            ))
        ) : serviceData && serviceData.length > 0 ? (
          <>
            {serviceData?.map((ele, index) => (
              <div className="grid grid-cols-1 gap-2" key={index}>
                <ProviderDetailsServiceCard
                  slug={slug}
                  provider={provider}
                  data={ele}
                  compnayName={compnayName}
                />
              </div>
            ))}
            <div className="loadmore my-6 flex items-center justify-center">
              {isloadMore ? (
                <button className="primary_bg_color primary_text_color py-3 px-8 rounded-xl">
                  <MiniLoader />
                </button>
              ) : (
                serviceData.length < total && (
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
          </>
        ) : (
          <div className="flex flex-col items-center justify-center my-6">
            <NoDataFound title={t("noServices")} desc={t("noServicesText")} />
          </div>
        )}
      </div>
    </>
  );
};

export default ProviderServiceTab;
