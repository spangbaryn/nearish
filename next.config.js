/** @type {import('next').NextConfig} */
const path = require('path')

const nextConfig = {
  images: {
    domains: [
      'image.mux.com'
    ]
  },
  webpack: (config, { isServer }) => {
    // Add path aliases
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, './')
    }

    if (!isServer) {
      // Exclude all native node modules on client-side
      config.resolve.fallback = {
        ...config.resolve.fallback,
        sharp: false,
        'onnxruntime-node': false,
        '@xenova/transformers': false,
        fs: false,
        path: false,
        crypto: false,
        stream: false,
        os: false
      }
    }

    return config
  }
}

module.exports = nextConfig 