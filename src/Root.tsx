import React from 'react';
import { Composition } from 'remotion';
import { BenchmarkVideo } from './BenchmarkVideo';

export const RemotionRoot: React.FC = () => (
  <Composition id="BenchmarkVideo" component={BenchmarkVideo}
    durationInFrames={1800} fps={30} width={1920} height={1080} />
);