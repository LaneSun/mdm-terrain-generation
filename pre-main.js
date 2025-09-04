"use strict";

const SIZE = 50;

const calc_mapin = (m, p, n) => m + (n - m) * p;
const calc_mapfrom = (m, p, n) => (p - m) / (n - m);
const calc_1_2eX = x => 1 / (2 ** x);
const calc_vec_mapin = (m, p, n) => m.multiplyScalar(1 - p).add(n.multiplyScalar(p));

const canvas_gl = document.getElementById("layer-gl");
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x222222);
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({canvas: canvas_gl, antialias: true});
renderer.setPixelRatio( window.devicePixelRatio );
renderer.setSize(window.innerWidth, window.innerHeight);

//const grid_helper = new THREE.GridHelper(SIZE, 200 , 0xcccccc, 0xcccccc);
//scene.add(grid_helper);

const GLViewer = {};
GLViewer.active_frame = 50;
GLViewer.active = GLViewer.active_frame;
GLViewer.group = new THREE.Group();
scene.add(GLViewer.group);
GLViewer.GCObjects = new Set();
GLViewer.NodeObjects = new Set();
GLViewer.inactive_loop = () => GLViewer.active = Math.max(0, GLViewer.active - 1);
GLViewer.is_active = () => GLViewer.active > 0;
GLViewer.do_active = () => GLViewer.active = GLViewer.active_frame;
GLViewer.line_material = new THREE.LineBasicMaterial({
    color: 0xffffff,
    depthTest: true,
    transparent: true,
    opacity: 0.25
});
GLViewer.shader_material = new THREE.ShaderMaterial({
    vertexShader: `
        varying vec4 v_color;
        
        void main() {
            float h = floor(position.y / 2.5) * 0.3;
            //v_color = vec4(min(1.0, max(0.0, h * 0.1 - 0.5)), min(1.0, max(0.0, h * 0.1 - 1.0)), min(1.0, h * 0.1), 1);
            v_color = vec4(min(1.0, max(0.0, h - 0.33)), min(1.0, max(0.0, h - 0.67)), min(1.0, h), 1);
            gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
        }
    `,
    fragmentShader: `
        varying vec4 v_color;
        
        void main() {
            gl_FragColor = v_color;
        }
    `
});
GLViewer.addObjs = (target, ...objs) => {for (const obj of objs) target.add(obj)};
GLViewer.clear = () => {
    for (const obj of [...GLViewer.NodeObjects]) obj.removeFromParent();
    for (const obj of [...GLViewer.GCObjects]) obj.dispose();
    GLViewer.NodeObjects.clear();
    GLViewer.GCObjects.clear();
    GLViewer.do_active();
};
GLViewer.plot_array = (ary, width, height, attr = {}) => {
    const geometry = new THREE.BufferGeometry();
    const vertices = GLViewer.parse_face(GLViewer.parse_array(ary, width, height, attr), width, height);
    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    const wireframe = new THREE.WireframeGeometry(geometry);
    const line = new THREE.LineSegments(wireframe, GLViewer.line_material);
    line.translateY(0.01);
    const mesh = new THREE.Mesh(geometry, GLViewer.shader_material);
    GLViewer.group.add(mesh, line);
    GLViewer.NodeObjects.add(mesh, line);
    GLViewer.GCObjects.add(geometry, wireframe);
    GLViewer.do_active();
};
GLViewer.replot_array = (ary, width, height, attr = {}) => {
    const geometry = new THREE.BufferGeometry();
    const vertices = GLViewer.parse_face(GLViewer.parse_array(ary, width, height, attr), width, height);
    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    const wireframe = new THREE.WireframeGeometry(geometry);
    const line = new THREE.LineSegments(wireframe, GLViewer.line_material);
    line.translateY(0.01);
    const mesh = new THREE.Mesh(geometry, GLViewer.shader_material);
    GLViewer.group.add(mesh, line);
    GLViewer.clear();
    GLViewer.addObjs(GLViewer.NodeObjects, mesh, line);
    GLViewer.addObjs(GLViewer.GCObjects, geometry, wireframe);
    GLViewer.do_active();
};
GLViewer.parse_array = (ary, width, height, {x_min, x_max, y_min, y_max, z_min, z_max, v_min, v_max}) => {
    x_min = x_min ?? -SIZE/2;
    x_max = x_max ?? SIZE/2;
    y_min = y_min ?? -SIZE/2;
    y_max = y_max ?? SIZE/2;
    z_min = z_min ?? 0;
    z_max = z_max ?? SIZE/2;
    v_min = v_min ?? 0;
    v_max = v_max ?? 1;
    const buffer = new Float32Array(width * height * 3);
    for (let x = 0; x < width; x++) {
        for (let y = 0; y < height; y++) {
            const i = (x + width * y) * 3;
            buffer[i] = calc_mapin(x_min, x / (width - 1), x_max);
            buffer[i + 1] = calc_mapin(z_min, calc_mapfrom(v_min, ary[x + width * y], v_max), z_max);
            buffer[i + 2] = calc_mapin(y_min, y / (height - 1), y_max);
        }
    }
    return buffer;
};
GLViewer.parse_face = (ary, width, height) => {
    const ws = width - 1;
    const hs = height - 1
    const buffer = new Float32Array(ws * hs * 18);
    for (let x = 0; x < width - 1; x++) {
        for (let y = 0; y < height - 1; y++) {
            const i = (x + ws * y) * 18;
            const ri = (x + width * y) * 3;
            buffer[i] = ary[ri];
            buffer[i + 1] = ary[ri + 1];
            buffer[i + 2] = ary[ri + 2];
            buffer[i + 3] = ary[ri + width * 3];
            buffer[i + 4] = ary[ri + width * 3 + 1];
            buffer[i + 5] = ary[ri + width * 3 + 2];
            buffer[i + 6] = ary[ri + 3];
            buffer[i + 7] = ary[ri + 4];
            buffer[i + 8] = ary[ri + 5];
            buffer[i + 9] = ary[ri + width * 3];
            buffer[i + 10] = ary[ri + width * 3 + 1];
            buffer[i + 11] = ary[ri + width * 3 + 2];
            buffer[i + 12] = ary[ri + width * 3 + 3];
            buffer[i + 13] = ary[ri + width * 3 + 4];
            buffer[i + 14] = ary[ri + width * 3 + 5];
            buffer[i + 15] = ary[ri + 3];
            buffer[i + 16] = ary[ri + 4];
            buffer[i + 17] = ary[ri + 5];
        }
    }
    return buffer;
};
GLViewer.parse_line = (ary, width, height) => {
    const ws = width - 1;
    const hs = height - 1
    const buffer = new Float32Array(ws * hs * 12);
    for (let x = 0; x < width - 1; x++) {
        for (let y = 0; y < height - 1; y++) {
            const i = (x + ws * y) * 12;
            const ri = (x + width * y) * 3;
            buffer[i] = ary[ri];
            buffer[i + 1] = ary[ri + 1];
            buffer[i + 2] = ary[ri + 2];
            buffer[i + 3] = ary[ri + 3];
            buffer[i + 4] = ary[ri + 4];
            buffer[i + 5] = ary[ri + 5];
            buffer[i + 6] = ary[ri];
            buffer[i + 7] = ary[ri + 1];
            buffer[i + 8] = ary[ri + 2];
            buffer[i + 9] = ary[ri + width * 3];
            buffer[i + 10] = ary[ri + width * 3 + 1];
            buffer[i + 11] = ary[ri + width * 3 + 2];
        }
    }
    return buffer;
};

class Controller extends Eventer {
    constructor() {
        super();
        this.anim_time = 40;
        this.h_arc = 0;
        this.v_arc = - 0.8;
        this.r_dis = 80;
        this.zoom = 0;
        this.target = new THREE.Vector3(0, 0, 0);
        this.t_h_arc = this.h_arc;
        this.t_v_arc = this.v_arc;
        this.t_zoom = this.zoom;
        this.t_target = this.target;
    }
    update(dt) {
        const np = calc_1_2eX(dt / this.anim_time);
        this.t_h_arc = calc_mapin(this.h_arc, np, this.t_h_arc);
        this.t_v_arc = calc_mapin(this.v_arc, np, this.t_v_arc);
        this.t_zoom = calc_mapin(this.zoom, np, this.t_zoom);
        this.t_target = calc_vec_mapin(this.target, np, this.t_target);
    }
    apply_camera(camera) {
        const eul = new THREE.Euler(this.t_v_arc, this.t_h_arc, 0, "YZX");
        let dis = new THREE.Vector3(0, 0, calc_1_2eX(this.t_zoom) * this.r_dis);
        dis.applyEuler(eul).sub(this.t_target);
        camera.setRotationFromEuler(eul);
        camera.position.x = dis.x;
        camera.position.y = dis.y;
        camera.position.z = dis.z;
    }
    change(h, v, z) {
        this.h_arc += h;
        this.v_arc += v;
        this.zoom += z;
        GLViewer.do_active();
    }
    pan(x, y) {
        const eul = new THREE.Euler(this.t_v_arc, this.t_h_arc, 0, "YZX");
        GLViewer.do_active();
    }
}

const controller = new Controller();

function animate() {
    //controller.h_arc += 0.01;
    //controller.v_arc += 0.01;
    if (GLViewer.is_active()) {
        controller.update(20);
        controller.apply_camera(camera);
        renderer.render(scene, camera);
        GLViewer.inactive_loop();
    }
    requestAnimationFrame(animate);
}

function render() {
    controller.apply_camera(camera);
    renderer.render(scene, camera);
}

//animate();

document.addEventListener("contextmenu", (e) => {
    e.preventDefault();
    return false;
})

document.addEventListener("mousemove", (e) => {
    const mx = e.movementX;
    const my = e.movementY;
    if (e.buttons === 2) {
        controller.change(-mx/100, -my/100, 0);
    }
});

document.addEventListener("wheel", (e) => {
    const dy = e.deltaY;
    controller.change(0, 0, -dy/400);
});