import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Saída standalone: server.js + node_modules mínimos (usado pelo Dockerfile)
  output: 'standalone',
  transpilePackages: ['@digimon/auth', '@digimon/users', '@digimon/contracts']
}

export default nextConfig
