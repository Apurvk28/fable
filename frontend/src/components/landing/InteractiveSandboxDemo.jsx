import React, { useState } from 'react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import {
  Play,
  RotateCcw,
  Sparkles,
  Bot,
  Wrench,
  Calculator,
  FileText,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowRight
} from 'lucide-react';

const SIMULATION_SCENARIOS = [
  {
    id: 'financial',
    label: 'Financial Analyst',
    tool: 'calculator',
    toolName: 'Calculator',
    icon: Calculator,
    agentName: 'Compound Interest Auditor',
    prompt: 'What is 15% compound interest on $12,500 over 3 years? Calculate it step by step.',
    toolCall: {
      tool: 'calculator',
      args: { expression: '12500 * (1 + 0.15) ^ 3' },
      output: { result: 19010.9375 },
      durationMs: 1,
    },
    finalResponse:
      'The investment will grow to **$19,010.94**.\n\nCalculation breakdown:\n1. Base formula: $12,500 × (1.15)³\n2. Factor: 1.15³ = 1.520875\n3. Final Balance: 12,500 × 1.520875 = **$19,010.94**\n4. Total Interest Earned: **$6,510.94**',
    tokens: 168,
    durationMs: 380,
  },
  {
    id: 'research',
    label: 'Research Assistant',
    tool: 'text_processor',
    toolName: 'Text Processor',
    icon: FileText,
    agentName: 'Paper Abstract Summarizer',
    prompt: 'Summarize the paper abstract on autonomous agent sandboxing and extract the top 3 keywords.',
    toolCall: {
      tool: 'text_processor',
      args: {
        action: 'summarize',
        text: 'Autonomous AI agents must operate under deterministic security boundaries with strict tool allowlists, turn limits, and audit trails...',
      },
      output: {
        summary: 'Autonomous AI agents require strict server-side sandboxing, turn limits, and persistent audit logs to prevent security vulnerabilities.',
        keywords: ['sandboxing', 'boundaries', 'audit'],
      },
      durationMs: 2,
    },
    finalResponse:
      '**Executive Summary:**\nAutonomous AI agents require strict server-side sandboxing, turn limits, and persistent audit logs to prevent security vulnerabilities.\n\n**Top Keywords:**\n• sandboxing\n• boundaries\n• audit',
    tokens: 192,
    durationMs: 410,
  },
  {
    id: 'event',
    label: 'Event Planner',
    tool: 'datetime',
    toolName: 'Date / Time',
    icon: Calendar,
    agentName: 'Milestone Schedule Coordinator',
    prompt: 'Calculate the exact number of days remaining until the product launch on 2026-12-01T00:00:00Z.',
    toolCall: {
      tool: 'datetime',
      args: {
        action: 'diff',
        from: '2026-10-15T00:00:00Z',
        to: '2026-12-01T00:00:00Z',
      },
      output: {
        days: 47,
        hours: 1128,
        minutes: 67680,
      },
      durationMs: 1,
    },
    finalResponse:
      'There are exactly **47 days** (1,128 hours) remaining until the product launch on December 1, 2026.\n\nMilestone recommendations:\n• Complete regression verification by Day 30\n• Freeze production staging by Day 40',
    tokens: 145,
    durationMs: 340,
  },
];

export const InteractiveSandboxDemo = () => {
  const [selectedScenarioIndex, setSelectedScenarioIndex] = useState(0);
  const [step, setStep] = useState('ready'); // 'ready' | 'simulating' | 'done'

  const activeScenario = SIMULATION_SCENARIOS[selectedScenarioIndex];
  const IconComp = activeScenario.icon;

  const handleRunSimulation = () => {
    setStep('simulating');
    setTimeout(() => {
      setStep('done');
    }, 700);
  };

  const handleReset = () => {
    setStep('ready');
  };

  return (
    <section id="simulation" className="py-20 border-b border-hairline bg-paper">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-10">
        {/* Section Header with Mandatory Simulation Disclaimer */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-hairline pb-6">
          <div className="max-w-2xl space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="accent" size="sm" className="font-mono text-[10px] tracking-wider uppercase font-semibold">
                Interactive Simulation · No Sign-in Required
              </Badge>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-normal text-ink tracking-tight">
              Test Agent Reasoning in Simulation
            </h2>
            <p className="text-sm text-ink-secondary leading-relaxed font-sans">
              Experience Fable's model ↔ tool reasoning loop interactively. This client-side sandbox uses predefined scenarios to demonstrate deterministic tool calling without triggering live AI billing.
            </p>
          </div>

          <div className="p-3 bg-white rounded-sm border border-hairline text-xs font-mono text-ink-secondary self-start sm:self-auto">
            <span className="text-[9px] uppercase font-bold text-ink block mb-0.5">Runtime Isolation</span>
            <span className="text-[11px] text-ink-muted">Pre-computed deterministic output · 0 API keys</span>
          </div>
        </div>

        {/* Scenario Switcher Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-mono uppercase tracking-wider text-ink-muted mr-1">
            Choose Scenario:
          </span>
          {SIMULATION_SCENARIOS.map((sc, idx) => (
            <button
              key={sc.id}
              type="button"
              onClick={() => {
                setSelectedScenarioIndex(idx);
                setStep('ready');
              }}
              className={`px-3 py-1.5 rounded-sm border text-xs font-sans font-medium transition-all ${
                selectedScenarioIndex === idx
                  ? 'bg-ink text-white border-ink shadow-editorial'
                  : 'bg-white text-ink-secondary border-hairline hover:border-ink/50'
              }`}
            >
              {sc.label} ({sc.toolName})
            </button>
          ))}
        </div>

        {/* Simulation Workbench Card */}
        <div className="bg-white rounded-sm border border-hairline shadow-editorial-lg overflow-hidden">
          {/* Card Top Strip */}
          <div className="p-4 bg-paper-muted border-b border-hairline flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 font-bold text-ink">
                <Bot className="w-4 h-4 text-ink-secondary" />
                <span>{activeScenario.agentName}</span>
              </div>
              <span className="text-ink-muted">·</span>
              <Badge variant="success" size="sm" className="text-[10px] flex items-center gap-1">
                <IconComp className="w-3 h-3" />
                <span>Tool: {activeScenario.toolName}</span>
              </Badge>
            </div>

            <Badge variant="outline" size="sm" className="font-mono text-[9px] uppercase">
              Interactive Simulation · No Sign-in Required
            </Badge>
          </div>

          <div className="p-6 space-y-6">
            {/* Input Prompt Box */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono uppercase tracking-wider text-ink-muted block">
                User Task Input:
              </span>
              <div className="p-3.5 bg-paper rounded-sm border border-hairline text-xs font-sans text-ink font-medium">
                {activeScenario.prompt}
              </div>
            </div>

            {/* Run / Simulating Actions */}
            <div className="flex items-center gap-3 pt-1">
              <Button
                variant="primary"
                size="md"
                icon={Play}
                isLoading={step === 'simulating'}
                disabled={step === 'simulating'}
                onClick={handleRunSimulation}
              >
                {step === 'simulating' ? 'Simulating Reasoning Loop...' : 'Run Simulation'}
              </Button>

              {step === 'done' && (
                <Button variant="ghost" size="md" icon={RotateCcw} onClick={handleReset}>
                  Reset Run
                </Button>
              )}
            </div>

            {/* Simulated Execution Telemetry */}
            {step === 'simulating' && (
              <div className="p-8 text-center space-y-3 font-mono text-xs text-ink-secondary bg-paper rounded-sm border border-hairline">
                <div className="w-8 h-8 border-2 border-ink border-t-transparent rounded-full animate-spin mx-auto" />
                <p>Simulating tool parameter validation &amp; sandbox calculation...</p>
              </div>
            )}

            {step === 'done' && (
              <div className="space-y-5 pt-3 border-t border-hairline animate-fadeIn">
                {/* Simulated Tool Execution Trace */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-ink font-semibold flex items-center gap-1.5">
                      <Wrench className="w-3.5 h-3.5 text-ink-secondary" />
                      Simulated Tool Execution Trace (Turn #1)
                    </span>
                    <span className="text-[10px] font-mono text-status-success">
                      Sandboxed Execution (1ms)
                    </span>
                  </div>

                  <div className="border border-hairline rounded-sm overflow-hidden bg-white shadow-sm font-mono text-xs">
                    <div className="p-2.5 bg-paper-muted border-b border-hairline flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <IconComp className="w-3.5 h-3.5 text-ink" />
                        <span className="font-semibold text-ink">{activeScenario.tool}</span>
                        <Badge variant="success" size="sm" className="text-[9px]">
                          Success (Simulated)
                        </Badge>
                      </div>
                      <span className="text-[10px] text-ink-muted">
                        Latency: {activeScenario.toolCall.durationMs}ms
                      </span>
                    </div>

                    <div className="p-3 grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white text-[11px]">
                      <div>
                        <span className="text-[9px] uppercase tracking-wider text-ink-muted block mb-1">
                          Arguments Fed to Sandbox:
                        </span>
                        <pre className="p-2 bg-paper rounded-sm border border-hairline text-ink overflow-x-auto">
                          {JSON.stringify(activeScenario.toolCall.args, null, 2)}
                        </pre>
                      </div>
                      <div>
                        <span className="text-[9px] uppercase tracking-wider text-ink-muted block mb-1">
                          Deterministic Return:
                        </span>
                        <pre className="p-2 bg-emerald-50/50 border border-emerald-200 rounded-sm text-ink overflow-x-auto">
                          {JSON.stringify(activeScenario.toolCall.output, null, 2)}
                        </pre>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Final Synthesized Output */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-ink font-semibold flex items-center gap-1.5">
                    <Bot className="w-3.5 h-3.5 text-ink" />
                    Final Synthesized Agent Output
                  </span>
                  <div className="p-4 bg-paper rounded-sm border border-hairline text-xs font-sans text-ink leading-relaxed whitespace-pre-wrap">
                    {activeScenario.finalResponse}
                  </div>
                </div>

                {/* Performance Stats Strip */}
                <div className="p-3 bg-paper-muted rounded-sm border border-hairline flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono text-ink-secondary">
                  <span>Duration: <strong>{activeScenario.durationMs}ms</strong></span>
                  <span>·</span>
                  <span>Total Tokens: <strong>{activeScenario.tokens}</strong></span>
                  <span>·</span>
                  <span className="text-status-success font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Deterministic Verification Complete</span>
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
