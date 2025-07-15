// Simulation constants
const n = 400, // Simulation dimensions
    ni = (n - 2) ** 2, // Size of matricies
    no = (n - 3) * (n - 2); // Offset for lone diagonals
const dx = 0.05, // Step size 
    dt = dx ** 2 / 4; // Time step size
const l = n / 20;

// Constants used to generate A and M
const rx = {r: 0, i: dt / (2 * dx ** 2)},
    ry = {r: 0, i: dt / (2 * dx ** 2)}; 

const vArr = new Float32Array(ni); // Data representing the potential barriers
const imgData = new ImageData(n - 2, n - 2); // Stores visual of the potential barriers

const dataToArr = data => {
    const d = Math.sqrt(data.data.length / 4);
    for (let y = 1; y <= d; y ++) {
        for (let x = 0; x < d; x ++) {
            const index = ((d - y) * d + x) * 4;
            const val = data.data[index],
                alpha = data.data[index + 3];

            const pindex = y * d + x; // Put index
            if (val === 0) {
                if (alpha == 0 || (presets[curPreset].type === 'solid' && x !== 0 && y !== 1 && x !== d - 1 && y !== d)) vArr[pindex] = 0;
                else vArr[pindex] = 100000;
            } else {
                vArr[pindex] = presets[curPreset].type === 'transparent' ?
                    (val - 60) / (225 - 60) * 1000 :
                    val / 255 * 500;
            }
        }
    }
};
// const dataToArr = data => {
//     const d = Math.sqrt(data.data.length / 4);
//     for (let y = 1; y <= d; y ++) {
//         for (let x = 0; x < d; x ++) {
//             const index = ((d - y) * d + x) * 4;
//             const val = data.data[index],
//                 alpha = data.data[index + 3];

//             const pindex = y * d + x; // Put index
//             if (val === 0) {
//                 if (alpha == 0) vArr[pindex] = 0;
//                 else vArr[pindex] = 100000;
//             } else vArr[pindex] = (val - 60) / (225 - 60) * 1000;
            
//         }
//     }
// };

// Canvases
const cgl = new ComputeShaderContext(),
    glCanvas = cgl.canvas,
    gl = cgl.context;

const particles = document.getElementById('particles'),
    pctx = particles.getContext('2d');
const overlay = document.getElementById('overlay', {willReadFrequently: true}),
    octx = overlay.getContext('2d');

glCanvas.id = 'gl-canvas';
overlay.insertAdjacentElement('beforebegin', glCanvas);

const width = n - 2,
    height = n - 2;
glCanvas.width = overlay.width = width;
glCanvas.height = overlay.height = height;

octx.putImageData(imgData, 0, 0);

const setPCanvasSize = () => {
    Particle.dim = trueDim;
    particles.width = trueDim;
    particles.height = trueDim;
    particles.style.width = trueDim + 'px';
    particles.style.height = trueDim + 'px';
};

const sizeAlertContainer = document.getElementById('size-alert-container');
const testSize = () => {
    if (window.innerWidth * 0.35 < 200) {
        sizeAlertContainer.style.opacity = '1';
        sizeAlertContainer.style.pointerEvents = 'auto';
    } else {
        sizeAlertContainer.style.opacity = '0';
        sizeAlertContainer.style.pointerEvents = 'none';
    }
};
testSize();


// Sizing
let trueDim;
window.onresize = () => {
    tooSmall = window.innerWidth * 0.35 < 200;

    testSize();

    trueDim = window.innerWidth * 0.35;
    if (trueDim > window.innerHeight * 0.7) trueDim = window.innerHeight * 0.7;
    
    glCanvas.style.maxWidth = overlay.style.maxWidth = window.innerHeight * 0.7 + 'px';

    setPCanvasSize();
    
};
window.onload = () => {
    trueDim = window.innerWidth * 0.35;
    if (trueDim > window.innerHeight * 0.7) trueDim = window.innerHeight * 0.7;

    glCanvas.style.maxWidth = overlay.style.maxWidth = window.innerHeight * 0.7 + 'px';

    setPCanvasSize();
}

const selectedEl = document.getElementById('selected');