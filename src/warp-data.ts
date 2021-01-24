import { FieldOfViewMap } from './field-of-view-map';

export interface WarpData {
    readonly map: FieldOfViewMap;
    readonly warpCount: number;
    readonly shiftX: number;
    readonly shiftY: number;
}

interface YData {
    [x: number]: WarpData | undefined;
}

interface MapData {
    [y: number]: YData | undefined;
}

interface WarpCountData {
    [warpCount: number]: MapData | undefined;
}

interface Data {
    [mapId: string]: WarpCountData | undefined;
}

export class WarpDataCache {
    private _data: Data = {};

    get(map: FieldOfViewMap, warpCount: number, shiftX: number, shiftY: number): WarpData {
        let wcData = this._data[map.id];
        if (!wcData) {
            this._data[map.id] = wcData = {};
        }
        let mapData = wcData[warpCount];
        if (!mapData) {
            wcData[warpCount] = mapData = {};
        }
        let yData = mapData[shiftY];
        if (!yData) {
            mapData[shiftY] = yData = {};
        }
        let data = yData[shiftX];
        if (data) {
            return data;
        }
        yData[shiftX] = data = {
            map,
            warpCount,
            shiftX,
            shiftY,
        };
        return data;
    }
}
