import * as three from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import Stats from 'three/examples/jsm/libs/stats.module'
import { Pane } from 'tweakpane';
import { MeshLine, MeshLineMaterial } from 'three.meshline';

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
    const playButton = simulation.addButton({
        title: 'pause'
    });

    playButton.on('click', () => {
        parameters.playing = !parameters.playing;
        playButton.title = parameters.playing ? 'pause' : 'play';
    });

    simulation.addInput(parameters, 'iterations', {
        min: 0,
        max: 5000,
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
    simulation.addInput(parameters, 'dt', {
        min: 0,
        max: 1
    });
    simulation.addInput(parameters, 'segments', {
        min: 1,
        max: 10,
        step: 1
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


    const advanced = pane.addFolder({
        title: 'advanced'
    });

    const info = pane.addFolder({
       title: 'info',
       expanded: false
    });

    const functions = {
        'dx': '(a * (y - x))',
        'dy': '(x * (b - z) - y)',
        'dz': '(x * y - c * z)'
    }

    info.addMonitor(functions, 'dx');
    info.addMonitor(functions, 'dy');
    info.addMonitor(functions, 'dz');


    return pane;
}

const parameters = {
    playing: true,
    iterations: 2500,
    a: 10,
    b: 28,
    c: 8.0 / 3.0,
    dt: 0.001,
    segments: 3,
    color: new three.Color(0xffffff),
    linewidth: 0.15,
}

const pane = createGui(parameters);

function generateLine(points: three.Vector3[], color: three.Color = new three.Color(0xffffff), linewidth = 3.0): three.Mesh {
    const line = new MeshLine();
    line.setPoints(points);
    const material = new MeshLineMaterial({
        color,
        lineWidth: linewidth,
    });
    const mesh = new three.Mesh(line, material);

    return mesh;
}

let lastTime = 0;

const points: three.Vector3[] = [];
let x = 0.01;
let y = 0;
let z = 0;

const animate: FrameRequestCallback = (time) => {
    const delta = time - lastTime;
    lastTime = time;
    requestAnimationFrame(animate)
    render()

    if (!parameters.playing) return;

    stats.begin();
    scene.clear();

    const { iterations, a, b, c, dt, color, linewidth, segments } = parameters;

    for (let i = 0; i < segments; i++) {
        if (points.length >= iterations) {
            points.shift();
        }

        x += (a * (y - x)) * dt * delta / segments;
        y += (x * (b - z) - y) * dt * delta / segments;
        z += (x * y - c * z) * dt * delta / segments;
        points.push(new three.Vector3(x, y, z));
    }

    const line = generateLine(points, color, linewidth);
    scene.add(line);
    stats.end();

    stats.update()
}

function render() {
    renderer.render(scene, camera)
}

animate(0)