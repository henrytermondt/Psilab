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

const lineWidth = document.getElementById('size'),
    hardness = document.getElementById('hardness');

octx.lineCap = 'round';

let erasing = false;
const eraseButton = document.getElementById('erase-button');
eraseButton.onclick = () => {
    erasing = !erasing;
    eraseButton.style.backgroundColor = erasing ? '#e37c7c' : 'rgb(100, 100, 100)';
};


// Event listeners
let pgx, pgy,
    clicked, dragging,
    out,
    changed; // Did the state change (should a new state be saved?)
const draw = (gx, gy) => {
    if (!mousedown || Particle.selected) return;

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

    pgx = mx * width;
    pgy = my * height;

    Particle.select();
});
glCanvas.addEventListener('mousemove', e => {
    setMouse(e);

    if (mousedown) dragging = true;

    const gx = mx * width,
        gy = my * height;
    if (!out) draw(gx, gy);

    pgx = gx;
    pgy = gy;
});
document.addEventListener('mouseup', e => {
    mousedown = false;
    dragging = false;

    if (changed) save();

    setMouse(e);
});

glCanvas.addEventListener('mouseout', e => {
    out = true;
    setMouse(e);
    draw(mx * width, my * height);
})
glCanvas.addEventListener('mouseover', e => {
    out = false;
    setMouse(e);
    
    pgx = umx * width;
    pgy = umy * height;
})