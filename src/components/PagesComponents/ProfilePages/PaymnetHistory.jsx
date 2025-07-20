"use client";
import Layout from "@/components/Layout/Layout";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import React, { useState, useEffect } from "react";
import SideNavigation from "./SideNavigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useTranslation } from "@/components/Layout/TranslationContext";
import { getTransactionApi } from "@/api/apiRoutes";
import toast from "react-hot-toast";
import { isMobile, paymentModes, showPrice, useRTL } from "@/utils/Helper";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import withAuth from "@/components/Layout/withAuth";
import NoDataFound from "@/components/ReUseableComponents/Error/NoDataFound";
import BreadCrumb from "@/components/ReUseableComponents/BreadCrumb";

const PaymentHistory = () => {
  const t = useTranslation();
  const isRtl = useRTL();
  const [transactions, setTransactions] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalTransactions, setTotalTransactions] = useState(0);
  const entriesPerPage = 10;

  const fetchTransactions = async () => {
    try {
      const response = await getTransactionApi({
        limit: entriesPerPage,
        offset: (currentPage - 1) * entriesPerPage,
      });
      setTransactions(response.data);
      setTotalTransactions(response.total); // Assuming the API returns total count
    } catch (error) {
      toast.error(t("somethingWentWrong"));
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [currentPage]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const totalPages = Math.ceil(totalTransactions / entriesPerPage);

  // State to handle page transition animation
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handlePageChange = (page) => {
    setIsTransitioning(true); // Trigger the transition effect

    // Simulate page change and transition
    setTimeout(() => {
      setCurrentPage(page);
      setIsTransitioning(false); // End transition after page change
    }, 500); // Match the CSS transition duration
  };

  const getStatusStyle = (status) => {
    const successStatuses = ["success", "succeeded", "completed"];
    const pendingStatuses = ["pending", "processed"];
    const cancelledStatuses = ["cancelled", "failed"];

    const isSuccess = successStatuses.includes(status);
    const isPending = pendingStatuses.includes(status);
    const isCancelled = cancelledStatuses.includes(status);

    return {
      text: `px-6 py-4 text-center font-medium capitalize ${
        isSuccess
          ? "text-green-600"
          : isPending
          ? "text-yellow-600"
          : isCancelled
          ? "text-red-600"
          : ""
      }`,
      badge: `px-3 py-1 rounded-full text-sm capitalize ${
        isSuccess
          ? "bg-green-100"
          : isPending
          ? "bg-yellow-100"
          : isCancelled
          ? "bg-red-100"
          : ""
      }`,
    };
  };
  

  return (
    <Layout>
      <BreadCrumb
        firstEle={t("paymentHistory")}
        firstEleLink="/payment-history"
        isMobile={isMobile}
      />
      <section className="profile_sec md:my-12">
        <div className="container mx-auto">
          <div className="grid grid-cols-12 gap-6">
            {/* Sidebar */}
             <div className="col-span-12 lg:col-span-3 hidden md:block">
              <SideNavigation />
            </div>

            {/* Main Content */}
            <div className="lg:col-span-9 col-span-12">
              <div className="flex flex-col gap-6">
                <div className="page-headline text-xl md:text-2xl sm:text-3xl font-semibold border-b pb-3 md:pb-0 md:border-none">
                  <span>{t("paymentHistory")}</span>
                </div>

                {/* Payment History Table */}
                <div className="overflow-x-auto rounded-xl shadow-sm border">
                  <Table className="w-full">
                    {/* Table Header */}
                    <TableHeader className="primary_bg_color text-white hover:!text-white">
                      <TableRow className="text-white hover:!bg-transparent border-none">
                        <TableHead
                          className={`px-6 py-4 font-semibold text-center text-white first:${
                            isRtl ? "rounded-tr-xl" : "rounded-tl-xl"
                          }`}
                        >
                          {t("transactionId")}
                        </TableHead>
                        <TableHead className="px-6 py-4 font-semibold text-center text-white">
                          {t("paymentMethod")}
                        </TableHead>
                        <TableHead className="px-6 py-4 font-semibold text-center text-white">
                          {t("transationDate")}
                        </TableHead>
                        <TableHead className="px-6 py-4 font-semibold text-center text-white">
                          {t("amount")}
                        </TableHead>
                        <TableHead
                          className={`px-6 py-4 font-semibold text-center text-white last:${
                            isRtl ? "rounded-tl-xl" : "rounded-tr-xl"
                          }`}
                        >
                          {t("status")}
                        </TableHead>
                      </TableRow>
                    </TableHeader>

                    {/* Table Body */}
                    <TableBody>
                      {transactions.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={5}
                            className="text-center py-4 font-medium"
                          >
                            <div className="w-full h-[60vh] flex items-center justify-center">
                              <NoDataFound
                                title={t("noPaymentHistoryFound")}
                                desc={t("noPaymentHistoryText")}
                              />
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        transactions.map((row, index) => (
                          <TableRow
                            key={row.id}
                            className={`${"card_bg transition-colors"} ${
                              index === transactions.length - 1
                                ? "last-row"
                                : "border-b"
                            }`}
                          >
                            <TableCell className="px-6 py-4 text-start">
                              {row.id}
                            </TableCell>
                            <TableCell className="px-6 py-4">
                              <div className="flex justify-start">
                                {paymentModes.map((paymentMode) => {
                                  if (paymentMode.method === row.type) {
                                    return (
                                      <div
                                        key={paymentMode.method}
                                        className="flex items-center gap-3"
                                      >
                                        <Avatar className="h-[40px] w-[40px] rounded-[4px]">
                                          <AvatarImage
                                            src={paymentMode.icon}
                                            alt={paymentMode.method}
                                            width={40}
                                            height={40}
                                          />
                                        </Avatar>
                                        <span className="text-sm font-medium capitalize">
                                          {t(paymentMode.method)}
                                        </span>
                                      </div>
                                    );
                                  }
                                  return null;
                                })}
                              </div>
                            </TableCell>
                            <TableCell className="px-6 py-4 text-start">
                              {formatDate(row.transaction_date)}
                            </TableCell>
                            <TableCell className="px-6 py-4 text-start font-medium">
                              {showPrice(row.amount)}
                            </TableCell>
                            <TableCell
                              className={
                                getStatusStyle(row.status.toLowerCase()).text
                              }
                            >
                              <span
                                className={
                                  getStatusStyle(row.status.toLowerCase()).badge
                                }
                              >
                                {row.status}
                              </span>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>

                  {/* Pagination */}
                  <div>
                    {transactions.length > 0 ? (
                      <Pagination className="flex justify-center gap-2 w-full mt-4 border-t p-3">
                        {/* Previous Button */}
                        <PaginationPrevious
                          disabled={currentPage === 1}
                          onClick={() =>
                            handlePageChange(Math.max(currentPage - 1, 1))
                          }
                          className={`${
                            currentPage === 1
                              ? "cursor-not-allowed text-gray-400"
                              : "cursor-pointer primary_text_color"
                          } px-4 py-2 rounded-full hover:light_bg_color hover:primary_text_color transition`}
                        >
                          {t("previous")}
                        </PaginationPrevious>

                        {/* Pagination Items */}
                        <PaginationContent className="flex items-center justify-center gap-2">
                          {currentPage > 3 && (
                            <PaginationItem
                              key={1}
                              active={currentPage === 1}
                              className={`${
                                currentPage === 1
                                  ? "primary_bg_color text-white"
                                  : "text-gray-600"
                              } flex items-center justify-center rounded-full cursor-pointer hover:bg-gray-200 transition-all page-transition`}
                            >
                              <PaginationLink
                                onClick={() => handlePageChange(1)}
                              >
                                1
                              </PaginationLink>
                            </PaginationItem>
                          )}

                          {currentPage > 4 && <PaginationEllipsis />}

                          {Array.from({ length: totalPages }, (_, index) => {
                            const page = index + 1;
                            if (
                              page === 1 ||
                              page === totalPages ||
                              (page >= currentPage - 2 &&
                                page <= currentPage + 2)
                            ) {
                              return (
                                <PaginationItem
                                  key={page}
                                  active={currentPage === page}
                                  className={`${
                                    currentPage === page
                                      ? "primary_bg_color text-white"
                                      : "text-gray-600"
                                  } flex items-center justify-center rounded-full cursor-pointer hover:bg-gray-200 transition-all page-transition`}
                                >
                                  <PaginationLink
                                    onClick={() => handlePageChange(page)}
                                  >
                                    {page}
                                  </PaginationLink>
                                </PaginationItem>
                              );
                            }
                            return null;
                          })}

                          {currentPage < totalPages - 3 && (
                            <PaginationEllipsis />
                          )}

                          {currentPage < totalPages - 2 && (
                            <PaginationItem
                              key={totalPages}
                              active={currentPage === totalPages}
                              className={`${
                                currentPage === totalPages
                                  ? "primary_bg_color text-white"
                                  : "text-gray-600"
                              } flex items-center justify-center rounded-full cursor-pointer hover:bg-gray-200 transition-all page-transition`}
                            >
                              <PaginationLink
                                onClick={() => handlePageChange(totalPages)}
                              >
                                {totalPages}
                              </PaginationLink>
                            </PaginationItem>
                          )}
                        </PaginationContent>

                        {/* Next Button */}
                        <PaginationNext
                          disabled={currentPage === totalPages}
                          onClick={() =>
                            handlePageChange(
                              Math.min(currentPage + 1, totalPages)
                            )
                          }
                          className={`${
                            currentPage === totalPages
                              ? "cursor-not-allowed text-gray-400"
                              : "cursor-pointer primary_text_color"
                          } px-4 py-2 rounded-full hover:light_bg_color hover:primary_text_color transition`}
                        >
                          {t("next")}
                        </PaginationNext>
                      </Pagination>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default withAuth(PaymentHistory);
