import React from "react";
import { Badge7 } from "@/components/ui/cta69-utils/badge7";
import { Button12 } from "@/components/ui/cta69-utils/button12";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

export const cta69Demo = {
  heading: "Build What's Next.",
  button: {
    label: "Get Started",
    href: "/login",
  },
  labels: {
    marqueePhrase: "Imagine It. Automate It.",
    note: "Turn your ideas into intelligent workflows. Build, configure, and simulate AI-powered automation — all in one place.",
    footnote: "From your first idea to your first automated workflow.",
  },
};

const REPEATS = 8;

export function Cta69({
  badge,
  heading,
  button,
  labels = {},
  className,
}) {
  const marqueePhrase = labels.marqueePhrase;
  const marqueeLine = marqueePhrase
    ? `${marqueePhrase} · `.repeat(REPEATS)
    : "";

  return (
    <section
      className={cn(
        "relative overflow-hidden bg-paper py-16 md:py-24 w-full select-none",
        className
      )}
    >
      <style>{`
        @keyframes cta69-marquee {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-50%);
          }
        }
      `}</style>

      {/* Giant scrolling backdrop */}
      {marqueePhrase && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 flex items-center overflow-hidden select-none"
        >
          <div className="flex w-max shrink-0 animate-[cta69-marquee_40s_linear_infinite] whitespace-nowrap text-ink/[0.04]">
            {[0, 1].map((copy) => (
              <span
                key={copy}
                className="text-[22vw] font-bold leading-none tracking-tighter md:text-[16vw] font-serif"
              >
                {marqueeLine}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Centered statement */}
      <div className="relative mx-auto flex max-w-3xl flex-col items-center px-4 text-center md:px-6 z-10">
        {badge && <Badge7 label={badge.label} />}

        {heading && (
          <h2 className="mt-8 text-balance text-4xl font-serif font-normal leading-[1.05] tracking-tight text-ink md:text-6xl lg:text-7xl">
            {heading}
          </h2>
        )}

        {labels.note && (
          <p className="mt-6 max-w-xl text-balance text-lg text-ink-secondary font-sans leading-relaxed md:text-xl">
            {labels.note}
          </p>
        )}

        {button && (
          <div className="mt-12">
            <Button12 asChild label={button.label}>
              {button.href.startsWith("http") ? (
                <a href={button.href} target="_blank" rel="noopener noreferrer" />
              ) : (
                <Link to={button.href} />
              )}
            </Button12>
          </div>
        )}

        {labels.footnote && (
          <p className="mt-8 text-sm font-mono text-ink-muted">
            {labels.footnote}
          </p>
        )}
      </div>
    </section>
  );
}

export default Cta69;
