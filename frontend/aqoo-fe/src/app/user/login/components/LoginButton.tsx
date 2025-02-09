import { ReactNode } from "react";

interface LoginButtonProps {
  text: string;
  onClick?: () => void;
  isLoading?: boolean;
  color?: "blue" | "white" | "green";
  icon?: ReactNode;
  type?: "button" | "submit";
}

export default function LoginButton({
  text,
  onClick,
  isLoading,
  color = "blue",
  icon,
  type = "submit",
}: LoginButtonProps) {
  const colorClasses = {
    blue: "bg-blue-700 text-white hover:bg-blue-800",
    white: "bg-white text-gray-800 border border-gray-300 hover:bg-gray-100",
    green: "bg-[#03C75A] text-white hover:bg-green-700",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isLoading}
      className={`w-full flex items-center justify-center gap-2 p-3 rounded-lg transition ${colorClasses[color]} ${
        isLoading ? "opacity-50 cursor-not-allowed" : ""
      }`}
    >
      {icon && <span>{icon}</span>}
      <span>{isLoading ? "처리 중..." : text}</span>
    </button>
  );
}
