const nextConfig = {
  reactStrictMode: true,
  experimental: {
    appDir: true,  // App Router 사용 (필요한 경우)
  },
  output: 'export',  // 정적 사이트 export 설정
  exportTrailingSlash: true,  // URL 끝에 슬래시 추가
  images: {
    unoptimized: true,  // 이미지 최적화 비활성화
  },
  
};

export default nextConfig;
