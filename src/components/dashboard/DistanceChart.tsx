import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const API_BASE =
  (import.meta as any).env?.VITE_API_BASE_URL?.toString?.() ||
  "http://localhost:4000";

interface WeeklyData {
  name: string;
  distance: number;
}

const DistanceChart = () => {
  const [data, setData] = useState<WeeklyData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/targets/weekly-stats`);
        const json = await res.json();

        if (Array.isArray(json?.data) && json.data.length > 0) {
          setData(json.data.map((d: any) => ({
            name: d.name,
            distance: Math.round(d.distance * 100) / 100,
          })));
        } else {
          // Fallback: no data available
          setData([]);
        }
      } catch (err) {
        console.error("Failed to fetch weekly stats:", err);
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
        <h3 className="font-semibold text-foreground">Total Jarak Lari</h3>
        <p className="text-sm text-muted-foreground mt-0.5">
          Akumulasi jarak seluruh pelari per minggu (km)
        </p>
      </div>
      <div className="h-[280px]">
        {loading ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            Loading...
          </div>
        ) : data.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            Belum ada data sesi lari dalam 4 minggu terakhir
          </div>
        ) : (
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
        )}
      </div>
    </div>
  );
};

export default DistanceChart;
