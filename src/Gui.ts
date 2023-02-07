import { ButtonApi, Pane } from "tweakpane";
import * as EssentialsPlugin from '@tweakpane/plugin-essentials';
import * as InfodumpPlugin from 'tweakpane-plugin-infodump';

interface IHandlers {
    play: (button: ButtonApi) => void;
    reset: (button: ButtonApi) => void;
}

export function createGui(parameters, handlers: IHandlers): [Pane, EssentialsPlugin.FpsGraphBladeApi] {
    const pane = new Pane();
    const simulation = pane.addFolder({
        title: 'simulation'
    })
    const playButton = simulation.addButton({
        title: 'pause'
    });

    playButton.on('click', () => handlers['play'](playButton));

    const resetButton = simulation.addButton({
        title: 'reset'
    });

    resetButton.on('click', () => handlers['reset'](resetButton));

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

    display.addInput(parameters, 'showFixedPoints');

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

    // info.addBlade({
    //     view: "infodump",
    //     content: "Major, lark's true pepper. Let birds go further loose maybe. Shout easy play.",
    //     border: false,
    //     markdown: true,
    // });

    pane.registerPlugin(EssentialsPlugin);
    pane.registerPlugin(InfodumpPlugin);

    const fpsGraph = info.addBlade({
        view: 'fpsgraph',
        label: 'fps',
        lineCount: 2,
    }) as EssentialsPlugin.FpsGraphBladeApi;

    return [pane, fpsGraph];
}