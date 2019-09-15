import { Cell, Universe as Universe } from "webrtc-hell-rust";
import { memory } from "webrtc-hell-rust/webrtc_hell_rust_bg";

const numberToStyle = (number: number): string => {
  return "#" + ("000000" + number.toString(16)).slice(-6);
}

const getIndex = (width: number, row: number, column: number): number => {
  return row * width + column;
};

export const constants = {
  CELL_SIZE: 10, // px
  GRID_COLOR: 0xCCCCCC,
  DEAD_COLOR: 0xFFFFFF,
  ALIVE_COLOR: 0x000000
}

export const drawGrid = (ctx: CanvasRenderingContext2D, width: number, height: number): void => {
  ctx.beginPath();
  ctx.strokeStyle = numberToStyle(constants.GRID_COLOR);

  // Vertical lines.
  for (let i = 0; i <= width; i++) {
    ctx.moveTo(i * (constants.CELL_SIZE + 1) + 1, 0);
    ctx.lineTo(i * (constants.CELL_SIZE + 1) + 1, (constants.CELL_SIZE + 1) * height + 1);
  }

  // Horizontal lines.
  for (let j = 0; j <= height; j++) {
    ctx.moveTo(0,                                     j * (constants.CELL_SIZE + 1) + 1);
    ctx.lineTo((constants.CELL_SIZE + 1) * width + 1, j * (constants.CELL_SIZE + 1) + 1);
  }

  ctx.stroke();
};

export const drawCells = (ctx: CanvasRenderingContext2D, cellsPtr: number, width: number, height: number): void => {
  const cells = new Uint8Array(memory.buffer, cellsPtr, width * height);

  ctx.beginPath();

  for (let row = 0; row < height; ++row) {
    for (let col = 0; col < width; ++col) {
      const idx = getIndex(width, row, col);

      ctx.fillStyle = cells[idx] === Cell.Dead
        ? numberToStyle(constants.DEAD_COLOR)
        : numberToStyle(constants.ALIVE_COLOR);

      ctx.fillRect(
        col * (constants.CELL_SIZE + 1) + 1,
        row * (constants.CELL_SIZE + 1) + 1,
        constants.CELL_SIZE,
        constants.CELL_SIZE
      );
    }
  }

  ctx.stroke();
};

export const startRendering = (universe: Universe): void => {
  const width = universe.width();
  const height = universe.height();

  // Give the canvas room for all of our cells and a 1px border
  // around each of them.
  const canvas = <HTMLCanvasElement> document.getElementById("game-of-life");
  canvas.height = (constants.CELL_SIZE + 1) * height + 1;
  canvas.width = (constants.CELL_SIZE + 1) * width + 1;

  const ctx: CanvasRenderingContext2D = canvas.getContext('2d');

  const renderLoop = () => {
    universe.tick();

    drawGrid(ctx, width, height);
    drawCells(ctx, universe.cells(), width, height);

    requestAnimationFrame(renderLoop);
  };

  requestAnimationFrame(renderLoop);
}