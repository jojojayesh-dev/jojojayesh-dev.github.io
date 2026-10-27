// My name: Fraunces thickens and grows its optical size near the cursor (React Bits VariableProximity).
// Loaded only for a fine pointer on wide screens; everyone else gets the plain server-rendered h1 text.
import { useRef } from "react";
import VariableProximity from "../rb/VariableProximity";

export default function NameProximity({ name }: { name: string }) {
  const ref = useRef<HTMLSpanElement | null>(null);
  return (
    <span ref={ref} style={{ display: "block" }}>
      <VariableProximity
        label={name}
        containerRef={ref}
        fromFontVariationSettings="'wght' 300, 'opsz' 144"
        toFontVariationSettings="'wght' 620, 'opsz' 144"
        radius={180}
        falloff="gaussian"
        style={{ fontFamily: "var(--font-serif)" }}
      />
    </span>
  );
}
