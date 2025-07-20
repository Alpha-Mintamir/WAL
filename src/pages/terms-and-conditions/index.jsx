import MetaData from "@/components/Meta/MetaData";
import dynamic from "next/dynamic";

const TermsAndConditionPage = dynamic(
  () =>
    import("@/components/PagesComponents/StaticPages/TermsAndConditionPage"),
  { ssr: false }
);
const index = () => {
  return (
    <div>
      <MetaData
        title={`Terms and Conditions - ${process.env.NEXT_PUBLIC_META_TITLE}`}
        description={process.env.NEXT_PUBLIC_META_DESCRIPTION}
        keywords={process.env.NEXT_PUBLIC_META_KEYWORDS}
        pageName="/terms-and-conditions"
      />
      <TermsAndConditionPage />
    </div>
  );
};

export default index;
