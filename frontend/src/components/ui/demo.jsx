import { Cta69 } from "@/components/ui/cta69";

export default function Cta69Demo() {
  return (
    <Cta69
      heading="Build What's Next."
      button={{ label: "Get Started", href: "/login" }}
      labels={{
        marqueePhrase: "Imagine It. Automate It.",
        note: "Turn your ideas into intelligent workflows. Build, configure, and simulate AI-powered automation — all in one place.",
        footnote: "From your first idea to your first automated workflow.",
      }}
    />
  );
}
