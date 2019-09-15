import * as React from 'react'; 
import { useEffect, useState } from 'react';
import { constants, numberToStyle } from 'utils/canvas';
import { CellFormFactor as CellFormFactorWasm } from 'webrtc-hell-rust';

const gridColorStyle = numberToStyle(constants.GRID_COLOR);

interface GridProps {
  canvasRef: React.MutableRefObject<HTMLCanvasElement>,
  width: number,
  height: number,
  cellFormId: CellFormFactorWasm
}

const chooseGridRenderer = (cellFormId: CellFormFactorWasm) => {
  if (cellFormId === CellFormFactorWasm.Square) return SquareGridRenderer;
  else if (cellFormId === CellFormFactorWasm.Hexagon) return HexagonGridRenderer;
  else if (cellFormId === CellFormFactorWasm.Triangle) return TriangleGridRenderer;
  else throw Error('not implemented');
}

export const HexagonGridRenderer = (props: GridProps) => {
  let { canvasRef, width, height } = props;

  const xPositionHexagonConstant = Math.sqrt(3) * constants.FULL_CELL_SIZE / 4;

  useEffect(() => {
    let ctx = canvasRef.current.getContext('2d');
      
    ctx.strokeStyle = gridColorStyle;

    for (let row = 0; row < height; ++row) {
      for (let col = 0; col < width; ++col) {
        let xPos = (row % 2 === 0 ? xPositionHexagonConstant : 0) + xPositionHexagonConstant * (1 + 2 * col);
        let yPos = (2 + 3 * row) * (constants.FULL_CELL_SIZE + 1) / 4;
      
        ctx.beginPath();
      
        ctx.moveTo(xPos, yPos + constants.FULL_CELL_SIZE / 2);
        ctx.lineTo(xPos + xPositionHexagonConstant, yPos + constants.FULL_CELL_SIZE / 4);
        ctx.lineTo(xPos + xPositionHexagonConstant, yPos - constants.FULL_CELL_SIZE / 4);
        ctx.lineTo(xPos, yPos - constants.FULL_CELL_SIZE / 2);
        ctx.lineTo(xPos - xPositionHexagonConstant, yPos - constants.FULL_CELL_SIZE / 4);
        ctx.lineTo(xPos - xPositionHexagonConstant, yPos + constants.FULL_CELL_SIZE / 4);
      
        ctx.closePath();
        ctx.stroke();
      }
    };
  }, []);

  return (
    <React.Fragment/>
  );
}

export const TriangleGridRenderer = (props: GridProps) => {
  let { canvasRef, width, height } = props;

  const xPositionTriangleConstant = Math.sqrt(3) * constants.FULL_CELL_SIZE / 4;

  useEffect(() => {
    let ctx = canvasRef.current.getContext('2d');

    ctx.strokeStyle = gridColorStyle;

    for (let row = 0; row < height; ++row) {
      for (let col = 0; col < width; ++col) {
        let isTriangleUpright = (row % 2 === 1 && col % 2 === 0) || (row % 2 === 0 && col % 2 === 1);

        let xPos = constants.FULL_CELL_SIZE * (1 + col) / 2;
        let yPos = (isTriangleUpright ? constants.FULL_CELL_SIZE / 2 : constants.FULL_CELL_SIZE / 4) + 3 * constants.FULL_CELL_SIZE * row / 4;
      
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
    };

    ctx.stroke();
  }, []);

  return (
    <React.Fragment/>
  );
}

export const SquareGridRenderer = (props: GridProps) => {
  let { canvasRef, width, height } = props;

  useEffect(() => {
    let ctx = canvasRef.current.getContext('2d');

    ctx.beginPath();
    ctx.strokeStyle = gridColorStyle;

    // Vertical lines.
    for (let i = 0; i <= width; ++i) {
      ctx.moveTo(i * (constants.CELL_SIZE + 1) + 1, 0);
      ctx.lineTo(i * (constants.CELL_SIZE + 1) + 1, (constants.CELL_SIZE + 1) * height + 1);
    }

    // Horizontal lines.
    for (let j = 0; j <= height; ++j) {
      ctx.moveTo(0,                                     j * (constants.CELL_SIZE + 1) + 1);
      ctx.lineTo((constants.CELL_SIZE + 1) * width + 1, j * (constants.CELL_SIZE + 1) + 1);
    }

    ctx.stroke();
  }, []);

  return (
    <React.Fragment/>
  );
}

export const GridRenderer = (props: GridProps) => {
  let GridRenderer = chooseGridRenderer(props.cellFormId);

  return (
    <GridRenderer {...props}/>
  );
}