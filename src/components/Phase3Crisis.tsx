import React, { useEffect, useRef, useState } from 'react';
import { ClientContract, TelemetryPoint } from '../types/game';
import { AlertTriangle, Flame, ShieldAlert, Zap, Wind, CheckCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { sound } from '../utils/audio';

interface Phase3CrisisProps {
  contract: ClientContract;
  currentTempC: number;
  currentTrafficMBs: number;
  coolingOverdrive: boolean;
  firewallActive: boolean;
  upsStabilized: boolean;
  crisisResolved: boolean;
  onToggleCoolingOverdrive: () => void;
  onActivateFirewallMitigation: () => void;
  onStabilizeUPS: () => void;
  onProceedToEvaluation: () => void;
}

export const Phase3Crisis: React.FC<Phase3CrisisProps> = ({
  contract,
  currentTempC,
  currentTrafficMBs,
  coolingOverdrive,
  firewallActive,
  upsStabilized,
  crisisResolved,
  onToggleCoolingOverdrive,
  onActivateFirewallMitigation,
  onStabilizeUPS,
  onProceedToEvaluation,
}) => {
  const chartCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [telemetryHistory, setTelemetryHistory] = useState<TelemetryPoint[]>([]);

  // Sound siren on mount until resolved
  useEffect(() => {
    if (!crisisResolved) {
      sound.startAlarm();
    } else {
      sound.stopAlarm();
      sound.playVictory();
    }

    return () => {
      sound.stopAlarm();
    };
  }, [crisisResolved]);

  // Telemetry recording ticker
  useEffect(() => {
    const interval = setInterval(() => {
      setTelemetryHistory((prev) => {
        const nextPoint: TelemetryPoint = {
          time: Date.now(),
          trafficMBs: currentTrafficMBs,
          temperatureC: currentTempC,
          cpuLoadPercent: Math.min(100, (currentTrafficMBs / 10) * 1.2),
        };
        const updated = [...prev, nextPoint];
        if (updated.length > 40) updated.shift();
        return updated;
      });
    }, 400);

    return () => clearInterval(interval);
  }, [currentTempC, currentTrafficMBs]);

  // Render Real-time Traffic Graph on Canvas (as in image_0.png bottom-left)
  useEffect(() => {
    const canvas = chartCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    // Dark grid background
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, w, h);

    // Grid lines
    ctx.strokeStyle = 'rgba(51, 65, 85, 0.4)';
    ctx.lineWidth = 1;
    for (let y = 20; y < h; y += 30) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    if (telemetryHistory.length < 2) return;

    // Draw Traffic Waveform (Red spike matching image_0.png)
    ctx.beginPath();
    const maxScale = 1000; // 1000 MB/s scale
    const stepX = w / (telemetryHistory.length - 1);

    telemetryHistory.forEach((pt, i) => {
      const x = i * stepX;
      const normalized = Math.min(1, pt.trafficMBs / maxScale);
      const y = h - normalized * (h - 24) - 10;
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.strokeStyle = currentTrafficMBs > 300 ? '#ef4444' : '#10b981';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Fill under curve
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.closePath();
    ctx.fillStyle = currentTrafficMBs > 300 ? 'rgba(239, 68, 68, 0.25)' : 'rgba(16, 185, 129, 0.2)';
    ctx.fill();
  }, [telemetryHistory, currentTrafficMBs]);

  const isTempCritical = currentTempC >= 75;
  const isTrafficCritical = currentTrafficMBs >= 300;

  return (
    <div className="space-y-6">
      {/* Red Alert Header Banner matching image_0.png Fase 3 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* DDoS Attack Banner */}
        <div
          className={`p-4 rounded-xl border-2 transition-all flex items-center justify-between shadow-xl ${
            isTrafficCritical
              ? 'bg-red-950/80 border-red-500 text-white animate-pulse shadow-red-500/20'
              : 'bg-emerald-950/60 border-emerald-500/60 text-emerald-200'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-red-600 text-white shadow-md">
              <ShieldAlert className="w-6 h-6 animate-bounce" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider block font-bold text-red-300">
                Deteksi Ancaman
              </span>
              <h3 className="text-base font-extrabold tracking-tight">
                {isTrafficCritical ? 'DDoS ATTACK DETECTED!' : 'TRAFIK TERKONTROL (SCRUBBED)'}
              </h3>
              <p className="text-xs font-mono font-bold text-red-200 mt-0.5 tabular-nums">
                TRAFIK: {currentTrafficMBs.toFixed(0)} MB/S
              </p>
            </div>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-mono font-bold uppercase ${
              isTrafficCritical ? 'bg-red-600 text-white' : 'bg-emerald-600 text-white'
            }`}
          >
            {isTrafficCritical ? 'KRITIS' : 'AMAN'}
          </span>
        </div>

        {/* Overheat Warning Banner */}
        <div
          className={`p-4 rounded-xl border-2 transition-all flex items-center justify-between shadow-xl ${
            isTempCritical
              ? 'bg-red-950/80 border-amber-500 text-white animate-pulse shadow-amber-500/20'
              : 'bg-emerald-950/60 border-emerald-500/60 text-emerald-200'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-amber-600 text-white shadow-md">
              <Flame className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider block font-bold text-amber-300">
                Sensor Termal Rak
              </span>
              <h3 className="text-base font-extrabold tracking-tight">
                {isTempCritical ? 'OVERHEAT WARNING: RACK 1' : 'SUHU RACK 1 STABIL'}
              </h3>
              <p className="text-xs font-mono font-bold text-amber-200 mt-0.5 tabular-nums">
                SUHU INTI: {currentTempC.toFixed(1)}°C (Ambang: 75.0°C)
              </p>
            </div>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-mono font-bold uppercase ${
              isTempCritical ? 'bg-amber-600 text-white' : 'bg-emerald-600 text-white'
            }`}
          >
            {isTempCritical ? 'OVERHEAT' : 'NORMAL'}
          </span>
        </div>
      </div>

      {/* Main Crisis Control Center: Left = Live Traffic Chart, Right = Interactive Repair Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Live Traffic Chart & Temperature Meter */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-2xl space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-xs font-mono uppercase text-slate-400 tracking-wider">
              Live Network Telemetry & Packet Monitor
            </span>
            <span className="text-xs font-mono text-cyan-400 font-bold tabular-nums">
              Real-time Inbound Flow
            </span>
          </div>

          {/* Canvas Waveform */}
          <div className="relative rounded-lg overflow-hidden border border-slate-800">
            <canvas
              ref={chartCanvasRef}
              width={560}
              height={220}
              className="w-full h-auto block"
            />
            <div className="absolute top-2 left-3 text-[10px] font-mono text-slate-400 bg-slate-950/80 px-2 py-0.5 rounded border border-slate-800">
              TRAFFIC (MB/S): {currentTrafficMBs.toFixed(0)} MB/s
            </div>
          </div>

          {/* Temperature Thermometer Gauge */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">Termometer Rak 1:</span>
              <span
                className={`font-bold tabular-nums ${
                  isTempCritical ? 'text-red-400' : 'text-emerald-400'
                }`}
              >
                {currentTempC.toFixed(1)}°C / 75.0°C Max Safe
              </span>
            </div>
            <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-800">
              <div
                className={`h-full transition-all duration-300 ${
                  currentTempC > 80
                    ? 'bg-red-600'
                    : currentTempC > 74
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(100, (currentTempC / 100) * 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Right Column: Emergency Repair Action Center */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
            <span className="text-xs font-mono uppercase text-slate-400 tracking-wider block">
              Prosedur Tanggap Darurat (Emergency Actions)
            </span>

            {/* Action 1: Turbo Cooling / Fan Overdrive */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wind className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-bold text-white">Turbo Coolant Overdrive</span>
                </div>
                <span
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                    coolingOverdrive
                      ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                      : 'bg-slate-900 text-slate-500'
                  }`}
                >
                  {coolingOverdrive ? 'TURBO ON (180%)' : 'NORMAL (100%)'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">
                Tingkatkan putaran kipas & AC ke daya maksimum untuk mendinginkan server di bawah 70°C.
              </p>
              <button
                onClick={() => {
                  sound.playClick();
                  onToggleCoolingOverdrive();
                }}
                className={`w-full py-2 px-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all active:scale-95 ${
                  coolingOverdrive
                    ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                }`}
              >
                {coolingOverdrive ? 'Matikan Turbo AC' : 'Aktifkan Turbo Coolant (Perbaiki Panas)'}
              </button>
            </div>

            {/* Action 2: Firewall Mitigation & SYN Flood Scrubber */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-white">Mitigasi Firewall Anti-DDoS</span>
                </div>
                <span
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                    firewallActive
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      : 'bg-slate-900 text-slate-500'
                  }`}
                >
                  {firewallActive ? 'ACTIVE (DROPPING)' : 'OFF'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">
                Jalankan aturan terminal: <code className="text-amber-300">/ip firewall drop syn-flood</code> untuk memblokir trafik botnet 800MB/s.
              </p>
              <button
                onClick={() => {
                  sound.playTerminalBeep();
                  onActivateFirewallMitigation();
                }}
                disabled={firewallActive}
                className={`w-full py-2 px-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all active:scale-95 ${
                  firewallActive
                    ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-700/50 cursor-default'
                    : 'bg-red-600 hover:bg-red-500 text-white shadow-md shadow-red-600/30'
                }`}
              >
                {firewallActive ? '✓ Firewall Berhasil Memblokir Botnet' : 'Terapkan Firewall Anti-DDoS Sekarang'}
              </button>
            </div>

            {/* Action 3: UPS Surge Protection */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-bold text-white">Stabilizer Daya UPS</span>
                </div>
                <span
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                    upsStabilized
                      ? 'bg-amber-950 text-amber-300 border border-amber-800'
                      : 'bg-slate-900 text-slate-500'
                  }`}
                >
                  {upsStabilized ? 'STABIL (230V)' : 'WAVE SURGE'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">
                Alihkan ke suplai baterai inverter untuk mencegah korsleting tegangan tinggi.
              </p>
              <button
                onClick={() => {
                  sound.playClick();
                  onStabilizeUPS();
                }}
                disabled={upsStabilized}
                className={`w-full py-2 px-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all active:scale-95 ${
                  upsStabilized
                    ? 'bg-amber-950/60 text-amber-300 border border-amber-800/50 cursor-default'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                }`}
              >
                {upsStabilized ? '✓ Tegangan Listrik Stabil' : 'Stabilkan Baterai UPS'}
              </button>
            </div>

            {/* Crisis Resolved Banner & Proceed to Phase 4 Button */}
            {crisisResolved && (
              <div className="pt-2">
                <button
                  onClick={() => {
                    sound.playVictory();
                    onProceedToEvaluation();
                  }}
                  className="w-full py-3.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/25 active:scale-95 transition-all"
                >
                  <span>Krisis Teratasi! Lanjut ke Evaluasi & Ekspansi</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
