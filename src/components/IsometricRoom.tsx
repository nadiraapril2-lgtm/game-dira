import React, { useEffect, useRef, useState } from 'react';
import { CharacterGender, GamePhase, OfficeLevel } from '../types/game';
import { Monitor, Sparkles, Edit3 } from 'lucide-react';
import { sound } from '../utils/audio';
import { EngineerCharacter } from './EngineerCharacter';

interface IsometricRoomProps {
  phase: GamePhase;
  officeLevel: OfficeLevel;
  tempC: number;
  trafficMBs: number;
  crisisActive: boolean;
  bladeCount: number;
  rackSize: number;
  coolingOverdrive: boolean;
  gender: CharacterGender;
  onToggleGender: (g: CharacterGender) => void;
  playerName?: string;
  studioName?: string;
  neonThemeColor?: string;
  onOpenNameModal?: () => void;
  onEmergencyRepairClick?: () => void;
  onPcClick?: () => void;
}

// Safe rounded rectangle drawing helper for canvas
function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number | number[] = 0
) {
  ctx.beginPath();
  let rTopLeft = 0;
  let rTopRight = 0;
  let rBottomRight = 0;
  let rBottomLeft = 0;

  if (Array.isArray(r)) {
    if (r.length === 4) {
      [rTopLeft, rTopRight, rBottomRight, rBottomLeft] = r;
    } else if (r.length === 2) {
      [rTopLeft, rBottomRight] = r;
      rTopRight = rTopLeft;
      rBottomLeft = rBottomRight;
    } else {
      rTopLeft = rTopRight = rBottomRight = rBottomLeft = r[0] || 0;
    }
  } else {
    rTopLeft = rTopRight = rBottomRight = rBottomLeft = r;
  }

  const maxR = Math.min(Math.abs(w) / 2, Math.abs(h) / 2);
  rTopLeft = Math.min(Math.max(0, rTopLeft), maxR);
  rTopRight = Math.min(Math.max(0, rTopRight), maxR);
  rBottomRight = Math.min(Math.max(0, rBottomRight), maxR);
  rBottomLeft = Math.min(Math.max(0, rBottomLeft), maxR);

  ctx.moveTo(x + rTopLeft, y);
  ctx.lineTo(x + w - rTopRight, y);
  ctx.arcTo(x + w, y, x + w, y + rTopRight, rTopRight);
  ctx.lineTo(x + w, y + h - rBottomRight);
  ctx.arcTo(x + w, y + h, x + w - rBottomRight, y + h, rBottomRight);
  ctx.lineTo(x + rBottomLeft, y + h);
  ctx.arcTo(x, y + h, x, y + h - rBottomLeft, rBottomLeft);
  ctx.lineTo(x, y + rTopLeft);
  ctx.arcTo(x, y, x + rTopLeft, y, rTopLeft);
  ctx.closePath();
}

export const IsometricRoom: React.FC<IsometricRoomProps> = ({
  phase,
  officeLevel,
  tempC,
  trafficMBs,
  crisisActive,
  bladeCount,
  rackSize,
  coolingOverdrive,
  gender,
  onToggleGender,
  playerName = 'Nadira',
  studioName = 'Nadira Cyber Lab',
  neonThemeColor = '#00f5ff',
  onOpenNameModal,
  onEmergencyRepairClick,
  onPcClick,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Character animation coordinates & direction (responsive percentages)
  const [charXPercent, setCharXPercent] = useState(34);
  const [charYPercent, setCharYPercent] = useState(69);
  const [facingDir, setFacingDir] = useState<1 | -1>(1); // 1 = right, -1 = left
  const [speechBubble, setSpeechBubble] = useState<string | null>(null);

  const triggerSpeech = (text: string) => {
    sound.playClick();
    setSpeechBubble(text);
    setTimeout(() => setSpeechBubble(null), 3000);
  };

  // Determine current character action based on phase and crisis
  const characterAction = crisisActive && !coolingOverdrive
    ? 'running'
    : phase === 'phase1_planning'
    ? 'typing'
    : phase === 'phase2_hardware'
    ? 'mounting'
    : phase === 'phase4_evaluation'
    ? 'celebrating'
    : 'idle';

  // Behavioral controller synced with game phases (tuned for cozy compact diorama)
  useEffect(() => {
    let animId: number;

    if (crisisActive && !coolingOverdrive) {
      // Sprint back and forth in panic between desk and rack!
      let dir = 1;
      let pos = 38;
      const sprint = () => {
        pos += dir * 0.4;
        if (pos > 62) {
          dir = -1;
          setFacingDir(-1);
        } else if (pos < 36) {
          dir = 1;
          setFacingDir(1);
        }
        setCharXPercent(pos);
        setCharYPercent(69 + Math.sin(pos * 0.5) * 1.5);
        animId = requestAnimationFrame(sprint);
      };
      animId = requestAnimationFrame(sprint);
    } else if (phase === 'phase1_planning') {
      // Sitting at the cozy birch battlestation desk
      setFacingDir(1);
      setCharXPercent(34);
      setCharYPercent(69);
    } else if (phase === 'phase2_hardware') {
      // Standing near sleek server rack
      setFacingDir(1);
      setCharXPercent(63);
      setCharYPercent(67);
    } else if (phase === 'phase2_logic') {
      // Standing on the cozy bohemian center rug
      setFacingDir(-1);
      setCharXPercent(50);
      setCharYPercent(69);
    } else if (phase === 'phase4_evaluation') {
      // Victory center pose
      setFacingDir(1);
      setCharXPercent(50);
      setCharYPercent(69);
    }

    return () => {
      if (animId) cancelAnimationFrame(animId);
    };
  }, [phase, crisisActive, coolingOverdrive]);

  // Main 60fps Canvas Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let frameId: number;
    let tick = 0;

    const render = () => {
      tick++;

      const container = containerRef.current;
      const width = Math.max(480, container?.clientWidth || 760);
      const height = Math.round(width * 0.54);
      const dpr = Math.min(window.devicePixelRatio || 1, 2.5);

      if (canvas.width !== Math.floor(width * dpr) || canvas.height !== Math.floor(height * dpr)) {
        canvas.width = Math.floor(width * dpr);
        canvas.height = Math.floor(height * dpr);
      }

      // Reset transform cleanly every frame
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const vW = width;
      const vH = height;

      // =========================================================================
      // 1. STYLISH BACKGROUND (Soft warm twilight studio backdrop)
      // =========================================================================
      const bgGrad = ctx.createRadialGradient(vW * 0.5, vH * 0.45, 40, vW * 0.5, vH * 0.45, vW * 0.7);
      if (crisisActive) {
        bgGrad.addColorStop(0, '#2a1117');
        bgGrad.addColorStop(1, '#110508');
      } else {
        bgGrad.addColorStop(0, '#1c2233');
        bgGrad.addColorStop(0.6, '#141824');
        bgGrad.addColorStop(1, '#0c0e17');
      }
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, vW, vH);

      // Warm Ambient Golden Spotlight Wash
      const warmSpotlight = ctx.createRadialGradient(vW * 0.5, vH * 0.35, 10, vW * 0.5, vH * 0.5, vW * 0.45);
      warmSpotlight.addColorStop(0, crisisActive ? 'rgba(239, 68, 68, 0.25)' : 'rgba(251, 191, 36, 0.12)');
      warmSpotlight.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = warmSpotlight;
      ctx.fillRect(0, 0, vW, vH);

      // Red Strobe Alert Light during Overheat / DDoS Crisis
      if (crisisActive) {
        const pulse = (Math.sin(tick * 0.2) + 1) * 0.5;
        const sirenGlow = ctx.createRadialGradient(vW * 0.65, vH * 0.36, 10, vW * 0.65, vH * 0.36, vW * 0.7);
        sirenGlow.addColorStop(0, `rgba(239, 68, 68, ${0.4 + pulse * 0.35})`);
        sirenGlow.addColorStop(1, 'rgba(185, 28, 28, 0.05)');
        ctx.fillStyle = sirenGlow;
        ctx.fillRect(0, 0, vW, vH);
      }

      // =========================================================================
      // 2. COZY COMPACT ISOMETRIC DIORAMA GEOMETRY
      // =========================================================================
      const centerX = vW * 0.50;
      const floorTopY = vH * 0.23;
      const floorBottomY = vH * 0.85;
      const floorLeftX = vW * 0.16;
      const floorRightX = vW * 0.84;
      const floorMidY = vH * 0.54;

      // Elevated 3D Diorama Plinth Base (Walnut Wood Stand)
      const plinthDepth = 14;
      ctx.beginPath();
      ctx.moveTo(floorLeftX, floorMidY);
      ctx.lineTo(centerX, floorBottomY);
      ctx.lineTo(centerX, floorBottomY + plinthDepth);
      ctx.lineTo(floorLeftX, floorMidY + plinthDepth);
      ctx.closePath();
      ctx.fillStyle = '#27170e';
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(centerX, floorBottomY);
      ctx.lineTo(floorRightX, floorMidY);
      ctx.lineTo(floorRightX, floorMidY + plinthDepth);
      ctx.lineTo(centerX, floorBottomY + plinthDepth);
      ctx.closePath();
      ctx.fillStyle = '#1c0f08';
      ctx.fill();

      // =========================================================================
      // 3. WARM OAK PARQUET HERRINGBONE HARDWOOD FLOOR (Eliminates dark mud!)
      // =========================================================================
      ctx.beginPath();
      ctx.moveTo(centerX, floorTopY);
      ctx.lineTo(floorRightX, floorMidY);
      ctx.lineTo(centerX, floorBottomY);
      ctx.lineTo(floorLeftX, floorMidY);
      ctx.closePath();

      const woodGrad = ctx.createLinearGradient(centerX, floorTopY, centerX, floorBottomY);
      if (crisisActive) {
        woodGrad.addColorStop(0, '#421a1f');
        woodGrad.addColorStop(1, '#2b0f14');
      } else {
        woodGrad.addColorStop(0, '#c78c58'); // Warm golden amber oak
        woodGrad.addColorStop(0.5, '#b37744');
        woodGrad.addColorStop(1, '#945b2f');
      }
      ctx.fillStyle = woodGrad;
      ctx.fill();

      // Parquet Wooden Plank Seams & Grain Texture
      ctx.save();
      ctx.clip(); // Restrict planks to floor diamond

      const numBands = 12;
      for (let i = 0; i <= numBands; i++) {
        const factor = i / numBands;
        const x1 = floorLeftX + (centerX - floorLeftX) * factor;
        const y1 = floorMidY - (floorMidY - floorTopY) * factor;
        const x2 = centerX + (floorRightX - centerX) * factor;
        const y2 = floorBottomY - (floorBottomY - floorMidY) * factor;

        // Warm wood plank border lines
        ctx.strokeStyle = crisisActive ? 'rgba(0,0,0,0.3)' : 'rgba(92, 45, 15, 0.35)';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();

        // Staggered cross-grain parquet blocks
        if (i % 2 === 0) {
          ctx.fillStyle = 'rgba(255, 235, 195, 0.08)'; // Subtle plank highlight
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.lineTo(x2 + 12, y2 + 6);
          ctx.lineTo(x1 + 12, y1 + 6);
          ctx.fill();
        }
      }
      ctx.restore();

      // Floor Edge Clean Highlight
      ctx.beginPath();
      ctx.moveTo(centerX, floorTopY);
      ctx.lineTo(floorRightX, floorMidY);
      ctx.lineTo(centerX, floorBottomY);
      ctx.lineTo(floorLeftX, floorMidY);
      ctx.closePath();
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // =========================================================================
      // 4. WARM AESTHETIC WALLS (Loft Brick + Japanese Acoustic Wood Slats)
      // =========================================================================
      // LEFT WALL: Warm Cream Loft Brick with City Sunset Window
      const wallTopY = vH * 0.04;
      ctx.beginPath();
      ctx.moveTo(floorLeftX, floorMidY);
      ctx.lineTo(floorLeftX, vH * 0.20);
      ctx.lineTo(centerX, wallTopY);
      ctx.lineTo(centerX, floorTopY);
      ctx.closePath();

      const leftWallGrad = ctx.createLinearGradient(floorLeftX, floorMidY, centerX, wallTopY);
      if (crisisActive) {
        leftWallGrad.addColorStop(0, '#36141a');
        leftWallGrad.addColorStop(1, '#200b10');
      } else {
        leftWallGrad.addColorStop(0, '#333b4e'); // Warm architectural slate-cream
        leftWallGrad.addColorStop(0.5, '#404a60');
        leftWallGrad.addColorStop(1, '#4a556d');
      }
      ctx.fillStyle = leftWallGrad;
      ctx.fill();
      ctx.strokeStyle = '#525f7a';
      ctx.lineWidth = 1.4;
      ctx.stroke();

      // Subtle Warm Loft Brick Texture on Left Wall
      ctx.save();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.07)';
      ctx.lineWidth = 0.8;
      for (let b = 0; b < 8; b++) {
        const by = vH * 0.18 + b * (floorMidY - vH * 0.18) / 8;
        ctx.beginPath();
        ctx.moveTo(floorLeftX + 10, by);
        ctx.lineTo(centerX - 10, by - (floorTopY - wallTopY) * 0.6);
        ctx.stroke();
      }
      ctx.restore();

      // RIGHT WALL: Japanese Warm Cedar / Acoustic Wood Slats
      ctx.beginPath();
      ctx.moveTo(centerX, floorTopY);
      ctx.lineTo(centerX, wallTopY);
      ctx.lineTo(floorRightX, vH * 0.20);
      ctx.lineTo(floorRightX, floorMidY);
      ctx.closePath();

      const rightWallGrad = ctx.createLinearGradient(centerX, wallTopY, floorRightX, floorMidY);
      if (crisisActive) {
        rightWallGrad.addColorStop(0, '#2d1016');
        rightWallGrad.addColorStop(1, '#1b090d');
      } else {
        rightWallGrad.addColorStop(0, '#2d3345');
        rightWallGrad.addColorStop(1, '#222837');
      }
      ctx.fillStyle = rightWallGrad;
      ctx.fill();
      ctx.strokeStyle = '#3e485e';
      ctx.lineWidth = 1.4;
      ctx.stroke();

      // Vertical Warm Wood Slats on Right Wall
      ctx.save();
      const numSlats = 16;
      for (let s = 1; s < numSlats; s++) {
        const slatFactor = s / numSlats;
        const sx = centerX + (floorRightX - centerX) * slatFactor;
        const syTop = wallTopY + (vH * 0.20 - wallTopY) * slatFactor;
        const syBot = floorTopY + (floorMidY - floorTopY) * slatFactor;

        // Wood slat shadow
        ctx.strokeStyle = '#151922';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(sx - 1, syTop);
        ctx.lineTo(sx - 1, syBot);
        ctx.stroke();

        // Warm Cedar slat face
        ctx.strokeStyle = crisisActive ? '#7f1d1d' : '#b4733c';
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.moveTo(sx, syTop);
        ctx.lineTo(sx, syBot);
        ctx.stroke();
      }
      ctx.restore();

      // =========================================================================
      // 5. PANORAMIC CITY SUNSET / TWILIGHT LOFT WINDOW (Left Wall)
      // =========================================================================
      const winX = vW * 0.20;
      const winY = vH * 0.16;
      const winW = Math.max(54, vW * 0.10);
      const winH = Math.max(48, vH * 0.16);

      ctx.save();
      // Outer Wood Frame
      ctx.fillStyle = '#1e2433';
      drawRoundedRect(ctx, winX - 2, winY - 2, winW + 4, winH + 4, 6);
      ctx.fill();
      ctx.strokeStyle = '#e2b17a';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Sunset / Twilight Sky Gradient
      const skyGrad = ctx.createLinearGradient(winX, winY, winX, winY + winH);
      skyGrad.addColorStop(0, '#312e81'); // Twilight indigo
      skyGrad.addColorStop(0.45, '#c026d3'); // Vibrant sunset magenta
      skyGrad.addColorStop(0.75, '#f97316'); // Warm orange sunset glow
      skyGrad.addColorStop(1, '#fde047'); // Golden horizon
      ctx.fillStyle = skyGrad;
      drawRoundedRect(ctx, winX, winY, winW, winH, 4);
      ctx.fill();

      // Twinkling stars in upper sky
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(winX + 8, winY + 6, 1.5, 1.5);
      ctx.fillRect(winX + winW - 12, winY + 10, 1.5, 1.5);
      ctx.fillRect(winX + winW / 2, winY + 8, 1.2, 1.2);

      // Distant Cyberpunk Skyscrapers
      ctx.fillStyle = '#181824';
      ctx.fillRect(winX + 4, winY + winH - 24, 12, 24);
      ctx.fillRect(winX + 18, winY + winH - 32, 14, 32);
      ctx.fillRect(winX + 34, winY + winH - 20, 12, 20);

      // Glowing skyscraper windows
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(winX + 7, winY + winH - 18, 2, 2);
      ctx.fillRect(winX + 22, winY + winH - 26, 2, 2);
      ctx.fillRect(winX + 26, winY + winH - 16, 2, 2);

      // Modern 4-pane Window Muntin Bars
      ctx.strokeStyle = '#1e2433';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(winX + winW / 2, winY);
      ctx.lineTo(winX + winW / 2, winY + winH);
      ctx.moveTo(winX, winY + winH / 2);
      ctx.lineTo(winX + winW, winY + winH / 2);
      ctx.stroke();

      // Soft Warm Window Light Cast onto floor
      const winFloorGlow = ctx.createLinearGradient(winX, winY + winH, winX + 30, winY + winH + 40);
      winFloorGlow.addColorStop(0, 'rgba(251, 191, 36, 0.25)');
      winFloorGlow.addColorStop(1, 'rgba(251, 191, 36, 0)');
      ctx.fillStyle = winFloorGlow;
      ctx.fillRect(winX, winY + winH, winW + 20, 35);
      ctx.restore();

      // =========================================================================
      // 6. COZY FAIRY STRING LIGHTS (Lampu Tumblr Hangat along ceiling!)
      // =========================================================================
      ctx.save();
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(floorLeftX + 15, vH * 0.21);
      ctx.quadraticCurveTo(vW * 0.33, vH * 0.17, centerX, wallTopY + 12);
      ctx.quadraticCurveTo(vW * 0.67, vH * 0.17, floorRightX - 15, vH * 0.21);
      ctx.stroke();

      // Glowing Warm Fairy Light Bulbs
      const bulbCount = 12;
      for (let b = 0; b <= bulbCount; b++) {
        const t = b / bulbCount;
        let bx = 0;
        let by = 0;
        if (t <= 0.5) {
          const tSub = t * 2;
          bx = (1 - tSub) * (floorLeftX + 15) + tSub * centerX;
          by = (1 - tSub) * (1 - tSub) * (vH * 0.21) + 2 * (1 - tSub) * tSub * (vH * 0.17) + tSub * tSub * (wallTopY + 12);
        } else {
          const tSub = (t - 0.5) * 2;
          bx = (1 - tSub) * centerX + tSub * (floorRightX - 15);
          by = (1 - tSub) * (1 - tSub) * (wallTopY + 12) + 2 * (1 - tSub) * tSub * (vH * 0.17) + tSub * tSub * (vH * 0.21);
        }

        const twinkle = Math.sin(tick * 0.15 + b * 1.2) * 0.3 + 0.7;
        const bulbHue = b % 3 === 0 ? '#f43f5e' : b % 3 === 1 ? '#38bdf8' : '#fef08a';

        ctx.shadowColor = bulbHue;
        ctx.shadowBlur = 8 * twinkle;
        ctx.fillStyle = bulbHue;
        ctx.beginPath();
        ctx.arc(bx, by + 3, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.shadowBlur = 0;
      ctx.restore();

      // =========================================================================
      // 7. SUSPENDED CYBER STUDIO NEON MARQUEE (Top Apex, Clear & Prominent!)
      // =========================================================================
      ctx.save();
      const neonW = Math.max(180, vW * 0.28);
      const neonH = 34;
      const neonX = centerX - neonW / 2;
      const neonY = Math.max(16, vH * 0.05);

      // Steel Hanging Chains
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(neonX + 24, 0);
      ctx.lineTo(neonX + 24, neonY);
      ctx.moveTo(neonX + neonW - 24, 0);
      ctx.lineTo(neonX + neonW - 24, neonY);
      ctx.stroke();

      // Dark Backing Plaque with Walnut Wood Rim
      ctx.fillStyle = '#1c1512';
      drawRoundedRect(ctx, neonX - 2, neonY - 2, neonW + 4, neonH + 4, 6);
      ctx.fill();
      ctx.strokeStyle = '#c28448';
      ctx.lineWidth = 1.8;
      ctx.stroke();

      ctx.fillStyle = '#090d16';
      drawRoundedRect(ctx, neonX, neonY, neonW, neonH, 4);
      ctx.fill();

      // Pulsing Neon Tube Outer Glow
      const displayNeonColor = crisisActive ? '#ef4444' : (neonThemeColor || '#00f5ff');
      const neonPulse = Math.sin(tick * 0.12) * 3;
      ctx.shadowColor = displayNeonColor;
      ctx.shadowBlur = crisisActive ? 16 : (12 + neonPulse);
      ctx.strokeStyle = displayNeonColor;
      ctx.lineWidth = 1.8;
      drawRoundedRect(ctx, neonX + 3, neonY + 3, neonW - 6, neonH - 6, 3);
      ctx.stroke();

      // Studio Name in Neon Typography
      ctx.fillStyle = displayNeonColor;
      ctx.font = 'bold 11px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      const cleanStudioTitle = (studioName || `${playerName} Cyber Lab`).toUpperCase();
      ctx.fillText(`⚡ ${cleanStudioTitle} ⚡`, neonX + neonW / 2, neonY + 15);

      ctx.fillStyle = '#fef08a';
      ctx.font = 'bold 7.5px "JetBrains Mono", monospace';
      ctx.fillText(`LEAD ARSITEK: ${(playerName || 'NADIRA').toUpperCase()} · COZY STUDIO [OK]`, neonX + neonW / 2, neonY + 26);
      ctx.textAlign = 'start';
      ctx.shadowBlur = 0;
      ctx.restore();

      // =========================================================================
      // 8. COZY BOHEMIAN CENTER RUG (Warm Cream & Terracotta Patterns)
      // =========================================================================
      const rugCenterX = centerX;
      const rugCenterY = vH * 0.67;
      const rugRadiusX = Math.max(58, vW * 0.12);
      const rugRadiusY = rugRadiusX * 0.48; // isometric squash

      ctx.save();
      // Outer Fringe
      ctx.beginPath();
      ctx.ellipse(rugCenterX, rugCenterY, rugRadiusX + 3, rugRadiusY + 1.5, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#fef3c7'; // Cream fringe
      ctx.fill();

      // Main Patterned Rug Body
      ctx.beginPath();
      ctx.ellipse(rugCenterX, rugCenterY, rugRadiusX, rugRadiusY, 0, 0, Math.PI * 2);
      ctx.fillStyle = crisisActive ? '#7f1d1d' : '#ea580c'; // Warm terracotta
      ctx.fill();

      // Inner Cream Geometric Ring
      ctx.beginPath();
      ctx.ellipse(rugCenterX, rugCenterY, rugRadiusX * 0.65, rugRadiusY * 0.65, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#ffedd5';
      ctx.fill();

      // Center Cyber Medallion
      ctx.beginPath();
      ctx.ellipse(rugCenterX, rugCenterY, rugRadiusX * 0.3, rugRadiusY * 0.3, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#0284c7';
      ctx.fill();
      ctx.restore();

      // =========================================================================
      // 9. CUTE SLEEPING PET (Orange Tabby Cat snoozing on round velvet cushion!)
      // =========================================================================
      const petCushionX = vW * 0.42;
      const petCushionY = vH * 0.63;

      ctx.save();
      // Teal Velvet Round Cushion
      ctx.beginPath();
      ctx.ellipse(petCushionX, petCushionY, 14, 8, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#0f766e';
      ctx.fill();
      ctx.strokeStyle = '#2dd4bf';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Chubby Curled-up Orange Cat Body
      ctx.beginPath();
      ctx.ellipse(petCushionX, petCushionY - 3, 9, 6, 0.2, 0, Math.PI * 2);
      ctx.fillStyle = '#f97316'; // Orange tabby
      ctx.fill();

      // Cat Head
      ctx.beginPath();
      ctx.arc(petCushionX - 5, petCushionY - 5, 4.5, 0, Math.PI * 2);
      ctx.fillStyle = '#ea580c';
      ctx.fill();

      // Pointy Cat Ears
      ctx.fillStyle = '#fb923c';
      ctx.beginPath();
      ctx.moveTo(petCushionX - 8, petCushionY - 7);
      ctx.lineTo(petCushionX - 6, petCushionY - 11);
      ctx.lineTo(petCushionX - 4, petCushionY - 8);
      ctx.fill();

      // Curled Tabby Tail
      ctx.strokeStyle = '#ea580c';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.arc(petCushionX + 4, petCushionY - 3, 5, 0, Math.PI * 0.8);
      ctx.stroke();

      // Animated Floating Sleeping "zZz"
      const zOffset = (tick * 0.04) % 1;
      ctx.fillStyle = 'rgba(254, 240, 138, 0.9)';
      ctx.font = 'bold 7px sans-serif';
      ctx.fillText('z', petCushionX - 8, petCushionY - 12 - zOffset * 8);
      ctx.font = 'bold 9px sans-serif';
      ctx.fillText('Z', petCushionX - 12, petCushionY - 17 - zOffset * 10);
      ctx.restore();

      // =========================================================================
      // 10. LUSH INDOOR MONSTERA PLANT (Organic Greenery in Terracotta Pot!)
      // =========================================================================
      const plantX = vW * 0.22;
      const plantY = vH * 0.58;

      ctx.save();
      // Terracotta Pot Base
      ctx.fillStyle = '#c2410c';
      ctx.beginPath();
      ctx.moveTo(plantX - 9, plantY);
      ctx.lineTo(plantX + 9, plantY);
      ctx.lineTo(plantX + 6, plantY + 14);
      ctx.lineTo(plantX - 6, plantY + 14);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#9a3412';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Pot Rim
      ctx.fillStyle = '#ea580c';
      drawRoundedRect(ctx, plantX - 11, plantY - 3, 22, 4, 1.5);
      ctx.fill();

      // Dark Soil
      ctx.fillStyle = '#3f2e1e';
      ctx.beginPath();
      ctx.ellipse(plantX, plantY - 1, 9, 3, 0, 0, Math.PI * 2);
      ctx.fill();

      // Lush Monstera Fan Leaves
      const leafColors = ['#15803d', '#16a34a', '#22c55e', '#4ade80'];
      const leafAngles = [-0.8, -0.4, 0.1, 0.6, 0.9];
      leafAngles.forEach((ang, idx) => {
        const lx = plantX + Math.sin(ang) * 16;
        const ly = plantY - 10 - Math.cos(ang) * 14;

        ctx.strokeStyle = '#15803d';
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(plantX, plantY - 1);
        ctx.quadraticCurveTo(plantX + (lx - plantX) * 0.5, ly + 8, lx, ly);
        ctx.stroke();

        ctx.fillStyle = leafColors[idx % leafColors.length];
        ctx.beginPath();
        ctx.ellipse(lx, ly, 7, 10, ang, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.restore();

      // =========================================================================
      // 11. AESTHETIC BATTLESTATION DESK SETUP (Birch & White Steel)
      // =========================================================================
      const deskX = vW * 0.33;
      const deskY = vH * 0.53;

      ctx.save();
      // Desk Drop Shadow on Parquet
      ctx.beginPath();
      ctx.moveTo(deskX - 52, deskY + 34);
      ctx.lineTo(deskX + 46, deskY - 14);
      ctx.lineTo(deskX + 78, deskY);
      ctx.lineTo(deskX - 20, deskY + 48);
      ctx.closePath();
      ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
      ctx.fill();

      // White Steel Desk Hairpin Legs
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(deskX - 44, deskY + 16);
      ctx.lineTo(deskX - 44, deskY + 38);
      ctx.moveTo(deskX + 38, deskY - 22);
      ctx.lineTo(deskX + 38, deskY);
      ctx.moveTo(deskX + 66, deskY - 8);
      ctx.lineTo(deskX + 66, deskY + 14);
      ctx.moveTo(deskX - 16, deskY + 30);
      ctx.lineTo(deskX - 16, deskY + 52);
      ctx.stroke();

      // Solid Blonde Birch Wood Desktop Plank
      ctx.beginPath();
      ctx.moveTo(deskX - 48, deskY + 12);
      ctx.lineTo(deskX + 42, deskY - 26);
      ctx.lineTo(deskX + 72, deskY - 12);
      ctx.lineTo(deskX - 18, deskY + 26);
      ctx.closePath();
      ctx.fillStyle = '#fde68a'; // Birch wood
      ctx.fill();
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // Desktop Thickness
      ctx.beginPath();
      ctx.moveTo(deskX - 48, deskY + 12);
      ctx.lineTo(deskX - 18, deskY + 26);
      ctx.lineTo(deskX - 18, deskY + 30);
      ctx.lineTo(deskX - 48, deskY + 16);
      ctx.closePath();
      ctx.fillStyle = '#d97706';
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(deskX - 18, deskY + 26);
      ctx.lineTo(deskX + 72, deskY - 12);
      ctx.lineTo(deskX + 72, deskY - 8);
      ctx.lineTo(deskX - 18, deskY + 30);
      ctx.closePath();
      ctx.fillStyle = '#b45309';
      ctx.fill();

      // Extended Pastel Desk Mat
      ctx.beginPath();
      ctx.moveTo(deskX - 40, deskY + 12);
      ctx.lineTo(deskX + 24, deskY - 18);
      ctx.lineTo(deskX + 54, deskY - 5);
      ctx.lineTo(deskX - 10, deskY + 25);
      ctx.closePath();
      ctx.fillStyle = '#1e293b';
      ctx.fill();
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Ultrawide Curved Gaming Monitor (Main)
      const monitorX = deskX + 8;
      const monitorY = deskY - 32;

      // Monitor Stand
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(monitorX + 10, monitorY + 18, 5, 12);
      ctx.beginPath();
      ctx.ellipse(monitorX + 12, monitorY + 30, 12, 4, 0, 0, Math.PI * 2);
      ctx.fill();

      // Curved Screen Bezel
      ctx.fillStyle = '#0f172a';
      drawRoundedRect(ctx, monitorX - 12, monitorY - 28, 52, 34, 4);
      ctx.fill();
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 1.4;
      ctx.stroke();

      // Screen Glass (Live Terminal with User Prompt)
      const screenGrad = ctx.createLinearGradient(monitorX, monitorY - 26, monitorX, monitorY + 4);
      if (crisisActive) {
        screenGrad.addColorStop(0, '#50070b');
        screenGrad.addColorStop(1, '#991b1b');
      } else {
        screenGrad.addColorStop(0, '#041f27');
        screenGrad.addColorStop(1, '#063f35');
      }
      ctx.fillStyle = screenGrad;
      ctx.fillRect(monitorX - 9, monitorY - 25, 46, 28);

      // Terminal Code Lines with User's Name
      ctx.fillStyle = crisisActive ? '#fecaca' : '#38bdf8';
      ctx.font = 'bold 5px monospace';
      ctx.fillText(`${(playerName || 'nadira').toLowerCase().slice(0, 8)}@net-core:~$`, monitorX - 7, monitorY - 18);
      ctx.fillStyle = '#34d399';
      ctx.font = '4.5px monospace';
      ctx.fillText('vlan100 link [UP]', monitorX - 7, monitorY - 12);

      // Warm LED Screenbar (Lightbar on top of monitor casting cozy desk glow!)
      ctx.fillStyle = '#334155';
      ctx.fillRect(monitorX - 10, monitorY - 31, 48, 2.5);
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(monitorX - 8, monitorY - 29, 44, 1.2);

      // Soft Warm Lightbar Desk Cone Glow
      const screenbarGlow = ctx.createLinearGradient(monitorX + 14, monitorY - 28, monitorX + 14, monitorY + 28);
      screenbarGlow.addColorStop(0, 'rgba(254, 240, 138, 0.28)');
      screenbarGlow.addColorStop(1, 'rgba(254, 240, 138, 0)');
      ctx.fillStyle = screenbarGlow;
      ctx.beginPath();
      ctx.moveTo(monitorX - 8, monitorY - 28);
      ctx.lineTo(monitorX + 36, monitorY - 28);
      ctx.lineTo(monitorX + 52, monitorY + 28);
      ctx.lineTo(monitorX - 24, monitorY + 28);
      ctx.closePath();
      ctx.fill();

      // Secondary Vertical Streamer Display
      const vertX = deskX - 26;
      const vertY = deskY - 36;
      ctx.fillStyle = '#0f172a';
      drawRoundedRect(ctx, vertX, vertY, 18, 36, 3);
      ctx.fill();
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      ctx.fillStyle = '#0a192f';
      ctx.fillRect(vertX + 2, vertY + 2, 14, 32);
      ctx.fillStyle = '#38bdf8';
      for (let l = 0; l < 5; l++) {
        ctx.fillRect(vertX + 4, vertY + 5 + l * 6, (l % 2 === 0 ? 10 : 7), 1.5);
      }

      // Compact 60% RGB Mechanical Keyboard
      ctx.fillStyle = '#f8fafc'; // Clean white keyboard
      ctx.beginPath();
      ctx.moveTo(deskX - 10, deskY + 20);
      ctx.lineTo(deskX + 18, deskY + 10);
      ctx.lineTo(deskX + 26, deskY + 16);
      ctx.lineTo(deskX - 2, deskY + 26);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#cbd5e1';
      ctx.stroke();

      // Rainbow Keycaps
      const keyHue = (tick * 4) % 360;
      ctx.fillStyle = `hsl(${keyHue}, 90%, 65%)`;
      ctx.fillRect(deskX - 6, deskY + 18, 18, 2.5);

      // Ergonomic Mouse
      ctx.fillStyle = '#06b6d4';
      ctx.beginPath();
      ctx.ellipse(deskX + 28, deskY + 20, 3.5, 2.5, 0.4, 0, Math.PI * 2);
      ctx.fill();

      // Cat-Ear Headset on Acrylic Stand
      const headX = deskX - 34;
      const headY = deskY - 8;
      ctx.strokeStyle = '#f43f5e'; // Pastel pink headset
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(headX, headY, 6, Math.PI, 0);
      ctx.stroke();
      // Cat ears on headset
      ctx.fillStyle = '#f43f5e';
      ctx.beginPath();
      ctx.moveTo(headX - 5, headY - 5);
      ctx.lineTo(headX - 3, headY - 10);
      ctx.lineTo(headX - 1, headY - 5);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(headX + 1, headY - 5);
      ctx.lineTo(headX + 3, headY - 10);
      ctx.lineTo(headX + 5, headY - 5);
      ctx.fill();

      // Desktop Condenser Microphone on Boom Arm
      const micX = deskX + 44;
      const micY = deskY - 4;
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(micX, micY);
      ctx.lineTo(micX - 8, micY - 14);
      ctx.lineTo(micX - 18, micY - 8);
      ctx.stroke();
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(micX - 22, micY - 10, 5, 6);
      // Red Pop Filter
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(micX - 25, micY - 7, 3, 0, Math.PI * 2);
      ctx.stroke();

      // Hot Coffee Mug with Rising Steam
      ctx.fillStyle = '#0284c7';
      ctx.beginPath();
      ctx.arc(deskX - 22, deskY + 12, 3.5, 0, Math.PI * 2);
      ctx.fill();
      const steamY = Math.sin(tick * 0.12) * 2;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(deskX - 22, deskY + 8);
      ctx.quadraticCurveTo(deskX - 20 + steamY, deskY + 3, deskX - 22, deskY - 1);
      ctx.stroke();

      // Gaming Racing Chair
      if (phase === 'phase1_planning') {
        const chairX = deskX - 8;
        const chairY = deskY + 28;
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.ellipse(chairX, chairY + 6, 12, 8, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Chair Backrest with Cyan Accent Stripes
        ctx.fillStyle = '#1e293b';
        drawRoundedRect(ctx, chairX - 9, chairY - 16, 18, 22, 4);
        ctx.fill();
        ctx.strokeStyle = '#06b6d4';
        ctx.stroke();
      }
      ctx.restore();

      // =========================================================================
      // 12. "WHITE EDITION" ENTERPRISE SERVER RACK (Right Side, vW * 0.65)
      // =========================================================================
      const rackX = vW * 0.64;
      const rackY = vH * 0.36;
      const rackW = Math.max(68, vW * 0.11);
      const rackH = Math.max(110, vH * 0.32);

      ctx.save();
      // Server Rack Drop Shadow
      ctx.beginPath();
      ctx.ellipse(rackX + rackW / 2, rackY + rackH + 4, rackW * 0.55, 10, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
      ctx.fill();

      // Clean White Chassis Cabinet
      ctx.fillStyle = crisisActive ? '#2c0b11' : '#f8fafc';
      drawRoundedRect(ctx, rackX, rackY, rackW, rackH, 6);
      ctx.fill();
      ctx.strokeStyle = crisisActive ? '#ef4444' : '#cbd5e1';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Transparent Tinted Glass Door Interior
      ctx.fillStyle = crisisActive ? '#450a0a' : '#0f172a';
      drawRoundedRect(ctx, rackX + 4, rackY + 6, rackW - 8, rackH - 12, 4);
      ctx.fill();

      // Dual High-Speed Roof Fans
      const fanAngle = tick * (coolingOverdrive ? 0.3 : 0.08);
      ctx.save();
      ctx.translate(rackX + rackW / 2, rackY + 3);
      ctx.rotate(fanAngle);
      ctx.strokeStyle = coolingOverdrive ? '#38bdf8' : '#94a3b8';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(-7, 0);
      ctx.lineTo(7, 0);
      ctx.moveTo(0, -5);
      ctx.lineTo(0, 5);
      ctx.stroke();
      ctx.restore();

      // Server Blade Units (U-Slots with Blinking Multi-Color Activity LEDs)
      const totalUnits = 8;
      const uH = (rackH - 20) / totalUnits;
      for (let u = 0; u < totalUnits; u++) {
        const slotY = rackY + 10 + u * uH;
        const isOccupied = u < Math.max(2, bladeCount + 1);

        ctx.fillStyle = isOccupied ? (crisisActive ? '#3f0c13' : '#1e293b') : '#080d16';
        ctx.fillRect(rackX + 6, slotY + 1, rackW - 12, uH - 2);
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 0.8;
        ctx.strokeRect(rackX + 6, slotY + 1, rackW - 12, uH - 2);

        if (isOccupied) {
          const blink1 = (tick + u * 6) % 18 < 9;
          const blink2 = (tick + u * 10) % 14 < 7;
          // Green Status LED
          ctx.fillStyle = crisisActive ? (blink1 ? '#ef4444' : '#7f1d1d') : (blink1 ? '#22c55e' : '#14532d');
          ctx.beginPath();
          ctx.arc(rackX + 14, slotY + uH / 2, 2.2, 0, Math.PI * 2);
          ctx.fill();

          // Blue Traffic LED
          ctx.fillStyle = blink2 ? '#38bdf8' : '#0369a1';
          ctx.beginPath();
          ctx.arc(rackX + 22, slotY + uH / 2, 2.2, 0, Math.PI * 2);
          ctx.fill();

          // Blade Handle / Drive Grille
          ctx.fillStyle = '#64748b';
          ctx.fillRect(rackX + 30, slotY + uH * 0.3, rackW - 38, uH * 0.4);
        }
      }

      // Vertical RGB Light Strip inside rack door
      ctx.fillStyle = crisisActive ? '#ef4444' : displayNeonColor;
      ctx.shadowColor = displayNeonColor;
      ctx.shadowBlur = 6;
      ctx.fillRect(rackX + rackW - 7, rackY + 8, 1.8, rackH - 16);
      ctx.shadowBlur = 0;

      // Trailing High-Speed Blue CAT6 & Green Fiber Cables to Floor Duct
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(rackX + 16, rackY + rackH - 6);
      ctx.quadraticCurveTo(rackX - 15, rackY + rackH + 18, rackX - 45, rackY + rackH + 10);
      ctx.stroke();

      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(rackX + 28, rackY + rackH - 6);
      ctx.quadraticCurveTo(rackX - 5, rackY + rackH + 28, rackX - 60, rackY + rackH + 18);
      ctx.stroke();
      ctx.restore();

      // =========================================================================
      // 13. RETRO ARCADE / JAPANESE BEVERAGE VENDING MACHINE (Far Right, vW * 0.76)
      // =========================================================================
      const arcadeX = vW * 0.75;
      const arcadeY = vH * 0.50;
      const arcadeW = Math.max(38, vW * 0.06);
      const arcadeH = Math.max(76, vH * 0.22);

      ctx.save();
      // Drop Shadow
      ctx.beginPath();
      ctx.ellipse(arcadeX + arcadeW / 2, arcadeY + arcadeH + 2, arcadeW * 0.5, 6, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.fill();

      // Machine Cabinet (Pastel Mint / Retro Cream)
      ctx.fillStyle = '#0f766e'; // Deep teal chassis
      drawRoundedRect(ctx, arcadeX, arcadeY, arcadeW, arcadeH, 5);
      ctx.fill();
      ctx.strokeStyle = '#2dd4bf';
      ctx.lineWidth = 1.4;
      ctx.stroke();

      // Glowing Top Marquee Signboard ("RAMUNE / BOBA")
      ctx.fillStyle = '#f43f5e';
      drawRoundedRect(ctx, arcadeX + 3, arcadeY + 4, arcadeW - 6, 12, 2.5);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 6px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('SODA', arcadeX + arcadeW / 2, arcadeY + 12);
      ctx.textAlign = 'start';

      // Illuminated Glass Showcase with Colorful Sodas
      ctx.fillStyle = '#042f2e';
      drawRoundedRect(ctx, arcadeX + 4, arcadeY + 18, arcadeW - 8, 34, 3);
      ctx.fill();

      // Row 1 Sodas: Melon Soda & Ramune
      ctx.fillStyle = '#22c55e'; // Melon green
      ctx.fillRect(arcadeX + 7, arcadeY + 22, 5, 9);
      ctx.fillStyle = '#38bdf8'; // Ramune cyan
      ctx.fillRect(arcadeX + 15, arcadeY + 22, 5, 9);
      ctx.fillStyle = '#f43f5e'; // Strawberry pink
      ctx.fillRect(arcadeX + 23, arcadeY + 22, 5, 9);

      // Row 2 Sodas: Energy Can & Boba Milk
      ctx.fillStyle = '#fbbf24'; // Energy gold
      ctx.fillRect(arcadeX + 7, arcadeY + 37, 5, 9);
      ctx.fillStyle = '#c084fc'; // Taro purple
      ctx.fillRect(arcadeX + 15, arcadeY + 37, 5, 9);
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(arcadeX + 23, arcadeY + 37, 5, 9);

      // Coin Slot & Dispense Flap
      ctx.fillStyle = '#115e59';
      drawRoundedRect(ctx, arcadeX + 4, arcadeY + 56, arcadeW - 8, 14, 2);
      ctx.fill();
      ctx.fillStyle = '#022c22';
      ctx.fillRect(arcadeX + 8, arcadeY + 60, arcadeW - 16, 6);
      ctx.restore();

      // =========================================================================
      // 14. AUTONOMOUS ROBOT VACUUM WITH CAT EARS (Sweeping Parquet Floor!)
      // =========================================================================
      const botAngle = tick * 0.02;
      const botRadiusX = 40;
      const botRadiusY = 18;
      const botX = centerX + Math.cos(botAngle) * botRadiusX;
      const botY = vH * 0.74 + Math.sin(botAngle) * botRadiusY;

      ctx.save();
      // Drop Shadow
      ctx.beginPath();
      ctx.ellipse(botX, botY + 2, 10, 5, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
      ctx.fill();

      // Disc Body (Clean White)
      ctx.beginPath();
      ctx.ellipse(botX, botY, 9, 5.5, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#f8fafc';
      ctx.fill();
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Glowing Cyan LED Sensor Ring
      ctx.beginPath();
      ctx.ellipse(botX, botY, 4, 2.5, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#06b6d4';
      ctx.fill();

      // Cute Cat Ears on Robot Vacuum!
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.moveTo(botX - 6, botY - 2);
      ctx.lineTo(botX - 4, botY - 6);
      ctx.lineTo(botX - 2, botY - 3);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(botX + 2, botY - 3);
      ctx.lineTo(botX + 4, botY - 6);
      ctx.lineTo(botX + 6, botY - 2);
      ctx.fill();
      ctx.restore();

      frameId = requestAnimationFrame(render);
    };

    frameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [phase, officeLevel, tempC, trafficMBs, crisisActive, bladeCount, coolingOverdrive, playerName, studioName, neonThemeColor]);

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden rounded-3xl bg-slate-950 border-2 border-slate-800 shadow-2xl group select-none min-h-[280px]"
    >
      {/* Canvas Scene with high-resolution scaling (Environment, Warm Parquet, Desk, Server Rack) */}
      <canvas
        ref={canvasRef}
        onClick={() => {
          if (phase === 'phase1_planning') {
            triggerSpeech(gender === 'female' ? `👩 Maya: "Arsitek ${playerName || 'Nadira'}, battlestation siap! Pilih kontrak di bawah ya!"` : `👨 Rian: "Arsitek ${playerName || 'Nadira'}, PC siap rancang topologi jaringan!"`);
          } else if (crisisActive) {
            triggerSpeech('🚨 "Suhu sudah 82°C! Bantu semprot coolant sekarang!"');
            if (onEmergencyRepairClick) onEmergencyRepairClick();
          } else {
            triggerSpeech(gender === 'female' ? '👩 Maya: "Kabel patch terpasang rapi di rak server!"' : '👨 Rian: "Switch dan server siap go live!"');
          }
        }}
        className="w-full h-auto block cursor-pointer transition-opacity duration-300"
      />

      {/* High-Fidelity Stylized Character Layer (Cute Anime Chibi Sprite Matching User Reference) */}
      <div
        className="absolute pointer-events-auto cursor-pointer transition-all duration-300 z-20 hover:scale-105 active:scale-95"
        style={{
          left: `${charXPercent}%`,
          top: `${charYPercent}%`,
          transform: 'translate(-50%, -85%)',
          width: 'clamp(74px, 12vw, 98px)',
          height: 'clamp(88px, 14vw, 116px)',
        }}
        onClick={() => {
          if (phase === 'phase1_planning') {
            triggerSpeech(gender === 'female' ? `👩 Maya: "PC meja siap! Pilih salah satu dari 8 studi kasus di bawah ya!"` : `👨 Rian: "PC aktif! Siap menghitung budget dan spesifikasi blade server."`);
          } else if (crisisActive) {
            triggerSpeech('🚨 "Suhu 82°C! Semprotkan coolant turbo atau aktifkan firewall anti-DDoS!"');
            if (onEmergencyRepairClick) onEmergencyRepairClick();
          } else if (phase === 'phase2_hardware') {
            triggerSpeech(gender === 'female' ? '👩 Maya: "Blade server sudah terpasang kencang di slot rack!"' : '👨 Rian: "Kabel CAT6 dan fiber optik sudah rapi di cable tray!"');
          } else if (phase === 'phase4_evaluation') {
            triggerSpeech(gender === 'female' ? `👩 Maya: "Mantap! Kantor data center ${studioName || 'Cyber Lab'} sukses besar!"` : `👨 Rian: "Bintang 5 diraih untuk ${studioName || 'Cyber Lab'}!"`);
          } else {
            triggerSpeech(gender === 'female' ? '👩 Maya: "VLAN dan port routing siap live!"' : '👨 Rian: "Switch gigabit online, topologi terverifikasi!"');
          }
        }}
        title={`Karakter: ${gender === 'female' ? 'Maya (Network Architect)' : 'Rian (Lead Sysadmin)'} - Klik untuk interaksi`}
      >
        <EngineerCharacter
          gender={gender}
          action={characterAction}
          facingDir={facingDir}
          crisisActive={crisisActive}
          className="w-full h-full"
        />
      </div>

      {/* Top Left: Room Mode, Aesthetic Warm Theme & Live Temperature */}
      <div className="absolute top-3 left-3 flex flex-wrap items-center gap-2 z-10 pointer-events-none">
        <span className="text-xs font-bold px-3 py-1 rounded-xl bg-slate-900/90 text-amber-200 border border-amber-600/50 shadow-md backdrop-blur-md flex items-center gap-1.5">
          <span>🏡</span>
          <span>{officeLevel === 'garage' ? 'Cozy Cyber Loft (Tier 1)' : 'Enterprise Cloud Center (Tier 3)'}</span>
        </span>
        <span className="text-xs font-mono font-bold tabular-nums px-2.5 py-1 rounded-xl bg-slate-900/90 text-emerald-400 border border-emerald-800/60 shadow-md backdrop-blur-md">
          Rack 1: {tempC.toFixed(1)}°C
        </span>
      </div>

      {/* Prominent Center Top Interactive Plang Neon Banner */}
      {onOpenNameModal && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 hidden md:block">
          <button
            onClick={() => {
              sound.playClick();
              onOpenNameModal();
            }}
            className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/95 hover:bg-slate-800 border-2 border-amber-400 hover:border-amber-300 shadow-2xl shadow-amber-500/25 backdrop-blur-md transition-all active:scale-95 group"
            title="Klik untuk request / ganti nama studio dan nama kamu!"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400 group-hover:rotate-45 transition-transform" />
            <span className="text-xs font-black text-amber-300 tracking-wide uppercase">
              ⚡ {studioName || 'Nadira Cyber Lab'} ⚡
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black flex items-center gap-1 shadow-sm">
              <span>Ganti Nama</span>
              <Edit3 className="w-2.5 h-2.5" />
            </span>
          </button>
        </div>
      )}

      {/* Top Right: Character Gender Selector & Request Nama Button */}
      <div className="absolute top-3 right-3 flex items-center gap-2 z-20">
        {onOpenNameModal && (
          <button
            onClick={() => {
              sound.playClick();
              onOpenNameModal();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs font-bold text-amber-300 hover:text-amber-200 bg-amber-500/10 hover:bg-amber-500/20 border-2 border-amber-400/80 hover:border-amber-400 shadow-xl backdrop-blur-md transition-all active:scale-95 group"
            title="Klik untuk custom / request nama kamu dan nama studio data center!"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400 group-hover:rotate-12 transition-transform" />
            <span className="text-amber-200 font-extrabold hidden xs:inline">Request Nama:</span>
            <span className="font-black text-white underline decoration-amber-400 max-w-[90px] truncate">
              {playerName || 'Nadira'}
            </span>
            <Edit3 className="w-3 h-3 text-amber-400 ml-0.5" />
          </button>
        )}

        <div className="flex items-center gap-1.5 bg-slate-900/95 p-1 rounded-2xl border border-slate-700/80 shadow-2xl backdrop-blur-md">
          <button
            onClick={() => {
              sound.playClick();
              onToggleGender('male');
              triggerSpeech(`👨 Rian: "Halo Arsitek ${playerName || 'Nadira'}! Rian siap merakit data center!"`);
            }}
            className={`flex items-center gap-2 px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${
              gender === 'male'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/40 ring-1 ring-blue-400'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            title="Pilih Karakter Cowo (Rian)"
          >
            <img
              src="/assets/aistudio/male_engineer_avatar.jpg"
              alt="Rian"
              className="w-5 h-5 rounded-full object-cover border border-white/40 shadow-sm"
            />
            <span>Rian</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onToggleGender('female');
              triggerSpeech(`👩 Maya: "Hai Arsitek ${playerName || 'Nadira'}! Maya siap merancang arsitektur server!"`);
            }}
            className={`flex items-center gap-2 px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${
              gender === 'female'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-500/40 ring-1 ring-purple-400'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            title="Pilih Karakter Cewe (Maya)"
          >
            <img
              src="/assets/aistudio/f050f285777f7b2e1645a63cac4ad495_2d997e05.png"
              alt="Maya"
              className="w-5 h-5 rounded-full object-cover border border-white/40 shadow-sm"
            />
            <span>Maya</span>
          </button>
        </div>
      </div>

      {/* Floating Speech Bubble Toast when character is clicked */}
      {speechBubble && (
        <div className="absolute top-14 left-1/2 -translate-x-1/2 bg-amber-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs shadow-2xl border-2 border-amber-300 animate-bounce z-30">
          {speechBubble}
        </div>
      )}

      {/* Bottom Left: Interactive Character Assistant Companion HUD */}
      {!crisisActive && (
        <div className="absolute bottom-3 left-3 z-20 flex items-center gap-2.5 bg-slate-900/90 hover:bg-slate-900 border border-slate-700/80 p-1.5 sm:p-2 rounded-2xl shadow-2xl backdrop-blur-md transition-all group">
          <button
            onClick={() => {
              sound.playClick();
              if (phase === 'phase1_planning') {
                triggerSpeech(gender === 'female' ? `👩 Maya: "Arsitek ${playerName || 'Nadira'}, pilih kontrak di bawah & sesuaikan blade server!"` : `👨 Rian: "Arsitek ${playerName || 'Nadira'}, hitung daya watt dan budget agar muat di rack!"`);
                if (onPcClick) onPcClick();
              } else if (phase === 'phase2_hardware') {
                triggerSpeech(gender === 'female' ? '👩 Maya: "Pasang kabel patch biru & kabel power hitam ya!"' : '👨 Rian: "Pastikan switch dan router terhubung rapi!"');
              } else if (phase === 'phase4_evaluation') {
                triggerSpeech(gender === 'female' ? `👩 Maya: "Data Center ${studioName || 'Cyber Lab'} sukses besar Tier-3!"` : `👨 Rian: "Bintang 5 diraih untuk ${studioName || 'Cyber Lab'}!"`);
              } else {
                triggerSpeech(gender === 'female' ? '👩 Maya: "Cek konfigurasi VLAN dan port firewall di tablet!"' : '👨 Rian: "Terminal siap menerima command /ip address add!"');
              }
            }}
            className="flex items-center gap-2 text-left"
            title="Klik untuk dialog dan tips karakter"
          >
            <div className="relative">
              <img
                src={gender === 'female' ? '/assets/aistudio/f050f285777f7b2e1645a63cac4ad495_2d997e05.png' : '/assets/aistudio/male_engineer_avatar.jpg'}
                alt={gender === 'female' ? 'Maya' : 'Rian'}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl object-cover border-2 border-cyan-400/80 shadow-md group-hover:scale-105 transition-transform"
              />
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-slate-900 animate-pulse" />
            </div>

            <div className="hidden sm:block">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
                  {gender === 'female' ? 'Maya' : 'Rian'}
                </span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/40 font-mono">
                  {gender === 'female' ? 'Architect' : 'Sysadmin'}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 truncate max-w-[180px]">
                {`Arsitek ${playerName || 'Nadira'} • ${phase === 'phase1_planning' ? 'Perencanaan' : phase === 'phase2_hardware' ? 'Rak Server' : 'Data Center Aktif'}`}
              </p>
            </div>
          </button>

          {phase === 'phase1_planning' && (
            <button
              onClick={() => {
                sound.playClick();
                triggerSpeech('🖥️ Battlestation aktif! Pilih kontrak dan belanja hardware.');
                if (onPcClick) onPcClick();
              }}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-600 shadow-md active:scale-95 transition-all"
              title="Akses PC Meja"
            >
              <Monitor className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {/* Rack mounting progress overlay (as seen in Fase 2 of image_0.png) */}
      {phase === 'phase2_hardware' && (
        <div className="absolute bottom-4 right-4 bg-slate-900/95 border border-slate-700 px-3.5 py-2 rounded-xl shadow-xl backdrop-blur-md flex items-center gap-2.5 z-10">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-xs font-bold tracking-wider text-slate-100 uppercase">
            Rack Mounting in Progress
          </span>
        </div>
      )}

      {/* Emergency Overheat Warning Alert & Fix button (as seen in Fase 3 of image_0.png) */}
      {crisisActive && (
        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between gap-3 bg-red-950/95 border-2 border-red-500 p-3 sm:p-4 rounded-xl shadow-2xl backdrop-blur-md animate-pulse z-10">
          <div className="flex items-center gap-3">
            <span className="flex h-3.5 w-3.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-red-500"></span>
            </span>
            <div>
              <p className="text-xs sm:text-sm font-black text-red-100 uppercase tracking-wider">
                OVERHEAT WARNING: RACK 1 ({tempC.toFixed(0)}°C)
              </p>
              <p className="text-[11px] sm:text-xs text-red-200">
                Suhu melebihi 75°C! {gender === 'female' ? 'Maya' : 'Rian'} panik berlari membawa alat pendingin.
              </p>
            </div>
          </div>
          {onEmergencyRepairClick && (
            <button
              onClick={onEmergencyRepairClick}
              className="px-4 sm:px-5 py-2.5 text-xs sm:text-sm font-black uppercase tracking-wider bg-red-600 hover:bg-red-500 text-white rounded-xl shadow-xl active:scale-95 transition-all whitespace-nowrap shrink-0 border border-red-400"
            >
              PERBAIKI SEKARANG!
            </button>
          )}
        </div>
      )}

      {/* Expansion banner if in Phase 4 */}
      {phase === 'phase4_evaluation' && (
        <div className="absolute inset-x-0 bottom-4 flex justify-center pointer-events-none z-10">
          <div className="bg-emerald-950/95 border-2 border-emerald-500 px-5 py-2 rounded-full shadow-2xl backdrop-blur-md flex items-center gap-2 animate-bounce">
            <span className="text-xs sm:text-sm font-black text-emerald-300 uppercase tracking-wide">
              🎉 GEDUNG KANTOR DATA CENTER RESMI DIBUKA!
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
