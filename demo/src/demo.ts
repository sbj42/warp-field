import * as WarpField from '../../lib';
import * as EasyStar from 'easystarjs';
import SimplexNoise from 'simplex-noise';

const demo = document.getElementById('canvas') as HTMLCanvasElement;
const context = demo.getContext('2d') as CanvasRenderingContext2D;
const width = 37;
const height = 19;
let easystar: EasyStar.js;
let noise: SimplexNoise;
const lava = new Array<boolean[]>();

function index(x: number, y: number) {
    return y * width + x;
}

function generateMap(id: string) {
    const map = new WarpField.FieldOfViewMap(id, width, height, true);

    const turnChance = 0.1;
    const wallCount = map.id === '0' ? 60 : map.id === '1' ? 9 : 3;
    for (let i = 0; i < wallCount; i ++) {
        let x = Math.floor(Math.random() * (width - 2) + 1);
        let y = Math.floor(Math.random() * (height - 2) + 1);
        if (map.getWalls(x, y)) {
            continue;
        }
        let dir = Math.floor(Math.random() * 4) as WarpField.CardinalDirection;
        const len = map.id === '0' ? Math.floor(Math.random() * 5 + 1) : Math.floor(Math.random() * 7 + 5);
        for (let j = 0; j < len; j ++) {
            if (x < 1 || x >= width-1 || y < 1 || y >= height-1) {
                break;
            }
            map.addWall(x, y, dir);
            const turn = Math.random();
            switch (dir) {
                case WarpField.CardinalDirection.NORTH:
                    if (turn < turnChance) {
                        dir = WarpField.CardinalDirection.WEST;
                        x ++;
                        y --;
                    } else if (turn > 1 - turnChance) {
                        dir = WarpField.CardinalDirection.EAST;
                    } else {
                        x ++;
                    }
                    break;
                case WarpField.CardinalDirection.EAST:
                    if (turn < turnChance) {
                        dir = WarpField.CardinalDirection.NORTH;
                        x ++;
                        y ++;
                    } else if (turn > 1 - turnChance) {
                        dir = WarpField.CardinalDirection.SOUTH;
                    } else {
                        y ++;
                    }
                    break;
                case WarpField.CardinalDirection.SOUTH:
                    if (turn < turnChance) {
                        dir = WarpField.CardinalDirection.EAST;
                        x --;
                        y ++;
                    } else if (turn > 1 - turnChance) {
                        dir = WarpField.CardinalDirection.WEST;
                    } else {
                        x --;
                    }
                    break;
                case WarpField.CardinalDirection.WEST:
                    if (turn < turnChance) {
                        dir = WarpField.CardinalDirection.SOUTH;
                        x --;
                        y --;
                    } else if (turn > 1 - turnChance) {
                        dir = WarpField.CardinalDirection.NORTH;
                    } else {
                        y --;
                    }
                    break;
            }
        }
    }

    const bodyChance = map.id === '0' ? 0.04 : 0.08;
    for (let y = 0; y < height; y ++) {
        let lavaRow: boolean[] | undefined;
        if (map.id === '2') {
            lavaRow = new Array<boolean>();
            lava.push(lavaRow);
        }
        for (let x = 0; x < width; x ++) {
            const walls = map.getWalls(x, y);
            if (map.id === '2') {
                lavaRow?.push(noise.noise2D(x / 4, y / 4) < -0.4);
            } else {
                if (walls === 0 && Math.random() < bodyChance) {
                    map.addBody(x, y);
                }
            }
        }
    }
    return map;
}

function addWarp(map1: WarpField.FieldOfViewMap, map2: WarpField.FieldOfViewMap) {
    const l = 4;
    const dir = [WarpField.CardinalDirection.NORTH, WarpField.CardinalDirection.EAST, WarpField.CardinalDirection.SOUTH, WarpField.CardinalDirection.WEST][Math.floor(Math.random() * 4)];
    if (dir === WarpField.CardinalDirection.NORTH || dir === WarpField.CardinalDirection.SOUTH) {
        let x = Math.floor(Math.random() * (width - 4 - l) + 2);
        const y = Math.floor(Math.random() * (height - 4) + 2);
        const y2 = (dir === WarpField.CardinalDirection.NORTH) ? y - 1 : y + 1;
        for (let i = 0; i < l; i ++) {
            if (map1.getWarpFlags(x + i, y) || map2.getWarpFlags(x + i, y2)) {
                addWarp(map1, map2);
                return;
            }
        }
        map1.addWall(x, y, WarpField.CardinalDirection.WEST);
        //map2.addWall(x, y, WarpField.CardinalDirection.WEST);
        //map1.addWall(x, y2, WarpField.CardinalDirection.WEST);
        map2.addWall(x, y2, WarpField.CardinalDirection.WEST);
        for (let i = 0; i < l; i ++) {
            if (map1.id === '2') {
                lava[y][x] = false;
            }
            map1.removeBody(x, y);
            map1.removeWall(x, y, WarpField.CardinalDirection.NORTH);
            map1.removeWall(x, y, WarpField.CardinalDirection.EAST);
            map1.removeWall(x, y, WarpField.CardinalDirection.SOUTH);
            if (map2.id === '2') {
                lava[y2][x] = false;
            }
            map2.removeBody(x, y2);
            map2.removeWall(x, y2, WarpField.CardinalDirection.NORTH);
            map2.removeWall(x, y2, WarpField.CardinalDirection.EAST);
            map2.removeWall(x, y2, WarpField.CardinalDirection.SOUTH);
            map1.addWarp(x, y, dir, map2, x, y2);
            map2.addWarp(x, y2, (dir + 2) & 3, map1, x, y);
            map1.addWall(x, y2, (dir + 2) & 3, true);
            map2.addWall(x, y, dir, true);
            //map2.addWarp(x, y, dir, map1, x, y2);
            //map1.addWarp(x, y2, (dir + 2) & 3, map2, x, y);
            x += 1;
        }
        map1.addWall(x - 1, y, WarpField.CardinalDirection.EAST);
        //map2.addWall(x - 1, y, WarpField.CardinalDirection.EAST);
        //map1.addWall(x - 1, y2, WarpField.CardinalDirection.EAST);
        map2.addWall(x - 1, y2, WarpField.CardinalDirection.EAST);
    } else {
        const x = Math.floor(Math.random() * (width - 4) + 2);
        let y = Math.floor(Math.random() * (height - 4 - l) + 2);
        const x2 = (dir === WarpField.CardinalDirection.WEST) ? x - 1 : x + 1;
        for (let i = 0; i < l; i ++) {
            if (map1.getWarpFlags(x, y + i) || map2.getWarpFlags(x2, y + i)) {
                addWarp(map1, map2);
                return;
            }
        }
        map1.addWall(x, y, WarpField.CardinalDirection.NORTH);
        //map2.addWall(x, y, WarpField.CardinalDirection.NORTH);
        //map1.addWall(x2, y, WarpField.CardinalDirection.NORTH);
        map2.addWall(x2, y, WarpField.CardinalDirection.NORTH);
        for (let i = 0; i < l; i ++) {
            if (map1.id === '2') {
                lava[y][x] = false;
            }
            map1.removeBody(x, y);
            map1.removeWall(x, y, WarpField.CardinalDirection.EAST);
            map1.removeWall(x, y, WarpField.CardinalDirection.SOUTH);
            map1.removeWall(x, y, WarpField.CardinalDirection.WEST);
            if (map2.id === '2') {
                lava[y][x2] = false;
            }
            map2.removeBody(x2, y);
            map2.removeWall(x2, y, WarpField.CardinalDirection.EAST);
            map2.removeWall(x2, y, WarpField.CardinalDirection.SOUTH);
            map2.removeWall(x2, y, WarpField.CardinalDirection.WEST);
            map1.addWarp(x, y, dir, map2, x2, y);
            map2.addWarp(x2, y, (dir + 2) & 3, map1, x, y);
            map1.addWall(x2, y, (dir + 2) & 3, true);
            map2.addWall(x, y, dir, true);
            //map2.addWarp(x, y, dir, map1, x2, y);
            //map1.addWarp(x2, y, (dir + 2) & 3, map2, x, y);
            y += 1;
        }
        map1.addWall(x, y - 1, WarpField.CardinalDirection.SOUTH);
        //map2.addWall(x, y - 1, WarpField.CardinalDirection.SOUTH);
        //map1.addWall(x2, y - 1, WarpField.CardinalDirection.SOUTH);
        map2.addWall(x2, y - 1, WarpField.CardinalDirection.SOUTH);
    }
}

const mapCount = 3;
let maps: WarpField.FieldOfViewMap[];

function generateMaps() {
    maps = new Array<WarpField.FieldOfViewMap>();
    for (let i = 0; i < mapCount; i ++) {
        maps.push(generateMap(String(i)));
    }
    for (let i = 0; i < mapCount; i ++) {
        for (let j = i + 1; j < mapCount; j ++) {
            addWarp(maps[i], maps[j]);
            addWarp(maps[i], maps[j]);
            addWarp(maps[i], maps[j]);
        }
    }
}

function randomPlace() {
    let x: number;
    let y: number;
    const map = Math.floor(Math.random() * maps.length);
    do {
        x = Math.floor(Math.random() * width);
        y = Math.floor(Math.random() * height);
    } while (maps[map].getWalls(x, y) || maps[map].getBody(x, y) || maps[map].getWarpFlags(x, y));
    return [map, x, y];
}

const tileRand = new Array<number>(width * height);

let pmap: number;
let px: number;
let py: number;

function start() {
    noise = new SimplexNoise();
    generateMaps();
    [pmap, px, py] = randomPlace();
    for (let y = 0; y < height; y ++) {
        for (let x = 0; x < width; x ++) {
            tileRand[index(x, y)] = Math.random();
        }
    }
}

function drawImage(image: string, map: number, x: number, y: number) {
    context.drawImage(tiles, imageXOff[image] * 64, map * 64, 64, 64, x * 32 - 16, y * 32 - 16, 64, 64);
}

function render() {
    context.fillStyle = '#666';
    context.fillRect(0, 0, width * 32, height * 32);
    const fov = maps[pmap].getFieldOfView(px, py, 15);
    for (let y = 0; y < height; y ++) {
        for (let x = 0; x < width; x ++) {
            if (!fov.getMask(x, y)) {
                // nothing
            } else {
                let map = fov.getMap(x, y);
                let mx = x, my = y;
                if (!map) {
                    map = maps[pmap];
                } else {
                    const offset = fov.getOffset(x, y);
                    if (offset) {
                        mx = x + offset.x;
                        my = y + offset.y;
                    }
                }
                const mapId = parseInt(map.id);
                if (mapId === 0) {
                    context.fillStyle = '#aaf';
                } else if (mapId === 1) {
                    context.fillStyle = '#afa';
                } else {
                    context.fillStyle = '#faa';
                }
                context.fillRect(mx * 32, my * 32, 32, 32);
                drawImage('floor' + Math.floor(1 + tileRand[index(mx, my)] * 6), mapId, mx, my);
            }
        }
    }
    for (let y = 0; y < height; y ++) {
        for (let x = 0; x < width; x ++) {
            if (!fov.getMask(x, y)) {
                // nothing
            } else {
                let map = fov.getMap(x, y);
                let mx = x, my = y;
                if (!map) {
                    map = maps[pmap];
                } else {
                    const offset = fov.getOffset(x, y);
                    if (offset) {
                        mx = x + offset.x;
                        my = y + offset.y;
                    }
                }
                const mapId = parseInt(map.id);
                if (map.getBody(mx, my)) {
                    drawImage('box' + Math.floor(1 + tileRand[index(x, y)] * 3), mapId, x, y);
                }
                if (mapId === 2 && lava[my][mx]) {
                    drawImage('box' + Math.floor(1 + tileRand[index(x, y)] * 3), mapId, x, y);
                }
            }
        }
    }
    for (let y = 0; y < height; y ++) {
        for (let x = 0; x < width; x ++) {
            if (!fov.getMask(x, y)) {
                // nothing
            } else {
                let map = fov.getMap(x, y);
                let mx = x, my = y;
                if (!map) {
                    map = maps[pmap];
                } else {
                    const offset = fov.getOffset(x, y);
                    if (offset) {
                        mx = x + offset.x;
                        my = y + offset.y;
                    }
                }
                const mapId = parseInt(map.id);
                {
                    const walls = map.getWalls(mx, my);
                    if ((walls & WarpField.CardinalDirectionFlags.NORTH) !== 0) {
                        drawImage('north', mapId, x, y);
                    }
                    if ((walls & WarpField.CardinalDirectionFlags.EAST) !== 0) {
                        drawImage('east', mapId, x, y);
                    }
                    if ((walls & WarpField.CardinalDirectionFlags.SOUTH) !== 0) {
                        drawImage('south', mapId, x, y);
                    }
                    if ((walls & WarpField.CardinalDirectionFlags.WEST) !== 0) {
                        drawImage('west', mapId, x, y);
                    }
                }
            }
        }
    }
    for (let y = 0; y < height; y ++) {
        for (let x = 0; x < width; x ++) {
            if (!fov.getMask(x, y)) {
                // nothing
            } else {
                let map = fov.getMap(x, y);
                let mx = x, my = y;
                if (!map) {
                    map = maps[pmap];
                } else {
                    const offset = fov.getOffset(x, y);
                    if (offset) {
                        mx = x + offset.x;
                        my = y + offset.y;
                    }
                }
                const mapId = parseInt(map.id);
                {
                    const warps = map.getWarpFlags(mx, my);
                    if ((warps & WarpField.CardinalDirectionFlags.NORTH) !== 0) {
                        drawImage('warpnorth', mapId, x, y);
                    }
                    if ((warps & WarpField.CardinalDirectionFlags.EAST) !== 0) {
                        drawImage('warpeast', mapId, x, y);
                    }
                    if ((warps & WarpField.CardinalDirectionFlags.SOUTH) !== 0) {
                        drawImage('warpsouth', mapId, x, y);
                    }
                    if ((warps & WarpField.CardinalDirectionFlags.WEST) !== 0) {
                        drawImage('warpwest', mapId, x, y);
                    }
                }
            }
        }
    }
    drawImage('player', pmap, px, py);
    return fov;
}

interface MoveOption {
    nx: number,
    ny: number,
    score: number,
}

let auto = true;
window.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowUp' || event.key === 'ArrowDown' || event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        const fov = maps[pmap].getFieldOfView(px, py, 15);
        let nx = px;
        let ny = py;
        let dir: WarpField.CardinalDirection;
        switch (event.key) {
            case 'ArrowUp':
                dir = WarpField.CardinalDirection.NORTH;
                ny --;
                break;
            case 'ArrowDown':
                dir = WarpField.CardinalDirection.SOUTH;
                ny ++;
                break;
            case 'ArrowLeft':
                dir = WarpField.CardinalDirection.WEST;
                nx --;
                break;
            case 'ArrowRight':
                dir = WarpField.CardinalDirection.EAST;
                nx ++;
                break;
        }
        if (nx >= 0 && ny >= 0 && nx < width && ny < height && !maps[pmap].getWall(px, py, dir) && !maps[pmap].getBody(nx, ny)) {
            const map = fov.getMap(nx, ny);
            if (map) {
                pmap = parseInt(map.id);
            }
            if (pmap !== 2 || !lava[ny][nx]) {
                px = nx;
                py = ny;
            }
            requestAnimationFrame(render);
        }
        event.preventDefault();
        auto = false;
        document.getElementById('takeover')?.remove();
    }
});

const imageXOff: {[id: string]: number} = {
    'floor1': 0,
    'floor2': 1,
    'floor3': 2,
    'floor4': 3,
    'floor5': 4,
    'floor6': 5,
    'box1': 6,
    'box2': 7,
    'box3': 8,
    'north': 9,
    'east': 10,
    'south': 11,
    'west': 12,
    'warpnorth': 13,
    'warpeast': 14,
    'warpsouth': 15,
    'warpwest': 16,
    'player': 17,
};
const tiles = new Image();
tiles.src = './tiles.png';
tiles.onload = function() {

    start();

    let working = false;
    let path: {x: number, y: number}[] | undefined;
    let timeSinceMapChange = 0;

    function step() {

        if (!auto) {
            return;
        }
        const fov = render();

        if (!path) {
            if (working) {
                easystar.calculate();
            } else {
                timeSinceMapChange ++;
                const options = new Array<MoveOption>();
                const curMapId = String(pmap);
                const nextMapId = String((pmap + 1) % maps.length);
                for (let i = 0; i < 100 && options.length < 20; i ++) {
                    const [, nx, ny] = randomPlace();
                    if (fov.getMask(nx, ny)) {
                        let nmap = fov.getMap(nx, ny);
                        if (!nmap) {
                            nmap = maps[pmap];
                        }
                        if (nmap.getBody(nx, ny)) {
                            continue;
                        }
                        if (nmap.id === '2' && lava[ny][nx]) {
                            continue;
                        }
                        let score = 0;
                        if (timeSinceMapChange < 3) {
                            if (nmap.id === curMapId) {
                                score += 10;
                            }
                        } else {
                            if (nmap.id === nextMapId) {
                                score += 20;
                                timeSinceMapChange = 0;
                            } else if (nmap.id !== curMapId) {
                                score += 10;
                                timeSinceMapChange = 0;
                            }
                        }
                        const dir = ((px - width/2) * (ny - height/2) - (nx - width/2) * (py - height/2));
                        if (dir < 0) {
                            score += 5;
                        }
                        score += Math.min(10, Math.max(Math.abs(px - nx), Math.abs(py - ny))) / 10;
                        options.push({
                            nx,
                            ny,
                            score,
                        });
                    }
                }
                if (options.length > 0) {
                    options.sort((a, b) => {
                        return b.score - a.score;
                    });
                    const {nx, ny} = options[0];
                    easystar = new EasyStar.js();
                    easystar.setAcceptableTiles([0]);
                    const grid = new Array<number[]>();
                    for (let y = 0; y < height; y ++) {
                        const row = new Array<number>();
                        grid.push(row);
                        for (let x = 0; x < width; x ++) {
                            if (fov.getMask(x, y)) {
                                let map = fov.getMap(x, y);
                                if (!map) {
                                    map = maps[pmap];
                                }
                                if (map.getBody(x, y)) {
                                    row.push(1);
                                } else {
                                    if (map.id === '2' && lava[y][x]) {
                                        row.push(1);
                                    } else {
                                        row.push(0);
                                    }
                                }
                            } else {
                                row.push(1);
                            }
                        }
                    }
                    easystar.setGrid(grid);
                    easystar.enableDiagonals();
                    easystar.enableSync();
                    for (let y = 0; y < height; y ++) {
                        for (let x = 0; x < width; x ++) {
                            if (fov.getMask(x, y)) {
                                let map = fov.getMap(x, y);
                                if (!map) {
                                    map = maps[pmap];
                                }
                                const walls = map.getWalls(x, y);
                                if (walls !== 0) {
                                    const ok: EasyStar.Direction[] = [];
                                    if ((walls & WarpField.CardinalDirectionFlags.NORTH) === 0) {
                                        ok.push(EasyStar.TOP);
                                    }
                                    if ((walls & WarpField.CardinalDirectionFlags.EAST) === 0) {
                                        ok.push(EasyStar.RIGHT);
                                    }
                                    if ((walls & WarpField.CardinalDirectionFlags.SOUTH) === 0) {
                                        ok.push(EasyStar.BOTTOM);
                                    }
                                    if ((walls & WarpField.CardinalDirectionFlags.WEST) === 0) {
                                        ok.push(EasyStar.LEFT);
                                    }
                                    easystar.setDirectionalCondition(x, y, ok);
                                }
                            }
                        }
                    }
                    working = true;
                    easystar.findPath(px, py, nx, ny, (p) => {
                        path = p;
                        working = false;
                        requestAnimationFrame(step);
                    });
                    easystar.calculate();
                    return;
                }
            }
        } else if (path.length > 0) {
            const part = path.shift();
            if (part) {
                const {x, y} = part;
                if (fov.getMask(x, y)) {
                    const map = fov.getMap(x, y);
                    if (map) {
                        pmap = parseInt(map.id);
                        path = undefined;
                    }
                    px = x;
                    py = y;
                }
            }
        } else {
            path = undefined;
        }

        setTimeout(() => requestAnimationFrame(step), 120);
    }

    requestAnimationFrame(step);

};