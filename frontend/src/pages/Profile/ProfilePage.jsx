import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { PageContainer } from '../../components/layout/PageContainer';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { agentApi, executionApi } from '../../services/apiClient';
import {
  User,
  Mail,
  Calendar,
  ShieldCheck,
  Bot,
  Clock,
  Play,
  LogOut,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Layers,
  Lock,
} from 'lucide-react';

export const ProfilePage = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ agents: 0, executions: 0 });
  const [loadingStats, setLoadingStats] = useState(true);

  const isJustRegistered = location.state?.justRegistered;

  useEffect(() => {
    let mounted = true;
    async function loadStats() {
      try {
        const [agentsRes, execsRes] = await Promise.allSettled([
          agentApi.list(),
          executionApi.list({ limit: 1 }),
        ]);

        if (!mounted) return;

        const agentsCount =
          agentsRes.status === 'fulfilled' && agentsRes.value?.agents
            ? agentsRes.value.agents.length
            : 0;

        const execCount =
          execsRes.status === 'fulfilled' && execsRes.value?.pagination?.total
            ? execsRes.value.pagination.total
            : execsRes.status === 'fulfilled' && execsRes.value?.executions
            ? execsRes.value.executions.length
            : 0;

        setStats({ agents: agentsCount, executions: execCount });
      } catch (err) {
        console.error('Failed to load profile stats:', err);
      } finally {
        if (mounted) setLoadingStats(false);
      }
    }

    loadStats();
    return () => {
      mounted = false;
    };
  }, []);

  const handleLogout = async () => {
    try {
      sessionStorage.setItem('fable_logged_out', 'true');
      navigate('/', { replace: true });
      await logout();
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const formattedDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'Active';

  return (
    <div className="min-h-screen bg-paper pb-16">
      <PageContainer>
        {/* Welcome Banner for Newly Registered Users */}
        {isJustRegistered && (
          <div className="mb-6 p-4 rounded-sm bg-fable-chartreuse/20 border border-ink/30 flex items-start justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-sm bg-ink text-fable-chartreuse flex items-center justify-center font-bold shrink-0 mt-0.5">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-ink text-base">
                  Welcome to Fable, {user?.name}!
                </h3>
                <p className="text-xs text-ink-secondary mt-0.5 leading-relaxed">
                  Your developer workspace has been successfully created and configured. You can now configure autonomous agents, simulate runs in the sandbox, or explore the documentation.
                </p>
              </div>
            </div>
            <Link to="/agents">
              <Button variant="primary" size="sm" icon={ArrowRight}>
                Create Agent
              </Button>
            </Link>
          </div>
        )}

        {/* Page Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[11px] font-mono uppercase tracking-widest text-ink-muted">
                  Account Management
                </span>
                <Badge variant="success" dot={true} size="sm">
                  Active Workspace
                </Badge>
              </div>
              <h1 className="font-serif text-3xl sm:text-4xl text-ink font-normal tracking-tight">
                User Profile
              </h1>
              <p className="text-sm text-ink-secondary mt-1">
                Your authenticated developer identity, workspace boundaries, and session credentials.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link to="/dashboard">
                <Button variant="outline" size="sm">
                  Dashboard
                </Button>
              </Link>
              <Button
                variant="outline"
                size="sm"
                icon={LogOut}
                onClick={handleLogout}
                className="text-status-error hover:bg-status-error/10 hover:border-status-error/40"
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>

        {/* Profile Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Identity & Primary Details (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Identity Card */}
            <Card className="bg-white">
              <CardHeader className="bg-paper-muted/50 border-b border-hairline">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-sm bg-ink text-fable-chartreuse flex items-center justify-center font-mono font-bold text-xl shadow-editorial">
                      {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <span>{user?.name || 'Developer'}</span>
                        <CheckCircle2 className="w-4 h-4 text-status-success" title="Verified Account" />
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Developer &bull; Primary Workspace Owner
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant="default" size="sm">
                    Developer Tier
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-3.5 bg-paper rounded-sm border border-hairline space-y-1">
                    <div className="flex items-center gap-1.5 text-ink-muted text-[10px] font-mono uppercase tracking-wider">
                      <User className="w-3.5 h-3.5" />
                      <span>Full Name</span>
                    </div>
                    <div className="text-sm font-semibold text-ink">
                      {user?.name || 'Not Provided'}
                    </div>
                  </div>

                  <div className="p-3.5 bg-paper rounded-sm border border-hairline space-y-1">
                    <div className="flex items-center gap-1.5 text-ink-muted text-[10px] font-mono uppercase tracking-wider">
                      <Mail className="w-3.5 h-3.5" />
                      <span>Email Address</span>
                    </div>
                    <div className="text-sm font-semibold text-ink truncate">
                      {user?.email || 'Not Provided'}
                    </div>
                  </div>

                  <div className="p-3.5 bg-paper rounded-sm border border-hairline space-y-1">
                    <div className="flex items-center gap-1.5 text-ink-muted text-[10px] font-mono uppercase tracking-wider">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Member Since</span>
                    </div>
                    <div className="text-sm font-semibold text-ink">
                      {formattedDate}
                    </div>
                  </div>

                  <div className="p-3.5 bg-paper rounded-sm border border-hairline space-y-1">
                    <div className="flex items-center gap-1.5 text-ink-muted text-[10px] font-mono uppercase tracking-wider">
                      <Layers className="w-3.5 h-3.5" />
                      <span>Workspace Mode</span>
                    </div>
                    <div className="text-sm font-semibold text-ink flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-status-success inline-block"></span>
                      <span>Single-Tenant Isolated</span>
                    </div>
                  </div>
                </div>

                {/* Workspace Capabilities */}
                <div className="pt-4 border-t border-hairline/60">
                  <h4 className="text-xs font-mono uppercase tracking-wider text-ink-muted mb-3">
                    Workspace Entitlements
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                    <div className="p-2.5 bg-paper-muted rounded-sm border border-hairline/70">
                      <div className="font-semibold text-ink">Autonomous Agents</div>
                      <div className="text-[11px] text-ink-secondary mt-0.5">Unlimited Creation</div>
                    </div>
                    <div className="p-2.5 bg-paper-muted rounded-sm border border-hairline/70">
                      <div className="font-semibold text-ink">Sandboxed Tools</div>
                      <div className="text-[11px] text-ink-secondary mt-0.5">Math &amp; HTTP Allowlist</div>
                    </div>
                    <div className="p-2.5 bg-paper-muted rounded-sm border border-hairline/70">
                      <div className="font-semibold text-ink">Live Simulation</div>
                      <div className="text-[11px] text-ink-secondary mt-0.5">Interactive Playground</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions Card */}
            <Card className="bg-white">
              <CardHeader className="pb-3 border-b border-hairline/60">
                <CardTitle className="text-sm">Quick Workspace Navigation</CardTitle>
              </CardHeader>
              <CardContent className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Link
                  to="/agents"
                  className="p-3 rounded-sm border border-hairline hover:border-ink/40 bg-paper transition-all group flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between mb-2">
                    <Bot className="w-4 h-4 text-ink" />
                    <ArrowRight className="w-3.5 h-3.5 text-ink-muted group-hover:text-ink transition-colors" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-ink">Agents Workshop</div>
                    <div className="text-[10px] font-mono text-ink-muted mt-0.5">
                      {loadingStats ? 'Loading...' : `${stats.agents} agents`}
                    </div>
                  </div>
                </Link>

                <Link
                  to="/playground"
                  className="p-3 rounded-sm border border-hairline hover:border-ink/40 bg-paper transition-all group flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between mb-2">
                    <Play className="w-4 h-4 text-fable-chartreuse fill-ink" />
                    <ArrowRight className="w-3.5 h-3.5 text-ink-muted group-hover:text-ink transition-colors" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-ink">Sandbox Playground</div>
                    <div className="text-[10px] font-mono text-ink-muted mt-0.5">
                      Simulate Prompts
                    </div>
                  </div>
                </Link>

                <Link
                  to="/executions"
                  className="p-3 rounded-sm border border-hairline hover:border-ink/40 bg-paper transition-all group flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between mb-2">
                    <Clock className="w-4 h-4 text-ink" />
                    <ArrowRight className="w-3.5 h-3.5 text-ink-muted group-hover:text-ink transition-colors" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-ink">Execution Traces</div>
                    <div className="text-[10px] font-mono text-ink-muted mt-0.5">
                      {loadingStats ? 'Loading...' : `${stats.executions} runs logged`}
                    </div>
                  </div>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Security Boundary & Session Diagnostics (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Security Boundary Card */}
            <Card className="bg-white">
              <CardHeader className="bg-fable-chartreuse/10 border-b border-hairline">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-ink" />
                  <div>
                    <CardTitle className="text-sm">Security &amp; Session Boundary</CardTitle>
                    <CardDescription className="text-xs">
                      Cryptographic credentials protecting your workspace
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4 space-y-3.5 text-xs font-mono">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase text-ink-muted block">Session Storage</span>
                  <div className="p-2 bg-paper rounded-sm border border-hairline text-ink font-semibold flex items-center justify-between">
                    <span>HttpOnly &middot; SameSite=Lax</span>
                    <Badge variant="success" size="sm">Guarded</Badge>
                  </div>
                  <p className="text-[10px] font-sans text-ink-muted leading-tight mt-1">
                    Session tokens are never stored in localStorage or accessible to client-side scripts.
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] uppercase text-ink-muted block">CSRF Enforcement</span>
                  <div className="p-2 bg-paper rounded-sm border border-hairline text-ink font-semibold flex items-center justify-between">
                    <span>Double-Submit Token</span>
                    <Badge variant="success" size="sm">Active</Badge>
                  </div>
                  <p className="text-[10px] font-sans text-ink-muted leading-tight mt-1">
                    State-modifying requests attach cryptographic signature validation.
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] uppercase text-ink-muted block">Data Privacy</span>
                  <div className="p-2 bg-paper rounded-sm border border-hairline text-ink font-semibold flex items-center justify-between">
                    <span>Tenant Cross-Account Isolation</span>
                    <Badge variant="success" size="sm">Enforced</Badge>
                  </div>
                  <p className="text-[10px] font-sans text-ink-muted leading-tight mt-1">
                    Agents and traces are strictly bound to your account; foreign tenant queries return 404.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Account Management & Security Notice */}
            <Card className="bg-white">
              <CardHeader className="pb-2 border-b border-hairline/60">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-ink-secondary" />
                  <CardTitle className="text-sm">Account Operations</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                <p className="text-xs text-ink-secondary leading-relaxed">
                  Need to leave your workstation? Terminating your session revokes the active authentication cookie and clears local security tokens.
                </p>
                <Button
                  variant="outline"
                  size="md"
                  icon={LogOut}
                  onClick={handleLogout}
                  className="w-full text-status-error hover:bg-status-error/10 hover:border-status-error/40 font-mono text-xs uppercase tracking-wider"
                >
                  End Active Session (Sign Out)
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </PageContainer>
    </div>
  );
};

export default ProfilePage;
