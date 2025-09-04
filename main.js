"use strict";

window.onlibinit = function() {
    //const rand = Math.srandom;
    //const time = 100_000_000;
    //const t_start = performance.now();
    //for (let i = 0; i < time; i++) {
    //    rand();
    //}
    //const t_end = performance.now();
    //console.log(`use ${t_end - t_start}ms to compute ${time} times`);
    //console.log(`${(t_end - t_start) / time}ms per time`);
    
    const seed = 4;
    const sub_time = 5;
    const rough = 1;
    const dtime = 1000;
    
    //const rand = Math.srandom;
    //const set_seed = Math.set_seed;
    //const subdivide = Lib.subdivide;
    //set_seed(seed);
    //const face_map = new Float64Array(4);
    //face_map.forEach((v, i) => face_map[i] = rand());
    //let map, scale;
    //const t_start = performance.now();
    //map = [face_map, 2, 2];
    //scale = 1;
    //for (let i = 0; i < sub_time; i++) {
    //    scale = scale / (2 ** rough);
    //    map = subdivide(...map, scale);
    //}
    //const t_end = performance.now();
    //console.log(`use ${t_end - t_start}ms to sub ${sub_time} times`);
    //GLViewer.plot_array(...map);
    
    //const seed = 1;
    //const sub_time = 8;
    //const rough = 1;
    //
    //const rand = Math.srandom;
    //const set_seed = Math.set_seed;
    //const rsubdivide = Lib.rsubdivide;
    //set_seed(seed);
    //const face_map = new Float64Array(4);
    //face_map.forEach((v, i) => face_map[i] = rand());
    //let scale = 1, map;
    //const t_start = performance.now();
    //for (let m = 0; m < 20; m++) {
    //    map = rsubdivide(face_map, scale, rough, sub_time);
    //}
    //const t_end = performance.now();
    //console.log(`use ${t_end - t_start}ms to sub ${sub_time} times`);
    //GLViewer.plot_array(...map);
    
    sub_to_target(1, sub_time, seed, rough, 1000);
    
    animate();
};

if (window.LIB_INITED) window.onlibinit();

function sub_to_target(cur_sub, tar_sub, seed, rough, dtime) {
    sub_and_view(seed, rough, cur_sub);
    cur_sub += 1;
    if (cur_sub > tar_sub) return;
    setTimeout(sub_to_target, dtime, cur_sub, tar_sub, seed, rough, dtime);
}

function sub_and_view(seed, rough, sub_time) {
    const rand = Math.srandom;
    const set_seed = Math.set_seed;
    const subdivide = Lib.subdivide;
    set_seed(seed);
    const face_map = new Float64Array(4);
    face_map.forEach((v, i) => face_map[i] = rand());
    let map, scale;
    map = [face_map, 2, 2];
    scale = 1;
    for (let i = 0; i < sub_time; i++) {
        scale = scale / (2 ** rough);
        map = subdivide(...map, scale);
    }
    GLViewer.replot_array(...map);
}