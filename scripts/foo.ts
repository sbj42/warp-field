import * as WarpField from '../src';
import * as geom from '../src/geom';

const fovMap = new WarpField.FieldOfViewMap('A', 5, 5);
fovMap.addWall(1, 2, geom.Direction.EAST);
const fov = fovMap.getFieldOfView(2, 2, 2);
console.info(fov.toString());