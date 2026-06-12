import { Eye, EyeOff, FastForward, MapPin, Orbit, Sparkles, SunMedium, Telescope } from 'lucide-react';
import { PLANETS } from '../data/planets';
import { ControlButton } from './ControlButton';
import { formatDegrees, formatTime, formatUtc } from '../utils/realtimeAstronomy';
import type { FocusTarget, GeoPosition, SolarSystemSnapshot } from '../types';

type Props = {
  showOrbits: boolean;
  showLabels: boolean;
  snapshot: SolarSystemSnapshot;
  observer: GeoPosition;
  locationStatus: string;
  locationError: string | null;
  focusTarget: FocusTarget;
  simulationEnabled: boolean;
  simulationDaysPerSecond: number;
  onToggleOrbits: () => void;
  onToggleLabels: () => void;
  onSelectPlanet: (planetId: string) => void;
  onPanoramicView: () => void;
  onToggleSimulation: () => void;
  onSimulationScaleChange: (daysPerSecond: number) => void;
};

export function HudOverlay({
  showOrbits,
  showLabels,
  snapshot,
  observer,
  locationStatus,
  locationError,
  focusTarget,
  simulationEnabled,
  simulationDaysPerSecond,
  onToggleOrbits,
  onToggleLabels,
  onSelectPlanet,
  onPanoramicView,
  onToggleSimulation,
  onSimulationScaleChange,
}: Props) {
  const visiblePlanets = snapshot.planets.filter((planet) => planet.visibleThroughTelescope);

  return (
    <div className="pointer-events-none absolute inset-0 z-20 flex flex-col justify-between gap-4 p-4 text-slate-100">
      <header className="hud-panel pointer-events-auto grid gap-4 rounded-lg px-4 py-3 lg:grid-cols-[1.25fr_2fr_auto]">
        <div className="flex items-center gap-3">
          <Sparkles className="h-5 w-5 text-cyan-200" />
          <div>
            <div className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-100">Realtime Solar System</div>
            <div className="text-xs text-slate-400">
              {simulationEnabled ? `${simulationDaysPerSecond} simulated day/s` : '1 second = 1 real second, live ephemeris positions'}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 font-mono text-xs text-slate-300 md:grid-cols-6">
          <div>
            <span className="block uppercase tracking-[0.18em] text-slate-500">Local</span>
            {formatTime(snapshot.date)}
          </div>
          <div>
            <span className="block uppercase tracking-[0.18em] text-slate-500">UTC</span>
            {formatUtc(snapshot.date)}
          </div>
          <div>
            <span className="block uppercase tracking-[0.18em] text-slate-500">Planets</span>
            {PLANETS.length}
          </div>
          <div>
            <span className="block uppercase tracking-[0.18em] text-slate-500">Visible</span>
            {visiblePlanets.length}
          </div>
          <div>
            <span className="block uppercase tracking-[0.18em] text-slate-500">Mode</span>
            {simulationEnabled ? 'Sim' : 'Real'}
          </div>
          <div>
            <span className="block uppercase tracking-[0.18em] text-slate-500">Sun Alt</span>
            {formatDegrees(snapshot.sunAltitudeDeg, 1)}
          </div>
        </div>
        <button
          type="button"
          onClick={onPanoramicView}
          className="justify-self-end rounded-md border border-cyan-300/30 bg-cyan-300/10 px-3 py-2 text-sm text-cyan-100 transition hover:bg-cyan-300/20"
        >
          Panoramic View
        </button>
      </header>

      <section className="pointer-events-none flex flex-1 items-start overflow-hidden">
        <div className="pointer-events-auto flex max-h-full w-full flex-col gap-3 overflow-hidden sm:w-80">
          <aside className="hud-panel rounded-lg p-3 text-xs text-slate-300">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-cyan-100">
              <MapPin className="h-4 w-4" />
              Telescope Location
            </div>
            <div className="space-y-2 font-mono">
              <div>Latitude: {formatDegrees(observer.latitude, 4)}</div>
              <div>Longitude: {formatDegrees(observer.longitude, 4)}</div>
              <div>Accuracy: {observer.accuracyMeters ? `${Math.round(observer.accuracyMeters)} m` : 'fallback'}</div>
              <div>Status: {locationStatus}</div>
            </div>
            {locationError ? <div className="mt-3 rounded-md border border-amber-300/25 bg-amber-300/10 p-2 text-amber-100">{locationError}</div> : null}
            <div className="mt-4 flex items-start gap-2 rounded-md border border-slate-500/20 bg-slate-950/35 p-2">
              <SunMedium className="mt-0.5 h-4 w-4 text-amber-200" />
              <p>
                {snapshot.daylight
                  ? 'Daylight: planets above the horizon are marked daylight-limited.'
                  : snapshot.twilight
                    ? 'Twilight: bright planets may be possible, but contrast is reduced.'
                    : 'Night sky: planets above the horizon are marked visible.'}
              </p>
            </div>
          </aside>

          <aside className="hud-panel min-h-0 overflow-auto rounded-lg p-3 text-xs text-slate-300">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-cyan-100">
                <Eye className="h-4 w-4" />
                Telescope Visibility Now
              </div>
              <div className="shrink-0 text-slate-500">alt / az / mag</div>
            </div>
            <div className="space-y-2">
              {snapshot.planets
                .filter((planet) => planet.id !== 'earth')
                .map((planet) => (
                  <div
                    role="button"
                    tabIndex={0}
                    key={planet.id}
                    onClick={() => onSelectPlanet(planet.id)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        onSelectPlanet(planet.id);
                      }
                    }}
                    className={`rounded-md border px-3 py-2 ${
                      focusTarget.id === planet.id
                        ? 'border-cyan-200/70 bg-cyan-300/15 text-cyan-50'
                        : planet.visibleThroughTelescope
                        ? 'border-emerald-300/35 bg-emerald-300/10 text-emerald-50'
                        : 'border-slate-500/15 bg-slate-950/35'
                    } cursor-pointer transition hover:border-cyan-300/45 hover:bg-cyan-300/10`}
                  >
                    <div className="flex items-center justify-between gap-2 font-semibold">
                      <div className="flex items-center gap-2">
                        {planet.visibleThroughTelescope ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                        {planet.name}
                      </div>
                      <div className="font-mono text-[11px] text-slate-300">{formatDegrees(planet.altitudeDeg, 1)}</div>
                    </div>
                    <div className="mt-1 text-slate-400">
                      {planet.status === 'visible'
                        ? 'Visible through telescope'
                        : planet.status === 'daylight'
                          ? 'Daylight-limited'
                          : planet.status === 'twilight'
                            ? 'Twilight'
                            : 'Below horizon'}
                    </div>
                    <div className="mt-1 font-mono text-[11px] text-slate-300">
                      az {formatDegrees(planet.azimuthDeg, 0)} / {planet.magnitude === null ? '--' : planet.magnitude.toFixed(1)} mag
                      {planet.phaseFraction === null ? '' : ` / ${Math.round(planet.phaseFraction * 100)}%`}
                    </div>
                  </div>
                ))}
            </div>
          </aside>
        </div>
      </section>

      <footer className="hud-panel pointer-events-auto mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-3 rounded-lg p-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 px-2 text-sm text-slate-300">
            <Orbit className="h-4 w-4 text-cyan-200" />
            AU-scaled real heliocentric positions
          </div>
          <ControlButton label="Elliptical Paths" active={showOrbits} onClick={onToggleOrbits} />
          <ControlButton label="Planet Labels" active={showLabels} onClick={onToggleLabels} />
          <ControlButton label="Simulation Mode" active={simulationEnabled} onClick={onToggleSimulation} />
        </div>
        <div className="flex min-w-72 flex-wrap items-center justify-end gap-3">
          {simulationEnabled ? (
            <label className="flex min-w-72 items-center gap-3 text-sm text-slate-200">
              <FastForward className="h-4 w-4 text-cyan-200" />
              <span className="whitespace-nowrap font-mono">{simulationDaysPerSecond} day/s</span>
              <input
                aria-label="Simulation days per second"
                type="range"
                min="0.25"
                max="30"
                step="0.25"
                value={simulationDaysPerSecond}
                onChange={(event) => onSimulationScaleChange(Number(event.target.value))}
                className="w-40 accent-cyan-300"
              />
            </label>
          ) : (
            <div className="flex items-center gap-2 font-mono text-xs text-slate-400">
              <Telescope className="h-4 w-4 text-cyan-200" />
              realtime clock
            </div>
          )}
          <div className="font-mono text-xs text-slate-400">drag orbit / wheel zoom / right-drag pan</div>
        </div>
      </footer>
    </div>
  );
}
