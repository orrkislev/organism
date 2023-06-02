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