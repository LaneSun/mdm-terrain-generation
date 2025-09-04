"use strict";

const create_elem = (name, ...classes) => {
    const elem = document.createElement(name);
    elem.classList.add(...classes);
    return elem;
};

const box_elem = document.getElementById("control-container");
const calc_percent = (m, p, n) => (p - m) / (n - m);
const calc_map = (m, p, n) => m + (n - m) * p;
const calc_round = (v, r) => Math.fround(Math.round(v / r) * r * 10000) / 10000;
const calc_between = (m, v, n) => Math.max(m, Math.min(n, v));
const Elems = {
    "title": {
        create: (scope, text, style = []) => {
            const elem = create_elem("div", "lui-title", ...style);
            scope.main = elem;
            elem.textContent = text;
        },
        attach: (scope, elem) => {
            elem.append(scope.main);
        },
        disattach: (scope) => {
            scope.main.remove();
        },
        "set_text": (scope, str) => {
            scope.main.textContent = str;
        }
    },
    "button": {
        create: (scope, text, style = []) => {
            const elem = create_elem("div", "lui-button", ...style);
            scope.main = elem;
            elem.textContent = text;
        },
        attach: (scope, elem) => {
            elem.append(scope.main);
            scope.main_handle = () => {scope.trigger("click")};
            scope.main.addEventListener("click", scope.main_handle);
        },
        disattach: (scope) => {
            scope.main.removeEventListener("click", scope.main_handle);
            scope.main_handle = null;
            scope.main.remove();
        },
        "set_text": (scope, str) => {
            scope.main.textContent = str;
        }
    },
    "switch": {
        create: (scope, text, {state}, style = []) => {
            scope.value = state;
            const elem_main = create_elem("div", "lui-switch-main", ...style);
            const elem_state = create_elem("div", "lui-switch-state", ...style);
            elem_main.append(elem_state);
            scope.main = elem_main;
            scope.state = elem_state;
            elem_main.setAttribute("lui_text", text);
            if (state) elem_state.classList.add("active");
        },
        attach: (scope, elem) => {
            elem.append(scope.main);
            scope.main_handle = () => {
                scope.value = !scope.value;
                if (scope.value) {
                    scope.state.classList.add("active");
                } else {
                    scope.state.classList.remove("active");
                }
                scope.trigger("change", scope.value);
            };
            scope.main.addEventListener("click", scope.main_handle);
        },
        disattach: (scope) => {
            scope.main.removeEventListener("click", scope.main_handle);
            scope.main_handle = null;
            scope.main.remove();
        },
        "set_text": (scope, str) => {
            scope.main.textContent = str;
        }
    },
    "number": {
        create: (scope, text, {min, max, value, round}, style = []) => {
            scope.min = min;
            scope.max = max;
            scope.value = calc_round(value, round);
            scope.round = round;
            const elem_main = create_elem("div", "lui-number-main", ...style);
            const elem_num = create_elem("input", "lui-number-num");
            const elem_plus = create_elem("div", "lui-number-plus");
            const elem_sub = create_elem("div", "lui-number-sub");
            elem_main.append(elem_num, elem_plus, elem_sub);
            scope.main = elem_main;
            scope.num = elem_num;
            scope.plus = elem_plus;
            scope.sub = elem_sub;
            elem_main.setAttribute("lui_text", text);
            elem_num.value = scope.value.toString();
        },
        attach: (scope, elem) => {
            elem.append(scope.main);
            scope.plus_handle = () => {
                const value = calc_round(calc_between(scope.min, scope.value + scope.round, scope.max), scope.round);
                if (scope.value !== value) {
                    scope.value = value;
                    scope.trigger("change", value);
                    scope.num.value = value.toString();
                }
            };
            scope.sub_handle = () => {
                const value = calc_round(calc_between(scope.min, scope.value - scope.round, scope.max), scope.round);
                if (scope.value !== value) {
                    scope.value = value;
                    scope.trigger("change", value);
                    scope.num.value = value.toString();
                }
            };
            scope.change_handle = () => {
                const src_n = parseFloat(scope.num.value);
                const src_v = src_n !== NaN ? src_n : scope.min;
                const value = calc_round(calc_between(scope.min, src_v, scope.max), scope.round);
                if (scope.value !== value) {
                    scope.value = value;
                    scope.trigger("change", value);
                    scope.num.value = value.toString();
                }
            };
            scope.plus.addEventListener("click", scope.plus_handle);
            scope.sub.addEventListener("click", scope.sub_handle);
            scope.num.addEventListener("change", scope.change_handle);
        },
        disattach: (scope) => {
            scope.plus.removeEventListener("click", scope.plus_handle);
            scope.sub.removeEventListener("click", scope.sub_handle);
            scope.num.removeEventListener("change", scope.change_handle);
            scope.plus_handle = null;
            scope.sub_handle = null;
            scope.change_handle = null;
            scope.main.remove();
        },
        "set_value": (scope, value) => {
            value = calc_round(value, scope.round);
            scope.num.value = value.toString();
            scope.value = value;
        }
    },
    "slider": {
        create: (scope, text, {min, max, value, round}, style = []) => {
            scope.min = min;
            scope.max = max;
            scope.value = calc_round(value, round);
            scope.round = round;
            const elem_main = create_elem("div", "lui-slider-main", ...style);
            const elem_bar = create_elem("div", "lui-slider-bar");
            const elem_handle = create_elem("div", "lui-slider-handle");
            elem_main.append(elem_bar, elem_handle);
            scope.main = elem_main;
            scope.bar = elem_bar;
            scope.handle = elem_handle;
            elem_main.setAttribute("lui_text", text);
            elem_main.style.setProperty("--lui-progress", calc_percent(min, scope.value, max));
            elem_handle.setAttribute("lui_value", scope.value.toString());
        },
        attach: (scope, elem) => {
            elem.append(scope.main);
            scope.main_handle = (e) => {
                if (e.buttons !== 1) return;
                const cx = e.clientX;
                const rect = scope.bar.getClientRects()[0];
                const min = rect.left - 39;
                const max = rect.right - 39;
                const per = Math.max(0, Math.min(1, calc_percent(min, cx, max)));
                let value = calc_map(scope.min, per, scope.max);
                value = calc_round(value, scope.round);
                if (scope.value === value) return;
                scope.exec("set_value", value);
                scope.trigger("change", value);
            };
            scope.main.addEventListener("mousemove", scope.main_handle);
            scope.main.addEventListener("mousedown", scope.main_handle);
        },
        disattach: (scope) => {
            scope.main.removeEventListener("mousemove", scope.main_handle);
            scope.main.removeEventListener("mousedown", scope.main_handle);
            scope.main_handle = null;
            scope.main.remove();
        },
        "set_value": (scope, value) => {
            scope.main.style.setProperty("--lui-progress", calc_percent(scope.min, value, scope.max));
            scope.handle.setAttribute("lui_value", value.toString());
            scope.value = value;
        }
    },
    "canvas": {
        create: (scope, text, style = []) => {
            const elem_main = create_elem("div", "lui-canvas-main", ...style);
            const elem_cav = create_elem("canvas", "lui-canvas-cav");
            const elem_state = create_elem("div", "lui-canvas-state");
            elem_main.append(elem_cav, elem_state);
            elem_main.setAttribute("lui_text", text);
            scope.main = elem_main;
            scope.cav = elem_cav;
            scope.state = elem_state;
            scope.ctx = elem_cav.getContext("2d");
            scope.graph_h_line = false;
            scope.graph_chart = false;
        },
        attach: (scope, elem) => {
            elem.append(scope.main);
            scope.resize_handle = () => {
                scope.cav.width = scope.main.clientWidth;
                scope.cav.height = scope.main.clientHeight;
            };
            scope.main.addEventListener("resize", scope.resize_handle);
            scope.resize_handle();
            scope.exec("update");
        },
        disattach: (scope) => {
            scope.main.removeEventListener("resize", scope.resize_handle);
            scope.resize_handle = null;
            scope.main.remove();
        },
        update: (scope) => {
            const {width, height} = scope.cav;
            const ctx = scope.ctx;
            ctx.clearRect(0, 0, width, height);
            if (scope.graph_chart !== false) {
                const chart = scope.graph_chart;
                ctx.lineWidth = 4;
                ctx.strokeStyle = "#0055aa";
                ctx.fillStyle = "#003366";
                ctx.lineJoin = "round";
                ctx.beginPath();
                ctx.moveTo(-2, calc_map(height - 2, chart[0], 2));
                for (let i = 0; i < chart.length; i++) {
                    ctx.lineTo(calc_map(1, i / (chart.length - 1), width - 1), calc_map(height - 2, chart[i], 2))
                }
                ctx.lineTo(width + 2, calc_map(height - 2, chart[chart.length-1], 2));
                ctx.lineTo(width + 2, height + 2);
                ctx.lineTo(-2, height + 2);
                ctx.closePath();
                ctx.stroke();
                ctx.fill();
            }
            if (scope.graph_h_line !== false) {
                ctx.lineWidth = 2;
                ctx.strokeStyle = "#0066cc";
                ctx.beginPath();
                ctx.moveTo(0, calc_map(height - 2, scope.graph_h_line, 2));
                ctx.lineTo(width, calc_map(height - 2, scope.graph_h_line, 2));
                ctx.stroke();
                //ctx.lineWidth = 1;
                //ctx.strokeStyle = "#002244";
                //ctx.beginPath();
                //ctx.moveTo(0, calc_map(height, scope.graph_h_line, 4));
                //ctx.lineTo(width, calc_map(height, scope.graph_h_line, 4));
                //ctx.stroke();
            }
        },
        "set_state": (scope, text) => {
            scope.state.textContent = text;
        }
    },
    "equalizer": {
        create: (scope, text, {range, values, descs, round}, style = []) => {
            const elem_main = create_elem("div", "lui-equalizer-main", ...style);
            const elem_cav = create_elem("canvas", "lui-equalizer-cav");
            elem_main.append(elem_cav);
            elem_main.setAttribute("lui_text", text);
            scope.main = elem_main;
            scope.cav = elem_cav;
            scope.ctx = elem_cav.getContext("2d");
            scope.range = range;
            scope.values = values;
            scope.descs = descs;
            scope.round = round;
            scope.active = null;
            scope.lock = false;
        },
        attach: (scope, elem) => {
            elem.append(scope.main);
            scope.resize_handle = () => {
                scope.cav.width = scope.main.clientWidth;
                scope.cav.height = scope.main.clientHeight;
            };
            scope.hover_handle = (e) => {
                if (scope.lock) return;
                const {width, height} = scope.cav;
                const count = scope.values.length;
                const gap = width/(count+1);
                const h_min = 0;
                const h_max = height;
                const rect = scope.cav.getClientRects()[0];
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const active = scope.active;
                if (h_min < y && y < h_max && gap/2 < x && x < width-gap/2) {
                    scope.active = 0|((x - gap/2) / gap);
                } else {
                    scope.active = null;
                }
                if (active !== scope.active) {
                    scope.exec("update");
                }
            };
            scope.exit_handle = () => {
                if (scope.active !== null) {
                    scope.active = null;
                    scope.lock = false;
                    scope.exec("update");
                }
            };
            scope.catch_handle = (e) => {
                if (e.button !== 0) return;
                const {width, height} = scope.cav;
                const count = scope.values.length;
                const gap = width/(count+1);
                const h_min = 0;
                const h_max = height;
                const rect = scope.cav.getClientRects()[0];
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const active = scope.active;
                if (h_min < y && y < h_max && gap/2 < x && x < width-gap/2) {
                    scope.active = 0|((x - gap/2) / gap);
                    scope.lock = true;
                    scope.modify_handle(e);
                }
                if (active !== scope.active) {
                    scope.exec("update");
                }
            };
            scope.uncatch_handle = (e) => {
                if (e.button !== 0) return;
                scope.lock = false;
                scope.hover_handle(e);
            };
            scope.modify_handle = (e) => {
                if (!scope.lock || scope.active === null) return;
                const {width, height} = scope.cav;
                const count = scope.values.length;
                const gap = width/(count+1);
                const h_min = 30 + 32;
                const h_max = height - 40;
                const rect = scope.cav.getClientRects()[0];
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const value = calc_round(calc_map(scope.range[0],calc_between(0,calc_percent(h_max,y,h_min),1),scope.range[1]), scope.round);
                if (scope.values[scope.active] !== value) {
                    scope.values[scope.active] = value;
                    scope.trigger("change", scope.values);
                    scope.exec("update");
                }
            };
            scope.main.addEventListener("resize", scope.resize_handle);
            scope.main.addEventListener("mousemove", scope.hover_handle);
            scope.main.addEventListener("mousemove", scope.modify_handle);
            scope.main.addEventListener("mouseleave", scope.exit_handle);
            scope.main.addEventListener("mousedown", scope.catch_handle);
            scope.main.addEventListener("mouseup", scope.uncatch_handle);
            scope.resize_handle();
            scope.exec("update");
        },
        disattach: (scope) => {
            scope.main.removeEventListener("resize", scope.resize_handle);
            scope.main.removeEventListener("mousemove", scope.hover_handle);
            scope.main.removeEventListener("mousemove", scope.modify_handle);
            scope.main.removeEventListener("mouseleave", scope.exit_handle);
            scope.main.removeEventListener("mousedown", scope.catch_handle);
            scope.main.removeEventListener("mouseup", scope.uncatch_handle);
            scope.resize_handle = null;
            scope.hover_handle = null;
            scope.modify_handle = null;
            scope.exit_handle = null;
            scope.catch_handle = null;
            scope.uncatch_handle = null;
            scope.main.remove();
        },
        update: (scope) => {
            const {width, height} = scope.cav;
            const ctx = scope.ctx;
            ctx.lineCap = "round";
            const count = scope.values.length;
            ctx.clearRect(0, 0, width, height);
            const gap = width/(count+1);
            const h_min = 30 + 32;
            const h_max = height - 40;
            ctx.lineWidth = 8;
            ctx.strokeStyle = "#1a1a1a";
            for (let i = 0; i < count; i++) {
                const x = (i + 1) * gap;
                if (i === scope.active) {
                    ctx.lineWidth = 12;
                    ctx.strokeStyle = "#333333";
                } else {
                    ctx.lineWidth = 8;
                    ctx.strokeStyle = "#1a1a1a";
                }
                ctx.beginPath();
                ctx.moveTo(x, h_min);
                ctx.lineTo(x, h_max);
                ctx.stroke();
            }
            ctx.lineWidth = 4;
            ctx.strokeStyle = "#004488";
            ctx.beginPath();
            ctx.moveTo(gap, calc_map(h_max, calc_percent(scope.range[0], scope.values[0], scope.range[1]), h_min));
            for (let i = 1; i < count; i++) {
                const x = (i + 1) * gap;
                const lh = calc_map(h_max, calc_percent(scope.range[0], scope.values[i - 1], scope.range[1]), h_min);
                const h = calc_map(h_max, calc_percent(scope.range[0], scope.values[i], scope.range[1]), h_min);
                ctx.bezierCurveTo(x - gap/3, lh, x - gap/3*2, h, x, h);
            }
            ctx.stroke();
            ctx.font = "14px sans-serif";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillStyle = "#888888";
            const h_text_t = 30 + 16;
            const h_text_b = height - 20;
            for (let i = 0; i < count; i++) {
                const x = (i + 1) * gap;
                const h = calc_map(h_max, calc_percent(scope.range[0], scope.values[i], scope.range[1]), h_min);
                ctx.beginPath();
                ctx.moveTo(x, h);
                ctx.lineTo(x, h);
                if (i === scope.active) {
                    ctx.lineWidth = 20;
                } else {
                    ctx.lineWidth = 16;
                }
                ctx.strokeStyle = "#111111";
                ctx.stroke();
                if (i === scope.active) {
                    ctx.lineWidth = 16;
                } else {
                    ctx.lineWidth = 12;
                }
                ctx.strokeStyle = "#0066cc";
                ctx.stroke();
                ctx.fillText(calc_round(scope.values[i], scope.round).toString(), x, h_text_t, gap);
                ctx.fillText(scope.descs[i], x, h_text_b, gap);
            }
        }
    }
};

class ElemScope extends Eventer {
    constructor(type) {
        super();
        this.type = type;
    }
    exec(method, ...args) {
        return Elems[this.type][method](this, ...args);
    }
}

globalThis.Lui = {};

Lui.create = (type, ...args) => {
    const scope = new ElemScope(type);
    scope.exec("create", ...args);
    scope.exec("attach", box_elem);
    return scope;
};
