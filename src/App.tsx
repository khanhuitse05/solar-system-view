import { useEffect, useMemo, useState } from 'react';
import { HudOverlay } from './components/HudOverlay';
import { SolarSystemScene } from './components/SolarSystemScene';
import { useClock } from './hooks/useClock';
import { useGeolocation } from './hooks/useGeolocation';
import { calculateSolarSystemSnapshot } from './utils/realtimeAstronomy';
import type { FocusTarget } from './types';

export function App() {
  const now = useClock(1000);
  const location = useGeolocation();
  const [showOrbits, setShowOrbits] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [simulationEnabled, setSimulationEnabled] = useState(false);
  const [simulationDaysPerSecond, setSimulationDaysPerSecond] = useState(1);
  const [simulatedDateMs, setSimulatedDateMs] = useState(() => Date.now());
  const [focusTarget, setFocusTarget] = useState<FocusTarget>({ id: 'panorama', nonce: 0 });

  useEffect(() => {
    if (!simulationEnabled) {
      setSimulatedDateMs(now.getTime());
    }
  }, [now, simulationEnabled]);

  useEffect(() => {
    if (!simulationEnabled) return;

    let previous = performance.now();
    let frame = 0;

    const tick = (current: number) => {
      const deltaSeconds = Math.min((current - previous) / 1000, 0.12);
      previous = current;
      setSimulatedDateMs((value) => value + deltaSeconds * simulationDaysPerSecond * 86_400_000);
      frame = window.requestAnimationFrame(tick);
    };

    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, [simulationDaysPerSecond, simulationEnabled]);

  const activeDate = simulationEnabled ? new Date(simulatedDateMs) : now;
  const realTimeSnapshot = useMemo(() => calculateSolarSystemSnapshot(now, location.position), [now, location.position]);
  const sceneSnapshot = useMemo(() => calculateSolarSystemSnapshot(activeDate, location.position), [activeDate, location.position]);

  const focusPlanet = (planetId: string) => {
    setFocusTarget((target) => ({ id: planetId, nonce: target.nonce + 1 }));
  };

  const focusPanorama = () => {
    setFocusTarget((target) => ({ id: 'panorama', nonce: target.nonce + 1 }));
  };

  return (
    <main className="relative h-full w-full overflow-hidden bg-[#02040b]">
      <SolarSystemScene
        showOrbits={showOrbits}
        showLabels={showLabels}
        snapshot={sceneSnapshot}
        observer={location.position}
        focusTarget={focusTarget}
        onSelectPlanet={focusPlanet}
      />
      <HudOverlay
        showOrbits={showOrbits}
        showLabels={showLabels}
        snapshot={realTimeSnapshot}
        observer={location.position}
        locationStatus={location.status}
        locationError={location.error}
        focusTarget={focusTarget}
        simulationEnabled={simulationEnabled}
        simulationDaysPerSecond={simulationDaysPerSecond}
        onToggleOrbits={() => setShowOrbits((value) => !value)}
        onToggleLabels={() => setShowLabels((value) => !value)}
        onSelectPlanet={focusPlanet}
        onPanoramicView={focusPanorama}
        onToggleSimulation={() => {
          setSimulationEnabled((value) => {
            if (!value) {
              setSimulatedDateMs(now.getTime());
            }
            return !value;
          });
        }}
        onSimulationScaleChange={setSimulationDaysPerSecond}
      />
    </main>
  );
}
