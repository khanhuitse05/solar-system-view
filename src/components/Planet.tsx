import { useMemo, useRef } from 'react';
import { Billboard, Text } from '@react-three/drei';
import { AdditiveBlending, CanvasTexture, Color, DoubleSide, Group, MathUtils, SRGBColorSpace } from 'three';
import { useFrame } from '@react-three/fiber';
import type { GeoPosition, PlanetConfig, PlanetEphemeris } from '../types';

type Props = {
  planet: PlanetConfig;
  ephemeris: PlanetEphemeris;
  date: Date;
  showLabel: boolean;
  observer: GeoPosition;
  onSelect: (planetId: string) => void;
};

function PlanetSurface({ planet }: { planet: PlanetConfig }) {
  const texture = useMemo(() => createPlanetTexture(planet), [planet]);
  const materialColors = useMemo(
    () => ({
      primary: new Color(planet.color),
      secondary: new Color(planet.secondaryColor ?? planet.color).lerp(new Color('#ffffff'), 0.12),
    }),
    [planet],
  );
  const emissiveBoost =
    planet.id === 'uranus' || planet.id === 'neptune' ? 0.42 :
      planet.id === 'saturn' ? 0.32 :
        planet.id === 'jupiter' ? 0.14 :
          0.08;

  return (
    <group>
      <mesh>
        <sphereGeometry args={[planet.radius, 48, 32]} />
        <meshStandardMaterial
          map={texture}
          bumpMap={texture}
          bumpScale={planet.id === 'earth' ? 0.06 : 0.025}
          color={materialColors.primary}
          roughness={0.82}
          metalness={0.02}
          emissive={materialColors.secondary}
          emissiveIntensity={emissiveBoost}
        />
      </mesh>
      <SurfaceDetails planet={planet} color={materialColors.secondary} />
    </group>
  );
}

function createPlanetTexture(planet: PlanetConfig): CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const context = canvas.getContext('2d');

  if (!context) {
    return new CanvasTexture(canvas);
  }

  const primary = planet.color;
  const secondary = planet.secondaryColor ?? planet.color;
  const gradient = context.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, primary);
  gradient.addColorStop(0.5, secondary);
  gradient.addColorStop(1, '#050816');
  context.fillStyle = gradient;
  context.fillRect(0, 0, canvas.width, canvas.height);

  for (let y = 0; y < canvas.height; y += planet.id === 'jupiter' || planet.id === 'saturn' ? 22 : 46) {
    const alpha = planet.id === 'earth' ? 0.16 : 0.24;
    context.fillStyle = `rgba(255,255,255,${alpha})`;
    context.fillRect(0, y + Math.sin(y * 0.03) * 6, canvas.width, 5 + ((y / 7) % 9));
  }

  if (planet.id === 'earth') {
    context.fillStyle = 'rgba(33, 150, 100, 0.76)';
    for (let index = 0; index < 13; index += 1) {
      const x = ((index * 173) % canvas.width) - 80;
      const y = 90 + ((index * 71) % 310);
      context.beginPath();
      context.ellipse(x, y, 84 + (index % 4) * 22, 26 + (index % 3) * 12, index * 0.7, 0, Math.PI * 2);
      context.fill();
    }
    context.fillStyle = 'rgba(255,255,255,0.34)';
    for (let index = 0; index < 24; index += 1) {
      context.beginPath();
      context.ellipse((index * 97) % canvas.width, (index * 53) % canvas.height, 55, 9, index, 0, Math.PI * 2);
      context.fill();
    }
  }

  if (planet.id === 'mars') {
    context.fillStyle = 'rgba(80, 30, 18, 0.45)';
    for (let index = 0; index < 20; index += 1) {
      context.beginPath();
      context.arc((index * 89) % canvas.width, (index * 137) % canvas.height, 8 + (index % 5) * 5, 0, Math.PI * 2);
      context.fill();
    }
  }

  if (planet.id === 'jupiter') {
    context.fillStyle = 'rgba(138, 59, 31, 0.76)';
    context.beginPath();
    context.ellipse(675, 292, 72, 28, -0.2, 0, Math.PI * 2);
    context.fill();
  }

  const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
  for (let index = 0; index < imageData.data.length; index += 4) {
    const noise = (Math.random() - 0.5) * 16;
    imageData.data[index] += noise;
    imageData.data[index + 1] += noise;
    imageData.data[index + 2] += noise;
  }
  context.putImageData(imageData, 0, 0);

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

function SurfaceDetails({ planet, color }: { planet: PlanetConfig; color: Color }) {
  const latitudes = planet.id === 'jupiter' ? [-0.32, -0.14, 0.08, 0.26] : [-0.18, 0.22];

  return (
    <group>
      {latitudes.map((latitude, index) => (
        <mesh key={`band-${index}`} position={[0, planet.radius * Math.sin(latitude), 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[planet.radius * Math.cos(latitude) * 1.006, Math.max(0.018, planet.radius * 0.012), 8, 96]} />
          <meshStandardMaterial color={color} roughness={0.76} />
        </mesh>
      ))}
    </group>
  );
}

function SaturnRings({ radius }: { radius: number }) {
  return (
    <mesh rotation={[MathUtils.degToRad(72), 0, 0]}>
      <ringGeometry args={[radius * 1.35, radius * 2.2, 96]} />
      <meshStandardMaterial color="#d6c291" transparent opacity={0.72} roughness={0.7} side={DoubleSide} />
    </mesh>
  );
}

function TelescopeMarker({ planet, observer }: { planet: PlanetConfig; observer: GeoPosition }) {
  if (planet.id !== 'earth') {
    return null;
  }

  const lat = MathUtils.degToRad(observer.latitude);
  const lon = MathUtils.degToRad(observer.longitude);
  const radius = planet.radius * 1.18;
  const position: [number, number, number] = [
    radius * Math.cos(lat) * Math.cos(lon),
    radius * Math.sin(lat),
    -radius * Math.cos(lat) * Math.sin(lon),
  ];

  return (
    <group position={position}>
      <mesh>
        <sphereGeometry args={[0.24, 16, 10]} />
        <meshStandardMaterial color="#f8fafc" emissive="#67e8f9" emissiveIntensity={0.6} />
      </mesh>
      <mesh position={[0, 0.42, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.18, 0.52, 16]} />
        <meshStandardMaterial color="#38bdf8" emissive="#0891b2" emissiveIntensity={0.45} />
      </mesh>
      <Billboard position={[0, 1.18, 0]}>
        <Text
          color="#f8fafc"
          fontSize={0.55}
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.035}
          outlineColor="#020617"
        >
          You Here
        </Text>
      </Billboard>
    </group>
  );
}

function MoonDots({ planet, showLabel }: { planet: PlanetConfig; showLabel: boolean }) {
  if (!planet.moons) {
    return null;
  }

  const moonCount = Math.min(planet.moons, 5);

  return (
    <group>
      {Array.from({ length: moonCount }, (_, index) => {
        const angle = (index / moonCount) * Math.PI * 2;
        const distance = planet.radius + 2.8 + index * 0.55;
        return (
          <mesh key={index} position={[Math.cos(angle) * distance, 0, Math.sin(angle) * distance]}>
            <sphereGeometry args={[0.22, 12, 8]} />
            <meshStandardMaterial color="#cbd5e1" roughness={0.9} />
            {showLabel ? (
              <Billboard position={[0, 0.6, 0]}>
                <Text
                  color="#e0f2fe"
                  fontSize={0.8}
                  anchorX="center"
                  anchorY="middle"
                  outlineWidth={0.04}
                  outlineColor="#020617"
                >
                  Moon
                </Text>
              </Billboard>
            ) : null}
          </mesh>
        );
      })}
    </group>
  );
}

const J2000_MS = Date.UTC(2000, 0, 1, 12, 0, 0);

export function Planet({ planet, ephemeris, date, showLabel, observer, onSelect }: Props) {
  const groupRef = useRef<Group>(null);
  const planetRef = useRef<Group>(null);
  const axialTilt = MathUtils.degToRad(planet.axialTiltDeg);

  useFrame(({ camera }) => {
    const position = ephemeris.position;
    if (groupRef.current) {
      groupRef.current.position.set(position[0], position[1], position[2]);
      const distance = camera.position.distanceTo(groupRef.current.position);
      const scale = MathUtils.clamp(distance / 110, 1, 3.1);
      groupRef.current.scale.setScalar(scale);
    }

    if (planetRef.current) {
      const elapsedHours = (date.getTime() - J2000_MS) / 3_600_000;
      planetRef.current.rotation.set(axialTilt, (elapsedHours / planet.rotationPeriodHours) * Math.PI * 2, 0);
    }
  });

  return (
    <group
      ref={groupRef}
      onClick={(event) => {
        event.stopPropagation();
        onSelect(planet.id);
      }}
    >
      <group ref={planetRef}>
        <PlanetSurface planet={planet} />
        {planet.hasRings ? <SaturnRings radius={planet.radius} /> : null}
        <MoonDots planet={planet} showLabel={showLabel} />
        <TelescopeMarker planet={planet} observer={observer} />
      </group>
      {planet.id === 'jupiter' || planet.id === 'saturn' || planet.id === 'uranus' || planet.id === 'neptune' ? (
        <mesh>
          <sphereGeometry args={[planet.radius * 1.42, 32, 20]} />
          <meshBasicMaterial
            color={planet.color}
            transparent
            opacity={
              planet.id === 'uranus' || planet.id === 'neptune' ? 0.18 :
                planet.id === 'saturn' ? 0.14 :
                  0.1
            }
            blending={AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      ) : null}
      {showLabel ? (
        <Billboard position={[0, planet.radius + 3.2, 0]}>
          <Text
            color="#e0f2fe"
            fontSize={2.25}
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.08}
            outlineColor="#020617"
          >
            {planet.name}
          </Text>
        </Billboard>
      ) : null}
    </group>
  );
}
