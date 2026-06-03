import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com"
      }
    ],
  },
  allowedDevOrigins: [
    '192.168.1.175',
    'rocky-moonstone-unharmed.ngrok-free.dev'
  ]
};

export default nextConfig;
