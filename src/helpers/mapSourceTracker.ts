import type { ReducedActivity } from '@/components/map/ReducedActivity'
import type { Activity } from '@/types/Activity'

export class mapSourceTracker {
  private sourceIDsMap: Set<string> = new Set()

  registerActivity(activity: Activity) {
    this.sourceIDsMap.add(activity.sourceName)
  }

  unregisterSource(source: string) {
    this.sourceIDsMap.delete(source)
  }

  getMissingSources(activities: ReducedActivity[]): string[] {
    const activitiesMap = activities.reduce((result, item) => {
      result.set(item.sourceName, item)
      result.set(item.layerName, item)
      return result
    }, new Map<string, ReducedActivity>())
    const missingSources: string[] = []
    this.sourceIDsMap.forEach((k) => {
      if (!activitiesMap.has(k)) missingSources.push(k)
    })
    return missingSources
  }

  getNewActivities(activities: ReducedActivity[]): ReducedActivity[] {
    return activities.filter((activity) => !this.sourceIDsMap.has(activity.sourceName))
  }
}
