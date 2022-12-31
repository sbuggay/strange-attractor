import * as three from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import Stats from 'three/examples/jsm/libs/stats.module'
import { Pane } from 'tweakpane';
import { MeshLine, MeshLineMaterial, MeshLineRaycast } from 'three.meshline';

const scene = new three.Scene()

const camera = new three.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
)
camera.position.z = 100;

const renderer = new three.WebGLRenderer()
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

const controls = new OrbitControls(camera, renderer.domElement)
//controls.addEventListener('change', render)

window.addEventListener('resize', onWindowResize, false)
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
    render()
}

const stats = Stats()
document.body.appendChild(stats.dom)

function createGui(parameters): Pane {
    const pane = new Pane();
    const simulation = pane.addFolder({
        title: 'simulation'
    })
    simulation.addInput(parameters, 'iterations', {
        min: 0,
        max: 10000,
        step: 1
    });
    simulation.addInput(parameters, 'a', {
        min: 0,
        max: 50
    });
    simulation.addInput(parameters, 'b', {
        min: 0,
        max: 50
    });
    simulation.addInput(parameters, 'c', {
        min: 0,
        max: 50
    });

    const display = pane.addFolder({
        title: 'display'
    });

    display.addInput(parameters, 'color', {
        color: {
            type: 'float'
        }
    })

    display.addInput(parameters, 'linewidth', {
        min: 0,
        max: 2
    });

    return pane;
}

const parameters = {
    iterations: 1000,
    a: 10,
    b: 28,
    c: 8.0 / 3.0,
    dt: 0.001,
    color: new three.Color(0xffffff),
    linewidth: 0.15
}

const pane = createGui(parameters);
pane.on('change', generateAttractor)
generateAttractor();

function generateAttractor() {
    scene.clear();

    const { a, b, c, dt, color, linewidth } = parameters;

    let x = 0.01;
    let y = 0;
    let z = 0;
    const points: three.Vector3[] = [];

    for (let i = 0; i < parameters.iterations; i++) {
        x += (a * (y - x)) * dt;
        y += (x * (b - z) - y) * dt;
        z += (x * y - c * z) * dt;
        points.push(new three.Vector3(x, y, z));
    }

    const line = generateLine(points, color, linewidth);
    scene.add(line);
}

const animatedPoints: three.Vector3[] = [];
const animationLength = 100;

function generateLine(points: three.Vector3[], color: three.Color = new three.Color(0xffffff), linewidth = 3.0): three.Mesh {
    const line = new MeshLine();
    line.setPoints(points);
    const material = new MeshLineMaterial({
        color,
        lineWidth: linewidth
    });
    const mesh = new three.Mesh(line, material);

    return mesh;
}

let lastTime = 0;

const animate: FrameRequestCallback = (time) => {
    const delta = time - lastTime;
    lastTime = time;
    requestAnimationFrame(animate)
    render()

    stats.begin();
    scene.clear();

    const { a, b, c, dt, color, linewidth } = parameters;

    let x = 0.01;
    let y = 0;
    let z = 0;
    const points: three.Vector3[] = [];

    if (points.length >= animationLength) {
        points.shift();
    }

    x += (a * (y - x)) * dt * delta;
    y += (x * (b - z) - y) * dt * delta;
    z += (x * y - c * z) * dt * delta;
    points.push(new three.Vector3(x, y, z));

    const line = generateLine(points, color, linewidth);
    scene.add(line);
    stats.end();

    stats.update()
}

function render() {
    renderer.render(scene, camera)
}

animate()