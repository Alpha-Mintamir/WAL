import MetaData from "@/components/Meta/MetaData";
import dynamic from "next/dynamic";

const PrivacyPolicyPage = dynamic(
  () => import("@/components/PagesComponents/StaticPages/PrivacyPolicyPage"),
  { ssr: false }
);
const index = () => {
  return (
    <div>
      <MetaData
        title={`Privacy Policy - ${process.env.NEXT_PUBLIC_META_TITLE}`}
        description={process.env.NEXT_PUBLIC_META_DESCRIPTION}
        keywords={process.env.NEXT_PUBLIC_META_KEYWORDS}
        pageName="/privacy-policy"
      />
      <PrivacyPolicyPage />
    </div>
  );
};

export default index;
