
let shaderGraphics, myShader, helperGraphics
function applyShader(area) {
    if (!shaderGraphics) {
        shaderGraphics = createGraphics(width, height, WEBGL)
        shaderGraphics.noStroke()
    }
    if (!helperGraphics) helperGraphics = createGraphics(width, height)
    helperGraphics.resizeCanvas(width, height)

    helperGraphics.clear()
    helperGraphics.fill(0)
    helperGraphics.noStroke()
    helperGraphics.beginShape()
    points = []
    for (let i=0;i<area.length;i++) {
        const pos = area.getPointAt(i)
        helperGraphics.vertex(pos.x, pos.y)
        points.push(pos)
    }
    helperGraphics.endShape(CLOSE)

    myShader = shaderGraphics.createShader(vertexShader, getFragmentShader(points))
    shaderGraphics.shader(myShader)
    myShader.setUniform('tex0', helperGraphics)

    shaderGraphics.clear()
    shaderGraphics.rect(0, 0, width, height)

    image(shaderGraphics, 0, 0)
}

const vertexShader = `
    attribute vec3 aPosition;
    attribute vec2 aTexCoord;
    varying vec2 vTexCoord;

    void main() {
    vTexCoord = aTexCoord;
    vec4 positionVec4 = vec4(aPosition, 1.0);
    positionVec4.xy = positionVec4.xy * 2.0 - 1.0;
    positionVec4.y *= -1.0;
    gl_Position = positionVec4;
    }`

function getFragmentShader(points) {
    frag = `
        precision mediump float;

        #define PI 3.14159265359

        varying vec2 vTexCoord;
        uniform sampler2D tex0;

        void main() {
            vec4 color = texture2D(tex0, vTexCoord);
            if (color.a < 0.5) discard;

            vec2 pos = vTexCoord * vec2(${width}, ${height});
            float closestDist = 10000.0;
            vec2 closestPoint = vec2(0.0, 0.0);
            
            ${points.map(p => `
                {
                    float dist = distance(vec2(${p.x}, ${p.y}), pos);
                    if (dist < closestDist){
                        closestDist = distance(vec2(${p.x}, ${p.y}), pos);
                        closestPoint = vec2(${p.x}, ${p.y});
                    }
                }
            `).join('\n')}

            float angleToClosest = atan(closestPoint.y - pos.y, closestPoint.x - pos.x);
            float val = 1.0-closestDist / 20.0;
            
            float posterizeVal = (1.0 - abs(angleToClosest) / PI ) * 5.0;
            val = floor(val * posterizeVal) / posterizeVal;

            vec2 dotSpacing = vec2(${width / 4000.0}, ${height / 4000.0});
            vec2 closestDot = floor(pos / dotSpacing) * dotSpacing;
            float dotDist = distance(closestDot, pos) / length(dotSpacing);
            if (dotDist < val) val = 1.0;
            else val = 0.0;

            vec3 res = vec3(0.0, 0.0, 0.0);
            gl_FragColor = vec4(res, val);
        }
    `
    return frag
}