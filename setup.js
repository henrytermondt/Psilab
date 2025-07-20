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
                if (val === 255) {
                    vArr[pindex] = 100000;
                } else {
                    vArr[pindex] = presets[curPreset].type === 'transparent' ?
                        (val - 60) / (225 - 60) * 1000 :
                        val / 255 * 1000;
                }
            }
        }
    }
};

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

const a = navigator.userAgent||navigator.vendor||window.opera;
const isMobile = (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4)));

if (isMobile) {
    document.querySelector('#size-alert h1').textContent = 'Wrong Device';
    document.querySelector('#size-alert div').innerHTML = 'Please change to a different device. This simulation cannot be run on phones because their hardware is too weak.';
}

const setPCanvasSize = () => {
    Particle.dim = trueDim;
    particles.width = trueDim;
    particles.height = trueDim;
    particles.style.width = trueDim + 'px';
    particles.style.height = trueDim + 'px';
};

const sizeAlertContainer = document.getElementById('size-alert-container');
const testSize = () => {
    if (window.innerWidth * 0.35 < 200 || window.innerHeight < 415 || isMobile) {
        sizeAlertContainer.style.opacity = '1';
        sizeAlertContainer.style.pointerEvents = 'auto';
    } else {
        sizeAlertContainer.style.opacity = '0';
        sizeAlertContainer.style.pointerEvents = 'none';
    }
};
testSize();



const simContainer = document.getElementById('sim-container'),
    initPos = simContainer.getBoundingClientRect();

// Sizing
let trueDim;
let simx = initPos.left,
    simy = initPos.top;
window.onresize = () => {
    tooSmall = window.innerWidth * 0.35 < 200;

    testSize();

    trueDim = window.innerWidth * 0.35;
    if (trueDim > window.innerHeight * 0.7) trueDim = window.innerHeight * 0.7;
    
    glCanvas.style.maxWidth = overlay.style.maxWidth = window.innerHeight * 0.7 + 'px';

    setPCanvasSize();
    
    const pos = simContainer.getBoundingClientRect();
    simx = pos.left;
    simy = pos.top;
};
window.onload = () => {
    trueDim = window.innerWidth * 0.35;
    if (trueDim > window.innerHeight * 0.7) trueDim = window.innerHeight * 0.7;

    glCanvas.style.maxWidth = overlay.style.maxWidth = window.innerHeight * 0.7 + 'px';

    setPCanvasSize();
}

const selectedEl = document.getElementById('selected');