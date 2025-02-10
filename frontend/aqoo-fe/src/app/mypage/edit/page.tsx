"use client";

import React, { useEffect, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

import InputField from "./InputField";
import LoginButton from "./LoginButton";
import Buttons from "./Buttons";
import PasswordChangeModal from "./PasswordChangeModal";
import DeleteAccountModal from "./DeleteAccountModal";

import Image from "next/image";
import Link from "next/link";

interface ProfileFormInputs {
  nickname: string;
}

export default function EditProfilePage() {
  const { register, handleSubmit, setValue } = useForm<ProfileFormInputs>();
  const { fetchUser, auth } = useAuth();
  const router = useRouter();
  const [userData, setUserData] = useState<{
    id: string;
    email: string;
    nickname: string;
    mainFishImage: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const response = await fetch(`/api/v1/users/${auth.user?.id}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("유저 정보를 불러오는데 실패했습니다.");
        }

        const user = await response.json();
        setUserData(user);
        setValue("nickname", user.nickname || "");
      } catch (error) {
        console.error("Failed to fetch user data", error);
      }
    };
    fetchUserData();
  }, [setValue]);

  const onSubmit: SubmitHandler<ProfileFormInputs> = async (data) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch("/api/v1/users", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: userData?.id || "",
          nickname: data.nickname,
          mainFishImage: userData?.mainFishImage || "",
        }),
      });

      if (!response.ok) {
        throw new Error("회원 정보 수정 실패");
      }

      await fetchUser();
      alert("회원 정보 수정 성공!");
      router.push("/profile");
    } catch (error) {
      alert(error.message || "회원 정보 수정 실패");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
    // test
  };

  return (
    <div
      className="
        flex 
        h-screen 
        bg-[url('/images/배경샘플.png')] 
        bg-cover bg-center bg-no-repeat
        relative
        justify-center
        "
    >
      {/* 버튼 위치 지정 */}
      <div className="absolute top-0 left-0 m-2">
        <Buttons text="BACK" />
      </div>
      <div className="absolute bottom-0 right-0 m-2">
        <Buttons text="완료" />
      </div>

      <div
        className="
          flex justify-center items-center
          h-screen w-screen bg-cover bg-center
        "
      >
        <div className="flex-1 flex flex-col items-center">
          <div
            className="
                  w-[250px] h-[250px] flex-shrink-0
                  flex items-center justify-center
                  rounded-xl border border-black bg-white
                  [box-shadow:-2px_-2px_0px_1px_rgba(0,0,0,0.5)_inset]
                  mb-10
                "
          >
            {/* 실제 초상화 */}
            <div
              className="
                      w-[220px] h-[220px] flex-shrink-0
                      flex items-center justify-center
                      rounded-xl border border-black bg-white
                      [box-shadow:1px_1px_0px_1px_rgba(0,0,0,0.25)_inset]
                    "
            >
              {userData?.mainFishImage ? (
                <Image src={userData.mainFishImage} alt="대표 물고기" className="w-24 h-24 object-cover rounded-md" />
              ) : (
                <p className="text-gray-500">로딩 중...</p>
              )}
            </div>
          </div>
          <Link
            href={"/mypage"}
            className="            m-1 p-1
            min-w-[200px] h-[40px] px-2
            flex items-center justify-center
            rounded-xl border border-[#040303] bg-white 
            [box-shadow:-2px_-2px_0px_1px_rgba(0,0,0,0.5)_inset]
            text-[#070707] text-center font-[400] text-xl
            "
          >
            대표 물고기 변경
          </Link>
        </div>
        <div className="flex-1">
          <div className="bg-white p-8 rounded-2xl shadow-lg w-[450px]">
            <h2 className="text-center text-3xl mb-6">회원정보 수정</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-gray-700 font-medium mb-1">아이디</label>
                <div className="bg-gray-200 px-3 py-2 rounded-md text-gray-700">{userData?.id || "로딩 중..."}</div>
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-1">이메일</label>
                <div className="bg-gray-200 px-3 py-2 rounded-md text-gray-700">{userData?.email || "로딩 중..."}</div>
              </div>

              <InputField
                label="닉네임"
                placeholder={userData?.nickname || "닉네임 입력"}
                register={register("nickname", { required: true })}
              />
            </form>
            <div className="flex justify-between gap-4 mt-4">
              <LoginButton
                text="비밀번호 변경"
                isLoading={isLoading}
                color="blue"
                onClick={() => setIsPasswordModalOpen(true)}
              />
              <LoginButton
                text="회원 탈퇴"
                isLoading={isLoading}
                color="red"
                onClick={() => setIsDeleteModalOpen(true)}
              />
              {isPasswordModalOpen && <PasswordChangeModal onClose={() => setIsPasswordModalOpen(false)} />}
              {isDeleteModalOpen && <DeleteAccountModal onClose={() => setIsDeleteModalOpen(false)} />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// "use client";

// import React, { useEffect, useState } from "react";
// import { useForm, SubmitHandler } from "react-hook-form";
// import { useAuth } from "@/hooks/useAuth";
// import { useRouter } from "next/navigation";
// import InputField from "./InputField";
// import LoginButton from "./Buttons";

// interface ProfileFormInputs {
//   nickname: string;
// }

// export default function EditProfilePage() {
//   const { register, handleSubmit, setValue } = useForm<ProfileFormInputs>();
//   const { getUser, updateProfile } = useAuth();
//   const router = useRouter();
//   const [userData, setUserData] = useState<{
//     userId: string;
//     userNickName: string;
//     mainFishImage: string;
//     userEmail: string;
//   } | null>(null);
//   const [isLoading, setIsLoading] = useState(false);

//   useEffect(() => {
//     const fetchUserData = async () => {
//       try {
//         const user = await getUser();
//         setUserData(user);
//         setValue("nickname", user.userNickName);
//       } catch (error) {
//         console.error("Failed to fetch user data", error);
//       }
//     };
//     fetchUserData();
//   }, [setValue]);

//   const onSubmit: SubmitHandler<ProfileFormInputs> = async (data) => {
//     setIsLoading(true);
//     try {
//       await updateProfile({
//         userId: userData?.userId || "",
//         userEmail: userData?.userEmail || "",
//         userNickName: data.nickname,
//         mainFishImage: userData?.mainFishImage || "",
//       });
//       alert("회원 정보 수정 성공!");
//       router.push("/profile");
//     } catch (error) {
//       alert("회원 정보 수정 실패");
//       console.error(error);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div
//       className="flex justify-center items-center h-screen bg-cover bg-center"
//       style={{ backgroundImage: "url('/ocean-background.jpg')" }}
//     >
//       <div className="bg-white p-8 rounded-2xl shadow-lg w-96">
//         <h2 className="text-center text-2xl font-bold mb-6">회원정보 수정</h2>
//         <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
//           {/* 아이디 필드 (비활성화) */}
//           <InputField
//             label="아이디"
//             placeholder={userData?.userId || "로딩 중..."}
//             register={{ disabled: true }}
//             className="bg-gray-200"
//           />

//           {/* 이메일 필드 (비활성화) */}
//           <InputField
//             label="이메일"
//             placeholder={userData?.userEmail || "로딩 중..."}
//             register={{ disabled: true }}
//             className="bg-gray-200"
//           />

//           {/* 닉네임 수정 필드 */}
//           <InputField
//             label="닉네임"
//             placeholder={userData?.userNickName || "닉네임 입력"}
//             register={register("nickname", { required: true })}
//           />

//           <LoginButton text="정보 수정" isLoading={isLoading} />
//         </form>
//       </div>
//     </div>
//   );
// }
