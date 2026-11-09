import React, { useState } from 'react';
import { UNITY_CSHARP_SCRIPT } from '../utils/csharpCode';
import { ClientContract } from '../types/game';
import { Check, Copy, FileCode, Image, Layers, Sparkles, Terminal, X, ExternalLink } from 'lucide-react';
import { sound } from '../utils/audio';

interface PromptStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportGeneratedTicket: (ticket: ClientContract) => void;
}

export const PromptStudioModal: React.FC<PromptStudioModalProps> = ({
  isOpen,
  onClose,
  onImportGeneratedTicket,
}) => {
  const [activeTab, setActiveTab] = useState<'visual' | '3d' | 'code' | 'narrative' | 'reference'>('visual');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationResult, setGenerationResult] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, id: string) => {
    sound.playClick();
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleGenerateAiTicket = async () => {
    sound.playClick();
    setIsGenerating(true);
    setGenerationResult(null);

    try {
      const res = await fetch('/api/generate-ticket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ difficulty: 'medium' }),
      });
      const data = await res.json();
      if (data.ticket) {
        setGenerationResult(`Tiket Berhasil Digenerate: ${data.ticket.clientName} ($${data.ticket.budget}) - Sumber: ${data.source}`);
        onImportGeneratedTicket(data.ticket);
        sound.playVictory();
      }
    } catch (err) {
      console.error('Failed to generate ticket:', err);
      setGenerationResult('Gagal menghubungi backend Gemini. Menggunakan template lokal.');
    } finally {
      setIsGenerating(false);
    }
  };

  const PROMPT_VISUAL = `Game UI art style, cozy low-poly 3D render, vibrant but soft lighting, isometric view. Concept: A neat small home garage workshop with a wooden desk and a desktop computer, blueprints on the desk, server racks in the corner, blue and green cable trays, network indicator LEDs blinking. Unified low-poly art style like image_0.png. Color palette: orange, blue, green, warm wood. High resolution, detailed props.`;

  const PROMPT_3D = `Low-poly 3D model, isometric view, game asset, hard-surface. Subject: A standard black 42U server rack, open-frame, modular slots with simple server blade modules already inserted. Small, non-moving cooling fans on the back. A patch panel with small RJ45 ports. Unified cozy low-poly art style like image_0.png.`;

  const PROMPT_CODE = `Generate a Unity C# script for a fundamental network simulation logic based on the 'Network Architect' game concept (image_0.png). The script should manage a 'ServerRack' object. Features needed:
- A float variable for 'temperature'.
- A variable for 'coolingPower' (e.g., from an AC unit object).
- Update logic: temperature increases slowly over time based on the number of 'ServerBlade' children, but is decreased by 'coolingPower'.
- Trigger an event if 'temperature' exceeds 75°C (similar to the Overheat Crisis in image_0.png).
- A basic data structure to store 'ServerBlades' properties (e.g., ID, PowerDraw, TrafficLoad).`;

  const PROMPT_NARRATIVE = `Generate 5 unique, varied customer ticket scenarios for the game 'Network Architect: Data Center Tycoon' (image_0.png). Each scenario must follow this data-driven template:
Clientele Type: (e.g., Warkop, Bank, Tech Startup)
Initial Goal: (e.g., Build basic public Wi-Fi, High-Security Database server)
Budget: (e.g., $500, $20,000)
Core Network Requirement: (e.g., Max 50 VLANs, Low latency connection, 1Gbps Bandwidth, Firewall Rule for blocking certain ports)
Hidden Crisis Event: (e.g., Random DDoS attack 3 minutes after going live, UPS failure, Power surge from old wiring).`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                AI Prompt Studio & Toolkit
              </h3>
              <p className="text-xs text-slate-400">
                Koleksi prompt standar (Visual, 3D, Unity C#, dan Tiket Misi) sesuai dokumen desain.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1 px-6 pt-3 border-b border-slate-800 bg-slate-950 overflow-x-auto">
          <button
            onClick={() => setActiveTab('visual')}
            className={`px-3 py-2 text-xs font-semibold rounded-t-lg transition-colors flex items-center gap-1.5 border-b-2 ${
              activeTab === 'visual'
                ? 'border-amber-400 text-amber-400 bg-slate-900/50'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Image className="w-3.5 h-3.5" />
            <span>1. Prompt Visual UI</span>
          </button>

          <button
            onClick={() => setActiveTab('3d')}
            className={`px-3 py-2 text-xs font-semibold rounded-t-lg transition-colors flex items-center gap-1.5 border-b-2 ${
              activeTab === '3d'
                ? 'border-amber-400 text-amber-400 bg-slate-900/50'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>2. Prompt Model 3D</span>
          </button>

          <button
            onClick={() => setActiveTab('code')}
            className={`px-3 py-2 text-xs font-semibold rounded-t-lg transition-colors flex items-center gap-1.5 border-b-2 ${
              activeTab === 'code'
                ? 'border-amber-400 text-amber-400 bg-slate-900/50'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>3. Script Unity C#</span>
          </button>

          <button
            onClick={() => setActiveTab('narrative')}
            className={`px-3 py-2 text-xs font-semibold rounded-t-lg transition-colors flex items-center gap-1.5 border-b-2 ${
              activeTab === 'narrative'
                ? 'border-amber-400 text-amber-400 bg-slate-900/50'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>4. Generator Tiket Klien</span>
          </button>

          <button
            onClick={() => setActiveTab('reference')}
            className={`px-3 py-2 text-xs font-semibold rounded-t-lg transition-colors flex items-center gap-1.5 border-b-2 ${
              activeTab === 'reference'
                ? 'border-amber-400 text-amber-400 bg-slate-900/50'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Referensi Gambar</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Tab 1: Visual Art Prompt */}
          {activeTab === 'visual' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white">Prompt untuk Visual Gaya Game (UI & Ilustrasi)</h4>
                  <p className="text-xs text-slate-400">
                    Gunakan di Midjourney, Stable Diffusion, atau Imagen untuk membuat latar belakang, ikon, atau ilustrasi karakter.
                  </p>
                </div>
                <button
                  onClick={() => copyToClipboard(PROMPT_VISUAL, 'visual')}
                  className="px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all"
                >
                  {copiedId === 'visual' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedId === 'visual' ? 'Tersalin!' : 'Salin Prompt'}</span>
                </button>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-amber-200 leading-relaxed select-all">
                {PROMPT_VISUAL}
              </div>

              <div className="p-3.5 rounded-lg bg-slate-900/60 border border-slate-800 text-xs text-slate-300 space-y-1">
                <span className="font-semibold text-slate-200">Tips Penggunaan:</span>
                <p>• Rekomendasi Aspect Ratio: 16:9 untuk background landscape atau 1:1 untuk ikon.</p>
                <p>• Palette: orange, blue, green, warm wood dengan pencahayaan cozy low-poly.</p>
              </div>
            </div>
          )}

          {/* Tab 2: 3D Model Prompt */}
          {activeTab === '3d' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white">Prompt untuk Model 3D (Hardware & Ruangan)</h4>
                  <p className="text-xs text-slate-400">
                    Gunakan di Tripo3D, Meshy, atau Blender AI untuk generate aset rak 42U dan modular blade.
                  </p>
                </div>
                <button
                  onClick={() => copyToClipboard(PROMPT_3D, '3d')}
                  className="px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all"
                >
                  {copiedId === '3d' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedId === '3d' ? 'Tersalin!' : 'Salin Prompt'}</span>
                </button>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-amber-200 leading-relaxed select-all">
                {PROMPT_3D}
              </div>

              <div className="p-3.5 rounded-lg bg-slate-900/60 border border-slate-800 text-xs text-slate-300 space-y-1">
                <span className="font-semibold text-slate-200">Spesifikasi Objek 3D:</span>
                <p>• Target Poligon: Low-poly hard-surface game asset.</p>
                <p>• Komponen: Open-frame 42U rack, RJ45 patch ports, modular blade slots, fan exhaust.</p>
              </div>
            </div>
          )}

          {/* Tab 3: Unity C# Script Viewer */}
          {activeTab === 'code' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white">Logika Script Unity C# (ServerRack & Thermal Dynamics)</h4>
                  <p className="text-xs text-slate-400">
                    Sesuai Prompt 3: Mengelola variabel temperature, coolingPower, ServerBlade, dan event Overheat &gt; 75°C.
                  </p>
                </div>
                <button
                  onClick={() => copyToClipboard(UNITY_CSHARP_SCRIPT, 'code')}
                  className="px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all"
                >
                  {copiedId === 'code' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedId === 'code' ? 'Tersalin!' : 'Salin Script C#'}</span>
                </button>
              </div>

              <div className="rounded-xl bg-black border border-slate-800 p-4 max-h-96 overflow-y-auto">
                <pre className="font-mono text-xs text-emerald-400 leading-relaxed whitespace-pre">
                  {UNITY_CSHARP_SCRIPT}
                </pre>
              </div>
            </div>
          )}

          {/* Tab 4: Narrative Procedural Mission Generator */}
          {activeTab === 'narrative' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white">Prompt Narasi Misi & Procedural Ticket Generator</h4>
                  <p className="text-xs text-slate-400">
                    Template prompt LLM untuk membuat tiket klien prosedural dengan hidden crisis event.
                  </p>
                </div>
                <button
                  onClick={() => copyToClipboard(PROMPT_NARRATIVE, 'narrative')}
                  className="px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all"
                >
                  {copiedId === 'narrative' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedId === 'narrative' ? 'Tersalin!' : 'Salin Prompt'}</span>
                </button>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-amber-200 leading-relaxed select-all">
                {PROMPT_NARRATIVE}
              </div>

              {/* Live Gemini Ticket Generator Button */}
              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-white block">
                      Generate Tiket Baru dengan Gemini API
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Panggil model AI untuk menciptakan skenario pelanggan dinamis dan langsung masukkan ke game.
                    </span>
                  </div>
                  <button
                    onClick={handleGenerateAiTicket}
                    disabled={isGenerating}
                    className="px-4 py-2 rounded-lg bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-orange-500/20 active:scale-95 transition-all whitespace-nowrap"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>{isGenerating ? 'Menghasilkan...' : 'Generate Tiket AI'}</span>
                  </button>
                </div>

                {generationResult && (
                  <p className="text-xs font-mono text-emerald-400 bg-emerald-950/50 p-2.5 rounded-lg border border-emerald-800/60">
                    {generationResult}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Tab 5: Reference Image Inspector */}
          {activeTab === 'reference' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white">Infografis Konsep Game (image_0.png)</h4>
                  <p className="text-xs text-slate-400">
                    Visual alur 4 fase: Kontrak → Instalasi & Kabel → Konfigurasi Jaringan → Krisis DDoS & Overheat → Evaluasi & Ekspansi.
                  </p>
                </div>
              </div>

              <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-900 shadow-xl">
                <img
                  src="/assets/aistudio/Gemini_Generated_Image_bx00fmbx00fmbx00_4e4a935b.jpg"
                  alt="Network Architect Data Center Tycoon Concept"
                  className="w-full h-auto object-contain max-h-[480px]"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
