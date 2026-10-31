/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        // The widget page is embeddable on the lender's and brokers' sites
        source: '/widget',
        headers: [{ key: 'Content-Security-Policy', value: 'frame-ancestors *' }],
      },
    ];
  },
};
export default nextConfig;
