import React from 'react'
import MetaData from '@/components/Meta/MetaData'
import dynamic from 'next/dynamic'

const FaqsPage = dynamic(
  () => import('@/components/PagesComponents/FaqsPage/FaqsPage'),
  { ssr: false }
)

const index = () => {
  return (
        <div>
        <MetaData
            title={`FAQs - ${process.env.NEXT_PUBLIC_META_TITLE}`}
            description={process.env.NEXT_PUBLIC_META_DESCRIPTION}
            keywords={process.env.NEXT_PUBLIC_META_KEYWORDS}
            pageName="/faqs"
        />
        <FaqsPage />
    </div>
  )
}

export default index