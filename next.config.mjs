/** @type {import('next').NextConfig} */


const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
const domain = apiUrl.replace(/^https?:\/\//, "").split("/api")[0];

const nextConfig = {
  reactStrictMode: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: domain,
      },
    ],
    unoptimized: false,
  },
  devIndicators: {
    buildActivity: false,
  },
};

nextConfig.output = "export";

export default nextConfig;
