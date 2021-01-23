import * as geom from 'tiled-geometry';
import {FieldOfViewMap} from './field-of-view-map';

export interface Warp {
    map: FieldOfViewMap;
    offsetShift: geom.Offset;
}
