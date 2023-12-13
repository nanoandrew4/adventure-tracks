import type { Activity } from '@/types/Activity'

function sortByDateAscending(a: Activity | undefined, b: Activity | undefined): number {
  if (!a || !a.startTime) return -1
  if (!b || !b.startTime) return 1
  return a.startTime.getTime() - b.startTime.getTime()
}

export { sortByDateAscending }
