/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'cumma-images.s3.eu-north-1.amazonaws.com',
      'example.com',
      'localhost',
      'localhost:3001',
      'via.placeholder.com',
      'placehold.co',
      'placekitten.com',
      'picsum.photos',
      'cumma.in',
      'cummaimages.s3.eu-north-1.amazonaws.com',
      'api.cumma.in',
      'testwebsite.cumma.in',
      
    ],
  },
  eslint: {
        ignoreDuringBuilds: true,
    },
  typescript: {
        ignoreBuildErrors: true,
  },
  // Add support for ngrok and other tunneling services
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version',
          },
        ],
      },
    ];
  },
}

module.exports = nextConfig