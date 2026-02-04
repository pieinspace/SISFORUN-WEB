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
import { AlertCircle, CheckCircle2, ChevronDown, Clock, Eye, Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from "react-router-dom";
import { toast } from "sonner";

const API_BASE =
  (import.meta as any).env?.VITE_API_BASE_URL?.toString?.() ||
  "http://localhost:4001";

interface ApiRunner {
  id: string;
  name: string;
  rank: string | null;
  kesatuan?: string;
  totalDistance?: number;
  total_distance?: number;
  totalSessions?: number;
  total_sessions?: number;
  created_at?: string;
  createdAt?: string;
  kd_ktm?: string;
  kd_smkl?: string;
  kd_corps?: string;
  kd_pkt?: string;
  pangkat_name?: string;
  kesatuan_name?: string;
  subdis_name?: string;
  corps_name?: string;
}

interface ApiTarget14 {
  id: string;
  distance_km: number;
  validation_status: "validated" | "pending";
}

interface Pelari {
  id: string;
  pangkat: string;
  nama: string;
  email: string;
  kesatuan: string;
  subdis: string;
  corps: string; // Add this
  totalSesi: number;
  totalJarak: number;
  statusTarget: string;
  bergabung: string;
  kd_ktm?: string;
  kd_smkl?: string;
  kd_corps?: string;
  kd_pkt?: string;
}

const formatDateID = (isoString: string) => {
  if (!isoString) return "-";
  const d = new Date(isoString);
  if (Number.isNaN(d.getTime())) return "-";
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

const DataPelari = () => {
  const [loading, setLoading] = useState(true);
  const [pelariData, setPelariData] = useState<Pelari[]>([]);

  // Master Data State
  const [masterKesatuan, setMasterKesatuan] = useState<{ kd_ktm: string; ur_ktm: string }[]>([]);
  const [masterSubdis, setMasterSubdis] = useState<{ kd_ktm: string; kd_smkl: string; ur_smkl: string }[]>([]);
  const [masterCorps, setMasterCorps] = useState<{ kd_corps: string; init_corps: string; ur_corps: string }[]>([]);
  const [masterPangkat, setMasterPangkat] = useState<{ kd_pkt: string; ur_pkt: string }[]>([]);

  const [searchNama, setSearchNama] = useState('');
  const [filterKesatuan, setFilterKesatuan] = useState('');
  const [filterSubdis, setFilterSubdis] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
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

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Fetch Master Data on Mount
  useEffect(() => {
    const fetchMasterData = async () => {
      const token = localStorage.getItem("admin_token");
      const headers = { "Authorization": `Bearer ${token}` };
      try {
        const [ktmRes, corpsRes, pktRes] = await Promise.all([
          fetch(`${API_BASE}/api/master/kesatuan`, { headers }),
          fetch(`${API_BASE}/api/master/corps`, { headers }),
          fetch(`${API_BASE}/api/master/pangkat`, { headers })
        ]);

        const [ktmJson, corpsJson, pktJson] = await Promise.all([
          ktmRes.json(),
          corpsRes.json(),
          pktRes.json()
        ]);

        if (ktmJson.success) setMasterKesatuan(ktmJson.data);
        if (corpsJson.success) setMasterCorps(corpsJson.data);
        if (pktJson.success) setMasterPangkat(pktJson.data);
      } catch (error) {
        console.error("Failed to fetch master data:", error);
      }
    };
    fetchMasterData();
  }, []);

  // Fetch Subdis when filterKesatuan changes
  useEffect(() => {
    const fetchSubdis = async () => {
      if (!filterKesatuan) {
        setMasterSubdis([]);
        setFilterSubdis("");
        return;
      }

      try {
        const token = localStorage.getItem("admin_token");
        const headers = { "Authorization": `Bearer ${token}` };
        const res = await fetch(`${API_BASE}/api/master/subdis/${filterKesatuan}`, { headers });

        if (res.status === 401 || res.status === 403) {
          localStorage.removeItem("admin_token");
          localStorage.removeItem("admin_user");
          window.location.href = "/login";
          return;
        }

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
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch Runners
        const token = localStorage.getItem("admin_token");
        const headers = { "Authorization": `Bearer ${token}` };

        const runnersRes = await fetch(`${API_BASE}/api/runners`, { headers });

        if (runnersRes.status === 401 || runnersRes.status === 403) {
          localStorage.removeItem("admin_token");
          localStorage.removeItem("admin_user");
          window.location.href = "/login";
          return;
        }

        const runnersJson = await runnersRes.json();
        const runners: ApiRunner[] = Array.isArray(runnersJson?.data) ? runnersJson.data : [];

        // Fetch Targets
        const targetsRes = await fetch(`${API_BASE}/api/targets/14km`, { headers });
        const targetsJson = await targetsRes.json();
        const targets: ApiTarget14[] = Array.isArray(targetsJson?.data) ? targetsJson.data : [];

        // Map data
        const mappedData: Pelari[] = runners.map((r) => {
          const target = targets.find(t => t.id === r.id);

          let statusTarget = "Belum Mulai";
          if (target) {
            const pk = parseInt(r.kd_pkt || "0");
            const targetGoal = pk <= 45 ? 10 : 14;
            if (target.distance_km >= targetGoal && target.validation_status === "validated") {
              statusTarget = "Tercapai";
            } else {
              statusTarget = "Dalam Proses";
            }
          } else {
            const pk = parseInt(r.kd_pkt || "0");
            const targetGoal = pk <= 45 ? 10 : 14;
            const dist = Number(r.totalDistance ?? r.total_distance ?? 0);
            if (dist > 0) statusTarget = "Dalam Proses";
            if (dist >= targetGoal) statusTarget = "Tercapai";
          }

          const rank = r.pangkat_name || r.rank || "-";
          const kesatuanLabel = r.kesatuan_name || r.kesatuan || "-";

          // Hide corps for ASN (21-45) and Generals (91-94)
          const pk = parseInt(r.kd_pkt || "0");
          const isAsnOrGeneral = (pk >= 21 && pk <= 45) || (pk >= 91 && pk <= 94);
          const corpsLabel = isAsnOrGeneral ? "-" : (r.corps_name || "-");

          const subdisLabel = r.subdis_name || "-";

          return {
            id: r.id,
            pangkat: rank,
            nama: r.name,
            email: makeEmail(r.name, rank),
            kesatuan: kesatuanLabel,
            subdis: subdisLabel,
            corps: corpsLabel,
            totalSesi: Number(r.totalSessions ?? r.total_sessions ?? 0),
            totalJarak: Number(r.totalDistance ?? r.total_distance ?? 0),
            statusTarget: statusTarget,
            bergabung: formatDateID(r.createdAt ?? r.created_at ?? ""),
            kd_ktm: r.kd_ktm,
            kd_smkl: r.kd_smkl,
            kd_corps: r.kd_corps,
            kd_pkt: r.kd_pkt,
          };
        });

        setPelariData(mappedData);

      } catch (err) {
        console.error("Failed to fetch data in DataPelari:", err);
        toast.error("Gagal mengambil data pelari. Silakan cek koneksi atau login ulang.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [masterKesatuan, masterCorps, masterSubdis]); // Add master data as dependencies to re-run mapping if they load later

  // Filter data
  const filteredData = useMemo(() => {
    return pelariData.filter(pelari => {
      const matchNama = pelari.nama.toLowerCase().includes(searchNama.toLowerCase());
      const matchKesatuan = !filterKesatuan || pelari.kd_ktm === filterKesatuan;
      const matchSubdis = !filterSubdis || pelari.kd_smkl === filterSubdis;
      const matchStatus = filterStatus === 'all' || !filterStatus || pelari.statusTarget === filterStatus;
      return matchNama && matchKesatuan && matchSubdis && matchStatus;
    });
  }, [pelariData, searchNama, filterKesatuan, filterSubdis, filterStatus]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchNama, filterKesatuan, filterSubdis, filterStatus]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    return pages;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">Data Pelari</h1>
        <p className="page-description">Kelola dan pantau seluruh data pelari terdaftar</p>
      </div>

      {/* Filters */}
      <div className="bg-card rounded-xl border border-border shadow-sm p-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search Nama */}
          <div className="space-y-2">
            <Label>Cari Nama</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Cari nama pelari..."
                value={searchNama}
                onChange={(e) => setSearchNama(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {/* Filter Kotama */}
          {isSuperAdmin && (
            <div className="space-y-2">
              <Label>Kotama</Label>
              <Popover open={openKesatuan} onOpenChange={setOpenKesatuan}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openKesatuan}
                    className="w-full justify-between font-normal"
                  >
                    {masterKesatuan.find(k => k.kd_ktm === filterKesatuan)?.ur_ktm || "Semua Kotama"}
                    <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-0">
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

          {/* Filter Kesatuan */}
          {(isSuperAdmin || isAdminKotama) && (
            <div className="space-y-2">
              <Label>Kesatuan</Label>
              <Popover open={openSubdis} onOpenChange={setOpenSubdis}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openSubdis}
                    className="w-full justify-between font-normal"
                    disabled={!filterKesatuan}
                  >
                    {masterSubdis.find(s => s.kd_smkl === filterSubdis)?.ur_smkl || "Semua Kesatuan"}
                    <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-0">
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

          {/* Filter Status */}
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="Tercapai">Tercapai</SelectItem>
                <SelectItem value="Dalam Proses">Dalam Proses</SelectItem>
                <SelectItem value="Belum Mulai">Belum Mulai</SelectItem>
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
                <th>Total Sesi</th>
                <th>Total Jarak</th>
                <th>Status Target</th>
                <th>Bergabung</th>
                <th className="text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={10} className="text-center py-8 text-muted-foreground">
                    Memuat data...
                  </td>
                </tr>
              ) : paginatedData.length > 0 ? (
                paginatedData.map((pelari) => (
                  <tr key={pelari.id}>
                    <td className="font-medium text-sm text-foreground">{pelari.pangkat}</td>
                    <td className="font-medium text-foreground">{pelari.nama}</td>
                    <td className="text-muted-foreground">{pelari.corps || "-"}</td>
                    <td className="text-muted-foreground">{pelari.kesatuan || "-"}</td>
                    <td className="text-muted-foreground">{pelari.subdis || "-"}</td>
                    <td className="text-foreground">{pelari.totalSesi} sesi</td>
                    <td className="font-semibold text-primary">{(pelari.totalJarak || 0).toFixed(2)} km</td>
                    <td>
                      {pelari.statusTarget === 'Tercapai' ? (
                        <span className="badge-success">
                          <CheckCircle2 className="mr-1 h-3 w-3" />
                          Tercapai
                        </span>
                      ) : pelari.statusTarget === 'Dalam Proses' ? (
                        <span className="badge-warning">
                          <Clock className="mr-1 h-3 w-3" />
                          Dalam Proses
                        </span>
                      ) : (
                        <span className="badge-pending">
                          <AlertCircle className="mr-1 h-3 w-3" />
                          Belum Mulai
                        </span>
                      )}
                    </td>
                    <td className="text-muted-foreground">{pelari.bergabung}</td>
                    <td className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" asChild>
                          <Link to={`/pelari/${pelari.id}`}>
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">Detail</span>
                          </Link>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={10} className="text-center py-8 text-muted-foreground">
                    Tidak ada data pelari yang ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-5 py-4 border-t border-border flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Menampilkan {startIndex + 1}-{Math.min(endIndex, filteredData.length)} dari {filteredData.length} pelari
          </p>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            >
              ‹
            </Button>
            {getPageNumbers().map((page, idx) => (
              typeof page === 'number' ? (
                <Button
                  key={idx}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </Button>
              ) : (
                <span key={idx} className="h-8 w-8 flex items-center justify-center text-muted-foreground">...</span>
              )
            ))}
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === totalPages || totalPages === 0}
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            >
              ›
            </Button>
          </div>
        </div>
      </div>

    </div>
  );
};

export default DataPelari;