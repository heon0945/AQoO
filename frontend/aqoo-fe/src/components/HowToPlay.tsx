"use client";

import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { title } from "process";

import { useState } from "react";

interface Slide {
  title: string;
  description?: string;
  image?: string;
}

const MainPages = [
  {
    title: "AQoO에 오신 것을 환영합니다!",
    description:
      "AQoO는 지친 여러분을 위해 준비한 방치형 힐링게임이에요. \n 여러분의 몸과 마음을 쉬게 도와줄 물고기들과 함께 예쁜 어항을 꾸며볼까요?",
    image: "/how_to_play/메인페이지_오프닝.png",
  },
  {
    title: "기본 메뉴",
    description:
      "좌측 하단에는 여러가지 기본 기능이 있어요. \n mypage 아이콘을 누르면, 내가 가지고 있는 물고기를 볼 수 있어요. \n 회원정보도 이곳에서 수정할 수 있답니다.",
    image: "/how_to_play/메인페이지_메뉴_전체.png",
  },
  {
    title: "기본 메뉴",
    description:
      "Friends를 누르면 친구 목록을 확인할 수 있어요. \n 친구를 검색 및 초대할 수도 있고,  \n 친구의 어항에도 찾아갈 수 있어요!",
    image: "/how_to_play/메인페이지_메뉴_친구.png",
  },
  {
    title: "기본 메뉴",
    description: "Push는 각종 알림을 보여주는 창이에요. \n 이번엔 어떤 알림이 왔을까요? 😊",
    image: "/how_to_play/메인페이지_메뉴_알람.png",
  },
  {
    title: "어항 이동",
    description:
      "MyPage 위에 있는 화살표를 누르면 나의 다른 어항으로 이동할 수 있어요. \n 다른 어항에 있는 물고기들도 구경해봐요!🐟",
    image: "/how_to_play/메인페이지_메뉴_전체.png",
  },
  {
    title: "상태창",
    description:
      "가운데 아래 쪽에는 각종 상태가 보여요. \n exp가 요구하는 만큼 다 차면 레벨업을 할 수 있어요! \n 레벨업을 하면 뽑기 또는 그리기를 할 수 있답니다.",
    image: "/how_to_play/메인페이지_메뉴_상태창.png",
  },
  {
    title: "어항 관리",
    description:
      "우측 아래 쪽에는 현재 어항의 상태가 나와 있어요. \n 상태에 따라 Water(물주기), Clean(청소하기), Feed(먹이주기)를 할 수 있어요. \n 각각의 활동을 하면 경험치를 주니 잊지말고 챙겨보세요!",
    image: "/how_to_play/메인페이지_메뉴_어항관리.png",
  },
  {
    title: "청소하기 모션 인식",
    description:
      "Clean을 클릭하면 어항을 깨끗하게 닦을 수 있어요. \n 카메라를 향해 손바닥을 펼치고, 좌우로 3번 힘껏! 왔다갔다하면 돼요! \n Tip. 카메라에 손을 가까이대고, 화면의 끝에서 끝까지 갈 수록 더 잘 된답니다🖐",
    image: "/how_to_play/메인페이지_메뉴_청소.png",
  },
  {
    title: "물고기 뽑기 확률 정보",
    description:"\n\n🎯 COMMON 물고기는 70%, \n✨멋진 RARE 물고기는 20%, \n🌟전설의 EPIC 물고기는 10% 확률로 나타나요!",
    image: "/how_to_play/메인페이지_물고기확률.png"
  },
];

const MyPages = [
  {
    title: "MyPage",
    description:
      "마이페이지에서는 내가 가지고 있는 물고기들을 확인할 수 있고 \n 내 어항들의 현황과 내 회원 정보를 수정할 수 있어요.",
    image: "/how_to_play/마이페이지_전체.png",
  },
  {
    title: "도감관리 탭",
    description:
      "도감관리 탭에서는 도감에 등록되어 있는 물고기의 종류와 마릿수를 확인할 수 있어요. \n 가지고 있는 물고기는 물고기의 모습이 보이고, 그렇지 않은 물고기는 그림자로 보여요. \n 희귀 등급에 따라 등장 확률이 다르니 희귀한 물고기를 찾아 도감을 채워보세요! ",
    image: "/how_to_play/마이페이지_도감관리.png",
  },
  {
    title: "커스텀 탭",
    description:
      "커스텀 탭에서는 내가 그린 물고기들을 확인할 수 있어요. \n 어때요, 내가 그린 물고기들이 마음에 드시나요? 😊",
    image: "/how_to_play/마이페이지_커스텀.png",
  },
];

const FishTanks = [
  {
    title: "어항관리",
    description:
      "어항관리에서는 내가 가지고 있는 어항을 관리할 수 있어요. \n 어항 별로 물고기를 배치할 수 있고, 배경도 수정할 수 있답니다.",
    image: "/how_to_play/어항관리_메인.png",
  },
  {
    title: "어항생성",
    description: "우측 상단 '+'버튼을 누르면 어항을 추가로 생상할 수 있습니다. \n 어항은 이름도 바꿀 수 있어요. ",
    image: "/how_to_play/어항관리_어항생성.png",
  },
  {
    title: "어항 관리",
    description:
      "좌측 내 물고기에서 넣고싶은 물고기를 넣을 수 있어요.\n 우측에서는 물고기를 뺄 수 있어요. \n 아래에서 어항 배경을 변경할 수 있어요.",
    image: "/how_to_play/어항관리_메인.png",
  },
  {
    title: "변경 완료",
    description: "우측 상단 'v' 표시를 클릭하면 변경을 완료할 수 있답니다 😊",
    image: "/how_to_play/어항관리_완료.png",
  },
];

const Game = [
  {
    title: "방 만들기",
    description: "친구를 초대해 함께 게임을 즐길 수 있어요.\n친구 초대는 최대 5명까지 가능하며, 추가와 제거 버튼으로 손쉽게 참가자를 관리할 수 있어요.",
    image: "/how_to_play/게임_방만들기.png",
  },
];

const GameRoom = [
  {
    title: "방장",
    description: "여기서도 친구 초대가 가능해요!\n채팅창 아래에서 원하는 게임을 골라보세요.\n모두가 레디를 누르면 'Game Start' 버튼이 짠! 하고 나타나요.",
    image: "/how_to_play/게임_친구초대.png",
  },
  {
    title: "채팅방",
    description: "게임을 시작하려면 레디 버튼을 누르거나 F5를 눌러주세요.\n채팅을 입력하면 내 대표 물고기 위에 말풍선이 나타나요.",
    image: "/how_to_play/게임_채팅방.png",
  },
  {
    title: "스페이스바 게임",
    description: "스페이스바를 마구 눌러서 빠르게 골 지점을 통과해 보세요!",
    image: "/how_to_play/게임_스페이스바.png",
  },
  {
    title: "방향키 게임",
    description: "화면에 나오는 방향과 같은 방향키를 빠르게 눌러주세요!",
    image: "/how_to_play/게임_방향키.png",
  },  
];

export default function HowToPlayModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const router = useRouter();
  const pathname = usePathname();

  const [page, setPage] = useState(0);

  if (!isOpen) return null;

  let slides: Slide[] = [];

  if (pathname === "/main") {
    slides = MainPages;
  } else if (pathname === "/mypage") {
    slides = MyPages;
  } else if (pathname === "/mypage/fishtank") {
    slides = FishTanks;
  } else if (pathname === "/gameroom") {
    slides = Game;
  } else if (pathname.startsWith("/room/")) {
    slides = GameRoom;
  } else {
    slides = [
      {
        title: "설명이 없어요!",
      },
    ]; // 혹은 디폴트 페이지
  }

  return (
    <div
      className="
        fixed inset-0 z-50
        bg-black bg-opacity-50
        flex items-center justify-center
      "
      onClick={onClose}
    >
      {/* 모달 컨테이너: 화면에 맞춰 반응형으로 */}
      <div
        className="
          relative
          w-[90%]
          max-w-4xl        /* 화면폭의 최대 90%, 최대 폭 4xl 정도 */
          max-h-[90vh]     /* 화면높이의 90%까지 */
          bg-white
          rounded-2xl
          shadow-lg
          p-6
          overflow-hidden  /* 스크롤 없이 넘치면 잘림 */
          flex flex-col
          items-center
        "
        onClick={(e) => e.stopPropagation()}
      >
        {/* 닫기 버튼 */}
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 pointer-events-auto z-50"
          onClick={onClose}
        >
          <X size={24} />
        </button>

        {/* 슬라이드 컨테이너 */}
        <div className="relative w-full h-full overflow-hidden">
          <div className="flex transition-transform duration-500" style={{ transform: `translateX(-${page * 100}%)` }}>
            {slides.map((item, index) => (
              <div
                key={index}
                className="w-full flex-shrink-0 flex flex-col items-center justify-between text-center px-2"
              >
                {/* aspect-ratio: 16:9 영역 확보 후 object-contain */}
                {item.image && (
                  <div className="w-[80%] sm:w-[70%] aspect-w-16 aspect-h-9 flex items-center justify-center">
                    <img src={item.image} alt="Intro" className="max-h-[40vh]  w-auto object-contain  rounded-lg" />
                  </div>
                )}
                <div>
                  <h2 className="mt-4 text-xl sm:text-3xl font-bold whitespace-pre-wrap">{item.title}</h2>
                  <p className="mt-2 text-base sm:text-lg text-gray-600 whitespace-pre-wrap">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 네비게이션 버튼 */}
        <div className="absolute bottom-6 flex w-full justify-between px-6">
          {page > 0 ? (
            <button
              className={`p-2 ${page === 0 ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-200"} rounded-full`}
              onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
              disabled={page === 0}
            >
              <ChevronLeft size={28} />
            </button>
          ) : (
            <div className="w-[44px] h-[44px]" />
          )}
          {page < slides.length - 1 && (
            <button
              className={`p-2 ${
                page === slides.length - 1 ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-200"
              } rounded-full`}
              onClick={() => setPage((prev) => Math.min(prev + 1, slides.length - 1))}
              disabled={page === slides.length - 1}
            >
              <ChevronRight size={28} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
