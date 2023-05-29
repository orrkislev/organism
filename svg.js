function initSVG() {
    svgMain = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svgMain.setAttribute('viewBox', `0 0 ${width} ${height}`);
    document.body.appendChild(svgMain);
}

class SVGLine {
    constructor(p1,p2) {
        this.element = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        this.set(p1,p2)
        this.element.setAttribute('stroke-linecap', 'round');
        this.element.setAttribute('stroke', 'black');
        svgMain.appendChild(this.element)
        this.x1 = p1.x; this.y1 = p1.y;
        this.x2 = p2.x; this.y2 = p2.y;
        this.color = 'black'
        this.isVisible = true
    }
    setxyxy(x1,y1,x2,y2){
        if (x1 == this.x1 && y1 == this.y1 && x2 == this.x2 && y2 == this.y2) return
        this.element.setAttribute('x1', x1);
        this.element.setAttribute('y1', y1);
        this.element.setAttribute('x2', x2);
        this.element.setAttribute('y2', y2);
        this.x1 = x1; this.y1 = y1;
        this.x2 = x2; this.y2 = y2;
    }
    set(p1,p2){
        this.set1(p1)
        this.set2(p2)
    }
    set1(p1){
        if (p1.x == this.x1 && p1.y == this.y1) return
        this.element.setAttribute('x1', p1.x);
        this.element.setAttribute('y1', p1.y);
        this.x1 = p1.x; this.y1 = p1.y;
    }
    set2(p2){
        if (p2.x == this.x2 && p2.y == this.y2) return
        this.element.setAttribute('x2', p2.x);
        this.element.setAttribute('y2', p2.y);
        this.x2 = p2.x; this.y2 = p2.y;
    }
    stroke(color) {
        if (color == this.color) return
        this.element.setAttribute('stroke', color);
        this.color = color
    }
    strokeWeight(weight) {
        this.element.setAttribute('stroke-width', weight);
    }
    visible(visible) {
        if (visible == this.isVisible) return
        this.element.setAttribute('visibility', visible ? 'visible' : 'hidden');
        this.isVisible = visible
    }
    remove(){
        svgMain.removeChild(this.element)
    }
}

