import { constants } from '@/constants/constants'
import type { CustomText } from './CustomText'

export interface Label {
  name: CustomText
  value: CustomText
}

export function createEmptyLabel(): Label {
    return {
        name: {
            text: '',
            color: constants.defaultTextColor,
            font: ''
        },
        value: {
            text: '',
            color: constants.defaultTextColor,
            font: ''
        }
    }
}