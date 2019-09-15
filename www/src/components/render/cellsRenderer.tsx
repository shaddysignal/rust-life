import * as React from 'react';
import { useState, useEffect } from 'react';
import _ from 'lodash';

import { constants, numberToStyle, getIndex } from 'utils/canvas';
import { Cell as CellWasm, Universe as UniverseWasm, CellFormFactor as CellFormFactorWasm } from 'webrtc-hell-rust';
import { memory } from 'webrtc-hell-rust/webrtc_hell_rust_bg';
import { useFpsEffect } from 'components/render/fpsEffect';

const deadColorStyle = numberToStyle(constants.DEAD_COLOR);
const aliveColorStyle = numberToStyle(constants.ALIVE_COLOR);
const gridColorStyle = numberToStyle(constants.GRID_COLOR);

const xPositionHexagonConstantWithFull = Math.sqrt(3) * constants.FULL_CELL_SIZE / 4;
const xPositionHexagonConstant = Math.sqrt(3) * constants.CELL_SIZE / 4;

const xPositionTriangleConstantWithFull = Math.sqrt(3) * constants.FULL_CELL_SIZE / 4;
const xPositionTriangleConstant = Math.sqrt(3) * constants.CELL_SIZE / 4;

interface CellsProps {
  canvasRef: React.MutableRefObject<HTMLCanvasElement>,
  universeWasm: UniverseWasm,
  fps: number,
  active: boolean
}

export const chooseRenderer = (cellFormId: CellFormFactorWasm) => {
  if (cellFormId === CellFormFactorWasm.Square) return squareCellRender;
  else if (cellFormId === CellFormFactorWasm.Triangle) return triangleCellRender;
  else if (cellFormId === CellFormFactorWasm.Hexagon) return hexagonCellRender;
  else throw Error("not implemented");
}

const squareCellRender = (ctx: CanvasRenderingContext2D, row: number, col: number) => {
  const xPos = col * constants.FULL_CELL_SIZE + (constants.FULL_CELL_SIZE - constants.CELL_SIZE);
  const yPos = row * constants.FULL_CELL_SIZE + (constants.FULL_CELL_SIZE - constants.CELL_SIZE);

  ctx.beginPath();

  ctx.moveTo(xPos, yPos);
  ctx.lineTo(xPos + constants.CELL_SIZE, yPos);
  ctx.lineTo(xPos + constants.CELL_SIZE, yPos + constants.CELL_SIZE);
  ctx.lineTo(xPos, yPos + constants.CELL_SIZE);

  ctx.closePath();
}

const hexagonCellRender = (ctx: CanvasRenderingContext2D, row: number, col: number) => {
  let xPos = (row % 2 === 0 ? xPositionHexagonConstantWithFull : 0) + xPositionHexagonConstantWithFull * (1 + 2 * col);
  let yPos = (2 + 3 * row) * constants.FULL_CELL_SIZE / 4;

  ctx.beginPath();

  ctx.moveTo(xPos, yPos + constants.CELL_SIZE / 2);
  ctx.lineTo(xPos + xPositionHexagonConstant, yPos + constants.CELL_SIZE / 4);
  ctx.lineTo(xPos + xPositionHexagonConstant, yPos - constants.CELL_SIZE / 4);
  ctx.lineTo(xPos, yPos - constants.CELL_SIZE / 2);
  ctx.lineTo(xPos - xPositionHexagonConstant, yPos - constants.CELL_SIZE / 4);
  ctx.lineTo(xPos - xPositionHexagonConstant, yPos + constants.CELL_SIZE / 4);

  ctx.closePath();
}

const triangleCellRender = (ctx: CanvasRenderingContext2D, row: number, col: number) => {
  let isTriangleUpright = (row % 2 === 1 && col % 2 === 0) || (row % 2 === 0 && col % 2 === 1);

  let xPos = xPositionTriangleConstantWithFull * (1 + col);
  let yPos = (isTriangleUpright ? constants.FULL_CELL_SIZE / 4 : constants.FULL_CELL_SIZE / 2) + 3 * constants.FULL_CELL_SIZE * row / 4;

  ctx.beginPath();

  if (isTriangleUpright) {
    ctx.moveTo(xPos, yPos + constants.CELL_SIZE / 2);
    ctx.lineTo(xPos + xPositionTriangleConstant, yPos - constants.CELL_SIZE / 4);
    ctx.lineTo(xPos - xPositionTriangleConstant, yPos - constants.CELL_SIZE / 4);
  } else {
    ctx.moveTo(xPos - xPositionTriangleConstant, yPos + constants.CELL_SIZE / 4);
    ctx.lineTo(xPos + xPositionTriangleConstant, yPos + constants.CELL_SIZE / 4);
    ctx.lineTo(xPos, yPos - constants.CELL_SIZE / 2);
  }

  ctx.closePath();
}

const useCellsRendererEffect = (props: CellsProps) => {
  let { canvasRef, universeWasm: universe, fps: targetFps, active } = props;
  let [tick, setTick] = useState(0);

  let width = universe.width();
  let height = universe.height();

  let renderFunction = chooseRenderer(universe.cell_form_factor());

  useEffect(() => {
    if (!active) return;

    let timeoutId = setTimeout(() => {
      requestAnimationFrame(() => {
        setTick(universe.tick());

        let cells = new Uint8Array(memory.buffer, universe.cells(), width * height);

        let ctx = canvasRef.current.getContext('2d');

        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

        ctx.strokeStyle = gridColorStyle;

        ctx.fillStyle = deadColorStyle;
        for (let row = 0; row < height; ++row) {
          for (let col = 0; col < width; ++col) {
            let idx = getIndex(width, row, col);
            if (cells[idx] === CellWasm.Alive) {
              continue;
            }

            renderFunction(ctx, row, col);
            ctx.fill();
            ctx.stroke();
          }
        }

        ctx.fillStyle = aliveColorStyle;
        for (let row = 0; row < height; ++row) {
          for (let col = 0; col < width; ++col) {
            let idx = getIndex(width, row, col);
            if (cells[idx] === CellWasm.Dead) {
              continue;
            }

            renderFunction(ctx, row, col);
            ctx.fill();
            ctx.stroke();
          }
        }
      })
    }, 1000 / targetFps);

    return () => {
      clearTimeout(timeoutId);
    }
  }, [tick, active]);

  return tick;
}

export const CellsRenderer = (props: CellsProps) => {
  const tick = useCellsRendererEffect(props);
  const [meanFps, minFps, maxFps] = useFpsEffect();

  return (
    <React.Fragment>
      <div id="cells-renderer">Generation: { tick }</div>
      <div id="fps-renderer">Fps: { meanFps } | { minFps } | { maxFps }</div>
    </React.Fragment>
  );
}