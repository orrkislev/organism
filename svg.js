function initSVG() {
    svgMain = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svgMain.setAttribute('viewBox', `0 0 ${width} ${height}`);
    document.body.appendChild(svgMain);

    // on keyboard 's', save svg
    document.addEventListener('keydown', e => {
        if (e.key == 's') {
            const serializer = new XMLSerializer();
            let source = serializer.serializeToString(svgMain);

            if (!source.match(/^<svg[^>]+xmlns="http\:\/\/www\.w3\.org\/2000\/svg"/)) {
                source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
            }
            source = '<?xml version="1.0" standalone="no"?>\r\n' + source;
            var url = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(source);
            const downloadLink = document.createElement('a')
            downloadLink.href = url
            downloadLink.download = 'svg.svg'
            document.body.appendChild(downloadLink)
            downloadLink.click()
            document.body.removeChild(downloadLink)
        }
    })
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
        if (vis == this.isVisible) return
        this.element.setAttribute('visibility', vis ? 'visible' : 'hidden');
        if (this.mirror) this.mirror.element.setAttribute('visibility', vis ? 'visible' : 'hidden');
        this.isVisible = vis
    }
    remove() {
        svgMain.removeChild(this.element)
        if (this.mirror) this.mirror.remove()
    }
}












const renderParams = {
    mirror: false,
    backLine:{
        show: false,
        thickness: 10, color: 'orange',
        dashed: true,
    },
    line: {
        show: true,
        thickness: 5, color: 'black',
    },
    network: {
        show: false,
        points: round_random(4), minDist: 2, maxDist: round_random(10),
        opacity: .2, thickness: 1,
    },
    offsetLine: {
        show: false,
        thickness: 2, opacity: 1,
        rotation: 0.3,
        distance: 3, length: 0,
        density: 1,
    },
    dots: {
        show: false,
        opacity: 50,
        sum: 250, distX: 4, distY: 30,
        angle: random(Math.PI)
    },
}


function updateParticleSVG(part) {
    part.preRender()

    let sw = (part.vel.length + 1) * renderParams.line.thickness
    sw *= 1 - (part.num / particles.length)
    sw = constrain(sw, 0, 20)

    part.connections.forEach(c => {
        if ('svg' in c) {
            if (!c.svg) {
                c.svg = { }
                
                if (renderParams.backLine.show) {
                    c.svg.back = new SVGLine(part.pos, c.body.pos, renderParams.mirror)
                    c.svg.back.strokeWeight(renderParams.backLine.thickness)
                    c.svg.back.stroke(renderParams.backLine.color)
                    if (!renderParams.backLine.dashed) svgMain.insertBefore(c.svg.back.element, svgMain.firstChild)
                }
                c.svg.main = new SVGLine(part.pos, c.body.pos, renderParams.mirror)
                c.svg.main.stroke(renderParams.line.color)
            }
            let showLine = part.pos.dist(c.body.pos) < minGoodDistance

            c.svg.main.set(part.pos, c.body.pos)
            c.svg.main.strokeWeight(sw)
            c.svg.main.visible(showLine)
            if (c.svg.back) {
                c.svg.back.set(part.pos, c.body.pos)
                c.svg.back.visible(showLine)
            }
        }
    })

    if (renderParams.offsetLine.show) {
        if (!part.svg.offset) {
            const p1 = p(-renderParams.offsetLine.length, -renderParams.offsetLine.distance)
            const p2 = p(renderParams.offsetLine.length, -renderParams.offsetLine.distance)
            part.svg.offset = new SVGLine(p1, p2, renderParams.mirror)
            part.svg.offset.stroke(hexColor(0, 0, 0, renderParams.offsetLine.opacity))
            part.svg.offset.strokeWeight(renderParams.offsetLine.thickness)
        }
        part.svg.offset.element.setAttribute('transform', `translate(${part.pos.x},${part.pos.y}) rotate(${renderParams.offsetLine.rotation * 180 + part.offsetDir.angle * 180 / Math.PI})`)
        part.svg.offset.visible(true, part.pos.x)
    }

    if (renderParams.network.show) {
        if (!part.svg.network1 && part.age > 30) {
            const neighbor1 = part.getNeighbor(part, round_random(renderParams.network.minDist, renderParams.network.maxDist))
            part.svg.network1 = new SVGLine(part.pos, neighbor1.pos, renderParams.mirror)
            part.svg.network1.stroke(hexColor(0, 0, 0, renderParams.network.opacity))
            part.svg.network1.strokeWeight(renderParams.network.thickness)
            part.svg.network1.neighbor = neighbor1
            const neighbor2 = part.getNeighbor(part, round_random(renderParams.network.minDist, renderParams.network.maxDist))
            part.svg.network2 = new SVGLine(part.pos, neighbor2.pos, renderParams.mirror)
            part.svg.network2.stroke(hexColor(0, 0, 0, renderParams.network.opacity))
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
}

function hexColor(r, g, b, a) {
    return `rgba(${r},${g},${b},${a})`
}