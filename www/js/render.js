import { Cell } from "webrtc-hell-rust";
import { memory } from "webrtc-hell-rust/webrtc_hell_rust_bg";

const numberToStyle = (number) => {
  return "#" + ("000000" + number.toString(16)).slice(-6);
}

const getIndex = (width, row, column) => {
  return row * width + column;
};

export const constants = {
  CELL_SIZE: 10, // px
  GRID_COLOR: 0xCCCCCC,
  DEAD_COLOR: 0xFFFFFF,
  ALIVE_COLOR: 0x000000
}

export const drawGrid = (ctx, width, height) => {
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

export const drawCells = (ctx, universe, width, height) => {
  const cellsPtr = universe.cells();
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