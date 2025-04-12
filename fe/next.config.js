// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["ahzkzholnhwwpmjivnly.supabase.co"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  reactStrictMode: true,
};

module.exports = nextConfig;
