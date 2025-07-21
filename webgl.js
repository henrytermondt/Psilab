/*
The formula for this scenario is A*x1=b, where b=M*x0, A and M are matrices, and x
is a column vector. x1 is the value of x at the current time step while x0 is the
value of x during the previous time step.

A and M are calculated once at the beginning of the simulation based on the initial
positions of the potential barriers. The value of x is set at the beginning but is
then calculated each frame by solving for b (since M and x0 are known) and then using
an interative solver, in this case the element-based Jacobi, method to solve for x1.

This script creates all of the shaders which do the above and defines several functions
to do each of the steps.

If you understood all of that jargon, nice job! A really good reference for the technique
I used can be found here, made by Arturo Mena:
https://artmenlope.github.io/solving-the-2d-schrodinger-equation-using-the-crank-nicolson-method/
*/

ComputeShader.useContext(cgl);

const inputDim = n - 2; // How large the shaders are

const vInput = new ComputeShaderInput('v', vArr, n - 2, n - 2, 'LUMINANCE'); // Potential

// Uniforms for variables used in the simulation
const rxUniform = new ComputeShaderUniform('rx', '2fv', [rx.r, rx.i]),
    ryUniform = new ComputeShaderUniform('ry', '2fv', [ry.r, ry.i]),
    cUniform = new ComputeShaderUniform('c', '4fv', [0, 0, 0, 0]),
    clearUniform = new ComputeShaderUniform('clear', '1i', false);

// Matrix inputs
const AInput = new ComputeShaderInput('A', new Float32Array(inputDim * 5 * inputDim * 4), inputDim * 5, inputDim),
    MInput = new ComputeShaderInput('M', new Float32Array(inputDim * 5 * inputDim * 4), inputDim * 5, inputDim),
    xInput = new ComputeShaderInput('x', new Float32Array(inputDim     * inputDim * 4), inputDim    , inputDim),
    bInput = new ComputeShaderInput('b', new Float32Array(inputDim     * inputDim * 4), inputDim    , inputDim);

let fillAcs,
    fillMcs,
    fillxcs,
    calcbcs,
    jacobics,
    rendercs;
const loadShaders = () => { // Fetch the shader sources and created the shaders
    return Promise.all([
        fetch('/Psilab/shaders/fill-A.glsl').then(r => r.text()).then(content => {
            fillAcs = new ComputeShader(
                content.replaceAll('**c**', 5)
                    .replaceAll('**n**', n)
                    .replaceAll('**dt**', dt),
                inputDim * 5, inputDim
            );
            fillAcs.addInput(vInput);
            fillAcs.addUniform(rxUniform);
            fillAcs.addUniform(ryUniform);
        }),
        fetch('/Psilab/shaders/fill-M.glsl').then(r => r.text()).then(content => {
            fillMcs = new ComputeShader(
                content.replaceAll('**c**', 5)
                    .replaceAll('**n**', n)
                    .replaceAll('**dt**', dt),
                inputDim * 5, inputDim
            );
            fillMcs.addInput(vInput);
            fillMcs.addUniform(rxUniform);
            fillMcs.addUniform(ryUniform);
        }),
        fetch('/Psilab/shaders/fill-x.glsl').then(r => r.text()).then(content => {
            fillxcs = new ComputeShader(
                content.replaceAll('**n**', n)
                    .replaceAll('**l**', l),
                inputDim, inputDim
            );
            fillxcs.addInput(xInput);
            fillxcs.addUniform(cUniform);
            fillxcs.addUniform(clearUniform);
        }),
        fetch('/Psilab/shaders/calculate-b.glsl').then(r => r.text()).then(content => {
            calcbcs = new ComputeShader(content.replaceAll('**c**', 5), inputDim, inputDim);
            calcbcs.addInput(xInput);
            calcbcs.addInput(MInput);
        }),
        fetch('/Psilab/shaders/jacobi.glsl').then(r => r.text()).then(content => {
            jacobics = new ComputeShader(
                content.replaceAll('**c**', 5)
                    .replaceAll('**n**', n),
                inputDim, inputDim
            );
            jacobics.addInput(bInput);
            jacobics.addInput(xInput);
            jacobics.addInput(AInput);
        }),
        fetch('/Psilab/shaders/render.glsl').then(r => r.text()).then(content => {
            rendercs = new ComputeShader(content, inputDim, inputDim);
            rendercs.addInput(xInput);
        }),
    ]);
};

const initShaders = () => { // Moves data into the right place so other parts of the code can access it
    dataToArr(octx.getImageData(0, 0, width, height));
    vInput.update(vArr);

    fillAcs.use();
    fillAcs.initializeInputs();
    fillAcs.initializeUniforms();
    fillAcs.run();
    ComputeShader.swap(AInput, fillAcs.output);

    fillMcs.use();
    fillMcs.initializeInputs();
    fillMcs.initializeUniforms();
    fillMcs.run();
    ComputeShader.swap(MInput, fillMcs.output);    
};

const clearx = () => { // Zeros x
    clearUniform.update(true);
    fillxcs.use();
    fillxcs.initializeInputs();
    fillxcs.initializeUniforms();
    fillxcs.run();
    ComputeShader.swap(xInput, fillxcs.output);
}
const addWavePacket = (x, y, r, a) => {
    cUniform.update([x, y, r, -a]);
    clearUniform.update(false);

    fillxcs.use();
    fillxcs.initializeInputs();
    fillxcs.initializeUniforms();
    fillxcs.run();
    ComputeShader.swap(xInput, fillxcs.output);
};

const calcb = () => {
    calcbcs.use();
    calcbcs.initializeInputs();
    calcbcs.initializeUniforms();
    calcbcs.run();
    ComputeShader.swap(bInput, calcbcs.output);
};
const solve = () => {
    for (let i = 10; i --;) {
        jacobics.use();
        jacobics.initializeInputs();
        jacobics.initializeUniforms();
        jacobics.run();
        ComputeShader.swap(xInput, jacobics.output);
    }
};
const display = () => { // Draws everything to the canvas
    rendercs.use(true);
    rendercs.initializeInputs();
    rendercs.initializeUniforms();
    rendercs.run();
};