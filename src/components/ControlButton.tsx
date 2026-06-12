type Props = {
  label: string;
  active?: boolean;
  onClick: () => void;
};

export function ControlButton({ label, active = false, onClick }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-md border px-3 py-2 text-sm transition ${
        active
          ? 'border-cyan-300/70 bg-cyan-300/15 text-cyan-100'
          : 'border-slate-500/25 bg-slate-950/45 text-slate-200 hover:border-cyan-300/45 hover:bg-slate-900/80'
      }`}
    >
      {label}
    </button>
  );
}
