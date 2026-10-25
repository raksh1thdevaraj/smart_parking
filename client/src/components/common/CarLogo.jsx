import React from 'react';

/**
 * Premium Animated Front-View Cyber Car Logo
 * Features:
 * - Precision-engineered front-view supercar silhouette
 * - Dual neon LED DRL headlights with pulsating light beams
 * - Subtle aerodynamic hood reflection shimmer
 * - Sleek cyber-transit neon glow ring
 */
export function CarLogo({ className = 'w-11 h-11', animated = true }) {
  return (
    <div className={`relative flex items-center justify-center group ${className}`}>
      {/* Ambient Pulsing Backlight Halo */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-blue-500/20 via-indigo-500/15 to-emerald-400/20 blur-md group-hover:blur-lg transition-all duration-500 -z-10 animate-pulse" />

      {/* Main Glass Icon Container */}
      <div className="w-full h-full rounded-2xl bg-white border border-blue-200/90 p-1.5 flex items-center justify-center shadow-[0_4px_16px_rgba(37,99,235,0.12)] group-hover:border-blue-400 group-hover:shadow-[0_6px_22px_rgba(37,99,235,0.22)] transition-all duration-300 overflow-hidden relative">
        
        {/* Subtle animated scanline / headlight beam sweep */}
        {animated && (
          <div className="absolute -inset-full bg-gradient-to-b from-transparent via-blue-400/15 to-transparent pointer-events-none animate-car-scan" />
        )}

        <svg
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-[0_2px_8px_rgba(0,240,255,0.5)]"
        >
          <defs>
            {/* Body metallic gradient */}
            <linearGradient id="carBodyGrad" x1="32" y1="14" x2="32" y2="52" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#38BDF8" />
              <stop offset="45%" stopColor="#0284C7" />
              <stop offset="85%" stopColor="#0369A1" />
              <stop offset="100%" stopColor="#075985" />
            </linearGradient>

            {/* Windshield dark gloss */}
            <linearGradient id="windshieldGrad" x1="32" y1="16" x2="32" y2="30" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#0B132B" />
              <stop offset="100%" stopColor="#1C2D4E" />
            </linearGradient>

            {/* Headlight Neon Cyan Glow */}
            <linearGradient id="headlightNeon" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#E0F2FE" />
              <stop offset="40%" stopColor="#38BDF8" />
              <stop offset="100%" stopColor="#00F0FF" />
            </linearGradient>

            {/* Headlight Light Cones (Forward Projection) */}
            <linearGradient id="lightConeLeft" x1="20" y1="40" x2="14" y2="58" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#00F0FF" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#00F0FF" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="lightConeRight" x1="44" y1="40" x2="50" y2="58" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#00F0FF" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#00F0FF" stopOpacity="0" />
            </linearGradient>

            {/* Filter for glowing headlights */}
            <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="1.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* PROJECTED HEADLIGHT BEAMS */}
          <polygon
            points="18,39 8,56 22,54 22,39"
            fill="url(#lightConeLeft)"
            className={animated ? 'animate-pulse' : ''}
          />
          <polygon
            points="46,39 42,39 42,54 56,56"
            fill="url(#lightConeRight)"
            className={animated ? 'animate-pulse' : ''}
          />

          {/* TIRES / WIDE STANCE WHEELS (Left & Right) */}
          <rect x="7" y="38" width="6" height="13" rx="3" fill="#0F172A" stroke="#334155" strokeWidth="1" />
          <rect x="51" y="38" width="6" height="13" rx="3" fill="#0F172A" stroke="#334155" strokeWidth="1" />

          {/* SIDE MIRRORS */}
          {/* Left Mirror */}
          <path
            d="M12 26 C9 26, 7 28, 8 30 C9 32, 13 31, 15 29 Z"
            fill="#0284C7"
            stroke="#38BDF8"
            strokeWidth="0.8"
          />
          {/* Right Mirror */}
          <path
            d="M52 26 C55 26, 57 28, 56 30 C55 32, 51 31, 49 29 Z"
            fill="#0284C7"
            stroke="#38BDF8"
            strokeWidth="0.8"
          />

          {/* CABIN / ROOF ARCH */}
          <path
            d="M20 22 C22 15, 25 13, 32 13 C39 13, 42 15, 44 22 Z"
            fill="#0F172A"
            stroke="#38BDF8"
            strokeWidth="1.2"
          />

          {/* WINDSHIELD */}
          <path
            d="M21 23 L24 16 C25 15, 30 14.5, 32 14.5 C34 14.5, 39 15, 40 16 L43 23 Z"
            fill="url(#windshieldGrad)"
            stroke="#0284C7"
            strokeWidth="0.8"
          />
          {/* Windshield subtle glass reflection streak */}
          <path
            d="M26 16 L23 23 L25 23 L28 16 Z"
            fill="white"
            fillOpacity="0.25"
          />

          {/* MAIN LOWER BODY CHASSIS */}
          <path
            d="M12 36 C12 31, 16 27, 21 26 L43 26 C48 27, 52 31, 52 36 L53 43 C53 46, 50 48, 46 48 L18 48 C14 48, 11 46, 11 43 Z"
            fill="url(#carBodyGrad)"
            stroke="#38BDF8"
            strokeWidth="1.2"
          />

          {/* HOOD SCULPT LINES (Aerodynamic creases) */}
          <path d="M26 26 L24 35" stroke="#7DD3FC" strokeWidth="1" strokeLinecap="round" />
          <path d="M38 26 L40 35" stroke="#7DD3FC" strokeWidth="1" strokeLinecap="round" />
          {/* Center Hood Spine */}
          <path d="M32 24 L32 36" stroke="#0284C7" strokeWidth="0.8" strokeLinecap="round" opacity="0.6" />

          {/* LOWER FRONT GRILLE / AIR DAM */}
          <rect x="22" y="42" width="20" height="4.5" rx="2" fill="#0B132B" stroke="#0284C7" strokeWidth="0.8" />
          {/* Grille mesh vertical accents */}
          <line x1="27" y1="43" x2="27" y2="46" stroke="#38BDF8" strokeWidth="0.8" opacity="0.7" />
          <line x1="32" y1="43" x2="32" y2="46" stroke="#38BDF8" strokeWidth="0.8" opacity="0.7" />
          <line x1="37" y1="43" x2="37" y2="46" stroke="#38BDF8" strokeWidth="0.8" opacity="0.7" />

          {/* FRONT SPLITTER / SKIRT (Bottom Aero Lip) */}
          <path
            d="M14 48 L50 48 L52 50.5 L12 50.5 Z"
            fill="#0F172A"
            stroke="#00F0FF"
            strokeWidth="0.9"
          />

          {/* HIGH-INTENSITY ANGULAR LED HEADLIGHTS (DRLs) */}
          {/* Left Headlight Housing & Bulb */}
          <path
            d="M14 36 L22 36 L20 39.5 L13 38.5 Z"
            fill="url(#headlightNeon)"
            filter="url(#neonGlow)"
            className={animated ? 'animate-pulse' : ''}
          />
          <circle cx="17" cy="37.5" r="1.3" fill="#FFFFFF" />

          {/* Right Headlight Housing & Bulb */}
          <path
            d="M50 36 L42 36 L44 39.5 L51 38.5 Z"
            fill="url(#headlightNeon)"
            filter="url(#neonGlow)"
            className={animated ? 'animate-pulse' : ''}
          />
          <circle cx="47" cy="37.5" r="1.3" fill="#FFFFFF" />

          {/* CENTER EMBLEM / SMART LOGO ACCENT */}
          <polygon
            points="32,32 34,35 32,38 30,35"
            fill="#00F0FF"
            stroke="#FFFFFF"
            strokeWidth="0.5"
            filter="url(#neonGlow)"
          />
        </svg>
      </div>
    </div>
  );
}
