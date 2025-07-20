"use client";
import React, { useState } from "react";
import { useGoogleMapsLoader } from "@/utils/Helper";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import { MdClose, MdLocationOn } from "react-icons/md";
import Map from "./LocationMapBox/GoogleMap.jsx";
import {
  locationAddressData,
  setLatitude,
  setLongitude,
} from "@/redux/reducers/locationSlice";
import toast from "react-hot-toast";
import { providerAvailableApi } from "@/api/apiRoutes";
import { useTranslation } from "../Layout/TranslationContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const LocationModal = ({ open, onClose }) => {
  const t = useTranslation();
  const { isLoaded, loadError } = useGoogleMapsLoader();
  const router = useRouter();
  const locationData = useSelector((state) => state.location);
  const dispatch = useDispatch();

  const [fullAddress, setFullAddress] = useState({
    lat: "",
    lng: "",
    address: locationData?.locationAddress,
  });

  const handleConfirmLocation = async () => {
    if (fullAddress.lat && fullAddress.lng && fullAddress.address) {
      try {
        const response = await providerAvailableApi({
          latitude: fullAddress?.lat,
          longitude: fullAddress?.lng,
        });
        if (response?.error === false) {
          dispatch(setLatitude(fullAddress.lat));
          dispatch(setLongitude(fullAddress.lng));
          dispatch(locationAddressData(fullAddress.address));
          onClose();
          router.push("/");
        } else {
          toast.error(response?.message);
        }
      } catch (error) {
        console.log(error);
      }
    } else {
      toast.error(t("pleaseSelectValidLocation"));
    }
  };

  const onLocationChange = async (newAddresses) => {
    setFullAddress({
      lat: newAddresses?.lat,
      lng: newAddresses?.lng,
      address: newAddresses?.address,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl p-4 md:p-6 card_bg rounded-lg">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-xl sm:text-2xl font-bold">
            {t("selectAddress")}
          </DialogTitle>
          <DialogClose asChild>
            <Button variant="ghost" className="">
              <MdClose size={20}/>
            </Button>
          </DialogClose>
        </DialogHeader>

        <div className="rounded-lg mb-6 h-[350px] md:h-[450px] background_color">
          {isLoaded ? (
            <Map
              isClicked={true}
              latitude={locationData.lat}
              longitude={locationData.lng}
              isLoaded={isLoaded}
              loadError={loadError}
              onLocationChange={onLocationChange}
              setFullAddress={setFullAddress}
            />
          ) : (
            <p className="text-center">Loading Map...</p>
          )}
        </div>

        <div className="flex items-center mb-6 gap-2">
          <div className="p-2 w-[48px] h-[48px] flex items-center justify-center light_bg_color rounded-[12px]">
            <MdLocationOn size={24} className="primary_text_color" />
          </div>
          <div>
            <p className="text-sm description_color">{t("currentLocation")}</p>
            <p className="font-semibold text-lg">{fullAddress?.address || t("noLocationSelected")}</p>
          </div>
        </div>

        <Button
          onClick={handleConfirmLocation}
          className="w-full primary_bg_color text-white py-3 rounded-md transition-all text-lg font-semibold"
        >
          {t("confirmAddress")}
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default LocationModal;
