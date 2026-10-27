// A section heading that becomes a window onto one of my photographs (React Bits MaskedHeading).
// The plain server-rendered <h2> stays the default (no JS, reduced motion); on mount this hides it,
// takes over its id so the sections bar still jumps here, and renders the masked version.
import { useEffect, useState } from "react";
import MaskedHeading from "../rb/MaskedHeading";

interface Props { text: string; id: string; src: string; className?: string }

export default function MaskedTitle({ text, id, src, className }: Props) {
  const [on, setOn] = useState(false);
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const plain = document.getElementById(id);
    if (!plain) return;
    plain.removeAttribute("id");
    plain.hidden = true;
    setOn(true);
  }, [id]);
  if (!on) return null;
  return (
    <MaskedHeading id={id} text={text} tag="h2" src={src} align="left" weight={400} tracking={-0.02} lineHeight={1}
      textScale={0.16} reveal="wipe" duration={1.1} parallax={14} drift={8} fillScale={1.3} brightness={0.78}
      outline outlineColor="#2A221B" outlineWidth={1} className={className} />
  );
}
