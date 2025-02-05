/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Não incluir módulos do servidor no bundle do cliente
      config.resolve.fallback = {
        ...config.resolve.fallback,
        'fs': false,
        'net': false,
        'tls': false,
        'child_process': false,
        'fluent-ffmpeg': false,
      }
    }
    return config
  },
}

module.exports = nextConfig 