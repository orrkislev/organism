function initParams() {
    mainColors = choose(palletes).sort(() => random() - 0.5)

    const withAged = random() < 0.5

    renderParams = {
        mirror: random()<0.5,

        line: {
            show: random()<0.5, color: mainColors[1],
            thickness: 2, aged: withAged,
        },
        backLine: {
            show: random() < .5,
            thickness: random(5, 15), color: choose([mainColors[2], mainColors[0]]),
            dashed: random() < 0.5, aged: withAged && random() < 0.5,
        },

        network: {
            show: random() < .5,
            color: choose([mainColors[1], mainColors[2]]) + '44',
            points: round_random(4), minDist: 2, maxDist: 3,
            thickness: 1,
        },
        offsetLine: {
            show: random() < .5,
            color: choose([mainColors[1], mainColors[2]]),
            thickness: 2,
            rotation: 0,
            distance: random(-5, 5), length: random(2),
        },
        dots: {
            show: random() < .5,
            color: choose([mainColors[2], mainColors[1]]) + '88',
            sum: random(50,300), distX: random(4,40), distY: random(4,10),
            angle: random(Math.PI)
        },
    }
}