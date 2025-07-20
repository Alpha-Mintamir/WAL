"use client";
import React from "react";
import Layout from "../Layout/Layout";
import BreadCrumb from "../ReUseableComponents/BreadCrumb";
import { useSelector } from "react-redux";
import { useState, useEffect } from "react";
import { useTranslation } from "../Layout/TranslationContext";
import RichTextContent from '../ReUseableComponents/RichTextContent.jsx';

const AboutUs = () => {
  const t = useTranslation();
  const settingsData = useSelector((state) => state.settingsData);
  const about_us = settingsData?.settings?.about_us?.about_us;

  // State to track if the component has mounted (to avoid hydration issues)
  const [isMounted, setIsMounted] = useState(false);

  // Ensure that the component only renders on the client side
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null; // Don't render anything until after the client-side mount
  }

  return (
    <Layout>
      <BreadCrumb firstEle={t("aboutUs")} firstEleLink="/about-us" />
      <section className="about-us my-12 container mx-auto min-h-[50vh]">
        <RichTextContent content={about_us} />
      </section>
    </Layout>
  );
};

export default AboutUs;
