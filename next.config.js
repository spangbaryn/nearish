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

    // Add specific loader for .node files
    config.module = {
      ...config.module,
      rules: [
        ...config.module.rules,
        {
          test: /\.node$/,
          use: 'node-loader',
          exclude: /node_modules/,
        }
      ]
    }

    return config
  },
  // Explicitly mark which packages are server-only
  experimental: {
    serverComponentsExternalPackages: ['sharp', 'onnxruntime-node', '@xenova/transformers']
  }
}

module.exports = nextConfig 
module.exports = nextConfig 