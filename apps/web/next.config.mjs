const nextConfig = {
  // Allows CI/verification builds to avoid a .next directory held by a local dev server.
  distDir: process.env.NEXT_DIST_DIR || '.next',
  async headers() {
    const wasmIsolationHeaders = [
      { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
      { key: 'Cross-Origin-Embedder-Policy', value: 'require-corp' },
    ];
    return [
      // Interactive C/C++ snippets can be opened from any tutorial route. Wasmer
      // needs cross-origin isolation even for single-threaded WASIX programs.
      { source: '/:path*', headers: wasmIsolationHeaders },
    ];
  },
  async redirects() {
    return [
      {
        source: '/robot.txt',
        destination: '/robots.txt',
        permanent: true,
      },
    ];
  },
  images: {
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'ui-avatars.com',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'http',
        hostname: '192.168.1.11',
        port: '5000',
      }
    ],
  },
  allowedDevOrigins: ['192.168.1.11:3000', 'localhost:3000']
};

export default nextConfig;
