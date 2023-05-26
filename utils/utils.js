let finalImage
function finishImage() {
    finalImage = get()
    // windowResized()
}

// function windowResized() {
//     if (!finalImage) finalImage = get()
//     resizeCanvas(min(windowWidth, windowHeight), min(windowWidth, windowHeight));
//     resetMatrix()
//     image(finalImage, 0, 0, width, height)
// }

function preload() {
    if (typeof preloadShader === "function") preloadShader()
    if (typeof preloadFont === "function") preloadFont()
    if (typeof preloadImage === "function") preloadImage()
}


const v = (x, y, z) => createVector(x, y, z)
const p = (x, y) => new myPoint(x, y)
const vdist = (a, b) => p5.Vector.dist(a, b)

const random = (a = 1, b = 0) => fxrand() * (b - a) + a
const randomRange = (range) => random(range[0], range[1])
const round_random = (a = 1, b = 0) => Math.floor(random(a, b + 1))
const choose = (arr) => arr[Math.floor(random(arr.length))]

class PoissonDiscSampler{
    constructor(w, h, r, k = 30) {
        this.w=w;this.h=h;this.r=r;this.k=k
        this.r2 = r * r
        this.cellSize = r / Math.SQRT2
        this.gridWidth = Math.ceil(w / this.cellSize)
        this.gridHeight = Math.ceil(h / this.cellSize)
        this.grid = new Array(this.gridWidth * this.gridHeight)
        this.queue = []
        this.queue.push(this.samplePoint(random(w), random(h)))
    }
    samplePoint(x, y) {
        const p = v(x, y)
        const i = Math.floor(x / this.cellSize)
        const j = Math.floor(y / this.cellSize)
        this.grid[i + j * this.gridWidth] = p
        this.queue.push(p)
        return p
    }
    sample() {
        while (this.queue.length) {
            const i = Math.floor(random(this.queue.length))
            const s = this.queue[i]
            for (let j = 0; j < this.k; j++) {
                const a = random(360)
                const r = Math.sqrt(random(3) * this.r2 + this.r2)
                const x = s.x + r * cos(a)
                const y = s.y + r * sin(a)
                if (0 <= x && x < this.w && 0 <= y && y < this.h && !this.isNearby(x, y)) {
                    return this.samplePoint(x, y)
                }
            }
            this.queue[i] = this.queue[this.queue.length - 1]
            this.queue.pop()
        }
    }
    isNearby(x, y) {
        const i = Math.floor(x / this.cellSize)
        const j = Math.floor(y / this.cellSize)
        const i0 = Math.max(i - 2, 0)
        const j0 = Math.max(j - 2, 0)
        const i1 = Math.min(i + 3, this.gridWidth)
        const j1 = Math.min(j + 3, this.gridHeight)
        for (let j = j0; j < j1; j++) {
            const o = j * this.gridWidth
            for (let i = i0; i < i1; i++) {
                const s = this.grid[o + i]
                if (s) {
                    const dx = s.x - x
                    const dy = s.y - y
                    if (dx * dx + dy * dy < this.r2) {
                        return true
                    }
                }
            }
        }
        return false
    }
}



Array.prototype.pushArray = function pushArray(arr) {
    arr.forEach(element => this.push(element));
}
Array.prototype.get = function get(i) {
    return this[i % this.length]
}
Array.prototype.rotateShape = function rotateShape(a) {
    const sumToRotate = this.length * a / 360
    for (let i = 0; i < sumToRotate; i++) this.push(this.shift())
    return this
}
function applyRemove(func) {
    push()
    noStroke()
    fill(0)
    blendMode(REMOVE)
    func()
    pop()
}

const quadTreeMax = 10
class QuadTree{
    constructor(x, y, w, h, parent) {
        this.x = x; this.y = y; this.w = w; this.h = h
        this.topleft = p(x, y); this.topright = p(x + w, y); 
        this.bottomleft = p(x, y + h); this.bottomright = p(x + w, y + h)
        this.parent = parent
        this.points = []
        this.children = null
    }
    contains(particle) {
        return particle.pos.x >= this.x && particle.pos.x < this.x + this.w && particle.pos.y >= this.y && particle.pos.y < this.y + this.h
    }
    insert(particle) {
        if (!this.contains(particle)) return false
        if (this.points && this.points.length < quadTreeMax) {
            this.points.push(particle)
            return true
        }
        if (!this.children) this.split()
        return this.children.some(child => child.insert(particle))
    }
    split() {
        const w = this.w / 2
        const h = this.h / 2
        this.children = [
            new QuadTree(this.x, this.y, w, h, this),
            new QuadTree(this.x + w, this.y, w, h, this),
            new QuadTree(this.x, this.y + h, w, h, this),
            new QuadTree(this.x + w, this.y + h, w, h, this)
        ]
        this.points.forEach(point => this.children.some(child => child.insert(point)))
        this.points = null
    }

    // if the boundary of this quadtree intersects with the circle, add all points in this quadtree to found
    queryHelper(particle, radius) {
        if (this.contains(particle)) return true
        if (this.topleft.getDistance(particle.pos) < radius) return true
        if (this.topright.getDistance(particle.pos) < radius) return true
        if (this.bottomleft.getDistance(particle.pos) < radius) return true
        if (this.bottomright.getDistance(particle.pos) < radius) return true
        return false
    }

    query(particle, radius) {
        if (this.queryHelper(particle,radius)){
        // if (this.x + this.w < center.x - radius || this.x > center.x + radius || this.y + this.h < center.y - radius || this.y > center.y + radius) return
            if (this.points) return this.points
            else return this.children.reduce((found,child) => found.concat(child.query(particle, radius)), []).filter(point=>point!=null)
        }
        return []
    }
    count(){
        if(this.points) return this.points.length
        else return this.children.reduce((sum, child) => sum + child.count(), 0)
    }
    draw(){
        stroke(255)
        noFill()
        rect(this.x, this.y, this.w, this.h)
        if(this.children) this.children.forEach(child => child.draw())
    }
}