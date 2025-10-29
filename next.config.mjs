/** @type {import('next').NextConfig} */
const nextConfig = {
  // Removed output: 'export' - using Vercel for deployment instead
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
