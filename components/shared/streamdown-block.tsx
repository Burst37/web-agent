"use client";

import { Streamdown } from "streamdown";
import { code } from "@streamdown/code";
import { mermaid } from "@streamdown/mermaid";

const plugins = { code, mermaid };
const controls = {
  table: true as const,
  code: true as const,
  mermaid: { download: true, copy: true, fullscreen: true },
};

export default function StreamdownBlock({
  children,
  isStreaming,
}: {
  children: string;
  isStreaming?: boolean;
}) {
  return (
    <div className="max-w-none">
      <Streamdown
        plugins={plugins}
        controls={controls}
        animated
        caret="block"
        isAnimating={isStreaming}
      >
        {children}
      </Streamdown>
    </div>
  );
}
