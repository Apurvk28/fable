import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { agentApi } from '../../services/apiClient';
import { Navbar } from '../../components/layout/Navbar';
import { PageContainer } from '../../components/layout/PageContainer';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Alert } from '../../components/ui/Alert';
import { AgentFormModal } from '../../components/agent/AgentFormModal';
import { AgentDetailModal } from '../../components/agent/AgentDetailModal';
import { DeleteAgentModal } from '../../components/agent/DeleteAgentModal';
import { AiAssistedModal } from '../../components/agent/AiAssistedModal';
import {
  Bot,
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  Copy,
  Edit3,
  Trash2,
  Eye,
  RefreshCw,
  Wrench,
  Calculator,
  FileText,
  Calendar,
  Sparkles,
  Inbox,
  Play
} from 'lucide-react';

const TOOL_ICONS = {
  calculator: Calculator,
  text_processor: FileText,
  datetime: Calendar,
};

const TOOL_NAMES = {
  calculator: 'Calculator',
  text_processor: 'Text Processor',
  datetime: 'Date & Time',
};

export const AgentList = () => {
  const [agents, setAgents] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTool, setSelectedTool] = useState('');
  const [sortOrder, setSortOrder] = useState('newest');

  // Modals State
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState(null);
  const [inspectingAgent, setInspectingAgent] = useState(null);
  const [deletingAgent, setDeletingAgent] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchAgents = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await agentApi.getAgents({
        q: searchQuery,
        tool: selectedTool,
        sort: sortOrder,
      });
      setAgents(data.agents || []);
      setTotalCount(data.totalCount || 0);
    } catch (err) {
      setError(err.message || 'Failed to load agents.');
    } finally {
      setIsLoading(false);
    }
  };

  // Re-fetch when query parameters change (debounced for search)
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchAgents();
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery, selectedTool, sortOrder]);

  // Flash success message auto-dismiss
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 4000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Create or Update Handler
  const handleSaveAgent = async (formData) => {
    setActionLoading(true);
    try {
      if (editingAgent) {
        await agentApi.updateAgent(editingAgent.id, formData);
        setSuccessMessage(`Agent "${formData.name}" updated successfully.`);
      } else {
        await agentApi.createAgent(formData);
        setSuccessMessage(`Agent "${formData.name}" created successfully.`);
      }
      setIsFormModalOpen(false);
      setEditingAgent(null);
      await fetchAgents();
    } finally {
      setActionLoading(false);
    }
  };

  // Duplicate Handler
  const handleDuplicate = async (agent) => {
    setActionLoading(true);
    try {
      const res = await agentApi.duplicateAgent(agent.id);
      setSuccessMessage(`Cloned agent: "${res.agent.name}".`);
      await fetchAgents();
    } catch (err) {
      setError(err.message || 'Failed to duplicate agent.');
    } finally {
      setActionLoading(false);
    }
  };

  // Delete Handler
  const handleDeleteConfirm = async () => {
    if (!deletingAgent) return;
    setActionLoading(true);
    try {
      await agentApi.deleteAgent(deletingAgent.id);
      setSuccessMessage(`Agent "${deletingAgent.name}" deleted.`);
      setDeletingAgent(null);
      await fetchAgents();
    } catch (err) {
      setError(err.message || 'Failed to delete agent.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingAgent(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (agent) => {
    setEditingAgent(agent);
    setIsFormModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-paper flex flex-col font-sans">
      <Navbar />

      <PageContainer className="flex-1 space-y-8 py-8">
        {/* Header Strip */}
        <section className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-hairline pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono uppercase tracking-widest text-ink-muted">
                Workshop &middot; {totalCount} {totalCount === 1 ? 'Agent' : 'Agents'}
              </span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl text-ink font-normal tracking-tight">
              Agent Workshop
            </h1>
            <p className="text-sm text-ink-secondary mt-1">
              Design, configure, and isolate specialized AI agents with modular tools and guardrails.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              id="btn-refresh-agents"
              variant="outline"
              size="md"
              icon={RefreshCw}
              isLoading={isLoading}
              onClick={fetchAgents}
              title="Refresh agent list"
            >
              Refresh
            </Button>
            <Button
              id="btn-ai-setup"
              variant="accent"
              size="md"
              icon={Sparkles}
              onClick={() => setIsAiModalOpen(true)}
              title="Generate agent configuration using Groq AI"
            >
              AI Setup
            </Button>
            <Button
              id="btn-new-agent"
              variant="primary"
              size="md"
              icon={Plus}
              onClick={handleOpenCreate}
            >
              New Agent
            </Button>
          </div>
        </section>

        {/* Alerts & Messages */}
        {successMessage && (
          <Alert variant="success" title="Success" dismissible onDismiss={() => setSuccessMessage('')}>
            {successMessage}
          </Alert>
        )}
        {error && (
          <Alert variant="error" title="Error" dismissible onDismiss={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Filter & Search Toolbar */}
        <section className="bg-white p-4 rounded-sm border border-hairline shadow-editorial flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
            <input
              id="input-agent-search"
              type="text"
              placeholder="Search agents by name or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs font-sans border border-hairline rounded-sm bg-paper focus:bg-white focus:outline-none focus:ring-1 focus:ring-ink text-ink placeholder:text-ink-muted"
            />
          </div>

          {/* Tool Filters & Sorting Controls */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Tool Filter Selector */}
            <div className="flex items-center gap-1.5 text-xs font-mono">
              <Filter className="w-3.5 h-3.5 text-ink-secondary" />
              <select
                id="select-tool-filter"
                value={selectedTool}
                onChange={(e) => setSelectedTool(e.target.value)}
                className="py-1.5 px-2.5 text-xs font-sans border border-hairline rounded-sm bg-paper text-ink focus:outline-none focus:ring-1 focus:ring-ink"
              >
                <option value="">All Tools</option>
                <option value="calculator">Calculator</option>
                <option value="text_processor">Text Processor</option>
                <option value="datetime">Date & Time</option>
              </select>
            </div>

            {/* Sort Order Selector */}
            <div className="flex items-center gap-1.5 text-xs font-mono">
              <ArrowUpDown className="w-3.5 h-3.5 text-ink-secondary" />
              <select
                id="select-sort-order"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="py-1.5 px-2.5 text-xs font-sans border border-hairline rounded-sm bg-paper text-ink focus:outline-none focus:ring-1 focus:ring-ink"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="name_asc">Name (A &rarr; Z)</option>
                <option value="name_desc">Name (Z &rarr; A)</option>
              </select>
            </div>
          </div>
        </section>

        {/* Agent Cards Grid / State Render */}
        <section>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((n) => (
                <div key={n} className="p-6 bg-white border border-hairline rounded-sm animate-pulse space-y-4">
                  <div className="h-5 bg-paper-muted rounded w-2/3" />
                  <div className="h-3 bg-paper-muted rounded w-1/3" />
                  <div className="h-12 bg-paper-muted rounded w-full" />
                  <div className="h-6 bg-paper-muted rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : agents.length === 0 ? (
            /* Empty States */
            totalCount === 0 ? (
              /* Workshop Completely Empty */
              <Card className="bg-white text-center py-12 px-6">
                <div className="max-w-md mx-auto space-y-4">
                  <div className="w-14 h-14 rounded-sm bg-fable-chartreuse/25 border border-ink text-ink flex items-center justify-center mx-auto shadow-editorial">
                    <Bot className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="font-serif text-2xl text-ink font-medium">Your Workshop is Empty</h3>
                    <p className="text-xs text-ink-secondary mt-1.5 leading-relaxed">
                      You haven't created any AI agents yet. Build your first specialized agent with custom system instructions, model parameters, and approved tools.
                    </p>
                  </div>
                  <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                    <Button id="btn-create-first-agent" variant="primary" icon={Plus} onClick={handleOpenCreate}>
                      Manual Setup
                    </Button>
                    <Button id="btn-empty-ai-setup" variant="accent" icon={Sparkles} onClick={() => setIsAiModalOpen(true)}>
                      Generate with AI
                    </Button>
                  </div>
                </div>
              </Card>
            ) : (
              /* Search/Filter returned 0 matches */
              <Card className="bg-white text-center py-10 px-6">
                <div className="max-w-sm mx-auto space-y-3">
                  <Inbox className="w-8 h-8 text-ink-muted mx-auto" />
                  <h3 className="font-serif text-lg text-ink">No Matching Agents</h3>
                  <p className="text-xs text-ink-secondary">
                    No agents in your workshop match the current search or tool filter.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedTool('');
                    }}
                  >
                    Clear Filters
                  </Button>
                </div>
              </Card>
            )
          ) : (
            /* Agent Cards List */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {agents.map((agent) => (
                <Card key={agent.id} className="flex flex-col justify-between hover:shadow-editorial-lg transition-shadow bg-white">
                  <CardHeader className="flex-col !items-stretch gap-2 border-b border-hairline/60 pb-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <CardTitle className="text-base font-semibold leading-snug" title={agent.name}>
                          {agent.name}
                        </CardTitle>
                        <Badge variant="accent" size="sm" className="font-mono text-[10px]">
                          {agent.model}
                        </Badge>
                      </div>
                      <div className="w-8 h-8 rounded-sm bg-paper-muted border border-hairline flex items-center justify-center text-ink shrink-0">
                        <Bot className="w-4 h-4" />
                      </div>
                    </div>
                    {agent.description ? (
                      <CardDescription className="line-clamp-2 text-xs">
                        {agent.description}
                      </CardDescription>
                    ) : (
                      <p className="text-xs text-ink-muted italic">No description provided.</p>
                    )}
                  </CardHeader>

                  <CardContent className="space-y-4 py-3 flex-1">
                    {/* Tools badges */}
                    <div>
                      <span className="text-[10px] font-mono text-ink-muted uppercase tracking-wider block mb-1.5">
                        Enabled Tools ({agent.tools?.length || 0})
                      </span>
                      {agent.tools && agent.tools.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {agent.tools.map((t) => {
                            const IconComp = TOOL_ICONS[t] || Wrench;
                            return (
                              <Badge key={t} variant="success" size="sm" className="flex items-center gap-1 text-[10px]">
                                <IconComp className="w-3 h-3" />
                                <span>{TOOL_NAMES[t] || t}</span>
                              </Badge>
                            );
                          })}
                        </div>
                      ) : (
                        <span className="text-xs text-ink-muted italic">None</span>
                      )}
                    </div>

                    {/* Parameters Strip */}
                    <div className="grid grid-cols-3 gap-1.5 p-2 bg-paper-muted rounded-sm border border-hairline text-center font-mono text-[11px]">
                      <div>
                        <span className="text-[9px] text-ink-muted block uppercase">Temp</span>
                        <span className="text-ink font-semibold">{agent.parameters?.temperature ?? 0.7}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-ink-muted block uppercase">Tokens</span>
                        <span className="text-ink font-semibold">{agent.parameters?.maxTokens ?? 1024}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-ink-muted block uppercase">Turns</span>
                        <span className="text-ink font-semibold">{agent.limits?.maxTurns ?? 3}</span>
                      </div>
                    </div>
                  </CardContent>

                  <CardFooter className="border-t border-hairline/60 pt-3 flex items-center justify-between gap-1 bg-paper/40">
                    <div className="flex items-center gap-1.5">
                      <Link to={`/agents/${agent.id}/playground`}>
                        <Button
                          variant="accent"
                          size="sm"
                          icon={Play}
                          title="Run Agent in Playground"
                        >
                          Run
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={Eye}
                        onClick={() => setInspectingAgent(agent)}
                        title="Inspect Agent Configuration"
                      >
                        Inspect
                      </Button>
                    </div>

                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        icon={Copy}
                        onClick={() => handleDuplicate(agent)}
                        title="Duplicate Agent"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        icon={Edit3}
                        onClick={() => handleOpenEdit(agent)}
                        title="Edit Agent"
                      />
                      <Button
                        variant="danger"
                        size="sm"
                        icon={Trash2}
                        onClick={() => setDeletingAgent(agent)}
                        title="Delete Agent"
                      />
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </section>
      </PageContainer>

      {/* Modals */}
      <AgentFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingAgent(null);
        }}
        onSubmit={handleSaveAgent}
        agentToEdit={editingAgent}
        isLoading={actionLoading}
      />

      <AgentDetailModal
        isOpen={Boolean(inspectingAgent)}
        onClose={() => setInspectingAgent(null)}
        agent={inspectingAgent}
        onEdit={handleOpenEdit}
        onDuplicate={handleDuplicate}
      />

      <DeleteAgentModal
        isOpen={Boolean(deletingAgent)}
        onClose={() => setDeletingAgent(null)}
        onConfirm={handleDeleteConfirm}
        agentName={deletingAgent?.name}
        isLoading={actionLoading}
      />

      <AiAssistedModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        onAgentSaved={(newAgent) => {
          setSuccessMessage(`Agent "${newAgent.name}" generated with Groq and added to workshop.`);
          fetchAgents();
        }}
      />
    </div>
  );
};
