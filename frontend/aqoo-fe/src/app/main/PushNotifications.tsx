"use client";

import { useEffect, useState } from "react";

import Image from "next/image";

// import axios from "axios"; // 주석 처리

export default function PushNotifications({ onClose }: { onClose: () => void }) {
  const dummy = [
    {
      id: "1",
      type: "물고기 먹이주기",
      message: "물고기 식사 시간입니다!",
      status: false,
    },
    {
      id: "2",
      type: "친구 신청",
      message: "친칠라(ccc)님께서 친구 신청",
      status: false,
    },
    {
      id: "3",
      type: "게임방 초대",
      message: "너구리(nnn)님이 게임방 초대 신청",
      status: true,
    },
    {
      id: "4",
      type: "어항 청소하기",
      message: "이끼가 가득해요!",
      status: true,
    },
    {
      id: "5",
      type: "게임방 초대",
      message: "너구리(nnn)님이 게임방 초대 신청",
      status: false,
    },
    {
      id: "6",
      type: "물고기 먹이주기",
      message: "물고기 식사 시간입니다!",
      status: false,
    },
  ];

  // useEffect용
  // const [notifications, setNotifications] = useState<
  //   { type: string; message: string; status: boolean; id: string }[]
  // >([]);

  // 더미 테스트용
  const [notifications, setNotifications] = useState(dummy); // 초기값을 dummy로 설정
  const [showFriendRequestModal, setShowFriendRequestModal] = useState(false);
  const [selectedFriendRequest, setSelectedFriendRequest] = useState<string | null>(null);

  // useEffect에서 읽음 처리 API 호출 (더미 데이터라서 실제 API 호출 부분은 비워둠)
  // useEffect(() => {
  //   const unreadNotifications = notifications.filter((notif) => !notif.status);

  //   if (unreadNotifications.length > 0) {
  //     console.log("📡 읽음 처리 API 호출: ", unreadNotifications);
  //     // 실제 API 호출 예시:
  //     // await axios.post("/api/notifications/read-all", { ids: unreadNotifications.map(n => n.id) });
  //   }
  // }, [notifications]);

  return (
    <div className="relative w-[400px] h-[600px] bg-white bg-opacity-70 border border-black rounded-lg shadow-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold">알림</h2>
        <button onClick={onClose} className="text-xl font-bold hover:text-red-500">
          ✖
        </button>
      </div>

      {/* 🔹 스크롤 가능하게 변경 */}
      <div className="space-y-3 overflow-y-auto max-h-[500px] scrollbar-hide">
        {notifications.length === 0 ? (
          <p className="text-center text-gray-500">최근 알림이 없습니다.</p>
        ) : (
          notifications.map((notif) => (
            <NotificationItem
              key={notif.id}
              notification={notif}
              onFriendRequestClick={
                notif.type === "친구 신청"
                  ? () => {
                      setSelectedFriendRequest(notif.message);
                      setShowFriendRequestModal(true);
                    }
                  : undefined
              }
            />
          ))
        )}
      </div>

      {/* 친구 신청 모달 */}
      {showFriendRequestModal && (
        <FriendRequestModal message={selectedFriendRequest} onClose={() => setShowFriendRequestModal(false)} />
      )}
    </div>
  );
}

// 알림 개별 아이템 컴포넌트
// 알림 개별 아이템 컴포넌트
function NotificationItem({
  notification,
  onFriendRequestClick,
}: {
  notification: any;
  onFriendRequestClick?: () => void;
}) {
  const { type, message, status } = notification;

  // 알림 타입별 아이콘 경로 설정
  const getIconSrc = (type: string) => {
    switch (type) {
      case "게임방 초대":
        return "/gameIcon.png";
      case "친구 신청":
        return "/friendIcon.png";
      case "물고기 먹이주기":
        return "/feedIcon.png";
      case "어항 청소하기":
        return "/cleanIcon.png";
      default:
        return "/defaultIcon.png"; // 기본 아이콘 (없을 경우 대비)
    }
  };

  return (
    <div
      className="relative p-3 bg-white border rounded-lg flex items-center space-x-3 shadow"
      onClick={onFriendRequestClick}
    >
      {/* 알림 아이콘 및 노란 점 컨테이너 */}
      <div className="relative flex items-center">
        <Image src={getIconSrc(type)} alt={type} width={32} height={32} className="w-8 h-8 " />

        {/* 읽지 않은 경우 노란 점 표시 (아이콘 옆에 배치) */}
        {!status && <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full"></div>}
      </div>

      {/* 알림 타입별 처리 */}
      {type === "게임방 초대" ? (
        <GameInviteNotification message={message} />
      ) : type === "친구 신청" ? (
        <FriendRequestNotification message={message} />
      ) : (
        <FishFeedNotification type={type} message={message} />
      )}
    </div>
  );
}

// 물고기 먹이주기 & 어항 청소하기 알림
function FishFeedNotification({ type, message }: { type: string; message: string }) {
  return (
    <>
      <div>
        <p className="font-bold">{type}</p>
        <p className="text-sm text-gray-500">{message}</p>
      </div>
    </>
  );
}

// 친구 신청 알림 (클릭 시 모달 열기)
function FriendRequestNotification({ message }: { message: string }) {
  return (
    <>
      <div>
        <p className="font-bold">친구 신청</p>
        <p className="text-sm text-gray-500">{message}</p>
      </div>
    </>
  );
}

// 게임방 초대 알림 (입장 버튼 추가)
function GameInviteNotification({ message }: { message: string }) {
  return (
    <div className="flex items-center space-x-3 w-full">
      {/* 텍스트 및 버튼 */}
      <div className="flex flex-col w-full">
        <p className="font-bold text-red-500">게임방 초대</p>
        <p className="text-sm text-gray-500">
          {message}
          <br />
          지금 참여해보세요!
        </p>
        <button className="mt-2 px-4 py-1 bg-blue-500 text-white rounded self-start">입장</button>
      </div>
    </div>
  );
}

// 친구 신청 모달 컴포넌트
function FriendRequestModal({ message, onClose }: { message: string | null; onClose: () => void }) {
  if (!message) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-[300px]">
        <h3 className="text-lg font-bold mb-2">친구 신청</h3>
        <p className="text-gray-600">{message}</p>
        <div className="flex justify-end space-x-2 mt-4">
          <button onClick={onClose} className="px-4 py-2 bg-gray-300 rounded">
            취소
          </button>
          <button className="px-4 py-2 bg-green-500 text-white rounded">수락</button>
        </div>
      </div>
    </div>
  );
}
