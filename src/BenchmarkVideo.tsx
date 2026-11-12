import React from 'react';
import {
  AbsoluteFill, Easing, interpolate, Sequence, spring,
  useCurrentFrame, useVideoConfig,
} from 'remotion';

const bg = '#101827';
const cyan = '#56D9E8';
const white = '#F4F7FB';
const muted = '#9FB0C5';

const scenes = [
  { title: 'IDEAS INTO MOTION', sub: 'A one-minute rendering benchmark', tag: '01 / INTRO' },
  { title: '1800 FRAMES', sub: '1920 × 1080  ·  30 frames per second', tag: '02 / SCALE' },
  { title: 'CODE-DRIVEN VIDEO', sub: 'Typography · Geometry · Timing · Transitions', tag: '03 / PIPELINE' },
  { title: 'MEASURE THE MACHINE', sub: 'CPU · Memory · Render time · Output size', tag: '04 / METRICS' },
  { title: 'READY TO RENDER', sub: 'Remotion on GitHub Codespaces', tag: '05 / COMPLETE' },
];

const Scene: React.FC<{index: number; title: string; sub: string; tag: string}> = ({index, title, sub, tag}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const enter = spring({frame, fps, config: {damping: 18, stiffness: 90, mass: 0.8}});
  const fade = interpolate(frame, [0, 12, 165, 180], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.ease),
  });
  const drift = interpolate(frame, [0, 180], [70, -30]);
  const pulse = 1 + Math.sin((frame + index * 18) / 15) * 0.025;

  return (
    <AbsoluteFill style={{backgroundColor: bg, color: white, opacity: fade, fontFamily: 'Arial, sans-serif', overflow: 'hidden'}}>
      <AbsoluteFill style={{opacity: 0.18, backgroundImage: 'linear-gradient(rgba(86,217,232,.22) 1px, transparent 1px), linear-gradient(90deg, rgba(86,217,232,.22) 1px, transparent 1px)', backgroundSize: '80px 80px', transform: `translateY(${drift}px)`}} />
      <div style={{position: 'absolute', left: 140, top: 110, color: cyan, fontSize: 22, letterSpacing: 8, fontWeight: 700}}>{tag}</div>
      <div style={{position: 'absolute', right: 140, top: 105, color: muted, fontSize: 20}}>REMOTION / CLOUD LAB</div>
      <div style={{position: 'absolute', left: 140, top: 330, width: 1200, transform: `translateY(${(1-enter)*55}px) scale(${pulse})`, transformOrigin: 'left center'}}>
        <div style={{fontSize: 94, lineHeight: 1.08, fontWeight: 800, letterSpacing: -3}}>{title}</div>
        <div style={{marginTop: 42, fontSize: 34, color: muted, letterSpacing: 1}}>{sub}</div>
        <div style={{marginTop: 76, width: 260 + (frame % 120) * 3, height: 7, backgroundColor: cyan, borderRadius: 8}} />
      </div>
      <div style={{position: 'absolute', right: 150, bottom: 150, width: 260, height: 260, border: `3px solid ${cyan}`, borderRadius: index % 2 ? '50%' : 36, transform: `rotate(${frame * (index % 2 ? -0.5 : 0.5)}deg) scale(${0.85 + enter * 0.15})`, boxShadow: '0 0 70px rgba(86,217,232,.18)'}}>
        <div style={{position: 'absolute', left: '50%', top: '50%', width: 90, height: 90, background: cyan, borderRadius: index % 2 ? 18 : '50%', transform: `translate(-50%, -50%) rotate(${frame * 1.2}deg)`}} />
      </div>
      <div style={{position: 'absolute', left: 140, right: 140, bottom: 80, height: 2, backgroundColor: 'rgba(255,255,255,.18)'}} />
      <div style={{position: 'absolute', left: 140, bottom: 42, color: muted, fontSize: 18}}>60-SECOND RENDER TEST</div>
      <div style={{position: 'absolute', right: 140, bottom: 42, color: muted, fontSize: 18}}>SCENE {String(index + 1).padStart(2, '0')} / 05</div>
    </AbsoluteFill>
  );
};

export const BenchmarkVideo: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: bg}}>
    {scenes.map((scene, i) => (
      <Sequence key={scene.tag} from={i * 360} durationInFrames={360}>
        <Scene index={i} {...scene} />
      </Sequence>
    ))}
  </AbsoluteFill>
);