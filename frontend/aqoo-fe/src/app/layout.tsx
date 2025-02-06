// app/layout.tsx
"use client"; // 클라이언트 컴포넌트 설정

import "@/styles/globals.css"; // Tailwind를 적용하려면 반드시 추가해야 함!

import RecoilProvider from "@/providers/RecoilProvider";

// import NavBar from "@/components/NavBar";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <RecoilProvider>
          {/* <NavBar /> */}
          {children}
        </RecoilProvider>
      </body>
    </html>
  );
}
