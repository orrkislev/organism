const withEnds = false
const minGoodDistance = 20
const penColor = 'black'
const backgroundClr = 255

async function setup() {
    initP5(true)
    density = pixelDensity()
    initPaper(false)

    wallRadius = min(width, height) / 2
    hashGrid = new HashGrid(width, height, 50)

    initCounter = 0
    initImage()

    noLoop()
    await myDraw()
}

async function initImage() {
    stroke(penColor)
    fill(penColor)

    mainObj = new Organism(p(width / 2, height / 2))
    for (let i = 0; i < 1; i++) {
        mainObj.passChance = 0.9
        await mainObj.grow(3)
        mainObj.passChance = 0.999
        await mainObj.grow(5)
        await mainObj.closeBranches(7)
        await waitFrames(2)
    }
    // mainObj.passChance = 0.9
    // await mainObj.grow(20)
    // await mainObj.grow(20)
    await waitFrames(40)

    // mainObj.passChance = 0.999
    // let extenders = []
    // for (let i = 0; i < 8; i++) {
    //     const currParticle = choose(mainObj.particles)
    //     const newParticle = currParticle.extend()
    //     extenders.push([newParticle])
    //     // for (let t=0;t<150;t++){
    //     //     const ext = extenders[extenders.length - 1]
    //     //     const newParticle = ext[ext.length - 1].extend()
    //     //     mainObj.particles.push(newParticle)
    //     //     ext.push(newParticle)
    //     // }
    //     // await waitFrames(5)
    // }

    // for (let i = 0; i < 30; i++) {
    //     for (let j = 0; j < extenders.length; j++) {
    //         const ext = extenders[j]
    //         const newParticle = ext[ext.length - 1].extend()
    //         newParticle.applyForce(p(.5,.5))
    //         mainObj.particles.push(newParticle)
    //         extenders[j].push(newParticle)
    //     }
    //     // if (i%10==0){
    //     //     const extender = choose(extenders)
    //     //     const lastParticle = extender[extender.length - 1]
    //     //     const newParticle = lastParticle.extend()
    //     //     newParticle.seperationGroup = []
    //     //     extenders.push([newParticle])
    //     //     await mainObj.closeBranches(1)
    //     // }
    //     await waitFrames(1)
    // }
    // await waitFrames(25)
    // await mainObj.closeBranches(30)

    // await waitFrames(25)

    // mainObj.passChance = 0.5
    // for (let i = 0; i < 5; i++) {
    //     await mainObj.grow(30)
    //     // await mainObj.closeBranches(3)
    //     await waitFrames(3)
    // }




    mainObj.passChance = 0.998
    let count = 0
    others = []
    while (count < 150) {
        newOrg = await mainObj.extend()
        // newOrg = new Organism(p(width / 2, height / 2).add(pointFromAngle(random(360), width/2)))
        if (!newOrg) break
        newOrg.passChance = 1
        const r = round_random(3, 15)
        newOrg.grow(3)
        await newOrg.closeBranches(2)
        others.push(newOrg)
        count += 3
    }

    await waitFrames(25)
    while (others.length > 1) {
        other1 = choose(others)
        other2 = choose(others)
        if (other1 == other2) continue
        const lastParticle1 = other1.particles[other1.particles.length - 1]
        const otherIndex = floor(random() * random(other2.particles.length - 1))
        const lastParticle2 = other2.particles[otherIndex]
        lastParticle1.connect(lastParticle2)
        other1.particles.push(...other2.particles)
        others = others.filter(o => o != other2)
        await waitFrames(1)
    }

    // areas = await mainObj.getAreas()
    // areas = areas.slice(0, 10)
    // for (area of areas) {
    //     const obj = new Organism(area.position)
    //     obj.passChance = 0.99
    //     obj.grow(random(5, 25))
    //     await waitFrames(10)
    //     obj.closeBranches(1)
    // }
}





let areas = []
async function myDraw() {
    while (true) {
        background(backgroundClr)
        // meshGradientBg()
        const n = 1
        updateParticles(n * 7)
        organisms.forEach(o => o.show())
        organisms.forEach(o => o.show2())
        tick(n)


        if (renderParams.mirror) {
            scale(-1, 1)
            copy(0, 0, width / 2, height, -width, 0, width / 2, height)
            // scale(1, -1)
            // copy(0, 0, width, height/2, 0, -height, width, height/2)
        }

        await timeout(1)
    }
}