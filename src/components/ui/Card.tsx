import { type HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function Card({ className = "", children, ...props }: CardProps) {
  return (
    <div
      className={`rounded-lg bg-white border border-slate-200 shadow-sm ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
