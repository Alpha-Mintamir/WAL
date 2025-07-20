"use client";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import Link from "next/link";
import { useEffect, useState } from "react";
import { FaBars, FaChevronRight, FaShoppingCart } from "react-icons/fa";
import { getCartApi, logoutApi } from "@/api/apiRoutes";
import {
  clearCart,
  selectTotalItems,
  setCartData,
} from "@/redux/reducers/cartSlice";
import { clearUserData, getUserData } from "@/redux/reducers/userDataSlice";
import {
  isLogin,
  placeholderImage,
  setLanguage,
  useIsDarkMode,
  useRTL,
} from "@/utils/Helper";
import { MdClose } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import CustomImageTag from "../ReUseableComponents/CustomImageTag";
import EditProfileModal from "../auth/EditProfile";
import LoginModal from "../auth/LoginModal";
import TopHeader from "./TopHeader";
import CartDialog from "../ReUseableComponents/Dialogs/CartDialog";
import { usePathname } from "next/navigation";
import AccountDialog from "../ReUseableComponents/Dialogs/AccountDialog";
import { useRouter } from "next/router";
import { useTranslation } from "./TranslationContext";
import { selectReorderMode } from "@/redux/reducers/reorderSlice";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  IoChatboxEllipsesOutline,
  IoExitOutline,
  IoLocationOutline,
  IoCardOutline,
} from "react-icons/io5";
import { CiBookmarkCheck } from "react-icons/ci";
import { FaRegCalendarCheck } from "react-icons/fa";
import { MdNotificationsNone } from "react-icons/md";
import LogoutDialog from "../ReUseableComponents/Dialogs/LogoutDialog";
import FirebaseData from "@/utils/Firebase";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTheme } from "next-themes";
import config from "@/utils/Langconfig";
import { setTheme } from "@/redux/reducers/themeSlice";
import toast from "react-hot-toast";

const Header = () => {
  const t = useTranslation();
  const router = useRouter();
  const isRTL = useRTL();
  const pathName = usePathname();
  const dispatch = useDispatch();
  const { signOut } = FirebaseData();
  const userData = useSelector(getUserData);
  const settingsData = useSelector((state) => state?.settingsData);
  const websettings = settingsData?.settings?.web_settings;
  const isLoggedIn = isLogin();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isLoginModalOpen, setLoginModalIsOpen] = useState(false);
  const [cartVisibleDeskTop, setCartVisibleDeskTop] = useState(false);
  const [cartVisibleMobile, setCartVisibleMobile] = useState(false);
  const [accountVisible, setAccountVisible] = useState(false);
  const [openLogoutDialog, setOpenLogoutDialog] = useState(false);
  const [openProfileModal, setOpenProfileModal] = useState(false);

  const [dropdownStates, setDropdownStates] = useState({
    account: false,
  });

  const toggleDropdown = (key) => {
    setDropdownStates((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const isCheckoutPage = pathName === "/checkout";
  const isCartPage = pathName === "/cart";

  // Access total item count using the selector
  const totalItems = useSelector(selectTotalItems);

  const isReorder = useSelector(selectReorderMode);

  const handleOpen = () => {
    setLoginModalIsOpen(true);
    setIsDrawerOpen(false);
  };

  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  const fcmId = userData?.web_fcm_id;

  const handleLogout = async (e) => {
    e.preventDefault();
    const response = await logoutApi({ fcm_id: fcmId });
    if (response?.error === false) {
      setOpenLogoutDialog(false);
      dispatch(clearUserData());
      dispatch(clearCart());
      signOut();
      router.push("/");
      toast.success(response?.message);
    } else {
      toast.error(t("somethingWentWrong"));
    }
  };

  const handleOpenLogoutDialog = (e) => {
    e.preventDefault();
    setOpenLogoutDialog(true);
  };

  // Fetch cart data from API
  const fetchCartDetails = async () => {
    try {
      // Skip cart fetch if we're in a reorder process
      if (isReorder) {
        return;
      }

      const response = await getCartApi();
      if (response?.error === false) {
        const cartData = response.data?.cart_data;

        const structuredCartItems = cartData?.data.map((item) => ({
          ...item,
          ...item.servic_details,
        }));

        dispatch(
          setCartData({
            provider: cartData,
            items: structuredCartItems || [],
          })
        );
      }
    } catch (error) {
      console.error("Error fetching cart:", error);
    }
  };

  useEffect(() => {
    if (isLoggedIn && !isReorder && !isCheckoutPage) {
      fetchCartDetails();
    }
  }, [isLoggedIn, isReorder, isCheckoutPage]);

  const [isOpenHam, setIsOpenHam] = useState(false);


  // topHeader functions and states 

  const [showMobileNav, setShowMobileNav] = useState(false)

  const [isOpen, setIsOpen] = useState(false);
  const { theme, setTheme: setNextTheme } = useTheme();
  const currentLanguage = useSelector(
    (state) => state.translation.currentLanguage
  );

  const [selectedLanguage, setSelectedLanguage] = useState(
    currentLanguage.langCode
  );

  useEffect(() => {
    document.documentElement.dir = currentLanguage.isRtl ? "rtl" : "ltr";
  }, [currentLanguage.isRtl]);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setNextTheme(newTheme);
    dispatch(setTheme(newTheme));
  };

  const handleLanguageChange = (value) => {
    const langObject = config.supportedLanguages.find(
      (lang) => lang.langCode === value
    );

    setSelectedLanguage(value);
    dispatch(setLanguage(langObject));
    setIsOpen(false);
  };

  const getCurrentLanguageDisplay = () => {
    const lang = config.supportedLanguages.find(
      (lang) => lang.langCode === selectedLanguage
    );
    return lang?.language || "Select Language";
  };

  const handleMobileNav = () => {
    setIsOpenHam(!isOpenHam)
    setShowMobileNav(!showMobileNav)
  }


  return (
    <header className="w-full sticky top-0 z-50 card_bg dark:bg-gray-900 !border-b !border-[#21212114] shadow-[0px_15px_47px_0px_rgba(0,0,0,0.04)]">
      <div>
        {/* Top header */}
        <TopHeader />

        {/* Main header */}
        <div className={`safari-header w-full card_bg py-4 px-4 flex justify-between items-center flex-wrap md:flex-nowrap ${showMobileNav ? 'h-70' : 'h-16'} md:h-max transition-all duration-500 overflow-hidden`}>
          <div className="container mx-auto flex justify-between items-center">
            <Link href="/" title={t("home")} className="relative">
              <CustomImageTag
                src={websettings?.web_logo}
                alt="logo"
                className="h-[40px] md:h-[60px] w-[160px] md:w-full max-w-[220px] safari-logo"
              />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex gap-6 text_color">
              <Link
                href="/"
                className={`relative group text-base font-normal hover:primary_text_color transition-colors ${pathName === "/" ? "primary_text_color" : ""
                  }`}
                title={t("home")}
              >
                {t("home")}
                <span
                  className={`absolute left-1/2 -bottom-1  h-0.5 primary_bg_color transition-all duration-300 ease-in-out transform -translate-x-1/2 ${pathName === "/" ? "w-3/4" : "w-0 group-hover:w-3/4"
                    }`}
                ></span>
              </Link>

              <Link
                href="/services"
                className={`relative group text-base font-normal hover:primary_text_color transition-colors ${pathName === "/services" ? "primary_text_color" : ""
                  }`}
                title={t("services")}
              >
                {t("services")}
                <span
                  className={`absolute left-1/2 -bottom-1  h-0.5 primary_bg_color transition-all duration-300 ease-in-out transform -translate-x-1/2 ${pathName === "/services"
                    ? "w-3/4"
                    : "w-0 group-hover:w-3/4"
                    }`}
                ></span>
              </Link>

              <Link
                href="/providers"
                className={`relative group text-base font-normal hover:primary_text_color transition-colors ${pathName === "/providers" ? "primary_text_color" : ""
                  }`}
                title={t("providers")}
              >
                {t("providers")}
                <span
                  className={`absolute left-1/2 -bottom-1  h-0.5 primary_bg_color transition-all duration-300 ease-in-out transform -translate-x-1/2 ${pathName === "/providers"
                    ? "w-3/4"
                    : "w-0 group-hover:w-3/4"
                    }`}
                ></span>
              </Link>

              <Link
                href="/about-us"
                className={`relative group text-base font-normal hover:primary_text_color transition-colors ${pathName === "/about-us" ? "primary_text_color" : ""
                  }`}
                title={t("aboutUs")}
              >
                {t("aboutUs")}
                <span
                  className={`absolute left-1/2 -bottom-1  h-0.5 primary_bg_color transition-all duration-300 ease-in-out transform -translate-x-1/2 ${pathName === "/about-us" ? "w-3/4" : "w-0 group-hover:w-3/4"
                    }`}
                ></span>
              </Link>

              <Link
                href="/contact-us"
                className={`relative group text-base font-normal hover:primary_text_color transition-colors ${pathName === "/contact-us" ? "primary_text_color" : ""
                  }`}
                title={t("contactUs")}
              >
                {t("contactUs")}
                <span
                  className={`absolute left-1/2 -bottom-1  h-0.5 primary_bg_color transition-all duration-300 ease-in-out transform -translate-x-1/2 ${pathName === "/contact-us"
                    ? "w-3/4"
                    : "w-0 group-hover:w-3/4"
                    }`}
                ></span>
              </Link>
            </nav>

            {isLoggedIn ? (
              <div
                className={`hidden lg:flex items-center space-x-4 ${isRTL ? "space-x-reverse" : ""
                  }`}
              >
                {/* Cart Dialog - Single Instance */}
                {!isCheckoutPage && !isCartPage && (
                  <div className="relative">
                    <CartDialog
                      totalItems={totalItems}
                      isVisible={cartVisibleDeskTop}
                      onOpenChange={setCartVisibleDeskTop}
                    />
                  </div>
                )}
                <div className="relative">
                  <AccountDialog
                    userData={userData}
                    handleLogout={handleOpenLogoutDialog}
                    isVisible={accountVisible}
                    onOpenChange={setAccountVisible}
                  />
                </div>
              </div>
            ) : (
              <div className="hidden lg:flex items-center space-x-4">
                <button
                  className="primary_bg_color px-4 py-2 text-white rounded-lg"
                  onClick={handleOpen}
                >
                  {t("login")}
                </button>
              </div>
            )}

            {/* Hamburger / Close Icon */}
            <div className="flex items-center gap-4 md:hidden">
              {isLoggedIn && !isCheckoutPage && !isCartPage && (
                <Link href={'/cart'}>

                  <div
                    className="relative text-white primary_bg_color h-[36px] w-[36px] rounded-[8px] p-2 flex items-center justify-center cursor-pointer"
                  >
                    <FaShoppingCart
                      size={18}
                      className={`${isRTL ? "transform scale-x-[-1]" : ""}`}
                    />
                    {totalItems > 0 && (
                      <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                        {totalItems}
                      </span>
                    )}

                  </div>
                </Link>
              )}

              <button
                className="relative w-6 h-5 flex flex-col justify-between md:hidden"
                onClick={() => handleMobileNav()}
              >
                <span
                  className={`block h-[2px] w-6 bg-black dark:bg-white rounded transition-transform duration-300 ${isOpenHam ? "rotate-45 translate-y-[8px]" : ""
                    }`}
                ></span>
                <span
                  className={`block h-[2px] w-6 bg-black dark:bg-white rounded transition-opacity duration-300 ${isOpenHam ? "opacity-0" : "opacity-100"
                    }`}
                ></span>
                <span
                  className={`block h-[2px] w-6 bg-black dark:bg-white rounded transition-transform duration-300 ${isOpenHam ? "-rotate-45 -translate-y-2.5" : ""
                    }`}
                ></span>
              </button>
            </div>

            {/* Mobile Navigation Toggle */}

            <div className="hidden lg:hidden md:flex items-center space-x-4">
              {isLoggedIn && !isCheckoutPage && !isCartPage && (
                <div className={`relative ${isRTL ? "ml-2" : ""}`}>
                  <CartDialog
                    totalItems={totalItems}
                    isVisible={cartVisibleMobile}
                    onOpenChange={setCartVisibleMobile}
                  />
                </div>
              )}
              <Sheet
                open={isDrawerOpen}
                onOpenChange={setIsDrawerOpen}
                direction="right"
              >
                <SheetTrigger asChild>
                  <button
                    className="description_color dark:text-white"
                    onClick={toggleDrawer}
                  >
                    <FaBars size={24} />
                  </button>
                </SheetTrigger>
                {/* Drawer Content - Opens from Right */}
                <SheetContent className="w-[85%] sm:w-[350px] p-0">
                  <div className="flex flex-col h-full">
                    {/* Logo and Close Button */}
                    <div className="flex items-center justify-between p-4 border-b">
                      <div className="w-auto h-24">
                        <CustomImageTag
                          src={websettings?.web_logo}
                          alt="Logo"
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <SheetClose asChild>
                        <button className="description_color hover:text-gray-700">
                          <MdClose size={24} />
                        </button>
                      </SheetClose>
                    </div>

                    {/* Navigation Links */}
                    <div className="flex-1 overflow-y-auto">
                      <div className="flex flex-col">
                        <Link
                          href="/"
                          className={`p-4 border-b description_color dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center justify-between ${pathName === "/"
                            ? "light_bg_color !primary_text_color"
                            : ""
                            }`}
                          title={t("home")}
                        >
                          <span>{t("home")}</span>
                          <span className="text-gray-400">›</span>
                        </Link>

                        <Link
                          href="/services"
                          className={`p-4 border-b description_color dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center justify-between ${pathName === "/services"
                            ? "light_bg_color !primary_text_color"
                            : ""
                            }`}
                          title={t("services")}
                        >
                          <span>{t("services")}</span>
                          <span className="text-gray-400">›</span>
                        </Link>

                        <Link
                          href="/providers"
                          className={`p-4 border-b description_color dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center justify-between ${pathName === "/providers"
                            ? "light_bg_color !primary_text_color"
                            : ""
                            }`}
                          title={t("providers")}
                        >
                          <span>{t("providers")}</span>
                          <span className="text-gray-400">›</span>
                        </Link>

                        <Link
                          href="/about-us"
                          className={`p-4 border-b description_color dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center justify-between ${pathName === "/about-us"
                            ? "light_bg_color !primary_text_color"
                            : ""
                            }`}
                          title={t("aboutUs")}
                        >
                          <span>{t("aboutUs")}</span>
                          <span className="text-gray-400">›</span>
                        </Link>
                        {websettings?.show_become_provider_page && (
                        <Link
                          href="/become-provider"
                          className={`p-4 border-b description_color dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center justify-between ${pathName === "/become-provider"
                            ? "light_bg_color !primary_text_color"
                            : ""
                            }`}
                          title={t("becomeProvider")}
                        >
                          <span>{t("becomeProvider")}</span>
                            <span className="text-gray-400">›</span>
                          </Link>
                        )}

                        <Link
                          href="/contact-us"
                          className={`p-4 border-b description_color dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center justify-between ${pathName === "/contact-us"
                            ? "light_bg_color !primary_text_color"
                            : ""
                            }`}
                          title={t("contactUs")}
                        >
                          <span>{t("contactUs")}</span>
                          <span className="text-gray-400">›</span>
                        </Link>

                        {/* Account Section */}
                        <div className="flex flex-col justify-between h-full">
                          {isLoggedIn ? (
                            <div className="border-b">
                              <button
                                onClick={() => toggleDropdown("account")}
                                className="w-full p-4 description_color dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center justify-between"
                              >
                                <div className="flex items-center space-x-3">
                                  <Avatar className="w-[40px] h-[40px]">
                                    <AvatarImage
                                      src={
                                        userData?.image
                                          ? userData?.image
                                          : placeholderImage
                                      }
                                      alt={userData?.username}
                                    />
                                    <AvatarFallback>
                                      {userData?.username
                                        ?.split(" ")
                                        .map((word) => word[0]?.toUpperCase())
                                        .slice(0, 2)
                                        .join("") || "NA"}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <div className="text-base font-semibold line-clamp-1 text-left">
                                      {userData?.username}
                                    </div>
                                    <div className="text-sm font-normal description_color text-left">
                                      {userData?.email}
                                    </div>
                                  </div>
                                </div>
                                <span
                                  className={`transform transition-transform ${dropdownStates.account ? "rotate-90" : ""
                                    }`}
                                >
                                  ›
                                </span>
                              </button>
                              {dropdownStates.account && (
                                <div className="bg-gray-50 dark:bg-gray-800">
                                  <Link
                                    href="/general-bookings"
                                    className={`flex items-center gap-4 p-4 pl-8 description_color dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 ${pathName === "/general-bookings"
                                      ? "light_bg_color !primary_text_color"
                                      : ""
                                      }`}
                                  >
                                    <span
                                      className={
                                        pathName === "/general-bookings"
                                          ? "primary_text_color"
                                          : ""
                                      }
                                    >
                                      <FaRegCalendarCheck size={24} />
                                    </span>
                                    <span className="text-base">
                                      {t("bookings")}
                                    </span>
                                  </Link>

                                  <button
                                    onClick={() => router.push("/chats")}
                                    className={`w-full flex items-center gap-4 p-4 pl-8 description_color dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 ${pathName === "/chats"
                                      ? "light_bg_color !primary_text_color"
                                      : ""
                                      }`}
                                  >
                                    <span
                                      className={
                                        pathName === "/chats"
                                          ? "primary_text_color"
                                          : ""
                                      }
                                    >
                                      <IoChatboxEllipsesOutline size={24} />
                                    </span>
                                    <span className="text-base">
                                      {t("chats")}
                                    </span>
                                  </button>

                                  <Link
                                    href="/notifications"
                                    className={`flex items-center gap-4 p-4 pl-8 description_color dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 ${pathName === "/notifications"
                                      ? "light_bg_color !primary_text_color"
                                      : ""
                                      }`}
                                  >
                                    <span
                                      className={
                                        pathName === "/notifications"
                                          ? "primary_text_color"
                                          : ""
                                      }
                                    >
                                      <MdNotificationsNone size={24} />
                                    </span>
                                    <span className="text-base">
                                      {t("notifications")}
                                    </span>
                                  </Link>

                                  <Link
                                    href="/bookmarks"
                                    className={`flex items-center gap-4 p-4 pl-8 description_color dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 ${pathName === "/bookmarks"
                                      ? "light_bg_color !primary_text_color"
                                      : ""
                                      }`}
                                  >
                                    <span
                                      className={
                                        pathName === "/bookmarks"
                                          ? "primary_text_color"
                                          : ""
                                      }
                                    >
                                      <CiBookmarkCheck size={24} />
                                    </span>
                                    <span className="text-base">
                                      {t("bookmarks")}
                                    </span>
                                  </Link>

                                  <Link
                                    href="/addresses"
                                    className={`flex items-center gap-4 p-4 pl-8 description_color dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 ${pathName === "/addresses"
                                      ? "light_bg_color !primary_text_color"
                                      : ""
                                      }`}
                                  >
                                    <span
                                      className={
                                        pathName === "/addresses"
                                          ? "primary_text_color"
                                          : ""
                                      }
                                    >
                                      <IoLocationOutline size={24} />
                                    </span>
                                    <span className="text-base">
                                      {t("addresses")}
                                    </span>
                                  </Link>

                                  <Link
                                    href="/payment-history"
                                    className={`flex items-center gap-4 p-4 pl-8 description_color dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 ${pathName === "/payment-history"
                                      ? "light_bg_color !primary_text_color"
                                      : ""
                                      }`}
                                  >
                                    <span
                                      className={
                                        pathName === "/payment-history"
                                          ? "primary_text_color"
                                          : ""
                                      }
                                    >
                                      <IoCardOutline size={24} />
                                    </span>
                                    <span className="text-base">
                                      {t("paymentHistory")}
                                    </span>
                                  </Link>

                                  <button
                                    onClick={handleOpenLogoutDialog}
                                    className="w-full flex items-center gap-4 p-4 pl-8 description_color dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                  >
                                    <span className="primary_text_color">
                                      <IoExitOutline size={24} />
                                    </span>
                                    <span className="text-base">
                                      {t("logout")}
                                    </span>
                                  </button>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="p-4 border-b">
                              <button
                                className="w-full primary_bg_color px-4 py-2 text-white rounded-lg"
                                onClick={handleOpen}
                              >
                                {t("login")}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>

          </div>

          <div className="flex flex-col gap-6 w-full text-sm pt-4 md:hidden text-black dark:text-white">
            <Link href={'/about-us'} title={t("aboutUs")}>
              {t("aboutUs")}
            </Link>
            <Link href={'/contact-us'} title={t("contactUs")}>
              {t("contactUs")}
            </Link>
            {websettings?.show_become_provider_page && (
            <Link href={'/become-provider'} title={t("becomeProvider")}>
              {t("becomeProvider")}
            </Link>
            )}
            <div>
              <Select
                open={isOpen}
                onOpenChange={setIsOpen}
                value={selectedLanguage}
                onValueChange={handleLanguageChange}
              >
                <SelectTrigger
                  className="p-0 flex items-center justify-between bg-transparent w-full [&>svg]:hidden border-none focus:outline-none focus:!ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 h-auto focus:ring-offset-0"
                  onClick={() => setIsOpen(true)}
                >
                  <SelectValue>{getCurrentLanguageDisplay()}</SelectValue>
                  <FaChevronRight className="text-gray-400 !block rtl:rotate-180" />
                </SelectTrigger>
                <SelectContent
                  className="z-[9999]"
                  onPointerDownOutside={() => setIsOpen(false)}
                >
                  {config.supportedLanguages.map((lang) => (
                    <SelectItem
                      key={lang.langCode}
                      value={lang.langCode}
                      className="cursor-pointer hover:bg-gray-100 hover:text-gray-900"
                    >
                      {lang.language}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <span>{t("darkMode")}</span>
              <div className="flex items-center space-x-2 rtl:space-x-reverse ">

                <button
                  onClick={toggleTheme}
                  className="w-9 h-4 bg-[#00000036] dark:bg-white rounded-full p-1 flex items-center justify-between cursor-pointer relative"
                >
                  <div
                    className={`w-3 h-3 bg-white dark:primary_bg_color rounded-full shadow-md transform transition-transform absolute ${theme === "dark"
                      ? "rtl:-translate-x-6 ltr:translate-x-4"
                      : "translate-x-0"
                      }`}
                  ></div>
                </button>
              </div>
            </div>

          </div>


        </div>
      </div>
      {isLoginModalOpen && (
        <LoginModal
          open={isLoginModalOpen}
          close={() => setLoginModalIsOpen(false)}
          setOpenProfileModal={setOpenProfileModal}
        />
      )}
      {openProfileModal && (
        <EditProfileModal
          open={openProfileModal}
          close={() => setOpenProfileModal(false)}
          isEditProfile={false}
          
        />
      )}

      {openLogoutDialog && (
        <LogoutDialog
          isOpen={openLogoutDialog}
          onClose={() => setOpenLogoutDialog(false)}
          onLogout={handleLogout}
        />
      )}
    </header>
  );
};

export default Header;


