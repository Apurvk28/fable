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

// Lazy-loaded route components for optimized initial bundle delivery
const Login = lazy(() => import('./pages/Auth/Login').then(m => ({ default: m.Login })));
const Register = lazy(() => import('./pages/Auth/Register').then(m => ({ default: m.Register })));
const LandingPage = lazy(() => import('./pages/Landing/LandingPage').then(m => ({ default: m.LandingPage })));
const AgentList = lazy(() => import('./pages/Agents/AgentList').then(m => ({ default: m.AgentList })));
const AgentPlayground = lazy(() => import('./pages/AgentPlayground/AgentPlayground').then(m => ({ default: m.AgentPlayground })));
const ExecutionsList = lazy(() => import('./pages/Executions/ExecutionsList').then(m => ({ default: m.ExecutionsList })));
const ExecutionDetail = lazy(() => import('./pages/Executions/ExecutionDetail').then(m => ({ default: m.ExecutionDetail })));
import { 
  Activity, 
  CheckCircle2, 
  RefreshCw, 
  ShieldCheck, 
  Bot, 
  ArrowRight, 
  Plus, 
  Clock 
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
      const res = await executionApi.getExecutions({ limit: 3 });
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
    <div className="min-h-screen bg-paper flex flex-col font-sans">
      <Navbar backendStatus={{ status: healthStatus }} />

      <PageContainer className="flex-1 space-y-10">
        {/* Authenticated User Orientation Header */}
        <section className="border-b border-hairline pb-8 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Badge variant="success" size="md" dot={true}>Session Active</Badge>
              <span className="text-xs font-mono text-ink-secondary">Authenticated Workspace</span>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                icon={RefreshCw} 
                isLoading={isRefreshing}
                onClick={fetchHealth}
              >
                Re-check API
              </Button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="font-serif text-3xl sm:text-4xl text-ink font-normal tracking-tight">
                Welcome back, {user?.name}
              </h1>
              <p className="text-sm text-ink-secondary max-w-2xl leading-relaxed mt-1">
                Your workspace is active and guarded by cryptographically signed HttpOnly sessions. 
                All agent configurations and execution history are strictly isolated to your account.
              </p>
            </div>
          </div>

          {/* User Account Verification Strip */}
          <div className="p-4 bg-white border border-hairline rounded-sm shadow-editorial grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
            <div>
              <span className="text-ink-muted text-[10px] uppercase block">Authenticated User ID</span>
              <span className="text-ink font-semibold truncate block">{user?.id}</span>
            </div>
            <div>
              <span className="text-ink-muted text-[10px] uppercase block">Verified Email</span>
              <span className="text-ink font-semibold truncate block">{user?.email}</span>
            </div>
            <div>
              <span className="text-ink-muted text-[10px] uppercase block">Session Security</span>
              <span className="text-status-success font-semibold flex items-center gap-1 mt-0.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>HttpOnly &middot; SameSite=Lax</span>
              </span>
            </div>
          </div>
        </section>

        {/* Agent Workshop Overview & Quick Actions */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="w-4 h-4 text-ink-secondary" />
              <h2 className="text-xs font-mono uppercase tracking-wider text-ink-secondary font-semibold">
                Agent Workshop
              </h2>
            </div>
            <Link to="/agents">
              <Button variant="ghost" size="sm" icon={ArrowRight} className="text-xs font-mono">
                Open Workshop
              </Button>
            </Link>
          </div>

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

            {recentAgents.length > 0 && (
              <CardContent className="pt-4">
                <div className="text-xs font-mono text-ink-muted uppercase tracking-wider mb-2">
                  Recent Agents
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {recentAgents.map((ag) => (
                    <div
                      key={ag.id}
                      className="p-3 bg-paper rounded-sm border border-hairline flex flex-col justify-between"
                    >
                      <div>
                        <div className="font-medium text-xs text-ink truncate font-sans">{ag.name}</div>
                        <div className="text-[10px] font-mono text-ink-muted mt-0.5">{ag.model}</div>
                      </div>
                      <div className="mt-2 text-[10px] font-mono text-ink-secondary">
                        {ag.tools?.length || 0} tools enabled
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            )}
          </Card>
        </section>

        {/* Execution History & Observability Overview */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-ink-secondary" />
              <h2 className="text-xs font-mono uppercase tracking-wider text-ink-secondary font-semibold">
                Execution Observability
              </h2>
            </div>
            <Link to="/executions">
              <Button variant="ghost" size="sm" icon={ArrowRight} className="text-xs font-mono">
                View Full History
              </Button>
            </Link>
          </div>

          <Card className="bg-white">
            <CardHeader className="bg-paper-muted">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-sm bg-ink text-white flex items-center justify-center font-bold">
                    <Clock className="w-5 h-5 text-fable-chartreuse" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Agent Run History &amp; Traces</CardTitle>
                    <CardDescription>
                      {executionCount === 0
                        ? 'No executions recorded yet. Run a task in the playground to begin capturing telemetry.'
                        : `${executionCount} total ${executionCount === 1 ? 'execution' : 'executions'} captured with immutable snapshots and tool traces.`}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Link to="/executions">
                    <Button variant="outline" size="sm">
                      Inspect Runs
                    </Button>
                  </Link>
                </div>
              </div>
            </CardHeader>

            {recentExecutions.length > 0 && (
              <CardContent className="pt-4">
                <div className="text-xs font-mono text-ink-muted uppercase tracking-wider mb-2">
                  Recent Runs
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {recentExecutions.map((run) => (
                    <Link
                      key={run.id}
                      to={`/executions/${run.id}`}
                      className="p-3 bg-paper hover:bg-white hover:border-ink/40 rounded-sm border border-hairline flex flex-col justify-between transition-colors group"
                    >
                      <div>
                        <div className="flex items-center justify-between text-[11px] font-mono">
                          <span className="font-semibold text-ink group-hover:text-ink-secondary truncate">
                            {run.agentSnapshot?.name || 'Agent Run'}
                          </span>
                          {run.status === 'completed' ? (
                            <Badge variant="success" size="sm" className="text-[9px]">Success</Badge>
                          ) : (
                            <Badge variant="error" size="sm" className="text-[9px]">Failed</Badge>
                          )}
                        </div>
                        <p className="text-[11px] text-ink-secondary truncate mt-1">
                          {run.input}
                        </p>
                      </div>
                      <div className="mt-2.5 pt-1.5 border-t border-hairline/60 flex items-center justify-between text-[9px] font-mono text-ink-muted">
                        <span>{run.durationMs}ms</span>
                        <span>{new Date(run.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            )}
          </Card>
        </section>

        {/* Platform & Service Connectivity Status */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-ink-secondary" />
            <h2 className="text-xs font-mono uppercase tracking-wider text-ink-secondary font-semibold">
              Platform &amp; Service Status
            </h2>
          </div>

          {healthStatus === 'ok' ? (
            <Card className="bg-white">
              <CardHeader className="bg-emerald-50/40">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-sm bg-status-success/15 flex items-center justify-center text-status-success">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Backend API &amp; Database Operational</CardTitle>
                    <CardDescription>Connected to Express API service and MongoDB storage</CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="success" dot={true}>200 OK</Badge>
                  <span className="text-xs font-mono text-ink-secondary">{healthLatency}ms</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 font-mono text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 bg-paper-muted rounded-sm border border-hairline">
                    <span className="text-ink-muted text-[10px] block uppercase">Service</span>
                    <span className="text-ink font-semibold">{healthData?.service}</span>
                  </div>
                  <div className="p-3 bg-paper-muted rounded-sm border border-hairline">
                    <span className="text-ink-muted text-[10px] block uppercase">Environment</span>
                    <span className="text-ink font-semibold">{healthData?.environment}</span>
                  </div>
                  <div className="p-3 bg-paper-muted rounded-sm border border-hairline">
                    <span className="text-ink-muted text-[10px] block uppercase">Server Timestamp</span>
                    <span className="text-ink font-semibold truncate block">{healthData?.timestamp}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="p-6 text-center text-ink-secondary text-sm">
              <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-ink-muted" />
              Connecting to backend service...
            </Card>
          )}
        </section>
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
