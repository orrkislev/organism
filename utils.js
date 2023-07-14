let promises = []
let tickCount = 0
function tick() {
    promises = promises.filter(p => {
        if (p.frame <= tickCount) {
            p.resolve()
            return false
        }
        return true
    })
    tickCount++
}
async function waitFrames(num) {
    const currFrameCount = tickCount
    const newPromise = new Promise((resolve, reject) => {
        promises.push({ frame: currFrameCount + num, resolve })
    })
    promises.push(newPromise)
    return newPromise
}
function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const min = Math.min
const max = Math.max
const abs = Math.abs
const floor = Math.floor
const round = Math.round
const constrain = (n, min, max) => Math.min(Math.max(n, min), max)
const map = (n, start1, stop1, start2, stop2) => ((n - start1) / (stop1 - start1)) * (stop2 - start2) + start2


let randomCount = 0
const random = (a = 1, b = 0) => {
    randomCount++
    return prng() * (b - a) + a
}
const randomRange = (range) => random(range[0], range[1])
const round_random = (a = 1, b = 0) => Math.floor(random(a, b + 1))
const choose = (arr) => arr[Math.floor(random(arr.length))]


class HashGrid {
    constructor(w, h, cellSize) {
        this.w = w; this.h = h; this.cellSize = cellSize
        this.gridWidth = Math.ceil(w / cellSize)
        this.gridHeight = Math.ceil(h / cellSize)
        this.grid = new Array(this.gridWidth * this.gridHeight).fill().map(() => [])
    }
    getCellXY(pos) {
        const x = Math.floor(pos.x / this.cellSize)
        const y = Math.floor(pos.y / this.cellSize)
        return [
            Math.max(Math.min(x, this.gridWidth - 1), 0),
            Math.max(Math.min(y, this.gridHeight - 1), 0)
        ]
    }
    add(particle) {
        const [x, y] = this.getCellXY(particle.pos)
        const i = x + y * this.gridWidth
        this.grid[i].push(particle)
        return new HashGridClient(this, particle, x, y)
    }
    query(particle, radius) {
        const x0 = Math.max(Math.floor((particle.pos.x - radius) / this.cellSize), 0)
        const y0 = Math.max(Math.floor((particle.pos.y - radius) / this.cellSize), 0)
        const x1 = Math.min(Math.ceil((particle.pos.x + radius) / this.cellSize), this.gridWidth)
        const y1 = Math.min(Math.ceil((particle.pos.y + radius) / this.cellSize), this.gridHeight)

        const found = []
        for (let y = y0; y < y1; y++) {
            for (let x = x0; x < x1; x++) {
                const i = x + y * this.gridWidth
                found.push(...this.grid[i])
            }
        }
        return found
    }
    remove(particle, cellX, cellY) {
        const i = cellX + cellY * this.gridWidth
        const index = this.grid[i].indexOf(particle)
        if (index > -1) this.grid[i].splice(index, 1)
    }
}

class HashGridClient {
    constructor(grid, particle, cellX, cellY) {
        this.grid = grid; this.particle = particle; this.cellX = cellX; this.cellY = cellY
    }
    update() {
        const [newX, newY] = this.grid.getCellXY(this.particle.pos)
        if (newX != this.cellX || newY != this.cellY) {
            this.grid.remove(this.particle, this.cellX, this.cellY)
            this.grid.add(this.particle)
            this.cellX = newX; this.cellY = newY
        }
    }

}



function lerp(a, b, t) {
    return a * (1 - t) + b * t
}
function hexToRgb(hex) {
    const r = parseInt(hex.substring(1, 3), 16)
    const g = parseInt(hex.substring(3, 5), 16)
    const b = parseInt(hex.substring(5, 7), 16)
    return [r, g, b]
}
function distBetweenHexes(c1, c2) {
    const [r1, g1, b1] = hexToRgb(c1)
    const [r2, g2, b2] = hexToRgb(c2)
    return distBetweenRgbs(r1 / 255, g1 / 255, b1 / 255, r2 / 255, g2 / 255, b2 / 255)
}
function distBetweenRgbs(r1, g1, b1, r2, g2, b2) {
    return Math.sqrt((r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2)
}
function toHex(d) {
    return  ("0"+(Number(d).toString(16))).slice(-2).toUpperCase()
}
function lerpHexColors(c1, c2, t) {
    const [r1, g1, b1] = hexToRgb(c1)
    const [r2, g2, b2] = hexToRgb(c2)
    const r = round(lerp(r1, r2, t))
    const g = round(lerp(g1, g2, t))
    const b = round(lerp(b1, b2, t))
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}
