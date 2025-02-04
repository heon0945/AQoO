"use client";

import { Brush, Droplet, Fish, Gamepad2, Heart, Users, UtensilsCrossed } from "lucide-react";

export default function BottomMenuBar() {
  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[90%] max-w-[1000px] bg-white/70 rounded-lg p-4 flex items-center justify-between shadow-lg backdrop-blur-md">
      {/* 좌측 메뉴 */}
      <div className="flex space-x-4">
        <MenuButton icon="/icon-fishTank.png" label="MyPage" />
        <IconMenuButton icon={<Heart className="w-10 h-10 text-red-500" />} label="Push" />
        <IconMenuButton icon={<Users className="w-10 h-10 text-green-500" />} label="Friend" />
        <IconMenuButton icon={<Gamepad2 className="w-10 h-10 text-purple-500" />} label="Chat Game" />
      </div>

      {/* 중앙: 사용자 정보 */}
      <div className="flex flex-col items-center text-center">
        <p className="text-lg font-bold">Lv. 12 닉네임</p>
        <div className="flex items-center space-x-2">
          <p className="text-sm">exp</p>
          <div className="w-40 bg-gray-300 rounded-full overflow-hidden">
            <div className="bg-blue-600 h-4 w-3/5"></div>
          </div>
          <p className="text-sm">1020</p>
        </div>
      </div>

      {/* 중앙: 어항 상태 바 */}
      <div className="flex flex-col space-y-2 text-sm">
        <StatusBar icon={<Droplet className="w-5 h-5 text-blue-400" />} label="어항 수질" value={80} />
        <StatusBar icon={<Brush className="w-5 h-5 text-yellow-500" />} label="청결도" value={60} />
        <StatusBar icon={<UtensilsCrossed className="w-5 h-5 text-orange-500" />} label="포만감" value={40} />
      </div>

      {/* 우측 메뉴 */}
      <div className="flex space-x-4">
        <IconMenuButton icon={<Droplet className="w-10 h-10 text-blue-400" />} label="Water" />
        <IconMenuButton icon={<Brush className="w-10 h-10 text-yellow-500" />} label="CleanUp" />
        <IconMenuButton icon={<UtensilsCrossed className="w-10 h-10 text-orange-500" />} label="Feed" />
      </div>
    </div>
  );
}

/* 버튼 img ver */
function MenuButton({ icon, label }: { icon: string; label: string }) {
  return (
    <button className="flex flex-col items-center p-2 bg-white rounded-lg shadow-md hover:bg-gray-200">
      <img src={icon} alt={label} className="w-10 h-10" />
      <span className="text-xs">{label}</span>
    </button>
  );
}

/* 버튼 icon ver */
function IconMenuButton({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <button className="flex flex-col items-center p-2 bg-white rounded-lg shadow-md hover:bg-gray-200">
      {icon}
      <span className="text-xs">{label}</span>
    </button>
  );
}

/* 상태 바 */
function StatusBar({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="flex items-center space-x-2">
      {icon}
      <span>{label}</span>
      <div className="w-24 bg-gray-300 rounded-full overflow-hidden">
        <div className="h-4 bg-blue-500" style={{ width: `${value}%` }}></div>
      </div>
    </div>
  );
}
