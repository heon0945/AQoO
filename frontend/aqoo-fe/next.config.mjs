/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    appDir: true, // Next.js 14에서 App Router 사용 가능
  },
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "13.124.6.53", // ✅ IP 주소 허용
        port: "", // 특정 포트 없으면 빈 문자열
        pathname: "/images/**", // ✅ `/images/` 경로 허용
      },
    ],
  }
};

export default nextConfig;
