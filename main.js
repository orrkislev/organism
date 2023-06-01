const withEnds = false
const minGoodDistance = 50
const penColor = 'black'
const backgroundClr = 255

async function setup() {
    width = window.innerWidth
    height = window.innerHeight

    initSVG()
    initParticles()
    makeOrganism()

    await mainLoop()
}
setup()

async function makeOrganism() {
    mainObj = new Organism(p(width / 2, height / 2))

    await asyncGrow(mainObj, { times: 5, grow: 30, passChance: 0.999 })
    await waitFrames(50)

    // -----   EXTEND   -----
    asyncExtend(mainObj, { sum: 8, length: 10 })
    await waitFrames(80)
    await mainObj.closeBranches(80)
    await waitFrames(80)

    // -----   SPIKES   -----
    asyncGrow(mainObj, { times: 5, grow: 30, passChance: 0.5, close: 3 })
    await waitFrames(25)


    const others = await asyncMultiply(mainObj, { sum: 10, length: 3, passChance: 1, closeChance: 0 })

    const longOthers = []
    await waitFrames(50)
    while (others.length > 0){
        
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

    await waitFrames(100)
    while (longOthers.length > 0){
        const other = longOthers.pop()
        const p1 = choose(mainObj.particles)
        const p2 = choose(other.particles)
        p1.connect(p2)
        await waitFrames(1)
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
        updateParticles(7)
        organisms.forEach(o => o.updateSVG())
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
    for (let i = 0; i < sum; i++) {
        const currParticle = choose(organism.particles)
        const newParticle = currParticle.extend()
        extenders.push([newParticle])
    }
    const l = params.length || 30
    for (let i = 0; i < l; i++) {
        for (let j = 0; j < extenders.length; j++) {
            const ext = extenders[j]
            const newParticle = ext[ext.length - 1].extend()
            organism.particles.push(newParticle)
            extenders[j].push(newParticle)
        }
        if (params.wait) await waitFrames(params.wait)
    }
    return extenders
}

async function asyncMultiply(organism, params) {
    if (params.passChance) organism.passChance = params.passChance
    const others = []
    const sum =  params.sum || 1
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