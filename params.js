function initParams() {
    mainColors = choose(palletes).sort(() => random() - 0.5)

    renderParams = {
        mirror: false,

        line: {
            show: true, color: mainColors[1],
            thickness: 2, aged: true,
        },
        backLine: {
            show: random() < .5,
            thickness: random(5, 15), color: choose([mainColors[2], mainColors[0]]),
            dashed: random() < 0.5,aged:true
        },

        network: {
            show: random() < 0.2,
            color: choose([mainColors[1], mainColors[2]]) + '44',
            points: round_random(4), minDist: 2, maxDist: 3,
            thickness: 1,
        },
        offsetLine: {
            show: random() < 0.8,
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