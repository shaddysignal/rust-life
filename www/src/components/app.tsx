import * as React from 'react';
import { useRef } from 'react';

import { Universe as UniverseWasm } from 'webrtc-hell-rust';
import { UniverseRenderer } from 'components/render/universeRenderer';

interface AppProps {
  universe: UniverseWasm
}

export const App = (props: AppProps) => {
  let canvasRef = useRef<HTMLCanvasElement>(null);

  return (
    <div>
      <UniverseRenderer canvasRef = { canvasRef }
                        universeWasm = { props.universe } />

      <canvas ref = { canvasRef }/>
    </div>
  );
}