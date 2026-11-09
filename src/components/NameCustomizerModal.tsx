import React, { useState } from 'react';
import { X, Sparkles, Check, Palette, Terminal, Building } from 'lucide-react';
import { sound } from '../utils/audio';

interface NameCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  playerName: string;
  studioName: string;
  neonThemeColor: string;
  onSave: (name: string, studio: string, color: string) => void;
}

export const NEON_COLOR_PRESETS = [
  { label: 'Cyan Cyber', hex: '#00f5ff', border: 'border-cyan-400' },
  { label: 'Neon Magenta', hex: '#f43f5e', border: 'border-rose-400' },
  { label: 'Electric Purple', hex: '#a855f7', border: 'border-purple-400' },
  { label: 'Matrix Emerald', hex: '#10b981', border: 'border-emerald-400' },
  { label: 'Solar Amber', hex: '#f59e0b', border: 'border-amber-400' },
];

export const NameCustomizerModal: React.FC<NameCustomizerModalProps> = ({
  isOpen,
  onClose,
  playerName,
  studioName,
  neonThemeColor,
  onSave,
}) => {
  const [nameInput, setNameInput] = useState(playerName);
  const [studioInput, setStudioInput] = useState(studioName);
  const [selectedColor, setSelectedColor] = useState(neonThemeColor);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playClick();
    const finalName = nameInput.trim() || 'Nadira';
    const finalStudio = studioInput.trim() || `${finalName} Cyber Lab`;
    onSave(finalName, finalStudio, selectedColor);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-slate-900 border-2 border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden p-6 text-slate-100 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/20">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Request Nama & Studio
              </h3>
              <p className="text-[11px] text-slate-400">
                Nama kamu akan terpampang langsung di lampu neon dinding & PC ruangan!
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          {/* Input 1: Player / Architect Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-cyan-400" />
              <span>Nama Arsitek Jaringan:</span>
            </label>
            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="Contoh: Nadira"
              maxLength={20}
              className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-400 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-cyan-400 transition-all font-medium"
            />
          </div>

          {/* Input 2: Studio / Data Center Lab Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-amber-400" />
              <span>Nama Studio Data Center (Muncul di Neon Dinding):</span>
            </label>
            <input
              type="text"
              value={studioInput}
              onChange={(e) => setStudioInput(e.target.value)}
              placeholder="Contoh: Nadira Cyber Lab"
              maxLength={24}
              className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-amber-400 transition-all font-medium"
            />
          </div>

          {/* Color Presets */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-purple-400" />
              <span>Pilih Warna Neon Sign Dinding:</span>
            </label>
            <div className="grid grid-cols-5 gap-2">
              {NEON_COLOR_PRESETS.map((p) => {
                const isSelected = selectedColor === p.hex;
                return (
                  <button
                    key={p.hex}
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      setSelectedColor(p.hex);
                    }}
                    className={`flex flex-col items-center gap-1 p-2 rounded-xl bg-slate-950 border transition-all ${
                      isSelected
                        ? `${p.border} ring-2 ring-white/20 scale-105 shadow-lg`
                        : 'border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <span
                      className="w-5 h-5 rounded-full shadow-inner"
                      style={{ backgroundColor: p.hex }}
                    />
                    <span className="text-[9px] font-medium text-slate-400 truncate max-w-full">
                      {p.label.split(' ')[0]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Live Preview Box */}
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1 text-center">
            <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500 block">
              Pratinjau Neon Sign Ruangan
            </span>
            <div
              className="font-mono font-black text-xs sm:text-sm tracking-widest py-1 drop-shadow-md"
              style={{
                color: selectedColor,
                textShadow: `0 0 10px ${selectedColor}, 0 0 20px ${selectedColor}`,
              }}
            >
              ⚡ {(studioInput.trim() || 'NADIRA CYBER LAB').toUpperCase()} ⚡
            </div>
            <p className="text-[10px] text-slate-400">
              Terminal: <span className="text-emerald-400">{(nameInput.trim() || 'nadira').toLowerCase()}@net-core-1:~$</span>
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                onClose();
              }}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-xl shadow-lg shadow-amber-400/20 active:scale-95 transition-all"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Simpan & Terapkan ke Ruangan</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
