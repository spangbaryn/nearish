/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'image.mux.com'
    ]
  },
  webpack: (config, { isServer }) => {
    // Exclude native node modules from client-side bundles
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        sharp: false,
        'onnxruntime-node': false,
        '@xenova/transformers': false,
        fs: false,
        path: false
      }
    }
    return config
  },
}

module.exports = nextConfig 