import type { CSSProperties } from 'react';
import { glyphs, type GlyphName } from './glyphs';

type IconProps = {
  name: GlyphName;
  size?: number;
  accent?: boolean;
  filled?: boolean;
  strokeWidth?: number;
  className?: string;
};

const CLAY = 'var(--clay)';

function partStyle(
  role: 'base' | 'accent' | 'fill',
  accent: boolean,
  filled: boolean,
): CSSProperties | undefined {
  if (role === 'accent') return accent ? { stroke: CLAY } : undefined;
  if (role === 'fill') {
    if (filled) return { fill: CLAY, stroke: CLAY };
    return accent ? { stroke: CLAY } : undefined;
  }
  return undefined;
}

export function Icon({
  name,
  size = 24,
  accent = false,
  filled = false,
  strokeWidth = 1.75,
  className,
}: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      style={{ flex: 'none' }}
    >
      {glyphs[name].map((part) => (
        <path key={part.d} d={part.d} style={partStyle(part.role, accent, filled)} />
      ))}
    </svg>
  );
}
