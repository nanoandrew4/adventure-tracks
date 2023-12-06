import type { Adventure } from '../types/Adventure.type'
import { constants } from '../constants/constants'

export function buildSampleAdventure(secondaryText: string): Adventure {
  return {
    activities: [],
    backgroundColor: constants.defaultBackgroundColor,
    lineWidth: 4,
    mainText: 'Sample Adventure',
    mainTextColor: constants.defaultTextColor,
    secondaryText,
    secondaryTextColor: constants.defaultTextColor,
    displayElevationProfile: true,
    displayHeartRateGraph: false
  }
}
