precision highp float;

uniform sampler2D x;
uniform vec2 xDim;

uniform vec4 c;
uniform bool clear;

// Creates the shape of the wave packet
vec2 gaussian(vec2 pos, float stdev, float speed) {
    // Represents an imaginary number where the real part is a value in a Gaussian
    vec2 t1 = vec2(
        exp(
            -(pos.x * pos.x + pos.y * pos.y) / (2.0 * stdev * stdev)  
        ),
        0.0
    );

    // Adds speed and direction to the Guassian
    float phi = speed * (pos.x * cos(c.w) + pos.y * sin(c.w)); // This combines the two directions
    vec2 t2 = vec2(cos(phi), sin(phi));

    // Multiplied t1 and t2 and returns it
    return vec2(
        t1.x * t2.x - t1.y * t2.y,
        t1.x * t2.y + t1.y * t2.x
    );
}

void main() {
    vec2 pos = gl_FragCoord.xy - 0.5;

    vec2 pix = texture2D(x, (pos + 0.5) / xDim).xy;

    if (clear) gl_FragColor = vec4(0, 0, pos);
    else { // Creates gaussian centered at c of a size depending on l
        gl_FragColor = vec4(
            pix + 1.2 * gaussian(
                (pos / (float(**n**) - 3.0) - c.xy) * float(**l**),
                float(**l**) * 0.1 * c.z / 0.082,
                10.0 * 3.141592653589793
            ),
            pos
        );
    }
}
