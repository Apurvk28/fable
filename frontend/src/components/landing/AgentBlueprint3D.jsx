import React, { useState, useEffect } from 'react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import {
  Layers,
  Bot,
  Cpu,
  Wrench,
  ShieldCheck,
  Calculator,
  FileText,
  Calendar,
  Sparkles,
  Sliders,
  RotateCcw
} from 'lucide-react';

export const AgentBlueprint3D = () => {
  // View mode: 'stacked' | 'layer-tools' | 'layer-model' | 'layer-prompt'
  const [activeLayer, setActiveLayer] = useState('stacked');
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Check user preference for reduced motion
  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setPrefersReducedMotion(mediaQuery.matches);
      const listener = (e) => setPrefersReducedMotion(e.matches);
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    }
  }, []);

  return (
    <section id="blueprint" className="py-20 border-b border-hairline bg-paper overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-12">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div className="max-w-2xl space-y-3">
            <Badge variant="accent" size="sm" className="font-mono text-[10px] uppercase tracking-wider font-semibold">
              Spatial Architecture
            </Badge>
            <h2 className="font-serif text-3xl sm:text-4xl font-normal text-ink tracking-tight">
              The Layered Agent Blueprint
            </h2>
            <p className="text-sm text-ink-secondary leading-relaxed font-sans">
              An agent in Fable is not an unpredictable monolith. It is composed of three decoupled, auditable layers assembled into an isolated runtime.
            </p>
          </div>

          {/* Interactive Layer Inspector Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-white border border-hairline rounded-sm shadow-editorial self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setActiveLayer('stacked')}
              className={`px-2.5 py-1 text-xs font-mono rounded-sm transition-colors ${
                activeLayer === 'stacked'
                  ? 'bg-ink text-white font-semibold'
                  : 'text-ink-secondary hover:text-ink'
              }`}
            >
              Isometric Stack
            </button>
            <button
              type="button"
              onClick={() => setActiveLayer('layer-tools')}
              className={`px-2.5 py-1 text-xs font-mono rounded-sm transition-colors ${
                activeLayer === 'layer-tools'
                  ? 'bg-ink text-white font-semibold'
                  : 'text-ink-secondary hover:text-ink'
              }`}
            >
              Layer 3 (Tools)
            </button>
            <button
              type="button"
              onClick={() => setActiveLayer('layer-model')}
              className={`px-2.5 py-1 text-xs font-mono rounded-sm transition-colors ${
                activeLayer === 'layer-model'
                  ? 'bg-ink text-white font-semibold'
                  : 'text-ink-secondary hover:text-ink'
              }`}
            >
              Layer 2 (Model)
            </button>
            <button
              type="button"
              onClick={() => setActiveLayer('layer-prompt')}
              className={`px-2.5 py-1 text-xs font-mono rounded-sm transition-colors ${
                activeLayer === 'layer-prompt'
                  ? 'bg-ink text-white font-semibold'
                  : 'text-ink-secondary hover:text-ink'
              }`}
            >
              Layer 1 (Identity)
            </button>
          </div>
        </div>

        {/* 3D Visual Stage Container */}
        <div className="relative bg-white rounded-sm border border-hairline shadow-editorial-lg p-6 sm:p-12 overflow-hidden min-h-[460px] flex items-center justify-center">
          {/* Architectural Guidelines */}
          <div className="absolute inset-0 bg-[radial-gradient(#1213160a_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />

          {/* Reduced Motion or Mobile View: Clean Flat Stack */}
          {prefersReducedMotion ? (
            <div className="w-full max-w-xl space-y-4 font-mono text-xs z-10">
              <div className="p-4 bg-paper rounded-sm border border-l-4 border-l-status-success space-y-2">
                <span className="text-[10px] uppercase tracking-wider text-ink-muted">Layer 3 · Tool Sockets</span>
                <div className="font-bold text-sm text-ink font-sans">Deterministic Tool Registry</div>
                <p className="text-ink-secondary font-sans">Calculator, Text Processor, Date/Time with server-side validation.</p>
              </div>

              <div className="p-4 bg-paper rounded-sm border border-l-4 border-l-ink space-y-2">
                <span className="text-[10px] uppercase tracking-wider text-ink-muted">Layer 2 · Reasoning Core</span>
                <div className="font-bold text-sm text-ink font-sans">Groq LLM Engine (Illustrative: Qwen 27B)</div>
                <p className="text-ink-secondary font-sans">Multi-turn loop capped at 3 turns max. 30s execution timeout.</p>
              </div>

              <div className="p-4 bg-paper rounded-sm border border-l-4 border-l-fable-chartreuse space-y-2">
                <span className="text-[10px] uppercase tracking-wider text-ink-muted">Layer 1 · System Blueprint</span>
                <div className="font-bold text-sm text-ink font-sans">Identity &amp; Persona Instructions</div>
                <p className="text-ink-secondary font-sans">Immutable configuration snapshot preserved at runtime.</p>
              </div>
            </div>
          ) : (
            /* CSS 3D Perspective Isometric Assembly */
            <div
              className="relative w-full max-w-lg h-[340px] flex items-center justify-center transition-all duration-700 select-none"
              style={{
                perspective: '1200px',
              }}
            >
              <div
                className="relative w-full max-w-md h-[220px] transition-transform duration-700 ease-out"
                style={{
                  transformStyle: 'preserve-3d',
                  transform:
                    activeLayer === 'stacked'
                      ? 'rotateX(58deg) rotateZ(-32deg) rotateY(4deg)'
                      : activeLayer === 'layer-tools'
                      ? 'rotateX(20deg) rotateZ(-10deg) translateY(-20px)'
                      : activeLayer === 'layer-model'
                      ? 'rotateX(20deg) rotateZ(-10deg) translateY(0px)'
                      : 'rotateX(20deg) rotateZ(-10deg) translateY(20px)',
                }}
              >
                {/* Layer 1: Identity & Instructions (Bottom Plane) */}
                <div
                  className={`absolute inset-0 bg-white/95 rounded-sm border border-hairline p-4 shadow-editorial transition-all duration-500 flex flex-col justify-between ${
                    activeLayer === 'layer-prompt'
                      ? 'ring-2 ring-ink shadow-editorial-lift scale-105 z-30'
                      : 'hover:border-ink/60'
                  }`}
                  style={{
                    transform:
                      activeLayer === 'stacked'
                        ? 'translateZ(0px)'
                        : activeLayer === 'layer-prompt'
                        ? 'translateZ(90px)'
                        : 'translateZ(-40px) opacity(0.3)',
                  }}
                  onClick={() => setActiveLayer('layer-prompt')}
                >
                  <div className="flex items-center justify-between border-b border-hairline pb-2">
                    <div className="flex items-center gap-2">
                      <Bot className="w-3.5 h-3.5 text-ink" />
                      <span className="font-mono text-[11px] font-bold text-ink">
                        Layer 1: Identity &amp; System Blueprint
                      </span>
                    </div>
                    <Badge variant="outline" size="sm" className="text-[9px] font-mono">
                      FOUNDATION
                    </Badge>
                  </div>
                  <p className="font-mono text-[10px] text-ink-secondary leading-relaxed bg-paper p-2 rounded-sm border border-hairline">
                    "You are a rigorous financial analyst. You strictly compute compound interest and loan schedules using the calculator."
                  </p>
                  <div className="flex items-center justify-between text-[9px] font-mono text-ink-muted pt-1">
                    <span>Snapshot: Immutable</span>
                    <span>Role: Auditor</span>
                  </div>
                </div>

                {/* Layer 2: Model & Reasoning Engine (Middle Plane) */}
                <div
                  className={`absolute inset-0 bg-paper/95 rounded-sm border border-hairline p-4 shadow-editorial transition-all duration-500 flex flex-col justify-between ${
                    activeLayer === 'layer-model'
                      ? 'ring-2 ring-ink shadow-editorial-lift scale-105 z-30'
                      : 'hover:border-ink/60'
                  }`}
                  style={{
                    transform:
                      activeLayer === 'stacked'
                        ? 'translateZ(55px)'
                        : activeLayer === 'layer-model'
                        ? 'translateZ(90px)'
                        : 'translateZ(-20px) opacity(0.3)',
                  }}
                  onClick={() => setActiveLayer('layer-model')}
                >
                  <div className="flex items-center justify-between border-b border-hairline pb-2">
                    <div className="flex items-center gap-2">
                      <Cpu className="w-3.5 h-3.5 text-ink" />
                      <span className="font-mono text-[11px] font-bold text-ink">
                        Layer 2: Inference Core (Illustrative)
                      </span>
                    </div>
                    <Badge variant="accent" size="sm" className="text-[9px] font-mono">
                      QWEN 27B · GROQ
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                    <div className="p-1.5 bg-white rounded-sm border border-hairline">
                      <span className="text-ink-muted block text-[8px] uppercase">Loop Hard Cap</span>
                      <span className="text-ink font-bold">3 Turns Max</span>
                    </div>
                    <div className="p-1.5 bg-white rounded-sm border border-hairline">
                      <span className="text-ink-muted block text-[8px] uppercase">Timeout Guard</span>
                      <span className="text-ink font-bold">30s Abort</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-[9px] font-mono text-ink-muted pt-1">
                    <span>Provider: Groq Cloud</span>
                    <span className="text-[8px] text-ink-muted italic">* Illustrative configuration</span>
                  </div>
                </div>

                {/* Layer 3: Capability Sandboxes (Top Plane) */}
                <div
                  className={`absolute inset-0 bg-white/95 rounded-sm border border-hairline p-4 shadow-editorial transition-all duration-500 flex flex-col justify-between ${
                    activeLayer === 'layer-tools'
                      ? 'ring-2 ring-ink shadow-editorial-lift scale-105 z-30'
                      : 'hover:border-ink/60'
                  }`}
                  style={{
                    transform:
                      activeLayer === 'stacked'
                        ? 'translateZ(110px)'
                        : activeLayer === 'layer-tools'
                        ? 'translateZ(90px)'
                        : 'translateZ(0px) opacity(0.3)',
                  }}
                  onClick={() => setActiveLayer('layer-tools')}
                >
                  <div className="flex items-center justify-between border-b border-hairline pb-2">
                    <div className="flex items-center gap-2">
                      <Wrench className="w-3.5 h-3.5 text-status-success" />
                      <span className="font-mono text-[11px] font-bold text-ink">
                        Layer 3: Permitted Tool Sockets
                      </span>
                    </div>
                    <Badge variant="success" size="sm" className="text-[9px] font-mono">
                      3 TOOLS ACTIVE
                    </Badge>
                  </div>

                  <div className="flex flex-wrap gap-1.5 py-1">
                    <Badge variant="success" size="sm" className="text-[10px] flex items-center gap-1 font-mono">
                      <Calculator className="w-2.5 h-2.5" />
                      <span>Calculator (Safe Math)</span>
                    </Badge>
                    <Badge variant="outline" size="sm" className="text-[10px] flex items-center gap-1 font-mono">
                      <FileText className="w-2.5 h-2.5" />
                      <span>Text Processor</span>
                    </Badge>
                    <Badge variant="outline" size="sm" className="text-[10px] flex items-center gap-1 font-mono">
                      <Calendar className="w-2.5 h-2.5" />
                      <span>Date/Time</span>
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between text-[9px] font-mono text-ink-muted pt-1 border-t border-hairline/60">
                    <span className="text-status-success font-semibold">Strict Server Allowlist</span>
                    <span>No Arbitrary Code</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Perspective Legend Annotation */}
          <div className="absolute bottom-3 right-4 flex items-center gap-2 text-[10px] font-mono text-ink-muted">
            <span className="w-1.5 h-1.5 rounded-full bg-ink" />
            <span>Interactive 3D Spatial Assembly (CSS Perspective)</span>
          </div>
        </div>
      </div>
    </section>
  );
};
