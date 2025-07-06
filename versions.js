// Img data arrays
let currentVersion = 0;
const versions = [], // Potential
    states = []; // Particles

const setVersion = index => {
    octx.putImageData(versions[index], 0, 0);

    Particle.deselect();
    Particle.arr.length = 0;
    for (const pstate of states[currentVersion]) {
        Particle.arr.push(new WavePacket(...pstate));
    }
};
const updateDisabled = () => {
    undoButton.dataset.disabled = !currentVersion;
    redoButton.dataset.disabled = currentVersion === versions.length - 1;
};
const save = () => {
    const v = octx.getImageData(0, 0, width, height);

    // Clear all future versions
    if (currentVersion < versions.length - 1) versions.splice(currentVersion + 1);
    
    versions.push(v);
    states.push(Particle.getTotalState());
    currentVersion = versions.length - 1;

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
    octx.putImageData(versions[0], 0, 0);

    save();
};

const presets = {
    blank: {
        img: 'blank.png',
        particles: [],
    },
    doubleSlitRight: {
        img: 'double-slit-right.png',
        particles: [
            [0.25, 0.5],
        ],
    },
    doubleSlitCenter: {
        img: 'double-slit-center.png',
        particles: [
            [0.25, 0.5],
        ],
    },
    doubleSlitLeft: {
        img: 'double-slit-left.png',
        particles: [
            [0.75, 0.5, 0.082, Math.PI],
        ],
    },
};

// Presets
const setPreset = name => {
    octx.clearRect(0, 0, width, height);

    versions.length = states.length = Particle.arr.length = 0;

    for (const p of presets[name].particles)
        Particle.arr.push(new WavePacket(...p));

    const img = new Image();
    img.onload = () => {
        octx.drawImage(img, 0, 0);
        save();
    }
    img.src = '/Psilab/presets/' + presets[name].img;
};

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
changeButton.onclick = () => {
    togglePresetAlert();
    
    curPreset = presetEl.value;
    setPreset(presetEl.value);
};
cancelButton.onclick = () => {
    togglePresetAlert();

    presetEl.value = curPreset;
};

setPreset(curPreset);