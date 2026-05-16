import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

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
import { useEffect, useState, useCallback } from 'react';
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useQuery, keepPreviousData } from "@tanstack/react-query";

const API_BASE =
  (import.meta as any).env?.VITE_API_BASE_URL?.toString?.() ||
  "http://localhost:4001";

// --- Helper: authenticated fetch with auto-redirect on 401/403 ---
const authFetch = async (url: string) => {
  const token = localStorage.getItem("admin_token");
  const res = await fetch(url, {
    headers: { "Authorization": `Bearer ${token}` },
  });

  if (res.status === 401 || res.status === 403) {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_user");
    window.location.href = "/login";
    throw new Error("Unauthorized");
  }

  return res.json();
};

// --- Types ---
interface ApiRunner {
  id: string;
  name: string;
  rank: string | null;
  createdAt?: string;
  kd_ktm?: string;
  kd_smkl?: string;
  kd_corps?: string;
  kd_pkt?: string;
  pangkat_name?: string;
  kesatuan_name?: string;
  subdis_name?: string;
  corps_name?: string;
  totalDistance?: number;
  totalSessions?: number;
  statusTarget?: string;
}

interface Pelari {
  id: string;
  pangkat: string;
  nama: string;
  kesatuan: string;
  subdis: string;
  corps: string;
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

const DataPelari = () => {
  // --- Filter states ---
  const [searchNama, setSearchNama] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filterKesatuan, setFilterKesatuan] = useState('');
  const [filterSubdis, setFilterSubdis] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [openKesatuan, setOpenKesatuan] = useState(false);
  const [openSubdis, setOpenSubdis] = useState(false);

  // --- Pagination state ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // --- User Role & Scope ---
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

  // --- Debounce search input (300ms) to avoid excessive API calls ---
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchNama);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchNama]);

  // Reset page when filters change
  const handleFilterChange = useCallback((setter: (val: string) => void, value: string) => {
    setter(value);
    setCurrentPage(1);
  }, []);

  // ==================== REACT QUERY: Master Data ====================
  const { data: masterKesatuan = [] } = useQuery({
    queryKey: ['master', 'kesatuan'],
    queryFn: async () => {
      const json = await authFetch(`${API_BASE}/api/master/kesatuan`);
      return json.success ? json.data : [];
    },
    staleTime: 5 * 60 * 1000, // Cache master data for 5 minutes
  });

  const { data: masterSubdis = [] } = useQuery({
    queryKey: ['master', 'subdis', filterKesatuan],
    queryFn: async () => {
      if (!filterKesatuan) return [];
      const json = await authFetch(`${API_BASE}/api/master/subdis/${filterKesatuan}`);
      return json.success ? json.data : [];
    },
    staleTime: 5 * 60 * 1000,
    enabled: !!filterKesatuan,
  });

  // Reset subdis filter when kesatuan changes
  useEffect(() => {
    if (!filterKesatuan) {
      setFilterSubdis("");
    }
  }, [filterKesatuan]);

  // ==================== REACT QUERY: Runners (Server-Side Paginated) ====================
  const buildRunnersUrl = () => {
    const params = new URLSearchParams();
    params.set("page", String(currentPage));
    params.set("limit", String(itemsPerPage));
    if (debouncedSearch) params.set("search", debouncedSearch);
    if (filterKesatuan) params.set("kd_ktm", filterKesatuan);
    if (filterSubdis) params.set("kd_smkl", filterSubdis);
    if (filterStatus && filterStatus !== "all") params.set("status", filterStatus);
    return `${API_BASE}/api/runners?${params.toString()}`;
  };

  const {
    data: runnersResponse,
    isLoading: loading,
    isError,
  } = useQuery({
    queryKey: ['runners', currentPage, debouncedSearch, filterKesatuan, filterSubdis, filterStatus],
    queryFn: async () => {
      const json = await authFetch(buildRunnersUrl());
      return json;
    },
    placeholderData: keepPreviousData, // Show previous data while fetching new page
  });

  // Show error toast
  useEffect(() => {
    if (isError) {
      toast.error("Gagal mengambil data personel. Silakan cek koneksi atau login ulang.");
    }
  }, [isError]);

  // --- Transform API response to display data ---
  const runners: ApiRunner[] = runnersResponse?.data ?? [];
  const meta = runnersResponse?.meta ?? { total: 0, page: 1, totalPages: 0, limit: itemsPerPage };

  const paginatedData: Pelari[] = runners.map((r: ApiRunner) => {
    const rank = r.pangkat_name || r.rank || "-";
    const kesatuanLabel = r.kesatuan_name || "-";

    // Hide corps for ASN (21-45) and Generals (91-94)
    const pk = parseInt(r.kd_pkt || "0");
    const isAsnOrGeneral = (pk >= 21 && pk <= 45) || (pk >= 91 && pk <= 94);
    const corpsLabel = isAsnOrGeneral ? "-" : (r.corps_name || "-");

    return {
      id: r.id,
      pangkat: rank,
      nama: r.name,
      kesatuan: kesatuanLabel,
      subdis: r.subdis_name || "-",
      corps: corpsLabel,
      totalSesi: Number(r.totalSessions ?? 0),
      totalJarak: Number(r.totalDistance ?? 0),
      statusTarget: r.statusTarget || "Belum Mulai",
      bergabung: formatDateID(r.createdAt ?? ""),
      kd_ktm: r.kd_ktm,
      kd_smkl: r.kd_smkl,
      kd_corps: r.kd_corps,
      kd_pkt: r.kd_pkt,
    };
  });

  // --- Pagination from server meta ---
  const totalPages = meta.totalPages;
  const startIndex = (meta.page - 1) * meta.limit;
  const endIndex = Math.min(startIndex + meta.limit, meta.total);

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
        <h1 className="page-title">Data Personel</h1>
        <p className="page-description">Kelola dan pantau seluruh data personel terdaftar</p>
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
                placeholder="Cari nama personel..."
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
                    {masterKesatuan.find((k: any) => k.kd_ktm === filterKesatuan)?.ur_ktm || "Semua Kotama"}
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
                            handleFilterChange(setFilterKesatuan, "");
                            setOpenKesatuan(false);
                          }}
                        >
                          Semua Kotama
                        </CommandItem>
                        {masterKesatuan.map((k: any) => (
                          <CommandItem
                            key={k.kd_ktm}
                            value={k.ur_ktm}
                            onSelect={() => {
                              handleFilterChange(setFilterKesatuan, k.kd_ktm === filterKesatuan ? "" : k.kd_ktm);
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
                    {masterSubdis.find((s: any) => s.kd_smkl === filterSubdis)?.ur_smkl || "Semua Kesatuan"}
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
                            handleFilterChange(setFilterSubdis, "");
                            setOpenSubdis(false);
                          }}
                        >
                          Semua Kesatuan
                        </CommandItem>
                        {masterSubdis.map((s: any) => (
                          <CommandItem
                            key={s.kd_smkl}
                            value={s.ur_smkl}
                            onSelect={() => {
                              handleFilterChange(setFilterSubdis, s.kd_smkl === filterSubdis ? "" : s.kd_smkl);
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
            <Select value={filterStatus} onValueChange={(val) => handleFilterChange(setFilterStatus, val)}>
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
                    Tidak ada data personel yang ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-5 py-4 border-t border-border flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Menampilkan {meta.total > 0 ? startIndex + 1 : 0}-{endIndex} dari {meta.total} personel
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