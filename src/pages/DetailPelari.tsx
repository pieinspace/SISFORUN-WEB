import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Mail, Calendar, Target, Clock, TrendingUp, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { MOCK_RUNNERS } from "@/lib/mockRunners";

const progressData = [
  { week: "W1", distance: 25 },
  { week: "W2", distance: 35 },
  { week: "W3", distance: 42 },
  { week: "W4", distance: 58 },
  { week: "W5", distance: 65 },
  { week: "W6", distance: 62 },
];

const sessionHistory = [
  { date: "09 Jan 2026", distance: 14.52, time: "1:23:45", pace: "5:45/km", targetMet: true },
  { date: "07 Jan 2026", distance: 8.25, time: "0:48:12", pace: "5:50/km", targetMet: false },
  { date: "05 Jan 2026", distance: 10.12, time: "1:01:05", pace: "6:02/km", targetMet: false },
  { date: "03 Jan 2026", distance: 6.80, time: "0:42:30", pace: "6:15/km", targetMet: false },
  { date: "01 Jan 2026", distance: 12.35, time: "1:15:20", pace: "6:05/km", targetMet: false },
];

const DetailPelari = () => {
  const { id } = useParams();

  // Get runner data from mock data
  const runnerData = MOCK_RUNNERS.find((r) => r.id === id) || MOCK_RUNNERS[0];
  
  const runner = {
    id: runnerData.id,
    name: runnerData.name,
    rank: runnerData.rank,
    email: runnerData.email,
    joinDate: runnerData.joinDate,
    totalDistance: runnerData.totalDistance,
    totalTime: "16:45:22",
    avgPace: runnerData.pace || "5:52/km",
    totalSessions: runnerData.totalSessions,
    targetAchieved: runnerData.targetStatus === "achieved",
    achievedDate: runnerData.achievedDate || "N/A",
  };

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link to="/pelari">
        <Button variant="ghost" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Data Pelari
        </Button>
      </Link>

      {/* Profile Header */}
      <div className="bg-card rounded-xl border border-border shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary text-primary-foreground text-2xl font-bold">
            {runner.name.split(" ").map((n) => n[0]).join("")}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div>
                <div className="text-sm font-medium text-primary">{runner.rank}</div>
                <h1 className="text-2xl font-bold text-foreground">{runner.name}</h1>
              </div>
              {runner.targetAchieved && (
                <span className="badge-success">
                  <Target className="mr-1 h-3 w-3" />
                  14 KM Tercapai
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <span className="font-mono">{runner.id}</span>
              </span>
              <span className="flex items-center gap-1">
                <Mail className="h-4 w-4" />
                {runner.email}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Bergabung {runner.joinDate}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Jarak</p>
              <p className="text-xl font-bold">{runner.totalDistance} km</p>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
              <Clock className="h-5 w-5 text-accent" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Waktu</p>
              <p className="text-xl font-bold">{runner.totalTime}</p>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
              <Activity className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Rata-rata Pace</p>
              <p className="text-xl font-bold">{runner.avgPace}</p>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
              <Target className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Sesi</p>
              <p className="text-xl font-bold">{runner.totalSessions}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts and History */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Progress Chart */}
        <div className="bg-card rounded-xl border border-border shadow-sm p-5">
          <h3 className="font-semibold text-foreground mb-4">
            Perkembangan Jarak per Minggu
          </h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={progressData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(210, 15%, 90%)" />
                <XAxis
                  dataKey="week"
                  tick={{ fill: "hsl(210, 10%, 45%)", fontSize: 12 }}
                />
                <YAxis
                  tick={{ fill: "hsl(210, 10%, 45%)", fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(0, 0%, 100%)",
                    border: "1px solid hsl(210, 15%, 90%)",
                    borderRadius: "8px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="distance"
                  stroke="hsl(85, 45%, 45%)"
                  strokeWidth={2}
                  dot={{ fill: "hsl(85, 45%, 45%)", strokeWidth: 2 }}
                  name="Jarak (km)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Session History */}
        <div className="bg-card rounded-xl border border-border shadow-sm p-5">
          <h3 className="font-semibold text-foreground mb-4">
            Riwayat Sesi Lari
          </h3>
          <div className="space-y-3">
            {sessionHistory.map((session, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`h-2 w-2 rounded-full ${
                      session.targetMet ? "bg-success" : "bg-muted-foreground"
                    }`}
                  />
                  <div>
                    <p className="font-medium text-sm">{session.distance} km</p>
                    <p className="text-xs text-muted-foreground">{session.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{session.time}</p>
                  <p className="text-xs text-muted-foreground">{session.pace}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailPelari;
