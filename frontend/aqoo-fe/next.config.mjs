const nextConfig = {
  reactStrictMode: true,
  experimental: {
    appDir: true,  // App Router 사용 (필요한 경우)
  },
  exportTrailingSlash: true,  // URL 끝에 슬래시 추가
  images: {
    unoptimized: true,  // 이미지 최적화 비활성화
  },
  eslint: {
    ignoreDuringBuilds: true,  // 빌드 중 ESLint 검사 무시
  },
};

export default nextConfig;
