import React, { useEffect } from 'react';
import { ClientContract, OfficeLevel } from '../types/game';
import confetti from 'canvas-confetti';
import { Award, Building2, CheckCircle2, ChevronRight, DollarSign, Star, TrendingUp, Sparkles, RefreshCw } from 'lucide-react';
import { sound } from '../utils/audio';

interface Phase4EvaluationProps {
  contract: ClientContract;
  cash: number;
  reputation: number;
  officeLevel: OfficeLevel;
  onUpgradeOffice: (nextLevel: OfficeLevel) => void;
  onStartNewContract: () => void;
  onOpenPromptStudio: () => void;
}

export const Phase4Evaluation: React.FC<Phase4EvaluationProps> = ({
  contract,
  cash,
  reputation,
  officeLevel,
  onUpgradeOffice,
  onStartNewContract,
  onOpenPromptStudio,
}) => {
  const payout = Math.floor(contract.budget * 1.5);

  useEffect(() => {
    sound.playVictory();
    // Fire festive victory confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10b981', '#38bdf8', '#f59e0b', '#f97316'],
      });
    } catch {
      // Confetti fallback
    }
  }, []);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="pb-2 border-b border-slate-800">
        <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider block">
          Fase 4
        </span>
        <h2 className="text-xl font-bold text-white tracking-tight">
          Evaluasi Kinerja & Ekspansi Data Center
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Proyek infrastruktur berhasil diselesaikan! Klien puas dan bisnis data center Anda siap berekspansi ke gedung kantor baru.
        </p>
      </div>

      {/* Main Success Container matching image_0.png Fase 4 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left Column: Stats & Client Review Card (like image_0.png) */}
        <div className="lg:col-span-6 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase text-slate-400 tracking-wider">
                Laporan Kinerja Proyek
              </span>
              <span className="text-xs font-semibold px-2.5 py-1 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/40 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Target Tercapai</span>
              </span>
            </div>

            {/* Client Success Header */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <h3 className="text-lg font-black text-white tracking-tight">
                KONTRAK {contract.clientName.toUpperCase()} SUKSES!
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Infrastruktur jaringan berhasil menahan krisis tanpa down-time. Klien memberikan testimoni bintang 5 untuk tim arsitek jaringan Anda!
              </p>

              {/* Progress Bar 100% */}
              <div className="pt-2">
                <div className="flex justify-between text-[11px] font-mono text-slate-400 mb-1">
                  <span>SLA Kepatuhan Layanan:</span>
                  <span className="text-emerald-400 font-bold">100% Selesai</span>
                </div>
                <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-800">
                  <div className="h-full bg-gradient-to-r from-emerald-500 to-green-400 w-full" />
                </div>
              </div>
            </div>

            {/* Financial & Reputation Metrics (as in image_0.png) */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-400 font-mono uppercase block">
                  Reputasi Perusahaan
                </span>
                <div className="flex items-center gap-1 mt-1 text-amber-400">
                  <Star className="w-4 h-4 fill-amber-400" />
                  <Star className="w-4 h-4 fill-amber-400" />
                  <Star className="w-4 h-4 fill-amber-400" />
                  <Star className="w-4 h-4 fill-amber-400" />
                  <Star className="w-4 h-4 fill-amber-400" />
                </div>
                <span className="text-[11px] text-slate-300 font-medium mt-1 block">
                  {reputation.toFixed(1)} / 5.0 (Sangat Baik)
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-400 font-mono uppercase block">
                  Total Pendapatan
                </span>
                <div className="text-lg font-black text-emerald-400 font-mono mt-0.5 tabular-nums">
                  ${cash.toLocaleString()}
                </div>
                <span className="text-[10px] text-emerald-300 font-mono block">
                  (+${payout.toLocaleString()} Reward Kontrak)
                </span>
              </div>
            </div>
          </div>

          {/* Action: Next Contract */}
          <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => {
                sound.playClick();
                onStartNewContract();
              }}
              className="flex-1 py-3 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-amber-400/20 active:scale-95 transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Ambil Kontrak Baru</span>
            </button>

            <button
              onClick={onOpenPromptStudio}
              className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Prompt Studio</span>
            </button>
          </div>
        </div>

        {/* Right Column: Office Expansion Card (Garasi ke Gedung Data Center) */}
        <div className="lg:col-span-6 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase text-slate-400 tracking-wider">
                Tingkat Fasilitas Arsitektur
              </span>
              <span className="text-xs font-mono text-cyan-400 font-bold">
                {officeLevel === 'garage'
                  ? 'Level 1: Garasi Rumah'
                  : officeLevel === 'coworking'
                  ? 'Level 2: Ruang Server Co-Working'
                  : 'Level 3: Enterprise Data Center'}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-cyan-950 border border-cyan-800 text-cyan-400">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-white">
                    {officeLevel === 'garage'
                      ? 'Gedung Kantor Baru Siap Dibuka!'
                      : 'Tier-3 Enterprise Data Center Aktif!'}
                  </h4>
                  <p className="text-xs text-slate-400">
                    {officeLevel === 'garage'
                      ? 'Pindah dari garasi rumah sempit ke gedung kantor modern dengan lantai antistatis & rak 42U ganda.'
                      : 'Fasilitas server kelas dunia dengan redundansi multi-generator & pendingin in-row presisi.'}
                  </p>
                </div>
              </div>

              {/* Expansion Perks */}
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs space-y-1.5">
                <div className="flex items-center justify-between text-slate-300">
                  <span>Slot Kapasitas Rak:</span>
                  <span className="text-cyan-400 font-mono font-bold">
                    {officeLevel === 'garage' ? '12U → 42U Enterprise' : 'Multi-Row 42U'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span>Toleransi Termal:</span>
                  <span className="text-emerald-400 font-mono font-bold">+50% Kapasitas AC</span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span>Nilai Kontrak Klien:</span>
                  <span className="text-amber-400 font-mono font-bold">Hingga $25,000+</span>
                </div>
              </div>
            </div>
          </div>

          {/* Upgrade Button */}
          {officeLevel === 'garage' ? (
            <button
              onClick={() => {
                sound.playVictory();
                onUpgradeOffice('datacenter');
              }}
              className="w-full py-4 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-cyan-500/20 active:scale-95 transition-all"
            >
              <Building2 className="w-4 h-4 fill-slate-950" />
              <span>Buka Gedung Kantor Data Center Baru Sekarang!</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-center text-xs font-semibold text-emerald-300">
              ✓ Anda telah beroperasi di Enterprise Data Center Tier-3!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
