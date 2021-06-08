class Shape {
    constructor(x, y, color, pieces) {
        this.x = x;
        this.y = y;
        this.pieces = [];
        this.shapeWidth = Math.sqrt(pieces.length);

        for (let piece = 0; piece < pieces.length; piece++) {
            this.pieces.push(new ShapePiece(pieces[piece], color))
        }
    }

    setColor(color) {
        for (let piece = 0; piece < this.pieces.length; piece++) {
            this.pieces[piece].color = color;
        }
    }
}