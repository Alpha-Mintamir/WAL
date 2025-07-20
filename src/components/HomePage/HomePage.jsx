"use client";
import React, { useEffect, useState } from "react";
import HeroSlider from "./HeroSlider";
import HomeCategories from "./HomeCategories";
import NearbyProviders from "./NearbyProviders";
import TopRatedProviders from "./TopRatedProviders";
import HomeDivider from "../ReUseableComponents/HomeDivider";
import Banner from "../ReUseableComponents/Banner";
import HomeCommanSection from "./HomeCommanSection";
import RecentBookings from "./RecentBookings";
import Layout from "../Layout/Layout";
import { getHomeScreenDataApi } from "@/api/apiRoutes";
import { useDispatch, useSelector } from "react-redux";
import Loader from "../ReUseableComponents/Loader";
import { clearCategories } from "@/redux/reducers/multiCategoriesSlice";
import { isLogin } from "@/utils/Helper";
import OngoingBookings from "./OngoingBookings";

const HomePage = () => {
  const dispatch = useDispatch();
  const isLoggedIn = isLogin();
  const [isLoading, setIsLoading] = useState(false);
  const locationData = useSelector((state) => state?.location);
  const [homePageData, setHomePageData] = useState([]);

  const fetchHomePageData = async () => {
    setIsLoading(true);
    try {
      const response = await getHomeScreenDataApi({
        latitude: locationData?.lat,
        longitude: locationData?.lng,
      });
      const data = response?.data;
      setHomePageData(data);
      setIsLoading(false);
      dispatch(clearCategories());
    } catch (error) {
      setIsLoading(false);
      console.log("error", error);
    }
  };

  useEffect(() => {
    if ((locationData?.lat, locationData?.lng)) {
      fetchHomePageData();
    }
  }, [locationData?.lat, locationData?.lng, isLoggedIn]);
  useEffect(() => {}, [homePageData]);

  return (
    <>
      {isLoading ? (
        <Loader />
      ) : (
        <Layout>
            <HeroSlider sliderData={homePageData?.sliders} />

          {homePageData?.categories?.length > 0 && (
            <HomeCategories categoriesData={homePageData?.categories} />
          )}

          {homePageData?.sections?.length > 0 ? (
            homePageData?.sections.map((section, index) => {
              let content;
              switch (section?.section_type) {
                case "partners":
                  content = section?.partners?.length > 0 && (
                    <>
                      <NearbyProviders sectionData={section} />
                      <HomeDivider />
                    </>
                  )
                  break;
                case "top_rated_partner":
                  content = section?.partners?.length > 0 && (
                    <>
                      <TopRatedProviders sectionData={section} />
                      <HomeDivider />
                    </>
                  )
                  break;

                case "sub_categories":
                  content = section?.sub_categories?.length > 0 && (
                    <>
                      <HomeCommanSection data={section} />
                      <HomeDivider />
                    </>
                  )
                  break;
                case "previous_order":
                  content = section?.previous_order.length > 0 && (
                    <>
                      <RecentBookings data={section} />
                      <HomeDivider />
                    </>
                  )
                  break;

                case "ongoing_order":
                  content = section?.ongoing_order.length > 0 && (
                    <>
                      <OngoingBookings data={section} />
                      <HomeDivider />
                    </>
                  )
                  break;

                case "near_by_provider":
                  content = section?.partners?.length > 0 && (
                    <>
                      <NearbyProviders sectionData={section} />
                      <HomeDivider />
                    </>
                  )
                  break;

                case "banner":
                  content = section?.banner[0]?.web_banner_image && (
                    <>
                      <Banner banner={section} />
                      <HomeDivider />
                    </>
                  )
                  break;
              }

              return <div key={index}>{content}</div>
            })
          ) : (
            <></>
          )}
        </Layout>
      )}
    </>
  );
};

export default HomePage;
