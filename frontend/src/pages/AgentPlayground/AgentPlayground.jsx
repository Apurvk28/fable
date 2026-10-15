import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { PageContainer } from '../../components/layout/PageContainer';
import { Navbar } from '../../components/layout/Navbar';
import { Button } from '../../components/ui/Button';
import { Textarea } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Alert } from '../../components/ui/Alert';
import { agentApi } from '../../services/apiClient';
import { ToolTraceList } from '../../components/execution/ToolTraceList';
import {
  Play,
  MessageSquare,
  Bot,
  Send,
  RefreshCw,
  Clock,
  Cpu,
  Wrench,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  Calculator,
  FileText,
  Calendar,
  Sparkles,
  ArrowLeft,
  RotateCcw,
  Zap
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

export const AgentPlayground = () => {
  const { agentId: routeAgentId } = useParams();
  const navigate = useNavigate();

  // State
  const [agents, setAgents] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [isLoadingAgents, setIsLoadingAgents] = useState(true);

  // Execution State
  const [mode, setMode] = useState('task'); // 'task' | 'chat'
  const [promptInput, setPromptInput] = useState('');
  const [executionState, setExecutionState] = useState('idle'); // 'idle' | 'running' | 'completed' | 'failed'
  const [currentExecution, setCurrentExecution] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [recentExecutions, setRecentExecutions] = useState([]);
  const [expandedTraces, setExpandedTraces] = useState({});
  const [errorBanner, setErrorBanner] = useState(null);
  const [liveStatusMessage, setLiveStatusMessage] = useState('');

  const messagesEndRef = useRef(null);

  // Fetch all agents on mount
  useEffect(() => {
    let isMounted = true;
    agentApi
      .getAgents()
      .then((res) => {
        if (!isMounted) return;
        const list = res.agents || [];
        setAgents(list);

        if (list.length > 0) {
          if (routeAgentId) {
            const found = list.find((a) => a.id === routeAgentId);
            setSelectedAgent(found || list[0]);
          } else {
            setSelectedAgent(list[0]);
          }
        }
      })
      .catch((err) => {
        setErrorBanner(err.message || 'Failed to load agents.');
      })
      .finally(() => {
        if (isMounted) setIsLoadingAgents(false);
      });

    return () => {
      isMounted = false;
    };
  }, [routeAgentId]);

  // When selected agent changes, fetch its recent executions
  useEffect(() => {
    if (selectedAgent?.id) {
      agentApi
        .getRecentExecutions(selectedAgent.id)
        .then((res) => {
          setRecentExecutions(res.executions || []);
        })
        .catch(() => {});
    }
  }, [selectedAgent]);

  // Scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, executionState]);

  const handleAgentChange = (e) => {
    const newId = e.target.value;
    const found = agents.find((a) => a.id === newId);
    if (found) {
      setSelectedAgent(found);
      navigate(`/agents/${found.id}/playground`, { replace: true });
      // Reset state for new agent
      setCurrentExecution(null);
      setChatMessages([]);
      setExecutionState('idle');
      setErrorBanner(null);
    }
  };

  const toggleTraceExpand = (idx) => {
    setExpandedTraces((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const handleResetSession = () => {
    setChatMessages([]);
    setCurrentExecution(null);
    setExecutionState('idle');
    setErrorBanner(null);
    setPromptInput('');
    setLiveStatusMessage('Playground session reset.');
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!promptInput.trim() || executionState === 'running' || !selectedAgent) return;

    const userInput = promptInput.trim();
    setPromptInput('');
    setErrorBanner(null);
    setExecutionState('running');
    setLiveStatusMessage('Agent is running task. Thinking and executing tool loop...');

    if (mode === 'chat') {
      // Append user message immediately to chat stream
      const newMessages = [...chatMessages, { role: 'user', content: userInput }];
      setChatMessages(newMessages);

      try {
        // Send conversation history to backend chat endpoint
        const historyPayload = chatMessages.map((m) => ({
          role: m.role,
          content: m.content,
        }));

        const res = await agentApi.chat(selectedAgent.id, userInput, historyPayload);
        setCurrentExecution(res);
        setExecutionState('completed');
        const toolCount = res.toolTraces?.length || 0;
        setLiveStatusMessage(
          `Execution completed in ${res.durationMs || 0} milliseconds with ${toolCount} tool ${toolCount === 1 ? 'call' : 'calls'}.`
        );

        // Append assistant response to chat stream
        setChatMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: res.output || 'No response generated.',
            toolTraces: res.toolTraces || [],
            durationMs: res.durationMs,
            tokenUsage: res.tokenUsage,
          },
        ]);

        // Refresh recent runs
        agentApi.getRecentExecutions(selectedAgent.id).then((r) => setRecentExecutions(r.executions || []));
      } catch (err) {
        setExecutionState('failed');
        setErrorBanner(err.message || 'Execution failed.');
        setLiveStatusMessage(`Execution failed: ${err.message || 'Execution failed.'}`);
        setChatMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: `Execution failed: ${err.message}`,
            isError: true,
          },
        ]);
      }
    } else {
      // Standalone Task Mode
      try {
        const res = await agentApi.runTask(selectedAgent.id, userInput);
        setCurrentExecution(res);
        setExecutionState('completed');
        const toolCount = res.toolTraces?.length || 0;
        setLiveStatusMessage(
          `Execution completed in ${res.durationMs || 0} milliseconds with ${toolCount} tool ${toolCount === 1 ? 'call' : 'calls'}.`
        );

        // Refresh recent runs
        agentApi.getRecentExecutions(selectedAgent.id).then((r) => setRecentExecutions(r.executions || []));
      } catch (err) {
        setExecutionState('failed');
        setErrorBanner(err.message || 'Task execution failed.');
        setLiveStatusMessage(`Task execution failed: ${err.message || 'Execution failed.'}`);
      }
    }
  };

  // Helper quick prompts based on enabled tools
  const getQuickPrompts = () => {
    if (!selectedAgent) return [];
    const tools = selectedAgent.tools || [];
    const prompts = [];

    if (tools.includes('calculator')) {
      prompts.push({
        label: 'Math Calculation',
        text: 'What is 15% compound interest on $12,500 over 3 years? Calculate it step by step using the calculator.',
      });
    }
    if (tools.includes('text_processor')) {
      prompts.push({
        label: 'Text Extraction',
        text: 'Summarize the following text and extract top 3 keywords using the text processor: "Artificial intelligence agents in Fable are designed with strict boundaries, deterministic tool sandboxes, and immutable execution logs for maximum auditability."',
      });
    }
    if (tools.includes('datetime')) {
      prompts.push({
        label: 'Date Difference',
        text: 'What is the exact difference in days and hours between 2026-01-01T00:00:00Z and today? Use the datetime tool.',
      });
    }
    if (prompts.length === 0) {
      prompts.push({
        label: 'Reasoning Prompt',
        text: 'Explain the core principles of building secure autonomous AI agents.',
      });
    }
    return prompts;
  };

  return (
    <div className="min-h-screen bg-paper flex flex-col font-sans">
      <Navbar />

      <PageContainer className="flex-1 py-6 space-y-6">
        {/* Screen reader live region for execution status announcements */}
        <div
          className="sr-only"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          {liveStatusMessage}
        </div>

        {/* Navigation Breadcrumb & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-hairline pb-4">
          <div className="flex items-center gap-3">
            <Link
              to="/agents"
              className="p-1.5 rounded-sm border border-hairline bg-white hover:bg-paper-muted text-ink-muted hover:text-ink transition-colors"
              title="Back to Agent Workshop"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif text-2xl font-bold text-ink">Agent Playground</h1>
                <Badge variant="accent" size="sm" className="font-mono text-[10px]">
                  Phase 6 Sandbox
                </Badge>
              </div>
              <p className="text-xs text-ink-secondary mt-0.5">
                Execute tasks, test built-in tools, and inspect model-tool iterations in real time.
              </p>
            </div>
          </div>

          {/* Agent Selector Dropdown */}
          <div className="flex items-center gap-3">
            <label className="text-xs font-mono uppercase text-ink-muted whitespace-nowrap">
              Active Agent:
            </label>
            {isLoadingAgents ? (
              <span className="text-xs font-mono text-ink-muted animate-pulse">Loading agents...</span>
            ) : agents.length === 0 ? (
              <Link to="/agents">
                <Button variant="primary" size="sm">Create an Agent First</Button>
              </Link>
            ) : (
              <div className="relative">
                <select
                  id="select-playground-agent"
                  value={selectedAgent?.id || ''}
                  onChange={handleAgentChange}
                  className="py-1.5 pl-3 pr-8 text-xs font-sans font-semibold border border-ink rounded-sm bg-white text-ink shadow-editorial focus:outline-none cursor-pointer"
                >
                  {agents.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({a.model})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Selected Agent Quick Specs Strip */}
        {selectedAgent && (
          <div className="bg-white p-3.5 rounded-sm border border-hairline shadow-editorial flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5 text-ink font-semibold">
                <Bot className="w-4 h-4 text-ink-secondary" />
                <span>{selectedAgent.name}</span>
              </div>
              <span className="text-ink-muted">·</span>
              <div className="flex items-center gap-1.5 text-ink-secondary">
                <Cpu className="w-3.5 h-3.5 text-ink-muted" />
                <Badge variant="accent" size="sm" className="font-mono text-[10px]">
                  {selectedAgent.model}
                </Badge>
              </div>
              <span className="text-ink-muted">·</span>
              <div className="flex items-center gap-1.5">
                <Wrench className="w-3.5 h-3.5 text-ink-muted" />
                <div className="flex items-center gap-1">
                  {selectedAgent.tools && selectedAgent.tools.length > 0 ? (
                    selectedAgent.tools.map((t) => {
                      const IconComp = TOOL_ICONS[t] || Wrench;
                      return (
                        <Badge key={t} variant="success" size="sm" className="text-[10px] flex items-center gap-1">
                          <IconComp className="w-2.5 h-2.5" />
                          <span>{TOOL_LABELS[t] || t}</span>
                        </Badge>
                      );
                    })
                  ) : (
                    <span className="text-ink-muted italic">No tools enabled</span>
                  )}
                </div>
              </div>
            </div>

            {/* Mode Toggle & Status Indicator */}
            <div className="flex items-center gap-3">
              {/* Status Badge */}
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-ink-muted uppercase">Status:</span>
                {executionState === 'idle' && (
                  <Badge variant="outline" size="sm">Idle</Badge>
                )}
                {executionState === 'running' && (
                  <Badge variant="accent" size="sm" className="animate-pulse flex items-center gap-1">
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    <span>Running</span>
                  </Badge>
                )}
                {executionState === 'completed' && (
                  <Badge variant="success" size="sm" className="flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Completed</span>
                  </Badge>
                )}
                {executionState === 'failed' && (
                  <Badge variant="error" size="sm" className="flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    <span>Failed</span>
                  </Badge>
                )}
              </div>

              {/* Mode Toggle */}
              <div className="flex items-center border border-hairline rounded-sm p-0.5 bg-paper">
                <button
                  type="button"
                  onClick={() => setMode('task')}
                  className={`px-2.5 py-1 text-[11px] font-mono rounded-sm transition-colors ${
                    mode === 'task' ? 'bg-ink text-white font-bold' : 'text-ink-secondary hover:text-ink'
                  }`}
                >
                  Task Runner
                </button>
                <button
                  type="button"
                  onClick={() => setMode('chat')}
                  className={`px-2.5 py-1 text-[11px] font-mono rounded-sm transition-colors ${
                    mode === 'chat' ? 'bg-ink text-white font-bold' : 'text-ink-secondary hover:text-ink'
                  }`}
                >
                  Chat Stream
                </button>
              </div>

              {/* Reset Session */}
              <Button
                variant="ghost"
                size="sm"
                icon={RotateCcw}
                onClick={handleResetSession}
                title="Clear current run / reset chat"
                disabled={executionState === 'running'}
              >
                Reset
              </Button>
            </div>
          </div>
        )}

        {/* Global Error Banner if any */}
        {errorBanner && (
          <Alert variant="error" title="Execution Error" dismissible onDismiss={() => setErrorBanner(null)}>
            {errorBanner}
          </Alert>
        )}

        {/* Main Grid: Execution Playground + Recent Runs Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          {/* Main Execution Column (3 cols) */}
          <div className="lg:col-span-3 space-y-4">
            {mode === 'task' ? (
              /* Standalone Task Mode Output Panel */
              <div className="bg-white rounded-sm border border-hairline shadow-editorial min-h-[380px] flex flex-col justify-between">
                <div className="p-5 space-y-6">
                  {/* Task Header */}
                  <div className="flex items-center justify-between border-b border-hairline pb-3">
                    <div className="flex items-center gap-2">
                      <Play className="w-4 h-4 text-ink" />
                      <h3 className="font-mono text-xs uppercase font-semibold tracking-wider text-ink">
                        Task Output & Execution Inspection
                      </h3>
                    </div>
                    {currentExecution && (
                      <span className="text-[11px] font-mono text-ink-muted">
                        Duration: {currentExecution.durationMs}ms · Turns: {currentExecution.turnsCount || 1} / {selectedAgent?.limits?.maxTurns || 3}
                      </span>
                    )}
                  </div>

                  {executionState === 'idle' && !currentExecution && (
                    <div className="py-16 text-center space-y-3">
                      <div className="w-12 h-12 rounded-full bg-paper border border-hairline flex items-center justify-center mx-auto text-ink-muted">
                        <Zap className="w-6 h-6" />
                      </div>
                      <h4 className="font-serif text-lg font-medium text-ink">Ready for Execution</h4>
                      <p className="text-xs text-ink-secondary max-w-md mx-auto">
                        Submit a task below to trigger the model inference loop. The agent will analyze your instructions and call enabled tools when needed.
                      </p>
                    </div>
                  )}

                  {executionState === 'running' && (
                    <div className="py-16 text-center space-y-4">
                      <div className="w-10 h-10 border-2 border-ink border-t-transparent rounded-full animate-spin mx-auto" />
                      <div className="space-y-1">
                        <h4 className="font-serif text-base font-medium text-ink">
                          Agent is thinking & executing tools...
                        </h4>
                        <p className="text-xs font-mono text-ink-muted">
                          Running with {selectedAgent?.model} on Groq Provider
                        </p>
                      </div>
                    </div>
                  )}

                  {currentExecution && (
                    <div className="space-y-5">
                      {/* User Input Prompt */}
                      <div className="p-3.5 bg-paper rounded-sm border border-hairline space-y-1">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-ink-muted block">
                          Submitted Task:
                        </span>
                        <p className="text-xs text-ink font-sans font-medium">
                          {currentExecution.execution?.input || currentExecution.input}
                        </p>
                      </div>

                      {/* Tool Execution Traces Section (if any tools were invoked) */}
                      {currentExecution.toolTraces && currentExecution.toolTraces.length > 0 && (
                        <ToolTraceList toolTraces={currentExecution.toolTraces} />
                      )}

                      {/* Final Assistant Output */}
                      <div className="space-y-1.5 pt-2 border-t border-hairline">
                        <span className="text-[11px] font-mono uppercase tracking-wider text-ink font-semibold flex items-center gap-1.5">
                          <Bot className="w-3.5 h-3.5 text-ink" />
                          Final Agent Response
                        </span>
                        <div className="p-4 bg-paper rounded-sm border border-hairline text-xs font-sans text-ink leading-relaxed whitespace-pre-wrap">
                          {currentExecution.output || 'No output produced.'}
                        </div>
                      </div>

                      {/* Token & Performance Metrics */}
                      {currentExecution.tokenUsage && (
                        <div className="p-2.5 bg-paper-muted rounded-sm border border-hairline flex flex-wrap items-center justify-between text-[11px] font-mono text-ink-muted">
                          <span>Prompt Tokens: {currentExecution.tokenUsage.promptTokens}</span>
                          <span>Completion Tokens: {currentExecution.tokenUsage.completionTokens}</span>
                          <span>Total Tokens: {currentExecution.tokenUsage.totalTokens}</span>
                          <span>Duration: {currentExecution.durationMs}ms</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Interactive Chat Mode Stream */
              <div className="bg-white rounded-sm border border-hairline shadow-editorial min-h-[420px] max-h-[550px] flex flex-col justify-between overflow-hidden">
                <div className="p-4 overflow-y-auto flex-1 space-y-4">
                  {chatMessages.length === 0 ? (
                    <div className="py-16 text-center space-y-2">
                      <MessageSquare className="w-8 h-8 text-ink-muted mx-auto" />
                      <h4 className="font-serif text-base text-ink">Start a Conversation</h4>
                      <p className="text-xs text-ink-secondary max-w-sm mx-auto">
                        Chat with {selectedAgent?.name}. The agent maintains context and invokes tools autonomously.
                      </p>
                    </div>
                  ) : (
                    chatMessages.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        {msg.role === 'assistant' && (
                          <div className="w-7 h-7 rounded-sm bg-ink text-white flex items-center justify-center shrink-0 mt-0.5">
                            <Bot className="w-4 h-4" />
                          </div>
                        )}
                        <div
                          className={`max-w-[80%] rounded-sm p-3.5 text-xs font-sans space-y-2 ${
                            msg.role === 'user'
                              ? 'bg-ink text-white'
                              : msg.isError
                              ? 'bg-rose-50 border border-rose-200 text-status-error'
                              : 'bg-paper border border-hairline text-ink'
                          }`}
                        >
                          <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>

                          {/* Chat Tool Call Badges */}
                          {msg.toolTraces && msg.toolTraces.length > 0 && (
                            <div className="pt-2 border-t border-hairline/60 flex flex-wrap items-center gap-1.5 text-[10px] font-mono">
                              <span className="text-ink-muted">Tools used:</span>
                              {msg.toolTraces.map((t, tIdx) => (
                                <Badge key={tIdx} variant="success" size="sm" className="text-[9px]">
                                  {t.tool} ({t.durationMs}ms)
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                  {executionState === 'running' && (
                    <div className="flex gap-3 items-center text-xs font-mono text-ink-muted">
                      <div className="w-6 h-6 border-2 border-ink border-t-transparent rounded-full animate-spin shrink-0" />
                      <span>{selectedAgent?.name} is thinking & invoking tools...</span>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </div>
            )}

            {/* Input Submission Bar */}
            <form onSubmit={handleSubmit} className="bg-white p-3.5 rounded-sm border border-hairline shadow-editorial space-y-2.5">
              <div className="flex items-start gap-2.5">
                <Textarea
                  id="textarea-playground-prompt"
                  rows={2}
                  className="flex-1 font-sans text-xs focus:ring-ink"
                  placeholder={
                    mode === 'task'
                      ? 'Describe a task or question for this agent (e.g. calculate expression, summarize text)...'
                      : 'Send a message to continue the conversation...'
                  }
                  value={promptInput}
                  onChange={(e) => setPromptInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit();
                    }
                  }}
                  disabled={executionState === 'running' || !selectedAgent}
                />
                <Button
                  id="btn-submit-task"
                  variant="primary"
                  type="submit"
                  icon={Send}
                  isLoading={executionState === 'running'}
                  disabled={!promptInput.trim() || executionState === 'running' || !selectedAgent}
                  className="h-10 self-end"
                >
                  {mode === 'task' ? 'Run Task' : 'Send'}
                </Button>
              </div>

              {/* Starter Quick-Prompt Chips */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[10px] font-mono uppercase text-ink-muted flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-ink-secondary" />
                  Try prompt:
                </span>
                {getQuickPrompts().map((qp, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setPromptInput(qp.text)}
                    className="text-[11px] font-sans px-2 py-0.5 rounded-sm border border-hairline bg-paper hover:bg-paper-muted hover:border-ink/40 text-ink-secondary hover:text-ink transition-colors"
                  >
                    {qp.label}
                  </button>
                ))}
              </div>
            </form>
          </div>

          {/* Sidebar: Recent Runs for this Agent (1 col) */}
          <div className="space-y-4">
            <Card>
              <CardHeader className="border-b border-hairline pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xs font-mono uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-ink" />
                    Recent Runs
                  </CardTitle>
                  <span className="text-[10px] font-mono text-ink-muted">
                    {recentExecutions.length} recorded
                  </span>
                </div>
              </CardHeader>
              <CardContent className="p-3 space-y-2">
                {recentExecutions.length === 0 ? (
                  <p className="text-xs text-ink-muted text-center py-4 italic">
                    No past runs recorded for this agent yet.
                  </p>
                ) : (
                  recentExecutions.slice(0, 5).map((run) => (
                    <div
                      key={run.id || run._id}
                      onClick={() => {
                        setCurrentExecution({
                          execution: run,
                          output: run.output,
                          toolTraces: run.toolTraces || [],
                          durationMs: run.durationMs,
                          turnsCount: run.turnsCount,
                          tokenUsage: run.tokenUsage,
                        });
                        setMode('task');
                      }}
                      className="p-2.5 rounded-sm border border-hairline bg-paper hover:bg-white hover:border-ink/40 cursor-pointer transition-all space-y-1 group"
                    >
                      <div className="flex items-center justify-between text-[11px] font-mono">
                        <span className="text-ink font-semibold truncate max-w-[120px]">
                          {run.mode === 'chat' ? 'Chat Turn' : 'Task Run'}
                        </span>
                        {run.status === 'completed' ? (
                          <Badge variant="success" size="sm">Success</Badge>
                        ) : (
                          <Badge variant="error" size="sm">Failed</Badge>
                        )}
                      </div>
                      <p className="text-[11px] text-ink-secondary truncate">
                        {run.input}
                      </p>
                      <div className="flex items-center justify-between text-[9px] font-mono text-ink-muted pt-1 border-t border-hairline/40">
                        <span>{run.durationMs}ms</span>
                        <span>{new Date(run.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Safety & Execution Specs Banner */}
            <div className="p-3 bg-paper rounded-sm border border-hairline text-xs font-mono text-ink-secondary space-y-2">
              <span className="text-[10px] uppercase font-bold text-ink block border-b border-hairline pb-1">
                Execution Engine Guardrails
              </span>
              <ul className="space-y-1 text-[11px]">
                <li>• Turn Limit: 3 tool loops max</li>
                <li>• Tool Timeout: 5s execution race</li>
                <li>• Tool Allowlist: Strict server check</li>
                <li>• Persistence: Immutable snapshots</li>
              </ul>
            </div>
          </div>
        </div>
      </PageContainer>
    </div>
  );
};
