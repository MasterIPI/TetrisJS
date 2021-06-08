import { ShapePiece } from './shape-piece';

export class Shape {
    x: number;
    y: number;
    shapeWidth: number;
    pieces: ShapePiece[];

    constructor(x: number, y: number, color: number, pieces: boolean[]) {
        this.x = x;
        this.y = y;
        this.pieces = new Array<ShapePiece>();
        this.shapeWidth = Math.sqrt(pieces.length);

        for (let piece = 0; piece < pieces.length; piece++) {
            this.pieces.push(new ShapePiece(pieces[piece], color))
        }
    }

    setColor(color: number) {
        for (let piece = 0; piece < this.pieces.length; piece++) {
            this.pieces[piece].color = color;
        }
    }
}