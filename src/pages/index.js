import MetaData from "@/components/Meta/MetaData";
import dynamic from "next/dynamic";

const HomePage = dynamic(() => import("@/components/HomePage/HomePage"), {
  ssr: false,
});

export default function Home() {
  return (
    <>
      <MetaData
        title={`Home - ${process.env.NEXT_PUBLIC_META_TITLE}`}
        description={process.env.NEXT_PUBLIC_META_DESCRIPTION}
        keywords={process.env.NEXT_PUBLIC_META_KEYWORDS}
        pageName="/"
      />
      <HomePage />
    </>
  );
}
