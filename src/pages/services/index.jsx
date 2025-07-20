import MetaData from '@/components/Meta/MetaData'
import dynamic from 'next/dynamic'

const AllCategoriesPage = dynamic(
  () => import('@/components/PagesComponents/AllCategoriesPage/AllCategoriesPage'),
  { ssr: false })

const index = () => {
  return (

    <>
    <MetaData
        title={`Services - ${process.env.NEXT_PUBLIC_META_TITLE}`}
        description={process.env.NEXT_PUBLIC_META_DESCRIPTION}
        keywords={process.env.NEXT_PUBLIC_META_KEYWORDS}
        pageName="/services"
      />
    <AllCategoriesPage />
    </>
  )
}

export default index