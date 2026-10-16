import React from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../../components/layout/Navbar';
import { PageContainer } from '../../components/layout/PageContainer';
import { LandingFooter } from '../../components/landing/LandingFooter';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Github, ArrowLeft, ExternalLink, Code2, GitFork, Star, Terminal } from 'lucide-react';

export const GithubPage = () => {
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
          <span className="text-ink">GitHub &amp; Open Source</span>
        </div>

        {/* Header Section */}
        <header className="space-y-3 border-b border-hairline pb-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-sm bg-ink text-fable-chartreuse flex items-center justify-center font-mono font-bold text-sm shadow-editorial">
              <Github className="w-4 h-4" />
            </div>
            <span className="text-xs font-mono uppercase tracking-widest text-ink-secondary">
              Open Source &amp; Codebase
            </span>
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl text-ink font-normal tracking-tight">
            Fable on GitHub
          </h1>
          <p className="text-base text-ink-secondary max-w-2xl leading-relaxed">
            Fable is an open, modular platform built with the MERN stack and low-latency Groq LLM inference. Inspect our architecture, run test suites locally, and contribute tools.
          </p>
        </header>

        {/* Repository Quick Action Card */}
        <Card className="bg-white">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-sm bg-ink text-white flex items-center justify-center font-bold">
                  <Terminal className="w-5 h-5 text-fable-chartreuse" />
                </div>
                <div>
                  <CardTitle className="text-base">fable &middot; MERN GenAI Agent Platform</CardTitle>
                  <div className="text-xs font-mono text-ink-muted">MIT License &middot; JavaScript / React / Node.js</div>
                </div>
              </div>
              <a
                href="https://github.com/Apurvk28/fable"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block"
              >
                <Button variant="primary" size="sm" icon={ExternalLink}>
                  View Repository
                </Button>
              </a>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-xs text-ink-secondary leading-relaxed">
              Explore the clean modular monorepo structure with isolated backend services, Abstract Syntax Tree arithmetic parser, automated unit and integration suites, and the Workshop Editorial frontend design system.
            </p>
            <div className="p-3 bg-paper-muted rounded-sm border border-hairline font-mono text-xs text-ink flex items-center justify-between">
              <code>git clone https://github.com/Apurvk28/fable.git</code>
              <span className="text-[10px] text-ink-muted uppercase">Clone URL</span>
            </div>
          </CardContent>
        </Card>

        {/* Highlights Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="bg-white">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-ink-secondary" />
                <CardTitle className="text-sm">Modular Monolith</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="text-xs text-ink-secondary leading-relaxed">
              Clean separation between Express routing, provider-independent AI service, AST tool sandbox, and React Vite frontend.
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <GitFork className="w-4 h-4 text-ink-secondary" />
                <CardTitle className="text-sm">Extensible Tools</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="text-xs text-ink-secondary leading-relaxed">
              Add custom deterministic sandboxes using standard AST parsers with input bounds, permission checks, and timeout recovery.
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-ink-secondary" />
                <CardTitle className="text-sm">Deterministic Tests</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="text-xs text-ink-secondary leading-relaxed">
              Default <code className="font-mono text-[10px] px-1 bg-paper-muted border border-hairline rounded">npm test</code> runs 100% offline without external network or provider keys.
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
            <Link to="/docs">
              <Button variant="ghost" size="sm">
                Documentation
              </Button>
            </Link>
            <Link to="/agents">
              <Button variant="primary" size="sm">
                Open Workshop
              </Button>
            </Link>
          </div>
        </div>
      </PageContainer>

      <LandingFooter />
    </div>
  );
};
