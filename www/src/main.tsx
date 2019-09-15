import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { Universe as UniverseWasm, CellFormFactor as CellFormFactorWasm } from "webrtc-hell-rust";
//import { startRendering } from "./render";
import { App } from 'components/app';

const universe: UniverseWasm = UniverseWasm.new("2", "34", 64, 64, CellFormFactorWasm.Hexagon);

ReactDOM.render(
  <App universe = { universe } />,
  document.getElementById('game-of-life-root')
);