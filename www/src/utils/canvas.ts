export const numberToStyle = (number: number): string => {
  return "#" + ("000000" + number.toString(16)).slice(-6);
}

export const getIndex = (width: number, row: number, column: number): number => {
  return row * width + column;
};

export const constants = {
  CELL_SIZE: 15, // px
  FULL_CELL_SIZE: 16, // px
  GRID_COLOR: 0xCCCCCC,
  DEAD_COLOR: 0xFFFFFF,
  ALIVE_COLOR: 0x000000
}