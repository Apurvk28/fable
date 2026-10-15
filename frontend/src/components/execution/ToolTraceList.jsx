import React, { useState } from 'react';
import { Badge } from '../ui/Badge';
import {
  Wrench,
  Calculator,
  FileText,
  Calendar,
  ChevronDown,
  ChevronRight,
  Clock,
  CheckCircle2,
  AlertCircle
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
 * Reusable Tool Trace List Inspector
 * PRD: EXEC-05, RUN-02, TOOL-09
 */
export const ToolTraceList = ({ toolTraces = [], className = '' }) => {
  const [expandedTraces, setExpandedTraces] = useState({});

  if (!toolTraces || toolTraces.length === 0) {
    return (
      <div className={`p-4 bg-paper rounded-sm border border-hairline text-xs font-mono text-ink-muted text-center italic ${className}`}>
        No tools were invoked during this execution.
      </div>
    );
  }

  const toggleTraceExpand = (idx) => {
    setExpandedTraces((prev) => ({
      ...prev,
      [idx]: !(prev[idx] ?? true),
    }));
  };

  return (
    <div className={`space-y-2.5 ${className}`}>
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-mono uppercase tracking-wider text-ink font-semibold flex items-center gap-1.5">
          <Wrench className="w-3.5 h-3.5 text-ink-secondary" />
          Tool Execution Traces ({toolTraces.length} {toolTraces.length === 1 ? 'call' : 'calls'})
        </span>
        <span className="text-[10px] font-mono text-status-success">
          All arguments sandboxed
        </span>
      </div>

      <div className="space-y-2">
        {toolTraces.map((trace, idx) => {
          const isExpanded = expandedTraces[idx] ?? true;
          const IconComp = TOOL_ICONS[trace.tool] || Wrench;
          return (
            <div
              key={idx}
              className="border border-hairline rounded-sm overflow-hidden bg-white shadow-sm"
            >
              {/* Trace Header */}
              <div
                onClick={() => toggleTraceExpand(idx)}
                className="p-2.5 bg-paper-muted border-b border-hairline flex items-center justify-between cursor-pointer hover:bg-paper transition-colors select-none"
              >
                <div className="flex items-center gap-2">
                  <IconComp className="w-3.5 h-3.5 text-ink" />
                  <span className="text-xs font-mono font-semibold text-ink">
                    {TOOL_LABELS[trace.tool] || trace.tool}
                  </span>
                  {trace.isError ? (
                    <Badge variant="error" size="sm" className="flex items-center gap-1 text-[10px]">
                      <AlertCircle className="w-3 h-3" />
                      <span>Failed</span>
                    </Badge>
                  ) : (
                    <Badge variant="success" size="sm" className="flex items-center gap-1 text-[10px]">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Success</span>
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-mono text-ink-muted">
                    {trace.durationMs}ms · Turn #{trace.turn || 1}
                  </span>
                  {isExpanded ? (
                    <ChevronDown className="w-3.5 h-3.5 text-ink-muted" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-ink-muted" />
                  )}
                </div>
              </div>

              {/* Trace Details (Args & Return Value) */}
              {isExpanded && (
                <div className="p-3 space-y-2.5 text-xs font-mono bg-white">
                  <div>
                    <span className="text-[10px] text-ink-muted uppercase block mb-1">
                      Arguments Supplied:
                    </span>
                    <pre className="p-2.5 bg-paper rounded-sm border border-hairline text-[11px] overflow-x-auto text-ink font-mono">
                      {JSON.stringify(trace.args, null, 2)}
                    </pre>
                  </div>
                  <div>
                    <span className="text-[10px] text-ink-muted uppercase block mb-1">
                      Output / Sandbox Return:
                    </span>
                    <pre
                      className={`p-2.5 rounded-sm border text-[11px] overflow-x-auto font-mono ${
                        trace.isError
                          ? 'bg-rose-50/50 border-rose-200 text-status-error'
                          : 'bg-emerald-50/40 border-emerald-200 text-ink'
                      }`}
                    >
                      {JSON.stringify(trace.output || trace.error, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
