"use strict";

const Lib = {};

//Math.seed = 1;
//
//Math.srandom = () => { // This method is 0.00007573ms per time
//    Math.seed = (Math.seed * 9301 + 49297) % 233280;
//    const rnd = Math.seed / 233280.0;
//    return rnd;
//};

Lib.subdivide = (ary, w, h, s) => { // This method use 52ms to sub 10 times, 127ms to sub 8x20 times
    const rand = () => Math.srandom() - 0.5;
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
                ) / 4 + s * rand();
        }
    }
    // Add side point not in the edge
    for (let i = 1; i < c_size; i += 2) {
        const ri = (i % c_ws + 1) + ws * (0|(i / c_ws) + 1);
        res[ri] = (res[ri - 1] + res[ri + 1] + res[ri - ws] + res[ri + ws]) / 4 + s * rand();
    }
    // Add side point in the top edge
    for (let i = 1; i < ws; i += 2) {
        res[i] = (res[i - 1] + res[i + 1] + res[i + ws]) / 3 + s * rand();
    }
    // Add side point in the bottom edge
    for (let i = size - ws + 1; i < size; i += 2) {
        res[i] = (res[i - 1] + res[i + 1] + res[i - ws]) / 3 + s * rand();
    }
    // Add side point in the left edge
    for (let i = ws; i < size; i += 2 * ws) {
        res[i] = (res[i - ws] + res[i + ws] + res[i + 1]) / 3 + s * rand();
    }
    // Add side point in the right edge
    for (let i = 2 * ws - 1; i < size; i += 2 * ws) {
        res[i] = (res[i - ws] + res[i + ws] + res[i - 1]) / 3 + s * rand();
    }
    return [res, ws, hs];
};

loader.instantiate(fetch('lib-wsm.wasm')).then(({exports}) => {
    const { __pin, __unpin, __newArray, __getArray, __getArrayView } = exports;
    Math.srandom = exports.random; // This method is 0.00001494ms per time
    Math.set_seed = exports.set_seed;
    //Lib.subdivide = (ary, w, h, s) => { // This method use 142ms to sub 10 times, 179ms to sub 8x20 times
    //    const ws = w * 2 - 1;
    //    const hs = h * 2 - 1;
    //    const ary_ptr = __pin(__newArray(exports.Float64Array_ID, ary));
    //    const res_ptr = __pin(exports.subdivide(ary_ptr, w, h, s));
    //    const res = new Float64Array(__getArrayView(res_ptr));
    //    __unpin(ary_ptr);
    //    __unpin(res_ptr);
    //    return [res, ws, hs];
    //};
    //Lib.rsubdivide = (ary, scale, rough, time) => { // This method use 142ms to sub 10 times, 173ms to sub 8x20 times
    //    const ws = (2 << (time - 1)) + 1;
    //    const hs = (2 << (time - 1)) + 1;
    //    const ary_ptr = __pin(__newArray(exports.Float64Array_ID, ary));
    //    const res_ptr = __pin(exports.rsubdivide(ary_ptr, scale, rough, time));
    //    const res = new Float64Array(__getArrayView(res_ptr));
    //    __unpin(ary_ptr);
    //    __unpin(res_ptr);
    //    return [res, ws, hs];
    //};
    //Lib.osubdivide = (ary, w, h, s) => { // This method use 157ms to sub 10 times, 194ms to sub 8x20 times
    //    const ws = w * 2 - 1;
    //    const hs = h * 2 - 1;
    //    const ary_ptr = __pin(__newArray(exports.Float64Array_ID, ary));
    //    const res_ptr = __pin(__newArray(exports.ResFloat64Array_ID, new Float64Array(ws * hs)));
    //    exports.osubdivide(ary_ptr, res_ptr, w, h, s);
    //    const res = new Float64Array(__getArrayView(res_ptr));
    //    __unpin(ary_ptr);
    //    __unpin(res_ptr);
    //    return [res, ws, hs];
    //};
    window.LIB_INITED = true;
    if (window.onlibinit) window.onlibinit();
});