export default function MetricsGrid({ metrics }) {
  return (
    <section className="metrics-grid">
      {metrics.map((item) => (
        <article key={item.label} className="metric-card">
          <span>{item.label}</span>
          <strong>{item.value}</strong>
          <p>{item.note}</p>
          <small>{item.trend}</small>
        </article>
      ))}
    </section>
  )
}