precision highp float;

// Texture representing the potential vector
uniform sampler2D v;
uniform vec2 vDim;

// A pair of constants used to create the matrix A
uniform vec2 rx;
uniform vec2 ry;

void main() {
    vec2 pos = gl_FragCoord.xy - 0.5;

    float index = mod(pos.x, float(**c**)); // In which row of the cxn^2 representation of the matrix is the shader looking at
    
    float n = float(**n**), // The dimensions of the simulation
        ni = (n - 2.0) * (n - 2.0), // The square of the dimensions (due to the type of simulation, the borders do not need to be simulated, hence the "- 2.0")
        no = (n - 2.0) * (n - 3.0); // The distance away from the main diagonal that the lone diagonals are
    float k = pos.y * (n - 2.0) + floor(pos.x / float(**c**));

    float j = mod(k, (n - 2.0)), // Like x
        i = floor(k / (n - 2.0)); // Like y

    if (index == 0.0) { // Central main diagonal
        vec2 aii = vec2(
            2.0 * rx.x + 2.0 * ry.x + 1.0,
            2.0 * rx.y + 2.0 * ry.y + 0.5 * **dt** * texture2D(v, (vec2(j, i) + 0.5) / vDim).x
        );
        gl_FragColor = vec4(aii, k, k);
    } else if (index == 1.0) { // Lower main diagonal
        if (j != n - 3.0 && k - 1.0 >= 0.0) { // Stop if out of bounds or j is at a specific value
            gl_FragColor = vec4(-rx, k - 1.0, k);
        }
    } else if (index == 2.0) { // Upper main diagonal
        if (j != 0.0 && k + 1.0 < ni) { // Stop if out of bounds or j is at a specific value
            gl_FragColor = vec4(-rx, k + 1.0, k);
        }
    } else if (index == 3.0) { // Lower lone diagonal
        float x = k - (ni - no);
        if (x >= 0.0) { // Stop if out of bounds
            gl_FragColor = vec4(-ry, x, k);
        }
    } else if (index == 4.0) { // Upper lone diagonal
        float x = k + ni - no;
        if (x < ni) { // Stop if out of bounds
            gl_FragColor = vec4(-ry, x, k);
        }
    }
}
