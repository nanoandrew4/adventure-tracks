export interface ActivityLoadProgress {
  numOfActivitiesToLoad: number
  numOfActivitiesProcessed: number
  filesWithErrors: Set<string>
}
