/** Kreski w grupach po pięć (cztery pionowe i przekreślenie), jak w designie. */
export function tallyPaths(count: number): string[] {
  const paths: string[] = [];
  for (let i = 0; i < count; i++) {
    const group = Math.floor(i / 5);
    const inGroup = i % 5;
    const base = group * 40;
    if (inGroup === 4) {
      paths.push(`M${base + 1.5} 24 C ${base + 11} 18, ${base + 20} 12, ${base + 30} 7.5`);
    } else {
      const x = base + 5 + inGroup * 7;
      const wobble = inGroup % 2 === 0 ? 0.4 : -0.3;
      paths.push(`M${x} 5 C ${x + wobble} 14, ${x - wobble} 22, ${x + 0.3} 30`);
    }
  }
  return paths;
}

export function tallyWidth(count: number): number {
  const groups = Math.ceil(count / 5);
  return Math.max(34, groups * 40);
}
