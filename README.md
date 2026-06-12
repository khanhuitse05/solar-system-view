# Realtime Solar System

React + Vite + Three.js desktop-first Solar System viewer using real astronomical positions and observer-based planet visibility.

## What It Does

- Updates from the real system clock once per second. There is no time scaling.
- Uses `astronomy-engine` for heliocentric planet positions, topocentric altitude/azimuth, visual magnitude, and phase.
- Places a telescope marker on Earth using the browser Geolocation API.
- Classifies planets as visible, twilight-limited, daylight-limited, or below the horizon using the observer location and Sun altitude.
- Renders a modern desktop HUD with live local/UTC time, location, Sun altitude, visibility table, and orbit/label toggles.
- Uses procedural canvas textures, surface bands, rings, lighting, star field, and AU-scaled 3D positions for a richer visual model.

## Architecture

```text
src/
  App.tsx                         Real clock, geolocation, live snapshot state
  components/
    SolarSystemScene.tsx          R3F canvas, lights, stars, camera controls
    Sun.tsx                       Central Sun mesh and point light
    Planet.tsx                    Textured spherical planets, rings, telescope marker
    OrbitPath.tsx                 Real orbit path samples from HelioVector
    HudOverlay.tsx                Live observer/visibility dashboard
    ControlButton.tsx             HUD toggle button
  data/
    planets.ts                    Visual planet metadata and rotation periods
  hooks/
    useClock.ts                   1 Hz real-time clock
    useGeolocation.ts             Browser location watcher with fallback
  utils/
    realtimeAstronomy.ts          Astronomy Engine integration and visibility logic
```

## Visibility Logic

For every clock tick:

1. Browser geolocation provides observer latitude/longitude.
2. `Astronomy.Equator` and `Astronomy.Horizon` calculate each planet's apparent altitude/azimuth.
3. The Sun altitude determines sky condition:
   - `> -6 deg`: daylight-limited
   - `-12 deg .. -6 deg`: twilight-limited
   - `<= -12 deg`: dark enough for normal telescope visibility
4. A planet is marked visible through the telescope only when it is above the horizon and the Sun is below nautical twilight.

The 3D scene uses real heliocentric vectors from `Astronomy.HelioVector`, scaled as AU units for desktop readability.

## Run

```bash
npm install
npm run dev
```
