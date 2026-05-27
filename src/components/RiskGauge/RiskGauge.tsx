import './RiskGauge.css';

type RiskGaugeProps = {
  level: number;
};

function riskLabel(level: number) {
  if (level >= 70) return '높음';
  if (level >= 40) return '보통';
  return '낮음';
}

export default function RiskGauge({ level }: RiskGaugeProps) {
  const clamped = Math.min(100, Math.max(0, level));

  return (
    <div className="risk-gauge" aria-label={`시장 리스크 ${clamped}, ${riskLabel(clamped)}`}>
      <div className="risk-gauge__header">
        <span className="risk-gauge__label">시장 리스크</span>
        <span className="risk-gauge__value">
          {clamped}
          <span className="risk-gauge__unit">/ 100</span>
        </span>
      </div>
      <div className="risk-gauge__track">
        <div className="risk-gauge__fill" style={{ width: `${clamped}%` }} />
      </div>
      <span className={`risk-gauge__badge risk-gauge__badge--${clamped >= 70 ? 'high' : clamped >= 40 ? 'mid' : 'low'}`}>
        {riskLabel(clamped)}
      </span>
    </div>
  );
}
