import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

export default function ScrollAnimation() {
  const containerRef = useRef(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const config = {
      theme: "light", // Theme matched to Fable paper background
      animate: true,
      snap: false,
      start: gsap.utils.random(0, 100, 1),
      end: gsap.utils.random(900, 1000, 1),
      scroll: true,
      debug: false,
    };

    let items, scrollerScrub, dimmerScrub, chromaEntry, chromaExit;

    const el = containerRef.current || document.documentElement;

    const update = () => {
      if (el) {
        el.dataset.theme = config.theme;
        el.dataset.syncScrollbar = config.scroll;
        el.dataset.animate = config.animate;
        el.dataset.snap = config.snap;
        el.dataset.debug = config.debug;
        el.style.setProperty("--start", config.start);
        el.style.setProperty("--hue", config.start);
        el.style.setProperty("--end", config.end);
      }

      if (!config.animate) {
        chromaEntry?.scrollTrigger?.disable(true, false);
        chromaExit?.scrollTrigger?.disable(true, false);
        dimmerScrub?.disable(true, false);
        scrollerScrub?.disable(true, false);
        if (items) gsap.set(items, { opacity: 1 });
        if (el) gsap.set(el, { "--chroma": 0 });
      } else {
        if (items) gsap.set(items, { opacity: (i) => (i !== 0 ? 0.2 : 1) });
        dimmerScrub?.enable(true, true);
        scrollerScrub?.enable(true, true);
        chromaEntry?.scrollTrigger?.enable(true, true);
        chromaExit?.scrollTrigger?.enable(true, true);
      }
    };

    let mainTrigger;

    // Target specifically the items within this component container
    if (containerRef.current) {
      items = gsap.utils.toArray(containerRef.current.querySelectorAll("ul li"));
      const ul = containerRef.current.querySelector("ul");

      if (items.length > 0 && ul) {
        let lastActiveIndex = -1;

        const updateActiveWord = () => {
          const viewportCenter = window.innerHeight / 2;
          let closestIndex = 0;
          let minDistance = Infinity;

          items.forEach((item, index) => {
            const rect = item.getBoundingClientRect();
            const itemCenter = rect.top + rect.height / 2;
            const distance = Math.abs(itemCenter - viewportCenter);
            if (distance < minDistance) {
              minDistance = distance;
              closestIndex = index;
            }
          });

          // Only re-animate when the active word changes to guarantee strictly 1 word is black
          if (closestIndex !== lastActiveIndex) {
            lastActiveIndex = closestIndex;
            items.forEach((item, index) => {
              if (index === closestIndex) {
                // Strictly the current word is solid black
                gsap.to(item, {
                  opacity: 1,
                  color: "#121316",
                  scale: 1.05,
                  duration: 0.15,
                  overwrite: "auto",
                });
              } else {
                // All other words are dimmed gray
                gsap.to(item, {
                  opacity: 0.2,
                  color: "#9A9993",
                  scale: 1,
                  duration: 0.15,
                  overwrite: "auto",
                });
              }
            });
          }
        };

        // Initialize: item 0 is active, all others dimmed
        items.forEach((item, index) => {
          if (index === 0) {
            gsap.set(item, { opacity: 1, color: "#121316", scale: 1.05 });
          } else {
            gsap.set(item, { opacity: 0.2, color: "#9A9993", scale: 1 });
          }
        });

        mainTrigger = ScrollTrigger.create({
          trigger: ul,
          start: "top bottom",
          end: "bottom top",
          onUpdate: updateActiveWord,
          onRefresh: updateActiveWord,
        });

        // Run once on mount to establish initial state
        updateActiveWord();
      }
    }

    update();

    return () => {
      // Clean up ScrollTriggers on unmount
      mainTrigger?.kill();
      dimmerScrub?.kill();
      scrollerScrub?.kill();
      chromaEntry?.scrollTrigger?.kill();
      chromaExit?.scrollTrigger?.kill();
    };
  }, []);

  const words = [
    "imagine.", "create.", "automate.", "configure.", "test.", "execute.", "define.", "instruct.", "connect.", "orchestrate.", "inspect."
  ];

  return (
    <div
      ref={containerRef}
      className="relative bg-paper text-ink border-t border-b border-hairline py-24 selection:bg-fable-chartreuse selection:text-ink font-sans transition-colors duration-300"
      style={{
        backgroundColor: "#F9F8F5",
        color: "#121316",
      }}
    >
      {/* Intro Header */}
      <header className="min-h-[50vh] flex flex-col items-center justify-center text-center px-4 space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-sm bg-white border border-hairline font-mono text-[10px] uppercase tracking-wider text-ink-secondary shadow-editorial">
        </div>
        <h1
          className="font-serif text-5xl sm:text-7xl lg:text-8xl font-normal text-ink tracking-tight leading-[1.05]"
        >
          Imagine what's possible.
        </h1>
        <p className="font-mono text-xs text-ink-muted max-w-sm">
          Scroll to explore the possibilities
        </p>
      </header>

      {/* Main Kinetic Content Stream */}
      <main className="max-w-4xl mx-auto px-4 py-16">
        <section className="flex flex-col md:flex-row items-center md:items-start justify-center gap-4 md:gap-8 my-12">
          {/* Sticky Prefix */}
          <div className="md:sticky md:top-1/2 md:-translate-y-1/2 select-none z-10">
            <h2 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-normal text-ink tracking-tight whitespace-nowrap">
              <span aria-hidden="true">you can&nbsp;</span>
              <span className="sr-only">you can ship things.</span>
            </h2>
          </div>

          {/* Scrubbing Word List */}
          <ul
            aria-hidden="true"
            className="flex flex-col space-y-12 sm:space-y-16 py-12 items-center md:items-start list-none m-0 p-0"
            style={{ "--count": words.length }}
          >
            {words.map((text, i) => (
              <li
                key={i}
                style={{ "--i": i }}
                className="font-serif text-4xl sm:text-6xl lg:text-7xl font-normal tracking-tight cursor-default select-none transition-all duration-200"
              >
                <span className="relative">
                  <span className="hover:underline decoration-fable-chartreuse decoration-4 underline-offset-8">
                    {text}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </section>

        {/* Fin Outro */}
        <section className="min-h-[40vh] flex flex-col items-center justify-center text-center space-y-3 pt-12">
          <h2 className="font-serif text-5xl sm:text-7xl font-normal text-ink tracking-tight">
            Fable.
          </h2>
          <div className="w-12 h-0.5 bg-ink/20 my-4" />
          <p className="text-xs font-mono text-ink-secondary">
            Imagine It. Automate It.
          </p>
        </section>
      </main>

      {/* Author Credit Badge */}
      <footer className="text-center font-mono text-[11px] text-ink-muted pt-8 pb-4">
        <span className="inline-block px-3 py-1 bg-white border border-hairline rounded-sm shadow-editorial">
          Ready to build? Configure your first agent in the workshop.
        </span>
      </footer>
    </div>
  );
}
