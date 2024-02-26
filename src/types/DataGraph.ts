import { constants } from "@/constants/constants";
import type { CustomTextStyle } from "./CustomTextStyle";

export class DataGraph {
  displayElevationProfile: boolean = true;
  displayHighestAndLowestPoints: boolean = true
  graphText: CustomTextStyle

  constructor() {
    this.graphText = {
        color: constants.defaultTextColor,
        font: constants.defaultFont,
        fontSize: '6',
        bold: false,
        italic: false
    }
  }

  display(): boolean {
    return this.displayElevationProfile
  }
}
