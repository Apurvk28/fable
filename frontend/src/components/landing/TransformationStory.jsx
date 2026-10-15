import React from 'react';
import { Badge } from '../ui/Badge';
import {
  MessageSquare,
  FileCode,
  Wrench,
  Activity,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';

export const TransformationStory = () => {
  const steps = [
    {
      num: '01',
      title: 'The Natural-Language Idea',
      subtitle: 'Input Intent',
      desc: 'You describe what the agent should accomplish in plain English. No boilerplate code, scattered configuration files, or SDK plumbing required.',
      example: '"I need an accountant agent that audits invoices, applies discounts, and computes exact interest."',
      icon: MessageSquare,
      accent: 'border-l-ink',
    },
    {
      num: '02',
      title: 'Structured Configuration',
      subtitle: 'AI Proposal or Manual Crafting',
      desc: 'Fable constructs a formal agent blueprint: a verified system persona, temperature constraints, execution timeouts, and an approved model identifier.',
      example: 'Model: Qwen 27B · Temperature: 0.7 · Max Turns: 3 · Strict Permissions',
      icon: FileCode,
      accent: 'border-l-ink',
    },
    {
      num: '03',
      title: 'Bounded Capability Sockets',
      subtitle: 'Deterministic Tool Sandboxes',
      desc: 'Connect built-in utilities from our hardened registry (Calculator, Text Processor, Date/Time). Server-side permissions prevent arbitrary code execution.',
      example: 'Enabled Tools: [calculator] · Argument schema: { expression: string }',
      icon: Wrench,
      accent: 'border-l-fable-chartreuse',
    },
    {
      num: '04',
      title: 'Observable Autonomous Execution',
      subtitle: 'Multi-turn Loop & Immutable Telemetry',
      desc: 'The agent runs tasks through a multi-turn reasoning loop. Every tool invocation, argument, return value, and latency metric is saved forever in an immutable snapshot.',
      example: 'Status: Completed · 1 Tool Call · 430ms · 182 Tokens · Immutable Snapshot',
      icon: Activity,
      accent: 'border-l-status-success',
    },
  ];

  return (
    <section id="how-it-works" className="py-20 border-b border-hairline bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-12">
        {/* Section Header */}
        <div className="max-w-2xl space-y-3">
          <Badge variant="outline" size="sm" className="font-mono text-[10px] uppercase tracking-wider">
            Architecture Sequence
          </Badge>
          <h2 className="font-serif text-3xl sm:text-4xl font-normal text-ink tracking-tight">
            From Thought to Autonomous Blueprint
          </h2>
          <p className="text-sm text-ink-secondary leading-relaxed">
            How a high-level developer requirement transforms into a bounded, observable AI agent in four deterministic steps.
          </p>
        </div>

        {/* 4-Step Editorial Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.num}
                className={`p-5 rounded-sm border border-hairline bg-paper flex flex-col justify-between space-y-4 shadow-editorial hover:shadow-editorial-lift transition-all border-l-4 ${step.accent}`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-ink-muted">
                      {step.num}
                    </span>
                    <Icon className="w-4 h-4 text-ink-secondary" />
                  </div>

                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-ink-muted block">
                      {step.subtitle}
                    </span>
                    <h3 className="font-serif text-lg font-bold text-ink mt-0.5">
                      {step.title}
                    </h3>
                  </div>

                  <p className="text-xs text-ink-secondary leading-relaxed font-sans">
                    {step.desc}
                  </p>
                </div>

                <div className="p-2.5 bg-white rounded-sm border border-hairline font-mono text-[11px] text-ink-secondary leading-tight">
                  <span className="text-[9px] uppercase tracking-wider text-ink-muted block mb-1">
                    Blueprint Artifact
                  </span>
                  <p className="italic text-ink">{step.example}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
