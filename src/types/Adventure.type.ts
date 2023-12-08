import {type Activity} from './Activity'

export interface Adventure {
    mainText: string;
    mainTextColor: string
    secondaryText: string;
    secondaryTextColor: string
    lineWidth: number;
    backgroundColor: string;
    activities: Activity[];

    displayElevationProfile: boolean;
    displayHeartRateGraph: boolean;
}
