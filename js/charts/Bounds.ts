import { extend } from './Util'
import Vector2 from './Vector2'
const pixelWidth = require('string-pixel-width')

export default class Bounds {
    static textBoundsCache: { [key: string]: Bounds } = {}
    static ctx: CanvasRenderingContext2D
    static baseFontFamily: string = "Helvetica, Arial"
    

    static fromProps(props: { x: number, y: number, width: number, height: number }): Bounds {
        const { x, y, width, height } = props
        return new Bounds(x, y, width, height)
    }

    static fromBBox(bbox: { x: number, y: number, width: number, height: number }): Bounds {
        return this.fromProps(bbox)
    }

    static fromRect(rect: ClientRect) {
        return new Bounds(rect.left, rect.top, rect.width, rect.height)
    }

    static fromElement(el: HTMLElement) {
        return Bounds.fromRect(el.getBoundingClientRect())
    }

    static fromCorners(p1: Vector2, p2: Vector2) {
        const x1 = Math.min(p1.x, p2.x)
        const x2 = Math.max(p1.x, p2.x)
        const y1 = Math.min(p1.y, p2.y)
        const y2 = Math.max(p1.y, p2.y)

        return new Bounds(x1, y1, x2 - x1, y2 - y1)
    }

    static empty(): Bounds {
        return new Bounds(0, 0, 0, 0)
    }

    static forText(str: string, { x = 0, y = 0, fontSize = 16 }: { x?: number, y?: number, fontSize?: number, fontFamily?: string } = {}): Bounds {
        const key = `${str}-${fontSize}`
        let bounds = this.textBoundsCache[key]
        if (bounds) {
            if (bounds.x === x && bounds.y === y-bounds.height)
                return bounds
            else
                return bounds.extend({ x: x, y: y-bounds.height})
        }

        if (str === "")
            bounds = Bounds.empty()
        else {
            const width = pixelWidth(str, { font: "Arial", size: fontSize })
            const height = fontSize
            bounds = new Bounds(x, y - height, width, height)
        }

        this.textBoundsCache[key] = bounds
        return bounds
    }

    /*static debugSVG(boundsArray: Bounds[], containerNode?: HTMLElement) {
        var container: any = containerNode ? select(containerNode) : select('svg');

        container.selectAll('rect.boundsDebug').remove()

        container.selectAll('rect.boundsDebug')
            .data(boundsArray).enter()
            .append('rect')
                .attr('x', (b: Bounds) => b.left)
                .attr('y', (b: Bounds) => b.top)
                .attr('width', (b: Bounds) => b.width)
                .attr('height', (b: Bounds) => b.height)
                .attr('class', 'boundsDebug')
                .style('fill', 'rgba(0,0,0,0)')
                .style('stroke', 'red');
    }

    static debugHTML(boundsArray: Bounds[], containerNode?: HTMLElement) {
        var container: any = containerNode ? select(containerNode) : select('#chart');

        container.selectAll('div.boundsDebug').remove()

        container.selectAll('div.boundsDebug')
            .data(boundsArray).enter()
            .append('div')
				.style('position', 'absolute')
                .style('left', (b: Bounds) => b.left + 'px')
                .style('top', (b: Bounds) => b.top + 'px')
                .style('width', (b: Bounds) => b.width + 'px')
                .style('height', (b: Bounds) => b.height + 'px')
                .attr('class', 'boundsDebug')
                .style('border', '1px solid red');
    }*/

    readonly x: number
    readonly y: number
    readonly width: number
    readonly height: number

    constructor(x: number, y: number, width: number, height: number) {
        this.x = x
        this.y = y
        this.width = width
        this.height = height
    }

    get left(): number { return this.x }
    get top(): number { return this.y }
    get right(): number { return this.x + this.width }
    get bottom(): number { return this.y + this.height }
    get centerX(): number { return this.x + this.width / 2 }
    get centerY(): number { return this.y + this.height / 2 }

    get topLeft(): Vector2 { return new Vector2(this.left, this.top) }
    get topRight(): Vector2 { return new Vector2(this.right, this.top) }
    get bottomLeft(): Vector2 { return new Vector2(this.left, this.bottom) }
    get bottomRight(): Vector2 { return new Vector2(this.right, this.bottom) }

    padLeft(amount: number): Bounds {
        return new Bounds(this.x + amount, this.y, this.width - amount, this.height)
    }

    padRight(amount: number): Bounds {
        return new Bounds(this.x, this.y, this.width - amount, this.height)
    }

    padBottom(amount: number): Bounds {
        return new Bounds(this.x, this.y, this.width, this.height - amount)
    }

    padTop(amount: number): Bounds {
        return new Bounds(this.x, this.y + amount, this.width, this.height - amount)
    }

    padWidth(amount: number): Bounds {
        return new Bounds(this.x + amount, this.y, this.width - amount * 2, this.height)
    }

    padHeight(amount: number): Bounds {
        return new Bounds(this.x, this.y + amount, this.width, this.height - amount * 2)
    }

    fromLeft(amount: number): Bounds {
        return this.padRight(this.width - amount)
    }

    fromBottom(amount: number): Bounds {
        return this.padTop(this.height - amount)
    }

    pad(amount: number): Bounds {
        return new Bounds(this.x + amount, this.y + amount, this.width - amount * 2, this.height - amount * 2)
    }

    extend(props: { x?: number, y?: number, width?: number, height?: number }): Bounds {
        return Bounds.fromProps(extend({}, this, props))
    }

    scale(scale: number): Bounds {
        return new Bounds(this.x * scale, this.y * scale, this.width * scale, this.height * scale)
    }

    intersects(otherBounds: Bounds): boolean {
        const r1 = this
        const r2 = otherBounds

        return !(r2.left > r1.right || r2.right < r1.left ||
            r2.top > r1.bottom || r2.bottom < r1.top)
    }

    lines(): Vector2[][] {
        return [
            [this.topLeft, this.topRight],
            [this.topRight, this.bottomRight],
            [this.bottomRight, this.bottomLeft],
            [this.bottomLeft, this.topLeft]
        ]
    }

    boundedPoint(p: Vector2): Vector2 {
        return new Vector2(
            Math.max(Math.min(p.x, this.right), this.left),
            Math.max(Math.min(p.y, this.bottom), this.top)
        )
    }

    containsPoint(x: number, y: number): boolean {
        return x >= this.left && x <= this.right && y >= this.top && y <= this.bottom
    }

    contains(p: Vector2) {
        return this.containsPoint(p.x, p.y)
    }

    encloses(bounds: Bounds) {
        return this.containsPoint(bounds.left, bounds.top) && this.containsPoint(bounds.left, bounds.bottom) && this.containsPoint(bounds.right, bounds.top) && this.containsPoint(bounds.right, bounds.bottom)
    }

    toCSS(): { left: string, top: string, width: string, height: string } {
        return { left: `${this.left}px`, top: `${this.top}px`, width: `${this.width}px`, height: `${this.height}px` }
    }

    toProps(): { x: number, y: number, width: number, height: number } {
        return { x: this.x, y: this.y, width: this.width, height: this.height }
    }

    xRange(): [number, number] {
        return [this.left, this.right]
    }

    yRange(): [number, number] {
        return [this.bottom, this.top]
    }

    equals(bounds: Bounds) {
        return this.x === bounds.x && this.y === bounds.y && this.width === bounds.width && this.height === bounds.height
    }
}
