import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return {
      // beforeFiles so the host rule wins over the filesystem match for "/",
      // which is the federal dashboard. On sd.simecon.app the root serves the
      // San Diego edition; every other path behaves normally on both hosts.
      beforeFiles: [
        {
          source: "/",
          destination: "/san-diego",
          has: [{ type: "host" as const, value: "sd.simecon.app" }],
        },
      ],
      afterFiles: [],
      fallback: [],
    };
  },
};

export default nextConfig;
