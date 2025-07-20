"use client";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import PWAInstallButton from '../ReUseableComponents/PWAInstallButton';
import CookieConsent from "../ReUseableComponents/CookieConsent";

const Footer = dynamic(() => import("./Footer"), { ssr: false });
const Header = dynamic(() => import("./Header"), { ssr: false });
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/router";
import { get_settings } from "@/api/apiRoutes";
import { setSettings } from "@/redux/reducers/settingSlice";
import { publicRoutes } from "@/utils/Helper";
import { setIsBrowserSupported } from "@/redux/reducers/locationSlice";
import Loader from "../ReUseableComponents/Loader";
import SomethingWentWrong from "../ReUseableComponents/Error/SomethingWentWrong";
import MaintenanceMode from "../ReUseableComponents/Error/MaintanceMode";
import BottomNavigation from "./BottomNavigation";
import { usePathname } from "next/navigation";

const Layout = ({ children }) => {
  const locationData = useSelector((state) => state?.location);
  const settingsData = useSelector((state) => state?.settingsData?.settings);
  
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch();
  const [settingsError, setSettingsError] = useState(false);
  const [webMaintananceMode, setWebMaintananceMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [cookieConsentEnabled, setCookieConsentEnabled] = useState(false);
  const [cookieTitle, setCookieTitle] = useState("");
  const [cookieDescription, setCookieDescription] = useState("");

  const isHomePage = pathname === "/";
  const isProviderPage = pathname === "/providers";
  const isServicePage = pathname === "/services";
  const isProfilePage = pathname === "/profile";
  const isBecomeProviderPage = pathname === "/become-provider";

  const isMobile = window.innerWidth <= 768;
  const isTabletOrDesktop = window.innerWidth > 768;

  const ShowBottomNavigation = () => {
    if (isHomePage || isProviderPage || isServicePage || isProfilePage) {
      return true;
    }
    return false;
  }

  useEffect(() => {
    if ("Notification" in window) {
      if (Notification.permission !== "granted") {
        Notification.requestPermission();
      }
    } else {
      console.log("This browser does not support desktop notifications.");
    }

    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    if (isSafari) {
      dispatch(setIsBrowserSupported(false));
      return;
    }
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        () => {
          dispatch(setIsBrowserSupported(true));
        },
        (error) => {
          console.error("Geolocation error:", error);
          dispatch(setIsBrowserSupported(true));
        }
      );
    } else {
      console.log("Geolocation not supported");
      dispatch(setIsBrowserSupported(true));
    }
  }, [dispatch]);

  useEffect(() => {
    const currentRoute = router.pathname;
    const isPublicRoute = publicRoutes.includes(currentRoute);
    if (
      !locationData.lat &&
      !locationData.lng &&
      !locationData.locationAddress &&
      !isPublicRoute
    ) {
      router.push("/home");
    }
  }, [locationData]);

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const response = await get_settings();

      if (!response || response.error === true || !response.data) {
        setSettingsError(true);
      } else {
        dispatch(setSettings(response.data));
        setWebMaintananceMode(response.data?.web_settings?.customer_web_maintenance_mode === 1);
        
        // Check cookie consent status from settings
        if (response.data?.web_settings?.cookie_consent_status === 1) {
          setCookieConsentEnabled(true);
          setCookieTitle(response.data?.web_settings?.cookie_consent_title || "");
          setCookieDescription(response.data?.web_settings?.cookie_consent_description || "");
        }
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
      setSettingsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Show loader on route change start
    const handleStart = () => setLoading(true);
    // Hide loader when route change is complete or fails
    const handleComplete = () => setLoading(false);

    router.events.on("routeChangeStart", handleStart);
    router.events.on("routeChangeComplete", handleComplete);
    router.events.on("routeChangeError", handleComplete);

    // Cleanup event listeners
    return () => {
      router.events.off("routeChangeStart", handleStart);
      router.events.off("routeChangeComplete", handleComplete);
      router.events.off("routeChangeError", handleComplete);
    };
  }, [router]);

  // Function to determine if footer should be shown
  const shouldShowFooter = () => {
    // Always show footer on tablet and desktop
    if (isTabletOrDesktop) return true;

    // On mobile, only show footer on home page
    return isMobile && isHomePage && isBecomeProviderPage;
  };

  if (isLoading) {
    return <Loader />;
  }

  if (settingsError) {
    return <SomethingWentWrong />;
  }

  if (webMaintananceMode) {
    return <MaintenanceMode />;
  }

  return (
    <>
      {loading ? (
        <Loader />
      ) : (
        <>
          <Header />
          {children}
          {shouldShowFooter() && <Footer />}
          {ShowBottomNavigation() && (
            <>
              <div className="my-20 block md:hidden"></div>
              <BottomNavigation />
            </>
          )}
          {process.env.NEXT_PUBLIC_PWA_ENABLED === 'true' && (
            <PWAInstallButton />
          )}
          
          {/* Cookie Consent Banner */}
          {cookieConsentEnabled && (
            <CookieConsent 
              title={cookieTitle} 
              description={cookieDescription} 
            />
          )}
        </>
      )}
    </>
  );
};

export default Layout;
