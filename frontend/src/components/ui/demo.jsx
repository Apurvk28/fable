import { Cta69 } from "@/components/ui/cta69";

export default function Cta69Demo() {
  return (
    <Cta69
      heading="Let's make something worth keeping."
      button={{ label: "Get Started", href: "/login" }}
      labels={{
        marqueePhrase: "Imagine It. Automate It.",
        note: "No decks, no detours: one room, your problem, and a studio that ships.",
        footnote: "Booking two new partners for the autumn cycle.",
      }}
    />
  );
}
