export function getRange({ start = 0, end }: { start?: number; end: number }): number[] {
  if (end <= start) return []

  const nums: number[] = []

  for (let i = start; i <= end; i++) nums.push(i)

  return nums
}
