precision highp float;

uniform sampler2D b;
uniform vec2 bDim;

uniform sampler2D x;
uniform vec2 xDim;

uniform sampler2D A;
uniform vec2 ADim;

void main() {
    vec2 pos = gl_FragCoord.xy - 0.5;
    float n = float(**n**);

    // This specific simulation does not require that the borders are simulated so they are ignored
    if (pos.x == 0.0 || pos.y == 0.0 || pos.x == n - 2.0 || pos.y == n - 2.0) {
        gl_FragColor = vec4(0, 0, pos);
    } else {
        vec2 aPos = vec2(pos.x * float(**c**), pos.y) + 0.5;

        vec2 aii = vec2(0, 0); // Placeholder for actual value which is set inside the for loop

        // Runs the summation and finds the value of aii
        vec2 sum = vec2(0, 0);
        for (int i = 0; i < **c**; i ++) {
            vec4 aij = texture2D(A, (aPos + vec2(i, 0)) / ADim);
            if (aij == vec4(0, 0, 0, 0)) continue; // Skip padding

            // When it is the diagonal
            if (pos.y * xDim.x + pos.x == aij.z) {
                aii = aij.xy;
                continue;
            }

            vec2 xpos = vec2(mod(aij.z, xDim.x), floor(aij.z / xDim.x)) + 0.5;
            vec2 xj = texture2D(x, xpos / xDim).xy;

            sum += vec2(
                aij.x * xj.x - aij.y * xj.y,
                aij.x * xj.y + aij.y * xj.x
            );
        }

        // Add bi
        vec2 bi = texture2D(b, (pos + 0.5) / bDim).xy;
        sum = bi - sum;

        // Divide by aii and output
        float denominator = (aii.x * aii.x + aii.y * aii.y);

        vec4 aij = texture2D(A, (aPos + vec2(2, 0)) / ADim);

        // Set output
        gl_FragColor = vec4(
            vec2(
                (sum.x * aii.x + sum.y * aii.y) / denominator,
                (sum.y * aii.x - sum.x * aii.y) / denominator
            ),
            pos
        );
    }
}
