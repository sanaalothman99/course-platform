import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'rilokhjpwxxcoemozgwm.supabase.co',
      },
    ],
  },
}

export default nextConfig