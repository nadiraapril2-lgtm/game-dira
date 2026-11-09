import React, { useState } from 'react';
import { CableConnection, HardwareItem, InstalledComponent } from '../types/game';
import { ArrowRight, Cable, Check, Power, Server, ShieldCheck, Sparkles, Trash2 } from 'lucide-react';
import { sound } from '../utils/audio';

interface Phase2HardwareRackProps {
  rackSize: 12 | 24 | 42;
  inventory: HardwareItem[];
  installedComponents: InstalledComponent[];
  cables: CableConnection[];
  onMountHardware: (hardware: HardwareItem, slotU: number) => void;
  onUnmountHardware: (componentId: string) => void;
  onAddCable: (cable: CableConnection) => void;
  onRemoveCable: (cableId: string) => void;
  onAutoAssemble: () => void;
  onProceedToLogic: () => void;
}

export const Phase2HardwareRack: React.FC<Phase2HardwareRackProps> = ({
  rackSize,
  inventory,
  installedComponents,
  cables,
  onMountHardware,
  onUnmountHardware,
  onAddCable,
  onRemoveCable,
  onAutoAssemble,
  onProceedToLogic,
}) => {
  const [selectedTool, setSelectedTool] = useState<'patch_blue' | 'fiber_green' | 'power_black'>('patch_blue');
  const [cableSource, setCableSource] = useState<InstalledComponent | null>(null);

  // Filter items in inventory that are not yet mounted
  const mountedHardwareIds = new Set(installedComponents.map((c) => c.hardware.id));
  const unmountedItems = inventory.filter((item) => {
    // If multiple of same item bought, check counts
    const totalCount = inventory.filter((i) => i.id === item.id).length;
    const mountedCount = installedComponents.filter((c) => c.hardware.id === item.id).length;
    return mountedCount < totalCount;
  });

  // Calculate occupied U-height
  const occupiedSlots = new Set<number>();
  installedComponents.forEach((comp) => {
    for (let u = comp.slotU; u < comp.slotU + comp.hardware.uSize; u++) {
      occupiedSlots.add(u);
    }
  });

  // Check if minimum cabling is done (e.g. blade connected to switch or power)
  const hasPatchCable = cables.some((c) => c.type === 'patch_blue' || c.type === 'fiber_green');
  const hasPowerCable = cables.some((c) => c.type === 'power_black');
  const canProceed = installedComponents.length > 0 && (hasPatchCable || cables.length >= 2);

  const handleSlotClick = (slotU: number) => {
    if (unmountedItems.length === 0) return;
    const nextItem = unmountedItems[0];
    
    // Check if slot fits
    let canFit = true;
    for (let u = slotU; u < slotU + nextItem.uSize; u++) {
      if (u > rackSize || occupiedSlots.has(u)) {
        canFit = false;
        break;
      }
    }

    if (canFit) {
      sound.playRackMount();
      onMountHardware(nextItem, slotU);
    }
  };

  const handleComponentClickForCabling = (comp: InstalledComponent) => {
    if (!cableSource) {
      setCableSource(comp);
      sound.playClick();
    } else {
      if (cableSource.id === comp.id) {
        setCableSource(null);
        return;
      }

      // Create cable connection
      sound.playCablePlug();
      const newCable: CableConnection = {
        id: `cable_${Date.now()}`,
        type: selectedTool,
        fromComponentId: cableSource.id,
        toComponentId: comp.id,
        fromLabel: cableSource.hardware.name,
        toLabel: comp.hardware.name,
      };
      onAddCable(newCable);
      setCableSource(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider block">
            Fase 2
          </span>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Instalasi Rak & Pemasangan Kabel
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Pasang server blade ke dalam slot U rack, lalu hubungkan kabel patch data (biru) dan daya (hitam).
          </p>
        </div>

        {/* Auto Assemble Helper */}
        <button
          onClick={() => {
            sound.playRackMount();
            onAutoAssemble();
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 border border-slate-700 text-slate-300 hover:text-white hover:border-slate-500 transition-all self-start sm:self-auto"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Rakit Otomatis</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Interactive 12U/24U Server Rack Frame */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-2xl space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Server className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Server Rack Frame ({rackSize}U)
              </span>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">
              Terpakai: {occupiedSlots.size}/{rackSize}U
            </span>
          </div>

          {/* 3D-styled Rack Shell */}
          <div className="relative bg-slate-950 border-4 border-slate-800 rounded-xl p-3 shadow-inner max-h-[520px] overflow-y-auto">
            {/* Top Rack Fan Exhaust Vent */}
            <div className="w-full h-4 bg-slate-900 rounded mb-2 flex items-center justify-center gap-2 border border-slate-800">
              <div className="w-2 h-2 rounded-full bg-emerald-500/80 animate-pulse" />
              <div className="w-2 h-2 rounded-full bg-cyan-500/80 animate-pulse" />
              <span className="text-[9px] font-mono uppercase text-slate-500">Rack Exhaust Fan Grid</span>
            </div>

            {/* Vertical U-Slots Container */}
            <div className="space-y-1">
              {Array.from({ length: Math.min(16, rackSize) }).map((_, idx) => {
                const uSlot = idx + 1;
                const installed = installedComponents.find((c) => c.slotU === uSlot);
                const isPartOccupied = occupiedSlots.has(uSlot) && !installed;

                if (isPartOccupied) {
                  return null; // Covered by multi-U item above
                }

                if (installed) {
                  const isSelectedForCable = cableSource?.id === installed.id;
                  return (
                    <div
                      key={installed.id}
                      onClick={() => handleComponentClickForCabling(installed)}
                      className={`group relative rounded-lg border-2 p-2.5 transition-all cursor-pointer ${
                        isSelectedForCable
                          ? 'bg-amber-950/60 border-amber-400 shadow-md shadow-amber-500/20'
                          : 'bg-slate-900 border-slate-700 hover:border-slate-500'
                      }`}
                      style={{ height: `${installed.hardware.uSize * 42}px` }}
                    >
                      <div className="flex items-center justify-between h-full">
                        <div className="flex items-center gap-2.5">
                          {/* Unit Indicator */}
                          <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800">
                            U{installed.slotU}-{installed.slotU + installed.hardware.uSize - 1}
                          </span>

                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-white group-hover:text-amber-300">
                                {installed.hardware.name}
                              </span>
                              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                                {installed.hardware.uSize}U
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-400 block font-mono">
                              {installed.hardware.category.toUpperCase()} · {installed.hardware.powerDrawWatts}W
                            </span>
                          </div>
                        </div>

                        {/* Blinking LEDs and Port indicators */}
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            <span className="w-2 h-2 rounded-full bg-cyan-400" />
                          </div>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              sound.playClick();
                              onUnmountHardware(installed.id);
                            }}
                            className="p-1 rounded text-slate-500 hover:text-red-400 hover:bg-slate-800 transition-colors"
                            title="Lepas dari rak"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Cable connection badges attached */}
                      {cables.some((c) => c.fromComponentId === installed.id || c.toComponentId === installed.id) && (
                        <div className="absolute -bottom-1.5 left-6 flex items-center gap-1">
                          {cables
                            .filter((c) => c.fromComponentId === installed.id || c.toComponentId === installed.id)
                            .map((c) => (
                              <span
                                key={c.id}
                                className={`text-[8px] font-mono px-1.5 rounded-full font-bold uppercase ${
                                  c.type === 'patch_blue'
                                    ? 'bg-blue-600 text-white'
                                    : c.type === 'fiber_green'
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-zinc-700 text-zinc-200'
                                }`}
                              >
                                {c.type === 'patch_blue' ? 'CAT6' : c.type === 'fiber_green' ? 'FIBER' : 'PWR'}
                              </span>
                            ))}
                        </div>
                      )}
                    </div>
                  );
                }

                // Empty Slot
                return (
                  <div
                    key={`empty_${uSlot}`}
                    onClick={() => handleSlotClick(uSlot)}
                    className="h-10 rounded border border-dashed border-slate-800 hover:border-slate-600 bg-slate-950/40 hover:bg-slate-900/60 transition-all flex items-center justify-between px-3 cursor-pointer group"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-slate-600 group-hover:text-slate-400">
                        U{uSlot}
                      </span>
                      <span className="text-[11px] text-slate-600 group-hover:text-slate-300">
                        Slot Kosong
                      </span>
                    </div>
                    {unmountedItems.length > 0 && (
                      <span className="text-[10px] font-semibold text-amber-400/70 group-hover:text-amber-400">
                        + Pasang {unmountedItems[0].name.split(' ')[0]}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Floating Tool Palette & Cables matching image_0.png */}
        <div className="lg:col-span-5 space-y-5">
          {/* Cable Tool Selector (as in image_0.png floating menu) */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
            <span className="text-xs font-mono uppercase text-slate-400 tracking-wider block">
              Pilihan Alat Kabel (Wiring)
            </span>

            <div className="grid grid-cols-3 gap-2">
              {/* Blue Patch Cable */}
              <button
                onClick={() => {
                  sound.playClick();
                  setSelectedTool('patch_blue');
                }}
                className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all ${
                  selectedTool === 'patch_blue'
                    ? 'bg-blue-950/70 border-blue-500 text-white shadow-md shadow-blue-500/20'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="w-4 h-4 rounded-full bg-blue-500 mb-1.5 shadow-sm shadow-blue-500" />
                <span className="text-[11px] font-bold">Kabel Patch</span>
                <span className="text-[9px] text-slate-400 font-mono">RJ45 CAT6</span>
              </button>

              {/* Green Fiber Cable */}
              <button
                onClick={() => {
                  sound.playClick();
                  setSelectedTool('fiber_green');
                }}
                className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all ${
                  selectedTool === 'fiber_green'
                    ? 'bg-emerald-950/70 border-emerald-500 text-white shadow-md shadow-emerald-500/20'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="w-4 h-4 rounded-full bg-emerald-500 mb-1.5 shadow-sm shadow-emerald-500" />
                <span className="text-[11px] font-bold">Kabel Fiber</span>
                <span className="text-[9px] text-slate-400 font-mono">High Speed</span>
              </button>

              {/* Black Power Cable */}
              <button
                onClick={() => {
                  sound.playClick();
                  setSelectedTool('power_black');
                }}
                className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all ${
                  selectedTool === 'power_black'
                    ? 'bg-zinc-900 border-zinc-400 text-white shadow-md'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="w-4 h-4 rounded-full bg-zinc-300 mb-1.5" />
                <span className="text-[11px] font-bold">Kabel Power</span>
                <span className="text-[9px] text-slate-400 font-mono">C13 / PDU</span>
              </button>
            </div>

            {/* Cabling instructions */}
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-1">
              <p className="font-semibold text-slate-200">Cara Memasang Kabel:</p>
              <p className="text-[11px] text-slate-400">
                1. Klik perangkat sumber di rak (misal Server Blade).
              </p>
              <p className="text-[11px] text-slate-400">
                2. Klik perangkat tujuan di rak (misal Switch Gigabit atau UPS).
              </p>
              {cableSource && (
                <div className="mt-2 pt-2 border-t border-slate-800 flex items-center justify-between text-amber-400">
                  <span>Sumber aktif: {cableSource.hardware.name}</span>
                  <button
                    onClick={() => setCableSource(null)}
                    className="text-[10px] underline hover:text-amber-300"
                  >
                    Batal
                  </button>
                </div>
              )}
            </div>

            {/* Active Cable Connections List */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Kabel Terpasang ({cables.length})
              </span>
              {cables.length === 0 ? (
                <p className="text-[11px] text-slate-500 italic py-1">
                  Belum ada kabel terhubung. Pasang kabel data dan daya.
                </p>
              ) : (
                <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                  {cables.map((c) => (
                    <div
                      key={c.id}
                      className="flex items-center justify-between px-2.5 py-1 rounded bg-slate-950 border border-slate-800/80 text-[11px]"
                    >
                      <div className="flex items-center gap-1.5 truncate">
                        <span
                          className={`w-2 h-2 rounded-full shrink-0 ${
                            c.type === 'patch_blue'
                              ? 'bg-blue-500'
                              : c.type === 'fiber_green'
                              ? 'bg-emerald-500'
                              : 'bg-zinc-400'
                          }`}
                        />
                        <span className="text-slate-300 truncate">
                          {c.fromLabel.split(' ')[0]} ⇄ {c.toLabel.split(' ')[0]}
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          sound.playClick();
                          onRemoveCable(c.id);
                        }}
                        className="text-slate-500 hover:text-red-400 p-0.5"
                        title="Lepas kabel"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Unmounted Inventory Queue */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg space-y-3">
            <span className="text-xs font-mono uppercase text-slate-400 tracking-wider block">
              Hardware Menunggu Rakit ({unmountedItems.length})
            </span>

            {unmountedItems.length === 0 ? (
              <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-500/30 flex items-center gap-2 text-xs text-emerald-300">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Semua hardware belanjaan telah berhasil dipasang ke rak!</span>
              </div>
            ) : (
              <div className="space-y-1.5">
                {unmountedItems.map((item, idx) => (
                  <div
                    key={`${item.id}_${idx}`}
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800 text-xs"
                  >
                    <span className="text-slate-200 font-medium">{item.name}</span>
                    <button
                      onClick={() => handleSlotClick(1)}
                      className="px-2 py-1 rounded bg-amber-400/10 hover:bg-amber-400 text-amber-300 hover:text-slate-950 border border-amber-500/30 text-[10px] font-bold uppercase transition-all"
                    >
                      Pasang
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Next Step CTA */}
            <button
              onClick={() => {
                sound.playClick();
                onProceedToLogic();
              }}
              disabled={!canProceed}
              className={`w-full py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all mt-4 ${
                canProceed
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 active:scale-[0.98]'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50'
              }`}
            >
              <span>Lanjut ke Fase 2: Konfigurasi Jaringan (Tablet)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            {!canProceed && (
              <p className="text-[11px] text-amber-400/80 text-center">
                Pasang minimal perangkat ke rak dan hubungkan kabel data/daya.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
