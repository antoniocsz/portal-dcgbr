import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Saída standalone: server.js + node_modules mínimos (usado pelo Dockerfile)
  output: 'standalone',
  transpilePackages: ['@digimon/auth', '@digimon/users', '@digimon/contracts'],
  images: {
    // Arte oficial das cartas (fonte: importação TakaOtaku → Card.imageUrl).
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'world.digimoncard.com',
        pathname: '/images/cardlist/card/**'
      }
    ]
  }
}

export default nextConfig
