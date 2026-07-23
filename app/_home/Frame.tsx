// app/_home/Frame.tsx
//
// Art-directed image frame. `duo` applies the lime duotone grade.
// Server component: it is next/image plus two decorative spans, none of
// which needs the client. The grade itself lives in CSS.

import Image from "next/image";

export default function Frame({
  src, alt, sizes, priority, duo, className,
}: {
  src: string; alt: string; sizes: string;
  priority?: boolean; duo?: boolean; className?: string;
}) {
  return (
    <div
      className={`ff-frame ${duo ? "ff-duo" : "ff-food"} ${className ?? ""}`}
      style={{ position: "absolute", inset: 0, overflow: "hidden" }}
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        // The hero is the LCP element. `priority` alone sets loading=eager;
        // fetchPriority tells the browser to jump it ahead of the other
        // seven frames competing for the same connection.
        fetchPriority={priority ? "high" : undefined}
        quality={72}
        style={{ objectFit: "cover" }}
      />
      {duo ? <span className="ff-tint" aria-hidden /> : null}
      <span className="ff-grain" aria-hidden />
    </div>
  );
}
