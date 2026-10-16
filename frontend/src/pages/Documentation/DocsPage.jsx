import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../../components/layout/Navbar';
import { PageContainer } from '../../components/layout/PageContainer';
import { LandingFooter } from '../../components/landing/LandingFooter';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import {
  BookOpen,
  ArrowLeft,
  ArrowRight,
  Code2,
  Shield,
  Cpu,
  Layers,
  CheckCircle2,
  Play,
  Terminal,
  Settings,
  Wrench,
  Clock,
  Calculator,
  FileText,
  Lock,
  Sparkles,
  ChevronRight,
  ExternalLink
} from 'lucide-react';

export const DocsPage = () => {
  const [activeTab, setActiveTab] = useState('quickstart');

  return (
    <div className="min-h-screen bg-paper flex flex-col font-sans selection:bg-fable-chartreuse selection:text-ink">
      <Navbar />

      <PageContainer className="flex-1 py-10 space-y-10 max-w-6xl">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-mono text-ink-muted">
          <Link to="/" className="hover:text-ink transition-colors flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Home</span>
          </Link>
          <span>/</span>
          <span className="text-ink">Documentation</span>
        </div>

        {/* Hero Header Strip */}
        <section className="space-y-4 border-b border-hairline pb-8">
          <div className="flex flex-wrap items-center gap-2">
            <div className="w-8 h-8 rounded-sm bg-ink text-fable-chartreuse flex items-center justify-center font-mono font-bold text-sm shadow-editorial">
              <BookOpen className="w-4 h-4" />
            </div>
            <Badge variant="neutral" size="sm" className="font-mono text-[10px]">
              Fable v1.0 User Manual
            </Badge>
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl text-ink font-normal tracking-tight">
             Documentation
          </h1>
          <p className="text-base text-ink-secondary max-w-3xl leading-relaxed">
            Welcome to Fable. Follow this comprehensive step-by-step guide to author autonomous AI agents, calibrate LLM system prompts, connect deterministic built-in tools, simulate reasoning runs, and analyze immutable execution traces.
          </p>
        </section>

        {/* Quick Nav Anchor Pills */}
        <div className="flex flex-wrap gap-2 border-b border-hairline pb-4">
          {[
            { id: 'quickstart', label: '1. Quickstart & Auth', icon: Lock },
            { id: 'create-agent', label: '2. Create & Configure Agent', icon: Settings },
            { id: 'tools', label: '3. Built-in Tools Registry', icon: Wrench },
            { id: 'playground', label: '4. Testing in Playground', icon: Play },
            { id: 'observability', label: '5. Execution Telemetry', icon: Layers },
            { id: 'security', label: '6. Security Architecture', icon: Shield },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  const el = document.getElementById(tab.id);
                  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-sm text-xs font-mono transition-all cursor-pointer ${
                  isActive
                    ? 'bg-ink text-white font-semibold shadow-editorial'
                    : 'bg-paper-muted text-ink-secondary hover:text-ink hover:bg-paper-light border border-hairline'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* STEP 1: Quickstart & Workspace Access */}
        <section id="quickstart" className="space-y-6 pt-4">
          <div className="flex items-center gap-3">
            <span className="w-7 h-7 rounded-sm bg-ink text-fable-chartreuse font-mono font-bold text-xs flex items-center justify-center">
              01
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl text-ink font-medium">
              Account Setup &amp; Workspace Access
            </h2>
          </div>
          <p className="text-sm text-ink-secondary leading-relaxed max-w-3xl">
            Get started by creating your developer account. All account data and agent configurations are strictly isolated to your workspace with end-to-end security protections.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-status-success" />
                  <span>Step 1: Create an Account</span>
                </CardTitle>
                <CardDescription>Register your developer workspace</CardDescription>
              </CardHeader>
              <CardContent className="text-xs text-ink-secondary space-y-3 leading-relaxed">
                <p>
                  Visit <Link to="/register" className="text-ink font-medium underline underline-offset-2">/register</Link> and enter your name, email address, and a secure password (minimum 8 characters).
                </p>
                <p>
                  Your account provides instant access to create custom AI agents, test tools in sandboxed environments, and run automated simulations.
                </p>
                <div className="pt-2">
                  <Link to="/register">
                    <Button variant="primary" size="sm">
                      Create Your Account
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-status-success" />
                  <span>Step 2: Sign In to Your Studio</span>
                </CardTitle>
                <CardDescription>Access your agent dashboard</CardDescription>
              </CardHeader>
              <CardContent className="text-xs text-ink-secondary space-y-3 leading-relaxed">
                <p>
                  Sign in anytime at <Link to="/login" className="text-ink font-medium underline underline-offset-2">/login</Link> to view and manage your agents, launch new simulations in the Playground, and inspect detailed execution logs.
                </p>
                <p>
                  Sessions remain securely authenticated so you can navigate seamlessly between the Workshop, Playground, and Telemetry views.
                </p>
                <div className="pt-2">
                  <Link to="/login">
                    <Button variant="outline" size="sm">
                      Go to Sign In Page
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* STEP 2: Creating and Configuring an Agent */}
        <section id="create-agent" className="space-y-6 pt-8 border-t border-hairline">
          <div className="flex items-center gap-3">
            <span className="w-7 h-7 rounded-sm bg-ink text-fable-chartreuse font-mono font-bold text-xs flex items-center justify-center">
              02
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl text-ink font-medium">
              Creating &amp; Configuring an Agent
            </h2>
          </div>
          <p className="text-sm text-ink-secondary leading-relaxed max-w-3xl">
            An agent in Fable is an autonomous reasoning unit with specialized system prompts, temperature calibration, token limits, and explicit tool permissions.
          </p>

          <div className="space-y-4">
            <div className="p-5 bg-white border border-hairline rounded-sm space-y-4">
              <h3 className="text-base font-serif font-medium text-ink flex items-center gap-2">
                <Settings className="w-4 h-4 text-ink" />
                <span>Configuration Attributes Breakdown</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                <div className="p-3 bg-paper-muted rounded border border-hairline">
                  <span className="font-mono text-ink font-bold block mb-1">Agent Name</span>
                  <span className="text-ink-secondary">Descriptive name identifying the role (e.g. "Math Tutor", "Data Analyst").</span>
                </div>
                <div className="p-3 bg-paper-muted rounded border border-hairline">
                  <span className="font-mono text-ink font-bold block mb-1">Inference Model</span>
                  <span className="text-ink-secondary">Llama 3.3 70B Versatile, Llama 3.1 8B Instant, or Mixtral 8x7B.</span>
                </div>
                <div className="p-3 bg-paper-muted rounded border border-hairline">
                  <span className="font-mono text-ink font-bold block mb-1">Temperature</span>
                  <span className="text-ink-secondary">0.0 (strictly deterministic) to 1.0 (creative reasoning).</span>
                </div>
                <div className="p-3 bg-paper-muted rounded border border-hairline">
                  <span className="font-mono text-ink font-bold block mb-1">Max Tokens</span>
                  <span className="text-ink-secondary">Upper limit per generation turn (typically 512 to 2048 tokens).</span>
                </div>
              </div>

              <div className="p-4 bg-fable-chartreuse/10 border border-fable-chartreuse/30 rounded flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-ink shrink-0 mt-0.5" />
                <div className="text-xs text-ink space-y-1">
                  <span className="font-bold font-mono">Pro Tip: AI Assistant Proposal Generator</span>
                  <p className="text-ink-secondary">
                    Don't want to write system instructions from scratch? In the <strong>Agent Workshop</strong>, click <strong>"Draft with AI"</strong>, describe your goal in plain English, and Fable will automatically generate an optimized system prompt, choose recommended tools, and configure temperature settings!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* STEP 3: Built-in Tools Registry */}
        <section id="tools" className="space-y-6 pt-8 border-t border-hairline">
          <div className="flex items-center gap-3">
            <span className="w-7 h-7 rounded-sm bg-ink text-fable-chartreuse font-mono font-bold text-xs flex items-center justify-center">
              03
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl text-ink font-medium">
              Deterministic Built-in Tools Registry
            </h2>
          </div>
          <p className="text-sm text-ink-secondary leading-relaxed max-w-3xl">
            Fable provides 3 zero-eval, deterministic built-in tools. Each tool is executed inside an isolated sandbox bounded by input size limits, recursion depth caps, and timeout guards.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Tool 1 */}
            <Card className="bg-white">
              <CardHeader className="bg-paper-muted/30 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded bg-ink text-fable-chartreuse flex items-center justify-center font-mono">
                    <Calculator className="w-4 h-4" />
                  </div>
                  <div>
                    <CardTitle className="text-sm font-mono">calculator</CardTitle>
                    <Badge variant="outline" size="sm" className="text-[9px]">Safe AST Parser</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="text-xs space-y-3 pt-3 text-ink-secondary">
                <p>
                  Evaluates mathematical expressions without JavaScript <code className="font-mono bg-paper-muted px-1">eval()</code>. Built on a recursive descent AST token parser.
                </p>
                <div className="space-y-1 font-mono text-[11px] bg-paper-muted p-2 rounded border border-hairline">
                  <div className="text-ink font-semibold">Supported Operators:</div>
                  <div>+, -, *, /, ^, %, sqrt(), round(), abs(), pi, e</div>
                </div>
                <ul className="text-[11px] list-disc list-inside space-y-0.5 text-ink-muted">
                  <li>Max expression length: 120 chars</li>
                  <li>Max recursion depth: 10</li>
                  <li>Zero division &amp; negative sqrt guards</li>
                </ul>
              </CardContent>
            </Card>

            {/* Tool 2 */}
            <Card className="bg-white">
              <CardHeader className="bg-paper-muted/30 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded bg-ink text-fable-chartreuse flex items-center justify-center font-mono">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <CardTitle className="text-sm font-mono">text_processor</CardTitle>
                    <Badge variant="outline" size="sm" className="text-[9px]">String Sandbox</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="text-xs space-y-3 pt-3 text-ink-secondary">
                <p>
                  Deterministic text analysis and format transforms. Safe execution without RegExp catastrophic backtracking vulnerabilities.
                </p>
                <div className="space-y-1 font-mono text-[11px] bg-paper-muted p-2 rounded border border-hairline">
                  <div className="text-ink font-semibold">Available Actions:</div>
                  <div>summarize, extract_keywords, word_count, uppercase, lowercase, titlecase, slugify</div>
                </div>
                <ul className="text-[11px] list-disc list-inside space-y-0.5 text-ink-muted">
                  <li>Max text length: 10,000 characters</li>
                  <li>Automated English stop-words filter</li>
                  <li>Calculates word, character &amp; sentence count</li>
                </ul>
              </CardContent>
            </Card>

            {/* Tool 3 */}
            <Card className="bg-white">
              <CardHeader className="bg-paper-muted/30 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded bg-ink text-fable-chartreuse flex items-center justify-center font-mono">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <CardTitle className="text-sm font-mono">datetime_utils</CardTitle>
                    <Badge variant="outline" size="sm" className="text-[9px]">Temporal Engine</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="text-xs space-y-3 pt-3 text-ink-secondary">
                <p>
                  Accurate, locale-aware date/time calculations, timezone conversions, duration arithmetic, and interval differences.
                </p>
                <div className="space-y-1 font-mono text-[11px] bg-paper-muted p-2 rounded border border-hairline">
                  <div className="text-ink font-semibold">Available Actions:</div>
                  <div>now, diff, add, format</div>
                </div>
                <ul className="text-[11px] list-disc list-inside space-y-0.5 text-ink-muted">
                  <li>IANA timezone validation</li>
                  <li>ISO-8601 strict timestamp validation</li>
                  <li>Year, month, day, hour, minute parsing</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* STEP 4: Testing in Playground */}
        <section id="playground" className="space-y-6 pt-8 border-t border-hairline">
          <div className="flex items-center gap-3">
            <span className="w-7 h-7 rounded-sm bg-ink text-fable-chartreuse font-mono font-bold text-xs flex items-center justify-center">
              04
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl text-ink font-medium">
              Simulating in the Agent Playground
            </h2>
          </div>
          <p className="text-sm text-ink-secondary leading-relaxed max-w-3xl">
            The Playground allows interactive execution of your configured agent. When you send a message, Fable orchestrates a structured agent loop:
          </p>

          <div className="p-6 bg-white border border-hairline rounded-sm space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 bg-paper-muted rounded border border-hairline space-y-2">
                <div className="font-mono font-bold text-ink flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-ink text-white text-[10px] flex items-center justify-center">1</span>
                  <span>Inference &amp; Tool Request</span>
                </div>
                <p className="text-ink-secondary">
                  The LLM receives the system prompt, conversation history, and tool definitions. If reasoning requires calculation or text processing, it emits a structured tool call.
                </p>
              </div>

              <div className="p-4 bg-paper-muted rounded border border-hairline space-y-2">
                <div className="font-mono font-bold text-ink flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-ink text-white text-[10px] flex items-center justify-center">2</span>
                  <span>Tool Dispatch &amp; Sandbox</span>
                </div>
                <p className="text-ink-secondary">
                  Fable verifies tool permissions, executes the tool in the sandboxed evaluator, validates output formats, and returns the deterministic result to the agent.
                </p>
              </div>

              <div className="p-4 bg-paper-muted rounded border border-hairline space-y-2">
                <div className="font-mono font-bold text-ink flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-ink text-white text-[10px] flex items-center justify-center">3</span>
                  <span>Synthesis &amp; Response</span>
                </div>
                <p className="text-ink-secondary">
                  The agent processes the tool result and produces the final verified answer. A hard cap of 3 turns prevents infinite recursive execution.
                </p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <Link to="/playground">
                <Button variant="primary" size="sm" icon={ArrowRight}>
                  Open Agent Playground
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* STEP 5: Observability & Immutable Execution Snapshots */}
        <section id="observability" className="space-y-6 pt-8 border-t border-hairline">
          <div className="flex items-center gap-3">
            <span className="w-7 h-7 rounded-sm bg-ink text-fable-chartreuse font-mono font-bold text-xs flex items-center justify-center">
              05
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl text-ink font-medium">
              Observability &amp; Immutable Run Snapshots
            </h2>
          </div>
          <p className="text-sm text-ink-secondary leading-relaxed max-w-3xl">
            Every execution produces an immutable telemetry record stored in the database. Even if the agent configuration is subsequently edited or deleted, the execution history preserves the exact state at run time.
          </p>

          <div className="p-6 bg-white border border-hairline rounded-sm space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              <div className="space-y-2">
                <h4 className="font-mono font-bold text-ink uppercase tracking-wider">Snapshot Immutability Guarantee</h4>
                <p className="text-ink-secondary leading-relaxed">
                  Execution records capture frozen copies of the agent configuration (name, system prompt, temperature, max tokens, tool whitelist). Modifying or deleting the parent agent does not alter historical execution traces.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-mono font-bold text-ink uppercase tracking-wider">Tool Trace Inspection</h4>
                <p className="text-ink-secondary leading-relaxed">
                  Every tool invocation is tracked with:
                </p>
                <ul className="list-disc list-inside text-ink-muted space-y-1 font-mono text-[11px]">
                  <li>Tool name &amp; execution timestamp</li>
                  <li>Raw input arguments (JSON)</li>
                  <li>Parsed output result</li>
                  <li>Execution latency in milliseconds</li>
                  <li>Error contract &amp; stack isolation if failed</li>
                </ul>
              </div>
            </div>

            <div className="pt-2">
              <Link to="/executions">
                <Button variant="outline" size="sm" icon={ExternalLink}>
                  View Execution History
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* STEP 6: Security Architecture */}
        <section id="security" className="space-y-6 pt-8 border-t border-hairline">
          <div className="flex items-center gap-3">
            <span className="w-7 h-7 rounded-sm bg-ink text-fable-chartreuse font-mono font-bold text-xs flex items-center justify-center">
              06
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl text-ink font-medium">
              Security Architecture &amp; Safeguards
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="text-sm font-mono flex items-center gap-2">
                  <Shield className="w-4 h-4 text-fable-chartreuse" />
                  <span>Zero Arbitrary Code</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-ink-secondary leading-relaxed">
                No <code className="font-mono bg-paper-muted px-1">eval()</code> or <code className="font-mono bg-paper-muted px-1">new Function()</code> anywhere in the execution engine. Math, strings, and dates are evaluated through isolated AST parsers.
              </CardContent>
            </Card>

            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="text-sm font-mono flex items-center gap-2">
                  <Lock className="w-4 h-4 text-fable-chartreuse" />
                  <span>Strict Data Isolation</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-ink-secondary leading-relaxed">
                Every agent, tool trace, and execution log is strictly scoped to your private authenticated tenant. Users can never access, execute, or view another developer's workspace.
              </CardContent>
            </Card>

            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="text-sm font-mono flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-fable-chartreuse" />
                  <span>3-Turn Loop Guard</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-ink-secondary leading-relaxed">
                Execution loops are hard-capped at 3 iterative turns. Even if an LLM gets confused or repeats tool calls, execution terminates gracefully without runaway provider charges.
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Footer Navigation Bar */}
        <div className="pt-8 border-t border-hairline flex flex-wrap items-center justify-between gap-4">
          <Link to="/">
            <Button variant="outline" size="sm" icon={ArrowLeft}>
              Back to Home
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/llms">
              <Button variant="outline" size="sm">
                LLM Inference Spec
              </Button>
            </Link>
            <Link to="/agents">
              <Button variant="primary" size="sm" icon={ArrowRight}>
                Open Agent Workshop
              </Button>
            </Link>
          </div>
        </div>
      </PageContainer>

      <LandingFooter />
    </div>
  );
};

export default DocsPage;
