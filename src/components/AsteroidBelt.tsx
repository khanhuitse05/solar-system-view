import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { AdditiveBlending, MathUtils, Points } from 'three';
import { AU_SCALE } from '../data/planets';

export function AsteroidBelt({ count = 5000 }: { count?: number }) {
  const pointsRef = useRef<Points>(null);

  const [positions, sizes] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const size = new Float32Array(count);
    const innerRadius = 2.2 * AU_SCALE;
    const outerRadius = 3.2 * AU_SCALE;

    for (let i = 0; i < count; i++) {
      // Random radius between inner and outer, weighted slightly towards middle
      const r = MathUtils.lerp(
        innerRadius,
        outerRadius,
        Math.random() * 0.5 + Math.random() * 0.5
      );
      
      const theta = Math.random() * Math.PI * 2;
      // Slight inclination to make it a belt, not a flat disc
      const y = (Math.random() - 0.5) * (Math.random() * 4);

      pos[i * 3] = r * Math.cos(theta);
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = r * Math.sin(theta);

      size[i] = Math.random() * 0.4 + 0.1;
    }

    return [pos, size];
  }, [count]);

  useFrame((_, delta) => {
    if (pointsRef.current) {
      // Rotate the whole belt slowly
      pointsRef.current.rotation.y += delta * 0.02;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-size"
          args={[sizes, 1]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={1}
        sizeAttenuation
        color="#888888"
        transparent
        opacity={0.6}
        blending={AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}
