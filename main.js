"use strict";

window.onlibinit = function() {
    let seed = 2;
    let sub_time = 6;
    const flat = (new Array(9)).fill(0.5);
    const dtime = 1000;
    const fn_r = (x, y) => 1;
    const fn_t = (x, y) => 0;
    
    Lui.create("title", "监控");
    const monitor_fps = Lui.create("canvas", "FPS");
    const fps_data = (new Array(120)).fill(0);
    monitor_fps.exec("set_state", "60");
    monitor_fps.graph_chart = fps_data;
    monitor_fps.exec("update");
    const fps_batch = 32;
    let fps_counter = 0;
    let fps_sum = 0;
    GLViewer.listen("redraw", (dt) => {
        fps_counter++;
        fps_sum += dt;
        if (fps_counter < fps_batch) return;
        const fps = (fps_counter * 1000) / fps_sum;
        monitor_fps.exec("set_state", Math.round(fps).toString());
        const per = fps / 70;
        fps_data.push(per);
        fps_data.shift();
        monitor_fps.exec("update");
        fps_counter = 0;
        fps_sum = 0;
    });
    
    Lui.create("title", "控制");
    const control_reset_view = Lui.create("button", "重置视角");
    control_reset_view.listen("click", () => GLViewer.controller.reset());
    const control_switch_redraw = Lui.create("switch", "保持重绘", {state: false});
    control_switch_redraw.listen("change", (v) => GLViewer.keep_redraw = v);
    const control_seed = Lui.create("number", "种子", {
        min: 0,
        max: Infinity,
        value: seed,
        round: 1
    });
    control_seed.listen("change", (v) => {seed = v; redraw()});
    const control_sub_time = Lui.create("slider", "细分次数", {
        min: 1,
        max: 8,
        value: sub_time,
        round: 1
    });
    control_sub_time.listen("change", (v) => {sub_time = v; redraw()});
    const control_flat_curve = Lui.create("equalizer", "平滑曲线", {
        range: [-1, 1],
        values: flat,
        descs: ["1","2","3","4","5","6","7","8","9+"],
        round: 0.1
    });
    control_flat_curve.listen("change", (d) => {redraw()});
    
    const redraw = () => {
        sub_and_view(seed, flat, fn_r, fn_t, sub_time);
    };
    redraw();
    
    animate();
};

if (window.LIB_INITED) window.onlibinit();

function sub_and_view(seed, flat, fn_r, fn_t, sub_time) {
    const rand = Math.srandom;
    const set_seed = Math.set_seed;
    const subdivide = Lib.subdivide;
    set_seed(seed);
    const face_map = new Float64Array(4);
    face_map.fill(0.5);
    //face_map.forEach((v, i) => face_map[i] = rand());
    let map, scale;
    map = [face_map, 2, 2];
    scale = 1;
    for (let i = 0; i < sub_time; i++) {
        scale = scale * (1 - flat[i]);
        map = subdivide(...map, scale, fn_r, fn_t);
    }
    GLViewer.replot_array(...map);
}