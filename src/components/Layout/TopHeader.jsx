"use client";
import { setTheme } from "@/redux/reducers/themeSlice";
import { setLanguage } from "@/utils/Helper";
import config from "@/utils/Langconfig";
import { useTheme } from "next-themes";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { RiMoonClearLine, RiSunLine, RiUserSettingsLine } from "react-icons/ri";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "./TranslationContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/router";

const TopHeader = () => {
  const dispatch = useDispatch();
  const t = useTranslation();

  const router = useRouter();
  const webSettings = useSelector((state) => state?.settingsData?.settings?.web_settings);

  const isBecomeProviderPage = router.pathname === "/become-provider";

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

  useEffect(() => {
    if (isBecomeProviderPage && webSettings?.show_become_provider_page === false) {
      router.push("/");
    }
  }, [isBecomeProviderPage, webSettings]);

  return (
    <div className="hidden lg:block primary_bg_color text-white py-2 px-2 md:px-4 top-header">
      <div className="container mx-auto">
        <div className="flex gap-4 md:gap-1 justify-between w-full items-center md:space-y-0">
          <div className="hidden md:flex items-center justify-center gap-2">
            {webSettings.show_become_provider_page && (
              <>
                <span>
                  <RiUserSettingsLine size={20} />
                </span>

                <Link
                  href="/become-provider"
                  className="underline font-normal text-sm md:text-base"
                  title="become-provider"
                >
                  {t("becomeProvider")}
                </Link>
              </>
            )}
          </div>

          <div className="flex items-center justify-between md:justify-end w-full md:w-auto space-x-4 rtl:space-x-reverse flex-row-reverse">
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              {theme === "dark" ? (
                <RiMoonClearLine className="text-white" size={22} />
              ) : (
                <RiSunLine className="text-white" size={22} />
              )}

              <button
                onClick={toggleTheme}
                className="w-12 h-6 bg-[#FFFFFF52] rounded-full p-1 flex items-center justify-between cursor-pointer relative safari-fix"
              >
                <div
                  className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform absolute ${theme === "dark"
                    ? "rtl:-translate-x-6 ltr:translate-x-6"
                    : "translate-x-0"
                    }`}
                ></div>
              </button>
            </div>

            <Select
              open={isOpen}
              onOpenChange={setIsOpen}
              value={selectedLanguage}
              onValueChange={handleLanguageChange}
              className="safari-select-fix"
            >
              <SelectTrigger
                className="bg-transparent w-auto text-white border-none focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                onClick={() => setIsOpen(true)}
              >
                <SelectValue>{getCurrentLanguageDisplay()}</SelectValue>
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
        </div>
      </div>
    </div>
  );
};

export default TopHeader;
