
let avrgTime1 = 0
function updateParticles() {
    for (let t = 0; t < 5; t++) {
        for (let i = 0; i < particles.length; i++)
            for (let j = i + 1; j < particles.length; j++)
                particles[i].separationOther(particles[j])

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
    }
    extend() {
        const newParticle = new Particle(this.pos.clone(), this.organism)
        let dir = p(random(-1, 1), random(-1, 1))
        if (this.connections.length > 0) {
            const other = choose(this.connections).body.pos
            dir = myPoint.sub(other, this.pos).normalize(5).rotate(random(-5,5))
        }
        newParticle.pos.add(dir)
        this.connect(newParticle, 1)
        return newParticle
    }
    connect(other, targetLength) {
        if (!targetLength) targetLength = this.pos.getDistance(other.pos)
        this.connections.push({ body: other, length: targetLength })
        other.connections.push({ body: this, length: targetLength })
    }
    disconnect(other) {
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
        particles = particles.filter(p => p != this)
    }

    separationOther(other) {
        if (this.seperationGroup && !this.seperationGroup.includes(other)) return
        if (other == this) return
        if (this.connections.find(c => c.body == other)) return

        const d = this.pos.dist(other.pos)
        if (d < 1 || d > 30) return
        const force = myPoint.sub(this.pos, other.pos).normalize(.5 / d)
        this.applyForce(force)
        other.applyForce(force.multiply(-1))
    }

    avoidWalls() {
        const d = Math.sqrt((this.pos.x - width / 2) ** 2 + (this.pos.y - height / 2) ** 2) - width * .4
        if (d < 0) return
        const force = myPoint.sub(p(width / 2, height / 2),this.pos).normalize(d * 0.1)
        this.applyForce(force)
    }

    update() {
        this.connections.forEach(c => {
            const d = this.pos.dist(c.body.pos) - c.length
            const force = myPoint.sub(c.body.pos, this.pos).normalize(d * 0.1)
            this.applyForce(force)
        })
        this.vel.add(this.acc)
        // if (this.vel.length > 1) {
            // this.vel.normalize()
        // }
        this.vel.mult(.9)
        this.pos.add(this.vel)
        this.acc.zero()
        this.age++
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
            const dirTo = myPoint.sub(c.body.pos,this.pos)
            dir.add(dirTo.normalize().rotate(90))
            if (abs(dirTo.length - c.length) > minGoodDistance) return
            this.drawLines.push(c.body.pos)
        })
        this.offsetDir = pointLerp(this.offsetDir, dir, .3)
    }
}