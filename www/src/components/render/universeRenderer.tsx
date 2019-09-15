import * as React from 'react';
import { useState, useEffect, useRef } from 'react';

import { Universe as UniverseWasm, CellFormFactor as CellFormFactorWasm } from 'webrtc-hell-rust';
import { UniverseControl } from 'components/render/universeControl';

interface UniverseProps {
  canvasRef: React.MutableRefObject<HTMLCanvasElement>,
  universeWasm: UniverseWasm
}

export const UniverseRenderer = (props: UniverseProps) => {
  let { canvasRef, universeWasm } = props;

  return (
    <React.Fragment>
      <UniverseControl canvasRef = { canvasRef }
                        universeWasm = { universeWasm }/>
    </React.Fragment>
  );
}