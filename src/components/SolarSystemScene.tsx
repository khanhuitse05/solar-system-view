import { useEffect, useMemo, useRef, type MutableRefObject } from 'react';
import { Canvas } from '@react-three/fiber';
import { useFrame, useThree } from '@react-three/fiber';
import { ContactShadows, OrbitControls } from '@react-three/drei';
import { Vector3 } from 'three';
import { PLANETS, AU_SCALE } from '../data/planets';
import { CosmicBackdrop } from './CosmicBackdrop';
import { OrbitPath } from './OrbitPath';
import { Planet } from './Planet';
import { Sun } from './Sun';
import type { FocusTarget, GeoPosition, SolarSystemSnapshot } from '../types';

type Props = {
  showOrbits: boolean;
  showLabels: boolean;
  snapshot: SolarSystemSnapshot;
  observer: GeoPosition;
  focusTarget: FocusTarget;
  onSelectPlanet: (planetId: string) => void;
};

type CameraDirectorProps = {
  controlsRef: MutableRefObject<any>;
  focusTarget: FocusTarget;
  snapshot: SolarSystemSnapshot;
};

function CameraDirector({ controlsRef, focusTarget, snapshot }: CameraDirectorProps) {
  const { camera } = useThree();
  const planetPositionsRef = useRef<Map<string, [number, number, number]>>(new Map());
  const panoramaDistanceRef = useRef(AU_SCALE * 12);
  const animation = useRef<{
    startTime: number;
    fromPosition: Vector3;
    toPosition: Vector3;
    fromTarget: Vector3;
    toTarget: Vector3;
    nonce: number;
  } | null>(null);

  const planetPositions = useMemo(() => new Map(snapshot.planets.map((planet) => [planet.id, planet.position])), [snapshot.planets]);
  const panoramaDistance = useMemo(() => {
    const farthestPlanet = snapshot.planets.reduce((maxDistance, planet) => {
      const distance = new Vector3(planet.position[0], planet.position[1], planet.position[2]).length();
      return Math.max(maxDistance, distance);
    }, 0);

    return Math.max(farthestPlanet, AU_SCALE * 12);
  }, [snapshot.planets]);

  useEffect(() => {
    planetPositionsRef.current = planetPositions;
    panoramaDistanceRef.current = panoramaDistance;
  }, [panoramaDistance, planetPositions]);

  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls) return;

    const toTarget = new Vector3(0, 0, 0);
    const panoramaDistance = panoramaDistanceRef.current;
    let toPosition = new Vector3(0, panoramaDistance * 1.05, panoramaDistance * 2.25);

    if (focusTarget.id !== 'panorama') {
      const selected = planetPositionsRef.current.get(focusTarget.id);
      if (selected) {
        toTarget.set(selected[0], selected[1], selected[2]);
        const outward = toTarget.clone().normalize();
        if (outward.lengthSq() < 0.01) {
          outward.set(1, 0.35, 1).normalize();
        }
        const config = PLANETS.find((planet) => planet.id === focusTarget.id);
        const distance = Math.max((config?.radius ?? 2) * 8, 18);
        toPosition = toTarget
          .clone()
          .add(outward.multiplyScalar(distance))
          .add(new Vector3(0, distance * 0.42, distance * 0.35));
      }
    }

    animation.current = {
      startTime: performance.now(),
      fromPosition: camera.position.clone(),
      toPosition,
      fromTarget: controls.target.clone(),
      toTarget,
      nonce: focusTarget.nonce,
    };
  }, [camera, controlsRef, focusTarget]);

  useFrame(() => {
    const controls = controlsRef.current;
    const current = animation.current;
    if (!controls || !current) return;

    const progress = Math.min((performance.now() - current.startTime) / 950, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    camera.position.lerpVectors(current.fromPosition, current.toPosition, eased);
    controls.target.lerpVectors(current.fromTarget, current.toTarget, eased);
    controls.update();

    if (progress >= 1) {
      animation.current = null;
    }
  });

  return null;
}

export function SolarSystemScene({ showOrbits, showLabels, snapshot, observer, focusTarget, onSelectPlanet }: Props) {
  const controlsRef = useRef<any>(null);

  return (
    <Canvas
      camera={{ position: [0, 52, 92], fov: 46, near: 0.1, far: 3600 }}
      gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
      dpr={[1, 2]}
    >
      <color attach="background" args={['#02040b']} />
      <fog attach="fog" args={['#02040b', 320, 2200]} />
      <ambientLight intensity={0.38} />
      <hemisphereLight args={['#334155', '#02040b', 0.12]} />
      <CosmicBackdrop />
      <Sun />
      <CameraDirector controlsRef={controlsRef} focusTarget={focusTarget} snapshot={snapshot} />
      {PLANETS.map((planet) => (
        <OrbitPath key={`${planet.id}-orbit`} planet={planet} date={snapshot.date} visible={showOrbits} />
      ))}
      {PLANETS.map((planet) => {
        const ephemeris = snapshot.planets.find((entry) => entry.id === planet.id);
        if (!ephemeris) return null;

        return (
          <Planet
            key={planet.id}
            planet={planet}
            ephemeris={ephemeris}
            date={snapshot.date}
            showLabel={showLabels}
            observer={observer}
            onSelect={onSelectPlanet}
          />
        );
      })}
      <ContactShadows opacity={0.18} scale={180} blur={2.2} far={55} position={[0, -8.5, 0]} />
      <OrbitControls
        ref={controlsRef}
        makeDefault
        target={[0, 0, 0]}
        enableDamping
        dampingFactor={0.055}
        minDistance={8}
        maxDistance={AU_SCALE * 80}
        maxPolarAngle={Math.PI * 0.49}
      />
    </Canvas>
  );
}
