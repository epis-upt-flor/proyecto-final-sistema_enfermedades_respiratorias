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
  
  // Optimizaciones avanzadas de bundler
  webpack: (config, { dev, isServer }) => {
    // Optimizaciones para producción
    if (!dev && !isServer) {
      // Minificación mejorada
      config.optimization = {
        ...config.optimization,
        minimize: true,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            default: false,
            vendors: false,
            // Vendor chunk para librerías grandes
            vendor: {
              name: 'vendor',
              chunks: 'all',
              test: /node_modules/,
              priority: 20,
              minChunks: 1,
            },
            // Chunk separado para UI components
            ui: {
              name: 'ui',
              chunks: 'all',
              test: /[\\/]components[\\/]ui[\\/]/,
              priority: 30,
              minChunks: 1,
            },
            // Chunk separado para Radix UI
            radix: {
              name: 'radix',
              chunks: 'all',
              test: /[\\/]node_modules[\\/]@radix-ui[\\/]/,
              priority: 25,
              minChunks: 1,
            },
            // Chunk separado para librerías de gráficos
            charts: {
              name: 'charts',
              chunks: 'all',
              test: /[\\/]node_modules[\\/](recharts|d3)[\\/]/,
              priority: 25,
              minChunks: 1,
            },
            // Chunk común para código compartido
            common: {
              name: 'common',
              minChunks: 2,
              chunks: 'all',
              priority: 10,
              reuseExistingChunk: true,
            },
          },
        },
      };
    }
    
    return config;
  },
  
  // Compresión y optimización de assets
  compress: true,
  
  // Optimización de producción
  productionBrowserSourceMaps: false,
  
  // Configuración de headers para cache
  async headers() {
    return [
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
}

export default nextConfig
