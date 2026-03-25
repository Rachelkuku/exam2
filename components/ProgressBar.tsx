type ProgressBarProps = {
  value: number;
};

export default function ProgressBar({ value }: ProgressBarProps) {
  return (
    <div className="progress">
      <div className="progress__label">
        <span>진행률</span>
        <strong>{value}%</strong>
      </div>
      <div className="progress__track">
        <div className="progress__fill" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}
