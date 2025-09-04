"use strict";

const Lib = {};

const n_sqrt2 = Math.sqrt(2);
Lib.subdivide = (ary, w, h, s, fr, ft) => {
    const rand = (x, y) => s * (Math.srandom() - 0.5 + ft(x, y)) * fr(x, y);
    const ws = w * 2 - 1;
    const hs = h * 2 - 1;
    const size = ws * hs;
    const c_ws = ws - 2;
    const c_hs = hs - 2;
    const c_size = c_ws * c_hs;
    const res = new Float64Array(size);
    // Copy raw points
    for (let x = 0; x < w; x++) {
        for (let y = 0; y < h; y++) {
            res[2 * x + ws * 2 * y] = ary[x + w * y];
        }
    }
    // Add center point
    for (let x = 0; x < w - 1; x++) {
        for (let y = 0; y < h - 1; y++) {
            res[2 * x + 1 + ws * (2 * y + 1)] =
                (
                    ary[x + w * y] +
                    ary[x + 1 + w * y] +
                    ary[x + w * (y + 1)] +
                    ary[x + 1 + w * (y + 1)]
                ) / 4 + rand((2*x+1)/(ws-1), (2*y+1)/(hs-1)) * n_sqrt2;
        }
    }
    // Add side point not in the edge
    for (let i = 1; i < c_size; i += 2) {
        const rx = i % c_ws + 1;
        const ry = 0|(i / c_ws) + 1;
        const ri = rx + ws * ry;
        res[ri] = (res[ri - 1] + res[ri + 1] + res[ri - ws] + res[ri + ws]) / 4 + rand(rx/(ws-1), ry/(hs-1));
    }
    // Add side point in the top edge
    for (let i = 1; i < ws; i += 2) {
        res[i] = (res[i - 1] + res[i + 1] + res[i + ws]) / 3 + rand(i/(ws-1), 0);
    }
    // Add side point in the bottom edge
    for (let i = size - ws + 1; i < size; i += 2) {
        res[i] = (res[i - 1] + res[i + 1] + res[i - ws]) / 3 + rand((i%ws)/(ws-1), 1);
    }
    // Add side point in the left edge
    for (let i = ws; i < size; i += 2 * ws) {
        res[i] = (res[i - ws] + res[i + ws] + res[i + 1]) / 3 + rand(0, (i/ws)/(hs-1));
    }
    // Add side point in the right edge
    for (let i = 2 * ws - 1; i < size; i += 2 * ws) {
        res[i] = (res[i - ws] + res[i + ws] + res[i - 1]) / 3 + rand(1, ((i-ws+1)/ws)/(hs-1));
    }
    //// Add side point in the top edge
    //for (let i = 1; i < ws; i += 2) {
    //    res[i] = (res[i - 1] + res[i + 1]) / 2;
    //}
    //// Add side point in the bottom edge
    //for (let i = size - ws + 1; i < size; i += 2) {
    //    res[i] = (res[i - 1] + res[i + 1]) / 2;
    //}
    //// Add side point in the left edge
    //for (let i = ws; i < size; i += 2 * ws) {
    //    res[i] = (res[i - ws] + res[i + ws]) / 2;
    //}
    //// Add side point in the right edge
    //for (let i = 2 * ws - 1; i < size; i += 2 * ws) {
    //    res[i] = (res[i - ws] + res[i + ws]) / 2;
    //}
    return [res, ws, hs];
};

Math.seed = 1;

Math.srandom = () => { // This method is 0.00007573ms per time
    Math.seed = (Math.seed * 9301 + 49297) % 233280;
    const rnd = Math.seed / 233280.0;
    return rnd;
};
Math.set_seed = (s) => {Math.seed = s};

//loader.instantiate(fetch('lib-wsm.wasm')).then(({exports}) => { // wasm file not available in neosities.org
//    const { __pin, __unpin, __newArray, __getArray, __getArrayView } = exports;
//    Math.srandom = exports.random;
//    Math.set_seed = exports.set_seed;
//    window.LIB_INITED = true;
//    if (window.onlibinit) window.onlibinit();
//});

window.LIB_INITED = true;
if (window.onlibinit) window.onlibinit();
