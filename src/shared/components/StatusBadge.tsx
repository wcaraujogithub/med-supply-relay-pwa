// type StatusBadgeProps = {
//   label: string;
//   tone: 'success' | 'warning' | 'danger' | 'neutral';
// };

// export function StatusBadge({ label, tone }: StatusBadgeProps) {
//   return <span className={`status-badge status-badge--${tone}`}>{label}</span>;
// }


type StatusBadgeProps = {
  label: string;
  tone: 'success' | 'warning' | 'danger' | 'neutral';
  nextCheckInSeconds?: number | null;
  progressPercent?: number | null;
};

function formatSeconds(value: number): string {
  const safe = Math.max(0, value);
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;

  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export function StatusBadge({
  label,
  tone,
  nextCheckInSeconds,
  progressPercent
}: StatusBadgeProps) {
  const progress =
    typeof progressPercent === 'number'
      ? Math.max(0, Math.min(100, progressPercent))
      : null;

  return (
    <span className={`status-badge status-badge--${tone}`}>
      {progress !== null && (
        <span
          className="status-badge__progress"
          style={{ width: `${progress}%` }}
        />
      )}

      <span className="status-badge__label">{label}</span>

      {typeof nextCheckInSeconds === 'number' && (
        <span className="status-badge__timer">
          {formatSeconds(nextCheckInSeconds)}
        </span>
      )}
    </span>
  );
}