/** @type {import('next').NextConfig} */
const nextConfig = {
  // Removed output: 'export' - using Vercel for deployment instead
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin-allow-popups' },
          // Keep COEP disabled unless you need it for WebAssembly/SAB. It breaks auth popups.
          { key: 'Cross-Origin-Embedder-Policy', value: 'unsafe-none' },
        ],
      },
    ]
  },
}

export default nextConfig
