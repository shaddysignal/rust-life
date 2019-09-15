import * as React from 'react';
import { useState, useEffect } from 'react';
import _ from 'lodash';

export const useFpsEffect = () => {
  const [fpsHistory, setFpsHistory] = useState<number[]>([]);
  const [frameTimestamp, setFrameTimestamp] = useState(performance.now());

  useEffect(() => {
    const currentTimestamp = performance.now();
    const delta = currentTimestamp - frameTimestamp;
    setFrameTimestamp(currentTimestamp);

    const fps = 1 / (delta / 1000);

    fpsHistory.push(fps);
    if (fpsHistory.length > 100) fpsHistory.shift();
    setFpsHistory(fpsHistory);
  });

  const maxFps = Math.floor(_.max(fpsHistory));
  const minFps = Math.floor(_.min(fpsHistory));
  const meanFps = Math.floor(_.mean(fpsHistory));

  return [meanFps, minFps, maxFps];
}