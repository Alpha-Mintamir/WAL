"use client";
import { download_invoices, getPlacesDetailsForWebApi } from "@/api/apiRoutes";
import { selectTheme } from "@/redux/reducers/themeSlice";
import { getUserToken } from "@/redux/reducers/userDataSlice";
import { store } from "@/redux/store";
import { useJsApiLoader } from "@react-google-maps/api";
import { useSelector } from "react-redux";
import stripe from "../assets/stripe.png";
import paypal from "../assets/paypal.png";
import paystack from "../assets/paystack.png";
import flutterwave from "../assets/flutterwave.png";
import razorpay from "../assets/razorpay.png";
import cod from "../assets/cod.png";
import { FaCheckCircle, FaHourglassHalf, FaTimesCircle } from "react-icons/fa";
import {
  setLanguage as setReduxLanguage,
  setTranslations,
} from "@/redux/reducers/translationSlice";

import toast from "react-hot-toast";
import { useTranslation } from "@/components/Layout/TranslationContext";

export const useIsDarkMode = () => {
  const reduxTheme = useSelector(selectTheme);
  return reduxTheme?.theme === "dark";
};

// Function to format the date in ddmmyyyy format
export const formatDate = (date) => {
  const day = String(date.getDate()).padStart(2, "0"); // Ensure two digits
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-indexed
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
};

export const formatTime = (date) => {
  if (!(date instanceof Date)) {
    console.error("Invalid date passed to formatTime:", date);
    return "---"; // Return a fallback value
  }

  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12; // Convert 24-hour time to 12-hour time

  return `${hours}:${minutes} ${ampm}`;
};

export const useGoogleMapsLoader = () => {
  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-map-script", // Ensure this ID is consistent
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAP_PLACE_API_KEY,
    libraries: ["geometry", "drawing", "places"],
    language: "en",
    region: "US",
  });

  return { isLoaded, loadError };
};

export const miniDevider = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="2"
    height="14"
    viewBox="0 0 2 14"
    fill="none"
  >
    <path d="M1 0L0.999999 14" stroke="#7E7E7E" strokeWidth="0.5" />
  </svg>
);

export async function getFormattedAddress(lat, lng) {
  try {
    const response = await getPlacesDetailsForWebApi({
      latitude: lat,
      longitude: lng,
    });
    const data = await response?.data?.data;
    const formattedAddress =
      data?.results.find((result) => result.formatted_address)
        ?.formatted_address || "Address not found";
    return formattedAddress;
  } catch (error) {
    console.error("Error fetching address:", error);
    return null;
  }
}

export const publicRoutes = [
  "/about-us",
  "/contact-us",
  "/terms-and-conditions",
  "/privacy-policy",
  "/faqs",
];

export const placeholderImage = (e) => {
  let settings = store.getState().settingsData?.settings?.web_settings;
  const placeholderLogo = settings?.web_half_logo;
  if (placeholderLogo) {
    e.target.src = placeholderLogo;
    e.target.classList.add("opacity-30", "w-full", "object-contain"); // Add Tailwind classes
  }
};

export const isLogin = () => {
  const state = store.getState(); // Access the Redux state
  const token = getUserToken(state); // Get the token from the state
  return !!token; // Return true if token exists, otherwise false
};

export const convertToSlug = (text) => {
  if (typeof text !== "string") {
    console.error("Input is not a string:", text);
    return "";
  }
  return text
    .toLowerCase() // Convert to lowercase
    .trim() // Remove leading/trailing whitespace
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/[^\w\-]+/g, "") // Remove non-word characters (optional)
    .replace(/\-\-+/g, "-") // Replace multiple hyphens with a single hyphen
    .replace(/^-+/, "") // Remove hyphen from the start of the string
    .replace(/-+$/, ""); // Remove hyphen from the end of the string
};

export const statusColors = {
  awaiting: "#f59e0b", // Yellow
  started: "#3b82f6", // Blue
  confirmed: "#10b981", // Green
  booking_ended: "#6b7280", // Gray
  cancelled: "#ef4444", // Red
  rescheduled: "#f97316", // Orange
  completed: "#0b9000", // Dark Green
};

export const statusNames = {
  awaiting: "awaiting",
  started: "started",
  confirmed: "confirmed",
  booking_ended: "booking ended",
  cancelled: "cancelled",
  rescheduled: "rescheduled",
  completed: "completed",
};

export const customJobStatusNames = {
  pending: "requested",
  booked: "booked",
  cancelled: "cancelled",
};

export const customJobStatusColors = {
  pending: "#f59e0b", // Yellow
  cancelled: "#ef4444", // Red
  booked: "#0b9000", // Dark Green
};

export const paymentModes = [
  {
    icon: stripe?.src,
    method: "stripe",
  },
  {
    icon: paypal?.src,
    method: "paypal",
  },
  {
    icon: razorpay?.src,
    method: "razorpay",
  },
  {
    icon: paystack?.src,
    method: "paystack",
  },
  {
    icon: flutterwave?.src,
    method: "flutterwave",
  },
  {
    icon: cod?.src, // assuming COD is an icon for cash on delivery
    method: "cod",
  },
];

export const getPaymentStatusUI = (status) => {
  // If the status is an empty string, treat it as "pending"
  const actualStatus = status === "" ? "pending" : status;

  switch (actualStatus) {
    case "success":
      return {
        bgClass: "bg-green-100 text-green-600",
        iconClass: "bg-green-600",
        icon: <FaCheckCircle size={20} />, // React Icon for success
        iconText: "success",
      };
    case "pending":
      return {
        bgClass: "bg-yellow-100 text-yellow-600",
        iconClass: "bg-yellow-600",
        icon: <FaHourglassHalf size={20} />, // React Icon for pending
        iconText: "pending",
      };
    case "failed":
      return {
        bgClass: "bg-red-100 text-red-600",
        iconClass: "bg-red-600",
        icon: <FaTimesCircle size={20} />, // React Icon for cancelled
        iconText: "failed",
      };
    default:
      return null;
  }
};

export const getPaymentStatusAdditionalChargeUI = (status) => {
  switch (status) {
    case "1":
      return {
        bgClass: "bg-green-100 text-green-600",
        iconClass: "bg-green-600",
        icon: <FaCheckCircle size={20} />, // React Icon for success
        iconText: "success",
      };
    case "0":
      return {
        bgClass: "bg-yellow-100 text-yellow-600",
        iconClass: "bg-yellow-600",
        icon: <FaHourglassHalf size={20} />, // React Icon for pending
        iconText: "pending",
      };
    case "2":
      return {
        bgClass: "bg-red-100 text-red-600",
        iconClass: "bg-red-600",
        icon: <FaTimesCircle size={20} />, // React Icon for cancelled
        iconText: "failed",
      };
    default:
      return null;
  }
};

// Get payment status style classes
export const getStatusStyle = (status) => {
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

export async function DownloadInvoice(id, setDownloading) {
  setDownloading(true);

  await download_invoices({ order_id: id }).then(async (result) => {
    // Convert the API response to a Blob object
    const blob = new Blob([result], { type: "application/pdf" });
    // Create a new anchor element and set its href attribute to the Blob object
    const downloadLink = document.createElement("a");
    downloadLink.href = URL.createObjectURL(blob);
    downloadLink.download = `${process.env.NEXT_PUBLIC_APP_NAME}-invoice-${id}.pdf`;

    // Append the anchor element to the DOM and click it to initiate the download
    document.body.appendChild(downloadLink);
    downloadLink.click();

    // Remove the anchor element from the DOM
    document.body.removeChild(downloadLink);

    // Set your state, if needed (e.g., setDownloading(false))
    setDownloading(false);
  });
}
export const showDistance = (distance) => {
  let settings = store.getState().settingsData?.settings?.general_settings;
  const distanceUnit = settings?.distance_unit; // Ensure it's a valid ISO currency code
  if (!distance || distance === "null") return distance; // Handle empty or "null" cases
  return `${parseAndCeil(distance)} ${distanceUnit}`;
};

export const showPrice = (price) => {
  if (!price || price === "null") return price; // Handle empty or "null" cases

  let settings = store.getState().settingsData?.settings?.app_settings;
  const currencyCode = settings?.country_currency_code || "USD"; // Fallback to USD if invalid
  const currencySymbol = settings?.currency || "$"; // Fallback symbol
  const decimalPoints = settings?.decimal_points;

  // Ensure decimalPoints is a valid number
  let decimalDigits = parseInt(decimalPoints, 10);
  if (isNaN(decimalDigits) || decimalDigits < 0 || decimalDigits > 20) {
    decimalDigits = 2; // Default to 2 decimal places if invalid
  }

  // Convert price to number after removing commas
  const numericPrice = parseFloat(price.toString().replace(/,/g, ""));
  if (isNaN(numericPrice)) return `${currencySymbol}0.00`; // Handle invalid price

  try {
    // Validate currency code against a known list (optional)
    if (!/^[A-Z]{3}$/.test(currencyCode)) {
      throw new Error("Invalid currency code format");
    }

    // Format using Intl.NumberFormat
    return new Intl.NumberFormat(navigator.language, {
      style: "currency",
      currency: currencyCode, // Ensures correct formatting
      currencyDisplay: "narrowSymbol",
      minimumFractionDigits: decimalDigits,
      maximumFractionDigits: decimalDigits,
    }).format(numericPrice);
  } catch (error) {
    console.error("Invalid currency code or format:", currencyCode, error);
    return `${currencySymbol}${numericPrice.toFixed(decimalDigits)}`; // Fallback formatting
  }
};

//  Cache for translations
const translationCache = {};

// Async action creator using Redux Thunk
export const setLanguage = (langObject) => async (dispatch) => {
  const { langCode } = langObject;

  try {
    // Dynamically import the JSON file
    const translationModule = await import(
      `@/utils/Languages/${langCode}.json`
    );
    // Extract translations from the default property if it exists
    const translations = translationModule.default || translationModule;
    translationCache[langCode] = translations;

    // Dispatch actions to update Redux store
    dispatch(setReduxLanguage(langObject));
    dispatch(setTranslations(translations));
  } catch (error) {
    console.error(
      `Failed to load translations for language: ${langCode}`,
      error
    );
    // Fallback to default language from config
    const fallbackLanguage = config.defaultLanguage;
    if (langCode !== fallbackLanguage.langCode) {
      console.warn(
        `Falling back to default language: ${fallbackLanguage.langCode}`
      );
      dispatch(setLanguage(fallbackLanguage));
    }
  }
};

//  LOAD STRIPE API KEY
export const loadStripeApiKey = () => {
  const settingsData =
    store.getState().settingsData.settings?.payment_gateways_settings;
  const stripeKey = settingsData.stripe_publishable_key;
  const clientSecret = settingsData.stripe_secret_key;
  if (stripeKey) {
    ``;
    return stripeKey;
  }
  return false;
};

export const useRTL = () => {
  const currentLanguage = useSelector(
    (state) => state.translation.currentLanguage
  );
  return currentLanguage?.isRtl;
};

// Error handling function
export const handleFirebaseAuthError = (t, errorCode) => {
  const ERROR_CODES = {
    "auth/user-not-found": t("userNotFound"),
    "auth/wrong-password": t("invalidPassword"),
    "auth/email-already-in-use": t("emailInUse"),
    "auth/invalid-email": t("invalidEmail"),
    "auth/user-disabled": t("userAccountDisabled"),
    "auth/too-many-requests": t("tooManyRequests"),
    "auth/operation-not-allowed": t("operationNotAllowed"),
    "auth/internal-error": t("internalError"),
    "auth/invalid-login-credentials": t("incorrectDetails"),
    "auth/invalid-credential": t("incorrectDetails"),
    "auth/admin-restricted-operation": t("adminOnlyOperation"),
    "auth/already-initialized": t("alreadyInitialized"),
    "auth/app-not-authorized": t("appNotAuthorized"),
    "auth/app-not-installed": t("appNotInstalled"),
    "auth/argument-error": t("argumentError"),
    "auth/captcha-check-failed": t("captchaCheckFailed"),
    "auth/code-expired": t("codeExpired"),
    "auth/cordova-not-ready": t("cordovaNotReady"),
    "auth/cors-unsupported": t("corsUnsupported"),
    "auth/credential-already-in-use": t("credentialAlreadyInUse"),
    "auth/custom-token-mismatch": t("customTokenMismatch"),
    "auth/requires-recent-login": t("requiresRecentLogin"),
    "auth/dependent-sdk-initialized-before-auth": t(
      "dependentSdkInitializedBeforeAuth"
    ),
    "auth/dynamic-link-not-activated": t("dynamicLinkNotActivated"),
    "auth/email-change-needs-verification": t("emailChangeNeedsVerification"),
    "auth/emulator-config-failed": t("emulatorConfigFailed"),
    "auth/expired-action-code": t("expiredActionCode"),
    "auth/cancelled-popup-request": t("cancelledPopupRequest"),
    "auth/invalid-api-key": t("invalidApiKey"),
    "auth/invalid-app-credential": t("invalidAppCredential"),
    "auth/invalid-app-id": t("invalidAppId"),
    "auth/invalid-user-token": t("invalidUserToken"),
    "auth/invalid-auth-event": t("invalidAuthEvent"),
    "auth/invalid-cert-hash": t("invalidCertHash"),
    "auth/invalid-verification-code": t("invalidVerificationCode"),
    "auth/invalid-continue-uri": t("invalidContinueUri"),
    "auth/invalid-cordova-configuration": t("invalidCordovaConfiguration"),
    "auth/invalid-custom-token": t("invalidCustomToken"),
    "auth/invalid-dynamic-link-domain": t("invalidDynamicLinkDomain"),
    "auth/invalid-emulator-scheme": t("invalidEmulatorScheme"),
    "auth/invalid-message-payload": t("invalidMessagePayload"),
    "auth/invalid-multi-factor-session": t("invalidMultiFactorSession"),
    "auth/invalid-oauth-client-id": t("invalidOauthClientId"),
    "auth/invalid-oauth-provider": t("invalidOauthProvider"),
    "auth/invalid-action-code": t("invalidActionCode"),
    "auth/unauthorized-domain": t("unauthorizedDomain"),
    "auth/invalid-persistence-type": t("invalidPersistenceType"),
    "auth/invalid-phone-number": t("invalidPhoneNumber"),
    "auth/invalid-provider-id": t("invalidProviderId"),
    "auth/invalid-recaptcha-action": t("invalidRecaptchaAction"),
    "auth/invalid-recaptcha-token": t("invalidRecaptchaToken"),
    "auth/invalid-recaptcha-version": t("invalidRecaptchaVersion"),
    "auth/invalid-recipient-email": t("invalidRecipientEmail"),
    "auth/invalid-req-type": t("invalidReqType"),
    "auth/invalid-sender": t("invalidSender"),
    "auth/invalid-verification-id": t("invalidVerificationId"),
    "auth/invalid-tenant-id": t("invalidTenantId"),
    "auth/multi-factor-info-not-found": t("multiFactorInfoNotFound"),
    "auth/multi-factor-auth-required": t("multiFactorAuthRequired"),
    "auth/missing-android-pkg-name": t("missingAndroidPkgName"),
    "auth/missing-app-credential": t("missingAppCredential"),
    "auth/auth-domain-config-required": t("authDomainConfigRequired"),
    "auth/missing-client-type": t("missingClientType"),
    "auth/missing-verification-code": t("missingVerificationCode"),
    "auth/missing-continue-uri": t("missingContinueUri"),
    "auth/missing-iframe-start": t("missingIframeStart"),
    "auth/missing-ios-bundle-id": t("missingIosBundleId"),
    "auth/missing-multi-factor-info": t("missingMultiFactorInfo"),
    "auth/missing-multi-factor-session": t("missingMultiFactorSession"),
    "auth/missing-or-invalid-nonce": t("missingOrInvalidNonce"),
    "auth/missing-phone-number": t("missingPhoneNumber"),
    "auth/missing-recaptcha-token": t("missingRecaptchaToken"),
    "auth/missing-recaptcha-version": t("missingRecaptchaVersion"),
    "auth/missing-verification-id": t("missingVerificationId"),
    "auth/app-deleted": t("appDeleted"),
    "auth/account-exists-with-different-credential": t(
      "accountExistsWithDifferentCredential"
    ),
    "auth/network-request-failed": t("networkRequestFailed"),
    "auth/no-auth-event": t("noAuthEvent"),
    "auth/no-such-provider": t("noSuchProvider"),
    "auth/null-user": t("nullUser"),
    "auth/operation-not-supported-in-this-environment": t(
      "operationNotSupportedInThisEnvironment"
    ),
    "auth/popup-blocked": t("popupBlocked"),
    "auth/popup-closed-by-user": t("popupClosedByUser"),
    "auth/provider-already-linked": t("providerAlreadyLinked"),
    "auth/quota-exceeded": t("quotaExceeded"),
    "auth/recaptcha-not-enabled": t("recaptchaNotEnabled"),
    "auth/redirect-cancelled-by-user": t("redirectCancelledByUser"),
    "auth/redirect-operation-pending": t("redirectOperationPending"),
    "auth/rejected-credential": t("rejectedCredential"),
    "auth/second-factor-already-in-use": t("secondFactorAlreadyInUse"),
    "auth/maximum-second-factor-count-exceeded": t(
      "maximumSecondFactorCountExceeded"
    ),
    "auth/tenant-id-mismatch": t("tenantIdMismatch"),
    "auth/timeout": t("timeout"),
    "auth/user-token-expired": t("userTokenExpired"),
    "auth/unauthorized-continue-uri": t("unauthorizedContinueUri"),
    "auth/unsupported-first-factor": t("unsupportedFirstFactor"),
    "auth/unsupported-persistence-type": t("unsupportedPersistenceType"),
    "auth/unsupported-tenant-operation": t("unsupportedTenantOperation"),
    "auth/unverified-email": t("unverifiedEmail"),
    "auth/user-cancelled": t("userCancelled"),
    "auth/user-mismatch": t("userMismatch"),
    "auth/user-signed-out": t("userSignedOut"),
    "auth/weak-password": t("weakPassword"),
    "auth/web-storage-unsupported": t("webStorageUnsupported"),
  };

  // Check if the error code exists in the global ERROR_CODES object
  if (ERROR_CODES.hasOwnProperty(errorCode)) {
    // If the error code exists, log the corresponding error message
    toast.error(ERROR_CODES[errorCode]);
  } else {
    // If the error code is not found, log a generic error message
    toast.error(`${t("errorOccurred")}:${errorCode}`);
  }
  // Optionally, you can add additional logic here to handle the error
  // For example, display an error message to the user, redirect to an error page, etc.
};

// is demo mode
export const isDemoMode = () => {
  const systemSettings =
    store.getState().settingsData.settings?.general_settings;
  const isDemo = systemSettings?.demo_mode === "1";
  return isDemo;
};

export const parseAndCeil = (distance) => {
  return Math.ceil(parseFloat(distance));
};

export const darkThemeStyles = [
  {
    elementType: "geometry",
    stylers: [{ color: "#212121" }],
  },
  {
    elementType: "labels.icon",
    stylers: [{ visibility: "off" }],
  },
  {
    elementType: "labels.text.fill",
    stylers: [{ color: "#757575" }],
  },
  {
    elementType: "labels.text.stroke",
    stylers: [{ color: "#212121" }],
  },
  {
    featureType: "administrative",
    elementType: "geometry",
    stylers: [{ color: "#757575" }],
  },
  {
    featureType: "administrative.country",
    elementType: "labels.text.fill",
    stylers: [{ color: "#9e9e9e" }],
  },
  {
    featureType: "administrative.land_parcel",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [{ color: "#bdbdbd" }],
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [{ color: "#757575" }],
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#181818" }],
  },
  {
    featureType: "poi.park",
    elementType: "labels.text.fill",
    stylers: [{ color: "#616161" }],
  },
  {
    featureType: "poi.park",
    elementType: "labels.text.stroke",
    stylers: [{ color: "#1b1b1b" }],
  },
  {
    featureType: "road",
    elementType: "geometry.fill",
    stylers: [{ color: "#2c2c2c" }],
  },
  {
    featureType: "road",
    elementType: "labels.text.fill",
    stylers: [{ color: "#8a8a8a" }],
  },
  {
    featureType: "road.arterial",
    elementType: "geometry",
    stylers: [{ color: "#373737" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#3c3c3c" }],
  },
  {
    featureType: "road.highway.controlled_access",
    elementType: "geometry",
    stylers: [{ color: "#4e4e4e" }],
  },
  {
    featureType: "road.local",
    elementType: "labels.text.fill",
    stylers: [{ color: "#616161" }],
  },
  {
    featureType: "transit",
    elementType: "labels.text.fill",
    stylers: [{ color: "#757575" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#000000" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#3d3d3d" }],
  },
];


export const isMobile = () => {
  return window.innerWidth <= 768;
};

