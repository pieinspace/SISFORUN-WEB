import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Filter,
  Download,
  Eye,
  ChevronLeft,
  ChevronRight,
  Target,
  Clock,
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
import { MOCK_RUNNERS } from "@/lib/mockRunners";

interface Runner {
  id: string;
  name: string;
  rank: string;
  email: string;
  totalSessions: number;
  totalDistance: number;
  targetStatus: "achieved" | "in_progress" | "not_started";
  joinDate: string;
}

const mockRunners: Runner[] = MOCK_RUNNERS;

const getStatusBadge = (status: Runner["targetStatus"]) => {
  switch (status) {
    case "achieved":
      return (
        <span className="badge-success">
          <Target className="mr-1 h-3 w-3" />
          Tercapai
        </span>
      );
    case "in_progress":
      return (
        <span className="badge-warning">
          <Clock className="mr-1 h-3 w-3" />
          Dalam Proses
        </span>
      );
    case "not_started":
      return (
        <span className="badge-pending">
          Belum Mulai
        </span>
      );
  }
};

const DataPelari = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredRunners = mockRunners.filter((runner) => {
    const matchesSearch =
      runner.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      runner.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      runner.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || runner.targetStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="page-header">
        <h1 className="page-title">Data Pelari</h1>
        <p className="page-description">
          Kelola dan pantau seluruh data pelari terdaftar
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari nama, ID, atau email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-3">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Status Target" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="achieved">Tercapai</SelectItem>
              <SelectItem value="in_progress">Dalam Proses</SelectItem>
              <SelectItem value="not_started">Belum Mulai</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
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
                <th>Email</th>
                <th>Total Sesi</th>
                <th>Total Jarak</th>
                <th>Status Target</th>
                <th>Bergabung</th>
                <th className="text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredRunners.map((runner) => (
                <tr key={runner.id}>
                  <td className="font-medium text-sm">{runner.rank}</td>
                  <td className="font-medium">{runner.name}</td>
                  <td className="text-muted-foreground">{runner.email}</td>
                  <td>{runner.totalSessions}</td>
                  <td>{runner.totalDistance.toFixed(1)} km</td>
                  <td>{getStatusBadge(runner.targetStatus)}</td>
                  <td className="text-muted-foreground">{runner.joinDate}</td>
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

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-border">
          <p className="text-sm text-muted-foreground">
            Menampilkan {filteredRunners.length} dari {mockRunners.length} pelari
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" className="min-w-[40px]">
              1
            </Button>
            <Button variant="ghost" size="sm" className="min-w-[40px]">
              2
            </Button>
            <Button variant="ghost" size="sm" className="min-w-[40px]">
              3
            </Button>
            <Button variant="outline" size="sm">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataPelari;
