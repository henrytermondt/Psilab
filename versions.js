// Img data arrays
let currentVersion = 0;
const versions = [], // Potential
    states = []; // Particles

const setVersion = index => {
    octx.putImageData(versions[index], 0, 0); // Draw the old version onto the canvas

    Particle.deselect();
    Particle.arr.length = 0;
    for (const pstate of states[currentVersion]) {
        Particle.arr.push(new WavePacket(...pstate));
    }

};
const updateDisabled = () => { // What to do when no versions to undo to or redo to
    undoButton.dataset.disabled = !currentVersion;
    redoButton.dataset.disabled = currentVersion === versions.length - 1;
};

const save = () => {
    const v = octx.getImageData(0, 0, width, height); // Get barrier data

    // Clear all future versions
    if (currentVersion < versions.length - 1) versions.splice(currentVersion + 1);
    
    versions.push(v); // Save barrier data
    states.push(Particle.getTotalState()); // Save particle data
    currentVersion = versions.length - 1; // Update version number

    updateDisabled();
};
const undo = () => {
    if (currentVersion <= 0) return;
    currentVersion --;

    setVersion(currentVersion);

    updateDisabled();
};
const redo = () => {
    if (currentVersion >= versions.length - 1) return;
    currentVersion ++;

    setVersion(currentVersion);

    updateDisabled();
};

const undoButton = document.getElementById('undo-button'),
    redoButton = document.getElementById('redo-button');

undoButton.onclick = undo;
redoButton.onclick = redo;

const clearButton = document.getElementById('clear-button');
clearButton.onclick = () => {
    if (currentVersion === 0) return;

    octx.putImageData(versions[0], 0, 0);

    save();
};

// Info about each of the presets
const presets = {
    blank: {
        img: 'blank.png',
        particles: [],
        type: 'transparent',
    },
    doubleSlitRight: {
        img: 'double-slit-right.png',
        particles: [
            [0.25, 0.5],
        ],
        type: 'transparent',
    },
    doubleSlitCenter: {
        img: 'double-slit-center.png',
        particles: [
            [0.25, 0.5],
        ],
        type: 'transparent',
    },
    doubleSlitLeft: {
        img: 'double-slit-left.png',
        particles: [
            [0.75, 0.5, 0.082, Math.PI],
        ],
        type: 'transparent',
    },
    singleSlit: {
        img: 'single-slit.png',
        particles: [
            [0.25, 0.5],
        ],
        type: 'transparent',
    },

    latticeSquare: {
        img: 'lattice-square.png',
        particles: [
            [0.25, 0.5],
        ],
        type: 'solid',
    },
    latticeTriangle: {
        img: 'lattice-triangle.png',
        particles: [
            [0.25, 0.5],
        ],
        type: 'solid',
    },
    latticeRandom: {
        img: 'lattice-random.png',
        particles: [
            [0.25, 0.5],
        ],
        type: 'solid',
    },
};


const setPreset = name => { // Draws the preset onto the canvas, updates particles, and saves
    octx.clearRect(0, 0, width, height);

    versions.length = states.length = Particle.arr.length = 0;

    for (const p of presets[name].particles)
        Particle.arr.push(new WavePacket(...p));

    const img = new Image();
    img.onload = () => {
        octx.drawImage(img, 0, 0, width, height);
        save();
    }
    img.src = '/Psilab/presets/' + presets[name].img;

    Particle.deselect();
};


// When the user attempts to change the preset, show the confirmation message
const presetEl = document.getElementById('preset');
presetEl.addEventListener('input', e => {
    togglePresetAlert();
});

const presetAlertContainer = document.getElementById('preset-alert-container');
let alertVisible = false,
    curPreset = 'doubleSlitRight';
const togglePresetAlert = () => {
    if (alertVisible) {
        presetAlertContainer.style.opacity = '0';
        presetAlertContainer.style.pointerEvents = 'none';
    } else {
        presetAlertContainer.style.opacity = '1';
        presetAlertContainer.style.pointerEvents = 'auto';
    }

    alertVisible = !alertVisible;
};

const changeButton = document.getElementById('change-button'),
    cancelButton = document.getElementById('cancel-button');
changeButton.onclick = () => { // Make the changes
    togglePresetAlert();
    
    curPreset = presetEl.value;
    setPreset(presetEl.value);
};
cancelButton.onclick = () => { // Don't make changes and reset
    togglePresetAlert();

    presetEl.value = curPreset;
};

setPreset(curPreset); // Set the initial preset