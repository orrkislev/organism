
let avrgTime1 = 0
function updateParticles(times = 7) {
    for (let t = 0; t < times; t++) {
        particles.forEach(part => part.hashClient.update())
        particles.forEach(part => {
            neighbors = hashGrid.query(part, 30)
            neighbors.forEach(n => part.separationOther(n))
        })

        // for (let i = 0; i < particles.length; i++)
        //     for (let j = i + 1; j < particles.length; j++)
        //         particles[i].separationOther(particles[j])

        particles.forEach(part => {
            part.avoidWalls()
            part.update()
        })
    }
}

let particles = []
class Particle {
    constructor(pos, organism) {
        this.pos = pos; this.vel = p(0, 0); this.acc = p(0, 0)
        this.connections = []
        this.num = particles.length
        this.age = 0
        this.organism = organism
        this.offsetDir = p(0, 0)
        particles.push(this)
        this.seperated = []
        this.hashClient = hashGrid.add(this)
    }
    extend() {
        const newParticle = new Particle(this.pos.clone(), this.organism)
        let dir = p(random(-1, 1), random(-1, 1))
        if (this.connections.length > 0) {
            const other = choose(this.connections).body.pos
            dir = myPoint.sub(other, this.pos).normalize(5).rotate(random(-5, 5))
        }
        newParticle.pos.add(dir)
        this.connect(newParticle, 5)
        return newParticle
    }
    connect(other, targetLength = 5) {
        if (!targetLength) targetLength = this.pos.getDistance(other.pos)
        this.connections.push({ body: other, length: targetLength, svg: null })
        other.connections.push({ body: this, length: targetLength })
    }
    disconnect(other) {
        const connection = this.connections.find(c => c.body == other)
        if (connection.svg) Object.values(connection.svg).forEach(svg => svg.remove())
        this.connections = this.connections.filter(c => c.body != other)
        other.connections = other.connections.filter(c => c.body != this)
    }
    getNeighbor(exclude, maxDist = 0) {
        const availableConnections = this.connections.filter(c => c.body != exclude)
        if (availableConnections.length == 0) return this
        const c = choose(availableConnections)
        if (maxDist == 0) return c.body
        if (maxDist > 0) return c.body.getNeighbor(this, maxDist - 1)
    }

    kill() {
        this.connections.forEach(c => c.body.disconnect(this))
        particles = particles.filter(p1 => p1 != this)

    }

    separationOther(other) {
        if (this.seperationGroup && !this.seperationGroup.includes(other)) return
        if (other == this) return
        if (this.connections.find(c => c.body == other)) return
        if (this.seperated.includes(other)) return
        this.seperated.push(other)

        const d = this.pos.dist(other.pos)
        if (d < 1 || d > 30) return
        const force = myPoint.sub(this.pos, other.pos).normalize(.2 / d)
        this.applyForce(force)
        other.applyForce(force.mult(-1))
    }

    avoidWalls() {
        const d = this.pos.distxy(width / 2, height / 2) - wallRadius
        if (d < 0) return
        const force = myPoint.sub(p(width / 2, height / 2), this.pos).normalize(d * 0.1)
        this.applyForce(force)
    }

    update() {
        this.connections.forEach(c => {
            const d = this.pos.dist(c.body.pos) - c.length
            const force = myPoint.sub(c.body.pos, this.pos).normalize(d * 0.1)
            this.applyForce(force)
        })
        this.vel.add(this.acc)
        if (this.vel.length > 1) this.vel.normalize()
        this.vel.mult(0.9)
        this.pos.add(this.vel)
        this.acc.zero()
        this.age++
        this.seperated = []
    }
    applyForce(force) {
        this.acc.add(force)
    }
    isEnding() {
        return this.connections.length == 1
    }

    preRender() {
        this.drawLines = []

        let dir = p(0, 0)
        this.connections.forEach(c => {
            const dirTo = myPoint.sub(c.body.pos, this.pos)
            dir.add(dirTo.clone().normalize().rotate(90))
            if (abs(dirTo.length - c.length) > minGoodDistance) return
            this.drawLines.push(c.body.pos)
        })
        this.offsetDir = pointLerp(this.offsetDir, dir, .3)
    }

    updateSVG() {
        this.connections.forEach(c => {
            if ('svg' in c) {
                if (!c.svg) {
                    c.svg = { main: new SVGLine(this.pos, c.body.pos) }
                    if (renderParams.mirror) c.svg.mirror = new SVGLine(this.pos, c.body.pos)
                }
                const showLine = this.pos.dist(c.body.pos) < minGoodDistance && !(renderParams.mirror && this.pos.x < width / 2)

                let sw = (this.vel.length + 1) * renderParams.line.thickness
                // sw *= 2-2*this.num / particles.length
                sw = constrain(sw, 0, 20)

                c.svg.main.set(this.pos, c.body.pos)
                c.svg.main.strokeWeight(sw)
                c.svg.main.visible(showLine)

                if (renderParams.mirror) {
                    c.svg.mirror.setxyxy(width - this.pos.x, this.pos.y, width - c.body.pos.x, c.body.pos.y)
                    c.svg.mirror.strokeWeight(sw)
                    c.svg.mirror.visible(showLine)
                }
            }
        })
    }
}