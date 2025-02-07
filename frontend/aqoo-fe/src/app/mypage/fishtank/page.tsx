"use client";

import Link from "next/link";
import FishTankTabs from "./components/FishTankTabs";

export default function MyFishTank() {
  return (
    // 전체 화면 배경 등 기존 MyPage와 비슷한 스타일
    <div
      className="
        flex flex-col
        h-screen
        bg-[url('/images/배경샘플.png')] 
        bg-cover bg-center bg-no-repeat
      "
    >
      {/* 상단 내비게이션 버튼 */}
      <div className="flex flex-col justify-between m-1 absolute top-0 left-0">
        <Link
          href="/mypage"
          className="
             min-w-[80px] h-10 px-2 m-2
             rounded-xl border border-[#040303] bg-white
             [box-shadow:-2px_-2px_0px_1px_rgba(0,0,0,0.5)_inset]
             flex items-center justify-center
             text-[#070707] text-center font-[400] text-2xl leading-none
             font-[NeoDunggeunmo_Pro]
          "
        >
          BACK
        </Link>
      </div>
      {/* 메인 컨테이너 */}
      <div
        className="
          flex flex-col items-center
          h-full overflow-hidden
        "
      >
        {/* 실제 탭 + 내용 */}
        <FishTankTabs />
      </div>
    </div>
  );
}

// "use client";

// import styles from "@/styles/mypage-fishtank.module.css";
// import { useState } from "react";
// import Link from "next/link";
// import Image from "next/image";

// export default function myFishTank() {
//   const [selectedTab, setSelectedTab] = useState("one");

//   // 도감 이미지 임시.
//   const images = [
//     "대표이미지샘플 (2).png",
//     "대표이미지샘플 (3).png",
//     "대표이미지샘플 (4).png",
//     "대표이미지샘플 (5).png",
//     "대표이미지샘플 (6).png",
//     "대표이미지샘플 (7).png",
//     "대표이미지샘플 (8).png",
//     "대표이미지샘플 (9).png",
//     "대표이미지샘플 (10).png",
//   ];
//   return (
//     <div
//       className="
//         flex
//         min-h-screen
//         bg-[url('/images/배경샘플.png')]
//         bg-cover bg-center bg-no-repeat"
//     >
//       <div className="flex flex-col justify-between m2">
//         {/* 돌아가기 등 버튼 */}
//         <Link
//           href="/mypage"
//           className="
//             min-w-[80px] h-10 px-2
//             rounded-xl border border-[#040303] bg-white
//             [box-shadow:-2px_-2px_0px_1px_rgba(0,0,0,0.5)_inset]
//             flex items-center justify-center
//             text-[#070707] text-center font-[400] text-2xl leading-none
//             font-[NeoDunggeunmo_Pro]
//         "
//         >
//           BACK
//         </Link>
//       </div>
//       {/* 어항별 탭 선택 */}
//       <div className={styles.wrapper}>
//         <div>
//           <button
//             className={`
//                             relative left-[30px]
//                             cursor-pointer inline-flex items-center justify-center
//                             w-[150px] h-10 px-[20px] py-[10px] m-1
//                             rounded-t-xl border-t border-r border-l border-[#1c5e8d]
//                             bg-[#f0f0f0]
//                             [box-shadow:-1px_0px_0px_2px_rgba(0,0,0,0.25)_inset]
//                             text-[#070707] text-2xl font-[NeoDunggeunmo_Pro] font-normal leading-normal
//                             ${selectedTab === "one" ? "bg-[#31a9ff] text-black border-t-[3px] border-black" : ""}
//                           `}
//             onClick={() => setSelectedTab("one")}
//           >
//             어항 1
//           </button>
//           <button
//             className={`
//                             relative left-[30px]
//                             cursor-pointer inline-flex items-center justify-center
//                             w-[150px] h-10 px-[20px] py-[10px] m-1
//                             rounded-t-xl border-t border-r border-l border-[#1c5e8d]
//                             bg-[#f0f0f0]
//                             [box-shadow:-1px_0px_0px_2px_rgba(0,0,0,0.25)_inset]
//                             text-[#070707] text-2xl font-[NeoDunggeunmo_Pro] font-normal leading-normal
//                             ${selectedTab === "two" ? "bg-[#31a9ff] text-black border-t-[3px] border-black" : ""}
//                           `}
//             onClick={() => setSelectedTab("two")}
//           >
//             어항 2
//           </button>
//         </div>
//         <button
//           className="
//                 min-w-[80px] h-10 px-2
//                 rounded-xl border border-[#040303] bg-white
//                 [box-shadow:-2px_-2px_0px_1px_rgba(0,0,0,0.5)_inset]
//                 flex items-center justify-center
//                 text-[#070707] text-center font-[400] text-2xl
//                 font-[NeoDunggeunmo_Pro]
//               "
//         >
//           완료
//         </button>

//         {/* 목록 불러오기 */}
//         <div
//           className="
//               w-[1300px] h-screen m-0 p-5
//               rounded-xl border-2 border-[#1c5e8d] bg-[#31a9ff]
//               [box-shadow:-2px_-2px_0px_1px_rgba(0,0,0,0.25)_inset]
//               flex flex-col items-center
//             "
//         >
//           {/* 스크롤 영역 */}
//           <div className="flex-1 overflow-y-auto bg-white w-full h-full rounded-[30px]">
//             <div className="bg-white overflow-hidden">
//               {selectedTab === "one" && (
//                 <div className="flex flex-wrap" id="one-panel">
//                   {/* 총 50개의 빈 칸 만들기 */}
//                   {Array(50)
//                     .fill(null)
//                     .map((_, index) => {
//                       // index에 해당하는 이미지가 있으면 쓰고, 없으면 배경 샘플
//                       const imageSrc = images[index] ? `/images/${images[index]}` : `/images/배경샘플.png`;
//                       return (
//                         <div
//                           key={index}
//                           className="
//                           flex flex-col m-2
//                           text-[1.5em] font-bold
//                           items-center
//                         "
//                         >
//                           <div
//                             className="
//                         w-[150px] h-[150px]
//                         flex items-center justify-center
//                         border border-black bg-white
//                         [box-shadow:-2px_-2px_0px_1px_rgba(0,0,0,0.5)_inset]
//                       "
//                           >
//                             <Image
//                               src={imageSrc}
//                               alt={`대표 이미지 ${index}`}
//                               width={130}
//                               height={130}
//                               style={{ objectFit: "cover" }}
//                             />{" "}
//                           </div>
//                           <div
//                             className="
//                                 flex items-end gap-2 text-[20px]
//                                 font-[NeoDunggeunmo_Pro] text-black mt-1
//                               "
//                           >
//                             <p>거북이 {index + 1}</p>
//                             <p className="text-[15px] text-gray-500">x 11</p>
//                           </div>
//                         </div>
//                       );
//                     })}
//                   <div className={`${styles["panel-title"]} ${styles["portrait-container"]}`}>
//                     <div className={styles.portrait}>
//                       <Image
//                         src="/images/대표이미지샘플.png"
//                         alt="대표 이미지"
//                         width={130}
//                         height={130}
//                         style={{ objectFit: "cover" }}
//                       />{" "}
//                     </div>
//                   </div>
//                 </div>
//               )}
//               {selectedTab === "two" && (
//                 <div className={`${styles.panel} ${styles["two-panel"]}`}>
//                   <div className={`${styles["panel-title"]} ${styles["portrait-container"]}`}>
//                     <div className={styles.portrait}>
//                       <Image
//                         src="/images/대표이미지샘플.png"
//                         alt="대표 이미지"
//                         width={130}
//                         height={130}
//                         style={{ objectFit: "cover" }}
//                       />{" "}
//                     </div>
//                     <div className={styles["portrait-text"]}>
//                       <p>거북이</p>
//                       <p className={styles["how-many"]}>x 111</p>
//                     </div>
//                   </div>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
