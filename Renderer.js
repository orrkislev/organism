const renderParams = {
    mirror: false,
    line: {
        show: true,
        thickness: 2, opacity: 255,
    },
    network: {
        show: false,
        points: round_random(4), minDist: 2, maxDist: round_random(10),
        opacity: 50, thickness: 1,
    },
    offsetLine: {
        show: true,
        thickness: 1, opacity: random(50, 255),
        type: random(3),
        distance: random(10), length: random(3),
        density: random(.5, 1),
    },
    dots: {
        show: false,
        opacity: 100,
        sum: 50,
        angle: random(Math.PI),
    },
}

function renderParticle(part) {
    part.preRender()
    renderLine(part)
    renderDots(part)
    renderEnds(part)
    renderOffsetLine(part)
    renderNetwork(part)
}

function renderLine(part) {
    if (!renderParams.line.show) return
    push()
    stroke(0, renderParams.line.opacity)
    const sw = (part.vel.length + 1) * renderParams.line.thickness
    strokeWeight(sw)
    part.drawLines.forEach(other => {
        line(part.pos.x, part.pos.y, other.x, other.y)
    })
    pop()
}

function renderDots(part) {
    if (!renderParams.dots.show) return
    if (!part.dotGraphics) part.dotGraphics = createDotsGraphics()
    push()
    translate(part.pos.x, part.pos.y)
    rotate(part.offsetDir.angle)
    imageMode(CENTER)
    image(part.dotGraphics, 0, 0)
    pop()
}

function renderEnds(part) {
    if (withEnds && part.isEnding() && part.organism == mainObj) circle(part.pos.x, part.pos.y, 5)
}

function renderOffsetLine(part) {
    if (!renderParams.offsetLine.show) return
    if (part.shouldDrawOffsetLine == null) part.shouldDrawOffsetLine = random() < renderParams.offsetLine.density
    if (!part.shouldDrawOffsetLine) return
    push()
    strokeWeight(renderParams.offsetLine.thickness)
    stroke(0, renderParams.offsetLine.opacity)
    translate(part.pos.x, part.pos.y)
    rotate(part.offsetDir.angle)
    const t = noise(part.pos.x / 10, part.pos.y / 10, frameCount / 100) * renderParams.offsetLine.distance
    line(-renderParams.offsetLine.length, t, renderParams.offsetLine.length, t)
    if (renderParams.offsetLine.type > 1)
        line(-renderParams.offsetLine.length, -t, renderParams.offsetLine.length, -t)
    if (renderParams.offsetLine.type > 2)
        line(0, -t, 0, t)
    pop()
}


function renderNetwork(part) {
    if (!renderParams.network.show) return
    if (part.age < 30) return
    stroke(0, renderParams.network.opacity)
    strokeWeight(renderParams.network.thickness)
    if (!part.network)
        part.network = Array(renderParams.network.points)
            .fill(0).map((_, i) =>
                part.getNeighbor(part, round_random(renderParams.network.minDist, renderParams.network.maxDist)))
    part.network.forEach(other => {
        line(part.pos.x, part.pos.y, other.pos.x, other.pos.y)
    })
}


function renderParticle2(part) {
}





function createDotsGraphics() {
    if (!helperGraphics) {
        helperGraphics = createGraphics(100, 100)
        helperGraphics.pixelDensity(4)
    } else if (helperGraphics.width != 100 || helperGraphics.height) helperGraphics.resizeCanvas(100, 100)
    helperGraphics.clear()
    helperGraphics.stroke(0, renderParams.dots.opacity)
    helperGraphics.translate(50, 50)
    // helperGraphics.rotate(1.9)
    for (let i = 0; i < renderParams.dots.sum; i++) {
        const x = random() * random() * 10 * (random() < .5 ? -1 : 1)
        const y = random() * random() * 2 * (random() < .5 ? -1 : 1)
        helperGraphics.line(x, y, x, y)
    }
    return helperGraphics.get()
}