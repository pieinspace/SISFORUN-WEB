import { useState } from "react";
import { Download, FileText, FileSpreadsheet, Calendar, BarChart3, Users, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const reportTypes = [
  {
    id: "active",
    title: "Laporan Pelari Aktif",
    description: "Data pelari yang aktif berdasarkan periode tertentu",
    icon: Users,
  },
  {
    id: "target",
    title: "Laporan Pencapaian Target",
    description: "Statistik pencapaian target seluruh pelari",
    icon: Target,
  },
  {
    id: "14km",
    title: "Laporan Khusus Target 14 KM",
    description: "Detail lengkap pelari yang mencapai target 14 KM",
    icon: BarChart3,
  },
];

const Laporan = () => {
  const [period, setPeriod] = useState("weekly");
  const [selectedReport, setSelectedReport] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="page-header">
        <h1 className="page-title">Laporan</h1>
        <p className="page-description">
          Generate dan unduh laporan untuk monitoring dan evaluasi
        </p>
      </div>

      {/* Period Selector */}
      <div className="flex items-center gap-4">
        <Calendar className="h-5 w-5 text-muted-foreground" />
        <span className="text-sm font-medium">Periode Laporan:</span>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="daily">Harian</SelectItem>
            <SelectItem value="weekly">Mingguan</SelectItem>
            <SelectItem value="monthly">Bulanan</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Report Types */}
      <div className="grid gap-4 md:grid-cols-3">
        {reportTypes.map((report) => {
          const Icon = report.icon;
          const isSelected = selectedReport === report.id;
          return (
            <Card
              key={report.id}
              className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                isSelected ? "ring-2 ring-primary" : ""
              }`}
              onClick={() => setSelectedReport(report.id)}
            >
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                      isSelected
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{report.title}</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>{report.description}</CardDescription>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Report Preview & Download */}
      {selectedReport && (
        <div className="bg-card rounded-xl border border-border shadow-sm animate-slide-up">
          <div className="p-5 border-b border-border">
            <h3 className="font-semibold text-foreground">
              Preview Laporan:{" "}
              {reportTypes.find((r) => r.id === selectedReport)?.title}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Periode: {period === "daily" ? "Harian" : period === "weekly" ? "Mingguan" : "Bulanan"}
            </p>
          </div>

          {/* Preview Content */}
          <div className="p-5">
            <div className="grid gap-4 sm:grid-cols-4 mb-6">
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <p className="text-2xl font-bold text-foreground">1,248</p>
                <p className="text-sm text-muted-foreground">Total Pelari</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <p className="text-2xl font-bold text-success">347</p>
                <p className="text-sm text-muted-foreground">Target Tercapai</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <p className="text-2xl font-bold text-accent">27.8%</p>
                <p className="text-sm text-muted-foreground">Persentase</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <p className="text-2xl font-bold text-foreground">15,842</p>
                <p className="text-sm text-muted-foreground">Total KM</p>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" className="gap-2">
                <FileText className="h-4 w-4" />
                Download PDF
              </Button>
              <Button variant="default" className="gap-2">
                <FileSpreadsheet className="h-4 w-4" />
                Download Excel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Laporan;
