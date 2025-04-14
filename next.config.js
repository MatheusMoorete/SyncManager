/** @type {import('next').NextConfig} */
const webpack = require('webpack')

const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { dev }) => {
    // Define uma variável de ambiente que indica se estamos usando mocks
    config.plugins.push(
      new webpack.DefinePlugin({
        'process.env.IS_USING_MOCK': JSON.stringify(dev),
      })
    )

    return config
  },
  // Ignorar erros de TypeScript quando não for possível encontrar módulos em produção
  typescript: {
    ignoreBuildErrors: process.env.NODE_ENV === 'production',
  },
}

module.exports = nextConfig
