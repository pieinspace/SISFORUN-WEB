import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { name: "Minggu 1", distance: 245 },
  { name: "Minggu 2", distance: 312 },
  { name: "Minggu 3", distance: 287 },
  { name: "Minggu 4", distance: 398 },
];

const DistanceChart = () => {
  return (
    <div className="bg-card rounded-xl border border-border shadow-sm p-5 animate-slide-up">
      <div className="mb-4">
        <h3 className="font-semibold text-foreground">Total Jarak Lari</h3>
        <p className="text-sm text-muted-foreground mt-0.5">
          Akumulasi jarak seluruh pelari per minggu (km)
        </p>
      </div>
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
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
            <Bar
              dataKey="distance"
              fill="hsl(170, 60%, 40%)"
              radius={[4, 4, 0, 0]}
              name="Total Jarak (km)"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default DistanceChart;
