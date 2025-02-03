"use client";

import { IoChatbubbles, IoNotifications, IoPeople } from "react-icons/io5"; // 아이콘 추가

import FriendPanel from "@/components/FriendPanel";
import { useState } from "react";

// 메뉴 아이템 인터페이스
interface MenuItem {
  id: string;
  name: string;
  icon: JSX.Element;
}

export default function MenuBar() {
  const [isFriendListOpen, setIsFriendListOpen] = useState(false);

  // 메뉴 버튼 리스트
  const menuItems: MenuItem[] = [
    { id: "friend", name: "Friend", icon: <IoPeople size={24} /> },
    { id: "chat", name: "Chat", icon: <IoChatbubbles size={24} /> },
    { id: "push", name: "Push", icon: <IoNotifications size={24} /> },
  ];

  // 버튼 클릭 시 패널 열기
  const handleMenuClick = (id: string) => {
    if (id === "friend") {
      setIsFriendListOpen((prev) => !prev);
    }
  };

  return (
    <div className="absolute right-5 top-20 flex flex-col space-y-2">
      {/* 메뉴 버튼 리스트 */}
      {menuItems.map((item) => (
        <button
          key={item.id}
          className="flex items-center space-x-2 p-2 bg-white shadow-md rounded-md"
          onClick={() => handleMenuClick(item.id)}
        >
          {item.icon}
          <span>{item.name}</span>
        </button>
      ))}

      {/* FriendPanel을 MenuBar에서 관리 */}
      <FriendPanel isOpen={isFriendListOpen} onClose={() => setIsFriendListOpen(false)} />
    </div>
  );
}
