export function calcPoints(result: string, status: string): number {
  if (status === 'disband') return 0
  if (result === 'win') return 3
  if (result === 'draw') return 1
  return 0
}
