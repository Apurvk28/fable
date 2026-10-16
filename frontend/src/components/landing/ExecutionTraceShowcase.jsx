import React from 'react';
import { Badge } from '../ui/Badge';
import {
  Activity,
  CheckCircle2,
  Clock,
  Cpu,
  ShieldCheck,
  Bot,
  Wrench,
  Calculator,
  ChevronDown
} from 'lucide-react';

export const ExecutionTraceShowcase = () => {
  return (
    <section className="py-20 border-b border-hairline bg-paper">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-12">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div className="max-w-2xl space-y-3">
            <Badge variant="outline" size="sm" className="font-mono text-[10px] uppercase tracking-wider">
              Observability &amp; Audit Traces
            </Badge>
            <h2 className="font-serif text-3xl sm:text-4xl font-normal text-ink tracking-tight">
              Never Guess What Happened
            </h2>
            <p className="text-sm text-ink-secondary leading-relaxed font-sans">
              Generic platforms hide reasoning behind simple loading spinners. Fable records every turn, argument, sandbox return, and token count forever in an immutable snapshot.
            </p>
          </div>

          <Badge variant="accent" size="sm" className="font-mono text-[10px] self-start sm:self-auto">
            Audit Guarantee: Zero Retroactive Drift
          </Badge>
        </div>

        {/* Illustrative Execution Trace Inspector Card */}
        <div className="bg-paper rounded-sm border border-hairline shadow-editorial-lg p-6 sm:p-8 space-y-6">
          {/* Header Strip */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-hairline">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="font-serif text-lg font-bold text-ink">
                  Execution Trace Inspector
                </span>
                <Badge variant="success" size="sm" className="font-mono text-[10px] flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Completed (200 OK)</span>
                </Badge>
                <Badge variant="outline" size="sm" className="font-mono text-[10px] uppercase">
                  Task Mode
                </Badge>
              </div>
            </div>

            <span className="text-[11px] font-mono text-ink-muted">
              * Illustrative Production Run (Turn 1/3)
            </span>
          </div>

          {/* Trace Content Flow */}
          <div className="space-y-4 text-xs font-mono">
            {/* Step 1: Input Received */}
            <div className="p-3.5 bg-white rounded-sm border border-hairline space-y-1">
              <span className="text-[10px] uppercase tracking-wider text-ink-muted block">
                [0ms] 1. Input Prompt Ingested
              </span>
              <p className="font-sans text-xs text-ink font-medium">
                "Evaluate 50 * 6 + 100 using the calculator tool."
              </p>
            </div>

            {/* Step 2: Model Tool Request & Sandbox Execution */}
            <div className="p-3.5 bg-white rounded-sm border border-hairline space-y-2">
              <div className="flex items-center justify-between border-b border-hairline pb-2">
                <div className="flex items-center gap-2">
                  <Calculator className="w-3.5 h-3.5 text-ink" />
                  <span className="font-bold text-ink">[320ms] 2. Tool Invocation: calculator</span>
                  <Badge variant="success" size="sm" className="text-[9px]">
                    Authorized
                  </Badge>
                </div>
                <span className="text-ink-muted text-[10px]">Sandbox Latency: 1ms</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px] pt-1">
                <div>
                  <span className="text-[9px] uppercase tracking-wider text-ink-muted block mb-0.5">
                    Arguments Passed:
                  </span>
                  <code className="text-ink block p-1.5 bg-paper rounded-sm">
                    {'{ "expression": "50 * 6 + 100" }'}
                  </code>
                </div>
                <div>
                  <span className="text-[9px] uppercase tracking-wider text-ink-muted block mb-0.5">
                    Sandbox Output:
                  </span>
                  <code className="text-status-success block p-1.5 bg-emerald-50/50 rounded-sm">
                    {'{ "result": 400, "isError": false }'}
                  </code>
                </div>
              </div>
            </div>

            {/* Step 3: Final Synthesis Output */}
            <div className="p-3.5 bg-white rounded-sm border border-hairline space-y-1">
              <span className="text-[10px] uppercase tracking-wider text-ink-muted block">
                [430ms] 3. Model Synthesized Final Answer
              </span>
              <p className="font-sans text-xs text-ink leading-relaxed">
                "The result of <strong>50 × 6 + 100</strong> is <strong>400</strong>."
              </p>
            </div>
          </div>

          {/* Telemetry Metrics Strip */}
          <div className="p-3 bg-paper-muted rounded-sm border border-hairline flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono text-ink-secondary">
            <div className="flex flex-wrap items-center gap-3">
              <span>Duration: <strong className="text-ink">430ms</strong></span>
              <span>·</span>
              <span>Turns: <strong className="text-ink">1 of 3</strong></span>
              <span>·</span>
              <span>Prompt Tokens: <strong>142</strong></span>
              <span>·</span>
              <span>Completion Tokens: <strong>40</strong></span>
            </div>

            <Badge variant="accent" size="sm" className="font-mono text-[10px]">
              Snapshot Preserved
            </Badge>
          </div>
        </div>
      </div>
    </section>
  );
};
