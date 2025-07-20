import MetaData from "@/components/Meta/MetaData";
import dynamic from "next/dynamic";

const ContactUsPage = dynamic(
  () => import("@/components/PagesComponents/StaticPages/ContactUsPage"),
  { ssr: false }
)

const index = () => {
  return (
    <div>
      <MetaData
        title={`Contact Us - ${process.env.NEXT_PUBLIC_META_TITLE}`}
        description={process.env.NEXT_PUBLIC_META_DESCRIPTION}
        keywords={process.env.NEXT_PUBLIC_META_KEYWORDS}
        pageName="/contact-us"
      />
      <ContactUsPage /></div>
  )
}

export default index