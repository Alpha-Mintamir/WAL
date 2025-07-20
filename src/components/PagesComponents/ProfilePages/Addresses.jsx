"use client";
import Layout from "@/components/Layout/Layout";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import React, { useState, useEffect } from "react";
import SideNavigation from "./SideNavigation";
import AddressCard from "@/components/Cards/AddressCard";
import { useTranslation } from "@/components/Layout/TranslationContext";
import { DeleteAddressApi, getAddressApi } from "@/api/apiRoutes";
import toast from "react-hot-toast";
import AddressDrawer from "@/components/ReUseableComponents/Drawers/AddressDrawer";
import withAuth from "@/components/Layout/withAuth";
import NoDataFound from "@/components/ReUseableComponents/Error/NoDataFound";
import { FaCirclePlus } from "react-icons/fa6";
import BreadCrumb from "@/components/ReUseableComponents/BreadCrumb";
import { isMobile } from "@/utils/Helper";

const Addresses = () => {
  const t = useTranslation();

  const [addresses, setAddresses] = useState([]);
  const [addressDrawerOpen, setAddressDrawerOpen] = useState(false);
  const [defaultAddress, setDefaultAddress] = useState(null);

  const fetchAddresses = async () => {
    const response = await getAddressApi();
    if (response.error === false) {
      // Sort addresses to show default addresses first
      const sortedAddresses = response.data.sort((a, b) => {
        return b.is_default - a.is_default; // This will put is_default="1" first
      });
      setAddresses(sortedAddresses);
      // setDefaultAddress(sortedAddresses.find(address => address.is_default === "1"));
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleDeleteAddress = async (id) => {
    try {
      const response = await DeleteAddressApi({ address_id: id });
      if (response.error === false) {
        setAddresses(addresses.filter((address) => address.id !== id));
        toast.success(response.message);
      }
    } catch (error) {
      toast.error(t("somethingWentWrong"));
    }
  };

  const handleEditAddress = (id) => {
    setDefaultAddress(addresses.find((address) => address.id === id));
    setAddressDrawerOpen(true);
  };

  const handleUpdateAddress = (updatedAddress) => {
    setAddresses((prevAddresses) =>
      prevAddresses.map((address) => {
        if (address.id === updatedAddress.id) {
          // Update the edited address
          return updatedAddress;
        } else if (
          updatedAddress.is_default === "1" &&
          address.is_default === "1"
        ) {
          // If the updated address is set as default, ensure no other address remains default
          return { ...address, is_default: "0" };
        } else {
          // Return the address as is
          return address;
        }
      })
    );
  };

  return (
    <Layout>
      <BreadCrumb firstEle={t("addresses")} firstEleLink="/addresses"   isMobile={isMobile}/>
      <section className="profile_sec md:my-12">
        <div className="container mx-auto">
          {/* Grid layout */}
          <div className="grid grid-cols-12 gap-6">
            {/* Sidebar */}
             <div className="col-span-12 lg:col-span-3 hidden md:block">
              <SideNavigation />
            </div>

            {/* Main Content */}
            <div className="lg:col-span-9 col-span-12">
              <div className="flex flex-col gap-6 border-b pb-3 md:pb-0 md:border-none">
                <div className="flex items-center justify-between w-full">
                  <div className="page-headline text-lg md:text-2xl sm:text-3xl font-semibold">
                    <span>{t("myAddresses")}</span>
                  </div>
                  {/* {addresses.length === 0 && */}
                    <div>

                      <button
                        onClick={() => setAddressDrawerOpen(true)}
                        className="mt-2 w-full border border-dashed border_color flex items-center justify-center gap-3 primary_text_color p-2 md:p-4 rounded-xl"
                      >
                        <span>
                          <FaCirclePlus size={22} />
                        </span>
                        <span>{t("addAddress")}</span>
                      </button>
                    </div>
                  {/* } */}
                </div>
                {/* Responsive Grid for Address Cards */}
                {addresses.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-6">
                    {addresses?.map((address, index) => (
                      <AddressCard
                        key={index}
                        data={address}
                        onDelete={() => handleDeleteAddress(address.id)}
                        onEdit={() => handleEditAddress(address.id)}
                        t={t}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="w-full h-[60vh] flex items-center justify-center">
                    <NoDataFound
                      title={t("noAddressesFound")}
                      desc={t("noAddressesText")}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
      {addressDrawerOpen && (
        <AddressDrawer
          addresses={addresses}
          setAddresses={setAddresses}
          open={addressDrawerOpen}
          onClose={() => setAddressDrawerOpen(false)}
          defaultAddress={defaultAddress}
          setDefaultAddress={setDefaultAddress}
          onUpdateAddress={handleUpdateAddress} // Pass the update function
        />
      )}
    </Layout>
  );
};

export default withAuth(Addresses);
