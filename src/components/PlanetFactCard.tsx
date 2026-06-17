import { PLANETS } from '../data/planets';

type Props = {
  planetId: string;
};

export function PlanetFactCard({ planetId }: Props) {
  const planet = PLANETS.find((p) => p.id === planetId);

  if (!planet) {
    if (planetId === 'sun') {
      return (
        <div className="hud-panel mt-3 rounded-lg p-3 text-sm text-slate-200">
          <div className="mb-2 font-semibold text-amber-200">Star: Sun</div>
          <p className="text-xs text-slate-400 mb-2">The star at the center of the Solar System. It is a nearly perfect sphere of hot plasma, heated to incandescence by nuclear fusion reactions in its core.</p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="text-slate-500">Surface Temp</div>
            <div className="text-right text-slate-300">5,500°C</div>
            <div className="text-slate-500">Type</div>
            <div className="text-right text-slate-300">Yellow Dwarf</div>
          </div>
        </div>
      );
    }
    if (planetId === 'moon') {
      return (
        <div className="hud-panel mt-3 rounded-lg p-3 text-sm text-slate-200">
          <div className="mb-2 font-semibold text-slate-100">Satellite: Moon</div>
          <p className="text-xs text-slate-400 mb-2">Earth's only natural satellite. It is the fifth largest satellite in the Solar System and the largest and most massive relative to its parent planet.</p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="text-slate-500">Surface Temp</div>
            <div className="text-right text-slate-300">-173°C to 127°C</div>
            <div className="text-slate-500">Type</div>
            <div className="text-right text-slate-300">Natural Satellite</div>
          </div>
        </div>
      );
    }
    return null;
  }

  return (
    <div className="hud-panel mt-3 rounded-lg p-3 text-sm text-slate-200">
      <div className="mb-2 font-semibold" style={{ color: planet.color }}>{planet.name} Facts</div>
      {planet.description && <p className="text-xs text-slate-400 mb-2">{planet.description}</p>}
      
      <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 text-[11px]">
        {planet.planetType && (
          <>
            <div className="text-slate-500">Type</div>
            <div className="text-right font-medium text-slate-300">{planet.planetType}</div>
          </>
        )}
        {planet.surfaceTemperature && (
          <>
            <div className="text-slate-500">Surface Temp</div>
            <div className="text-right font-medium text-slate-300">{planet.surfaceTemperature}</div>
          </>
        )}
        <div className="text-slate-500">Day Length</div>
        <div className="text-right font-medium text-slate-300">{Math.abs(planet.rotationPeriodHours)} hrs {planet.rotationPeriodHours < 0 ? '(Retrograde)' : ''}</div>
        <div className="text-slate-500">Axial Tilt</div>
        <div className="text-right font-medium text-slate-300">{planet.axialTiltDeg}°</div>
        {planet.moons !== undefined && (
          <>
            <div className="text-slate-500">Moons</div>
            <div className="text-right font-medium text-slate-300">{planet.moons}</div>
          </>
        )}
      </div>
    </div>
  );
}
