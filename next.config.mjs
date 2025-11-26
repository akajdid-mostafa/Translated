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
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Exclude pdfjs-dist from webpack bundling
      config.externals = config.externals || [];
      if (Array.isArray(config.externals)) {
        config.externals.push('pdfjs-dist');
      } else {
        const originalExternals = config.externals;
        config.externals = [
          originalExternals,
          'pdfjs-dist'
        ];
      }
    }
    return config;
  },
}

export default nextConfig
