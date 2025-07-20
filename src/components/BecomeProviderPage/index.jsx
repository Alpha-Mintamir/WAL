"use client";
import React, { useEffect, useState } from "react";
import ProfessionalServicesSection from "./ProfessionalServicesSection";
import SuccessfullProvider from "./SuccessfullProvider";
import BussinesReview from "./BussinesReview";
import ProviderServices from "./ProviderServices";
import ProviderSubscription from "./ProviderSubscription";
import TopProviders from "./TopProviders";
import ProviderReviews from "./ProviderReviews";
import ProvidersFAQsSections from "./ProvidersFAQsSections";
import Layout from "../Layout/Layout";
import { getBecomeProviderSetttingsApi } from "@/api/apiRoutes";
import Loader from "../ReUseableComponents/Loader";

const ProviderPage = () => {
  const [providerPageData, setProviderPageData] = useState({});
  const [loading, setLoading] = useState(false);

  const fetchProviderPageData = async () => {
    setLoading(true);
    try {
      const response = await getBecomeProviderSetttingsApi({
        latitude: "",
        longitude: "",
      });
      if (response?.error === false) {
        setProviderPageData(response?.data);
        setLoading(false);
      }
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProviderPageData();
  }, []);

  return loading ? (
    <div><Loader /></div>
  ) : (
    <Layout>
      <div className="pb-10">
        {/* Hero Section */}
        {providerPageData?.hero_section?.status === 1 && (
          <ProfessionalServicesSection
            data={providerPageData?.hero_section}
            categoryData={providerPageData?.category_section?.categories}
            totalRating={providerPageData?.total_rating}
            happyCustomers={providerPageData?.happy_customers}
          />
        )}

        {/* How It Works Section */}
        {providerPageData?.how_it_work_section?.status === 1 && providerPageData?.how_it_work_section?.steps?.length > 0 && (
          <SuccessfullProvider data={providerPageData?.how_it_work_section} />
        )}

        {/* Feature Section */}
        {providerPageData?.feature_section?.status === 1 && providerPageData?.feature_section?.features?.length > 0 && (
          <>
            {providerPageData?.feature_section?.features?.map(
              (feature, index) => (
                <BussinesReview
                  key={index}
                  isReversed={feature?.position === "right" ? true : false}
                  headline={feature?.short_headline}
                  title={feature?.title}
                  description={feature?.description}
                  buttonText=""
                  img={feature?.image}
                />
              )
            )}
          </>
        )}

        {/* Category Section */}
        {providerPageData?.category_section?.status === 1 && providerPageData?.category_section?.categories?.length > 0 && (
          <ProviderServices data={providerPageData?.category_section} />
        )}

        {/* Subscription Section */}
        {providerPageData?.subscription_section?.status === 1 && providerPageData?.subscription_section?.subscriptions?.length > 0 && (
          <ProviderSubscription data={providerPageData?.subscription_section} />
        )}

        {/* Top Providers Section */}
        {providerPageData?.top_providers_section?.status === 1 && providerPageData?.top_providers_section?.providers?.length > 0 && (
          <TopProviders data={providerPageData?.top_providers_section} />
        )}

        {/* Review Section */}
        {providerPageData?.review_section?.status === 1 && providerPageData?.review_section?.reviews?.length > 0 && (
          <ProviderReviews data={providerPageData?.review_section} totalRating={providerPageData?.total_rating} />
        )}

        {/* FAQ Section */}
        {providerPageData?.faq_section?.status === 1 && providerPageData?.faq_section?.faqs?.length > 0 && (
          <ProvidersFAQsSections data={providerPageData?.faq_section} />
        )}
      </div>
    </Layout>
  );
};

export default ProviderPage;
