import React, { useEffect, useState } from 'react';
import { CharacterGender } from '../types/game';

interface EngineerCharacterProps {
  gender: CharacterGender;
  action: 'idle' | 'typing' | 'mounting' | 'running' | 'celebrating';
  facingDir: 1 | -1;
  crisisActive?: boolean;
  className?: string;
}

// Memory cache for transparent cutouts so we only process once per session
const spriteCache: Record<string, string> = {};

export const EngineerCharacter: React.FC<EngineerCharacterProps> = ({
  gender,
  action,
  facingDir,
  crisisActive = false,
  className = '',
}) => {
  const isFemale = gender === 'female';
  const isRunning = action === 'running';
  const isTyping = action === 'typing';
  const isMounting = action === 'mounting';
  const isCelebrating = action === 'celebrating';

  const rawSrc = isFemale
    ? '/assets/aistudio/chibi_female.jpg'
    : '/assets/aistudio/chibi_male.jpg';

  const [transparentSrc, setTransparentSrc] = useState<string>(spriteCache[rawSrc] || rawSrc);

  // Remove white background to create pristine transparent game sprite
  useEffect(() => {
    if (spriteCache[rawSrc]) {
      setTransparentSrc(spriteCache[rawSrc]);
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = rawSrc;
    img.onload = () => {
      try {
        const offscreen = document.createElement('canvas');
        offscreen.width = img.naturalWidth || img.width;
        offscreen.height = img.naturalHeight || img.height;
        const ctx = offscreen.getContext('2d');
        if (!ctx) return;

        ctx.drawImage(img, 0, 0);
        const imgData = ctx.getImageData(0, 0, offscreen.width, offscreen.height);
        const data = imgData.data;

        // Flood-remove pure white and near-white pixels from outer borders
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];

          // If pixel is white background
          if (r > 240 && g > 240 && b > 240) {
            data[i + 3] = 0; // Transparent
          } else if (r > 225 && g > 225 && b > 225) {
            // Soft anti-aliased edge
            const alphaFactor = (255 - Math.max(r, g, b)) / 30;
            data[i + 3] = Math.floor(data[i + 3] * Math.max(0, Math.min(1, alphaFactor)));
          }
        }

        ctx.putImageData(imgData, 0, 0);
        const dataUrl = offscreen.toDataURL('image/png');
        spriteCache[rawSrc] = dataUrl;
        setTransparentSrc(dataUrl);
      } catch {
        // Fallback to original image if canvas security blocks
        setTransparentSrc(rawSrc);
      }
    };
  }, [rawSrc]);

  return (
    <div
      className={`relative inline-block select-none pointer-events-auto transition-transform duration-200 ${className}`}
      style={{
        transform: `scaleX(${facingDir})`,
        transformOrigin: 'bottom center',
      }}
    >
      <style>{`
        @keyframes charSprintBounce {
          0%, 100% { transform: translateY(0) rotate(4deg); }
          50% { transform: translateY(-7px) rotate(8deg); }
        }
        @keyframes charTypeBob {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-2px); }
        }
        @keyframes charMountPush {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(6px); }
        }
        @keyframes charVictoryCheer {
          0%, 100% { transform: translateY(0) scale(1); }
          40% { transform: translateY(-10px) scale(1.05); }
          60% { transform: translateY(-10px) scale(1.05); }
        }
        @keyframes charIdleFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-2px); }
        }
      `}</style>

      {/* Soft Ambient Floor Shadow */}
      <div
        className="absolute bottom-1 left-1/2 -translate-x-1/2 w-3/4 h-3 rounded-full bg-black/40 blur-[3px] pointer-events-none transition-all"
        style={{
          transform: isRunning ? 'scale(0.85)' : isCelebrating ? 'scale(0.75)' : 'scale(1)',
        }}
      />

      {/* The High-Quality Cute Anime Chibi Sprite */}
      <div
        className="relative w-full h-full flex items-end justify-center"
        style={{
          animation: isRunning
            ? 'charSprintBounce 0.32s ease-in-out infinite'
            : isTyping
            ? 'charTypeBob 0.6s ease-in-out infinite'
            : isMounting
            ? 'charMountPush 1.3s ease-in-out infinite'
            : isCelebrating
            ? 'charVictoryCheer 0.65s ease-in-out infinite'
            : 'charIdleFloat 2.8s ease-in-out infinite',
        }}
      >
        <img
          src={transparentSrc}
          alt={isFemale ? 'Maya - Network Architect' : 'Rian - System Administrator'}
          className="w-full h-auto object-contain max-h-full drop-shadow-[0_8px_14px_rgba(0,0,0,0.55)] pointer-events-none"
          draggable={false}
        />

        {/* Action Props & Emotes */}
        {crisisActive && (
          <div className="absolute -top-3 right-0 bg-red-600 text-white font-black text-[9px] px-1.5 py-0.5 rounded-full shadow-lg border border-red-400 animate-bounce">
            🚨 PANIK!
          </div>
        )}

        {isCelebrating && (
          <div className="absolute -top-4 inset-x-0 flex justify-center text-xs animate-pulse">
            ✨🎉✨
          </div>
        )}
      </div>
    </div>
  );
};
