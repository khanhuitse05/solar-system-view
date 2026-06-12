import { useMemo } from 'react';
import * as Astronomy from 'astronomy-engine';
import { Line } from '@react-three/drei';
import { AU_SCALE } from '../data/planets';
import type { PlanetConfig } from '../types';

type Props = {
  planet: PlanetConfig;
  date: Date;
  visible: boolean;
};

function bodyFromName(name: string): Astronomy.Body {
  return Astronomy.Body[name as keyof typeof Astronomy.Body];
}

function pointFromVector(vector: Astronomy.Vector): [number, number, number] {
  return [vector.x * AU_SCALE, vector.z * AU_SCALE, -vector.y * AU_SCALE];
}

export function OrbitPath({ planet, date, visible }: Props) {
  const dayKey = Math.floor(date.getTime() / 86_400_000);
  const points = useMemo(() => {
    const body = bodyFromName(planet.astronomyBody);
    const period = body === Astronomy.Body.Earth ? 365.25 : Astronomy.PlanetOrbitalPeriod(body);
    const start = dayKey * 86_400_000 - (period * 86_400_000) / 2;

    return Array.from({ length: 220 }, (_, index) => {
      const sample = new Date(start + (index / 219) * period * 86_400_000);
      return pointFromVector(Astronomy.HelioVector(body, sample));
    });
  }, [dayKey, planet]);

  if (!visible) {
    return null;
  }

  return <Line points={points} color="#5eead4" lineWidth={1} transparent opacity={0.2} />;
}
