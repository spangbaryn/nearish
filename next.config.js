const path = require('path')

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'image.mux.com'
    ]
  },
  webpack: (config, { isServer }) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, './')
    }

    if (!isServer) {
      config.externals = {
        ...config.externals,
        'sharp': 'sharp',
        'onnxruntime-node': 'onnxruntime-node',
        '@xenova/transformers': '@xenova/transformers'
      }
    }

    return config
  }
}

module.exports = nextConfig 