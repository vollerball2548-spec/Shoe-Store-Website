import React from 'react';

interface SpeedStrideLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export const SpeedStrideLogo: React.FC<SpeedStrideLogoProps> = ({ 
  className = '', 
  size = 'md',
  showText = true 
}) => {
  const iconSizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-16 h-16'
  };

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Winged Running Shoe Icon */}
      <div className={`relative ${iconSizes[size]} rounded-2xl bg-gradient-to-br from-blue-600 via-sky-500 to-indigo-700 p-0.5 flex items-center justify-center shadow-lg shadow-sky-950/50 flex-shrink-0 group-hover:scale-105 transition-transform`}>
        <div className="w-full h-full bg-zinc-950 rounded-[14px] flex items-center justify-center p-1.5 overflow-hidden relative">
          {/* Glowing background hint */}
          <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/30 to-sky-400/20 pointer-events-none" />

          {/* SVG Winged Sneaker with Speed Streaks */}
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_2px_8px_rgba(56,189,248,0.5)]" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Speed Wind Streaks */}
            <path d="M5 60 C18 60 28 62 42 63" stroke="#38BDF8" strokeWidth="3" strokeLinecap="round" opacity="0.6"/>
            <path d="M12 70 C24 70 34 71 52 71" stroke="#0284C7" strokeWidth="3.5" strokeLinecap="round"/>
            <path d="M18 78 C30 78 40 78 60 78" stroke="#1E40AF" strokeWidth="3" strokeLinecap="round"/>

            {/* Wing Feathers Swooshing from Sneaker Collar */}
            <path d="M22 30 C30 38 35 48 38 58 C32 50 28 42 22 30 Z" fill="#1D4ED8" stroke="#60A5FA" strokeWidth="1.5"/>
            <path d="M28 22 C40 34 46 46 48 56 C40 46 34 36 28 22 Z" fill="#2563EB" stroke="#93C5FD" strokeWidth="1.5"/>
            <path d="M36 16 C50 30 56 42 58 54 C48 42 42 30 36 16 Z" fill="#38BDF8" stroke="#E0F2FE" strokeWidth="1.5"/>

            {/* Sneaker Collar & Tongue */}
            <path d="M42 32 L48 42 L56 36 L62 45 L58 52" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>

            {/* Sneaker Upper Body */}
            <path d="M42 42 C50 42 58 46 66 52 C74 58 84 62 92 65 C88 72 78 76 68 76 C52 76 40 70 34 62 C34 52 38 45 42 42 Z" 
                  fill="#0F172A" stroke="#38BDF8" strokeWidth="3" strokeLinejoin="round"/>

            {/* Blue Midsole Flow Waves */}
            <path d="M36 64 C46 67 60 69 76 68 C84 67.5 88 66 88 66" stroke="#60A5FA" strokeWidth="3" strokeLinecap="round"/>
            <path d="M38 70 C48 73 64 74 82 72" stroke="#38BDF8" strokeWidth="3.5" strokeLinecap="round"/>

            {/* Laces Accents */}
            <line x1="58" y1="46" x2="62" y2="43" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round"/>
            <line x1="63" y1="50" x2="68" y2="47" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round"/>
            <line x1="68" y1="54" x2="74" y2="51" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round"/>

            {/* Toe Cap Gloss */}
            <path d="M84 64 C88 65 91 67 89 70 C86 71 82 70 80 69" stroke="#E0F2FE" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>
      </div>

      {/* Brand Typography */}
      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="font-black text-xl tracking-tight text-white uppercase italic">
              SPEED<span className="text-sky-400">STRIDE</span>
            </span>
          </div>
          <span className="text-[9px] font-black tracking-widest text-zinc-400 uppercase -mt-1 font-mono">
            PREMIUM FOOTWEAR CO.
          </span>
        </div>
      )}
    </div>
  );
};
