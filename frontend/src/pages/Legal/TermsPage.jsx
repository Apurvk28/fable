import React from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../../components/layout/Navbar';
import { PageContainer } from '../../components/layout/PageContainer';
import { LandingFooter } from '../../components/landing/LandingFooter';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { ShieldCheck, ArrowLeft, Scale } from 'lucide-react';

export const TermsPage = () => {
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
          <span className="text-ink">Terms &amp; Conditions</span>
        </div>

        {/* Header Section */}
        <header className="space-y-3 border-b border-hairline pb-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-sm bg-ink text-fable-chartreuse flex items-center justify-center font-mono font-bold text-sm shadow-editorial">
              <Scale className="w-4 h-4" />
            </div>
            <span className="text-xs font-mono uppercase tracking-widest text-ink-secondary">
              Legal Documentation
            </span>
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl text-ink font-normal tracking-tight">
            Terms &amp; Conditions
          </h1>
          <p className="text-sm font-mono text-ink-muted">
            Last Updated: October 2026 &middot; Version 1.0
          </p>
        </header>

        {/* Content Body */}
        <div className="space-y-8 text-sm text-ink-secondary leading-relaxed">
          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="text-lg">1. Acceptance of Terms</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p>
                By creating an account, accessing, or utilizing the Fable platform (&ldquo;Fable&rdquo;, &ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;), you agree to be bound by these Terms and Conditions (&ldquo;Terms&rdquo;). If you do not agree to these Terms, you may not register, access, or operate autonomous agents on this platform.
              </p>
              <p>
                These Terms apply to all visitors, registered builders, developers, and organizations who access or interact with Fable services, APIs, and associated web interfaces.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="text-lg">2. Platform Description &amp; Agent Execution</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p>
                Fable provides a developer platform for creating, configuring, testing, and running autonomous AI agents. The platform incorporates:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-xs text-ink-secondary">
                <li>Deterministic tool-calling sandboxes (Safe Calculator, Text Processor, Date/Time Utilities).</li>
                <li>Provider-independent model orchestration interfacing with third-party LLM inference providers.</li>
                <li>Immutable execution telemetry and observable run histories.</li>
                <li>Isolated workspace environments guarded by cryptographic sessions.</li>
              </ul>
              <p>
                You acknowledge that AI agent outputs are generated through probabilistic model reasoning. While Fable enforces strict runtime safeguards, loop limits, and input bounds, you remain responsible for validating agent configurations before relying on automated decisions.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="text-lg">3. User Accounts &amp; Security Responsibilities</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p>
                When creating an account on Fable, you agree to provide accurate, current, and complete information. You are solely responsible for maintaining the confidentiality of your credentials and for all activities that occur under your account.
              </p>
              <p>
                Fable employs cryptographically signed, HttpOnly session cookies and HMAC CSRF protection. You must notify us immediately upon discovering any unauthorized access or security breach involving your account.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="text-lg">4. Acceptable Use Policy &amp; Guardrails</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p>You agree not to use Fable to:</p>
              <ul className="list-disc pl-5 space-y-1.5 text-xs text-ink-secondary">
                <li>Attempt arbitrary code execution, prototype pollution, or bypass sandbox AST evaluation rules.</li>
                <li>Generate abusive, harmful, fraudulent, or legally prohibited content through prompt injection.</li>
                <li>Attempt cross-user data scraping, tenant boundary violations, or unauthorized access to execution records.</li>
                <li>Interfere with or disrupt the integrity or performance of Fable servers, rate limiters, or networks.</li>
                <li>Exceed documented rate limits or deliberately cause denial-of-service on upstream inference providers.</li>
              </ul>
              <p>
                We reserve the right to suspend or terminate accounts that violate this Acceptable Use Policy without prior notice.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="text-lg">5. Intellectual Property &amp; User Ownership</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p>
                <strong>Your Content:</strong> You retain full ownership and intellectual property rights to all agent instructions, prompts, system designs, and outputs generated through your account. Fable claims no ownership over your agent logic or task telemetry.
              </p>
              <p>
                <strong>Platform IP:</strong> The Fable interface, Workshop Editorial design system, AST sandboxes, algorithms, and core orchestration code remain the intellectual property of Fable and its licensors.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="text-lg">6. Third-Party Inference Providers</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p>
                Fable interfaces with third-party inference hardware providers (such as Groq LPU). Availability of individual models is subject to third-party provider operational status and catalog maintenance. Fable is not liable for temporary upstream provider outages, latency fluctuations, or third-party rate limits.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="text-lg">7. Disclaimer of Warranties &amp; Limitation of Liability</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p>
                THE PLATFORM IS PROVIDED ON AN &ldquo;AS IS&rdquo; AND &ldquo;AS AVAILABLE&rdquo; BASIS WITHOUT WARRANTIES OF ANY KIND, WHETHER EXPRESS OR IMPLIED. TO THE MAXIMUM EXTENT PERMITTED BY LAW, FABLE DISCLAIMS ALL WARRANTIES, INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
              </p>
              <p>
                IN NO EVENT SHALL FABLE BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING FROM YOUR USE OF OR INABILITY TO USE THE PLATFORM.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="text-lg">8. Termination &amp; Governing Law</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p>
                You may terminate your account at any time by deleting your configured agents and signing out. Upon termination, all your stored agent configurations and execution history will be purged in accordance with our Privacy Policy.
              </p>
              <p>
                These Terms shall be governed by and construed in accordance with applicable governing laws, without regard to conflict of law provisions.
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
            <Link to="/cookies">
              <Button variant="ghost" size="sm">
                Cookie Policy
              </Button>
            </Link>
            <Link to="/privacy">
              <Button variant="primary" size="sm">
                Privacy &amp; Security
              </Button>
            </Link>
          </div>
        </div>
      </PageContainer>

      <LandingFooter />
    </div>
  );
};
