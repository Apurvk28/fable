import React from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../../components/layout/Navbar';
import { PageContainer } from '../../components/layout/PageContainer';
import { LandingFooter } from '../../components/landing/LandingFooter';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Sparkles, ArrowLeft, ArrowRight, Zap, CheckCircle2, ShieldCheck, Network } from 'lucide-react';

export const LlmsPage = () => {
  return (
    <div className="min-h-screen bg-paper flex flex-col font-sans selection:bg-fable-chartreuse selection:text-ink">
      <Navbar />

      <PageContainer className="flex-1 py-12 space-y-12 max-w-5xl">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-mono text-ink-muted">
          <Link to="/" className="hover:text-ink transition-colors flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Home</span>
          </Link>
          <span>/</span>
          <span className="text-ink">Supported LLMs</span>
        </div>

        {/* Hero Header Strip */}
        <section className="space-y-4 border-b border-hairline pb-8">
          <div className="flex flex-wrap items-center gap-2">
            <div className="w-8 h-8 rounded-sm bg-ink text-fable-chartreuse flex items-center justify-center font-mono font-bold text-sm shadow-editorial">
              <Sparkles className="w-4 h-4" />
            </div>
            <Badge variant="accent" size="sm" className="font-mono text-[10px]">
              Coming Soon
            </Badge>
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl text-ink font-normal tracking-tight">
            Supported LLMs &amp; Inference Matrix
          </h1>
          <p className="text-base text-ink-secondary max-w-2xl leading-relaxed">
            Fable interfaces with low-latency LLM inference engines with real-time capability checks, automatic schema generation for function calling, and verified fallback routing.
          </p>
        </section>

        {/* Coming Soon Notice Card */}
        <div className="p-8 bg-paper-muted border border-hairline rounded-sm space-y-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-status-warning animate-pulse" />
            <span className="text-xs font-mono uppercase tracking-wider text-ink font-semibold">
              Expanded Provider Hub in Progress
            </span>
          </div>
          <p className="text-sm text-ink-secondary leading-relaxed">
            The multi-provider model matrix is undergoing testing and benchmarking. Comprehensive benchmarks on tool accuracy, time-to-first-token (TTFT), parameter adherence, and custom self-hosted endpoint support will be published here.
          </p>
        </div>

        {/* Current & Upcoming Model Catalog */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-2xl text-ink font-normal">
              Model Catalog &amp; Hardware Support
            </h2>
            <span className="text-xs font-mono text-ink-muted">Inference Provider: Groq LPU</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-white">
              <CardHeader>
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-sm bg-fable-chartreuse/25 border border-ink text-ink flex items-center justify-center font-mono">
                      <Zap className="w-4 h-4" />
                    </div>
                    <div>
                      <CardTitle className="text-base">Qwen 3.8 27B</CardTitle>
                      <CardDescription>qwen/qwen3.8-27b &middot; Active Provider Model</CardDescription>
                    </div>
                  </div>
                  <Badge variant="success" size="sm">Available</Badge>
                </div>
              </CardHeader>
              <CardContent className="text-xs text-ink-secondary leading-relaxed space-y-2">
                <p>High-efficiency reasoning model with robust support for JSON-schema tool calling and structured configuration proposal synthesis.</p>
                <div className="pt-2 border-t border-hairline/60 flex items-center justify-between text-[11px] font-mono text-ink-muted">
                  <span>Context: 32k</span>
                  <span>Tool Calling: Verified</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white">
              <CardHeader>
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-sm bg-fable-chartreuse/25 border border-ink text-ink flex items-center justify-center font-mono">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div>
                      <CardTitle className="text-base">GPT OSS 120B &amp; 20B</CardTitle>
                      <CardDescription>openai/gpt-oss-120b &middot; Open Weight Scale</CardDescription>
                    </div>
                  </div>
                  <Badge variant="success" size="sm">Available</Badge>
                </div>
              </CardHeader>
              <CardContent className="text-xs text-ink-secondary leading-relaxed space-y-2">
                <p>Large parameter foundational weights optimized for multi-turn task planning, code parsing, and deterministic tool parameter generation.</p>
                <div className="pt-2 border-t border-hairline/60 flex items-center justify-between text-[11px] font-mono text-ink-muted">
                  <span>Context: 128k</span>
                  <span>Tool Calling: Verified</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white">
              <CardHeader>
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-sm bg-paper-muted border border-hairline text-ink-muted flex items-center justify-center font-mono">
                      <Network className="w-4 h-4" />
                    </div>
                    <div>
                      <CardTitle className="text-base">Llama 3.3 70B &amp; 8B</CardTitle>
                      <CardDescription>Meta Llama 3 Family on Groq Hardware</CardDescription>
                    </div>
                  </div>
                  <Badge variant="outline" size="sm">Dynamic</Badge>
                </div>
              </CardHeader>
              <CardContent className="text-xs text-ink-secondary leading-relaxed space-y-2">
                <p>Dynamically validated against live provider catalogs to prevent runtime 400 errors during temporary provider maintenance windows.</p>
                <div className="pt-2 border-t border-hairline/60 flex items-center justify-between text-[11px] font-mono text-ink-muted">
                  <span>Context: 128k</span>
                  <span>Catalog Fallback: Active</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white">
              <CardHeader>
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-sm bg-paper-muted border border-hairline text-ink-muted flex items-center justify-center font-mono">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <CardTitle className="text-base">Custom Endpoint Routing</CardTitle>
                      <CardDescription>Self-hosted vLLM, Ollama, &amp; OpenAI Compatible</CardDescription>
                    </div>
                  </div>
                  <Badge variant="accent" size="sm">Roadmap</Badge>
                </div>
              </CardHeader>
              <CardContent className="text-xs text-ink-secondary leading-relaxed space-y-2">
                <p>Direct enterprise connectivity allowing teams to route agent execution requests to private VPC endpoints and proprietary model clusters.</p>
                <div className="pt-2 border-t border-hairline/60 flex items-center justify-between text-[11px] font-mono text-ink-muted">
                  <span>Security: Zero Data Egress</span>
                  <span>Timeline: Upcoming</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Action Navigation Strip */}
        <div className="pt-8 border-t border-hairline flex flex-wrap items-center justify-between gap-4">
          <Link to="/">
            <Button variant="outline" size="sm" icon={ArrowLeft}>
              Back to Home
            </Button>
          </Link>
          <Link to="/playground">
            <Button variant="primary" size="sm" icon={ArrowRight}>
              Test Models in Playground
            </Button>
          </Link>
        </div>
      </PageContainer>

      <LandingFooter />
    </div>
  );
};
