'use client';

interface DataPoint {
  date: string;
  count: number;
}

interface AnalyticsChartProps {
  data: DataPoint[];
  label?: string;
}

export function AnalyticsChart({ data, label = 'Views' }: AnalyticsChartProps) {
  const max = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="p-6 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)]">
      <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-4">{label} — last 30 days</h3>
      <div className="flex items-end gap-1 h-32">
        {data.map((d) => (
          <div key={d.date} className="flex-1 flex flex-col items-center gap-1 group">
            <div
              className="w-full bg-[var(--primary)] rounded-t opacity-80 group-hover:opacity-100 transition-opacity min-h-[2px]"
              style={{ height: `${(d.count / max) * 100}%` }}
              title={`${d.date}: ${d.count}`}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
