import { useState, useMemo } from 'react';
import { ChevronDown, ChevronUp, Eye, EyeOff, FastForward, MapPin, Orbit, Sparkles, SunMedium, Telescope, X } from 'lucide-react';
import { PLANETS } from '../data/planets';
import { ControlButton } from './ControlButton';
import { VisibilityChart } from './VisibilityChart';
import { PlanetFactCard } from './PlanetFactCard';
import { formatDegrees, formatTime, formatUtc, getVisibilityTimeline } from '../utils/realtimeAstronomy';
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
  exaggeratedScale: boolean;
  onToggleScale: () => void;
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
  exaggeratedScale,
  onToggleScale,
}: Props) {
  const [isVisibilityExpanded, setIsVisibilityExpanded] = useState(false);

  const focusedPlanet = useMemo(() => {
    if (focusTarget.id === 'panorama' || focusTarget.id === 'earth') return null;
    if (focusTarget.id === 'sun') return { id: 'sun', name: 'Sun', astronomyBody: 'Sun' };
    if (focusTarget.id === 'moon') return { id: 'moon', name: 'Moon', astronomyBody: 'Moon' };
    return snapshot.planets.find(p => p.id === focusTarget.id);
  }, [focusTarget, snapshot]);

  const timelineData = useMemo(() => {
    if (!focusedPlanet) return [];

    let astronomyBody = '';
    if (focusedPlanet.id === 'sun') astronomyBody = 'Sun';
    else if (focusedPlanet.id === 'moon') astronomyBody = 'Moon';
    else {
      const config = PLANETS.find(p => p.id === focusedPlanet.id);
      if (!config) return [];
      astronomyBody = config.astronomyBody;
    }

    return getVisibilityTimeline(astronomyBody, snapshot.date, observer);
  }, [focusedPlanet, snapshot.date, observer]);
  const visiblePlanets = snapshot.planets.filter((planet) => planet.visibleThroughTelescope);

  return (
    <div className="pointer-events-none absolute inset-0 z-20 flex flex-col justify-between gap-4 p-4 text-slate-100">
      <header className="hud-panel pointer-events-auto grid gap-4 rounded-lg px-4 py-3 lg:grid-cols-[1.25fr_2fr]">
        <div className="flex items-center gap-3">
          <Sparkles className="h-5 w-5 text-cyan-200" />
          <div>
            <div className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-100">Realtime Solar System</div>
            <div className="text-xs text-slate-400">
              {simulationEnabled ? `${simulationDaysPerSecond} simulated day/s` : '1 second = 1 real second, live ephemeris positions'}
            </div>
          </div>
        </div>
        <div className="flex overflow-x-auto pb-2 gap-4 font-mono text-xs text-slate-300 md:grid md:grid-cols-4 md:overflow-visible md:pb-0">
          <div className="shrink-0">
            <span className="block uppercase tracking-[0.18em] text-slate-500">Local</span>
            {formatTime(snapshot.date)}
          </div>
          <div className="shrink-0">
            <span className="block uppercase tracking-[0.18em] text-slate-500">Lat</span>
            {formatDegrees(observer.latitude, 4)}
          </div>
          <div className="shrink-0">
            <span className="block uppercase tracking-[0.18em] text-slate-500">Lng</span>
            {formatDegrees(observer.longitude, 4)}
          </div>
          <div className="shrink-0">
            <span className="block uppercase tracking-[0.18em] text-slate-500">Sun Alt</span>
            {formatDegrees(snapshot.sunAltitudeDeg, 1)}
          </div>
        </div>
      </header>

      <section className="pointer-events-none flex flex-1 w-full items-start justify-between overflow-hidden gap-4">
        <div className="pointer-events-auto flex max-h-full w-64 flex-col gap-3 overflow-hidden sm:w-80">

          <aside className="hud-panel flex min-h-0 flex-col rounded-lg p-3 text-xs text-slate-300">
            <button
              type="button"
              className={`flex w-full items-center justify-between gap-3 text-left md:cursor-default ${isVisibilityExpanded ? 'mb-3' : 'mb-0 md:mb-3'}`}
              onClick={() => setIsVisibilityExpanded((prev) => !prev)}
            >
              <div className="flex items-center gap-2 text-sm font-semibold text-cyan-100">
                <Eye className="h-4 w-4" />
                Telescope Visibility Now
              </div>
              <div className="flex items-center gap-2">
                <div className="hidden shrink-0 text-slate-500 md:block">alt / az / mag</div>
                <div className="text-cyan-200 md:hidden">
                  {isVisibilityExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                </div>
              </div>
            </button>
            <div className={`space-y-2 overflow-y-auto pr-1 ${isVisibilityExpanded ? 'block' : 'hidden md:block'}`}>
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
                    className={`rounded-md border px-3 py-2 ${focusTarget.id === planet.id
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
                            ? 'Twilight-limited'
                            : 'Below Horizon'}
                    </div>
                    <div className="mt-1 font-mono text-[11px] text-slate-300">
                      az {formatDegrees(planet.azimuthDeg, 0)} / {planet.magnitude === null ? '--' : planet.magnitude.toFixed(1)} mag
                      {planet.phaseFraction === null ? '' : ` / ${Math.round(planet.phaseFraction * 100)}%`}
                    </div>
                  </div>
                ))}
              {visiblePlanets.length === 0 && <p className="px-1 text-slate-500">No planets currently visible.</p>}
            </div>
          </aside>
        </div>

        {/* Right Column - Visibility Chart */}
        {focusedPlanet && (
          <div className="pointer-events-auto flex w-64 flex-col gap-3 sm:w-80 shrink-0">
            <aside className="hud-panel flex shrink-0 flex-col rounded-lg p-3">
              <div className="mb-2 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-white">{focusedPlanet.name} Visibility</h2>
                <button
                  type="button"
                  onClick={onPanoramicView}
                  className="rounded-md p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <VisibilityChart data={timelineData} currentTimeMs={snapshot.date.getTime()} />
            </aside>
            <PlanetFactCard planetId={focusedPlanet.id} />
          </div>
        )}
      </section>

      <footer className="hud-panel pointer-events-auto mx-auto flex w-full max-w-5xl flex-col md:flex-row flex-wrap items-center justify-between gap-3 rounded-lg p-3">
        <div className="flex w-full overflow-x-auto pb-1 md:w-auto md:flex-wrap items-center gap-2 md:pb-0">
          <div className="hidden lg:flex items-center gap-2 px-2 text-sm text-slate-300">
            <Orbit className="h-4 w-4 text-cyan-200" />
            AU-scaled real heliocentric positions
          </div>
          <div className="shrink-0"><ControlButton label="Elliptical" active={showOrbits} onClick={onToggleOrbits} /></div>
          <div className="shrink-0"><ControlButton label="Labels" active={showLabels} onClick={onToggleLabels} /></div>
          <div className="shrink-0"><ControlButton label={exaggeratedScale ? "Scale: Exagg." : "Scale: Real"} active={!exaggeratedScale} onClick={onToggleScale} /></div>
          <div className="shrink-0"><ControlButton label="Simulation" active={simulationEnabled} onClick={onToggleSimulation} /></div>
          <div className="shrink-0"><ControlButton label="ReCenter" onClick={onPanoramicView} /></div>
        </div>
        <div className="flex w-full md:w-auto md:min-w-72 flex-wrap items-center justify-between md:justify-end gap-3">
          {simulationEnabled ? (
            <label className="flex w-full md:w-auto md:min-w-72 items-center gap-3 text-sm text-slate-200">
              <FastForward className="shrink-0 h-4 w-4 text-cyan-200" />
              <span className="shrink-0 whitespace-nowrap font-mono">{simulationDaysPerSecond} day/s</span>
              <input
                aria-label="Simulation days per second"
                type="range"
                min="0.25"
                max="30"
                step="0.25"
                value={simulationDaysPerSecond}
                onChange={(event) => onSimulationScaleChange(Number(event.target.value))}
                className="w-full md:w-40 accent-cyan-300"
              />
            </label>
          ) : (
            <div className="flex items-center gap-2 font-mono text-xs text-slate-400">
              <Telescope className="h-4 w-4 text-cyan-200" />
              realtime clock
            </div>
          )}
          <div className="hidden md:block font-mono text-xs text-slate-400">drag orbit / wheel zoom / right-drag pan</div>
        </div>
      </footer>
    </div>
  );
}
