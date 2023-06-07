const palletes = [
    ["#E26D02", "#252926", "#E5DDC1"], 
    ["#191438", "#E51A23", "#EDDFDB"], 
    ["#FEC400", "#33201B", "#5A5B64"], 
    ["#F30209", "#0C0AAD", "#F4FCF8"], 
    ["#7A64D8", "#E4FE02", "#161312"], 
    ["#efece9", "#090906", "#efece9"], 
    ["#181a1e", "#fffaff", "#181a1e"], 
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
    mainColors = choose(palletes).sort(() => random() - 0.5)

    const withAged = random() < 0.5

    renderParams = {
        mirror: random()<0.5,

        line: {
            show: random()<0.5, color: mainColors[1],
            thickness: 2, aged: withAged, pulsating: random()<0.5,
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
            distance: random(-10, 10), length: random()<0.3 ? 0 : random(6),
        },
        dots: {
            show: random() < .5,
            color: choose([mainColors[2], mainColors[1]]) + '88',
            sum: random(50,300), distX: random(4,40), distY: random(4,10),
            angle: random(Math.PI)
        },
    }

    initialGrowth = random(40,160)
    extenders = round_random(3,10)
    extendersLength = map(extenders, 3, 20, 60, 5)
    moreGrowth = random()<0.5 ? 0 : random(10, 40)
    withSpikes = random() < 0.2
}