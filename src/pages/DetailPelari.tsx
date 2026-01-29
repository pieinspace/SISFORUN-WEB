import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Mail,
  Calendar,
  Target,
  Clock,
  TrendingUp,
  Activity,
  Pencil,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const API_BASE =
  (import.meta as any).env?.VITE_API_BASE_URL?.toString?.() ||
  "http://localhost:4000";

type ApiRunner = {
  id: string;
  name: string;
  rank: string | null;
  status: string | null;
  total_distance?: number;
  total_sessions?: number;
  totalDistance?: number;
  totalSessions?: number;
  created_at?: string;
  createdAt?: string;
};

type ApiTarget14 = {
  id: string; // runner_id dari API targets.ts kamu (t.runner_id AS id)
  name: string;
  rank: string;
  distance_km: number;
  time_taken: string | null;
  pace: string | null;
  achieved_date: string; // YYYY-MM-DD
  validation_status: "validated" | "pending";
};

const formatDateID = (yyyyMmDd: string) => {
  const d = new Date(`${yyyyMmDd}T00:00:00`);
  if (Number.isNaN(d.getTime())) return yyyyMmDd;
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(d);
};

const makeEmail = (name: string, rank: string) => {
  const rankLower = (rank || "").toLowerCase().replace(/[^a-z]/g, "");
  const parts = name
    .trim()
    .split(/\s+/)
    .map((p) => p.replace(/[^A-Za-z]/g, ""))
    .filter(Boolean);

  if (!parts.length) return "-";

  const firstWord = (parts[0] || "").toLowerCase();
  const secondWord = (parts[1] || "").toLowerCase();

  const firstName =
    rankLower && firstWord === rankLower && secondWord ? secondWord : firstWord;

  if (!rankLower || !firstName) return "-";
  return `${rankLower}.${firstName}@tni.mil.id`;
};

const calcTargetAchieved = (totalDistance: number) => totalDistance >= 14;

const DetailPelari = () => {
  const { id } = useParams();
  const runnerId = id || "";

  const [runner, setRunner] = useState<{
    id: string;
    name: string;
    rank: string;
    email: string;
    joinDate: string;
    totalDistance: number;
    totalTime: string;
    avgPace: string;
    totalSessions: number;
    targetAchieved: boolean;
    achievedDate: string;
  } | null>(null);

  const [sessionHistory, setSessionHistory] = useState<
    { date: string; distance: number; time: string; pace: string; targetMet: boolean }[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Edit State
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editFormData, setEditFormData] = useState({
    nama: '',
    pangkat: ''
  });

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setErrorMsg(null);

      try {
        // 1) Fetch runner detail by ID
        const runnerRes = await fetch(`${API_BASE}/api/runners/${runnerId}`);
        if (!runnerRes.ok) {
          throw new Error(`Pelari dengan ID ${runnerId} tidak ditemukan.`);
        }
        const runnerJson = await runnerRes.json();
        const r = runnerJson.data;

        if (!r) {
          throw new Error(`Pelari dengan ID ${runnerId} tidak ditemukan.`);
        }

        const totalDistance = parseFloat(r.totalDistance) || 0;
        const totalSessions = parseInt(r.totalSessions) || 0;

        const createdAt = (r.createdAt ?? r.created_at ?? "").toString();
        const joinDate =
          createdAt && createdAt.length >= 10 ? formatDateID(createdAt.slice(0, 10)) : "-";

        // 2) Fetch session history
        const sessionsRes = await fetch(`${API_BASE}/api/runners/${runnerId}/sessions`);
        const sessionsJson = await sessionsRes.json();
        const sessions = Array.isArray(sessionsJson?.data) ? sessionsJson.data : [];

        const history = sessions.map((x: any) => ({
          date: formatDateID(x.date?.toString().slice(0, 10) || ""),
          distance: Number(x.distance ?? 0),
          time: x.time ?? "-",
          pace: x.pace ?? "-",
          targetMet: x.targetMet ?? false,
        }));

        // Get first session that met target for achievedDate
        const achievedSession = sessions.find((s: any) => s.targetMet);
        const achievedDate = achievedSession?.date
          ? formatDateID(achievedSession.date.toString().slice(0, 10))
          : "Belum tercapai";

        const rank = r.rank ?? "-";
        const name = r.name;

        const payload = {
          id: r.id.toString(),
          name,
          rank,
          email: makeEmail(name, rank),
          joinDate,
          totalDistance,
          totalTime: r.totalTime || "-",
          avgPace: r.avgPace || "-",
          totalSessions,
          targetAchieved: calcTargetAchieved(totalDistance),
          achievedDate,
        };

        if (!cancelled) {
          setRunner(payload);
          setSessionHistory(history);
        }
      } catch (e: any) {
        if (!cancelled) setErrorMsg(e?.message || "Gagal memuat data pelari.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    if (runnerId) load();
    return () => {
      cancelled = true;
    };
  }, [runnerId]);

  const handleEditClick = () => {
    if (!runner) return;
    setEditFormData({
      nama: runner.name,
      pangkat: runner.rank
    });
    setEditDialogOpen(true);
  };

  const handleUpdate = async () => {
    if (!runner) return;
    setIsUpdating(true);
    try {
      const res = await fetch(`${API_BASE}/api/runners/${runner.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: editFormData.nama,
          rank: editFormData.pangkat
        }),
      });

      if (!res.ok) throw new Error('Gagal memperbarui data');

      toast.success('Profil pelari berhasil diperbarui');
      setEditDialogOpen(false);

      // Update local state
      setRunner(prev => prev ? {
        ...prev,
        name: editFormData.nama,
        rank: editFormData.pangkat,
        email: makeEmail(editFormData.nama, editFormData.pangkat)
      } : null);
    } catch (err) {
      console.error(err);
      toast.error('Gagal memperbarui profil pelari');
    } finally {
      setIsUpdating(false);
    }
  };

  // Progress chart: dibuat dari data asli yang tersedia (riwayat target_14km untuk runner ini)
  // Kalau belum ada, chart tetap tampil tapi kosong.
  const progressData = useMemo(() => {
    // pakai maksimal 6 data paling akhir sebagai W1..W6
    const latest = [...sessionHistory].reverse().slice(-6); // oldest -> newest
    return latest.map((s, idx) => ({
      week: `W${idx + 1}`,
      distance: s.distance,
    }));
  }, [sessionHistory]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-sm text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (errorMsg || !runner) {
    return (
      <div className="space-y-6">
        <Link to="/pelari">
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Data Pelari
          </Button>
        </Link>

        <div className="bg-card rounded-xl border border-border shadow-sm p-6">
          <p className="text-sm text-destructive">{errorMsg || "Data tidak ditemukan."}</p>
        </div>
      </div>
    );
  }

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
          <Button variant="outline" className="gap-2" onClick={handleEditClick}>
            <Pencil className="h-4 w-4" />
            Edit Profil
          </Button>
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
                <XAxis dataKey="week" tick={{ fill: "hsl(210, 10%, 45%)", fontSize: 12 }} />
                <YAxis tick={{ fill: "hsl(210, 10%, 45%)", fontSize: 12 }} />
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
          {progressData.length === 0 && (
            <p className="mt-2 text-xs text-muted-foreground">
              Belum ada data sesi di database untuk grafik (isi tabel target_14km atau buat tabel run_sessions).
            </p>
          )}
        </div>

        {/* Session History */}
        <div className="bg-card rounded-xl border border-border shadow-sm p-5">
          <h3 className="font-semibold text-foreground mb-4">Riwayat Sesi Lari</h3>

          {sessionHistory.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              Belum ada riwayat sesi di database untuk pelari ini.
            </div>
          ) : (
            <div className="space-y-3">
              {sessionHistory.map((session, index) => (
                <div
                  key={`${session.date}-${index}`}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-2 w-2 rounded-full ${session.targetMet ? "bg-success" : "bg-muted-foreground"
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
          )}
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Profil Pelari</DialogTitle>
            <DialogDescription>
              Perbarui informasi nama dan pangkat pelari di sini.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-pangkat" className="text-right">
                Pangkat
              </Label>
              <Input
                id="edit-pangkat"
                value={editFormData.pangkat}
                onChange={(e) => setEditFormData(prev => ({ ...prev, pangkat: e.target.value }))}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-nama" className="text-right">
                Nama
              </Label>
              <Input
                id="edit-nama"
                value={editFormData.nama}
                onChange={(e) => setEditFormData(prev => ({ ...prev, nama: e.target.value }))}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)} disabled={isUpdating}>
              Batal
            </Button>
            <Button onClick={handleUpdate} disabled={isUpdating}>
              {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Simpan Perubahan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DetailPelari;
