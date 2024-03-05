import { LayoutMode, type Adventure } from '../types/Adventure'
import { constants } from '../constants/constants'
import { DataGraph } from '@/types/DataGraph'

export function buildSampleAdventure(): Adventure {
  return {
    activities: [],
    labels: [],
    backgroundColor: constants.defaultBackgroundColor,
    lineWidth: 4,
    mainText: {
      text: 'Sample Adventure',
      color: constants.defaultTextColor,
      font: constants.defaultFont,
      fontSize: '10',
      bold: false,
      italic: false
    },
    secondaryText: {
      text: new Date().toLocaleDateString(),
      color: constants.defaultTextColor,
      font: constants.defaultFont,
      fontSize: '7.5',
      bold: false,
      italic: false
    },
    mapStyle: {
      name: 'Monochrome',
      username: 'nanoandrew4',
      styleID: 'clq85wo0o000z01qyfu4j338x',
      custom: false
    },
    dataGraph: new DataGraph(),
    customizationEnabled: false,
    layoutMode: LayoutMode.LANDSCAPE
  }
}
