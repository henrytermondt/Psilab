// Simulation button elements
const play = document.getElementById('play'),
    pause = document.getElementById('pause'),
    halt = document.getElementById('halt');

let selected = halt;
const buttons = [play, pause, halt];

let infoOverlaysReady = false;
const infoOverlay = document.getElementsByClassName('info-overlay');
const initInfoOverlays = () => { // Set the sizes
    for (const el of infoOverlay) {
        const dim = el.parentElement.getBoundingClientRect();
        el.style.width = dim.width + 'px';
        el.style.height = dim.height + 'px';
    }
};


let paused = true,
    halted = true;
play.onclick = () => {
    paused = false;

    // Helps to fix an edge case where the simulation degrades quickly at the edges
    octx.fillStyle = 'black';
    octx.fillRect(0, 0, width, 1);
    octx.fillRect(0, height - 1, width, 1);
    octx.fillRect(0, 0, 1, height);
    octx.fillRect(width - 1, 0, 1, height);

    if (halted) {
        clearx();
        
        for (const p of Particle.arr) {
            if (p instanceof WavePacket) {
                addWavePacket(p.x, 1 - p.y, p.r, p.a);
            }
        }

        initShaders(); // Reset and draw
        halted = false;
    }

    selected = play;
    play.dataset.status = 'selected'; // Can't interact with play button
    pause.dataset.status = 'none'; // Can press pause
    halt.dataset.status = 'none'; // Can halt simulation

    // Set sizes and gray the edit page out
    initInfoOverlays();
    for (const el of infoOverlay) {
        el.style.opacity = '0.4';
        el.style.pointerEvents = 'initial';
    }

    particles.style.display = 'none'; // Hide abstract representation of particles
};
pause.onclick = () => {
    paused = true;
    if (selected !== halt) {
        selected = pause;
        play.dataset.status = 'none'; // Can play
        pause.dataset.status = 'selected'; // Can't pause
        halt.dataset.status = 'none'; // Can halt
    }
};
halt.onclick = () => {
    paused = true;
    halted = true;

    selected = halt;
    play.dataset.status = 'none'; // Can play
    pause.dataset.status = 'selected'; // Can't pause
    halt.dataset.status = 'selected'; // Can't halt

    particles.style.display = 'block'; // Show abstract representation of particles

    // Can use edit page now
    for (const el of infoOverlay) {
        el.style.opacity = '0';
        el.style.pointerEvents = 'none';
    }

    // Reset
    ComputeShader.clear();
};

let tooSmall = window.innerWidth * 0.35 < 200;

// Tabs
const aboutButton = document.getElementById('about-button'),
    tutorialButton = document.getElementById('tutorial-button'),
    editButton = document.getElementById('edit-button');
const highlight = document.getElementById('highlight-line');

const pageContainers = {
    about: document.getElementById('about-container'),
    tutorial: document.getElementById('tutorial-container'),
    edit: document.getElementById('edit-container'),
};
const pageInfo = {
    about: document.querySelectorAll('#about-container .info'),
    tutorial: document.querySelectorAll('#tutorial-container .info'),
    edit: document.querySelectorAll('#edit-container .info'),
};


let shownContainer = pageContainers.about;
const selectPage = page => { // Change the page
    if (highlight.dataset.selected === page) return;

    // Slide away and fade out the old page
    for (const el of pageInfo[highlight.dataset.selected])
        el.style.animationName = 'slide-out';

    window.setTimeout(() => { // Wait and the slide in the new page
        shownContainer.style.display = 'none';
        shownContainer = pageContainers[page];
        shownContainer.style.display = 'block';
        for (const el of pageInfo[page]) {
            el.style.animationName = 'slide-in';
        }

        window.requestAnimationFrame(initInfoOverlays); // Wait for elements to load
    }, 250);

    highlight.dataset.selected = page;
};

aboutButton.onclick = () => selectPage('about');
tutorialButton.onclick = () => selectPage('tutorial');
editButton.onclick = () => selectPage('edit');

// What to do when a tab is hovered over
const aboutHint = document.getElementById('about-hint'),
    tutorialHint = document.getElementById('tutorial-hint'),
    editHint = document.getElementById('edit-hint');
aboutButton.onmouseover = () => aboutHint.style.backgroundColor = 'rgb(100, 100, 100)';
aboutButton.onmouseout = () => aboutHint.style.backgroundColor = 'transparent';
tutorialButton.onmouseover = () => tutorialHint.style.backgroundColor = 'rgb(100, 100, 100)';
tutorialButton.onmouseout = () => tutorialHint.style.backgroundColor = 'transparent';
editButton.onmouseover = () => editHint.style.backgroundColor = 'rgb(100, 100, 100)';
editButton.onmouseout = () => editHint.style.backgroundColor = 'transparent';