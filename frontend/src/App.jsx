import React, { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { Navbar } from './components/layout/Navbar';
import { PageContainer } from './components/layout/PageContainer';
import { Button } from './components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './components/ui/Card';
import { Badge } from './components/ui/Badge';
import { checkHealth, agentApi, executionApi } from './services/apiClient';

// Lazy-loaded route components for optimized bundle delivery and code-splitting
const Login = lazy(() => import('./pages/Auth/Login').then(m => ({ default: m.Login })));
const Register = lazy(() => import('./pages/Auth/Register').then(m => ({ default: m.Register })));
const LandingPage = lazy(() => import('./pages/Landing/LandingPage').then(m => ({ default: m.LandingPage })));
const AgentList = lazy(() => import('./pages/Agents/AgentList').then(m => ({ default: m.AgentList })));
const AgentPlayground = lazy(() => import('./pages/AgentPlayground/AgentPlayground').then(m => ({ default: m.AgentPlayground })));
const ExecutionsList = lazy(() => import('./pages/Executions/ExecutionsList').then(m => ({ default: m.ExecutionsList })));
const ExecutionDetail = lazy(() => import('./pages/Executions/ExecutionDetail').then(m => ({ default: m.ExecutionDetail })));

// New Legal, Documentation, and Provider Matrix routes
const DocsPage = lazy(() => import('./pages/Documentation/DocsPage').then(m => ({ default: m.DocsPage })));
const LlmsPage = lazy(() => import('./pages/LLMs/LlmsPage').then(m => ({ default: m.LlmsPage })));
const TermsPage = lazy(() => import('./pages/Legal/TermsPage').then(m => ({ default: m.TermsPage })));
const CookiesPage = lazy(() => import('./pages/Legal/CookiesPage').then(m => ({ default: m.CookiesPage })));
const PrivacyPage = lazy(() => import('./pages/Legal/PrivacyPage').then(m => ({ default: m.PrivacyPage })));
const GithubPage = lazy(() => import('./pages/Legal/GithubPage').then(m => ({ default: m.GithubPage })));

import { 
  Activity, 
  CheckCircle2, 
  RefreshCw, 
  ShieldCheck, 
  Bot, 
  ArrowRight, 
  Plus, 
  Clock,
  Play,
  BookOpen,
  Terminal,
  Zap,
  Server
} from 'lucide-react';

function DashboardView() {
  const { user } = useAuth();
  const [healthData, setHealthData] = useState(null);
  const [healthStatus, setHealthStatus] = useState('loading');
  const [healthLatency, setHealthLatency] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [agentCount, setAgentCount] = useState(0);
  const [recentAgents, setRecentAgents] = useState([]);
  const [executionCount, setExecutionCount] = useState(0);
  const [recentExecutions, setRecentExecutions] = useState([]);

  const fetchHealth = async () => {
    setIsRefreshing(true);
    const start = performance.now();
    try {
      const data = await checkHealth();
      const elapsed = Math.round(performance.now() - start);
      setHealthData(data);
      setHealthLatency(elapsed);
      setHealthStatus('ok');
    } catch (err) {
      setHealthStatus('error');
      setHealthData({ error: err.message });
    } finally {
      setIsRefreshing(false);
    }
  };

  const fetchAgentsSummary = async () => {
    try {
      const res = await agentApi.getAgents();
      setAgentCount(res.totalCount || 0);
      setRecentAgents((res.agents || []).slice(0, 3));
    } catch (err) {
      console.warn('Failed to fetch agents summary:', err);
    }
  };

  const fetchExecutionsSummary = async () => {
    try {
      const res = await executionApi.getExecutions({ limit: 4 });
      setExecutionCount(res.pagination?.totalCount || 0);
      setRecentExecutions(res.executions || []);
    } catch (err) {
      console.warn('Failed to fetch executions summary:', err);
    }
  };

  useEffect(() => {
    fetchHealth();
    fetchAgentsSummary();
    fetchExecutionsSummary();
  }, []);

  return (
    <div className="min-h-screen bg-paper flex flex-col font-sans selection:bg-fable-chartreuse selection:text-ink">
      <Navbar backendStatus={{ status: healthStatus }} />

      <PageContainer className="flex-1 space-y-8 py-8">
        {/* Authenticated Workspace Header Strip */}
        <section className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-hairline pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="success" size="md" dot={true}>Session Active</Badge>
              <span className="text-xs font-mono uppercase tracking-widest text-ink-muted">
                Authenticated Workspace
              </span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl text-ink font-normal tracking-tight">
              Welcome back, {user?.name}
            </h1>
            <p className="text-sm text-ink-secondary max-w-2xl leading-relaxed">
              Your autonomous AI agent authoring environment is active. Manage agent configurations, simulate reasoning in the playground, and inspect execution telemetry.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Button 
              variant="outline" 
              size="sm" 
              icon={RefreshCw} 
              isLoading={isRefreshing}
              onClick={fetchHealth}
            >
              Re-check API
            </Button>
            <Link to="/agents">
              <Button variant="primary" size="sm" icon={Plus}>
                Create Agent
              </Button>
            </Link>
          </div>
        </section>

        {/* 4-Stat High-Density Metrics Bar spanning full window width */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-sans">
          {/* Metric 1: Configured Agents */}
          <Link to="/agents" className="block group">
            <Card className="bg-white hover:border-ink/50 transition-colors h-full">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-ink-muted block">
                    Configured Agents
                  </span>
                  <div className="font-serif text-3xl text-ink font-normal group-hover:text-ink-secondary transition-colors">
                    {agentCount}
                  </div>
                  <span className="text-[11px] font-mono text-ink-secondary block">
                    {agentCount === 1 ? '1 active agent' : `${agentCount} active agents`}
                  </span>
                </div>
                <div className="w-10 h-10 rounded-sm bg-fable-chartreuse/25 border border-ink text-ink flex items-center justify-center font-bold">
                  <Bot className="w-5 h-5" />
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Metric 2: Total Executions */}
          <Link to="/executions" className="block group">
            <Card className="bg-white hover:border-ink/50 transition-colors h-full">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-ink-muted block">
                    Total Executions
                  </span>
                  <div className="font-serif text-3xl text-ink font-normal group-hover:text-ink-secondary transition-colors">
                    {executionCount}
                  </div>
                  <span className="text-[11px] font-mono text-ink-secondary block">
                    Immutable run logs
                  </span>
                </div>
                <div className="w-10 h-10 rounded-sm bg-paper-muted border border-hairline text-ink flex items-center justify-center font-bold">
                  <Clock className="w-5 h-5" />
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Metric 3: Infrastructure Health */}
          <Card className="bg-white h-full">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-ink-muted block">
                  Backend API &amp; DB
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-serif text-3xl text-ink font-normal">
                    {healthLatency ? `${healthLatency}ms` : 'Online'}
                  </span>
                  <Badge variant="success" size="sm" dot={true}>200 OK</Badge>
                </div>
                <span className="text-[11px] font-mono text-ink-secondary block">
                  {healthData?.service || 'fable-backend'} (:5001)
                </span>
              </div>
              <div className="w-10 h-10 rounded-sm bg-emerald-50 border border-status-success/30 text-status-success flex items-center justify-center font-bold">
                <Activity className="w-5 h-5" />
              </div>
            </CardContent>
          </Card>

          {/* Metric 4: Session Security */}
          <Card className="bg-white h-full">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="space-y-1 overflow-hidden">
                <span className="text-[10px] font-mono uppercase tracking-wider text-ink-muted block">
                  Session Security
                </span>
                <div className="text-xs font-mono font-semibold text-status-success flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span>HttpOnly &middot; SameSite</span>
                </div>
                <span className="text-[11px] font-mono text-ink-muted truncate block max-w-[150px]">
                  ID: {user?.id}
                </span>
              </div>
              <div className="w-10 h-10 rounded-sm bg-ink text-white flex items-center justify-center font-bold font-mono text-sm">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* 12-Column Responsive Workspace Grid matching Window Ratio (8 Cols Left / 4 Cols Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Primary Panel (8 Columns) */}
          <div className="lg:col-span-8 space-y-6">
            {/* 1. Agent Workshop Section */}
            <Card className="bg-white">
              <CardHeader className="bg-fable-chartreuse/15">
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-sm bg-ink text-fable-chartreuse flex items-center justify-center font-bold">
                      <Bot className="w-5 h-5" />
                    </div>
                    <div>
                      <CardTitle className="text-base">Specialized AI Agents</CardTitle>
                      <CardDescription>
                        {agentCount === 0
                          ? 'No agents configured yet in your isolated workshop'
                          : `You have ${agentCount} configured ${agentCount === 1 ? 'agent' : 'agents'} ready for testing`}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link to="/agents">
                      <Button variant="primary" size="sm" icon={Plus}>
                        Manage Agents
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-4">
                {recentAgents.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                    {recentAgents.map((ag) => (
                      <div
                        key={ag.id}
                        className="p-3.5 bg-paper rounded-sm border border-hairline hover:border-ink/40 transition-colors flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <span className="font-medium text-xs text-ink truncate font-sans">{ag.name}</span>
                            <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-paper-muted border border-hairline text-ink-muted">
                              {ag.tools?.length || 0} tools
                            </span>
                          </div>
                          <div className="text-[10px] font-mono text-ink-muted truncate">{ag.model}</div>
                          {ag.description && (
                            <p className="text-[11px] text-ink-secondary line-clamp-2 mt-1.5 leading-relaxed">
                              {ag.description}
                            </p>
                          )}
                        </div>
                        <div className="mt-3 pt-2 border-t border-hairline/60 flex items-center justify-between">
                          <Link
                            to={`/agents/${ag.id}/playground`}
                            className="text-[11px] font-mono text-ink hover:text-ink-secondary flex items-center gap-1 font-semibold"
                          >
                            <Play className="w-3 h-3 text-fable-chartreuse fill-ink" />
                            <span>Run Sandbox</span>
                          </Link>
                          <Link
                            to="/agents"
                            className="text-[10px] font-mono text-ink-muted hover:underline"
                          >
                            Edit
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 space-y-3">
                    <p className="text-xs text-ink-secondary">
                      You have not configured any specialized AI agents yet.
                    </p>
                    <Link to="/agents">
                      <Button variant="primary" size="sm" icon={Plus}>
                        Configure First Agent
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 2. Execution Observability Section */}
            <Card className="bg-white">
              <CardHeader className="bg-paper-muted">
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-sm bg-ink text-white flex items-center justify-center font-bold">
                      <Clock className="w-5 h-5 text-fable-chartreuse" />
                    </div>
                    <div>
                      <CardTitle className="text-base">Recent Execution Telemetry</CardTitle>
                      <CardDescription>
                        {executionCount === 0
                          ? 'No task runs recorded yet'
                          : `${executionCount} total executions captured with immutable snapshots and tool traces`}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link to="/executions">
                      <Button variant="outline" size="sm" icon={ArrowRight}>
                        View All
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-4">
                {recentExecutions.length > 0 ? (
                  <div className="space-y-2.5">
                    {recentExecutions.map((run) => (
                      <Link
                        key={run.id}
                        to={`/executions/${run.id}`}
                        className="p-3 bg-paper hover:bg-white hover:border-ink/40 rounded-sm border border-hairline flex flex-col sm:flex-row sm:items-center justify-between gap-2 transition-colors block group"
                      >
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-xs text-ink group-hover:text-ink-secondary truncate">
                              {run.agentSnapshot?.name || 'Agent Run'}
                            </span>
                            <span className="text-[9px] font-mono text-ink-muted uppercase">
                              &middot; {run.mode || 'task'}
                            </span>
                          </div>
                          <p className="text-xs text-ink-secondary truncate font-mono">
                            {run.input}
                          </p>
                        </div>
                        <div className="flex items-center gap-3 shrink-0 text-xs font-mono">
                          {run.status === 'completed' ? (
                            <Badge variant="success" size="sm" className="text-[9px]">Success</Badge>
                          ) : (
                            <Badge variant="error" size="sm" className="text-[9px]">Failed</Badge>
                          )}
                          <span className="text-ink-muted text-[10px]">{run.durationMs}ms</span>
                          <span className="text-ink-muted text-[10px]">
                            {new Date(run.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 space-y-3">
                    <p className="text-xs text-ink-secondary">
                      No agent executions recorded yet. Run a prompt in the sandbox to generate telemetry.
                    </p>
                    <Link to="/playground">
                      <Button variant="outline" size="sm" icon={Play}>
                        Open Playground
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Auxiliary Panel (4 Columns) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Quick Actions Panel */}
            <Card className="bg-white">
              <CardHeader className="pb-3 border-b border-hairline/60">
                <CardTitle className="text-sm">Quick Navigation</CardTitle>
                <CardDescription>Direct shortcuts to platform modules</CardDescription>
              </CardHeader>
              <CardContent className="p-3 space-y-1.5 font-mono text-xs">
                <Link
                  to="/playground"
                  className="p-2.5 rounded-sm hover:bg-paper-muted flex items-center justify-between transition-colors group"
                >
                  <span className="flex items-center gap-2 text-ink group-hover:text-ink-secondary">
                    <Play className="w-3.5 h-3.5 text-fable-chartreuse fill-ink" />
                    <span>Agent Playground</span>
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-ink-muted group-hover:translate-x-0.5 transition-transform" />
                </Link>

                <Link
                  to="/agents"
                  className="p-2.5 rounded-sm hover:bg-paper-muted flex items-center justify-between transition-colors group"
                >
                  <span className="flex items-center gap-2 text-ink group-hover:text-ink-secondary">
                    <Bot className="w-3.5 h-3.5 text-ink" />
                    <span>Agent Workshop</span>
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-ink-muted group-hover:translate-x-0.5 transition-transform" />
                </Link>

                <Link
                  to="/executions"
                  className="p-2.5 rounded-sm hover:bg-paper-muted flex items-center justify-between transition-colors group"
                >
                  <span className="flex items-center gap-2 text-ink group-hover:text-ink-secondary">
                    <Clock className="w-3.5 h-3.5 text-ink" />
                    <span>Execution History</span>
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-ink-muted group-hover:translate-x-0.5 transition-transform" />
                </Link>

                <Link
                  to="/docs"
                  className="p-2.5 rounded-sm hover:bg-paper-muted flex items-center justify-between transition-colors group"
                >
                  <span className="flex items-center gap-2 text-ink group-hover:text-ink-secondary">
                    <BookOpen className="w-3.5 h-3.5 text-ink" />
                    <span>Documentation</span>
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-ink-muted group-hover:translate-x-0.5 transition-transform" />
                </Link>

                <Link
                  to="/llms"
                  className="p-2.5 rounded-sm hover:bg-paper-muted flex items-center justify-between transition-colors group"
                >
                  <span className="flex items-center gap-2 text-ink group-hover:text-ink-secondary">
                    <Zap className="w-3.5 h-3.5 text-ink" />
                    <span>Supported LLMs</span>
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-ink-muted group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </CardContent>
            </Card>

            {/* Platform Health & Infrastructure */}
            <Card className="bg-white">
              <CardHeader className="pb-3 border-b border-hairline/60">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Server className="w-4 h-4 text-ink-secondary" />
                    <CardTitle className="text-sm">Platform Infrastructure</CardTitle>
                  </div>
                  <Badge variant="success" size="sm" dot={true}>200 OK</Badge>
                </div>
              </CardHeader>
              <CardContent className="p-4 space-y-2.5 text-xs font-mono">
                <div className="flex items-center justify-between py-1 border-b border-hairline/40">
                  <span className="text-ink-muted">Backend Service</span>
                  <span className="text-ink font-semibold">{healthData?.service || 'fable-backend'}</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-hairline/40">
                  <span className="text-ink-muted">Port / Gateway</span>
                  <span className="text-ink">:5001</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-hairline/40">
                  <span className="text-ink-muted">Environment</span>
                  <span className="text-ink">{healthData?.environment || 'development'}</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-hairline/40">
                  <span className="text-ink-muted">Inference Engine</span>
                  <span className="text-ink">Groq LPU</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-hairline/40">
                  <span className="text-ink-muted">Database Engine</span>
                  <span className="text-ink">MongoDB 8.0</span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-ink-muted">Loop Hard Cap</span>
                  <span className="text-ink">3 Turns Max</span>
                </div>
              </CardContent>
            </Card>

            {/* Account & Tenant Security Strip */}
            <Card className="bg-white">
              <CardHeader className="pb-3 border-b border-hairline/60">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-status-success" />
                  <CardTitle className="text-sm">Account Boundary</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-4 space-y-2 text-xs font-mono">
                <div>
                  <span className="text-ink-muted text-[10px] uppercase block">Authenticated ID</span>
                  <span className="text-ink font-semibold truncate block">{user?.id}</span>
                </div>
                <div>
                  <span className="text-ink-muted text-[10px] uppercase block">Verified Email</span>
                  <span className="text-ink font-semibold truncate block">{user?.email}</span>
                </div>
                <div className="pt-2 border-t border-hairline/40 text-[10px] text-ink-muted">
                  Cryptographically guarded by signed HttpOnly SameSite=Lax cookies.
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </PageContainer>
    </div>
  );
}

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function PageLoadingFallback() {
  return (
    <div className="min-h-screen bg-paper flex items-center justify-center p-4">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 rounded-sm bg-ink flex items-center justify-center text-fable-chartreuse font-mono font-bold text-base shadow-editorial animate-pulse">
          F
        </div>
        <p className="text-xs font-mono uppercase tracking-wider text-ink-secondary">
          Loading Workshop...
        </p>
      </div>
    </div>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AuthProvider>
        <Suspense fallback={<PageLoadingFallback />}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<LandingPage />} />
            
            {/* New Public Legal, Documentation & Provider Matrix Routes */}
            <Route path="/docs" element={<DocsPage />} />
            <Route path="/llms" element={<LlmsPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/cookies" element={<CookiesPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/github" element={<GithubPage />} />

            {/* Authenticated Application Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardView />
                </ProtectedRoute>
              }
            />
            <Route
              path="/agents"
              element={
                <ProtectedRoute>
                  <AgentList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/executions"
              element={
                <ProtectedRoute>
                  <ExecutionsList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/executions/:id"
              element={
                <ProtectedRoute>
                  <ExecutionDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/playground"
              element={
                <ProtectedRoute>
                  <AgentPlayground />
                </ProtectedRoute>
              }
            />
            <Route
              path="/agents/:agentId/playground"
              element={
                <ProtectedRoute>
                  <AgentPlayground />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
