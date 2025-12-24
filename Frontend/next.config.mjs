/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://skillup-backend.onrender.com/api/:path*',
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
    },],
  },

  allowedDevOrigins: ["res.cloudinary.com"]
};

export default nextConfig;
