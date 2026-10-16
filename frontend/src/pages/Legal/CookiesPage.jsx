import React from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../../components/layout/Navbar';
import { PageContainer } from '../../components/layout/PageContainer';
import { LandingFooter } from '../../components/landing/LandingFooter';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Cookie, ArrowLeft, ShieldCheck, CheckCircle2 } from 'lucide-react';

export const CookiesPage = () => {
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
          <span className="text-ink">Cookie Policy</span>
        </div>

        {/* Header Section */}
        <header className="space-y-3 border-b border-hairline pb-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-sm bg-ink text-fable-chartreuse flex items-center justify-center font-mono font-bold text-sm shadow-editorial">
              <Cookie className="w-4 h-4" />
            </div>
            <span className="text-xs font-mono uppercase tracking-widest text-ink-secondary">
              Privacy &amp; Security Compliance
            </span>
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl text-ink font-normal tracking-tight">
            Cookie Policy
          </h1>
          <p className="text-sm font-mono text-ink-muted">
            Last Updated: October 2026 &middot; Version 1.0
          </p>
        </header>

        {/* Overview Banner */}
        <div className="p-6 bg-paper-muted border border-hairline rounded-sm space-y-2">
          <div className="flex items-center gap-2 text-status-success font-semibold text-xs font-mono uppercase">
            <ShieldCheck className="w-4 h-4" />
            <span>Privacy-First Architecture: Zero Tracking Cookies</span>
          </div>
          <p className="text-sm text-ink-secondary leading-relaxed">
            Fable uses only <strong>strictly essential</strong> cookies necessary to authenticate your developer session and protect against Cross-Site Request Forgery (CSRF). We do not use advertising, marketing, profiling, or third-party behavioral analytics cookies.
          </p>
        </div>

        {/* Detailed Sections */}
        <div className="space-y-8 text-sm text-ink-secondary leading-relaxed">
          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="text-lg">1. What Are Cookies?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p>
                Cookies are small text files placed on your device by websites you visit. They are widely used to make web applications function efficiently and to provide secure authentication tokens to the backend server without exposing credentials to untrusted browser JavaScript.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="text-lg">2. Strictly Essential Cookies Used by Fable</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                The following table documents every cookie set by the Fable application:
              </p>

              <div className="overflow-x-auto border border-hairline rounded-sm">
                <table className="w-full text-left font-mono text-xs divide-y divide-hairline">
                  <thead className="bg-paper-muted text-ink font-semibold">
                    <tr>
                      <th className="p-3">Cookie Name</th>
                      <th className="p-3">Purpose &amp; Security Attributes</th>
                      <th className="p-3">Type</th>
                      <th className="p-3">Duration</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-hairline/60 bg-white text-ink-secondary">
                    <tr>
                      <td className="p-3 font-bold text-ink">token</td>
                      <td className="p-3">
                        Cryptographically signed JWT session token. Guarded by <code className="px-1 py-0.5 bg-paper-muted border border-hairline rounded text-[10px]">HttpOnly</code> (inaccessible to JavaScript, immune to XSS theft) and <code className="px-1 py-0.5 bg-paper-muted border border-hairline rounded text-[10px]">SameSite=Lax</code>.
                      </td>
                      <td className="p-3">Strictly Essential</td>
                      <td className="p-3">7 Days (Cleared on Logout)</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-ink">XSRF-TOKEN</td>
                      <td className="p-3">
                        HMAC-signed anti-tamper token used to validate all mutating HTTP requests (POST, PATCH, DELETE) against Cross-Site Request Forgery attacks.
                      </td>
                      <td className="p-3">Strictly Essential</td>
                      <td className="p-3">Session / 24 Hours</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="text-lg">3. Zero localStorage Credential Storage</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p>
                Unlike conventional web apps that persist authentication tokens in browser <code className="font-mono text-xs px-1 bg-paper-muted border border-hairline rounded">localStorage</code> (vulnerable to malicious third-party dependencies and XSS exploits), Fable stores <strong>zero session tokens</strong> in client-side storage.
              </p>
              <div className="flex items-center gap-2 text-xs font-mono text-status-success">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Verified: localStorage and sessionStorage contain 0 authentication secrets.</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="text-lg">4. How to Control or Delete Cookies</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p>
                You can control and delete cookies through your browser settings at any time. However, please note that because our cookies are strictly essential for security and session state, disabling cookies will prevent you from signing in and configuring agents in the workshop.
              </p>
              <p>
                When you click &ldquo;Sign Out&rdquo; in the Fable navigation bar, your session cookie is immediately invalidated and cleared from your browser by the server.
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
