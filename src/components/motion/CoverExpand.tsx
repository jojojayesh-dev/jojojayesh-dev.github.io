// Cover that opens from a framed window to full width as the reader scrolls (React Bits ScrollExpand).
// The static <figure> stays the default: phones, no-JS and reduced-motion readers keep it.
// This island only loads on wide screens (client:media) and swaps itself in after checking motion is allowed.
import { useEffect, useState } from "react";
import ScrollExpand from "../rb/ScrollExpand";

interface Props { src: string; alt: string; fallbackId: string }

export default function CoverExpand({ src, alt, fallbackId }: Props) {
  const [on, setOn] = useState(false);
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setOn(true);
    document.getElementById(fallbackId)?.setAttribute("hidden", "");
  }, [fallbackId]);
  if (!on) return null;
  return (
    <div style={{ marginTop: 40 }}>
      <ScrollExpand src={src} alt={alt} useWindowScroll startWidth={72} startHeight={74} startRadius={0} endRadius={0}
        mediaZoom={1.12} scrollDistance={0.8} holdDistance={0.1} smoothing={0.08} overlayScrim={0} />
    </div>
  );
}
