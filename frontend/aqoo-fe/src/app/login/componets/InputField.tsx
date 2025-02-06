import React from 'react';
import { UseFormRegisterReturn } from 'react-hook-form';

interface InputFieldProps {
  label: string;
  type?: string;
  placeholder?: string;
  register: UseFormRegisterReturn;
}

const InputField: React.FC<InputFieldProps> = ({ label, type = 'text', placeholder, register }) => {
  return (
    <div>
      <label className="block text-gray-700 font-medium mb-1">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        {...register}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-200"
      />
    </div>
  );
};

export default InputField;