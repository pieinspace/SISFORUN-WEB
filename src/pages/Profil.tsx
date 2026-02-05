import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, MapPin, Phone } from "lucide-react";
import { useEffect, useState } from "react";

const API_BASE = (import.meta as any).env?.VITE_API_BASE_URL?.toString?.() || "http://localhost:4001";

const Profil = () => {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [stats, setStats] = useState({
    totalRunners: 0,
    totalReports: 0,
    dataCompleteness: 0
  });

  const [profile, setProfile] = useState({
    name: "Admin FORZA",
    phone: "+62 812-3456-7890",
    location: "Jakarta, Indonesia",
    joinDate: "Januari 2024",
    avatar: ""
  });

  useEffect(() => {
    const userStr = localStorage.getItem("admin_user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setCurrentUser(user);
        setProfile(prev => ({
          ...prev,
          name: user.name || prev.name,
        }));
      } catch (e) {
        console.error("Failed to parse admin_user", e);
      }
    }
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("admin_token");
        const res = await fetch(`${API_BASE}/api/stats/summary`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const json = await res.json();
        if (json.success) {
          setStats(json.data);
        }
      } catch (e) {
        console.error("Failed to fetch statistics", e);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="page-header">
        <h1 className="page-title">Profil Admin</h1>
        <p className="page-description">
          Informasi profil dan cakupan manajemen Anda
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile Card */}
        <Card className="lg:col-span-1 border-none shadow-md bg-white">
          <CardHeader className="text-center">
            <div className="relative mx-auto mb-4">
              <Avatar className="h-24 w-24 mx-auto border-4 border-primary/10">
                <AvatarImage src={profile.avatar} alt={profile.name} />
                <AvatarFallback className="text-2xl bg-primary/5 text-primary">
                  {profile.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
            </div>
            <CardTitle className="text-xl font-bold">{profile.name}</CardTitle>
            <p className="text-xs font-semibold py-1 px-3 bg-primary/10 text-primary rounded-full inline-block mt-2 uppercase tracking-wide">
              {currentUser?.role?.replace('_', ' ') || "Administrator"}
            </p>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <div className="flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                <Calendar className="h-4 w-4" />
              </div>
              <span>Bergabung sejak {profile.joinDate}</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                <Phone className="h-4 w-4" />
              </div>
              <span>{profile.phone}</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                <MapPin className="h-4 w-4" />
              </div>
              <span>{profile.location}</span>
            </div>
          </CardContent>
        </Card>

        {/* Profile Form */}
        <Card className="lg:col-span-2 border-none shadow-md bg-white">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-bold">Informasi Profil</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 pt-2">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-xs font-bold text-muted-foreground uppercase">Nama Lengkap</Label>
                <Input
                  id="name"
                  value={profile.name}
                  disabled
                  className="bg-muted/30 focus-visible:ring-primary h-10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-xs font-bold text-muted-foreground uppercase">Nomor Telepon</Label>
                <Input
                  id="phone"
                  value={profile.phone}
                  disabled
                  className="bg-muted/30 focus-visible:ring-primary h-10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location" className="text-xs font-bold text-muted-foreground uppercase">Lokasi</Label>
                <Input
                  id="location"
                  value={profile.location}
                  disabled
                  className="bg-muted/30 focus-visible:ring-primary h-10"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity Summary */}
      <Card className="border-none shadow-md bg-white">
        <CardHeader>
          <CardTitle className="text-lg font-bold">Ringkasan Aktivitas</CardTitle>
        </CardHeader>
        <CardContent className="pt-2 pb-8">
          <div className="grid gap-6 md:grid-cols-3">
            <div className="text-center p-6 rounded-2xl bg-primary/[0.03] border border-primary/5 hover:bg-primary/[0.05] transition-all group">
              <div className="text-3xl font-black text-primary mb-1 group-hover:scale-110 transition-transform">{stats.totalRunners}</div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Pelari Dikelola</p>
            </div>
            <div className="text-center p-6 rounded-2xl bg-primary/[0.03] border border-primary/5 hover:bg-primary/[0.05] transition-all group">
              <div className="text-3xl font-black text-primary mb-1 group-hover:scale-110 transition-transform">{stats.totalReports}</div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Laporan Dibuat</p>
            </div>
            <div className="text-center p-6 rounded-2xl bg-primary/[0.03] border border-primary/5 hover:bg-primary/[0.05] transition-all group">
              <div className="text-3xl font-black text-primary mb-1 group-hover:scale-110 transition-transform">{stats.dataCompleteness}%</div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Tingkat Kelengkapan Data</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profil;