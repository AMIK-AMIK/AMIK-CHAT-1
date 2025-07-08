/** @type {import('next').NextConfig} */
import withPWA from '@ducanh2912/next-pwa';

const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'placehold.co',
            },
            {
                protocol: 'https',
                hostname: 'storage.googleapis.com',
            }
        ],
    },
};

const pwaConfig = withPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
});


export default pwaConfig(nextConfig);
