const withEnds = false
const minGoodDistance = 50


async function setup() {
    initParams()

    document.body.setAttribute('style', `
        background: radial-gradient(circle, ${mainColors[0]} 0% , ${mainColors[1]} 500%);
    `)


    initSVG()
    initParticles()
    makeOrganism()

    await mainLoop()
}
setup()

async function makeOrganism() {
    mainObj = new Organism(p(width / 2, height / 2))

    await asyncGrow(mainObj, { times: initialGrowth / 50, grow: 50, passChance: random(.5, 1), close: round_random(5) })
    await waitFrames(100)


    // -----   EXTEND   -----
    await asyncExtend(mainObj, { sum: extenders, length: () => extendersLength * random(.8, 1.2), })
    await waitFrames(80)
    await mainObj.closeBranches(random() * random() * 6)
    await waitFrames(80)

    if (moreGrowth > 0)
        await asyncGrow(mainObj, { times: moreGrowth / 5, grow: moreGrowth, passChance: 0.99, close: 5 })

    // -----   SPIKES   -----
    if (withSpikes) {
        asyncGrow(mainObj, { times: 5, grow: 30, passChance: 0.5, close: 3 })
        await waitFrames(25)
    }


    if (children > 0) {
        const others = await asyncMultiply(mainObj, { sum: 10, length: 3, passChance: 1, closeChance: random() })

        if (childrenConnect) {

            const longOthers = []
            await waitFrames(100)
            while (others.length > 0) {

                const other1 = others.pop()
                let other2, other3, other4
                if (others.length > 0) other2 = others.pop()
                if (others.length > 0) other3 = others.pop()
                if (others.length > 0) other4 = others.pop()
                if (other4) {
                    other4.particles[0].connect(other3.particles[other3.particles.length - 1])
                    other3.particles.push(...other4.particles)
                }
                if (other3) {
                    other3.particles[0].connect(other2.particles[other2.particles.length - 1])
                    other2.particles.push(...other3.particles)
                }
                if (other2) {
                    other2.particles[0].connect(other1.particles[other1.particles.length - 1])
                    other1.particles.push(...other2.particles)
                }
                longOthers.push(other1)
            }

            if (childrenMerge) {
                await waitFrames(100)
                while (longOthers.length > 0) {
                    const other = longOthers.pop()
                    const p1 = choose(mainObj.particles)
                    const p2 = choose(other.particles)
                    p1.connect(p2)
                    await waitFrames(1)
                }
            }
        }
    }

    // // / -----------------
    // // connect the other organisms
    // // / -----------------
    // await waitFrames(25)
    // while (others.length > 1) {
    //     other1 = choose(others)
    //     other2 = choose(others)
    //     if (other1 == other2) continue
    //     const lastParticle1 = other1.particles[other1.particles.length - 1]
    //     const otherIndex = floor(random(other2.particles.length - 1))
    //     const lastParticle2 = other2.particles[otherIndex]
    //     lastParticle1.connect(lastParticle2)
    //     other1.particles.push(...other2.particles)
    //     others = others.filter(o => o != other2)
    //     await waitFrames(1)
    // }

    // await waitFrames(120)
    // await asyncGrow(others[0], { times: 30, grow: 5, passChance: 0.5 })

    // areas = await mainObj.getAreas().slice(0, 10)
    // for (area of areas) {
    //     const obj = new Organism(area.position)
    //     await asyncGrow(obj, { times: 1, grow: 30, passChance: 0.99, close: 1, wait: 10 })
    // }
}





async function mainLoop() {
    while (true) {
        updateParticles(animationSpeed)
        organisms.forEach(o => o.updateSVG())
        walkers.forEach(w => w.walk())
        tick()
        await timeout(1)
    }
}





async function asyncGrow(organism, params) {
    const t = params.times || 1
    for (let i = 0; i < t; i++) {
        await organism.grow(params.grow || 1, params.passChance || 0.99)
        if (params.close) await organism.closeBranches(params.close)
        if (params.wait) await waitFrames(params.wait)
    }
}

async function asyncExtend(organism, params) {
    const sum = params.sum || 1
    const extenders = []
    const lengths = []
    for (let i = 0; i < sum; i++) {
        const currParticle = choose(organism.particles)
        const newParticle = currParticle.extend()
        extenders.push({ particles: [newParticle], length: getParam(params.length, i) })
    }
    while (extenders.some(e => e.particles.length < e.length)) {
        extenders.forEach(e => {
            if (e.particles.length < e.length) {
                const newParticle = e.particles[e.particles.length - 1].extend()
                organism.particles.push(newParticle)
                e.particles.push(newParticle)
            }
        })
        if (params.wait) await waitFrames(params.wait)
    }
    return extenders
}

async function asyncMultiply(organism, params) {
    if (params.passChance) organism.passChance = params.passChance
    const others = []
    const sum = params.sum || 1
    for (let i = 0; i < sum; i++) {
        const newOrg = await mainObj.extend()
        if (!newOrg) break
        newOrg.passChance = 1
        await newOrg.grow(params.length instanceof Function ? params.length() : params.length)
        if (params.closeChance && random() < params.closeChance) newOrg.closeBranches(1)
        others.push(newOrg)
    }
    return others
}


function getParam(param, def) {
    if (param instanceof Function) return param()
    return param || def
}