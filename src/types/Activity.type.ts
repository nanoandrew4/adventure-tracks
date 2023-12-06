import {type GeoPoint} from './GeoPoint.type'

export interface Activity {
    name: string;
    sourceName: string;
    // heartRateData: number[]
    activityGeoPoints: GeoPoint[];
    lineColor: string;
    elevationProfileColor: string
}