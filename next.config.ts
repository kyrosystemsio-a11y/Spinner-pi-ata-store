import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/maps",
        destination: "/shipping",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
