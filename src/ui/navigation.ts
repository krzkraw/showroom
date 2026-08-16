export function wrappedIndex(index: number, total: number): number {
  return ((index % total) + total) % total;
}

export function swipeStep(startX: number, endX: number): -1 | 0 | 1 {
  const distance = endX - startX;
  if (distance >= 40) return -1;
  if (distance <= -40) return 1;
  return 0;
}
