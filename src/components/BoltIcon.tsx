import React from 'react';

interface BoltIconProps {
  className?: string;
  size?: number;
}

export const BoltIcon: React.FC<BoltIconProps> = ({ className = '', size = 52 }) => {
  return (
    <div
      style={{ width: size, height: size }}
      className={`relative flex items-center justify-center rounded-2xl bg-gradient-to-b from-[#1f242c] to-[#111317] p-2 shadow-lg border border-[#2d333e] flex-shrink-0 select-none overflow-hidden ${className}`}
      aria-label="Bolt Logo"
    >
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full drop-shadow-[0_2px_8px_rgba(16,185,129,0.4)]"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="boltGradInner" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#34d399" />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>
        </defs>
        
        {/* Top-left angled wedge */}
        <path d="M 28 20 L 52 20 L 28 44 Z" fill="url(#boltGradInner)" />
        
        {/* Middle diagonal slash bar */}
        <path
          d="M 58 20 L 70 20 C 75 20 78 23 78 28 C 78 32 75 35 71 37 L 28 80 L 28 62 L 60 30 L 46 30 L 58 20 Z"
          fill="url(#boltGradInner)"
        />
        
        {/* Bottom diagonal and curved loop */}
        <path
          d="M 64 47 C 73 50 78 57 78 66 C 78 75 70 80 60 80 L 35 80 L 64 51 C 64 49 64 48 64 47 Z"
          fill="url(#boltGradInner)"
        />
      </svg>
    </div>
  );
};
