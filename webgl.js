ComputeShader.useContext(cgl);

const inputDim = n - 2;

const vInput = new ComputeShaderInput('v', vArr, n - 2, n - 2, 'LUMINANCE');
const rxUniform = new ComputeShaderUniform('rx', '2fv', [rx.r, rx.i]),
    ryUniform = new ComputeShaderUniform('ry', '2fv', [ry.r, ry.i]),
    cUniform = new ComputeShaderUniform('c', '4fv', [0, 0, 0, 0]),
    clearUniform = new ComputeShaderUniform('clear', '1i', false);

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
const loadShaders = () => {
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

const initShaders = () => {
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

const clearx = () => {
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
const display = () => {
    rendercs.use(true);
    rendercs.initializeInputs();
    rendercs.initializeUniforms();
    rendercs.run();
};