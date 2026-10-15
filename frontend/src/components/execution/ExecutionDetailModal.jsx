import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Modal } from '../ui/Modal';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { ToolTraceList } from './ToolTraceList';
import { ExecutionSnapshotCard } from './ExecutionSnapshotCard';
import { executionApi } from '../../services/apiClient';
import {
  Play,
  Bot,
  Clock,
  Cpu,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  MessageSquare,
  ArrowRight
} from 'lucide-react';

export const ExecutionDetailModal = ({
  executionId,
  isOpen,
  onClose,
  initialExecution = null,
}) => {
  const [execution, setExecution] = useState(initialExecution);
  const [isLoading, setIsLoading] = useState(!initialExecution && !!executionId);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isOpen || !executionId) return;

    // If initial execution already has all full fields (messages/traces), use it
    if (initialExecution && initialExecution.agentSnapshot?.instructions) {
      setExecution(initialExecution);
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    setIsLoading(true);
    setError(null);

    executionApi
      .getExecution(executionId)
      .then((res) => {
        if (isMounted) {
          setExecution(res.execution);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || 'Failed to load execution details.');
        }
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [executionId, isOpen, initialExecution]);

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-serif text-lg font-bold text-ink">
            Execution Inspector
          </span>
          {execution && (
            <>
              {execution.status === 'completed' && (
                <Badge variant="success" size="sm" className="flex items-center gap-1 font-mono text-[10px]">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Completed</span>
                </Badge>
              )}
              {execution.status === 'failed' && (
                <Badge variant="error" size="sm" className="flex items-center gap-1 font-mono text-[10px]">
                  <AlertCircle className="w-3 h-3" />
                  <span>Failed</span>
                </Badge>
              )}
              {execution.status === 'running' && (
                <Badge variant="accent" size="sm" className="animate-pulse font-mono text-[10px]">
                  Running...
                </Badge>
              )}
              <Badge variant="outline" size="sm" className="font-mono text-[10px] uppercase">
                {execution.mode || 'task'}
              </Badge>
            </>
          )}
        </div>
      }
      description={execution ? `ID: ${execution.id || execution._id}` : 'Loading run details...'}
      maxWidth="max-w-4xl"
    >
      <div className="space-y-6 max-h-[75vh] overflow-y-auto pr-1">
        {isLoading ? (
          <div className="py-16 text-center space-y-3 font-mono text-xs text-ink-muted">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-ink" />
            <p>Fetching full execution telemetry & traces...</p>
          </div>
        ) : error ? (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-sm text-xs font-mono text-status-error">
            {error}
          </div>
        ) : execution ? (
          <>
            {/* Input & Output View */}
            <div className="space-y-3">
              {/* Submitted Prompt */}
              <div className="p-3.5 bg-paper rounded-sm border border-hairline space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-ink-muted block">
                  Original Input Prompt:
                </span>
                <p className="text-xs text-ink font-sans font-medium whitespace-pre-wrap leading-relaxed">
                  {execution.input}
                </p>
              </div>

              {/* Final Output or Error */}
              {execution.status === 'failed' ? (
                <div className="p-3.5 bg-rose-50/70 border border-rose-200 rounded-sm space-y-1.5 text-xs font-mono">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-status-error flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    Execution Failed ({execution.error?.code || 'ERROR'})
                  </span>
                  <p className="text-status-error font-sans leading-relaxed">
                    {execution.error?.message || 'An error occurred during execution.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-ink font-semibold flex items-center gap-1.5">
                    <Bot className="w-3.5 h-3.5 text-ink" />
                    Agent Response Output:
                  </span>
                  <div className="p-4 bg-white rounded-sm border border-hairline shadow-sm text-xs font-sans text-ink leading-relaxed whitespace-pre-wrap">
                    {execution.output || <span className="italic text-ink-muted">No response output recorded.</span>}
                  </div>
                </div>
              )}
            </div>

            {/* Expandable Tool Traces */}
            <ToolTraceList toolTraces={execution.toolTraces || []} />

            {/* Immutable Agent Snapshot */}
            <ExecutionSnapshotCard snapshot={execution.agentSnapshot} />

            {/* Performance, Latency & Token Usage Footer Strip */}
            <div className="p-3 bg-paper-muted rounded-sm border border-hairline flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono text-ink-secondary">
              <div className="flex flex-wrap items-center gap-3">
                <span>Duration: <strong>{execution.durationMs || 0}ms</strong></span>
                <span>·</span>
                <span>Turns: <strong>{execution.turnsCount || 1}</strong></span>
                <span>·</span>
                <span>Created: {new Date(execution.createdAt).toLocaleString()}</span>
              </div>

              {execution.tokenUsage && (
                <div className="flex items-center gap-2 text-ink-muted">
                  <span>Prompt: {execution.tokenUsage.promptTokens}</span>
                  <span>Comp: {execution.tokenUsage.completionTokens}</span>
                  <Badge variant="accent" size="sm" className="font-mono text-[10px]">
                    Total Tokens: {execution.tokenUsage.totalTokens}
                  </Badge>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-hairline">
              <Link
                to={`/executions/${execution.id || execution._id}`}
                className="text-xs font-mono text-ink-secondary hover:text-ink underline flex items-center gap-1"
              >
                <span>Direct URL View</span>
                <ExternalLink className="w-3 h-3" />
              </Link>

              <div className="flex items-center gap-2">
                {execution.agent && (
                  <Link to={`/agents/${execution.agent}/playground`}>
                    <Button variant="outline" size="sm" icon={Play}>
                      Open in Playground
                    </Button>
                  </Link>
                )}
                <Button variant="primary" size="sm" onClick={onClose}>
                  Done
                </Button>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </Modal>
  );
};
