import React, { useEffect, useState } from 'react'
import Layout from '@/components/Layout/Layout'
import BreadCrumb from '@/components/ReUseableComponents/BreadCrumb'
import { getFaqsApi } from '@/api/apiRoutes'
import { useTranslation } from '@/components/Layout/TranslationContext'
import FaqAccordion from '@/components/ReUseableComponents/FaqAccordion'
import NoDataFound from '@/components/ReUseableComponents/Error/NoDataFound'

const Faqs = () => {
    const t = useTranslation()
    const [faqs, setFaqs] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [totalCount, setTotalCount] = useState(0)
    
    const limit = 5
    const [offset, setOffset] = useState(0)

    const fetchFaqs = async (currentOffset = 0) => {
        try {
            setIsLoading(true)
            const res = await getFaqsApi({
                limit: limit,
                offset: currentOffset
            })
            
            if (currentOffset === 0) {
                // First load
                setFaqs(res?.data || [])
            } else {
                // Load more - append new data
                setFaqs(prev => [...prev, ...(res?.data || [])])
            }
            setTotalCount(parseInt(res?.total || 0))
        } catch (error) {
            console.error("Error fetching FAQs:", error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchFaqs(0) // Initial load with offset 0
    }, [])

    const loadMore = async () => {
        const newOffset = offset + limit
        setOffset(newOffset)
        await fetchFaqs(newOffset)
    }

    return (
        <Layout>
            <BreadCrumb firstEle={t("faqs")} firstEleLink="/faqs" />
            <div className="container mx-auto">
                <div className="max-w-7xl mx-auto grid grid-cols-1 gap-4 mb-10">
                    {isLoading && faqs.length === 0 ? (
                        <div className="flex justify-center items-center min-h-[400px]">
                            <div className="loading_spinner"></div>
                        </div>
                    ) : faqs?.length > 0 ? (
                        <div className="grid grid-cols-1 gap-4">
                            <div className="w-full flex flex-col gap-4">
                                {faqs.map((faq, index) => (
                                    <div key={faq.id || index}>
                                        <FaqAccordion faq={faq} />
                                    </div>
                                ))}
                            </div>
                            {/* Show load more button if there are more items to fetch */}
                            {faqs.length < totalCount && (
                                <div className="flex justify-center mt-8">
                                    <button
                                        className="px-6 py-2 bg-[#2D2C2F] text-white font-semibold rounded-lg hover:primary_bg_color transition-colors duration-300 flex items-center gap-2"
                                        onClick={loadMore}
                                        disabled={isLoading}
                                    >
                                        {isLoading ? (
                                            <>
                                                <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin"></div>
                                                {t("loading")}
                                            </>
                                        ) : (
                                            t("loadMore")
                                        )}
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="w-full h-[60vh] flex items-center justify-center">
                            <NoDataFound
                                title={t("noFaqsFound")}
                                desc={t("noFaqsFoundText")}
                            />
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    )
}

export default Faqs