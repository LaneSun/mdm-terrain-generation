let seed: u32 = 1;

export function random(): f64 {
    seed = (seed * 9301 + 49297) % 233280;
    const rnd: f64 = seed / 233280.0;
    return rnd;
};

export function set_seed(s: i32): void {
    seed = s;
};

//export const Float64Array_ID = idof<Float64Array>();
//export function subdivide(ary: Float64Array, w: i32, h: i32, s: f64): Float64Array {
//    const ws: i32 = w * 2 - 1;
//    const hs: i32 = h * 2 - 1;
//    const size: i32 = ws * hs;
//    const c_ws: i32 = ws - 2;
//    const c_hs: i32 = hs - 2;
//    const c_size: i32 = c_ws * c_hs;
//    const res = new Float64Array(size);
//    // Copy raw points
//    for (let x: i32 = 0; x < w; x++) {
//        for (let y: i32 = 0; y < h; y++) {
//            res[2 * x + ws * 2 * y] = ary[x + w * y];
//        }
//    }
//    // Add center point
//    for (let x: i32 = 0; x < w - 1; x++) {
//        for (let y: i32 = 0; y < h - 1; y++) {
//            res[2 * x + 1 + ws * (2 * y + 1)] =
//                (
//                    ary[x + w * y] +
//                    ary[x + 1 + w * y] +
//                    ary[x + w * (y + 1)] +
//                    ary[x + 1 + w * (y + 1)]
//                ) / 4 + s * (random() - 0.5);
//        }
//    }
//    // Add side point not in the edge
//    for (let i: i32 = 1; i < c_size; i += 2) {
//        const ri: i32 = (i % c_ws + 1) + ws * (0|(i / c_ws) + 1);
//        res[ri] = (res[ri - 1] + res[ri + 1] + res[ri - ws] + res[ri + ws]) / 4 + s * (random() - 0.5);
//    }
//    // Add side point in the top edge
//    for (let i: i32 = 1; i < ws; i += 2) {
//        res[i] = (res[i - 1] + res[i + 1] + res[i + ws]) / 3 + s * (random() - 0.5);
//    }
//    // Add side point in the bottom edge
//    for (let i: i32 = size - ws + 1; i < size; i += 2) {
//        res[i] = (res[i - 1] + res[i + 1] + res[i - ws]) / 3 + s * (random() - 0.5);
//    }
//    // Add side point in the left edge
//    for (let i: i32 = ws; i < size; i += 2 * ws) {
//        res[i] = (res[i - ws] + res[i + ws] + res[i + 1]) / 3 + s * (random() - 0.5);
//    }
//    // Add side point in the right edge
//    for (let i: i32 = 2 * ws - 1; i < size; i += 2 * ws) {
//        res[i] = (res[i - ws] + res[i + ws] + res[i - 1]) / 3 + s * (random() - 0.5);
//    }
//    return res;
//};
//
//export const ResFloat64Array_ID = idof<Float64Array>();
//export function osubdivide(ary: Float64Array, res: Float64Array, w: i32, h: i32, s: f64): void {
//    const ws: i32 = w * 2 - 1;
//    const hs: i32 = h * 2 - 1;
//    const size: i32 = ws * hs;
//    const c_ws: i32 = ws - 2;
//    const c_hs: i32 = hs - 2;
//    const c_size: i32 = c_ws * c_hs;
//    // Copy raw points
//    for (let x: i32 = 0; x < w; x++) {
//        for (let y: i32 = 0; y < h; y++) {
//            res[2 * x + ws * 2 * y] = ary[x + w * y];
//        }
//    }
//    // Add center point
//    for (let x: i32 = 0; x < w - 1; x++) {
//        for (let y: i32 = 0; y < h - 1; y++) {
//            res[2 * x + 1 + ws * (2 * y + 1)] =
//                (
//                    ary[x + w * y] +
//                    ary[x + 1 + w * y] +
//                    ary[x + w * (y + 1)] +
//                    ary[x + 1 + w * (y + 1)]
//                ) / 4 + s * (random() - 0.5);
//        }
//    }
//    // Add side point not in the edge
//    for (let i: i32 = 1; i < c_size; i += 2) {
//        const ri: i32 = (i % c_ws + 1) + ws * (0|(i / c_ws) + 1);
//        res[ri] = (res[ri - 1] + res[ri + 1] + res[ri - ws] + res[ri + ws]) / 4 + s * (random() - 0.5);
//    }
//    // Add side point in the top edge
//    for (let i: i32 = 1; i < ws; i += 2) {
//        res[i] = (res[i - 1] + res[i + 1] + res[i + ws]) / 3 + s * (random() - 0.5);
//    }
//    // Add side point in the bottom edge
//    for (let i: i32 = size - ws + 1; i < size; i += 2) {
//        res[i] = (res[i - 1] + res[i + 1] + res[i - ws]) / 3 + s * (random() - 0.5);
//    }
//    // Add side point in the left edge
//    for (let i: i32 = ws; i < size; i += 2 * ws) {
//        res[i] = (res[i - ws] + res[i + ws] + res[i + 1]) / 3 + s * (random() - 0.5);
//    }
//    // Add side point in the right edge
//    for (let i: i32 = 2 * ws - 1; i < size; i += 2 * ws) {
//        res[i] = (res[i - ws] + res[i + ws] + res[i - 1]) / 3 + s * (random() - 0.5);
//    }
//};
//
//export function rsubdivide(ary: Float64Array, scale: f64, rough: f64, time: i32): Float64Array {
//    let map = ary;
//    let w = 2;
//    let h = 2;
//    for (let i: i32 = 0; i < time; i++) {
//        scale = scale / (2 ** rough);
//        map = subdivide(map, w, h, scale);
//        w = w * 2 - 1;
//        h = h * 2 - 1;
//    }
//    return map;
//};