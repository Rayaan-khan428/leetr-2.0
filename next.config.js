/** @type {import('next').NextConfig} */
const nextConfig = {
  // ... other config options
  
  // Ensure experimental features are enabled if needed
  experimental: {
    // ... other experimental options
  },

  images: {
    domains: [
      'lh3.googleusercontent.com', // Allow Google user content (profile pictures)
    ],
  },
}

module.exports = nextConfig 