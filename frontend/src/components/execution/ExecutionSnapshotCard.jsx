import React, { useState } from 'react';
import { Badge } from '../ui/Badge';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import {
  Bot,
  Cpu,
  Wrench,
  ShieldCheck,
  ChevronDown,
  ChevronRight,
  Calculator,
  FileText,
  Calendar,
  Sliders,
  Clock
} from 'lucide-react';

const TOOL_ICONS = {
  calculator: Calculator,
  text_processor: FileText,
  datetime: Calendar,
};

const TOOL_LABELS = {
  calculator: 'Calculator',
  text_processor: 'Text Processor',
  datetime: 'Date & Time',
};

/**
 * Renders the immutable agent configuration snapshot captured at run time
 * PRD: AGENT-06, EXEC-01, EXEC-02
 */
export const ExecutionSnapshotCard = ({ snapshot, className = '' }) => {
  const [showFullPrompt, setShowFullPrompt] = useState(false);

  if (!snapshot) {
    return (
      <div className={`p-4 bg-paper rounded-sm border border-hairline text-xs font-mono text-ink-muted italic ${className}`}>
        No configuration snapshot available for this execution.
      </div>
    );
  }

  return (
    <Card className={`bg-white border-hairline shadow-editorial ${className}`}>
      <CardHeader className="bg-paper-muted border-b border-hairline py-3 px-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Bot className="w-4 h-4 text-ink" />
            <CardTitle className="text-xs font-mono uppercase tracking-wider text-ink font-semibold">
              Agent Configuration Snapshot
            </CardTitle>
          </div>
          <Badge variant="accent" size="sm" className="text-[10px] font-mono flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-ink" />
            <span>Immutable · Run-time State</span>
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-4 text-xs font-sans">
        {/* Agent Name, Model & Tools Header Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-3 border-b border-hairline">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-ink-muted block mb-0.5">
              Agent Name
            </span>
            <div className="font-semibold text-ink text-sm">
              {snapshot.name || 'Unnamed Agent'}
            </div>
            {snapshot.description && (
              <p className="text-[11px] text-ink-secondary mt-0.5">{snapshot.description}</p>
            )}
          </div>

          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-ink-muted block mb-0.5">
              LLM Model Used
            </span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Cpu className="w-3.5 h-3.5 text-ink-secondary" />
              <Badge variant="accent" size="sm" className="font-mono text-[11px]">
                {snapshot.model}
              </Badge>
            </div>
          </div>
        </div>

        {/* Enabled Tools */}
        <div className="space-y-1.5">
          <span className="text-[10px] font-mono uppercase tracking-wider text-ink-muted flex items-center gap-1.5">
            <Wrench className="w-3 h-3 text-ink-secondary" />
            Enabled Built-in Tools
          </span>
          <div className="flex flex-wrap items-center gap-1.5">
            {snapshot.tools && snapshot.tools.length > 0 ? (
              snapshot.tools.map((t) => {
                const IconComp = TOOL_ICONS[t] || Wrench;
                return (
                  <Badge key={t} variant="success" size="sm" className="text-[10px] flex items-center gap-1">
                    <IconComp className="w-2.5 h-2.5" />
                    <span>{TOOL_LABELS[t] || t}</span>
                  </Badge>
                );
              })
            ) : (
              <span className="text-[11px] font-mono text-ink-muted italic">No tools enabled</span>
            )}
          </div>
        </div>

        {/* System Instructions / Prompt */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-ink-muted">
              System Instructions
            </span>
            {snapshot.instructions && snapshot.instructions.length > 150 && (
              <button
                type="button"
                onClick={() => setShowFullPrompt(!showFullPrompt)}
                className="text-[10px] font-mono text-ink underline hover:text-ink-secondary"
              >
                {showFullPrompt ? 'Collapse' : 'Expand full prompt'}
              </button>
            )}
          </div>
          <div className="p-3 bg-paper rounded-sm border border-hairline font-mono text-[11px] text-ink leading-relaxed whitespace-pre-wrap">
            {showFullPrompt
              ? snapshot.instructions
              : snapshot.instructions?.length > 150
              ? snapshot.instructions.slice(0, 150) + '...'
              : snapshot.instructions || 'No instructions provided.'}
          </div>
        </div>

        {/* Parameters & Limits Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-hairline text-[10px] font-mono text-ink-secondary">
          <div className="p-2 bg-paper-muted rounded-sm border border-hairline">
            <span className="text-ink-muted block uppercase text-[9px]">Temperature</span>
            <span className="text-ink font-semibold">{snapshot.parameters?.temperature ?? 0.7}</span>
          </div>
          <div className="p-2 bg-paper-muted rounded-sm border border-hairline">
            <span className="text-ink-muted block uppercase text-[9px]">Max Tokens</span>
            <span className="text-ink font-semibold">{snapshot.parameters?.maxTokens ?? 1024}</span>
          </div>
          <div className="p-2 bg-paper-muted rounded-sm border border-hairline">
            <span className="text-ink-muted block uppercase text-[9px]">Turn Limit</span>
            <span className="text-ink font-semibold">{snapshot.limits?.maxTurns ?? 3} turns</span>
          </div>
          <div className="p-2 bg-paper-muted rounded-sm border border-hairline">
            <span className="text-ink-muted block uppercase text-[9px]">Timeout</span>
            <span className="text-ink font-semibold">{snapshot.limits?.timeoutSeconds ?? 30}s</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
