class myPoint{
    constructor(x, y){
        this.x = x; this.y = y
        // super(x,y)
    }
    add(other){
        this.x += other.x
        this.y += other.y
        return this
    }
    sub(other){
        this.x -= other.x
        this.y -= other.y
        return this
    }
    mult(scalar){
        this.x *= scalar
        this.y *= scalar
        return this
    }
    get length(){
        return Math.sqrt(this.x*this.x + this.y*this.y)
    }
    dist(other){
        return Math.sqrt((this.x-other.x)*(this.x-other.x) + (this.y-other.y)*(this.y-other.y))
    }
    distxy(x, y){
        return Math.sqrt((this.x-x)*(this.x-x) + (this.y-y)*(this.y-y))
    }
    normalize(newLength = 1){
        const l = this.length
        this.x *= newLength/l
        this.y *= newLength/l
        return this
    }
    rotate(angle){
        const x = this.x
        const y = this.y
        this.x = x*Math.cos(angle) - y*Math.sin(angle)
        this.y = x*Math.sin(angle) + y*Math.cos(angle)
        return this
    }
    zero(){
        this.x = 0
        this.y = 0
        return this
    }
    clone(){
        return new myPoint(this.x, this.y)
    }

    static add(a, b){
        return new myPoint(a.x+b.x, a.y+b.y)
    }
    static sub(a, b){
        return new myPoint(a.x-b.x, a.y-b.y)
    }
    static mult(a, scalar){
        return new myPoint(a.x*scalar, a.y*scalar)
    }
    static normalize(a){
        const l = a.length
        return new myPoint(a.x/l, a.y/l)
    }
    static dist(a, b){
        return Math.sqrt((a.x-b.x)*(a.x-b.x) + (a.y-b.y)*(a.y-b.y))
    }
}