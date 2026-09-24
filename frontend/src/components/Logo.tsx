import React from 'react';

interface LogoProps {
  className?: string;
  variant?: 'horizontal' | 'icon';
}

export function Logo({ className = '', variant = 'horizontal' }: LogoProps) {
  const icon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      className={`shrink-0 ${variant === 'icon' ? 'w-full h-full' : 'w-8 h-8'}`}
      fill="none"
      aria-hidden="true"
    >
      {/* Deep Navy Shield Base */}
      <path
        d="M50 5C50 5 25 15 15 15C15 45 25 75 50 95C75 75 85 45 85 15C75 15 50 5 50 5Z"
        fill="#0F172A"
      />
      {/* Cyan/Blue Technology Accent / Document element */}
      <path
        d="M35 30H65V60C65 60 50 75 35 60V30Z"
        fill="#06B6D4"
        fillOpacity="0.8"
      />
      {/* AI Circuit Node / Lens */}
      <circle cx="50" cy="45" r="10" fill="#0F172A" />
      <circle cx="50" cy="45" r="4" fill="#38BDF8" />
      <line x1="50" y1="20" x2="50" y2="35" stroke="#38BDF8" strokeWidth="2" strokeDasharray="2 2" />
      <line x1="30" y1="45" x2="40" y2="45" stroke="#38BDF8" strokeWidth="2" strokeDasharray="2 2" />
      <line x1="60" y1="45" x2="70" y2="45" stroke="#38BDF8" strokeWidth="2" strokeDasharray="2 2" />
      <line x1="50" y1="55" x2="50" y2="70" stroke="#38BDF8" strokeWidth="2" strokeDasharray="2 2" />
    </svg>
  );

  if (variant === 'icon') {
    return <div className={className}>{icon}</div>;
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {icon}
      <span className="font-bold text-xl tracking-tight text-white whitespace-nowrap">
        LegalLens AI
      </span>
    </div>
  );
}
