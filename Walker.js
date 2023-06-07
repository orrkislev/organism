const walkers = []
class Walker {
    constructor(organism) {
        this.organism = organism
        this.lastPart = choose(organism.particles)
        this.pos = this.lastPart.pos.clone()
        this.svg = new SVGCircle(this.pos.x, this.pos.y, 5, 'black')
        this.getTarget()
        walkers.push(this)
    }
    getTarget() {
        let availableConnections = [...this.lastPart.connections]
        availableConnections = availableConnections.sort((a, b) => random(-1, 1))
        availableConnections = availableConnections.sort((a, b) => a.body == this.targetPart ? -1 : 1)
        if (availableConnections.length == 0) return this.lastPart
        this.targetPart = availableConnections.shift().body
        return this.targetPart
    }
    walk() {
        this.pos.lerp(this.targetPart.pos, 0.4)
        if (this.pos.dist(this.targetPart.pos) < 1) {
            this.lastPart = this.targetPart
            this.getTarget()
        }
        this.svg.set(this.pos.x, this.pos.y)
    }

}