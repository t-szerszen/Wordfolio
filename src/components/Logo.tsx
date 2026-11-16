import { useId } from 'react';
import styles from './Logo.module.css';

type LogoProps = {
  variant?: 'full' | 'mark';
  size?: number;
  /** Kolor tła pod znakiem — obrys stalówki „wycina” go z linii litery W. */
  knock?: string;
  label?: string;
};

function DetailedMark({
  size,
  knock,
  filterId,
}: {
  size: number;
  knock: string;
  filterId: string;
}) {
  const useInk = size >= 56;
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} fill="none" aria-hidden="true">
      {useInk && (
        <defs>
          <filter id={filterId} x="-10%" y="-10%" width="120%" height="120%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.85"
              numOctaves={1}
              seed={7}
              result="n"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="n"
              scale="0.9"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
      )}
      <g
        filter={useInk ? `url(#${filterId})` : undefined}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path
          d="M24.2 50.3 C 26.8 43.6, 29.3 37.6, 31.9 31.9 C 34.6 37.7, 37.2 43.7, 39.8 50.4"
          stroke="var(--clay)"
          strokeWidth="1.9"
          opacity="0.72"
        />
        <path
          d="M28.3 50.2 C 29.5 46.8, 30.7 43.7, 31.9 40.9 C 33.2 43.8, 34.4 46.9, 35.6 50.3"
          stroke="var(--clay)"
          strokeWidth="1.6"
          opacity="0.5"
        />
        <path
          d="M30.6 23.2 C 30.5 33.2, 30.4 44.8, 30.25 57.9 L 32 55.7 L 33.85 58.1 C 33.65 44.8, 33.45 33.2, 33.3 23.2 Z"
          fill="var(--clay)"
          stroke={knock}
          strokeWidth="1.7"
          paintOrder="stroke"
        />
        <path
          d="M9.7 13.3 C 10.5 12.9, 11.1 13.5, 11.3 14.3 C 13.5 25.7, 16.3 37.8, 19.95 50.6 C 23.6 40.6, 27.6 30.8, 31.9 21.3 C 36.3 31, 40.3 41, 44.1 50.8 C 47.8 38.2, 50.7 26, 53.05 13.9 C 53.25 13.15, 53.95 12.75, 54.75 13.05"
          stroke="var(--clay)"
          strokeWidth="3.4"
        />
        <circle cx="10.1" cy="13.6" r="1.75" fill="var(--clay)" />
      </g>
    </svg>
  );
}

function SimpleMark({ size, knock }: { size: number; knock: string }) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} fill="none" aria-hidden="true">
      <path
        d="M29.3 24 L 29.1 59.5 L 32 56.2 L 34.9 59.8 L 34.7 24 Z"
        fill="var(--clay)"
        stroke={knock}
        strokeWidth="2.6"
        strokeLinejoin="round"
        paintOrder="stroke"
      />
      <path
        d="M8.5 12.5 C 11.5 26, 15 39, 19.6 52 C 23.6 41.4, 27.6 31, 32 20.6 C 36.4 31, 40.4 41.4, 44.4 52 C 49 39, 52.5 26, 55.5 12.5"
        stroke="var(--clay)"
        strokeWidth="6.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Logo({ variant = 'full', size = 30, knock = 'var(--paper)', label }: LogoProps) {
  const filterId = useId();
  const mark =
    size < 28 ? (
      <SimpleMark size={size} knock={knock} />
    ) : (
      <DetailedMark size={size} knock={knock} filterId={filterId} />
    );
  return (
    <span
      className={styles.logo}
      style={{ gap: Math.round(size * 0.1) }}
      role={label ? 'img' : undefined}
      aria-label={label}
    >
      {mark}
      {variant === 'full' && (
        <span
          className={styles.word}
          style={{ fontSize: Math.round(size * 0.6), paddingBottom: Math.round(size * 0.06) }}
          aria-hidden={label ? true : undefined}
        >
          Wordfolio
        </span>
      )}
    </span>
  );
}
