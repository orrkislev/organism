let bgPaths
function createMeshGradient() {
    colorMode(HSB)
    bgPaths = Array.from({ length: 60 }, () => {
        const r = random(200, 600)
        const clr = color(random(360), 60, 90, random())
        const blur = random(50, 100) * (r / 600)
        return {
            pos: createVector(width * random(-0.4, 1.4), height * random(-.4, 1.4)),
            distance: blur,
            img: blurredCircleImage(clr, r, blur),
        }
    })
}

function meshGradientBg() {
    if (!bgPaths) createMeshGradient()
    // if (mainObj) {
    //     const averageVel = mainObj.particles.reduce((a, b) => p5.Vector.add(a, b.vel), v(0, 0)).div(mainObj.particles.length)
    //     bgPaths.forEach(p => {
    //         const power = (p.distance / 100) * 15
    //         p.pos.x -= averageVel.x * power
    //         p.pos.y -= averageVel.y * power
    //     })
    // }
    clear()
    blendMode(ADD)
    bgPaths.forEach(p => {
        image(p.img, p.pos.x, p.pos.y)
    })
    blendMode(BLEND)
    drawingContext.filter = 'none'
}



function blurredCircleImage(clr, size, blur) {
    if (!helperGraphics) helperGraphics = createGraphics(width, height)
    helperGraphics.resizeCanvas(size + blur * 2, size + blur * 2)
    helperGraphics.clear()
    helperGraphics.fill(clr)
    helperGraphics.noStroke()
    helperGraphics.drawingContext.filter = `blur(${blur}px)`
    helperGraphics.circle(size / 2 + blur, size / 2 + blur, size)
    helperGraphics.drawingContext.filter = 'none'
    return helperGraphics.get(0, 0, size + blur * 2, size + blur * 2)
}