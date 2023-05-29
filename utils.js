let promises = []
let tickCount = 0
let tickTime = 0
function tick(tickSize = 1) {
    // tickCount += tickSize
    // while (tickCount > lastTick + 1) {
        promises = promises.filter(p => {
            if (p.frame <= tickCount) {
                p.resolve()
                return false
            }
            return true
        })
        // lastTick++
    // }
    tickCount++

    if (tickCount % 300 == 0) {
        console.log(round(300 / (performance.now() - tickTime) * 1000) + 'fps, ' + particles.length + ' particles')
        tickTime = performance.now()
    }
}
async function waitFrames(num) {
    const currFrameCount = frameCount
    const newPromise = new Promise((resolve, reject) => {
        promises.push({ frame: currFrameCount + num, resolve })
    })
    promises.push(newPromise)
    return newPromise
}




function line_vvm(v1, v2, mag) {
    if (mag) {
        v2 = p5.Vector.sub(v2, v1).setMag(mag).add(v1)
    }
    line(v1.x, v1.y, v2.x, v2.y)
}

function xy2i(x, y) {
    return 4 * (y * density * width * density + x * density);
}