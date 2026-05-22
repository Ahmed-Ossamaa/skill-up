/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://skill-up-jiu4.onrender.com/api/:path*',
      },
    ];
  },
  reactCompiler: true,
  images: {
    remotePatterns: [{
      protocol: 'https',
      hostname: 'res.cloudinary.com',
    },
    {
      protocol: 'https',
      hostname: 'images.unsplash.com',
    },
    {
      protocol: 'https',
      hostname: 'loremflickr.com',
    },
    {
      protocol: 'https',
      hostname: 'cdn.jsdelivr.net',
    },
    {
      protocol: 'https',
      hostname: 'picsum.photos',
    },
    {
      protocol: 'https',
      hostname: 'avatars.githubusercontent.com',
    }
    ],
  },

  allowedDevOrigins: ["res.cloudinary.com"]
};

export default nextConfig;
