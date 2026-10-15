import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { PageContainer } from '../../components/layout/PageContainer';
import { Navbar } from '../../components/layout/Navbar';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Alert } from '../../components/ui/Alert';
import { ToolTraceList } from '../../components/execution/ToolTraceList';
import { ExecutionSnapshotCard } from '../../components/execution/ExecutionSnapshotCard';
import { executionApi } from '../../services/apiClient';
import {
  ArrowLeft,
  Bot,
  Play,
  Clock,
  Cpu,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';

export const ExecutionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [execution, setExecution] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;

    let isMounted = true;
    setIsLoading(true);
    setError(null);

    executionApi
      .getExecution(id)
      .then((res) => {
        if (isMounted) {
          setExecution(res.execution);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || 'Failed to retrieve execution details.');
        }
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  return (
    <div className="min-h-screen bg-paper flex flex-col font-sans">
      <Navbar />

      <PageContainer className="flex-1 py-6 space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-hairline pb-4">
          <div className="flex items-center gap-3">
            <Link
              to="/executions"
              className="p-1.5 rounded-sm border border-hairline bg-white hover:bg-paper-muted text-ink-muted hover:text-ink transition-colors"
              title="Back to Execution History"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif text-2xl font-bold text-ink">
                  Execution Inspector
                </h1>
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
              <p className="text-xs font-mono text-ink-secondary mt-0.5">
                ID: {id}
              </p>
            </div>
          </div>

          {execution?.agent && (
            <Link to={`/agents/${execution.agent}/playground`}>
              <Button variant="primary" size="sm" icon={Play}>
                Open in Playground
              </Button>
            </Link>
          )}
        </div>

        {/* Content Body */}
        {isLoading ? (
          <div className="py-24 text-center space-y-3 font-mono text-xs text-ink-muted bg-white rounded-sm border border-hairline shadow-editorial">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-ink" />
            <p>Loading execution telemetry and traces...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center space-y-4 bg-white rounded-sm border border-hairline shadow-editorial">
            <div className="w-12 h-12 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center mx-auto text-status-error">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h2 className="font-serif text-xl font-bold text-ink">Execution Not Available</h2>
            <p className="text-xs text-ink-secondary max-w-md mx-auto leading-relaxed">
              {error}
            </p>
            <Link to="/executions">
              <Button variant="outline" size="sm">
                Back to Execution History
              </Button>
            </Link>
          </div>
        ) : execution ? (
          <div className="space-y-6">
            {/* Input & Output Panels */}
            <div className="grid grid-cols-1 gap-4">
              {/* Submitted Prompt Input */}
              <div className="bg-white p-4 rounded-sm border border-hairline shadow-editorial space-y-1.5">
                <span className="text-[10px] font-mono uppercase tracking-wider text-ink-muted block">
                  Original Submitted Input:
                </span>
                <p className="text-xs text-ink font-sans font-medium whitespace-pre-wrap leading-relaxed">
                  {execution.input}
                </p>
              </div>

              {/* Agent Output or Failure Banner */}
              {execution.status === 'failed' ? (
                <div className="bg-rose-50/70 p-4 rounded-sm border border-rose-200 space-y-1.5 text-xs font-mono">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-status-error flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4" />
                    Execution Failed ({execution.error?.code || 'ERROR'})
                  </span>
                  <p className="text-status-error font-sans text-xs leading-relaxed">
                    {execution.error?.message || 'An error occurred during execution.'}
                  </p>
                </div>
              ) : (
                <div className="bg-white p-5 rounded-sm border border-hairline shadow-editorial space-y-2">
                  <div className="flex items-center justify-between border-b border-hairline pb-2.5">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-ink font-semibold flex items-center gap-1.5">
                      <Bot className="w-4 h-4 text-ink" />
                      Final Agent Output Response
                    </span>
                    <span className="text-[10px] font-mono text-ink-muted">
                      Turns: {execution.turnsCount || 1} · Duration: {execution.durationMs}ms
                    </span>
                  </div>
                  <div className="p-3 bg-paper rounded-sm border border-hairline text-xs font-sans text-ink leading-relaxed whitespace-pre-wrap">
                    {execution.output || <span className="italic text-ink-muted">No response output produced.</span>}
                  </div>
                </div>
              )}
            </div>

            {/* Expandable Tool Traces Component */}
            <div className="bg-white p-5 rounded-sm border border-hairline shadow-editorial">
              <ToolTraceList toolTraces={execution.toolTraces || []} />
            </div>

            {/* Immutable Agent Snapshot Component */}
            <ExecutionSnapshotCard snapshot={execution.agentSnapshot} />

            {/* Performance & Token Usage Footer Strip */}
            <div className="p-4 bg-white rounded-sm border border-hairline shadow-editorial flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-ink-secondary">
              <div className="flex flex-wrap items-center gap-4">
                <span>Duration: <strong className="text-ink">{execution.durationMs}ms</strong></span>
                <span>·</span>
                <span>Turns: <strong className="text-ink">{execution.turnsCount || 1}</strong></span>
                <span>·</span>
                <span>Created: {new Date(execution.createdAt).toLocaleString()}</span>
              </div>

              {execution.tokenUsage && (
                <div className="flex items-center gap-3">
                  <span className="text-ink-muted">Prompt: {execution.tokenUsage.promptTokens}</span>
                  <span className="text-ink-muted">Completion: {execution.tokenUsage.completionTokens}</span>
                  <Badge variant="accent" size="sm" className="font-mono text-xs">
                    Total Tokens: {execution.tokenUsage.totalTokens}
                  </Badge>
                </div>
              )}
            </div>
          </div>
        ) : null}
      </PageContainer>
    </div>
  );
};
