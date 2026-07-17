/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    // Bundle the SQL seed files with the reset cron route so it can read them at runtime.
    outputFileTracingIncludes: {
      '/api/cron/reset-demo': ['./db/**'],
    },
  },
}

export default nextConfig
