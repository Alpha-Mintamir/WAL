import React, { useState, useEffect, useCallback, useRef } from "react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import CustomImageTag from "../ReUseableComponents/CustomImageTag";
import {
  handleFirebaseAuthError,
  isDemoMode,
  useRTL,
} from "@/utils/Helper";
import { MdClose } from "react-icons/md";
import { FcGoogle } from "react-icons/fc";
import {
  getAuth,
  signInWithPhoneNumber,
  RecaptchaVerifier,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence
} from "firebase/auth";
import FirebaseData from "@/utils/Firebase";
import toast from "react-hot-toast";
import {
  registerUserApi,
  resendOTPApi,
  verifyOTPApi,
  verifyUserApi,
} from "@/api/apiRoutes";
import { useDispatch, useSelector } from "react-redux";
import {
  setToken,
  setUserAuthData,
  setUserData,
} from "@/redux/reducers/userDataSlice";
import MiniLoader from "../ReUseableComponents/MiniLoader";
import { isValidPhoneNumber } from "libphonenumber-js";
import { useTranslation } from "../Layout/TranslationContext";
import Link from "next/link";
import OTPInput from "react-otp-input";

const LoginModal = ({ open, close, setOpenProfileModal }) => {
  const t = useTranslation();
  const isDemo = isDemoMode();
  const isRtl = useRTL();

  const demoMobileNumber = "919876543210";
  const demoOtp = "123456";

  const { authentication } = FirebaseData(); // Destructure Firebase authentication
  const dispatch = useDispatch();

  const [phone, setPhone] = useState(""); // Phone number state
  const [countryCode, setCountryCode] = useState(""); // Phone number state
  const [apiCountryCode, setApiCountryCode] = useState(""); // Store API country code
  const [showFullPhoneNumber, setShowFullPhoneNumber] = useState(""); //show full number with dialcode
  const [showOtpScreen, setShowOtpScreen] = useState(false); // Toggle between phone and OTP screens
  const [otp, setOtp] = useState(""); // OTP input state as string for react-otp-input
  const [timer, setTimer] = useState(30); // Timer in seconds
  const [resendAvailable, setResendAvailable] = useState(false); // To track if resend is available
  const [loading, setLoading] = useState(false);
  const [smsMethod, setSmsMethod] = useState("");
  const [messageCode, setMessageCode] = useState(null); // Add this state to store message code
  const [isProcessingRedirect, setIsProcessingRedirect] = useState(false);
  const [hasCheckedRedirect, setHasCheckedRedirect] = useState(false);
  const [forcePopup, setForcePopup] = useState(false);
  const [popupFailedCount, setPopupFailedCount] = useState(0);
  const [isGoogleAuthInProgress, setIsGoogleAuthInProgress] = useState(false);

  const settingsData = useSelector((state) => state?.settingsData);
  const fcmToken = settingsData?.fcmToken;
  const generalSettings = settingsData?.settings?.general_settings;

  const websettings = settingsData?.settings?.web_settings;

  // Get country code from API response
  useEffect(() => {
    const getCountryCode = async () => {
      try {
        // Check if we have a valid country code from API
        if (generalSettings?.default_country_code) {
          setApiCountryCode(generalSettings.default_country_code.toLowerCase());
        }
      } catch (error) {
        console.error("Error fetching country code:", error);
      }
    };
    getCountryCode();
  }, [generalSettings]);

  // Use API country code or fallback to env variable
  const effectiveCountryCode = apiCountryCode || (process?.env?.NEXT_PUBLIC_DEFAULT_COUNTRY_CODE);

  useEffect(() => {
    if (isDemo) {
      setPhone(demoMobileNumber);
      setShowFullPhoneNumber(demoMobileNumber);
      if (phone === demoMobileNumber) {
        setOtp(demoOtp);
      }
    }
  }, [isDemo]);
  // Function to clear recaptchaVerifier
  const clearRecaptcha = useCallback(() => {
    try {
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }
      const recaptchaContainer = document.getElementById("recaptcha-container");
      if (recaptchaContainer) {
        while (recaptchaContainer.firstChild) {
          recaptchaContainer.removeChild(recaptchaContainer.firstChild);
        }
      }
    } catch (error) {
      console.error("Error clearing recaptcha:", error);
    }
  }, []);

  const handleClose = () => {
    clearRecaptcha();
    setPhone("");
    setCountryCode("");
    setShowFullPhoneNumber("");
    setShowOtpScreen(false);
    setOtp("");
    setMessageCode(null); // Reset messageCode
    setSmsMethod(""); // Reset smsMethod
    close();
  };
  const generateRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      const recaptchaContainer = document.getElementById("recaptcha-container");
      if (!recaptchaContainer) {
        console.error("Container element 'recaptcha-container' not found.");
        return null;
      }
      try {
        recaptchaContainer.innerHTML = "";
        window.recaptchaVerifier = new RecaptchaVerifier(
          authentication,
          "recaptcha-container",
          {
            size: "invisible",
          }
        );
        return window.recaptchaVerifier;
      } catch (error) {
        console.error("Error initializing RecaptchaVerifier:", error.message);
        return null;
      }
    }
    return window.recaptchaVerifier;
  };

  const handleInputChange = (value, data) => {
    const formattedDialCode = `${data?.dialCode}`;

    // Update the state only if the value is valid and changes
    setPhone(value);
    setCountryCode(formattedDialCode);
  };

  const FormatPhoneNumber = () => {
    const phoneNumberWithoutDialCode = phone.startsWith(countryCode)
      ? phone.slice(countryCode.length)
      : phone;
    return phoneNumberWithoutDialCode;
  };
  const handleContinue = async () => {
    if (!phone) {
      toast.error(t("enterPhoneNumber"));
      return;
    }
    const phoneNumberWithoutDialCode = FormatPhoneNumber();
    const fullPhoneNumber = `+${countryCode}${phoneNumberWithoutDialCode}`;

    if (!isValidPhoneNumber(fullPhoneNumber)) {
      return toast.error(t("enterValidNumber"));
    }

    try {
      setLoading(true);
      const response = await verifyUserApi({
        phone: phoneNumberWithoutDialCode,
        country_code: "+" + countryCode,
      });

      if (response?.error === false) {
        // Store message code for later use
        setMessageCode(response.message_code);

        // If phone number is valid, proceed based on authentication mode
        if (response?.authentication_mode === "firebase") {
          await generateRecaptcha();
          sendOtp(phoneNumberWithoutDialCode);
          setSmsMethod("firebase");
        } else {
          setShowOtpScreen(true);
          toast.success(t("otpSent"));
          setSmsMethod("sms_gateway");
        }
        setShowFullPhoneNumber(fullPhoneNumber);
      } else {
        toast.error(response?.message);
        setLoading(false);
      }
    } catch (error) {
      console.error("error", error);
      toast.error(t("somethingWentWrong"));
      setLoading(false);
    }
  };

  // Timer logic to count down every second
  useEffect(() => {
    if (showOtpScreen) {
      if (timer > 0 && !resendAvailable) {
        const interval = setInterval(() => {
          setTimer((prev) => prev - 1);
        }, 1000);

        return () => clearInterval(interval);
      } else if (timer === 0) {
        setResendAvailable(true);
      }
    }
  }, [timer, resendAvailable, showOtpScreen]);

  // Handle Resend OTP button
  const handleResendOtp = async () => {
    setResendAvailable(false);
    setTimer(30);
    const phoneNumberWithoutDialCode = FormatPhoneNumber();

    try {
      if (smsMethod === "firebase") {
        await generateRecaptcha();
        sendOtp(phoneNumberWithoutDialCode);
      } else {
        // Call resend OTP API for SMS gateway
        const response = await resendOTPApi({
          mobile: phoneNumberWithoutDialCode,
        });
        if (response?.error === false) {
          toast.success(t("otpSent"));
        } else {
          toast.error(response?.message);
        }
      }
    } catch (error) {
      console.error("Error resending OTP:", error);
      toast.error(t("errorResendingOTP"));
      setResendAvailable(true);
      setTimer(0);
    }
  };

  // Function to format the timer to mm:ss
  const formatTimer = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
      2,
      "0"
    )}`;
  };

  useEffect(() => {
    if (open) {
      generateRecaptcha();
    }
    return () => {
      clearRecaptcha();
    };
  }, [open, clearRecaptcha]);

  const sendOtp = async (phoneNumber) => {
    const formatNumber = "+" + countryCode + phoneNumber;
    const appVerifier = generateRecaptcha();
    if (appVerifier) {
      await signInWithPhoneNumber(authentication, formatNumber, appVerifier)
        .then((confirmationResult) => {
          window.confirmationResult = confirmationResult; // Store verification
          setLoading(false);
          setShowOtpScreen(true); // Show OTP screen after OTP sent successfully
          toast.success(t("otpSent"));
        })
        .catch((error) => {
          setLoading(false);
          console.error("Error sending OTP:", error);
          toast.error(t("errorWhileSendingOTP"));
        });
    } else {
      setLoading(false);
      console.error("reCAPTCHA not initialized");
      toast.error(t("reCAPTCHAnotInitialized"));
    }
  };

  // Verify OTP
  const verifyOtp = async () => {
    // Check if OTP is empty first
    if (!otp || otp.length !== 6) {
      toast.error(t("pleaseEnterOTP"));
      return;
    }
    setLoading(true);
    const otpString = otp;
    const phoneNumberWithoutDialCode = FormatPhoneNumber();

    try {
      if (smsMethod === "firebase") {
        // Firebase OTP verification
        const user = await window.confirmationResult.confirm(otpString);
        if (user) {
          const userAuthData = {
            ...user,
            type: "phone",
            phoneNumber: phoneNumberWithoutDialCode,
            country_code: countryCode,
          };

          dispatch(setUserAuthData(userAuthData));
          handleSuccessfulLogin(user);
        }
      } else {
        // SMS gateway OTP verification
        const response = await verifyOTPApi({
          phone: phoneNumberWithoutDialCode,
          otp: otpString,
          country_code: "+" + countryCode,
        });

        if (response?.error === false) {
          const userAuthData = {
            type: "phone",
            phoneNumber: phoneNumberWithoutDialCode,
            country_code: countryCode,
          };
          dispatch(setUserAuthData(userAuthData));
          handleSuccessfulLogin(response.user);
        } else {
          toast.error(t("invalidOtp"));
        }
      }
    } catch (error) {
      console.error("Invalid OTP:", error);
      if (smsMethod === "firebase") {
        handleFirebaseAuthError(t, error.code);
      } else {
        toast.error(t("invalidOtp"));
      }
    } finally {
      setLoading(false);
    }
  };

  // Helper function to handle successful login
  const handleSuccessfulLogin = async (user) => {
    const phoneNumberWithoutDialCode = FormatPhoneNumber();
    
    try {
      // Use stored messageCode instead of making another API call
      if (messageCode === "101") {
        // New user registration
        const registerResponse = await registerUserApi({
          web_fcm_id: fcmToken,
          mobile: phoneNumberWithoutDialCode,
          loginType: "phone",
          uid: user?.uid,
          country_code: "+" + countryCode,
        });

        dispatch(setUserData(registerResponse?.data));
        dispatch(setToken(registerResponse?.token));
        toast.success(registerResponse?.message);
        handleClose();
      } else if (messageCode === "102") {
        setOpenProfileModal(true);
        handleClose();
      } else if (messageCode === "103") {
        toast.error(t("userDeactivated"));
        handleClose();
      }
    } catch (error) {
      console.error("Error during login:", error);
      toast.error(t("somethingWentWrong"));
    }
  };

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: 'select_account'
    });
    const auth = getAuth();

    // Prevent multiple attempts
    if (loading) return;

    try {
      setLoading(true);

      // Only use ONE authentication method at a time
      const result = await signInWithPopup(auth, provider);

      if (result && result.user) {
        const user = result.user;

        // Create user auth data and dispatch to Redux
        const userAuthData = {
          ...user,
          type: "google",
        };
        dispatch(setUserAuthData(userAuthData));

        // Now verify the user
        const response = await verifyUserApi({ uid: user?.uid });


        if (response.message_code === "101") {
          // New user - register
          const registerResponse = await registerUserApi({
            web_fcm_id: fcmToken,
            email: user?.email,
            username: user?.displayName,
            mobile: user?.phone || "",
            loginType: "google",
            uid: user?.uid,
          });

          // Dispatch user data with Redux
          await Promise.all([
            dispatch(setUserData(registerResponse?.data)),
            dispatch(setToken(registerResponse?.token))
          ]);

          toast.success(registerResponse?.message || t("loginSuccessful"));
          handleClose();
        } else if (response.message_code === "102") {
          setOpenProfileModal(true);
          handleClose();
        } else if (response.message_code === "103") {
          toast.error(t("userDeactivated"));
          handleClose();
        }
      }
    } catch (error) {
      console.error("Google sign-in error:", error);

      if (error.code === "auth/popup-blocked") {
        toast.warning(t("popupBlockedTryingRedirect"));

        // Store a flag in sessionStorage to check after redirect
        sessionStorage.setItem("pendingGoogleRedirect", "true");

        // Use redirect method as fallback
        await signInWithRedirect(auth, provider);
      } else if (error.code === "auth/popup-closed-by-user") {
        toast.info(t("loginCanceled"));
      } else {
        handleFirebaseAuthError(t, error.code);
      }
    } finally {
      setLoading(false);
    }
  };

  // Add this useEffect to initialize auth persistence
  useEffect(() => {
    const auth = getAuth();
    setPersistence(auth, browserLocalPersistence)
      .catch((error) => {
        console.error("Error setting persistence:", error);
      });
  }, []);

  // Handle redirect result when component mounts or when opened
  useEffect(() => {
    if (!open || hasCheckedRedirect) return;

    const auth = getAuth();
    setIsProcessingRedirect(true);

    getRedirectResult(auth)
      .then(async (result) => {
        if (result && result.user) {
          const user = result.user;


          const userAuthData = {
            ...user,
            type: "google",
          };
          dispatch(setUserAuthData(userAuthData));

          try {
            const response = await verifyUserApi({ uid: user?.uid });

            if (response.message_code === "101") {
              // New user - register
              const registerResponse = await registerUserApi({
                web_fcm_id: fcmToken,
                email: user?.email,
                username: user?.displayName,
                mobile: user?.phone || "",
                loginType: "google",
                uid: user?.uid,
              });

              dispatch(setUserData(registerResponse?.data));
              dispatch(setToken(registerResponse?.token));
              toast.success(registerResponse?.message);
              handleClose();
            } else if (response.message_code === "102") {
              setOpenProfileModal(true);
              handleClose();
            } else if (response.message_code === "103") {
              toast.error(t("userDeactivated"));
              handleClose();
            }
          } catch (error) {
            console.error("API error after redirect:", error);
            toast.error(t("somethingWentWrong"));
          }
        }
      })
      .catch((error) => {
        console.error("Error getting redirect result:", error);
        if (error.code) {
          handleFirebaseAuthError(t, error.code);
        }
      })
      .finally(() => {
        setIsProcessingRedirect(false);
        setHasCheckedRedirect(true);
      });
  }, [open, hasCheckedRedirect]);

  // Also add this useEffect to monitor auth state changes
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && !hasCheckedRedirect) {

        // Force a redirect check if we detect a user but haven't checked redirect yet
        setHasCheckedRedirect(false);
      }
    });

    return () => unsubscribe();
  }, [hasCheckedRedirect]);

  // Check for redirect results when component mounts
  useEffect(() => {
    if (!open) return;

    const auth = getAuth();
    const checkRedirect = async () => {
      if (sessionStorage.getItem("pendingGoogleRedirect") === "true") {
        setLoading(true);
        try {
          const result = await getRedirectResult(auth);
          if (result && result.user) {
            // Handle successful redirect result (same code as above)
            // ...
          }
        } catch (error) {
          console.error("Redirect error:", error);
          handleFirebaseAuthError(t, error.code);
        } finally {
          sessionStorage.removeItem("pendingGoogleRedirect");
          setLoading(false);
        }
      }
    };

    checkRedirect();
  }, [open]);

  const handleOtpKeyDown = (e) => {
    if (e.key === "Enter" && otp.length === 6) {
      verifyOtp();
    }
  };

  return (
    <>
      <Dialog open={open}>
        <DialogTitle className="hidden"></DialogTitle>
        <DialogContent className="card_bg p-6 md:p-8 rounded-md shadow-lg w-full max-w-xl">
          {/* Show loading indicator when processing redirect */}
          {isProcessingRedirect ? (
            <div className="flex flex-col items-center justify-center h-60">
              <MiniLoader size={40} />
              <p className="mt-4 text-center">{t("processingLogin")}</p>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="w-full flex justify-between items-center mb-4">
                <CustomImageTag
                  src={websettings?.web_logo}
                  alt="logo"
                  className="h-full w-[160px] object-cover"
                />
                {/* Close Button */}
                <button
                  onClick={close}
                  className="rounded-full description_color text-white p-1"
                >
                  <MdClose size={24} />
                </button>
              </div>

              {/* Conditional Rendering */}
              {!showOtpScreen ? (
                // Phone Input Screen
                <>
                  <div className="flex flex-col gap-1 mb-6">
                    {/* Welcome Text */}
                    <div className="text-2xl font-bold">{t("welcome")}</div>
                    <p className="description_color ">
                      {t("enterYourNumberToGetVerified")}
                    </p>
                  </div>
                  {/* Phone Input Field */}
                  <div className="w-full h-[44px] card_bg">
                    <PhoneInput
                      inputStyle={{ direction: isRtl ? "rtl" : "ltr" }}
                      country={effectiveCountryCode} // Use the effective country code
                      value={phone} // Ensure value is properly linked to state
                      onChange={(value, data) => handleInputChange(value, data)}
                      onCountryChange={(code) => setCountryCode(code)}
                      className="w-full h-full"
                      containerStyle={{ marginBottom: "1rem" }}
                      inputClass="!w-full !h-full rounded-md border-2 px-3 py-2 focus:outline-none !bg-transparent"
                    />
                  </div>

                  {/* Continue Button */}
                  {loading ? (
                    <div className="w-full p-3 flex items-center justify-center font-semibold rounded-md primary_bg_color">
                      <MiniLoader />
                    </div>
                  ) : (
                    <button
                      onClick={handleContinue}
                      className={`w-full py-2  font-semibold rounded-md ${phone
                          ? "primary_bg_color text-white"
                          : "background_color description_color cursor-not-allowed"
                        }`}
                      disabled={!phone}
                    >
                      {t("continue")}
                    </button>
                  )}

                  {/* Divider */}
                  <div className="relative flex justify-center items-center my-4">
                    <span className="w-1/3 h-[1px] bg-gray-300"></span>
                    <span className="px-2 text-sm description_color text-center">
                      {t("orContinueWith")}
                    </span>
                    <span className="w-1/3 h-[1px] bg-gray-300"></span>
                  </div>

                  {/* Google Sign-In Button - show loading state when authentication is in progress */}
                  <button
                    className="flex items-center justify-center gap-2 w-full border rounded-md py-2 transition-all duration-150 hover:primary_text_color"
                    onClick={handleGoogleSignIn}
                    disabled={loading || isGoogleAuthInProgress}
                  >
                    {isGoogleAuthInProgress ? (
                      <>
                        <MiniLoader size={20} />
                        <span className="description_color font-medium ml-2">
                          {t("authenticatingWithGoogle")}
                        </span>
                      </>
                    ) : (
                      <>
                        <FcGoogle size={20} />
                        <span className="description_color font-medium">
                          {t("signInWithGoogle")}
                        </span>
                      </>
                    )}
                  </button>

                  {/* Show informative message during Google auth */}
                  {isGoogleAuthInProgress && (
                    <div className="mt-4 text-sm text-center p-3 bg-blue-50 border border-blue-100 rounded-md">
                      <p className="primary_text_color">
                        {t("completeGoogleAuthInPopup")}
                      </p>
                      <p className="primary_text_color mt-1 text-xs">
                        {t("ifPopupClosedClickAgain")}
                      </p>
                    </div>
                  )}

                  {/* Add this if popup keeps failing */}
                  {popupFailedCount > 1 && (
                    <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                      <p className="text-sm text-yellow-700">
                        {t("havingTroubleWithPopup")} <button
                          onClick={() => {
                            const auth = getAuth();
                            signInWithRedirect(auth, provider);
                          }}
                          className="primary_text_color underline"
                        >
                          {t("tryRedirectMethod")}
                        </button>
                      </p>
                    </div>
                  )}

                  {/* Footer */}
                  <p className="text-xs text-center description_color mt-6">
                    {t("byClickingContinueYouAgreeToOur")}{" "}
                    <Link
                      href="/terms-and-conditions"
                      className="primary_text_color underline"
                    >
                      {t("termsOfService")}
                    </Link>{" "}
                    &{" "}
                    <Link
                      href="/privacy-policy"
                      className="primary_text_color underline"
                    >
                      {t("privacyPolicy")}
                    </Link>
                  </p>
                </>
              ) : (
                // OTP Verification Screen
                <>
                  <div className="text-2xl font-bold mb-2">{t("verifyOTP")}</div>
                  <p className="description_color ">
                    {t("weJustSentYouSixDigitCode")}
                    <br />
                    <span
                      className="font-bold"
                      style={{ direction: "ltr", unicodeBidi: "isolate" }}
                    >
                      {showFullPhoneNumber}
                    </span>
                  </p>
                  <a
                    href="#"
                    className="primary_text_color font-medium underline text-sm mb-4 block"
                    onClick={() => setShowOtpScreen(false)} // Go back to phone input
                  >
                    {t("wrongNumber")}
                  </a>

                  {/* OTP Input using react-otp-input */}
                  <div className="mb-4">
                    <OTPInput
                      value={otp}
                      onChange={setOtp}
                      numInputs={6}
                      shouldAutoFocus
                      renderInput={(props) => (
                        <input
                          {...props}
                          autoComplete="one-time-code"
                          className="!w-10 !h-10 md:!w-[62px] md:!h-[62px] flex justify-center items-center !text-center rounded-lg border border-[--border-color] light_bg_color relative transition-all 
                          focus:outline-none focus:border_color focus:shadow-[0_0_5px_rgba(135,199,204,0.5)]"
                        />
                      )}
                      containerStyle="w-full flex justify-between md:justify-center gap-2 md:gap-5 mt-4"
                      onKeyDown={handleOtpKeyDown}
                    />
                  </div>

                  {/* OTP Timer */}
                  <button
                    disabled={!resendAvailable}
                    onClick={handleResendOtp}
                    className={`w-full py-2 font-semibold rounded-md ${resendAvailable
                        ? "primary_bg_color text-white"
                        : "background_color description_color cursor-not-allowed"
                      }`}
                  >
                    {resendAvailable
                      ? t("resendOTP")
                      : `${t("resendIn")} ${formatTimer(timer)}`}
                  </button>

                  {/* Verify Button */}
                  {loading ? (
                    <div className="w-full p-3 flex items-center justify-center font-semibold rounded-md primary_bg_color">
                      <MiniLoader />
                    </div>
                  ) : (
                    <button
                      onClick={verifyOtp}
                      className={`w-full py-2 font-semibold rounded-md ${otp.length === 6
                          ? "primary_bg_color text-white"
                          : "background_color description_color cursor-not-allowed"
                        }`}
                      disabled={otp.length !== 6}
                    >
                      {t("verifyOTP")}
                    </button>
                  )}
                </>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
      <div id="recaptcha-container"></div>
    </>
  );
};

export default LoginModal;
