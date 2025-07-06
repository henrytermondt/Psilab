precision highp float;

uniform sampler2D x;
uniform vec2 xDim;

uniform sampler2D M;
uniform vec2 MDim;

void main() {
    // Texture coordinates for b and x
    vec2 pos = gl_FragCoord.xy - 0.5;

    // Converts b's texture coordinates into M's texture coordinates
    vec2 mPos = vec2(pos.x * float(**c**), pos.y) + 0.5;

    // Multiplies x by M to get the value of b at this position
    vec2 sum = vec2(0, 0);
    for (int i = 0; i < **c**; i ++) {
        vec4 mpix = texture2D(M, (mPos + vec2(i, 0)) / MDim);
        vec2 mval = mpix.xy;

        float xindex = mpix.z; // x coordinate
        vec2 xpos = vec2(mod(xindex, xDim.x), floor(xindex / xDim.x)) + 0.5;
        vec2 xval = texture2D(x, xpos / xDim).xy;

        // Adds the complex product to the sum
        sum += vec2(
            mval.x * xval.x - mval.y * xval.y,
            mval.x * xval.y + mval.y * xval.x
        );
    }

    gl_FragColor = vec4(sum, pos); // Output
}
