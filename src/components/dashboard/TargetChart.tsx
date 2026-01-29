import { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const API_BASE =
  (import.meta as any).env?.VITE_API_BASE_URL?.toString?.() ||
  "http://localhost:4000";

interface DailyData {
  name: string;
  targets: number;
  distance: number;
  date: string;
}

const TargetChart = () => {
  const [data, setData] = useState<DailyData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/targets/daily-achievement`);
        const json = await res.json();

        if (Array.isArray(json?.data)) {
          setData(json.data);
        } else {
          setData([]);
        }
      } catch (err) {
        console.error("Failed to fetch daily achievement:", err);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="bg-card rounded-xl border border-border shadow-sm p-5 animate-slide-up">
      <div className="mb-4">
        <h3 className="font-semibold text-foreground">Pencapaian Target Mingguan</h3>
        <p className="text-sm text-muted-foreground mt-0.5">
          Jumlah pelari yang mencapai target 14 KM (7 hari terakhir)
        </p>
      </div>
      <div className="h-[280px]">
        {loading ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            Loading...
          </div>
        ) : (
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
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(0, 0%, 100%)",
                  border: "1px solid hsl(210, 15%, 90%)",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                }}
                formatter={(value: number, name: string) => {
                  if (name === "targets") return [value, "Target Tercapai"];
                  return [value, name];
                }}
              />
              <Area
                type="monotone"
                dataKey="targets"
                stroke="hsl(85, 45%, 45%)"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorTargets)"
                name="targets"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default TargetChart;
