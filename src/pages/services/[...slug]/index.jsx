"use client";
import MetaData from "@/components/Meta/MetaData";
import dynamic from "next/dynamic";
import React from "react";

const CategoryDetails = dynamic(
  () => import("@/components/Caetgories/CategoryDetails"),
  { ssr: false }
);

export default function index() {
  return (
    <>
      <MetaData
        title={`Categories Details - ${process.env.NEXT_PUBLIC_META_TITLE}`}
        description={process.env.NEXT_PUBLIC_META_DESCRIPTION}
        keywords={process.env.NEXT_PUBLIC_META_KEYWORDS}
        pageName="/"
      />
      <CategoryDetails />
    </>
  );
}
