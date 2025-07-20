import MetaData from '@/components/Meta/MetaData'
import dynamic from 'next/dynamic'
const AboutaUsPage = dynamic(
  () => import('@/components/PagesComponents/StaticPages/AboutaUsPage'),
  { ssr: false })
  
const index = () => {
  // Organization structured data for About Us page
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": process.env.NEXT_PUBLIC_META_TITLE,
    "url": process.env.NEXT_PUBLIC_WEB_URL,
    "logo": `${process.env.NEXT_PUBLIC_WEB_URL}/favicon.ico`,
    "description": process.env.NEXT_PUBLIC_META_DESCRIPTION,
    "sameAs": [
      "https://facebook.com/edemand",
      "https://twitter.com/edemand",
      "https://linkedin.com/company/edemand",
      "https://instagram.com/edemand"
    ]
  };

  return (
    <>
      <MetaData 
        title={`About Us - ${process.env.NEXT_PUBLIC_META_TITLE}`}
        description="Learn about our mission and vision. Discover our story and commitment to quality service."
        keywords="about us, our mission, our vision, our story"
        pageName="/about-us"
        // structuredData={structuredData}
      />
      <AboutaUsPage />
    </>
  )
}

export default index