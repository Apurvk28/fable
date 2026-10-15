import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Navbar } from '../../components/layout/Navbar';
import { HeroSection } from '../../components/landing/HeroSection';
import { TransformationStory } from '../../components/landing/TransformationStory';
import { AgentBlueprint3D } from '../../components/landing/AgentBlueprint3D';
import { ToolsSection } from '../../components/landing/ToolsSection';
import { InteractiveSandboxDemo } from '../../components/landing/InteractiveSandboxDemo';
import { ExecutionTraceShowcase } from '../../components/landing/ExecutionTraceShowcase';
import ScrollAnimation from '../../components/ui/you-can-scroll';
import { LandingFooter } from '../../components/landing/LandingFooter';

export const LandingPage = () => {
  const { user } = useAuth();
  const isAuthenticated = Boolean(user);

  return (
    <div className="min-h-screen bg-paper flex flex-col font-sans selection:bg-fable-chartreuse selection:text-ink">
      {/* Top Navigation */}
      <Navbar />

      {/* Main Narrative Stream */}
      <main className="flex-1">
        {/* Section A: Hero */}
        <HeroSection isAuthenticated={isAuthenticated} />

        {/* Section B: Idea-to-Agent Progression */}
        <TransformationStory />

        {/* Section C: Interactive 3D Agent Blueprint */}
        <AgentBlueprint3D />

        {/* Section D: Built-in Tools & Safeguards */}
        <ToolsSection />

        {/* Section E: Interactive Sandbox Simulation */}
        <InteractiveSandboxDemo />

        {/* Section F: Observability & Execution Trace */}
        <ExecutionTraceShowcase />

        {/* Section G: Kinetic Scroll Canvas (Pre-login only) */}
        {!isAuthenticated && <ScrollAnimation />}
      </main>

      {/* Section G: Footer & Final Invitation */}
      <LandingFooter isAuthenticated={isAuthenticated} />
    </div>
  );
};
