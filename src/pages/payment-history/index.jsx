import MetaData from "@/components/Meta/MetaData";
import dynamic from "next/dynamic";

const PaymnetHistory = dynamic(
  () => import("@/components/PagesComponents/ProfilePages/PaymnetHistory"),
  { ssr: false }
);

const index = () => {
  return (
    <div>
      <MetaData
        title={`Payment History - ${process.env.NEXT_PUBLIC_META_TITLE}`}
        description={process.env.NEXT_PUBLIC_META_DESCRIPTION}
        keywords={process.env.NEXT_PUBLIC_META_KEYWORDS}
        pageName="/payment-history"
      />
      <PaymnetHistory />
    </div>
  )
}

export default index