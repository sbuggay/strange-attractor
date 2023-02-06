import * as three from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { Pane } from 'tweakpane';
import { MeshLine, MeshLineMaterial } from 'three.meshline';
import { Color, Fog, Vector3 } from 'three';

import ObjectPool from './ObjectPool';
import { createGui } from './Gui';

const scene = new three.Scene();
scene.fog = new Fog(new Color(0x0), 0, 1000);

const camera = new three.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
camera.position.z = 100;

const renderer = new three.WebGLRenderer({
    antialias: true
});

renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

const controls = new OrbitControls(camera, renderer.domElement)

window.addEventListener('resize', onWindowResize, false)
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    render();
}

const parameters = {
    playing: true,
    iterations: 5000,
    a: 10,
    b: 28,
    c: 8.0 / 3.0,
    dt: 0.02,
    segments: 3,
    color: new three.Color(0xffffff),
    background: new three.Color(0x0),
    start: { x: 0, y: 0, z: 0 },
    linewidth: 0.2,
    line: new MeshLine(),
}

const geometry = new three.SphereGeometry(0.5, 16, 16);
const sphere = new three.Mesh(geometry, new three.MeshBasicMaterial({ color: 0x6289cc }));
sphere.position.set(-Math.sqrt(parameters.b - 1) * Math.sqrt(parameters.c), -Math.sqrt(parameters.b - 1) * Math.sqrt(parameters.c), parameters.b - 1);
scene.add(sphere);

const sphere2 = new three.Mesh(geometry, new three.MeshBasicMaterial({ color: 0xbecc62 }));
sphere2.position.set(Math.sqrt(parameters.b - 1) * Math.sqrt(parameters.c), Math.sqrt(parameters.b - 1) * Math.sqrt(parameters.c), parameters.b - 1);
scene.add(sphere2);

const [pane, fpsGraph] = createGui(parameters);

const material = new MeshLineMaterial({
    color: parameters.color,
    lineWidth: parameters.linewidth,
});
const line = new MeshLine();
const mesh = new three.Mesh(line, material);
scene.add(mesh);

pane.on('change', (e) => {
    if (e.presetKey === 'color') {
        mesh.material.color = e.value;
    }
    else if (e.presetKey === 'linewidth') {
        mesh.material.lineWidth = e.value;
    }

    sphere.position.set(-Math.sqrt(parameters.b - 1) * Math.sqrt(parameters.c), -Math.sqrt(parameters.b - 1) * Math.sqrt(parameters.c), parameters.b - 1);
    sphere2.position.set(Math.sqrt(parameters.b - 1) * Math.sqrt(parameters.c), Math.sqrt(parameters.b - 1) * Math.sqrt(parameters.c), parameters.b - 1);
});

function generateLine(points: three.Vector3[],): three.Mesh {
    line.setPoints(points);
    mesh.geometry = line;
    return mesh;
}

let lastTime = 0;
let x = 0.01;
let y = 0;
let z = 0;

document.addEventListener("keydown", onDocumentKeyDown, false);
function onDocumentKeyDown(event: KeyboardEvent) {
    switch (event.code) {
        case 'Space':
            parameters.playing = !parameters.playing;
            event.preventDefault();
            pane.refresh();
            break;
    }
};

const buffer: three.Vector3[] = [];
const vectorPool = new ObjectPool<three.Vector3>(10_000, () => new three.Vector3());

const animate: FrameRequestCallback = (time) => {
    // const delta = time - lastTime;
    lastTime = time;
    requestAnimationFrame(animate)
    render()

    if (!parameters.playing) return;
    const { iterations, a, b, c, dt, color, background, linewidth, segments } = parameters;

    fpsGraph.begin();

    scene.background = background;

    for (let i = 0; i < segments; i++) {
        if (buffer.length >= iterations) {
            buffer.shift();
        }

        x += (a * (y - x)) * dt / segments;
        y += (x * (b - z) - y) * dt / segments;
        z += (x * y - c * z) * dt / segments;
        const v = vectorPool.get();
        v.set(x, y, z);
        buffer.push(v);
    }

    const line = generateLine(buffer);

    fpsGraph.end();
}

function render() {
    renderer.render(scene, camera)
}

animate(0)