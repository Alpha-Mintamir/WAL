import React from "react";
import { CiShare2 } from "react-icons/ci";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  FacebookShareButton,
  TwitterShareButton,
  WhatsappShareButton,
  EmailShareButton,
} from "react-share";
import {
  FaFacebook,
  FaXTwitter,
  FaWhatsapp,
  FaEnvelope,
  FaLink,
} from "react-icons/fa6";
import toast from "react-hot-toast";
import { useTranslation } from "@/components/Layout/TranslationContext";
import { FaInstagram } from "react-icons/fa";
import useIsMobile from "@/hooks/isMobile";
import { useState } from "react";

const Share = ({ title }) => {
  const t = useTranslation();
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  const baseUrl = process.env.NEXT_PUBLIC_WEB_URL;
  const pathname = window.location.pathname;

  const url = `${baseUrl}${pathname}`;
  const companyName = process.env.NEXT_PUBLIC_APP_NAME;
  const shareMessage = `${title} - ${companyName}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(`${shareMessage} - ${url}`);
    toast.success(t("copiedToClipboard"));
  };

  const openInstagram = () => {
    const instagramUrl = `https://www.instagram.com/?url=${encodeURIComponent(
      url
    )}`;
    window.open(instagramUrl, "_blank");
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className="card_bg dark:light_bg_color p-2 rounded-sm"
          onClick={() => isMobile && setOpen(!open)}
          onMouseEnter={() => !isMobile && setOpen(true)}
          onMouseLeave={() => !isMobile && setOpen(false)}
        >
          <CiShare2 size={24} />
        </button>
      </PopoverTrigger>
      <PopoverContent
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        className="flex flex-col space-y-3 p-4 bg-white dark:bg-gray-800 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700 w-48"
      >
        <WhatsappShareButton url={url} title={shareMessage}>
          <div className="flex items-center space-x-3 cursor-pointer p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition gap-2">
            <FaWhatsapp size={20} className="text-green-500" />
            <span>{t("whatsapp")}</span>
          </div>
        </WhatsappShareButton>
        <TwitterShareButton url={url} title={shareMessage}>
          <div className="flex items-center space-x-3 cursor-pointer p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transitio gap-2n">
            <FaXTwitter size={20} className="text-black dark:text-white" />
            <span>{t("twitter")}</span>
          </div>
        </TwitterShareButton>
        <FacebookShareButton url={url} quote={shareMessage}>
          <div className="flex items-center space-x-3 cursor-pointer p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition gap-2">
            <FaFacebook size={20} className="text-blue-700" />
            <span>{t("facebook")}</span>
          </div>
        </FacebookShareButton>
        <button
          onClick={openInstagram}
          className="flex items-center space-x-3 cursor-pointer p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition gap-2"
        >
          <FaInstagram size={20} className="text-black dark:text-white" />
          <span>{t("instagram")}</span>
        </button>
        <EmailShareButton
          url={url}
          subject={title}
          body={`${shareMessage} - ${url}`}
        >
          <div className="flex items-center space-x-3 cursor-pointer p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition gap-2">
            <FaEnvelope size={20} className="text-gray-600" />
            <span>{t("email")}</span>
          </div>
        </EmailShareButton>
        <div
          className="flex items-center space-x-3 cursor-pointer p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition gap-2"
          onClick={copyToClipboard}
        >
          <FaLink size={20} className="text-gray-500" />
          <span>{t("copyURL")}</span>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default Share;
