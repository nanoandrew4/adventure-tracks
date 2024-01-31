import { LayoutMode, type Adventure } from '../types/Adventure'
import { constants } from '../constants/constants'

export function buildSampleAdventure(secondaryTextVal: string): Adventure {
  return {
    activities: [],
    labels: [],
    backgroundColor: constants.defaultBackgroundColor,
    lineWidth: 4,
    mainText: {
      text: 'Sample Adventure',
      color: constants.defaultTextColor,
      font: ''
    },
    secondaryText: {
      text: secondaryTextVal,
      color: constants.defaultTextColor,
      font: ''
    },
    displayElevationProfile: true,
    displayHeartRateGraph: false,
    customizationEnabled: false,
    layoutMode: LayoutMode.LANDSCAPE,
  }
}
