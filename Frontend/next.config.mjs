/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    domains: ['res.cloudinary.com','images.unsplash.com'],
  },

  allowedDevOrigins: ["res.cloudinary.com"]
};

export default nextConfig;
