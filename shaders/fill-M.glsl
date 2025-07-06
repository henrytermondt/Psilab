precision highp float;

uniform sampler2D v;
uniform vec2 vDim;

uniform vec2 rx;
uniform vec2 ry;

void main() {
    vec2 pos = gl_FragCoord.xy - 0.5;

    float index = mod(pos.x, float(**c**));

    float n = float(**n**),
        ni = (n - 2.0) * (n - 2.0),
        no = (n - 2.0) * (n - 3.0);
    float k = pos.y * (n - 2.0) + floor(pos.x / float(**c**));

    float j = mod(k, (n - 2.0)), // Like x
        i = floor(k / (n - 2.0)); // Like y

    if (index == 0.0) { // Central main diagonal
        vec2 bii = vec2(
            -2.0 * rx.x - 2.0 * ry.x + 1.0,
            -2.0 * rx.y - 2.0 * ry.y - 0.5 * **dt** * texture2D(v, (vec2(j, i) + 0.5) / vDim).x
        );
        gl_FragColor = vec4(bii, k, k);
    } else if (index == 1.0) { // Lower main diagonal
        if (j != 0.0 && k - 1.0 >= 0.0) {
            gl_FragColor = vec4(rx, k - 1.0, k);
        }
    } else if (index == 2.0) { // Upper main diagonal
        if (j != n - 3.0 && k + 1.0 < ni) {
            gl_FragColor = vec4(rx, k + 1.0, k);
        }
    } else if (index == 3.0) { // Lower lone diagonal
        float x = k - (ni - no);
        if (x >= 0.0) {
            gl_FragColor = vec4(ry, x, k);
        }
    } else if (index == 4.0) { // Upper lone diagonal
        float x = k + ni - no;
        if (x < ni) {
            gl_FragColor = vec4(ry, x, k);
        }
    }
}