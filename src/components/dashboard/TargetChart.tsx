import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { name: "Sen", targets: 4, distance: 45 },
  { name: "Sel", targets: 6, distance: 62 },
  { name: "Rab", targets: 8, distance: 78 },
  { name: "Kam", targets: 5, distance: 55 },
  { name: "Jum", targets: 12, distance: 120 },
  { name: "Sab", targets: 15, distance: 145 },
  { name: "Min", targets: 18, distance: 175 },
];

const TargetChart = () => {
  return (
    <div className="bg-card rounded-xl border border-border shadow-sm p-5 animate-slide-up">
      <div className="mb-4">
        <h3 className="font-semibold text-foreground">Pencapaian Target Mingguan</h3>
        <p className="text-sm text-muted-foreground mt-0.5">
          Jumlah pelari yang mencapai target 14 KM
        </p>
      </div>
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorTargets" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(85, 45%, 45%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(85, 45%, 45%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(210, 15%, 90%)" />
            <XAxis
              dataKey="name"
              tick={{ fill: "hsl(210, 10%, 45%)", fontSize: 12 }}
              axisLine={{ stroke: "hsl(210, 15%, 90%)" }}
            />
            <YAxis
              tick={{ fill: "hsl(210, 10%, 45%)", fontSize: 12 }}
              axisLine={{ stroke: "hsl(210, 15%, 90%)" }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(0, 0%, 100%)",
                border: "1px solid hsl(210, 15%, 90%)",
                borderRadius: "8px",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
              }}
            />
            <Area
              type="monotone"
              dataKey="targets"
              stroke="hsl(85, 45%, 45%)"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorTargets)"
              name="Target Tercapai"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default TargetChart;
