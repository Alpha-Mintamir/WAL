import MetaData from '@/components/Meta/MetaData'
import dynamic from 'next/dynamic'

const AllProvidersPage = dynamic(
  () => import('@/components/PagesComponents/AllProviders/AllProvidersPage'),
  { ssr: false })

const index = () => {
  return (
    <>
    <MetaData
        title={`Providers - ${process.env.NEXT_PUBLIC_META_TITLE}`}
        description={process.env.NEXT_PUBLIC_META_DESCRIPTION}
        keywords={process.env.NEXT_PUBLIC_META_KEYWORDS}
        pageName="/providers"
      />
    <AllProvidersPage /></>
  )
}

export default index