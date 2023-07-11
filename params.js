const palletes = [
    ["#E26D02", "#252926", "#E5DDC1"],
    ["#191438", "#E51A23", "#EDDFDB"],
    ["#FEC400", "#33201B", "#5A5B64"],
    ["#F30209", "#0C0AAD", "#F4FCF8"],
    ["#7A64D8", "#E4FE02", "#161312"],
    ["#090906", "#9ed885", "#efece9"],
    ["#181a1e", "#fffaff", "#F5ED5B"],
    ["#D7A1E7", "#4406D2", "#ECEDE9"],
    ["#B5D6F4", "#023BA5", "#F4F5F4"],
    ["#f39237", "#191923", "#fbfef9"],
    ["#DB2800", "#012631", "#FCFCD6"],
    ["#1268BF", "#100C29", "#FBEFD7"],
    ["#41aa6d", "#262525", "#eaefea"],
    ["#B51612", "#0F0F0C", "#e3e3df"],
    ["#0d0b0b", "#d80056", "#ecedef"],
    ["#b80c09", "#fbfbff", "#040f16"],
    ["#3e92cc", "#fffaff", "#1e1b18"],
    ["#fa110d", "#000000", "#fec3f0"],
    ["#dd1c1a", "#fff1d0", "#06aed5"],
    ["#e63946", "#f1faee", "#1d3557"],
    ["#2b2d42", "#edf2f4", "#d90429"],
    ["#E4CA18", "#0A2349", "#0168A7"]
]

function initParams() {
    noise.seed(random(1000))

    mainColors = choose(palletes).sort(() => random() - 0.5)

    const withAged = random() < 0.5
    const showParams = [random() < 0.5, random() < 0.5, random() < 0.5, random() < 0.5]
    if (showParams.every(x => !x)) showParams[round_random(0, 3)] = true

    const [bgColor, penColor, accentColor] = mainColors

    renderParams = {
        mirror: random() < 0.35,
    }

    renderParams.circleChance = 0
    if (showParams.filter(x => x).length <= 2 && random()<0.5) {
        renderParams.circleChance = random(.2)
    }

    if (showParams[0])
        renderParams.line = {
            color: penColor,
            thickness: 2, aged: withAged, pulsing: random() < .5,
        }

    if (showParams[1]) {
        const colorOptions = [accentColor]
        if (showParams[0] || showParams[2]) colorOptions.push(bgColor)
        renderParams.backLine = {
            color: choose(colorOptions),
            thickness: random(5, 15),
            dashed: random() < 0.5, aged: withAged && random() < 0.5,
        }
    }

    if (showParams[2]) {
        renderParams.offsetLine = {
            color: choose([penColor, accentColor]),
            thickness: 2,
            rotation: 0,
            distance: random(-10, 10), length: random() < 0.3 ? 0 : random(6),
        }
    }

    if (showParams[3]) {
        renderParams.dots = {
            color: choose([penColor, accentColor]),
            sum: random(50, 300), distX: random(4, 40), distY: random(4, 10),
            angle: random(Math.PI)
        }
    }

    if (random() < 0.5) {
        renderParams.network = {
            color: choose([penColor, accentColor]),
            points: round_random(4), minDist: 2, maxDist: 3,
            thickness: 1,
        }
    }

    let growCount = 0
    initialGrowth = random(40, 160)
    growCount += initialGrowth

    extenders = 0
    extendersLength = 0
    if (random() < 0.3) {
        extenders = round_random(3, 10)
        extendersLength = map(extenders, 3, 20, 16, 3)
        growCount += extendersLength * extenders
    } else {
        const moreInitial = random(100)
        initialGrowth += moreInitial
        growCount += moreInitial
    }

    moreGrowth = random() < 0.5 ? 0 : random(10, 40)
    growCount += moreGrowth

    withSpikes = random() < 0.1
    if (withSpikes) growCount += 50

    children = 0
    if (growCount < 160 && random() < 0.5) children = round_random(3, 60)
    childrenConnect = random() < 0.5
    childrenMerge = random() < 0.5


    animationSpeed = round_random(2, 8)
}