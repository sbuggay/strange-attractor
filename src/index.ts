import { Mesh, SphereGeometry, MeshBasicMaterial, Scene, PerspectiveCamera, WebGLRenderer} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { MeshLine, MeshLineMaterial } from 'three.meshline';
import { Color, Fog, Vector3 } from 'three';

import ObjectPool from './ObjectPool';
import { createGui } from './Gui';


const buffer: Vector3[] = [];
const vectorPool = new ObjectPool<Vector3>(10_000, () => new Vector3());
const scene = new Scene();
scene.fog = new Fog(new Color(0x0), 0, 1000);

const camera = new PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
camera.position.z = 75;

const renderer = new WebGLRenderer({
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
    color: new Color(0xffffff),
    background: new Color(0x0),
    start: { x: 0, y: 0, z: 0 },
    linewidth: 0.2,
    showFixedPoints: true,
    line: new MeshLine(),
}

// Add fixed points
const geometry = new SphereGeometry(0.5, 16, 16);
const sphere = new Mesh(geometry, new MeshBasicMaterial({ color: 0x6289cc }));
sphere.position.set(-Math.sqrt(parameters.b - 1) * Math.sqrt(parameters.c), -Math.sqrt(parameters.b - 1) * Math.sqrt(parameters.c), parameters.b - 1);
scene.add(sphere);

const sphere2 = new Mesh(geometry, new MeshBasicMaterial({ color: 0xbecc62 }));
sphere2.position.set(Math.sqrt(parameters.b - 1) * Math.sqrt(parameters.c), Math.sqrt(parameters.b - 1) * Math.sqrt(parameters.c), parameters.b - 1);
scene.add(sphere2);

const center = sphere2.position.clone().add(sphere.position).divideScalar(2);
controls.target = center;

const [pane, fpsGraph] = createGui(parameters, {
    play: (button) => {
        parameters.playing = !parameters.playing;
        button.title = parameters.playing ? 'pause' : 'play';
    },
    reset: () => {
        x = 0.1;
        y = 0;
        z = 0;
        buffer.splice(0, buffer.length);
    }
});

const material = new MeshLineMaterial({
    color: parameters.color,
    lineWidth: parameters.linewidth,
});
const line = new MeshLine();
const mesh = new Mesh(line, material);
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

function generateLine(points: Vector3[],): Mesh {
    line.setPoints(points);
    mesh.geometry = line;
    return mesh;
}

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

controls.autoRotate = true;

renderer.domElement.addEventListener('mousedown', () => {
    controls.autoRotate = false;
});

const animate: FrameRequestCallback = (time) => {
    controls.update();

    sphere.visible = parameters.showFixedPoints;
    sphere2.visible = parameters.showFixedPoints;
    
    if (!parameters.playing) return;
    const { iterations, a, b, c, dt, background, segments } = parameters;
    
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
    
    generateLine(buffer);
    render();
    fpsGraph.end();

    requestAnimationFrame(animate);
}

function render() {
    renderer.render(scene, camera)
}

animate(0)