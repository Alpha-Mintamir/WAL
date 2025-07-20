import MetaData from '@/components/Meta/MetaData';
import dynamic from 'next/dynamic'

const LandingPageLayout = dynamic(
  () => import('@/components/PagesComponents/LandingPageLayout/LandingPageLayout'),
  { ssr: false })

const index = () => {

  return (
    <>
    <MetaData
        title={`Welcome - ${process.env.NEXT_PUBLIC_META_TITLE}`}
        description={process.env.NEXT_PUBLIC_META_DESCRIPTION}
        keywords={process.env.NEXT_PUBLIC_META_KEYWORDS}
        pageName="/home"
      />
      <LandingPageLayout />
    </>
  );
};

export default index;
