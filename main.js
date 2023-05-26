const withEnds = false
const minGoodDistance = 1
const penColor = 'black'
const backgroundClr = 255

function setup() {
    initP5(true)
    density = pixelDensity()
    initPaper(false)

    initImage()
}

async function initImage() {
    stroke(penColor)
    fill(penColor)

    mainObj = new Organism(p(width / 2, height / 2))
    mainObj.passChance = 0.8
    for (let i = 0; i < 6; i++) {
        await mainObj.grow(30)
        await mainObj.closeBranches(10)
    }
    // await mainObj.grow(20)
    // mainObj.passChance = 0.9
    // await mainObj.grow(20)
    await waitFrames(40)

    let extenders = []
    for (let i = 0; i < 5; i++) {
        const currParticle = choose(mainObj.particles)
        const newParticle = currParticle.extend()
        newParticle.seperationGroup = []
        // mainObj.particles.push(newParticle)
        extenders.push([newParticle])
    }

    for (let i = 0; i < 100; i++) {
        for (let j = 0; j < extenders.length; j++) {
            const ext = extenders[j]
            const newParticle = ext[ext.length - 1].extend()
            // newParticle.seperationGroup = []
            mainObj.particles.push(newParticle)
            extenders[j].push(newParticle)
        }
        if (i%20==0){
            const extender = choose(extenders)
            const lastParticle = extender[extender.length - 1]
            const newParticle = lastParticle.extend()
            newParticle.seperationGroup = []
            extenders.push([newParticle])
            await mainObj.closeBranches(1)
        }
        await waitFrames(2)
    }
    await mainObj.closeBranches(30)
    await waitFrames(25)


    // mainObj.passChance = 0.5
    // for (let i = 0; i < 30; i++) {
    //     // await mainObj.grow(30)
    //     await mainObj.closeBranches(3)
    //     await waitFrames(15)
    // }



    // mainObj.passChance = 0.998
    // let count = 0
    // while (count < 300){
    //     newOrg = await mainObj.extend()
    //     if (!newOrg) break
    //     newOrg.passChance = 0.1
    //     const r = round_random(3,15)
    //     newOrg.grow(r)
    //     count += r
    // }

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
function draw() {
    background(backgroundClr)
    // meshGradientBg()
    updateParticles()
    organisms.forEach(o => o.show())
    organisms.forEach(o => o.show2())
    tick()


    if (renderParams.mirror) {
        scale(-1, 1)
        copy(0, 0, width / 2, height, -width, 0, width / 2, height)
    }

}