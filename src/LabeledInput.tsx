import React from "react";

export const LabeledInput: React.FC<React.InputHTMLAttributes<
  HTMLInputElement
> & {
  label: React.ReactNode;
}> = ({ label, ...props }) => (
  <label>
    {label}: <input {...props} />
  </label>
);
