import React from 'react';
import { GamePhase } from '../types/game';
import { Volume2, VolumeX, Sparkles, Terminal } from 'lucide-react';

interface NavbarProps {
  currentPhase: GamePhase;
  onSelectPhase: (phase: GamePhase) => void;
  cash: number;
  reputation: number;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenPromptStudio: () => void;
  onResetGame: () => void;
  playerName?: string;
  studioName?: string;
  onOpenNameModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPhase,
  onSelectPhase,
  cash,
  reputation,
  soundEnabled,
  onToggleSound,
  onOpenPromptStudio,
  playerName = 'Nadira',
  studioName = 'Nadira Cyber Lab',
  onOpenNameModal,
}) => {
  const phases: { id: GamePhase; label: string }[] = [
    { id: 'phase1_planning', label: '1. Kontrak' },
    { id: 'phase2_hardware', label: '2. Rak & Kabel' },
    { id: 'phase2_logic', label: '3. Konfigurasi' },
    { id: 'phase3_crisis', label: '4. Krisis Live' },
    { id: 'phase4_evaluation', label: '5. Evaluasi' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-8 px-4 sm:px-6 py-3">
        {/* Zone 1: Brand title wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-slate-950 font-black shadow-md shadow-orange-500/20">
            <Terminal className="w-4 h-4 stroke-[2.5]" />
          </div>
          <div>
            <span className="text-base font-extrabold tracking-tight text-white whitespace-nowrap block">
              {studioName || 'Network Architect'}
            </span>
            <button
              onClick={onOpenNameModal}
              className="text-[10px] text-cyan-400 hover:text-cyan-300 font-semibold -mt-1 flex items-center gap-1 transition-colors text-left"
              title="Klik untuk ubah nama arsitek & studio"
            >
              <span>Arsitek: {playerName || 'Nadira'}</span>
              <span className="text-[9px] text-amber-400">✏️</span>
            </button>
          </div>
        </div>

        {/* Zone 2: 5 single-line navigation tabs */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800 shrink-0">
          {phases.map((p) => {
            const isActive = currentPhase === p.id;
            return (
              <button
                key={p.id}
                onClick={() => onSelectPhase(p.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                {p.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Financial status + Sound toggle + Primary action */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Custom Player Name Badge */}
          {onOpenNameModal && (
            <button
              onClick={onOpenNameModal}
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/40 text-xs font-semibold text-slate-300 hover:text-amber-300 transition-all active:scale-95"
              title="Ubah nama arsitek & nama studio"
            >
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span>{playerName || 'Nadira'}</span>
            </button>
          )}

          {/* Cash balance */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/50 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold tabular-nums">
            <span>$</span>
            <span>{cash.toLocaleString()}</span>
          </div>

          {/* Reputation Stars */}
          <div className="hidden lg:flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-amber-400 text-xs font-semibold">
            <span>★</span>
            <span className="text-slate-300 font-mono">{reputation.toFixed(1)}</span>
          </div>

          {/* Sound Toggle */}
          <button
            onClick={onToggleSound}
            aria-label={soundEnabled ? 'Mute audio' : 'Unmute audio'}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>

          {/* Primary Action Button: Prompt Studio */}
          <button
            onClick={onOpenPromptStudio}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-slate-900 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-md shadow-amber-400/20 active:scale-95 transition-all whitespace-nowrap shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5 text-slate-950" />
            <span>Prompt Studio</span>
          </button>
        </div>
      </div>
    </header>
  );
};
