import React from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../../components/layout/Navbar';
import { PageContainer } from '../../components/layout/PageContainer';
import { LandingFooter } from '../../components/landing/LandingFooter';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Shield, ArrowLeft, Lock, Key, Cpu, Database, Eye } from 'lucide-react';

export const PrivacyPage = () => {
  return (
    <div className="min-h-screen bg-paper flex flex-col font-sans selection:bg-fable-chartreuse selection:text-ink">
      <Navbar />

      <PageContainer className="flex-1 py-12 space-y-10 max-w-4xl">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-mono text-ink-muted">
          <Link to="/" className="hover:text-ink transition-colors flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Home</span>
          </Link>
          <span>/</span>
          <span className="text-ink">Privacy &amp; Security</span>
        </div>

        {/* Header Section */}
        <header className="space-y-3 border-b border-hairline pb-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-sm bg-ink text-fable-chartreuse flex items-center justify-center font-mono font-bold text-sm shadow-editorial">
              <Shield className="w-4 h-4" />
            </div>
            <span className="text-xs font-mono uppercase tracking-widest text-ink-secondary">
              Architecture &amp; Data Protection
            </span>
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl text-ink font-normal tracking-tight">
            Privacy &amp; Security Policy
          </h1>
          <p className="text-sm font-mono text-ink-muted">
            Last Updated: October 2026 &middot; Version 1.0
          </p>
        </header>

        {/* Core Pillars Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-white border border-hairline rounded-sm space-y-1">
            <div className="flex items-center gap-2 text-ink font-semibold text-xs font-mono">
              <Lock className="w-4 h-4 text-status-success" />
              <span>Tenant Isolation</span>
            </div>
            <p className="text-xs text-ink-secondary">Strict MongoDB query filtering bound exclusively to verified server session IDs.</p>
          </div>
          <div className="p-4 bg-white border border-hairline rounded-sm space-y-1">
            <div className="flex items-center gap-2 text-ink font-semibold text-xs font-mono">
              <Cpu className="w-4 h-4 text-status-success" />
              <span>Zero-Eval Sandbox</span>
            </div>
            <p className="text-xs text-ink-secondary">Deterministic AST math evaluator with input length, depth, and loop hard caps.</p>
          </div>
          <div className="p-4 bg-white border border-hairline rounded-sm space-y-1">
            <div className="flex items-center gap-2 text-ink font-semibold text-xs font-mono">
              <Key className="w-4 h-4 text-status-success" />
              <span>Provider Key Isolation</span>
            </div>
            <p className="text-xs text-ink-secondary">API keys isolated on backend runtime environment; zero credentials sent to client.</p>
          </div>
        </div>

        {/* Detailed Policy Sections */}
        <div className="space-y-8 text-sm text-ink-secondary leading-relaxed">
          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="text-lg">1. Information We Collect</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p>
                Fable operates under strict data minimization principles. We collect only what is necessary to authenticate your account and execute agent workflows:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-xs text-ink-secondary">
                <li><strong>Account Credentials:</strong> Full name, normalized email address, and bcrypt-hashed password (12 salt rounds, never stored or transmitted in plaintext).</li>
                <li><strong>Agent Configurations:</strong> Agent names, system prompts, model selections, assigned built-in tools, parameters (temperature, maxTokens), and execution loop limits.</li>
                <li><strong>Execution History &amp; Telemetry:</strong> Input tasks, chat transcripts, immutable agent snapshots captured at runtime, step durations, token statistics, and sandboxed tool call traces.</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="text-lg">2. Tenant Boundary &amp; Cross-Account Isolation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p>
                Every agent configuration and execution trace in Fable is cryptographically bound to your authenticated user account (<code className="font-mono text-xs px-1 bg-paper-muted border border-hairline rounded">owner: req.user._id</code>).
              </p>
              <p>
                All database queries enforce ownership checks at the API controller layer. A user attempting to query or modify an agent or execution belonging to another builder receives a 404 Not Found response, completely shielding your prompts and outputs from cross-account discovery.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="text-lg">3. Tool Execution Sandboxing &amp; Safety Guardrails</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p>
                To eliminate code injection, prototype pollution, and server resource starvation risks, Fable implements layered execution constraints:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-xs text-ink-secondary">
                <li><strong>Safe AST Arithmetic Evaluator:</strong> Mathematical operations are parsed into an Abstract Syntax Tree using custom recursive descent. Standard JavaScript <code className="font-mono text-[11px] px-1 bg-paper-muted border border-hairline rounded">eval()</code>, <code className="font-mono text-[11px] px-1 bg-paper-muted border border-hairline rounded">Function()</code>, and process access are strictly prohibited.</li>
                <li><strong>Input Length &amp; Depth Caps:</strong> Expressions cannot exceed 120 characters; expression nesting depth is capped at 10 levels.</li>
                <li><strong>Multi-Turn Loop Cap:</strong> Execution iterations between models and tools are capped at a maximum of 3 turns to prevent infinite runaway billing loops.</li>
                <li><strong>Strict Tool Allowlisting:</strong> Agents can only invoke tools explicitly granted in their configuration. Unauthorized tool calls are rejected before execution.</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="text-lg">4. Upstream Inference &amp; AI Provider Interactions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p>
                When an agent executes a task or chat turn, your input prompt and assigned tool definitions are transmitted via encrypted HTTPS to our inference provider (Groq LPU).
              </p>
              <p>
                All provider API keys are stored exclusively in backend environment variables and are never transmitted to client browsers. Requests do not permit third-party inference providers to train foundational models on your private prompts.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="text-lg">5. Immutable Execution Snapshots &amp; Auditability</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p>
                Fable records immutable point-in-time snapshots of each agent configuration at the exact moment of execution. If an agent is subsequently edited or deleted, historical execution telemetry retains the original configuration, parameters, and tool traces for full forensic auditability.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="text-lg">6. Data Portability, Retention &amp; Deletion</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p>
                You retain complete control over your data. You may delete individual agents or test runs directly through the workshop interface. Upon deletion, records are purged from the database without lingering background retention.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Footer Navigation Strip */}
        <div className="pt-8 border-t border-hairline flex flex-wrap items-center justify-between gap-4">
          <Link to="/">
            <Button variant="outline" size="sm" icon={ArrowLeft}>
              Back to Home
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/terms">
              <Button variant="ghost" size="sm">
                Terms &amp; Conditions
              </Button>
            </Link>
            <Link to="/cookies">
              <Button variant="outline" size="sm">
                Cookie Policy
              </Button>
            </Link>
          </div>
        </div>
      </PageContainer>

      <LandingFooter />
    </div>
  );
};
