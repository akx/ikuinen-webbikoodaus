import React from "react";

export const LabeledInput: React.FC<React.InputHTMLAttributes<
  HTMLInputElement
> & {
  label: React.ReactNode;
  suffix?: React.ReactNode;
}> = ({ label, suffix, ...props }) => (
  <label>
    {label}: <input {...props} /> {suffix}
  </label>
);
