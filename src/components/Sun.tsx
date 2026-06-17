import { useMemo, useRef } from 'react';
import { CanvasTexture, Mesh, SRGBColorSpace } from 'three';
import { useFrame } from '@react-three/fiber';
import { SUN_RADIUS } from '../data/planets';

function createSunTexture(): CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const context = canvas.getContext('2d');

  if (!context) {
    return new CanvasTexture(canvas);
  }

  const base = context.createLinearGradient(0, 0, canvas.width, canvas.height);
  base.addColorStop(0, '#fff3a3');
  base.addColorStop(0.3, '#ffb347');
  base.addColorStop(0.58, '#f97316');
  base.addColorStop(1, '#7c1d08');
  context.fillStyle = base;
  context.fillRect(0, 0, canvas.width, canvas.height);

  for (let index = 0; index < 360; index += 1) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const radius = 10 + Math.random() * 62;
    const flare = context.createRadialGradient(x, y, 0, x, y, radius);
    flare.addColorStop(0, `rgba(255, ${180 + Math.random() * 70}, 70, ${0.32 + Math.random() * 0.28})`);
    flare.addColorStop(0.45, 'rgba(255, 94, 20, 0.18)');
    flare.addColorStop(1, 'rgba(120, 20, 8, 0)');
    context.fillStyle = flare;
    context.beginPath();
    context.arc(x, y, radius, 0, Math.PI * 2);
    context.fill();
  }

  for (let y = 0; y < canvas.height; y += 26) {
    context.strokeStyle = 'rgba(255, 245, 170, 0.18)';
    context.lineWidth = 4 + Math.random() * 8;
    context.beginPath();
    for (let x = 0; x <= canvas.width; x += 18) {
      const wave = y + Math.sin(x * 0.018 + y * 0.04) * 16 + Math.sin(x * 0.051) * 7;
      if (x === 0) context.moveTo(x, wave);
      else context.lineTo(x, wave);
    }
    context.stroke();
  }

  const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
  for (let index = 0; index < imageData.data.length; index += 4) {
    const heat = (Math.random() - 0.35) * 34;
    imageData.data[index] += heat;
    imageData.data[index + 1] += heat * 0.45;
    imageData.data[index + 2] -= heat * 0.25;
  }
  context.putImageData(imageData, 0, 0);

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

export function Sun() {
  const ref = useRef<Mesh>(null);
  const texture = useMemo(() => createSunTexture(), []);

  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta * 0.1;
      ref.current.rotation.x += delta * 0.012;
    }

  });

  return (
    <group>
      <pointLight 
        castShadow 
        intensity={2950} 
        distance={0} 
        decay={1.55} 
        color="#fff1b8" 
        shadow-mapSize={[2048, 2048]} 
        shadow-bias={-0.0001}
      />
      <mesh ref={ref}>
        <sphereGeometry args={[SUN_RADIUS, 96, 56]} />
        <meshBasicMaterial map={texture} color="#fff1a6" />
      </mesh>
    </group>
  );
}
