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
      font: '',
      fontSize: '10',
      bold: false,
      italic: false
    },
    secondaryText: {
      text: secondaryTextVal,
      color: constants.defaultTextColor,
      font: '',
      fontSize: '7.5',
      bold: false,
      italic: false
    },
    displayElevationProfile: true,
    displayHeartRateGraph: false,
    customizationEnabled: false,
    layoutMode: LayoutMode.LANDSCAPE,
  }
}
