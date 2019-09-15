import * as React from 'react';
import { useState, useEffect, useRef } from 'react';

import { Universe as UniverseWasm, CellFormFactor as CellFormFactorWasm, Cell as CellWasm } from 'webrtc-hell-rust';
import { constants, numberToStyle } from 'utils/canvas';
import { CellsRenderer, chooseRenderer } from 'components/render/cellsRenderer';

const deadColorStyle = numberToStyle(constants.DEAD_COLOR);
const aliveColorStyle = numberToStyle(constants.ALIVE_COLOR);

interface UniverseControlProps {
  canvasRef: React.MutableRefObject<HTMLCanvasElement>,
  universeWasm: UniverseWasm,
}

const roundAndFitInRange = (val: number, min: number, max: number): number => {
  return Math.max(min, Math.min(Math.round(val), max));
}

export const UniverseControl = (props: UniverseControlProps) => {
  let { canvasRef, universeWasm } = props;

  let playButtonRef = useRef<HTMLButtonElement>(null);
  let recreateButtonRef = useRef<HTMLButtonElement>(null);
  let clearButtonRef = useRef<HTMLButtonElement>(null);

  let bornRuleInputRef = useRef<HTMLInputElement>(null);
  let surviveRuleInputRef = useRef<HTMLInputElement>(null);

  let widthInputRef = useRef<HTMLInputElement>(null);
  let heightInputRef = useRef<HTMLInputElement>(null);
  let cellFormFactorSelectRef = useRef<HTMLSelectElement>(null);

  let fpsInputRef = useRef<HTMLInputElement>(null);

  let [fps, setFPS] = useState(24);
  let [active, setActive] = useState(true);

  let [width, setWidth] = useState(universeWasm.width());
  let [height, setHeight] = useState(universeWasm.height());
  let [bornRule, setBornRule] = useState(universeWasm.born_rules());
  let [surviveRule, setSurviveRule] = useState(universeWasm.survives_rules());
  let [cellFormFactor, setCellFormFactor] = useState(universeWasm.cell_form_factor());

  // Input setter
  useEffect(() => {
    fpsInputRef.current.valueAsNumber = fps;

    widthInputRef.current.valueAsNumber = width;
    heightInputRef.current.valueAsNumber = height;

    bornRuleInputRef.current.value = bornRule;
    surviveRuleInputRef.current.value = surviveRule;

    cellFormFactorSelectRef.current.value = cellFormFactor.toString();
  }, [width, height, bornRule, surviveRule, cellFormFactor]);

  // Resize canvas
  useEffect(() => {
    let canvas = canvasRef.current;

    if (cellFormFactor === CellFormFactorWasm.Square) {
      canvas.height = constants.FULL_CELL_SIZE * height + 1;
      canvas.width = constants.FULL_CELL_SIZE * width + 1;
    } else if (cellFormFactor === CellFormFactorWasm.Hexagon) {
      const xPositionHexagonConstantWithFull = Math.sqrt(3) * constants.FULL_CELL_SIZE / 4;

      canvas.width = (height % 2 === 0 ? xPositionHexagonConstantWithFull : 0) + xPositionHexagonConstantWithFull * (1 + 2 * width);
      canvas.height = (2 + 3 * height) * constants.FULL_CELL_SIZE / 4;
    } else if (cellFormFactor === CellFormFactorWasm.Triangle) {
      const xPositionTriangleConstantWithFull = Math.sqrt(3) * constants.FULL_CELL_SIZE / 4;
      const isTriangleUpright = (height % 2 === 1 && width % 2 === 0) || (height % 2 === 0 && width % 2 === 1);

      canvas.width = xPositionTriangleConstantWithFull * (1 + width);
      canvas.height = (isTriangleUpright ? constants.FULL_CELL_SIZE / 4 : constants.FULL_CELL_SIZE / 2) + 3 * constants.FULL_CELL_SIZE * height / 4;
    }
  }, [width, height, cellFormFactor]);
  
  // Fps input listener
  useEffect(() => {
    let listenerFunc = (me: MouseEvent) => { 
      setFPS(fpsInputRef.current.valueAsNumber);
    };

    fpsInputRef.current.addEventListener("blur", listenerFunc);

    return () => {
      fpsInputRef.current.removeEventListener("blur", listenerFunc);
    }
  }, []);

  // Play/Stop button
  useEffect(() => {
    let listenerFunc = (me: MouseEvent) => {
      if (active === true) {
        setActive(false);
      } else {
        setActive(true);
      }
    }

    playButtonRef.current.addEventListener("click", listenerFunc);

    return () => {
      playButtonRef.current.removeEventListener("click", listenerFunc);
    }
  }, [active]);

  // Recreate button
  useEffect(() => {
    let listenerFunc = (me: MouseEvent) => {
      setWidth(widthInputRef.current.valueAsNumber);
      setHeight(heightInputRef.current.valueAsNumber);

      setCellFormFactor(parseInt(cellFormFactorSelectRef.current.value));

      setBornRule(bornRuleInputRef.current.value);
      setSurviveRule(surviveRuleInputRef.current.value);

      universeWasm.restart(
        bornRuleInputRef.current.value,
        surviveRuleInputRef.current.value,
        widthInputRef.current.valueAsNumber,
        heightInputRef.current.valueAsNumber,
        parseInt(cellFormFactorSelectRef.current.value)
      );
    }

    recreateButtonRef.current.addEventListener("click", listenerFunc);

    return () => {
      recreateButtonRef.current.removeEventListener("click", listenerFunc);
    }
  }, []);

  // Clear universe button
  useEffect(() => {
    let listenerFunc = (me: MouseEvent) => {
      universeWasm.clear_universe();
    }

    clearButtonRef.current.addEventListener("click", listenerFunc);

    return () => {
      clearButtonRef.current.removeEventListener("click", listenerFunc);
    }
  }, []);

  useEffect(() => {
    let listenerFunc = (me: MouseEvent) => {
      const boundingRect = canvasRef.current.getBoundingClientRect();
    
      const scaleX = canvasRef.current.width / boundingRect.width;
      const scaleY = canvasRef.current.height / boundingRect.height;
    
      const canvasLeft = (me.clientX - boundingRect.left) * scaleX;
      const canvasTop = (me.clientY - boundingRect.top) * scaleY;
    
      let row: number, col: number;

      if (cellFormFactor === CellFormFactorWasm.Square) {
        row = roundAndFitInRange((2 * canvasTop - constants.FULL_CELL_SIZE) / (2 * constants.FULL_CELL_SIZE), 0, height - 1);
        col = roundAndFitInRange((2 * canvasLeft - constants.FULL_CELL_SIZE) / (2 * constants.FULL_CELL_SIZE), 0, width - 1);
      } else if (cellFormFactor === CellFormFactorWasm.Hexagon) {
        const xPositionHexagonConstantWithFull = Math.sqrt(3) * constants.FULL_CELL_SIZE / 4;
  
        row = roundAndFitInRange(2 * (2 * canvasTop - constants.FULL_CELL_SIZE) / (3 * constants.FULL_CELL_SIZE), 0, height - 1);
        col = roundAndFitInRange(canvasLeft / (2 * xPositionHexagonConstantWithFull) - (row % 2 === 0 ? 1 : 1 / 2), 0, width - 1);
      } else if (cellFormFactor === CellFormFactorWasm.Triangle) {
        const xPositionTriangleConstantWithFull = Math.sqrt(3) * constants.FULL_CELL_SIZE / 4;
        const isTriangleUpright = (h: number, w: number) => (h % 2 === 1 && w % 2 === 0) || (h % 2 === 0 && w % 2 === 1);
  
        col = roundAndFitInRange(canvasLeft / xPositionTriangleConstantWithFull - 1, 0, width - 1);

        let _row = Math.floor(4 * canvasTop / (3 * constants.FULL_CELL_SIZE));
        row = roundAndFitInRange(_row - (isTriangleUpright(_row + 1, col) ? 1 / 3 : 2 / 3), 0, height - 1);
      }

      //console.log(`(${col}, ${row})`);
    
      let cellStatus = universeWasm.cell_toggle(col, row);

      let cellRenderer = chooseRenderer(cellFormFactor);

      let ctx = canvasRef.current.getContext('2d');
      ctx.fillStyle = cellStatus === CellWasm.Alive ? aliveColorStyle : deadColorStyle;

      cellRenderer(ctx, row, col);
      ctx.fill();
    }

    canvasRef.current.addEventListener("click", listenerFunc);

    return () => {
      canvasRef.current.removeEventListener("click", listenerFunc);
    }
  }, [cellFormFactor]);

  return (
    <div>
      <span>
        <input ref = { fpsInputRef } id="fps" type="range" min="1" max="60"/>
        <button ref = { playButtonRef } id="play-stop-button">Play/Stop</button>
        <input ref = { bornRuleInputRef } id="born" type="number" min="1"/>
        <input ref = { surviveRuleInputRef } id="survives" type="number" min="1"/>
        <input ref = { widthInputRef } id="width" type="number" min="1"/>
        <input ref = { heightInputRef } id="height" type="number" min="1"/>
        <select ref = { cellFormFactorSelectRef } id="cell-form-factor-select">
          <option value={ CellFormFactorWasm.Triangle }>Triangle</option>
          <option value={ CellFormFactorWasm.Square }>Square</option>
          <option value={ CellFormFactorWasm.Hexagon }>Hexagon</option>
        </select>
        <button ref = { recreateButtonRef } id="recreate-button">Re-create</button>
        <button ref = { clearButtonRef } id="clear-button">Clear</button>
      </span>
      <CellsRenderer canvasRef = { canvasRef } universeWasm = { universeWasm } fps = { fps } active = { active} />
    </div>
  );
}