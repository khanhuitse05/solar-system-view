export type Vector3Tuple = [number, number, number];

export type PlanetConfig = {
  id: string;
  name: string;
  astronomyBody: string;
  color: string;
  secondaryColor?: string;
  radius: number;
  rotationPeriodHours: number;
  axialTiltDeg: number;
  hasRings?: boolean;
  moons?: number;
};

export type GeoPosition = {
  latitude: number;
  longitude: number;
  altitudeMeters?: number;
  accuracyMeters?: number;
};

export type VisibilityStatus = 'visible' | 'below-horizon' | 'daylight' | 'twilight';

export type PlanetEphemeris = {
  id: string;
  name: string;
  position: Vector3Tuple;
  heliocentricAu: Vector3Tuple;
  altitudeDeg: number | null;
  azimuthDeg: number | null;
  rightAscensionHours: number | null;
  declinationDeg: number | null;
  distanceAu: number | null;
  magnitude: number | null;
  phaseFraction: number | null;
  status: VisibilityStatus;
  visibleThroughTelescope: boolean;
};

export type SolarSystemSnapshot = {
  date: Date;
  sunAltitudeDeg: number | null;
  daylight: boolean;
  twilight: boolean;
  planets: PlanetEphemeris[];
};

export type FocusTarget = {
  id: string | 'panorama';
  nonce: number;
};

export type AltitudePoint = {
  timeMs: number;
  altitudeDeg: number;
};
