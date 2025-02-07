"use client";

import React, { useEffect, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import InputField from "./InputField";
import LoginButton from "./Buttons";

interface ProfileFormInputs {
  nickname: string;
}

export default function EditProfilePage() {
  const { register, handleSubmit, setValue } = useForm<ProfileFormInputs>();
  const { getUser, updateProfile } = useAuth();
  const router = useRouter();
  const [userData, setUserData] = useState<{
    userId: string;
    userNickName: string;
    mainFishImage: string;
    userEmail: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = await getUser();
        setUserData(user);
        setValue("nickname", user.userNickName);
      } catch (error) {
        console.error("Failed to fetch user data", error);
      }
    };
    fetchUserData();
  }, [setValue]);

  const onSubmit: SubmitHandler<ProfileFormInputs> = async (data) => {
    setIsLoading(true);
    try {
      await updateProfile({
        userId: userData?.userId || "",
        userEmail: userData?.userEmail || "",
        userNickName: data.nickname,
        mainFishImage: userData?.mainFishImage || "",
      });
      alert("회원 정보 수정 성공!");
      router.push("/profile");
    } catch (error) {
      alert("회원 정보 수정 실패");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="flex justify-center items-center h-screen bg-cover bg-center"
      style={{ backgroundImage: "url('/ocean-background.jpg')" }}
    >
      <div className="bg-white p-8 rounded-2xl shadow-lg w-96">
        <h2 className="text-center text-2xl font-bold mb-6">회원정보 수정</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* 아이디 필드 (비활성화) */}
          <InputField
            label="아이디"
            placeholder={userData?.userId || "로딩 중..."}
            register={{ disabled: true }}
            className="bg-gray-200"
          />

          {/* 이메일 필드 (비활성화) */}
          <InputField
            label="이메일"
            placeholder={userData?.userEmail || "로딩 중..."}
            register={{ disabled: true }}
            className="bg-gray-200"
          />

          {/* 닉네임 수정 필드 */}
          <InputField
            label="닉네임"
            placeholder={userData?.userNickName || "닉네임 입력"}
            register={register("nickname", { required: true })}
          />

          <LoginButton text="정보 수정" isLoading={isLoading} />
        </form>
      </div>
    </div>
  );
}
