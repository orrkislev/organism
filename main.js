const withEnds = false
const minGoodDistance = 50

async function setup() {
    albaSeed = (alba.params.seed || alba._testSeed());
    window.addEventListener('keydown', (e) => {
        if (e.key == 's') {
            navigator.clipboard.writeText(albaSeed)
        }
    })


    prng = alba.prng(albaSeed);

    initParams()

    const bgColor2 = lerpHexColors(mainColors[0], mainColors[1], .2)
    
    document.querySelector('main').style.background = `radial-gradient(circle at ${Math.round(window.innerWidth/2)}px ${Math.round(window.innerHeight/2)}px, ${mainColors[0]} 0% ,${bgColor2} 100%) `


    initSVG()
    initParticles()
    makeOrganism()

    await mainLoop()
}
setup()

async function makeOrganism() {
    mainObj = new Organism(p(width / 2, height / 2))

    await asyncGrow(mainObj, { times: initialGrowth / 50, grow: 50, passChance: random(.7, 1), close: round_random(5) })
    await waitFrames(100)


    // -----   EXTEND   -----
    await asyncExtend(mainObj, { sum: extenders, length: () => extendersLength * random(.8, 1.2), })
    await waitFrames(80)
    await mainObj.closeBranches(random() * random() * 6)
    await waitFrames(80)

    if (moreGrowth > 0)
        await asyncGrow(mainObj, { times: moreGrowth / 5, grow: moreGrowth, passChance: 0.99, close: () => random(5) })

    // -----   SPIKES   -----
    if (withSpikes) {
        asyncGrow(mainObj, { times: 5, grow: 30, passChance: 0.5, close: 3 })
        await waitFrames(25)
    }


    if (children > 0) {
        const others = await asyncMultiply(mainObj, { sum: children, length: 3, passChance: 1, closeChance: random() })

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

    await waitFrames(200)

    if (alba.params.width || true) {
        html2canvas(document.body).then(canvas => {
            const canvasWidth = alba.params.width || 500
            const canvasHeight = canvasWidth / windowRatio

            const finalCanvas = document.createElement("canvas");
            const ctx = finalCanvas.getContext("2d");
            const pixelRatio = window.devicePixelRatio || 1;
            finalCanvas.width = canvasWidth * pixelRatio;
            finalCanvas.height = canvasHeight * pixelRatio;

            const scale = Math.max(finalCanvas.width / canvas.width, finalCanvas.height / canvas.height);
            ctx.translate(finalCanvas.width / 2, finalCanvas.height / 2);
            ctx.scale(scale, scale);
            ctx.translate(-canvas.width / 2, -canvas.height / 2);
            ctx.drawImage(canvas, 0, 0);



            document.body.appendChild(finalCanvas)

            alba.setComplete(true)

            // setTimeout(() => {
            //     document.body.removeChild(finalCanvas)
            // }, 1000)
        })
    }
}





async function mainLoop() {
    while (true) {
        updateParticles(animationSpeed)
        organisms.forEach(o => o.updateSVG())
        tick()
        await timeout(1)
    }
}





async function asyncGrow(organism, params) {
    const t = params.times || 1
    for (let i = 0; i < t; i++) {
        await organism.grow(params.grow || 1, params.passChance || 0.99)
        if (params.close) await organism.closeBranches(getParam(params.close))
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