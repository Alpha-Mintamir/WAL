import React, { useState, useEffect } from "react";
import Layout from "../Layout/Layout";
import BreadCrumb from "../ReUseableComponents/BreadCrumb";
import CartItemCard from "./CartItemCard";
import { useDispatch, useSelector } from "react-redux";
import {
  currentCartProvider,
  selectCartItems,
  selectCartProvider,
} from "@/redux/reducers/cartSlice";
import NoDataFound from "../ReUseableComponents/Error/NoDataFound";
import { useRouter } from "next/router";
import { showPrice, } from "@/utils/Helper";
import { useTranslation } from "../Layout/TranslationContext";
import withAuth from "../Layout/withAuth";
import { clearReorder } from "@/redux/reducers/reorderSlice";

const Cart = () => {
  const t = useTranslation();

  const router = useRouter();
  const cartItems = useSelector(selectCartItems);
  const currentCartProviderData = useSelector(selectCartProvider);
  const dispatch = useDispatch();

  const handleCheckout = () => {
    dispatch(clearReorder());
    router.push("/checkout");
  };
  return (
    <Layout>
      <BreadCrumb firstEle={t("cart")} firstEleLink="/cart" />
      <section className="cart-page my-12 container mx-auto ">
        {cartItems.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Services Section */}
            <div className="col-span-12 lg:col-span-8">
              <h2 className="text-2xl lg:text-3xl font-semibold">
                {currentCartProviderData?.company_name} {""} {cartItems?.length === 1 ? t("service") : t("services")}
              </h2>
              <div className="cart_data mt-6 space-y-4">
                {cartItems.map((ele, index) => (
                  <div key={index}>
                    <CartItemCard data={ele} />
                  </div>
                ))}
              </div>
            </div>
            <div className="col-span-12 lg:col-span-4">
              <span className="text-3xl font-semibold">{t("summery")}</span>
              <div className="mt-6">
                {/* Charges Breakdown */}
                <div className="border light_bg_color p-5 rounded-xl">
                  <div className="flex flex-col gap-6">
                    <div className="flex justify-between items-center text-base">
                      <span>{t("subTotal")}</span>
                      <span className="font-semibold">{showPrice(currentCartProviderData?.sub_total)}</span>
                    </div>
                    {/* {currentCartProviderData?.visiting_charges > 0 && (
                      <div className="flex justify-between items-center text-base">
                        <span>Visiting Charge</span>
                        <span className="font-semibold">
                          +${currentCartProviderData?.visiting_charges}
                        </span>
                      </div>
                    )} */}
                    {/* <div className="flex justify-between items-center text-base">
                    <span>Discount</span>
                    <span className="font-semibold">-130.00</span>
                  </div> */}
                  </div>
                  <hr className="border-gray-300 my-6" />
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>{t("finalPrice")}</span>
                    <span>{showPrice(currentCartProviderData?.overall_amount)}</span>
                  </div>
                  {/* Checkout Button */}
                  {/* <Link href="/checkout" > */}
                  <button
                    onClick={handleCheckout}
                    className="w-full primary_bg_color mt-6 text-white py-2 rounded-xl font-medium text-sm transition hover:bg-black"
                  >
                    {t("checkout")}
                  </button>
                  {/* </Link> */}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1">
            <div className="w-full h-[60vh] flex items-center justify-center">
              <NoDataFound
                title={t("yourCartempty")}
                desc={t("yourCartemptyText")}
              />
            </div>
          </div>
        )}
      </section>
    </Layout>
  );
};

export default withAuth(Cart);
