const nextConfig = {
  // Allows CI/verification builds to avoid a .next directory held by a local dev server.
  distDir: process.env.NEXT_DIST_DIR || '.next',
  async redirects() {
    return [
      {
        source: '/robot.txt',
        destination: '/robots.txt',
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/(play|run|playground|practice)',
        headers: [
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'credentialless',
          },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
        ],
      },
      {
        source: '/(play|run|playground|practice)/:path*',
        headers: [
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'credentialless',
          },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
        ],
      },
      {
        // Chapter pages can embed the C/C++ WebAssembly compiler.
        source: '/:username/:topicSlug',
        headers: [
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'credentialless',
          },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
        ],
      },
      {
        // Wasmer needs SharedArrayBuffer inside its module worker. The worker
        // response must opt into the same isolation policy as the playground
        // page or Chromium blocks it before any compiler code can run.
        source: '/workers/:path*',
        headers: [
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'credentialless',
          },
          {
            key: 'Cross-Origin-Resource-Policy',
            value: 'same-origin',
          },
        ],
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
