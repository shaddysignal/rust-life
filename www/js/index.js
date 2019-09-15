import { Universe } from "webrtc-hell-rust";
import { constants, drawCells, drawGrid } from "./render.js";

// Construct the universe, and get its width and height.
const universe = Universe.new("3", "23", 64, 64);
const width = universe.width();
const height = universe.height();

// Give the canvas room for all of our cells and a 1px border
// around each of them.
const canvas = document.getElementById("game-of-life-canvas");
canvas.height = (constants.CELL_SIZE + 1) * height + 1;
canvas.width = (constants.CELL_SIZE + 1) * width + 1;

const ctx = canvas.getContext('2d');

const renderLoop = () => {
  universe.tick();

  drawGrid(ctx, width, height);
  drawCells(ctx, universe, width, height);

  requestAnimationFrame(renderLoop);
};

requestAnimationFrame(renderLoop);