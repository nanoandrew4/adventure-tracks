import { constants } from '@/constants/constants'
import type { CustomText } from './CustomText'

export interface Label {
  name: CustomText
  value: CustomText
}

export function createEmptyLabel(font: string): Label {
    return {
        name: {
            text: '',
            color: constants.defaultTextColor,
            font,
            fontSize: '10',
            bold: false,
            italic: false
        },
        value: {
            text: '',
            color: constants.defaultTextColor,
            font,
            fontSize: '10',
            bold: false,
            italic: false
        }
    }
}