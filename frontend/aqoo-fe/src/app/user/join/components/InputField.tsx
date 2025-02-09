"use client";

import React from "react";

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const InputField: React.FC<InputFieldProps> = ({ label, error, ...inputProps }) => {
  return (
    <div>
      <label className="block text-sm font-semibold text-blue-800">
        {label}
      </label>
      <input
        {...inputProps}
        className={`mt-1 block w-full px-3 py-2 border border-blue-300 rounded-lg placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring focus:ring-blue-200 transition ${
          inputProps.disabled ? "bg-gray-100 cursor-not-allowed" : "bg-white"
        }`}
      />
      {error && <span className="text-red-500 text-xs">{error}</span>}
    </div>
  );
};
