import Link from "next/link";

export default function Home() {
  return (
    <main className="relative w-full h-screen  flex items-center justify-center">
      {/* 배경 이미지 + 투명 레이어 */}
      <div
        className="absolute inset-0 bg-cover bg-center before:absolute before:inset-0 before:bg-white/30"
        style={{ backgroundImage: "url(/background-1.png)" }}
      ></div>

      <div className="relative text-center">
        <h1 className="text-9xl text-white tracking-widest ">AQoO</h1>
        {/* <div className="size-48 bg-[#50d71e]"></div> */}
        <Link href="/main">
          <p className="mt-16 text-4xl text-white hover:text-yellow-300 animate-bounce">start...</p>
        </Link>
      </div>

    </main>
  );
}
