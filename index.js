let frames = 0;

// Runs every frame, calculates the next time step
const loop = () => {
    if (!paused || frames === 0) {
        calcb(); // Calculates the value of b
        solve(); // Solves for x
        display(); // Draws simulation to glCanvas

        frames ++;
    }
    if (halted) {
        Particle.update();
    } 

    clicked = false;
    
    window.requestAnimationFrame(loop);
};

// Loading shaders takes time and is asynchronous, so the simulation must wait to start
(async () => {
    await loadShaders();

    // Begin the simulation
    window.requestAnimationFrame(loop);
})();
