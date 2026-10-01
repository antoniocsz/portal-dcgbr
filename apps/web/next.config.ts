import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  transpilePackages: ['@digimon/auth', '@digimon/users', '@digimon/contracts']
}

export default nextConfig
