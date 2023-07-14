const organisms = []
class Organism {
    constructor(pos) {
        this.base = new Particle(pos, this)
        this.particles = [this.base]
        this.maxConnections = random(2, 5)
        this.passChance = random(.8, 1)
        organisms.push(this)
    }
    async grow(sum = 1, passChance = this.passChance) {
        this.passChance = passChance
        const newParticles = []
        for (let i = 0; i < sum; i++) {
            let lastParticle = null
            let currParticle = this.base
            currParticle = choose(this.particles)
            let tries = 0
            while (tries++ < 500) {
                const otherConnections = currParticle.connections.filter(c => c.body != lastParticle)

                if ((otherConnections.length > this.maxConnections) ||
                    (otherConnections.length > 0 && random() < this.passChance * 0.1 + 0.9)) {
                    const other = choose(otherConnections).body
                    lastParticle = currParticle
                    currParticle = other
                    continue
                }
                break
            }
            const newParticle = currParticle.extend()
            this.particles.push(newParticle)
            newParticles.push(newParticle)
            if (i % 2 == 0) await waitFrames(1)
        }
        return newParticles
    }

    async extend() {
        const newParticles = await this.grow()
        if (newParticles.length == 0) return
        const newParticle = newParticles[0]
        const pos = newParticle.pos.clone()
        newParticle.kill()
        this.particles = this.particles.filter(p => p != newParticle)
        return new Organism(pos)
    }

    async closeBranches(times = 1) {
        if (!this.closedAreas) this.closedAreas = []
        for (let i = 0; i < times; i++) {
            const ends = this.particles.filter(p => p.isEnding())
            if (ends.length < 2) return false
            const e1 = choose(ends)
            const ends2 = ends.filter(e => e != e1).sort((a, b) => a.pos.dist(e1.pos) - b.pos.dist(e1.pos))
            const e2 = ends2[0]
            e1.connect(e2, 1)
            await waitFrames(1)
        }
        return true
    }

    getBranches(inner = true) {
        let branches = []
        const branchEnds = this.particles.filter(p => p.connections.length > 2)
        branchEnds.forEach(be => {
            be.connections.forEach(c => {
                const branch = [be]
                let current = c.body
                let last = be
                while (current.connections.length == 2) {
                    branch.push(current)
                    const next = current.connections.find(c => c.body != last)
                    if (next) {
                        last = current
                        current = next.body
                    }
                    else break
                }
                if (current) branch.push(current)
                branches.push(branch)
            })
        })
        // if (inner) branches = branches.filter(b => b[b.length - 1].connections.length > 1)
        let newBranches = []
        branches.forEach(b => {
            const start = b[0]
            const end = b[b.length - 1]
            if (newBranches.find(nb => nb[0] == end && nb[nb.length - 1] == start)) return
            newBranches.push(b)
        })
        branches = newBranches

        branches = branches.map(b => new Path([...b.map(particle => p(particle.pos.x, particle.pos.y))]))

        newBranches = []
        for (let i = 0; i < branches.length; i++) {
            const b1 = branches[i]
            const crossings = []
            for (let j = i; j < branches.length; j++) {
                const b2 = branches[j]
                crossings.push(...b1.getCrossings(b2))
            }
            if (crossings.length > 0) {
                crossings.sort((a, b) => b.offset - a.offset)
                let pathToCut = b1
                crossings.forEach(c => {
                    const newPath = pathToCut.splitAt(c.offset)
                    newBranches.push(newPath)
                })
                newBranches.push(pathToCut)
            } else newBranches.push(b1)
        }
        branches = newBranches
        // branches.forEach(b=>b.smooth())


        return branches
    }

    getAreas() {
        let branches = []
        const branchEnds = this.particles.filter(p => p.connections.length > 2)
        branchEnds.forEach(be => {
            be.connections.forEach(c => {
                const branch = [be]
                let current = c.body
                let last = be
                while (current.connections.length == 2) {
                    branch.push(current)
                    const next = current.connections.find(c => c.body != last)
                    if (next) {
                        last = current
                        current = next.body
                    }
                    else break
                }
                if (current) branch.push(current)
                branches.push(branch)
            })
        })

        // remove branches where the end is an ending
        branches = branches.filter(b => b[b.length - 1].connections.length > 1)
        // remove branches that are closed loops, and add them to areas
        let areas = branches.filter(b => b[0] == b[b.length - 1])
        branches = branches.filter(b => b[0] != b[b.length - 1])

        // make intersections
        let intersections = []
        branchEnds.forEach(be => {
            const intersectionBranches = branches.filter(b => b[0] == be)
            intersectionBranches.sort((b1, b2) => {
                const a1 = (b1[1].pos.subtract(b1[0].pos).angle + 360) % 360
                const a2 = (b2[1].pos.subtract(b2[0].pos).angle + 360) % 360
                return a1 - a2
            })
            intersections.push({
                start: be,
                branches: intersectionBranches.map(b => ({ branch: b, end: b[b.length - 1] }))
            })
        })

        // remove empty intersections, or intersections with only one branch
        intersections = intersections.filter(i => i.branches.length > 1)

        for (let areaI = 0; areaI < 100; areaI++) {
            intersections = intersections.filter(i => i.branches.length > 0)
            if (intersections.length == 0) break

            let area = []
            const startInt = choose(intersections)
            let currBrnch = startInt.branches[0]
            let lastInt = startInt
            let tries = 0
            while (tries++ < 100) {
                lastInt.branches = lastInt.branches.filter(b => b != currBrnch)
                area.push(...currBrnch.branch)
                const nextInt = intersections.find(i => i.start == currBrnch.end)
                if (!nextInt) {
                    area = []
                    break
                }
                if (nextInt == startInt) break
                if (nextInt.branches.length == 0) break
                const lastIndex = nextInt.branches.findIndex(b => b.end == currBrnch.branch[0])
                const nextIndex = (lastIndex + 1) % nextInt.branches.length
                const nextBrnch = nextInt.branches[nextIndex]
                currBrnch = nextBrnch
                lastInt = nextInt
            }
            if (area.length > 0) areas.push(area)
        }
        areas = areas.map(a => new Path([...a.map(particle => p(particle.pos.x, particle.pos.y))]))
        return areas
    }

    updateSVG() {
        this.particles.forEach(updateParticleSVG)
    }
}
