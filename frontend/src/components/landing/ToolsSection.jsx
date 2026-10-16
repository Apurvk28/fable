import React from 'react';
import { Badge } from '../ui/Badge';
import {
  Calculator,
  FileText,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  Lock,
  ArrowRight
} from 'lucide-react';

export const ToolsSection = () => {
  const tools = [
    {
      id: 'calculator',
      name: 'Safe Math Calculator',
      icon: Calculator,
      badge: 'Deterministic Parser',
      description: 'A sandboxed recursive-descent arithmetic evaluator. Handles operator precedence, functions, and exponentiation with strict boundaries.',
      safeguards: [
        'No eval() or Function() code execution',
        'Max 120 character expression limit',
        'Max 10 recursive nesting depth limit',
        'Division & modulo by zero safety protection',
      ],
      example: 'sqrt(100) + 15 * 4 -> 70',
    },
    {
      id: 'text_processor',
      name: 'Text Processor',
      icon: FileText,
      badge: 'Bounded String Utility',
      description: 'Performs extraction, summarization, keyword identification, and case transformation on structured text without external dependencies.',
      safeguards: [
        '10,000 character maximum input bound',
        'Regex denial-of-service (ReDoS) prevention',
        'Stop-words keyword frequency analysis',
        'Safe slugification and word statistics',
      ],
      example: 'extract_keywords("Agent sandbox limits...") -> ["agent", "sandbox", "limits"]',
    },
    {
      id: 'datetime',
      name: 'Date & Time Utility',
      icon: Calendar,
      badge: 'Temporal Calculations',
      description: 'Calculates ISO timestamp differences, adds durations, formats locale dates, and handles timezone conversions safely on the server.',
      safeguards: [
        'Strict ISO 8601 validation',
        'IANA timezone identifier allowlist',
        'Safe duration interval arithmetic',
        'Zero client clock dependency',
      ],
      example: 'diff("2026-01-01", "2026-10-15") -> 287 days, 6888 hours',
    },
  ];

  return (
    <section id="tools" className="py-20 border-b border-hairline bg-paper">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-12">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div className="max-w-2xl space-y-3">
            <Badge variant="outline" size="sm" className="font-mono text-[10px] uppercase tracking-wider">
              Tool Registry Sandbox
            </Badge>
            <h2 className="font-serif text-3xl sm:text-4xl font-normal text-ink tracking-tight">
              Capabilities with Strict Boundaries
            </h2>
            <p className="text-sm text-ink-secondary leading-relaxed font-sans">
              Autonomous agents should solve problems without security hazards. Fable equips agents with dedicated, server-controlled built-in tools.
            </p>
          </div>

          <div className="p-3 bg-paper rounded-sm border border-hairline font-mono text-[11px] text-ink-secondary self-start sm:self-auto space-y-1">
            <span className="text-[9px] uppercase font-bold text-ink block">Security Guarantee</span>
            <div className="flex items-center gap-1.5 text-status-success font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>Zero Arbitrary Code Execution</span>
            </div>
          </div>
        </div>

        {/* Tools 3-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <div
                key={tool.id}
                className="p-6 rounded-sm border border-hairline bg-paper flex flex-col justify-between space-y-5 shadow-editorial hover:shadow-editorial-lift transition-all"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-sm bg-white border border-hairline flex items-center justify-center text-ink shadow-sm">
                      <Icon className="w-5 h-5" />
                    </div>
                    <Badge variant="accent" size="sm" className="font-mono text-[10px]">
                      {tool.badge}
                    </Badge>
                  </div>

                  <div>
                    <h3 className="font-serif text-xl font-bold text-ink">
                      {tool.name}
                    </h3>
                    <p className="text-xs text-ink-secondary mt-1 font-sans leading-relaxed">
                      {tool.description}
                    </p>
                  </div>

                  {/* Safeguards List */}
                  <div className="space-y-1.5 pt-2 border-t border-hairline/60">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-ink-muted block">
                      Enforced Safeguards:
                    </span>
                    <ul className="space-y-1 font-mono text-[11px] text-ink-secondary">
                      {tool.safeguards.map((s, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-status-success shrink-0 mt-0.5" />
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Example Snippet */}
                <div className="p-2.5 bg-white rounded-sm border border-hairline font-mono text-[11px] text-ink">
                  <span className="text-[9px] uppercase tracking-wider text-ink-muted block mb-0.5">
                    Example Invocation:
                  </span>
                  <code className="text-xs font-semibold">{tool.example}</code>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
