import './MarketDrivers.css';

type MarketDriversProps = {
  drivers: string[];
};

export default function MarketDrivers({ drivers }: MarketDriversProps) {
  if (drivers.length === 0) return null;

  return (
    <section className="market-drivers" aria-label="시장 핵심 변수">
      <h3 className="market-drivers__title">핵심 변수</h3>
      <ul className="market-drivers__list">
        {drivers.map((driver) => (
          <li key={driver} className="market-drivers__item">
            {driver}
          </li>
        ))}
      </ul>
    </section>
  );
}
