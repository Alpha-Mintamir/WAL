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
  // Remove static export for Vercel deployment
  // nextConfig.output = "export"; // This line was causing the issue
};

export default nextConfig;
