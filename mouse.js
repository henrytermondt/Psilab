// Mouse variables
let mousedown = false;

let mx = 0,
    my = 0;
const setMouse = e => {
    mx = e.offsetX / trueDim;
    my = e.offsetY / trueDim;

    if (mx < 0) mx = 0;
    if (my < 0) my = 0;
    if (mx > 1) mx = 1;
    if (my > 1) my = 1;
};

// Event listeners
let pgx, pgy,
    clicked, dragging,
    out,
    changed; // Did the state change (should a new state be saved?)
const draw = (gx, gy) => {
    if (!mousedown || Particle.selected || !halted) return;

    if (erasing) octx.globalCompositeOperation = 'destination-out';
    octx.lineWidth = +lineWidth.value * (erasing ? 3 : 1);

    const col = 60 + (225 - 60) * hardness.value / 1000;
    octx.strokeStyle = `rgb(${col}, ${col}, ${col})`;
    octx.beginPath();
    octx.moveTo(pgx, pgy);
    octx.lineTo(gx, gy);
    octx.stroke();
    octx.closePath();

    if (erasing) octx.globalCompositeOperation = 'source-over';

    changed = true;
};

// Universal mouse position relative to the canvas
let umx, umy;
document.addEventListener('mousemove', e => {
    umx = (e.clientX - simx) / trueDim;
    umy = (e.clientY - simy) / trueDim;
});

glCanvas.addEventListener('mousedown', e => {
    mousedown = true;
    clicked = true;
    changed = false;
    
    setMouse(e);

    // Update past mouse position
    pgx = mx * width;
    pgy = my * height;

    // Check if hovering over a particle
    Particle.select();
});
glCanvas.addEventListener('mousemove', e => {
    setMouse(e);

    if (mousedown) dragging = true;

    // Set current mouse position
    const gx = mx * width,
        gy = my * height;
    if (!out) draw(gx, gy);

    // Updated past position
    pgx = gx;
    pgy = gy;
});
document.addEventListener('mouseup', e => {
    // If the user is done and they did something, save it to the version history
    if (changed && mousedown) save();

    mousedown = false;
    dragging = false;

    setMouse(e);
});

glCanvas.addEventListener('mouseout', e => {
    out = true;
    setMouse(e);

    // Complete the line (don't make it look cut off before the edge of the canvas)
    draw(mx * width, my * height);
})
glCanvas.addEventListener('mouseover', e => {
    out = false;
    setMouse(e);
    
    // When reentering the canvas, set the past mouse position to be the universal one
    pgx = umx * width;
    pgy = umy * height;
})


// Input elements
const lineWidth = document.getElementById('size'),
    hardness = document.getElementById('hardness');


// Handles style changes when erase element is selected
let erasing = false;
const eraseButton = document.getElementById('erase-button');
eraseButton.onclick = () => {
    erasing = !erasing;
    eraseButton.style.backgroundColor = erasing ? '#e37c7c' : 'rgb(100, 100, 100)';
};

octx.lineCap = 'round';