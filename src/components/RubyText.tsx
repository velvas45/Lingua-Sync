'use client';

import React from 'react';
import { parseFurigana } from '@/lib/furigana';
import { cn } from '@/lib/utils';

interface RubyTextProps {
  text: string;
  furiganaHtml?: string | null;
  showFurigana?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export default function RubyText({
  text,
  furiganaHtml,
  showFurigana = true,
  className = '',
  style = {}
}: RubyTextProps) {
  if (furiganaHtml && furiganaHtml.includes('<ruby>')) {
    const segments = parseFurigana(furiganaHtml);
    if (segments.length > 0) {
      return (
        <span
          className={cn("inline-flex flex-wrap items-baseline gap-x-0.5", className)}
          style={style}
        >
          {segments.map((seg, idx) => {
            if (seg.type === 'ruby') {
              return (
                <ruby key={idx}>
                  {seg.base}
                  <rt className={cn("transition-opacity duration-200 select-none", showFurigana ? "opacity-100" : "opacity-0 hover:opacity-60")}>
                    {seg.reading}
                  </rt>
                </ruby>
              );
            }
            return <React.Fragment key={idx}>{seg.content}</React.Fragment>;
          })}
        </span>
      );
    }
  }

  return <span className={className} style={style}>{text}</span>;
}
