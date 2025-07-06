precision highp float;

uniform sampler2D x;
uniform vec2 xDim;

// Gets pixel colors and makes them look a little nicer
void main() {
    vec3 pix = texture2D(x, gl_FragCoord.xy / xDim).xyz;

    // Gets the squared modulus of the wave function. This is the probability density of measuring a particle at this position
    float module = pix.x * pix.x + pix.y * pix.y;

    vec3 low = vec3(0.02, 0, 0.02); // Dark color of a gradient
    vec3 high = 2.0 * vec3(0.7, 0.5, 0.4); // Light color of a gradient
    
    gl_FragColor = vec4(mix(low, high, pow(module, 1.3)), 1);
}
