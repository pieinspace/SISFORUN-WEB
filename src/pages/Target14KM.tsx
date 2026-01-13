import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Filter,
  Download,
  Eye,
  CheckCircle2,
  Clock,
  FileSpreadsheet,
  FileText,
  Trophy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MOCK_RUNNERS } from "@/lib/mockRunners";

interface TargetRunner {
  id: string;
  name: string;
  rank: string;
  distance: number;
  time: string;
  pace: string;
  achievedDate: string;
  validationStatus: "validated" | "pending";
}

const mockTargetRunners: TargetRunner[] = MOCK_RUNNERS.filter(
  (r) => r.distance && r.achievedDate
).map((r) => ({
  id: r.id,
  name: r.name,
  rank: r.rank,
  distance: r.distance || 0,
  time: r.time || "0:00:00",
  pace: r.pace || "0:00/km",
  achievedDate: r.achievedDate || "",
  validationStatus: (r.validationStatus as "validated" | "pending") || "pending",
}));

const Target14KM = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");

  const filteredRunners = mockTargetRunners.filter((runner) => {
    const matchesSearch =
      runner.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      runner.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || runner.validationStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const validatedCount = mockTargetRunners.filter(
    (r) => r.validationStatus === "validated"
  ).length;
  const pendingCount = mockTargetRunners.filter(
    (r) => r.validationStatus === "pending"
  ).length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="page-header">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <Trophy className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="page-title">Target 14 KM</h1>
            <p className="page-description">
              Daftar pelari yang telah mencapai target 14 KM
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
            {mockTargetRunners.length}
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

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari nama atau ID pelari..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-3">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Status Validasi" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="validated">Tervalidasi</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Periode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Waktu</SelectItem>
              <SelectItem value="today">Hari Ini</SelectItem>
              <SelectItem value="week">Minggu Ini</SelectItem>
              <SelectItem value="month">Bulan Ini</SelectItem>
            </SelectContent>
          </Select>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>
                <FileText className="mr-2 h-4 w-4" />
                Export PDF
              </DropdownMenuItem>
              <DropdownMenuItem>
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Export Excel
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Pangkat</th>
                <th>Nama Pelari</th>
                <th>Jarak Tempuh</th>
                <th>Waktu Tempuh</th>
                <th>Pace Rata-rata</th>
                <th>Tanggal Pencapaian</th>
                <th>Status Validasi</th>
                <th className="text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredRunners.map((runner) => (
                <tr key={runner.id}>
                  <td className="font-medium text-sm">{runner.rank}</td>
                  <td className="font-medium">{runner.name}</td>
                  <td className="font-semibold text-primary">
                    {runner.distance.toFixed(2)} km
                  </td>
                  <td>{runner.time}</td>
                  <td>{runner.pace}</td>
                  <td className="text-muted-foreground">{runner.achievedDate}</td>
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
                    <Link to={`/pelari/${runner.id}`}>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Target14KM;
