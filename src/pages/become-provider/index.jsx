import MetaData from "@/components/Meta/MetaData";
import dynamic from "next/dynamic";

const BecomeProviderPage = dynamic(
  () =>
    import("@/components/PagesComponents/BecomeProvider/BecomeProviderPage"),
  { ssr: false }
);

const index = () => {
  return (
    <>
      <MetaData
        title={"Become a Provider | BookMyService"}
        description={"BookMyService - Become a Provider"}
        keywords={"Become a Provider, Provider, BookMyService"}
        pageName="/become-provider"
      />
      <BecomeProviderPage />
    </>
  );
};

export default index;
