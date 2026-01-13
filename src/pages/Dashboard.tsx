import { Users, Target, Activity } from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";
import RecentRunnersTable from "@/components/dashboard/RecentRunnersTable";
import TargetChart from "@/components/dashboard/TargetChart";
import { MOCK_RUNNERS } from "@/lib/mockRunners";

const mockRunners = MOCK_RUNNERS;

const Dashboard = () => {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-description">
          Ringkasan aktivitas dan pencapaian pelari
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Total Pelari"
          value="8"
          subtitle="Terdaftar di sistem"
          icon={Users}
          trend={{ value: 0, isPositive: true }}
        />
        <StatCard
          title="Target Tercapai"
          value="4"
          subtitle="Mencapai 14 KM (Minggu 1-4)"
          icon={Target}
          trend={{ value: 50, isPositive: true }}
          variant="primary"
        />
        <StatCard
          title="Pelari Aktif"
          value="8"
          subtitle="Aktif minggu ini"
          icon={Activity}
          trend={{ value: 100, isPositive: true }}
        />
      </div>

      {/* Charts */}
      <div className="grid gap-6">
        <TargetChart />
      </div>

      {/* Recent Runners Table */}
      <RecentRunnersTable runners={mockRunners} />
    </div>
  );
};

export default Dashboard;
