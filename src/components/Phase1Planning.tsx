import React from 'react';
import { ClientContract, HardwareItem } from '../types/game';
import { HARDWARE_CATALOG } from '../data/hardwareCatalog';
import { Plus, Minus, CheckCircle, ArrowRight, ShieldAlert, Cpu, Sparkles, Gamepad2, Coffee, Tv, Trophy, Factory, HeartPulse, Building2, Flame } from 'lucide-react';
import { sound } from '../utils/audio';

interface Phase1PlanningProps {
  contract: ClientContract;
  allContracts: ClientContract[];
  onSelectContract: (c: ClientContract) => void;
  inventory: HardwareItem[];
  onAddHardware: (item: HardwareItem) => void;
  onRemoveHardware: (index: number) => void;
  onProceedToHardware: () => void;
  onOpenPromptStudio: () => void;
}

export const Phase1Planning: React.FC<Phase1PlanningProps> = ({
  contract,
  allContracts,
  onSelectContract,
  inventory,
  onAddHardware,
  onRemoveHardware,
  onProceedToHardware,
  onOpenPromptStudio,
}) => {
  const totalCost = inventory.reduce((acc, item) => acc + item.price, 0);
  const remainingBudget = contract.budget - totalCost;
  const isOverBudget = remainingBudget < 0;

  // Check hardware requirements
  const bladeCount = inventory.filter((i) => i.category === 'server').length;
  const hasSwitch = inventory.some((i) => i.category === 'networking');
  const hasUps = inventory.some((i) => i.category === 'power');
  const totalCooling = inventory.reduce((acc, i) => acc + i.coolingPowerBonus, 0);

  const meetsBladeReq = bladeCount >= contract.hardwareRequirements.minBlades;
  const meetsSwitchReq = !contract.hardwareRequirements.requiresSwitch || hasSwitch;
  const meetsUpsReq = !contract.hardwareRequirements.requiresUps || hasUps;
  const meetsCoolingReq = totalCooling >= contract.hardwareRequirements.minCooling;

  const canProceed =
    !isOverBudget &&
    inventory.length > 0 &&
    meetsBladeReq &&
    meetsSwitchReq &&
    meetsUpsReq;

  // Helper for case study icon & difficulty badges
  const getContractMeta = (c: ClientContract) => {
    switch (c.id) {
      case 'contract_xyz':
        return { icon: <Gamepad2 className="w-4 h-4 text-emerald-400" />, badge: 'Indie Game', diff: '🟢 Pemula', border: 'border-emerald-500/40' };
      case 'contract_warkop':
        return { icon: <Coffee className="w-4 h-4 text-amber-400" />, badge: 'Warkop WiFi', diff: '🟢 Pemula', border: 'border-amber-500/40' };
      case 'contract_vtuber':
        return { icon: <Tv className="w-4 h-4 text-pink-400" />, badge: 'VTuber 4K', diff: '🟡 Menengah', border: 'border-pink-500/40' };
      case 'contract_esports':
        return { icon: <Trophy className="w-4 h-4 text-blue-400" />, badge: 'E-Sports LAN', diff: '🟡 Menengah', border: 'border-blue-500/40' };
      case 'contract_factory':
        return { icon: <Factory className="w-4 h-4 text-orange-400" />, badge: 'Smart IoT', diff: '🟠 Mahir', border: 'border-orange-500/40' };
      case 'contract_hospital':
        return { icon: <HeartPulse className="w-4 h-4 text-red-400" />, badge: 'RS Medika', diff: '🟠 Mahir', border: 'border-red-500/40' };
      case 'contract_bank':
        return { icon: <Building2 className="w-4 h-4 text-cyan-400" />, badge: 'Bank Fintech', diff: '🔴 Ekstrem', border: 'border-cyan-500/40' };
      case 'contract_ai_lab':
        return { icon: <Cpu className="w-4 h-4 text-purple-400" />, badge: 'AI GPU Cluster', diff: '🔴 Ekstrem', border: 'border-purple-500/40' };
      default:
        return { icon: <Sparkles className="w-4 h-4 text-amber-400" />, badge: c.clientType, diff: 'Tiket Kustom', border: 'border-slate-700' };
    }
  };

  return (
    <div id="planning-section" className="space-y-6 scroll-mt-20">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider block">
            Fase 1: Studi Kasus Klien
          </span>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>Pilih Tiket & Rancang Infrastruktur</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 font-medium">
              8 Studi Kasus Berbeda
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Setiap klien memiliki tantangan jaringan, budget, krisis tersembunyi, dan arsitektur hardware yang unik.
          </p>
        </div>

        <button
          onClick={onOpenPromptStudio}
          title="Buka Prompt Studio AI"
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold transition-all shadow-md active:scale-95"
        >
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Prompt Studio AI</span>
        </button>
      </div>

      {/* Interactive Case Study Carousel Grid (8 Distinct Scenarios) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <span>📋 Daftar Kasus Tiket Klien</span>
            <span className="text-[10px] text-slate-500 font-normal">(Klik untuk ganti skenario)</span>
          </span>
          <span className="text-xs text-slate-400 font-mono">
            Aktif: <strong className="text-amber-400">{contract.clientName}</strong>
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
          {allContracts.map((c) => {
            const isSelected = c.id === contract.id;
            const meta = getContractMeta(c);
            return (
              <button
                key={c.id}
                onClick={() => {
                  sound.playClick();
                  onSelectContract(c);
                }}
                className={`relative flex flex-col p-2.5 rounded-xl text-left transition-all group ${
                  isSelected
                    ? 'bg-slate-900 border-2 border-amber-400 shadow-lg shadow-amber-500/20 scale-[1.02]'
                    : 'bg-slate-950/80 hover:bg-slate-900/90 border border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Active indicator dot */}
                {isSelected && (
                  <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                )}

                <div className="flex items-center gap-1.5 mb-1.5">
                  <div className={`p-1 rounded-lg bg-slate-900 border ${meta.border}`}>
                    {meta.icon}
                  </div>
                  <span className="text-[10px] font-bold text-slate-300 truncate">
                    {meta.badge}
                  </span>
                </div>

                <p className="text-xs font-bold text-white truncate group-hover:text-amber-300 transition-colors">
                  {c.clientName}
                </p>

                <div className="mt-2 pt-1.5 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono">
                  <span className="text-emerald-400 font-bold">${(c.budget / 1000).toFixed(1)}k</span>
                  <span className="text-slate-400 text-[9px]">{meta.diff}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2-Column Split: Left = Contract Table & Desk Specs, Right = Belanja Hardware */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Contract Details (like in image_0.png) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Contract Card */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase text-slate-400 tracking-wider">
                Tabel Kontrak
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/40">
                Prioritas 1 · Aktif
              </span>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800/80 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-white">{contract.clientName}</span>
                <span className="text-xs text-amber-400 font-mono font-bold">
                  Budget: ${contract.budget.toLocaleString()}
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {contract.initialGoal}
              </p>
            </div>

            {/* Core Network Requirements */}
            <div className="space-y-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
                Persyaratan Jaringan Klien
              </span>
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 font-mono space-y-1">
                <p>• {contract.coreNetworkRequirement}</p>
                <p className="text-cyan-400">• Subnet: {contract.requiredSubnet}</p>
                <p className="text-amber-400">• VLAN ID Target: {contract.vlanId}</p>
              </div>
            </div>

            {/* Checklist of hardware requirements */}
            <div className="space-y-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
                Verifikasi Kebutuhan Hardware
              </span>
              <ul className="space-y-1.5 text-xs">
                <li className="flex items-center justify-between text-slate-300">
                  <span>Server Blade ({bladeCount}/{contract.hardwareRequirements.minBlades} unit)</span>
                  <span className={meetsBladeReq ? 'text-emerald-400 font-semibold' : 'text-amber-400'}>
                    {meetsBladeReq ? '✓ Terpenuhi' : 'Kurang'}
                  </span>
                </li>
                <li className="flex items-center justify-between text-slate-300">
                  <span>Switch Jaringan</span>
                  <span className={meetsSwitchReq ? 'text-emerald-400 font-semibold' : 'text-amber-400'}>
                    {meetsSwitchReq ? '✓ Terpasang' : 'Wajib Ada'}
                  </span>
                </li>
                {contract.hardwareRequirements.requiresUps && (
                  <li className="flex items-center justify-between text-slate-300">
                    <span>UPS Battery Backup</span>
                    <span className={meetsUpsReq ? 'text-emerald-400 font-semibold' : 'text-amber-400'}>
                      {meetsUpsReq ? '✓ Terpasang' : 'Wajib Ada'}
                    </span>
                  </li>
                )}
                <li className="flex items-center justify-between text-slate-300">
                  <span>Kapasitas Pendingin ({totalCooling}/{contract.hardwareRequirements.minCooling} CFM)</span>
                  <span className={meetsCoolingReq ? 'text-emerald-400 font-semibold' : 'text-amber-400'}>
                    {meetsCoolingReq ? '✓ Cukup' : 'Disarankan Tambah'}
                  </span>
                </li>
              </ul>
            </div>

            {/* Hidden Crisis Warning Teaser */}
            <div className="p-3 rounded-lg bg-amber-950/20 border border-amber-500/20 flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div className="text-[11px] text-amber-200/90 leading-snug">
                <span className="font-semibold text-amber-300 block">Intel Lapangan Klien:</span>
                Klien rentan terhadap: {contract.hiddenCrisisEvent}. Siapkan pendingin & konfigurasi firewall yang tepat!
              </div>
            </div>
          </div>

          {/* Current Procurement Cart & Budget Bar */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase text-slate-400 tracking-wider">
                Estimasi Biaya Belanja
              </span>
              <span
                className={`text-xs font-mono font-bold tabular-nums ${
                  isOverBudget ? 'text-red-400' : 'text-emerald-400'
                }`}
              >
                ${totalCost.toLocaleString()} / ${contract.budget.toLocaleString()}
              </span>
            </div>

            {/* Budget Progress Bar */}
            <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden border border-slate-800">
              <div
                className={`h-full transition-all duration-300 ${
                  isOverBudget
                    ? 'bg-red-500'
                    : totalCost > contract.budget * 0.85
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(100, (totalCost / contract.budget) * 100)}%` }}
              />
            </div>

            {/* Selected Hardware Items Pill List */}
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {inventory.length === 0 ? (
                <p className="text-xs text-slate-500 italic py-2 text-center">
                  Belum ada hardware dipilih. Klik "Tambah" pada katalog di samping.
                </p>
              ) : (
                inventory.map((item, idx) => (
                  <div
                    key={`${item.id}-${idx}`}
                    className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800/80 text-xs"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Cpu className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="text-slate-200 truncate">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-mono text-slate-300 font-semibold tabular-nums">
                        ${item.price}
                      </span>
                      <button
                        onClick={() => {
                          sound.playClick();
                          onRemoveHardware(idx);
                        }}
                        className="text-slate-500 hover:text-red-400 p-0.5 rounded transition-colors"
                        title="Hapus"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Proceed CTA Button */}
            <button
              onClick={() => {
                sound.playRackMount();
                onProceedToHardware();
              }}
              disabled={!canProceed}
              className={`w-full py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all ${
                canProceed
                  ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 active:scale-[0.98]'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50'
              }`}
            >
              <span>Mulai Instalasi & Perakitan Rak</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            {!canProceed && (
              <p className="text-[11px] text-amber-400/80 text-center">
                {isOverBudget
                  ? 'Biaya melebihi batas budget klien!'
                  : 'Pilih minimal 1 Server Blade dan 1 Switch Jaringan untuk melanjutkan.'}
              </p>
            )}
          </div>
        </div>

        {/* Right Column: Belanja Hardware Catalog (like in image_0.png) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-slate-400 tracking-wider">
              Katalog Belanja Hardware
            </span>
            <span className="text-xs text-slate-400">
              Sisa Saldo Klien: <span className="font-mono font-bold text-emerald-400">${Math.max(0, remainingBudget).toLocaleString()}</span>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {HARDWARE_CATALOG.map((item) => {
              const inCartCount = inventory.filter((i) => i.id === item.id).length;
              return (
                <div
                  key={item.id}
                  className="group bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-xl p-4 flex flex-col justify-between transition-all"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors">
                        {item.name}
                      </span>
                      <span className="text-xs font-mono font-bold text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-900/50 shrink-0 tabular-nums">
                        ${item.price}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-400 leading-snug line-clamp-2">
                      {item.description}
                    </p>

                    <div className="flex items-center gap-3 text-[10px] text-slate-400 font-mono pt-1">
                      <span>Ukuran: {item.uSize}U</span>
                      {item.powerDrawWatts > 0 && <span>Daya: {item.powerDrawWatts}W</span>}
                      {item.coolingPowerBonus > 0 && (
                        <span className="text-cyan-400">+{item.coolingPowerBonus} CFM</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-800/80">
                    <span className="text-[11px] text-slate-400 font-medium">
                      {inCartCount > 0 ? `${inCartCount} di keranjang` : 'Belum dipilih'}
                    </span>
                    <button
                      onClick={() => {
                        sound.playClick();
                        onAddHardware(item);
                      }}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-amber-400 hover:text-slate-950 text-slate-200 border border-slate-700 transition-all flex items-center gap-1 active:scale-95"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Tambah</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
