import * as Astronomy from 'astronomy-engine';
import { AU_SCALE, PLANETS } from '../data/planets';
import type { GeoPosition, PlanetEphemeris, SolarSystemSnapshot, Vector3Tuple, VisibilityStatus } from '../types';

const DEFAULT_LOCATION: GeoPosition = {
  latitude: 10.8231,
  longitude: 106.6297,
  altitudeMeters: 0,
};

function bodyFromName(name: string): Astronomy.Body {
  return Astronomy.Body[name as keyof typeof Astronomy.Body];
}

function vectorToScene(vector: Astronomy.Vector, scale = AU_SCALE): Vector3Tuple {
  // Astronomy Engine returns heliocentric J2000 equatorial AU.
  // Three scene uses Y as vertical, so map equatorial Z -> scene Y.
  return [vector.x * scale, vector.z * scale, -vector.y * scale];
}

function planetStatus(altitudeDeg: number, sunAltitudeDeg: number): VisibilityStatus {
  if (altitudeDeg <= 0) return 'below-horizon';
  if (sunAltitudeDeg > -6) return 'daylight';
  if (sunAltitudeDeg > -12) return 'twilight';
  return 'visible';
}

function safeIllumination(body: Astronomy.Body, date: Date) {
  try {
    return Astronomy.Illumination(body, date);
  } catch {
    return null;
  }
}

function bodyHorizon(body: Astronomy.Body, date: Date, observer: Astronomy.Observer) {
  const equatorial = Astronomy.Equator(body, date, observer, true, true);
  const horizon = Astronomy.Horizon(date, observer, equatorial.ra, equatorial.dec, 'normal');

  return {
    equatorial,
    horizon,
  };
}

export function createObserver(position: GeoPosition | null): Astronomy.Observer {
  const location = position ?? DEFAULT_LOCATION;
  return new Astronomy.Observer(location.latitude, location.longitude, (location.altitudeMeters ?? 0) / 1000);
}

export function calculateSolarSystemSnapshot(date: Date, position: GeoPosition | null): SolarSystemSnapshot {
  const observer = createObserver(position);
  const sun = bodyHorizon(Astronomy.Body.Sun, date, observer);
  const sunAltitudeDeg = sun.horizon.altitude;
  const daylight = sunAltitudeDeg > -6;
  const twilight = sunAltitudeDeg > -12 && sunAltitudeDeg <= -6;

  const planets: PlanetEphemeris[] = PLANETS.map((planet) => {
    const body = bodyFromName(planet.astronomyBody);
    const helio = Astronomy.HelioVector(body, date);
    const illumination = body === Astronomy.Body.Earth ? null : safeIllumination(body, date);

    if (body === Astronomy.Body.Earth) {
      return {
        id: planet.id,
        name: planet.name,
        position: vectorToScene(helio),
        heliocentricAu: [helio.x, helio.y, helio.z],
        altitudeDeg: null,
        azimuthDeg: null,
        rightAscensionHours: null,
        declinationDeg: null,
        distanceAu: null,
        magnitude: null,
        phaseFraction: null,
        status: 'below-horizon',
        visibleThroughTelescope: false,
      };
    }

    const { equatorial, horizon } = bodyHorizon(body, date, observer);
    const status = planetStatus(horizon.altitude, sunAltitudeDeg);

    return {
      id: planet.id,
      name: planet.name,
      position: vectorToScene(helio),
      heliocentricAu: [helio.x, helio.y, helio.z],
      altitudeDeg: horizon.altitude,
      azimuthDeg: horizon.azimuth,
      rightAscensionHours: equatorial.ra,
      declinationDeg: equatorial.dec,
      distanceAu: illumination?.geo_dist ?? null,
      magnitude: illumination?.mag ?? null,
      phaseFraction: illumination?.phase_fraction ?? null,
      status,
      visibleThroughTelescope: status === 'visible',
    };
  });

  return {
    date,
    sunAltitudeDeg,
    daylight,
    twilight,
    planets,
  };
}

export function formatDegrees(value: number | null, digits = 1): string {
  if (value === null || Number.isNaN(value)) return '--';
  return `${value.toFixed(digits)} deg`;
}

export function formatTime(date: Date): string {
  return new Intl.DateTimeFormat(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(date);
}

export function formatUtc(date: Date): string {
  return date.toISOString().slice(11, 19);
}

export function defaultLocation(): GeoPosition {
  return DEFAULT_LOCATION;
}
