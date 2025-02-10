import React from "react";
import { UseFormRegisterReturn } from "react-hook-form";

// varient: "dynamic"(입력창) | "static"(고정창)
interface InputFieldProps {
  label: string;
  type?: string;
  placeholder?: string;
  register?: UseFormRegisterReturn;
  disabled?: boolean;
  variant?: "dynamic" | "static";
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  type = "text",
  placeholder,
  register,
  disabled = false,
  variant = "dynamic",
}) => {
  const variantClasses = { dynamic: "", static: "bg-gray-200" };

  return (
    <div>
      <label className="block text-gray-700 font-medium mb-1">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        disabled={disabled}
        {...(register ? register : {})}
        className={`
          w-full px-3 py-2
          border border-gray-300 rounded-md
          focus:outline-none focus:ring focus:ring-blue-200
          ${variantClasses[variant]}`}
      />
    </div>
  );
};

export default InputField;
