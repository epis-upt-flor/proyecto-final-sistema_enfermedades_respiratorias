/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Configuración para export estático (necesario para Capacitor)
  output: 'export',
  trailingSlash: true,
  // Desactivar optimizaciones que no funcionan en export estático
  reactStrictMode: true,
}

export default nextConfig
