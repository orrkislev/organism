windowRatio = .8
function initSVG() {
    if (window.innerWidth < window.innerHeight * windowRatio) {
        width = window.innerWidth
        height = width / windowRatio
    } else {
        height = window.innerHeight
        width = height * windowRatio
    }

    svgMain = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svgMain.setAttribute('width', width);
    svgMain.setAttribute('height', height);

    width = 700
    height = Math.round(width / windowRatio)
    svgMain.setAttribute('viewBox', `100 100 500 ${Math.round(500/windowRatio)}`);
    document.querySelector('main').appendChild(svgMain);
}

class SVGLine {
    constructor(p1, p2, makeMirror = false) {
        this.element = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        this.set(p1, p2)
        this.element.setAttribute('stroke-linecap', 'round');
        this.element.setAttribute('stroke', 'black');
        svgMain.appendChild(this.element)
        this.x1 = p1.x; this.y1 = p1.y;
        this.x2 = p2.x; this.y2 = p2.y;
        this.color = 'black'
        this.isVisible = true
        this.weight = 1

        if (makeMirror) {
            this.mirror = new SVGLine(p1, p2)
            this.mirror.setxyxy(width - p1.x, p1.y, width - p2.x, p2.y)
        }
    }
    setxyxy(x1, y1, x2, y2) {
        if (x1 == this.x1 && y1 == this.y1 && x2 == this.x2 && y2 == this.y2) return
        this.element.setAttribute('x1', x1);
        this.element.setAttribute('y1', y1);
        this.element.setAttribute('x2', x2);
        this.element.setAttribute('y2', y2);
        this.x1 = x1; this.y1 = y1;
        this.x2 = x2; this.y2 = y2;
        if (this.mirror) this.mirror.setxyxy(width - x1, y1, width - x2, y2)
    }
    set(p1, p2) {
        this.set1(p1)
        this.set2(p2)
        if (this.mirror) this.mirror.setxyxy(width - p1.x, p1.y, width - p2.x, p2.y)
    }
    set1(p1) {
        if (p1.x == this.x1 && p1.y == this.y1) return
        this.element.setAttribute('x1', p1.x);
        this.element.setAttribute('y1', p1.y);
        this.x1 = p1.x; this.y1 = p1.y;
    }
    set2(p2) {
        if (p2.x == this.x2 && p2.y == this.y2) return
        this.element.setAttribute('x2', p2.x);
        this.element.setAttribute('y2', p2.y);
        this.x2 = p2.x; this.y2 = p2.y;
    }
    stroke(color) {
        if (color == this.color) return
        this.element.setAttribute('stroke', color);
        this.color = color
        if (this.mirror) this.mirror.stroke(color)
    }
    strokeWeight(weight) {
        if (weight == this.weight) return
        this.element.setAttribute('stroke-width', weight);
        if (this.mirror) this.mirror.strokeWeight(weight)
    }
    visible(vis, x = this.x1) {
        if (this.mirror && vis == true) vis = x > width / 2
        this.element.setAttribute('visibility', vis ? 'visible' : 'hidden');
        if (this.mirror) this.mirror.element.setAttribute('visibility', vis ? 'visible' : 'hidden');
        this.isVisible = vis
    }
    remove() {
        svgMain.removeChild(this.element)
        if (this.mirror) this.mirror.remove()
    }
}
class SVGCircle {
    constructor(x, y, r, makeMirror = false) {
        this.element = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        this.set(x, y, r)
        svgMain.appendChild(this.element)
        this.x = x; this.y = y;
        this.r = r;
        this.isVisible = true
        this.weight = 1

        if (makeMirror) this.mirror = new SVGCircle(width - x, y, r)
    }
    set(x, y, r = this.r) {
        if (x == this.x && y == this.y && r == this.r) return
        this.element.setAttribute('cx', x);
        this.element.setAttribute('cy', y);
        this.element.setAttribute('r', r);
        this.x = x; this.y = y;
        this.r = r
        if (this.mirror) this.mirror.set(width - x, y, r)
    }
    fill(color) {
        if (color == this.color) return
        this.element.setAttribute('fill', color);
        this.color = color
        if (this.mirror) this.mirror.fill(color)
    }
    stroke(color) {
        if (color == this.color) return
        this.element.setAttribute('stroke', color);
        this.color = color
        if (this.mirror) this.mirror.stroke(color)
    }
    strokeWeight(weight) {
        if (weight == this.weight) return
        this.element.setAttribute('stroke-width', weight);
        if (this.mirror) this.mirror.strokeWeight(weight)
    }
    visible(vis, x = this.x) {
        if (this.mirror && vis == true) vis = x > width / 2
        this.element.setAttribute('visibility', vis ? 'visible' : 'hidden');
        if (this.mirror) this.mirror.element.setAttribute('visibility', vis ? 'visible' : 'hidden');
        this.isVisible = vis
    }
    remove() {
        svgMain.removeChild(this.element)
    }
}



function updateParticleSVG(part) {
    part.preRender()

    if (renderParams.line || renderParams.backLine) {
        if (renderParams.line) {
            sw = (part.vel.length + 1) * renderParams.line.thickness
            if (renderParams.line.aged) sw *= 1 - (part.num / particles.length)
            if (renderParams.line.pulsing) sw *= (Math.sin(part.age / 80) + 1) / 2
            sw = constrain(sw, 0, 20)
            if (part.svg.doughnut) part.svg.doughnut.strokeWeight(sw)
        }
        part.connections.forEach(c => {
            if ('svg' in c) {
                if (!c.svg) {
                    c.svg = {}

                    if (renderParams.backLine) {
                        c.svg.back = new SVGLine(part.pos, c.body.pos, renderParams.mirror)
                        c.svg.back.strokeWeight(renderParams.backLine.thickness)
                        c.svg.back.stroke(renderParams.backLine.color)
                        if (!renderParams.backLine.dashed) svgMain.insertBefore(c.svg.back.element, svgMain.firstChild)
                    }
                    if (renderParams.line) {
                        c.svg.line = new SVGLine(part.pos, c.body.pos, renderParams.mirror)
                        c.svg.line.stroke(renderParams.line.color)
                    }
                }
                let showLine = part.pos.dist(c.body.pos) < minGoodDistance

                if (c.svg.line) {
                    c.svg.line.set(part.pos, c.body.pos)
                    c.svg.line.strokeWeight(sw)
                    c.svg.line.visible(showLine)
                }
                if (c.svg.back) {
                    c.svg.back.set(part.pos, c.body.pos)
                    if (renderParams.backLine.aged) c.svg.back.strokeWeight(renderParams.backLine.thickness * (1 - (part.num / particles.length)))
                    c.svg.back.visible(showLine)
                }
            }
        })
    }

    if (renderParams.offsetLine) {
        if (!part.svg.offset) {
            const p1 = p(-renderParams.offsetLine.length, -renderParams.offsetLine.distance)
            const p2 = p(renderParams.offsetLine.length, -renderParams.offsetLine.distance)
            part.svg.offset = new SVGLine(p1, p2, renderParams.mirror)
            if (renderParams.mirror) part.svg.offset.mirror.set(p1, p2)
            part.svg.offset.stroke(renderParams.offsetLine.color)
            part.svg.offset.strokeWeight(renderParams.offsetLine.thickness)
        }
        part.svg.offset.element.setAttribute('transform', `translate(${part.pos.x},${part.pos.y}) rotate(${renderParams.offsetLine.rotation * 180 + part.offsetDir.angle * 180 / Math.PI})`)
        if (renderParams.mirror)
            part.svg.offset.mirror.element.setAttribute('transform', `translate(${width - part.pos.x},${part.pos.y}) rotate(${-90 + renderParams.offsetLine.rotation * 180 + part.offsetDir.angle * 180 / Math.PI})`)
        part.svg.offset.visible(true, part.pos.x)
    }

    if (renderParams.network) {
        if (!part.svg.network1 && part.age > 30) {
            const neighbor1 = part.getNeighbor(part, round_random(renderParams.network.minDist, renderParams.network.maxDist))
            part.svg.network1 = new SVGLine(part.pos, neighbor1.pos, renderParams.mirror)
            part.svg.network1.stroke(renderParams.network.color + '44')
            part.svg.network1.strokeWeight(renderParams.network.thickness)
            part.svg.network1.neighbor = neighbor1
            const neighbor2 = part.getNeighbor(part, round_random(renderParams.network.minDist, renderParams.network.maxDist))
            part.svg.network2 = new SVGLine(part.pos, neighbor2.pos, renderParams.mirror)
            part.svg.network2.stroke(renderParams.network.color + '44')
            part.svg.network2.strokeWeight(renderParams.network.thickness)
            part.svg.network2.neighbor = neighbor2
        }
        if (part.svg.network1) {
            part.svg.network1.set(part.pos, part.svg.network1.neighbor.pos)
            part.svg.network1.visible(true)
            part.svg.network2.set(part.pos, part.svg.network2.neighbor.pos)
            part.svg.network2.visible(true)
        }
    }

    if (part.withDoughnut) {
        if (!part.svg.doughnut) {
            part.svg.doughnut = new SVGCircle(part.pos.x, part.pos.y, 5, renderParams.mirror)
            if (renderParams.line) part.svg.doughnut.stroke(renderParams.line.color)
            else if (renderParams.backLine) part.svg.doughnut.stroke(renderParams.backLine.color)
            else if (renderParams.offsetLine) part.svg.doughnut.stroke(renderParams.offsetLine.color)
            else if (renderParams.dots) part.svg.doughnut.stroke(renderParams.dots.color)
            else part.svg.doughnut.stroke(mainColors[1])
            part.svg.doughnut.fill(mainColors[0])
        }
        part.svg.doughnut.set(part.pos.x, part.pos.y)
        part.svg.doughnut.visible(true)
    }

    if (renderParams.dots) {
        if (!part.svg.dots) {
            part.svg.dots = createDotsSVG()
            if (renderParams.mirror) part.svg.dotsMirror = createDotsSVG()
        }
        part.svg.dots.setAttribute('transform', `translate(${part.pos.x},${part.pos.y}) rotate(${part.offsetDir.angle * 180 / Math.PI})`)

        if (renderParams.mirror) {
            part.svg.dotsMirror.setAttribute('transform', `translate(${width - part.pos.x},${part.pos.y}) rotate(${180 + part.offsetDir.angle * 180 / Math.PI})`)
            const isVisible = part.pos.x > width / 2
            part.svg.dots.setAttribute('visibility', isVisible ? 'visible' : 'hidden')
            part.svg.dotsMirror.setAttribute('visibility', isVisible ? 'visible' : 'hidden')
        }
    }
}

function getColor(r, g, b, a) {
    if (!g) {
        if (Array.isArray(r)) return `rgb(${r[0]},${r[1]},${r[2]})`
        else return `rgb(${r},${r},${r})`
    }
    if (!b) {
        if (Array.isArray(r)) return `rgba(${r[0]},${r[1]},${r[2]},${g})`
        else return `rgba(${r},${r},${r},${g})`
    }
    if (!a) return `rgb(${r},${g},${b})`
    return `rgba(${r},${g},${b},${a})`
}



// this function creates a canvas element, draws some random dots on it, 
// then creates an svg element displaying the image of the canvas
function createDotsSVG() {
    const canvas = document.createElement('canvas')
    const dpr = window.devicePixelRatio || 1;
    canvas.width = 100 * dpr
    canvas.height = 100 * dpr
    const ctx = canvas.getContext('2d')
    // ctx.scale(dpr, dpr);
    ctx.fillStyle = renderParams.dots.color + '88'

    ctx.translate(canvas.width / 2, canvas.height / 2)
    ctx.rotate(renderParams.dots.angle)
    for (let i = 0; i < renderParams.dots.sum; i++) {
        const x = random() * random() * renderParams.dots.distX * (random() < .5 ? -1 : 1)
        const y = random() * random() * renderParams.dots.distY * (random() < .5 ? -1 : 1)
        ctx.fillRect(x, y, 1, 1)
    }

    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    const img = document.createElementNS('http://www.w3.org/2000/svg', 'image')
    img.setAttribute('href', canvas.toDataURL())
    img.setAttribute('width', canvas.width / dpr)
    img.setAttribute('height', canvas.height / dpr)
    img.setAttribute('x', -canvas.width / dpr / 2)
    img.setAttribute('y', -canvas.width / dpr / 2)
    g.appendChild(img)
    svgMain.appendChild(g)
    canvas.remove()
    return g
}

