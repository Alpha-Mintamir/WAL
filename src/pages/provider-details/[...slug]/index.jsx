import MetaData from "@/components/Meta/MetaData";
import dynamic from "next/dynamic";

const ProviderDetailsPage = dynamic(
  () =>
    import(
      "@/components/PagesComponents/ProviderDetailsPage/ProviderDetailsPage"
    ),
  { ssr: false }
);

const index = () => {
  return (
    <>
      <MetaData
        title={`Provider Details - ${process.env.NEXT_PUBLIC_META_TITLE}`}
        description={process.env.NEXT_PUBLIC_META_DESCRIPTION}
        keywords={process.env.NEXT_PUBLIC_META_KEYWORDS}
        pageName="/provider-details"
      />
      <ProviderDetailsPage />
    </>
  );
};

export default index;
