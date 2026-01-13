import { CheckCircle2, Clock, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface Runner {
  id: string | number;
  name: string;
  rank?: string;
  distanceKm?: number;
  distance?: number;
  pace?: string;
  date?: string;
  status?: string;
  targetStatus?: string;
  validationStatus?: string;
  targetKm?: number;
}

interface RecentRunnersTableProps {
  runners: Runner[];
}

const RecentRunnersTable = ({ runners }: RecentRunnersTableProps) => {
  return (
    <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden animate-slide-up">
      <div className="px-5 py-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-foreground">Target 14 KM Tercapai</h3>
            <p className="text-sm text-muted-foreground mt-0.5">
              Pelari yang baru mencapai target
            </p>
          </div>
          <Link to="/target">
            <Button variant="ghost" size="sm">
              Lihat Semua
            </Button>
          </Link>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              <th>Pangkat</th>
              <th>Nama</th>
              <th>Jarak (km)</th>
              <th>Target (km)</th>
              <th>Status</th>
              <th className="text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {runners.map((runner) => (
              <tr key={runner.id}>
                <td className="font-medium text-sm">{runner.rank || '-'}</td>
                <td className="font-medium">{runner.name}</td>
                <td>{typeof runner.distanceKm === 'number' ? runner.distanceKm.toFixed(1) : runner.distance?.toFixed(2)} km</td>
                <td>{runner.targetKm || 14.0} km</td>
                <td>
                  {runner.status === "validated" || runner.status === "Completed" || runner.targetStatus === "achieved" ? (
                    <span className="badge-success">
                      <CheckCircle2 className="mr-1 h-3 w-3" />
                      Selesai
                    </span>
                  ) : runner.status === "pending" || runner.validationStatus === "pending" ? (
                    <span className="badge-pending">
                      <Clock className="mr-1 h-3 w-3" />
                      Pending
                    </span>
                  ) : (
                    <span className="badge-warning">
                      <Clock className="mr-1 h-3 w-3" />
                      Berlangsung
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
  );
};

export default RecentRunnersTable;
