import * as React from 'react';
import { useEffect } from 'react';

import { constants, numberToStyle } from 'utils/canvas';

const deadColor = numberToStyle(constants.DEAD_COLOR);
const aliveColor = numberToStyle(constants.ALIVE_COLOR);

interface CellRendererProps {
  canvasRef: React.MutableRefObject<HTMLCanvasElement>,
  row: number,
  col: number,
  isAlive: boolean
}

export const CellRenderer = (props: CellRendererProps) => {
  let { canvasRef, row, col, isAlive } = props;

  useEffect(() => {
    let ctx = canvasRef.current.getContext('2d');

    ctx.beginPath();

    ctx.fillStyle = isAlive ? aliveColor : deadColor;

    ctx.fillRect(
      col * (constants.CELL_SIZE + 1) + 1,
      row * (constants.CELL_SIZE + 1) + 1,
      constants.CELL_SIZE,
      constants.CELL_SIZE
    );

    ctx.stroke();
  });

  return (
    <React.Fragment/>
  );
}