import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { PageContainer } from '../../components/layout/PageContainer';
import { Navbar } from '../../components/layout/Navbar';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { ExecutionDetailModal } from '../../components/execution/ExecutionDetailModal';
import { executionApi, agentApi } from '../../services/apiClient';
import {
  Clock,
  Play,
  Bot,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Wrench,
  Cpu,
  Layers,
  RotateCcw,
  Sparkles
} from 'lucide-react';

export const ExecutionsList = () => {
  // Data State
  const [executions, setExecutions] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 15,
    totalCount: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [agents, setAgents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter & Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAgent, setSelectedAgent] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedMode, setSelectedMode] = useState('all');
  const [selectedSort, setSelectedSort] = useState('-createdAt');
  const [currentPage, setCurrentPage] = useState(1);

  // Inspector Modal State
  const [inspectExecutionId, setInspectExecutionId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Load agents for filter dropdown
  useEffect(() => {
    agentApi
      .getAgents()
      .then((res) => {
        setAgents(res.agents || []);
      })
      .catch((err) => {
        console.warn('Failed to load agents list for filter:', err);
      });
  }, []);

  // Fetch paginated executions
  const fetchExecutions = useCallback(() => {
    setIsLoading(true);
    setError(null);

    const params = {
      page: currentPage,
      limit: 15,
      agentId: selectedAgent,
      status: selectedStatus,
      mode: selectedMode,
      sort: selectedSort,
      q: searchQuery.trim(),
    };

    executionApi
      .getExecutions(params)
      .then((res) => {
        setExecutions(res.executions || []);
        if (res.pagination) {
          setPagination(res.pagination);
        }
      })
      .catch((err) => {
        setError(err.message || 'Failed to load execution history.');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [currentPage, selectedAgent, selectedStatus, selectedMode, selectedSort, searchQuery]);

  useEffect(() => {
    fetchExecutions();
  }, [fetchExecutions]);

  // Reset page to 1 when filters change
  const handleFilterChange = (setter) => (e) => {
    setter(e.target.value);
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedAgent('all');
    setSelectedStatus('all');
    setSelectedMode('all');
    setSelectedSort('-createdAt');
    setCurrentPage(1);
  };

  const openInspector = (id) => {
    setInspectExecutionId(id);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-paper flex flex-col font-sans">
      <Navbar />

      <PageContainer className="flex-1 py-8 space-y-6">
        {/* Header Strip */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-hairline pb-5">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif text-3xl font-bold text-ink">
                Execution History & Observability
              </h1>
              <Badge variant="accent" size="sm" className="font-mono text-[10px]">
                {pagination.totalCount} {pagination.totalCount === 1 ? 'Run' : 'Runs'} Recorded
              </Badge>
            </div>
            <p className="text-xs text-ink-secondary mt-1 max-w-2xl leading-relaxed">
              Audit autonomous reasoning loops, inspect step-by-step tool telemetry, and view immutable agent snapshots preserved from runtime.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link to="/playground">
              <Button variant="primary" size="sm" icon={Play}>
                Open Playground
              </Button>
            </Link>
          </div>
        </div>

        {/* Filter & Search Toolbar */}
        <div className="bg-white p-4 rounded-sm border border-hairline shadow-editorial space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {/* Search Input */}
            <div className="lg:col-span-2 relative">
              <input
                type="text"
                placeholder="Search prompt text..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-8 pr-3 py-1.5 text-xs font-sans border border-hairline rounded-sm bg-paper focus:bg-white focus:outline-none focus:border-ink transition-colors"
              />
              <Search className="w-3.5 h-3.5 text-ink-muted absolute left-2.5 top-2.5" />
            </div>

            {/* Agent Filter */}
            <div>
              <select
                value={selectedAgent}
                onChange={handleFilterChange(setSelectedAgent)}
                className="w-full py-1.5 px-2.5 text-xs font-sans border border-hairline rounded-sm bg-paper focus:bg-white focus:outline-none focus:border-ink cursor-pointer"
              >
                <option value="all">All Agents</option>
                {agents.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={selectedStatus}
                onChange={handleFilterChange(setSelectedStatus)}
                className="w-full py-1.5 px-2.5 text-xs font-sans border border-hairline rounded-sm bg-paper focus:bg-white focus:outline-none focus:border-ink cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
                <option value="running">Running</option>
              </select>
            </div>

            {/* Mode & Sort Grid */}
            <div className="flex items-center gap-2">
              <select
                value={selectedMode}
                onChange={handleFilterChange(setSelectedMode)}
                className="w-1/2 py-1.5 px-2 text-xs font-sans border border-hairline rounded-sm bg-paper focus:bg-white focus:outline-none focus:border-ink cursor-pointer"
              >
                <option value="all">All Modes</option>
                <option value="task">Task</option>
                <option value="chat">Chat</option>
              </select>

              <select
                value={selectedSort}
                onChange={handleFilterChange(setSelectedSort)}
                className="w-1/2 py-1.5 px-2 text-xs font-sans border border-hairline rounded-sm bg-paper focus:bg-white focus:outline-none focus:border-ink cursor-pointer"
              >
                <option value="-createdAt">Newest</option>
                <option value="createdAt">Oldest</option>
                <option value="-durationMs">Slowest</option>
                <option value="durationMs">Fastest</option>
              </select>
            </div>
          </div>

          {/* Active Filter Tags & Reset */}
          {(searchQuery || selectedAgent !== 'all' || selectedStatus !== 'all' || selectedMode !== 'all' || selectedSort !== '-createdAt') && (
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-hairline/60 text-[11px] font-mono">
              <span className="text-ink-muted">Filters applied:</span>
              {searchQuery && (
                <Badge variant="outline" size="sm">Search: "{searchQuery}"</Badge>
              )}
              {selectedAgent !== 'all' && (
                <Badge variant="outline" size="sm">Agent: {agents.find(a => a.id === selectedAgent)?.name || selectedAgent}</Badge>
              )}
              {selectedStatus !== 'all' && (
                <Badge variant="outline" size="sm">Status: {selectedStatus}</Badge>
              )}
              {selectedMode !== 'all' && (
                <Badge variant="outline" size="sm">Mode: {selectedMode}</Badge>
              )}
              {selectedSort !== '-createdAt' && (
                <Badge variant="outline" size="sm">Sort: {selectedSort}</Badge>
              )}
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-ink hover:text-ink-secondary underline ml-1 cursor-pointer flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset all</span>
              </button>
            </div>
          )}
        </div>

        {/* History Table / Content Area */}
        {isLoading ? (
          <div className="py-24 text-center space-y-3 font-mono text-xs text-ink-muted bg-white rounded-sm border border-hairline shadow-editorial">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-ink" />
            <p>Loading execution history...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center space-y-3 bg-white rounded-sm border border-hairline shadow-editorial">
            <AlertCircle className="w-8 h-8 text-status-error mx-auto" />
            <h3 className="font-serif text-lg font-bold text-ink">Failed to Load Executions</h3>
            <p className="text-xs text-ink-secondary">{error}</p>
            <Button variant="outline" size="sm" onClick={fetchExecutions}>
              Retry Query
            </Button>
          </div>
        ) : executions.length === 0 ? (
          <div className="py-20 text-center space-y-4 bg-white rounded-sm border border-hairline shadow-editorial p-6">
            <div className="w-12 h-12 rounded-full bg-paper border border-hairline flex items-center justify-center mx-auto text-ink-muted">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-semibold text-ink">
                {searchQuery || selectedAgent !== 'all' || selectedStatus !== 'all' || selectedMode !== 'all'
                  ? 'No executions match your filters'
                  : 'No executions recorded yet'}
              </h3>
              <p className="text-xs text-ink-secondary max-w-md mx-auto mt-1 leading-relaxed">
                {searchQuery || selectedAgent !== 'all' || selectedStatus !== 'all' || selectedMode !== 'all'
                  ? 'Try clearing your search query or broadening your filter criteria.'
                  : 'Run an agent task or test a conversation in the playground to start capturing execution telemetry.'}
              </p>
            </div>
            {searchQuery || selectedAgent !== 'all' || selectedStatus !== 'all' || selectedMode !== 'all' ? (
              <Button variant="outline" size="sm" onClick={handleResetFilters}>
                Clear All Filters
              </Button>
            ) : (
              <Link to="/playground">
                <Button variant="primary" size="sm" icon={Play}>
                  Go to Agent Playground
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-sm border border-hairline shadow-editorial overflow-hidden">
            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-sans">
                <thead>
                  <tr className="bg-paper-muted border-b border-hairline text-[10px] font-mono uppercase tracking-wider text-ink-muted">
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Agent (Snapshot)</th>
                    <th className="py-3 px-4">Mode</th>
                    <th className="py-3 px-4 min-w-[220px]">Prompt Input</th>
                    <th className="py-3 px-4">Tools Used</th>
                    <th className="py-3 px-4">Duration</th>
                    <th className="py-3 px-4">Tokens</th>
                    <th className="py-3 px-4">Created</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hairline">
                  {executions.map((run) => (
                    <tr
                      key={run.id}
                      onClick={() => openInspector(run.id)}
                      className="hover:bg-paper/70 transition-colors cursor-pointer group"
                    >
                      {/* Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {run.status === 'completed' && (
                          <Badge variant="success" size="sm" className="flex items-center gap-1 font-mono text-[10px]">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Success</span>
                          </Badge>
                        )}
                        {run.status === 'failed' && (
                          <Badge variant="error" size="sm" className="flex items-center gap-1 font-mono text-[10px]">
                            <AlertCircle className="w-3 h-3" />
                            <span>Failed</span>
                          </Badge>
                        )}
                        {run.status === 'running' && (
                          <Badge variant="accent" size="sm" className="animate-pulse font-mono text-[10px]">
                            Running
                          </Badge>
                        )}
                      </td>

                      {/* Agent Snapshot Name */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-semibold text-ink group-hover:text-ink-secondary">
                          {run.agentSnapshot?.name || 'Unnamed Agent'}
                        </div>
                        <div className="text-[10px] font-mono text-ink-muted">
                          {run.agentSnapshot?.model || 'unknown'}
                        </div>
                      </td>

                      {/* Mode */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-mono text-[11px] uppercase text-ink-secondary">
                          {run.mode === 'chat' ? 'Chat Turn' : 'Task Run'}
                        </span>
                      </td>

                      {/* Input Preview */}
                      <td className="py-3.5 px-4">
                        <p className="text-ink font-sans text-xs truncate max-w-sm">
                          {run.input}
                        </p>
                      </td>

                      {/* Tools Count & Badges */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {run.toolTracesCount > 0 ? (
                          <div className="flex items-center gap-1">
                            <Badge variant="outline" size="sm" className="font-mono text-[10px] flex items-center gap-1">
                              <Wrench className="w-2.5 h-2.5" />
                              <span>{run.toolTracesCount} {run.toolTracesCount === 1 ? 'call' : 'calls'}</span>
                            </Badge>
                          </div>
                        ) : (
                          <span className="text-[11px] font-mono text-ink-muted italic">none</span>
                        )}
                      </td>

                      {/* Duration */}
                      <td className="py-3.5 px-4 whitespace-nowrap font-mono text-[11px] text-ink-secondary">
                        {run.durationMs}ms
                      </td>

                      {/* Tokens */}
                      <td className="py-3.5 px-4 whitespace-nowrap font-mono text-[11px] text-ink-muted">
                        {run.tokenUsage?.totalTokens > 0 ? `${run.tokenUsage.totalTokens} tok` : '—'}
                      </td>

                      {/* Created Timestamp */}
                      <td className="py-3.5 px-4 whitespace-nowrap font-mono text-[10px] text-ink-muted">
                        {new Date(run.createdAt).toLocaleDateString()} {new Date(run.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-[11px] font-mono py-1 px-2"
                            onClick={() => openInspector(run.id)}
                          >
                            Inspect
                          </Button>
                          <Link to={`/executions/${run.id}`} title="Open Full Screen Inspector">
                            <Button variant="outline" size="sm" className="p-1.5 h-7 w-7">
                              <ExternalLink className="w-3.5 h-3.5 text-ink-muted" />
                            </Button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls Footer */}
            <div className="p-4 bg-paper-muted border-t border-hairline flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
              <div className="text-ink-secondary">
                Showing{' '}
                <strong>
                  {pagination.totalCount === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1}
                </strong>
                –
                <strong>
                  {Math.min(pagination.page * pagination.limit, pagination.totalCount)}
                </strong>{' '}
                of <strong>{pagination.totalCount}</strong> runs
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  icon={ChevronLeft}
                  disabled={!pagination.hasPrevPage}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </Button>
                <span className="text-ink-muted px-2">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  icon={ChevronRight}
                  disabled={!pagination.hasNextPage}
                  onClick={() => setCurrentPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Deep Execution Inspector Modal */}
        <ExecutionDetailModal
          executionId={inspectExecutionId}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setInspectExecutionId(null);
          }}
        />
      </PageContainer>
    </div>
  );
};
