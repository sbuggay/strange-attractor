import { Pane } from "tweakpane";
import * as EssentialsPlugin from '@tweakpane/plugin-essentials';

export function createGui(parameters): [Pane, EssentialsPlugin.FpsGraphBladeApi] {
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
    simulation.addInput(parameters, 'dt', {
        min: 0,
        max: 0.25
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
    });

    display.addInput(parameters, 'background', {
        color: {
            type: 'float'
        }
    });

    display.addInput(parameters, 'linewidth', {
        min: 0,
        max: 2
    });

    const advanced = pane.addFolder({
        title: 'advanced',
        expanded: false
    });

    const info = pane.addFolder({
        title: 'info'
    });

    const functions = {
        'dx': '(a * (y - x))',
        'dy': '(x * (b - z) - y)',
        'dz': '(x * y - c * z)'
    }

    info.addMonitor(functions, 'dx');
    info.addMonitor(functions, 'dy');
    info.addMonitor(functions, 'dz');

    pane.registerPlugin(EssentialsPlugin);

    const fpsGraph = info.addBlade({
        view: 'fpsgraph',
        label: 'fps',
        lineCount: 2,
    }) as EssentialsPlugin.FpsGraphBladeApi;

    return [pane, fpsGraph];
}