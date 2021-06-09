import { Shape } from './shape';
import { ShapePiece } from './shape-piece';

export class Game {
    pieceSize: number;
    innerShapePieseSize: number;
    gameSpeed: number;
    previousFrameTime: number;
    timePassed: number;
    gameFieldHeight: number;
    gameFieldWidth: number;
    gameField: ShapePiece[];
    currentShape: Shape;
    nextShapeFieldSize: number;
    nextShapeField: Shape;
    score: number;
    level: number;
    scoreToLevelUpStep: number;
    scoreToLevelUp: number;
    isRotateKeyHeld: boolean;
    isPaused: boolean;
    isTextures: boolean;
    textures: HTMLImageElement;
    shapeList: Shape[];
    shapeTextures: number[];
    pointsPerLine: number;
    nextLevelSpeedAcceleration: number;

    gameFieldElem: HTMLCanvasElement;
    gameFieldContext: CanvasRenderingContext2D;

    nextShapeElem: HTMLCanvasElement;
    nextShapeContext: CanvasRenderingContext2D;

    scoreElem: HTMLElement;
    levelElem: HTMLElement;

    textureSize: number;
    originalColors: Array<string> | Array<number>;

    showPauseTime: number;
    pauseElement: HTMLElement;

    gameOverElement: HTMLElement;

    customTexturesElem: HTMLInputElement;
    originalTextures: string;
    originalTextureSize: number;

    constructor(gameFieldWidth: number, gameFieldHeight: number) {
        this.pieceSize = 15;
        this.innerShapePieseSize = 13;

        this.gameSpeed = 1000;
        this.previousFrameTime = 0;
        this.timePassed = 0;

        this.gameFieldHeight = gameFieldHeight;
        this.gameFieldWidth = gameFieldWidth;
        this.gameField = new Array<ShapePiece>();

        this.currentShape;
        this.nextShapeFieldSize = 4;
        this.nextShapeField = new Shape(0,0,0, new Array<boolean>(16));

        this.score = 0;
        this.level = 0;
        this.scoreToLevelUpStep = 0;
        this.scoreToLevelUp = 0;

        this.isRotateKeyHeld = false;
        this.isPaused = true;

        this.isTextures = false;
        this.textures = new Image();

        this.shapeList = new Array<Shape>(
            new Shape(0, 0, 0, [
                false, true, true,
                true, true, false,
                false, false, false
            ]),
            new Shape(0, 0, 0, [
                true, true, false,
                false, true, true,
                false, false, false
            ]),
            new Shape(0, 0, 0, [
                true, false, false,
                true, false, false,
                true, true, false
            ]),
            new Shape(0, 0, 0, [
                false, true, false,
                false, true, false,
                true, true, false
            ]),
            new Shape(0, 0, 0, [
                true, true,
                true, true
            ]),
            new Shape(0, 0, 0, [
                true, true, true,
                false, true, false,
                false, false, false
            ]),
            new Shape(0, 0, 0, [
                false, true, false, false,
                false, true, false, false,
                false, true, false, false,
                false, true, false, false
            ])
        );
    }

    setFieldCurrentShape() {
        for (let shapeY = 0; shapeY < this.currentShape.shapeWidth; shapeY++) {
            for (let shapeX = 0; shapeX < this.currentShape.shapeWidth; shapeX++) {
                let newX = shapeX + this.currentShape.x;
                let newY = shapeY + this.currentShape.y;
                if (newX < this.gameFieldWidth &&
                    newX >= 0 &&
                    newY < this.gameFieldHeight) {

                    var piece = this.currentShape.pieces[this.getArrayIndexFromXY(shapeX, shapeY, this.currentShape.shapeWidth)];

                    if (piece.isSolid) {
                        this.gameField[this.getArrayIndexFromXY(newX, newY, this.gameFieldWidth)] = piece;
                    }
                }
            }
        }
    }

    rotateShape(shape: Shape, isNextShape: boolean) {
        if (shape.shapeWidth === 2) {
            return shape;
        }

        let tmpShape = new Shape(shape.x, shape.y, shape.pieces[0].color, Array(shape.pieces.length).fill(false));

        if (tmpShape.shapeWidth === 4) {
            let shapeX = 1;
            let pieceIsSolid = shape.pieces[this.getArrayIndexFromXY(shapeX, 0, shape.shapeWidth)].isSolid;

            for (let shapeY = 0; shapeY < tmpShape.shapeWidth; shapeY++) {
                tmpShape.pieces[this.getArrayIndexFromXY(pieceIsSolid ? shapeY : shapeX, pieceIsSolid ? shapeX : shapeY, tmpShape.shapeWidth)].isSolid = true;
            }
        }
        else {
            let targetY = 0;
            let targetX = 0;
            for (let pieceX = 0; pieceX < shape.shapeWidth; pieceX++) {
                for (let pieceY = shape.shapeWidth - 1; pieceY >= 0; pieceY--) {
                    tmpShape.pieces[this.getArrayIndexFromXY(targetX, targetY, tmpShape.shapeWidth)] = shape.pieces[this.getArrayIndexFromXY(pieceX, pieceY, shape.shapeWidth)];
                    targetX++;
                }
                targetX = 0;
                targetY++;
            }
        }

        if (isNextShape) {
            return tmpShape;
        }

        var collided = this.hasCollisions(tmpShape.x, tmpShape.y, tmpShape);

        if (!collided) {
            return tmpShape;
        }

        if (collided) {
            if (tmpShape.x < this.gameFieldWidth / 2) {
                if (!this.hasCollisions(tmpShape.x + 1, tmpShape.y, tmpShape)) {
                    tmpShape.x += 1;
                    return tmpShape;
                }
            }

            if (tmpShape.x > this.gameFieldWidth / 2) {
                if (!this.hasCollisions(tmpShape.x - 1, tmpShape.y, tmpShape)) {
                    tmpShape.x -= 1;
                    return tmpShape;
                }

                if (tmpShape.shapeWidth === 4 && tmpShape.x === this.gameFieldWidth - 2 && !this.hasCollisions(tmpShape.x - 2, tmpShape.y, tmpShape)) {
                    tmpShape.x -= 2;
                    return tmpShape;
                }
            }
        }

        return shape;
    }

    moveDownShape() {
        let collisionDetected = this.hasCollisions(this.currentShape.x, this.currentShape.y + 1, this.currentShape);

        if (collisionDetected && this.currentShape.y < 0) {
            this.gameOver();
            return;
        }

        if (!collisionDetected) {
            this.currentShape.y += 1;
            return;
        }

        this.setFieldCurrentShape();
        this.removeFullLines(this.getFullLinesIndexes(this.currentShape));
        this.getNextShape();
    }

    moveLeftShape() {
        if (!this.hasCollisions(this.currentShape.x - 1, this.currentShape.y, this.currentShape)) {
            this.currentShape.x -= 1;
        }
    }

    moveRightShape() {
        if (!this.hasCollisions(this.currentShape.x + 1, this.currentShape.y, this.currentShape)) {
            this.currentShape.x += 1;
        }
    }

    getArrayIndexFromXY(x: number, y: number, fieldWidth: number) {
        return y * fieldWidth + x;
    }

    getNextShape() {
        this.currentShape = new Shape(0, 0, this.nextShapeField.pieces[0].color, this.nextShapeField.pieces.map(piece => piece.isSolid));
        this.currentShape.y = -Math.round(this.currentShape.shapeWidth / 2);
        this.currentShape.x = (this.gameFieldWidth / 2 | 0) - (this.currentShape.shapeWidth / 2 | 0);
        
        let isEmptyFirstColumn;
        if (this.currentShape.shapeWidth < this.nextShapeFieldSize) {
            isEmptyFirstColumn = true;
            for (let shapeY = 0; shapeY < this.currentShape.shapeWidth; shapeY++) {
                let piece = this.currentShape.pieces[this.getArrayIndexFromXY(0, shapeY, this.currentShape.shapeWidth)];
                if (piece.isSolid) {
                    isEmptyFirstColumn = false;
                    break;
                }
            }
        }

        this.currentShape.x -= isEmptyFirstColumn ? 1 : 0;

        let randomNumber = Math.random() * this.shapeList.length | 0;
        this.nextShapeField = this.shapeList[randomNumber];
        this.nextShapeField.setColor(randomNumber);

        if (this.nextShapeField.shapeWidth > 2) {
            let initialRotation = Math.random() * (this.nextShapeField.shapeWidth === this.nextShapeFieldSize ? this.nextShapeFieldSize / 2 : this.nextShapeField.shapeWidth) | 0;

            if (initialRotation > 0) {
                for (let rotation = 0; rotation < initialRotation; rotation++) {
                    this.nextShapeField = this.rotateShape(this.nextShapeField, true);
                }
            }
        }
    }

    hasCollisions(newX: number, newY: number, shape: Shape) {
        for (let shapeY = 0; shapeY < shape.shapeWidth; shapeY++) {
            for (let shapeX = 0; shapeX < shape.shapeWidth; shapeX++) {
                if (shape.pieces[this.getArrayIndexFromXY(shapeX, shapeY, shape.shapeWidth)].isSolid) {
                    let isInBounds = (shapeX + newX < this.gameFieldWidth) && (shapeX + newX >= 0) && (shapeY + newY < this.gameFieldHeight);
                    let gameFieldPiece = this.gameField[this.getArrayIndexFromXY(shapeX + newX, shapeY + newY, this.gameFieldWidth)];
                    if (!isInBounds || (gameFieldPiece && gameFieldPiece.isSolid)) {
                        return true;
                    }
                }
            }
        }

        return false;
    }

    getFullLinesIndexes(shape: Shape) {
        let lineIndexes = [];

        for (let shapeY = shape.shapeWidth - 1; shapeY >= 0; shapeY--) {
            for (let shapeX = 0; shapeX < shape.shapeWidth; shapeX++) {
                if(shape.pieces[this.getArrayIndexFromXY(shapeX, shapeY, shape.shapeWidth)].isSolid) {
                    for (let fieldX = 0; fieldX < this.gameFieldWidth; fieldX++) {

                        let fieldY = shape.y + shapeY;
                        if (!this.gameField[this.getArrayIndexFromXY(fieldX, fieldY, this.gameFieldWidth)].isSolid) {
                            shapeX = shape.shapeWidth - 1;
                            break;
                        }

                        if (fieldX === this.gameFieldWidth - 1) {
                            shapeX = shape.shapeWidth - 1;
                            lineIndexes.push(fieldY);
                        }
                    }
                }
            }
        }

        return lineIndexes;
    }

    removeFullLines(lineIndexes: number[]) {
        if (lineIndexes.length === 0) {
            return;
        }

        for (let line = lineIndexes.length - 1; line >= 0; line--) {
            for (let fieldY = lineIndexes[line]; fieldY >= 0; fieldY--) {
                for (let fieldX = 0; fieldX < this.gameFieldWidth; fieldX++) {
                    let piece = fieldY === 0 ? new ShapePiece(false, 0) : this.gameField[this.getArrayIndexFromXY(fieldX, fieldY - 1, this.gameFieldWidth)];
                    this.gameField[this.getArrayIndexFromXY(fieldX, fieldY, this.gameFieldWidth)] = piece;
                }
            }
        }

        let scoreLineMultiplier = lineIndexes.length;

        if (lineIndexes.length == 3) {
            scoreLineMultiplier = 4;
        }
        
        if (lineIndexes.length == 4) {
            scoreLineMultiplier = 10;
        }

        this.score += this.pointsPerLine * scoreLineMultiplier;

        if (this.score >= this.scoreToLevelUp && this.gameSpeed > 200) {
            this.scoreToLevelUp += this.scoreToLevelUpStep;
            this.gameSpeed -= this.nextLevelSpeedAcceleration;

            this.level += 1;
        }

        this.updateStatistics();
    }

    clearGameField() {
        this.gameFieldContext.clearRect(0, 0, this.gameFieldElem.width, this.gameFieldElem.height);
        this.nextShapeContext.clearRect(0, 0, this.nextShapeElem.width, this.nextShapeElem.height);
    }

    updateStatistics() {
        this.scoreElem.innerText = this.score.toString();
        this.levelElem.innerText = this.level.toString();
    }

    drawPiece(x: number, y: number, piece: ShapePiece, isCurrentShape: boolean, context: CanvasRenderingContext2D) {
        if (piece && piece.isSolid) {
            if (this.isTextures) {
                context.drawImage(this.textures,
                                piece.color * this.textureSize,
                                0,
                                this.textureSize,
                                this.textureSize,
                                x * this.pieceSize,
                                y * this.pieceSize,
                                this.pieceSize,
                                this.pieceSize);
            }
            else {
                context.fillStyle = this.originalColors[piece.color].toString();
                context.fillRect(x * this.pieceSize + 1,
                                y * this.pieceSize + 1,
                                this.innerShapePieseSize,
                                this.innerShapePieseSize);
            }
            return;
        }
        
        if (!isCurrentShape) {
            context.fillStyle = '#2D2D2D';
            context.fillRect(x * this.pieceSize + 1,
                            y * this.pieceSize + 1,
                            this.innerShapePieseSize,
                            this.innerShapePieseSize);
        }
    }

    draw() {
        this.clearGameField();

        let originalContextfillStyle = this.nextShapeContext.fillStyle;
        for (let fieldY = 0; fieldY < this.nextShapeField.shapeWidth; fieldY++) {
            for (let fieldX = 0; fieldX < this.nextShapeField.shapeWidth; fieldX++) {
                this.drawPiece(fieldX,
                            fieldY,
                            this.nextShapeField.pieces[this.getArrayIndexFromXY(fieldX, fieldY, this.nextShapeField.shapeWidth)],
                            false,
                            this.nextShapeContext);

                if (fieldX === this.nextShapeField.shapeWidth - 1) {
                    for (fieldX += 1; fieldX < this.nextShapeFieldSize; fieldX++) {
                        this.drawPiece(fieldX,
                                    fieldY,
                                    null,
                                    false,
                                    this.nextShapeContext);
                    }
                }
            }

            if (fieldY === this.nextShapeField.shapeWidth - 1 && this.nextShapeField.shapeWidth < this.nextShapeFieldSize) {
                for (fieldY += 1; fieldY < this.nextShapeFieldSize; fieldY++) {
                    for (let fieldX = 0; fieldX < this.nextShapeFieldSize; fieldX++) {
                            this.drawPiece(fieldX,
                                        fieldY,
                                        null,
                                        false,
                                        this.nextShapeContext);
                        }
                    }
            }
        }

        this.nextShapeContext.fillStyle = originalContextfillStyle;

        originalContextfillStyle = this.gameFieldContext.fillStyle;

        for (let fieldY = 0; fieldY < this.gameFieldHeight; fieldY++) {
            for (let fieldX = 0; fieldX < this.gameFieldWidth; fieldX++) {
                this.drawPiece(fieldX,
                            fieldY,
                            this.gameField[this.getArrayIndexFromXY(fieldX, fieldY, this.gameFieldWidth)],
                            false,
                            this.gameFieldContext);
            }
        }

        if (this.currentShape) {
            for (let shapeY = 0; shapeY < this.currentShape.shapeWidth; shapeY++) {
                for (let shapeX = 0; shapeX < this.currentShape.shapeWidth; shapeX++) {
                    this.drawPiece(shapeX + this.currentShape.x,
                                shapeY + this.currentShape.y,
                                this.currentShape.pieces[this.getArrayIndexFromXY(shapeX, shapeY, this.currentShape.shapeWidth)],
                                true,
                                this.gameFieldContext);
                }
            }
        }

        this.gameFieldContext.fillStyle = originalContextfillStyle;
    }

    togglePause() {
        this.isPaused = !this.isPaused;
        if (!this.isPaused) {
            this.timePassed = 0;
        }

        this.pauseElement.parentElement.classList.toggle('v-hidden');
    }

    toggleRenderTextures() {
        this.isTextures = !this.isTextures;
        this.draw();
    }

    gameProcess(timePassed = 0) {
        const deltaTime = timePassed - this.previousFrameTime;
        this.previousFrameTime = timePassed;
        this.timePassed += deltaTime;

        if (this.timePassed >= this.gameSpeed) {
            this.timePassed = 0;

            if (!this.isPaused) {
                this.moveDownShape();
            }
        }
        if (!this.isPaused) {
            this.draw();
        }
        window.requestAnimationFrame((timePassed) => { this.gameProcess(timePassed); });
    }

    gameOver() {
        this.clearGameField();
        this.score = 0;
        this.level = 1;
        this.updateStatistics();
        this.gameOverElement.classList.remove('d-none');
        window.onkeydown = null;
        window.onkeyup = null;
        window.onkeydown = () => {
            this.init();
            this.gameOverElement.classList.add('d-none');
        }
    }

    loadUnloadCustomTextures() {
        if (!this.isPaused) {
            this.togglePause();
        }

        if (this.textures.src === this.originalTextures) {
            this.customTexturesElem.click();
        }

        if (this.textures.src !== this.originalTextures) {
            this.textures.src = this.originalTextures;
            this.toggleRenderTextures();
        }
    }

    init() {
        this.showPauseTime = 500;
        this.isPaused = false;
        this.pauseElement = document.getElementById('pauseState');
        this.customTexturesElem = <HTMLInputElement>document.getElementById('customTextures');
        this.gameOverElement = document.getElementById('gameOver');

        if (!this.customTexturesElem.onchange) {
            this.customTexturesElem.onchange = (event) => {
                var fileToLoad = (<HTMLInputElement>event.target).files[0];
                var fileReader = new FileReader();

                fileReader.onload = (fileLoadedEvent) => {
                    this.textures.src = fileLoadedEvent.target.result.toString();
                    (<HTMLInputElement>event.target).value = '';
                    setTimeout(() => {
                        this.toggleRenderTextures(); }, 0);
                }
                fileReader.readAsDataURL(fileToLoad);
            }
        }

        this.gameField = Array(this.gameFieldHeight * this.gameFieldWidth).fill(new ShapePiece(false, 7));
        this.nextShapeField = new Shape(0, 0, 7, Array(this.nextShapeFieldSize * this.nextShapeFieldSize).fill(false));

        this.originalTextures = 'data:image/jpeg;base64,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';
        this.originalTextureSize = 53;
        this.textureSize = this.originalTextureSize;
        this.originalColors = ['#24D64B', '#CDDC39', '#FF0000', '#302AD4', '#5CEDFA', '#B13AE8', '#FF5722'];
        this.shapeTextures = [0, 1, 2, 3, 4, 5, 6];

        this.gameFieldElem = <HTMLCanvasElement>document.getElementById('gameField');
        this.gameFieldElem.width = this.pieceSize * this.gameFieldWidth;
        this.gameFieldElem.height = this.pieceSize * this.gameFieldHeight;
        this.gameFieldElem.style.backgroundColor = '#000000';
        this.gameFieldContext = this.gameFieldElem.getContext('2d');

        this.nextShapeElem = <HTMLCanvasElement>document.getElementById('nextShape');
        this.nextShapeElem.width = this.pieceSize * this.nextShapeFieldSize;
        this.nextShapeElem.height = this.pieceSize * this.nextShapeFieldSize;
        this.nextShapeElem.style.backgroundColor = '#000000';
        this.nextShapeContext = this.nextShapeElem.getContext('2d');

        this.scoreElem = document.getElementById('scoreCount');
        this.score = 0;
        this.scoreElem.innerText = this.score.toString();

        this.gameSpeed = 1000;
        this.pointsPerLine = 100;
        this.nextLevelSpeedAcceleration = 100;
        this.scoreToLevelUpStep = 4000;
        this.scoreToLevelUp = this.scoreToLevelUpStep;

        this.levelElem = document.getElementById('level');
        this.level = 1;
        this.levelElem.innerText = this.level.toString();

        if(!this.textures.onload) {
            this.textures.onload = (event) => {
                this.textures.onload = null;
                const eventTarget = (<HTMLImageElement>event.target);
                if (eventTarget.naturalWidth / eventTarget.naturalHeight !== this.shapeList.length) {
                    eventTarget.src = this.originalTextures;
                    alert('Textures has inappropriate size!');
                    return;
                }

                this.textureSize = eventTarget.naturalHeight;
            };
        }
        this.textures.src = this.originalTextures;

        this.isTextures = false;

        this.getNextShape();
        this.getNextShape();

        window.onkeydown = (event: KeyboardEvent) => {
            if (event.keyCode === 13) {//enter
                this.togglePause();
            }

            if (event.keyCode === 84) {//t
                this.toggleRenderTextures();
            }

            if (event.keyCode == 80) {//p
                this.loadUnloadCustomTextures();
            }

            if (this.isPaused) {
                return;
            }

            if (event.keyCode === 37) {
                this.moveLeftShape();
            }

            if (event.keyCode === 38 && !this.isRotateKeyHeld) {
                this.isRotateKeyHeld = true;
                this.currentShape = this.rotateShape(this.currentShape, false);
            }

            if (event.keyCode === 39) {
                this.moveRightShape();
            }

            if (event.keyCode === 40) {
                this.moveDownShape();
            }
        }

        window.onkeyup = (event: KeyboardEvent) => {
            if (event.keyCode === 38 && this.isRotateKeyHeld) {
                this.isRotateKeyHeld = false;
            }
        }

        if (!this.pauseElement.classList.contains('pause')) {
            this.pauseElement.classList.add('pause');
        }

        this.gameProcess();
    }
}