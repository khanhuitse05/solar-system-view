import { useMemo, useRef } from 'react';
import { Billboard, Text } from '@react-three/drei';
import { AdditiveBlending, BufferGeometry, Float32BufferAttribute, Group, PointsMaterial } from 'three';
import { useFrame } from '@react-three/fiber';

type PointCloudData = {
  geometry: BufferGeometry;
  material: PointsMaterial;
};

function seededRandom(seed: number) {
  let value = seed % 2147483647;
  if (value <= 0) value += 2147483646;

  return () => {
    value = (value * 16807) % 2147483647;
    return (value - 1) / 2147483646;
  };
}

function buildStarLayer(seed: number, count: number, radius: number, size: number, opacity: number): PointCloudData {
  const random = seededRandom(seed);
  const positions: number[] = [];
  const colors: number[] = [];

  for (let index = 0; index < count; index += 1) {
    const z = random() * 2 - 1;
    const theta = random() * Math.PI * 2;
    const horizontal = Math.sqrt(1 - z * z);
    const distance = radius * (0.82 + random() * 0.18);

    positions.push(
      Math.cos(theta) * horizontal * distance,
      z * distance,
      Math.sin(theta) * horizontal * distance,
    );

    const warmth = random();
    const brightness = 0.62 + random() * 0.38;
    colors.push(
      brightness,
      brightness * (0.82 + warmth * 0.16),
      brightness * (0.86 + (1 - warmth) * 0.16),
    );
  }

  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
  geometry.setAttribute('color', new Float32BufferAttribute(colors, 3));

  const material = new PointsMaterial({
    size,
    transparent: true,
    opacity,
    vertexColors: true,
    depthWrite: false,
    sizeAttenuation: false,
  });

  return { geometry, material };
}

function buildOortCloud(): PointCloudData {
  const random = seededRandom(112358);
  const positions: number[] = [];
  const colors: number[] = [];

  for (let index = 0; index < 2600; index += 1) {
    const z = random() * 2 - 1;
    const theta = random() * Math.PI * 2;
    const horizontal = Math.sqrt(1 - z * z);
    const shellBias = Math.pow(random(), 0.42);
    const distance = 310 + shellBias * 250;
    const lopsidedness = 1 + Math.sin(theta * 3.4 + z * 2.1) * 0.035;

    positions.push(
      Math.cos(theta) * horizontal * distance * lopsidedness,
      z * distance * 0.72,
      Math.sin(theta) * horizontal * distance * lopsidedness,
    );

    const icy = 0.58 + random() * 0.42;
    colors.push(icy * 0.62, icy * 0.86, icy);
  }

  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
  geometry.setAttribute('color', new Float32BufferAttribute(colors, 3));

  const material = new PointsMaterial({
    size: 1.45,
    transparent: true,
    opacity: 0.34,
    vertexColors: true,
    depthWrite: false,
    blending: AdditiveBlending,
    sizeAttenuation: true,
  });

  return { geometry, material };
}

function buildMilkyWay(seed: number, count: number, radius: number): PointCloudData {
  const random = seededRandom(seed);
  const positions: number[] = [];
  const colors: number[] = [];

  for (let index = 0; index < count; index += 1) {
    const theta = random() * Math.PI * 2;
    const z = (random() - 0.5) * (random() - 0.5) * 2; 
    const horizontal = Math.sqrt(1 - z * z);
    const distance = radius * (0.9 + random() * 0.2);

    const tilt = 0.5;
    const x = Math.cos(theta) * horizontal * distance;
    const yOrig = z * distance;
    const zOrig = Math.sin(theta) * horizontal * distance;

    const y = yOrig * Math.cos(tilt) - zOrig * Math.sin(tilt);
    const zFinal = yOrig * Math.sin(tilt) + zOrig * Math.cos(tilt);

    positions.push(x, y, zFinal);

    const brightness = 0.3 + random() * 0.4;
    colors.push(brightness, brightness * 0.95, brightness * 1.1);
  }

  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
  geometry.setAttribute('color', new Float32BufferAttribute(colors, 3));

  const material = new PointsMaterial({
    size: 0.8,
    transparent: true,
    opacity: 0.4,
    vertexColors: true,
    depthWrite: false,
    blending: AdditiveBlending,
    sizeAttenuation: false,
  });

  return { geometry, material };
}

function StarLayer({ data }: { data: PointCloudData }) {
  return <points geometry={data.geometry} material={data.material} />;
}

function OortCloud() {
  const ref = useRef<Group>(null);
  const data = useMemo(() => buildOortCloud(), []);

  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta * 0.002;
      ref.current.rotation.x = Math.sin(Date.now() * 0.00003) * 0.018;
    }
  });

  return (
    <group ref={ref}>
      <points geometry={data.geometry} material={data.material} />
      <Billboard position={[0, 92, -360]}>
        <Text
          color="#bfdbfe"
          fontSize={7.5}
          anchorX="center"
          anchorY="middle"
          fillOpacity={0.42}
          outlineWidth={0.12}
          outlineOpacity={0.2}
          outlineColor="#020617"
        >
          Oort Cloud
        </Text>
      </Billboard>
    </group>
  );
}

export function CosmicBackdrop() {
  const nearStars = useMemo(() => buildStarLayer(20260612, 1800, 470, 1.05, 0.82), []);
  const farStars = useMemo(() => buildStarLayer(9973, 2600, 680, 0.72, 0.64), []);
  const brightStars = useMemo(() => buildStarLayer(424242, 260, 640, 1.9, 0.95), []);
  const milkyWay = useMemo(() => buildMilkyWay(1337, 12000, 600), []);

  return (
    <group>
      <StarLayer data={farStars} />
      <StarLayer data={milkyWay} />
      <StarLayer data={nearStars} />
      <StarLayer data={brightStars} />
      <OortCloud />
    </group>
  );
}
