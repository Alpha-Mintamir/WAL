"use client";
import React, { useState, useRef, useEffect } from "react";
import { User } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { MdClose } from "react-icons/md";
import CustomImageTag from "../ReUseableComponents/CustomImageTag";
import {
  clearAuthData,
  setToken,
  setUserData,
  updateUserData,
} from "@/redux/reducers/userDataSlice";
import { store } from "@/redux/store";
import toast from "react-hot-toast";
import { registerUserApi, update_user } from "@/api/apiRoutes";
import { useDispatch, useSelector } from "react-redux";
import MiniLoader from "../ReUseableComponents/MiniLoader";
import { useTranslation } from "../Layout/TranslationContext";

const EditProfile = ({ open, close, isEditProfile, userData }) => {

  const authData = store.getState()?.userData?.userAuthData;

  const t = useTranslation();
  const dispatch = useDispatch();

  const [isLoading, setIsLoading] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [formData, setFormData] = useState({
    name: authData?.displayName,
    phone: authData?.phoneNumber,
    email: authData?.email,
    country_code: authData?.country_code,
    loginType: authData?.type,
  });

  const settingsData = useSelector((state) => state?.settingsData);
  const fcmToken = settingsData?.fcmToken

  useEffect(() => {
    if (userData) {
      setProfileImage(userData?.image);
      setFormData({
        name: userData?.username,
        email: userData?.email,
        phone: userData?.phone,
        country_code: userData?.country_code,
        loginType: userData?.type,
      });
    }
  }, [userData]);

  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragging(true); // Show the dashed border and light blue background when dragging
  };

  const handleDragLeave = () => {
    setDragging(false); // Remove styles when dragging leaves
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false); // Remove styles after drop
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      setProfileImage(file);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      setProfileImage(file);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const removeImage = () => {
    setProfileImage(null);
  };
  const validateForm = () => {
    const { name, phone, email } = formData;

    // Name validation
    if (!name || name.trim() === "") {
      toast.error("Please enter your name.");
      return false;
    }
    
    // Phone number validation (empty first, then format)
    if (!phone || phone.trim() === "") {
      toast.error(t("missingPhoneNumber"));
      return false;
    }

    const phoneRegex = /^\d+$/;
    if (!phoneRegex.test(phone)) {
      toast.error("Please enter a valid phone number with digits only.");
      return false;
    }

    // Email validation (empty first, then format)
    if (!email || email.trim() === "") {
      toast.error("Please enter your email address.");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address.");
      return false;
    }

    return true;
  };

  const handleUpdateProfile = async () => {
    if (validateForm()) {
      try {
        setIsLoading(true);
        const response = await registerUserApi({
          web_fcm_id: fcmToken,
          email: formData?.email,
          username: formData?.name,
          mobile: formData?.phone ? formData?.phone : "",
          uid: authData?.uid,
          country_code:
            formData?.loginType === "phone" ? "+" + formData?.country_code : "",
        });
        if (response.error === false) {
          const userData = response?.data;
          const userToken = response?.token;
          dispatch(setUserData(userData));
          dispatch(setToken(userToken));
          dispatch(clearAuthData());
          setIsLoading(false);
          close();
        } else {
          toast.error(response?.message);
        }
      } catch (error) {
        console.log(error);
        setIsLoading(false);
      }
    }
  };

  const handleSaveProfile = async () => {
    if (validateForm()) {
      try {
        setIsLoading(true);
        const response = await update_user({
          email: formData?.email,
          username: formData?.name,
          mobile: formData?.phone ? formData?.phone : "",
          country_code: "+" + userData?.country_code,
          image: profileImage ? profileImage : "",
        });
        if (response.error === false) {
          const user = response?.data;
          dispatch(updateUserData(user));
          setIsLoading(false);
          toast.success(response?.message);
          close();
        } else {
          setIsLoading(false);
          toast.error(response?.message);
        }
      } catch (error) {
        console.log(error);
      }
    }
  };
  return (
    <>
      <Dialog open={open}>
        <DialogContent className="card_bg rounded-lg shadow-lg p-6 w-full max-w-md">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">
              {isEditProfile ? t("editProfile") : t("updateProfile")}
            </h2>
            {isEditProfile && (
              <button
                onClick={close}
                className="rounded-full description_color text-white p-1"
              >
                <MdClose size={24} />
              </button>
            )}
          </div>
          {isEditProfile ? (
            <>
              <div
                className={`border-2 border-dashed ${dragging ? "border_color light_bg_color" : "border-gray-300"
                  } rounded-lg p-4 mb-6 cursor-pointer transition-all`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current.click()}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                    {profileImage ? (
                      <CustomImageTag
                        src={
                          profileImage instanceof File
                            ? URL.createObjectURL(profileImage)
                            : profileImage
                        }
                        alt="profile"
                        className="h-full w-full rounded-full"
                      />
                    ) : (
                      <User className="description_color" size={24} />
                    )}
                  </div>
                  <div className="flex-1">
                    {dragging ? (
                      <p className="text-sm font-medium">{t("dragAndDrop")}</p>
                    ) : (
                      <>
                        <p className="text-sm font-medium">{t("upload")}</p>
                        <p className="text-sm description_color">
                          {t("profilePhotoHere")}
                        </p>
                      </>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {/* {profileImage && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeImage();
                        }}
                        className="text-sm description_color hover:underline"
                      >
                        Remove
                      </button>
                    )} */}
                    <button className="px-4 py-1 text-sm text-white primary_bg_color rounded-md">
                      {profileImage ? t("update") : t("select")}
                    </button>
                  </div>
                </div>
              </div>

              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/png, image/jpeg, image/jpg"
                onChange={handleFileSelect}
              />
            </>
          ) : null}

          <div className="space-y-4">
            <div>
              <label className="flex items-center gap-2 mb-2">
                <User size={20} className="description_color" />
                <span className="text-sm description_color">{t("name")}</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder={t("enterName")}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-0 focus:border_color focus:light_bg_color focus:primary_text_color transition-all duration-300"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 mb-2">
                <svg
                  className="w-5 h-5 description_color"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
                <span className="text-sm description_color">{t("phone")}</span>
              </label>
              <input
                readOnly={authData?.type === "phone" ? true : false}
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder={t("enterPhoneNumber")}
                className="rtl:text-right ltr:text-left w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-0 focus:border_color focus:light_bg_color focus:primary_text_color transition-all duration-300"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 mb-2">
                <svg
                  className="w-5 h-5 description_color"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                <span className="text-sm description_color">{t("email")}</span>
              </label>
              <input
                readOnly={authData?.type === "google" ? true : false}
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder={t("enterEmail")}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-0 focus:border_color focus:light_bg_color focus:primary_text_color transition-all duration-300"
              />
            </div>
          </div>
          {isEditProfile ? (
            isLoading ? (
              <div className="w-full p-3 flex items-center justify-center font-semibold rounded-md primary_bg_color">
                <MiniLoader />
              </div>
            ) : (
              <button
                className="w-full mt-6 px-4 py-2 primary_bg_color text-white rounded-lg focus:outline-none focus:ring-0 focus:ring-offset-0"
                onClick={handleSaveProfile}
              >
                {t("saveChanges")}
              </button>
            )
          ) : isLoading ? (
            <div className="w-full p-3 flex items-center justify-center font-semibold rounded-md primary_bg_color">
              <MiniLoader />
            </div>
          ) : (
            <button
              className="w-full mt-6 px-4 py-2 primary_bg_color text-white rounded-lg focus:outline-none focus:ring-0 focus:ring-offset-0"
              onClick={handleUpdateProfile}
            >
              {t("update")}
            </button>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EditProfile;
