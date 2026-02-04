import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Check,
  CheckCircle2,
  ChevronDown,
  Clock,
  Eye,
  Search,
  Trophy
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { cn, formatWIB } from "@/lib/utils";

interface TargetRunner {
  id: string;
  sessionId: string; // run_session id untuk validasi
  name: string;
  rank: string;
  distance: number;
  time: string;
  pace: string;
  achievedDate: string; // untuk ditampilkan (format Indonesia)
  achievedDateRaw: string; // YYYY-MM-DD untuk filter
  validationStatus: "validated" | "pending";
  kesatuan: string;
  subdis: string;
  kd_ktm?: string;
  kd_smkl?: string;
  kd_corps?: string;
  corps?: string;
}

type ApiTargetRow = {
  id: string; // user_id
  session_id: string; // run_session id
  name: string;
  rank: string;
  distance_km: number;
  time_taken: string | null;
  pace: string | null;
  achieved_date: string; // YYYY-MM-DD
  validation_status: "validated" | "pending";
  kesatuan?: string;
  subdis?: string;
  kd_ktm?: string;
  kd_smkl?: string;
  kd_corps?: string;
  kd_pkt?: string;
  pangkat_name?: string;
  kesatuan_name?: string;
  subdis_name?: string;
  corps_name?: string;
};

const API_BASE =
  (import.meta as any).env?.VITE_API_BASE_URL?.toString?.() ||
  "http://localhost:4001";




const isInPeriod = (yyyyMmDd: string, period: string) => {
  if (period === "all") return true;

  const date = new Date(`${yyyyMmDd}T00:00:00`);
  if (Number.isNaN(date.getTime())) return true;

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  if (period === "today") {
    return date >= startOfToday;
  }

  if (period === "week") {
    // 7 hari terakhir termasuk hari ini
    const start = new Date(startOfToday);
    start.setDate(start.getDate() - 6);
    return date >= start;
  }

  if (period === "month") {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    return date >= start;
  }

  return true;
};

const Target14KM = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [filterKesatuan, setFilterKesatuan] = useState("");
  const [filterSubdis, setFilterSubdis] = useState("");
  const [openKesatuan, setOpenKesatuan] = useState(false);
  const [openSubdis, setOpenSubdis] = useState(false);

  // User Role & Scope
  const [currentUser, setCurrentUser] = useState<any>(null);
  useEffect(() => {
    const userStr = localStorage.getItem("admin_user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setCurrentUser(user);
        // Pre-fill filters based on scope
        if (user.role === 'admin_kotama' && user.kd_ktm) {
          setFilterKesatuan(user.kd_ktm);
        } else if (user.role === 'admin_satuan' && user.kd_ktm && user.kd_smkl) {
          setFilterKesatuan(user.kd_ktm);
          setFilterSubdis(user.kd_smkl);
        }
      } catch (e) {
        console.error("Failed to parse admin_user", e);
      }
    }
  }, []);

  const isSuperAdmin = currentUser?.role === 'superadmin';
  const isAdminKotama = currentUser?.role === 'admin_kotama';
  const isAdminSatuan = currentUser?.role === 'admin_satuan';

  const [targetRunners, setTargetRunners] = useState<TargetRunner[]>([]);
  const [loading, setLoading] = useState(true);

  // Master Data State
  const [masterKesatuan, setMasterKesatuan] = useState<{ kd_ktm: string; ur_ktm: string }[]>([]);
  const [masterSubdis, setMasterSubdis] = useState<{ kd_ktm: string; kd_smkl: string; ur_smkl: string }[]>([]);
  const [masterCorps, setMasterCorps] = useState<{ kd_corps: string; init_corps: string }[]>([]);

  // Fetch Master Data on Mount
  useEffect(() => {
    const fetchMasterData = async () => {
      const token = localStorage.getItem("admin_token");
      const headers = { "Authorization": `Bearer ${token}` };
      try {
        const [ktmRes, corpsRes] = await Promise.all([
          fetch(`${API_BASE}/api/master/kesatuan`, { headers }),
          fetch(`${API_BASE}/api/master/corps`, { headers })
        ]);
        const ktmJson = await ktmRes.json();
        const corpsJson = await corpsRes.json();
        if (ktmJson.success) setMasterKesatuan(ktmJson.data);
        if (corpsJson.success) setMasterCorps(corpsJson.data);
      } catch (error) {
        console.error("Failed to fetch master data:", error);
      }
    };
    fetchMasterData();
  }, []);

  // Fetch Subdis when filterKesatuan changes
  useEffect(() => {
    if (!filterKesatuan) {
      setMasterSubdis([]);
      setFilterSubdis("");
      return;
    }

    const fetchSubdis = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/master/subdis/${filterKesatuan}`);
        const data = await res.json();
        if (data.success) {
          setMasterSubdis(data.data);
        }
      } catch (error) {
        console.error("Failed to fetch subdis:", error);
      }
    };
    fetchSubdis();
  }, [filterKesatuan]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("admin_token");
        const res = await fetch(`${API_BASE}/api/targets/14km`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const json = await res.json();
        const data: ApiTargetRow[] = Array.isArray(json?.data) ? json.data : [];

        const mapped: TargetRunner[] = data.map((r) => ({
          id: r.id,
          sessionId: r.session_id,
          name: r.name,
          rank: r.pangkat_name || r.rank || "-",
          distance: Number(r.distance_km ?? 0),
          time: r.time_taken ?? "0:00:00",
          pace: r.pace ?? "0:00/km",
          achievedDate: formatWIB(r.achieved_date),
          achievedDateRaw: r.achieved_date,
          validationStatus: r.validation_status || "pending",
          kesatuan: r.kesatuan_name || r.kesatuan || "-",
          subdis: r.subdis_name || r.subdis || "-",
          kd_ktm: r.kd_ktm,
          kd_smkl: r.kd_smkl,
          kd_corps: r.kd_corps,
          corps: (() => {
            const pk = parseInt(r.kd_pkt || "0");
            const isAsnOrGeneral = (pk >= 21 && pk <= 45) || (pk >= 91 && pk <= 94);
            return isAsnOrGeneral ? "-" : (r.corps_name || "-");
          })(),
        }));

        if (!cancelled) setTargetRunners(mapped);
      } catch (e) {
        if (!cancelled) setTargetRunners([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [masterKesatuan, masterCorps]);

  const handleValidate = async (sessionId: string, odebugId: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/targets/14km/validate/${sessionId}`, {
        method: 'POST'
      });
      if (!res.ok) throw new Error('Gagal memvalidasi target');

      toast.success('Target berhasil divalidasi');

      // Update local state using sessionId
      setTargetRunners(prev => prev.map(r =>
        r.sessionId === sessionId ? { ...r, validationStatus: 'validated' } : r
      ));
    } catch (err) {
      console.error(err);
      toast.error('Gagal memvalidasi target');
    }
  };

  const filteredRunners = useMemo(() => {
    return targetRunners.filter((runner) => {
      const matchesSearch =
        runner.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        runner.id.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || runner.validationStatus === statusFilter;

      const matchesDate = isInPeriod(runner.achievedDateRaw, dateFilter);

      const matchesKesatuan = !filterKesatuan || runner.kd_ktm === filterKesatuan;
      const matchesSubdis = !filterSubdis || runner.kd_smkl === filterSubdis;

      return matchesSearch && matchesStatus && matchesDate && matchesKesatuan && matchesSubdis;
    });
  }, [targetRunners, searchQuery, statusFilter, dateFilter, filterKesatuan, filterSubdis]);

  const validatedCount = useMemo(
    () => targetRunners.filter((r) => r.validationStatus === "validated").length,
    [targetRunners]
  );
  const pendingCount = useMemo(
    () => targetRunners.filter((r) => r.validationStatus === "pending").length,
    [targetRunners]
  );



  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="page-header">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <Trophy className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="page-title">Monitoring Target</h1>
            <p className="page-description">
              Daftar pelari yang telah mencapai target (Militer 14 KM, ASN 10 KM)
            </p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="stat-card">
          <p className="text-sm font-medium text-muted-foreground">
            Total Tercapai
          </p>
          <p className="text-2xl font-bold text-foreground">
            {targetRunners.length}
          </p>
        </div>
        <div className="stat-card">
          <p className="text-sm font-medium text-muted-foreground">
            Tervalidasi
          </p>
          <p className="text-2xl font-bold text-success">{validatedCount}</p>
        </div>
        <div className="stat-card">
          <p className="text-sm font-medium text-muted-foreground">
            Menunggu Validasi
          </p>
          <p className="text-2xl font-bold text-warning">{pendingCount}</p>
        </div>
      </div>

      {/* Filters - Grid Layout dengan Kesatuan & Subdis */}
      <div className="bg-card rounded-xl border border-border shadow-sm p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search Nama */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground mb-2">
              Cari Nama
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari nama pelari..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Filter Kotama */}
          {isSuperAdmin && (
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Kotama
              </Label>
              <Popover open={openKesatuan} onOpenChange={setOpenKesatuan}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openKesatuan}
                    className="w-full justify-between bg-background/50 border-muted-foreground/20 hover:border-primary/50 transition-colors"
                  >
                    {masterKesatuan.find(k => k.kd_ktm === filterKesatuan)?.ur_ktm || "Semua Kotama"}
                    <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[250px] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Cari kotama..." />
                    <CommandList>
                      <CommandEmpty>Kotama tidak ditemukan.</CommandEmpty>
                      <CommandGroup>
                        <CommandItem
                          value=""
                          onSelect={() => {
                            setFilterKesatuan("");
                            setOpenKesatuan(false);
                          }}
                        >
                          <CheckCircle2
                            className={cn(
                              "mr-2 h-4 w-4",
                              filterKesatuan === "" ? "opacity-100" : "opacity-0"
                            )}
                          />
                          Semua Kotama
                        </CommandItem>
                        {masterKesatuan.map((k) => (
                          <CommandItem
                            key={k.kd_ktm}
                            value={k.ur_ktm}
                            onSelect={() => {
                              setFilterKesatuan(k.kd_ktm === filterKesatuan ? "" : k.kd_ktm);
                              setOpenKesatuan(false);
                            }}
                          >
                            <CheckCircle2
                              className={cn(
                                "mr-2 h-4 w-4",
                                filterKesatuan === k.kd_ktm ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {k.ur_ktm}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          )}

          {/* Filter Kesatuan - Searchable Dropdown */}
          {(isSuperAdmin || isAdminKotama) && (
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Kesatuan
              </Label>
              <Popover open={openSubdis} onOpenChange={setOpenSubdis}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openSubdis}
                    className="w-full justify-between bg-background/50 border-muted-foreground/20 hover:border-primary/50 transition-colors"
                    disabled={!filterKesatuan}
                  >
                    {masterSubdis.find(s => s.kd_smkl === filterSubdis)?.ur_smkl || "Semua Kesatuan"}
                    <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[250px] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Cari kesatuan..." />
                    <CommandList>
                      <CommandEmpty>Kesatuan tidak ditemukan.</CommandEmpty>
                      <CommandGroup>
                        <CommandItem
                          value=""
                          onSelect={() => {
                            setFilterSubdis("");
                            setOpenSubdis(false);
                          }}
                        >
                          <CheckCircle2
                            className={cn(
                              "mr-2 h-4 w-4",
                              filterSubdis === "" ? "opacity-100" : "opacity-0"
                            )}
                          />
                          Semua Kesatuan
                        </CommandItem>
                        {masterSubdis.map((s) => (
                          <CommandItem
                            key={s.kd_smkl}
                            value={s.ur_smkl}
                            onSelect={() => {
                              setFilterSubdis(s.kd_smkl === filterSubdis ? "" : s.kd_smkl);
                              setOpenSubdis(false);
                            }}
                          >
                            <CheckCircle2
                              className={cn(
                                "mr-2 h-4 w-4",
                                filterSubdis === s.kd_smkl ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {s.ur_smkl}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          )}

          {/* Filter Status Validasi */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground mb-2">
              Status Validasi
            </label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Semua Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="validated">Tervalidasi</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Filter Periode Waktu */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground mb-2">
              Periode Waktu
            </label>
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Semua Waktu" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Waktu</SelectItem>
                <SelectItem value="today">Hari Ini</SelectItem>
                <SelectItem value="week">Minggu Ini</SelectItem>
                <SelectItem value="month">Bulan Ini</SelectItem>
              </SelectContent>
            </Select>
          </div>


        </div>
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Pangkat</th>
                <th>Nama</th>
                <th>Corps</th>
                <th>Kotama</th>
                <th>Kesatuan</th>
                <th>Jarak Tempuh</th>
                <th>Waktu Tempuh</th>
                <th>Pace</th>
                <th>Tanggal</th>
                <th>Status</th>
                <th className="text-right">Aksi</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={8}
                    className="py-6 text-center text-sm text-muted-foreground"
                  >
                    Loading...
                  </td>
                </tr>
              ) : filteredRunners.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="py-6 text-center text-sm text-muted-foreground"
                  >
                    Tidak ada data.
                  </td>
                </tr>
              ) : (
                filteredRunners.map((runner) => (
                  <tr key={`${runner.id}-${runner.achievedDateRaw}`}>
                    <td className="font-medium text-sm">{runner.rank}</td>
                    <td className="font-medium">{runner.name}</td>
                    <td className="text-muted-foreground">{runner.corps || "-"}</td>
                    <td className="text-muted-foreground">{runner.kesatuan || "-"}</td>
                    <td className="text-muted-foreground">{runner.subdis || "-"}</td>
                    <td className="font-semibold text-primary">
                      {runner.distance.toFixed(2)} km
                    </td>
                    <td>{runner.time}</td>
                    <td>{runner.pace}</td>
                    <td className="text-muted-foreground whitespace-nowrap tabular-nums">{runner.achievedDate}</td>
                    <td>
                      {runner.validationStatus === "validated" ? (
                        <span className="badge-success">
                          <CheckCircle2 className="mr-1 h-3 w-3" />
                          Tervalidasi
                        </span>
                      ) : (
                        <span className="badge-pending">
                          <Clock className="mr-1 h-3 w-3" />
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="text-right">
                      <div className="flex justify-end gap-2">
                        {runner.validationStatus === 'pending' && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-success border-success/20 hover:bg-success/10"
                            onClick={() => handleValidate(runner.sessionId, runner.id)}
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Validasi
                          </Button>
                        )}
                        <Link to={`/pelari/${runner.id}`}>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Target14KM;