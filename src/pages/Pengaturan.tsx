import { useState } from "react";
import { Save, User, Shield, Bell, Link2, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const admins = [
  { id: 1, name: "Admin SISFORUN", email: "admin@sisforun.id", role: "Super Admin" },
  { id: 2, name: "Operator 1", email: "operator1@sisforun.id", role: "Operator" },
];

const Pengaturan = () => {
  const [autoLogout, setAutoLogout] = useState("15");
  const [syncNotification, setSyncNotification] = useState(true);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="page-header">
        <h1 className="page-title">Pengaturan</h1>
        <p className="page-description">
          Kelola konfigurasi sistem dan akun admin
        </p>
      </div>

      <Tabs defaultValue="account" className="space-y-6">
        <TabsList className="bg-muted p-1">
          <TabsTrigger value="account" className="gap-2">
            <User className="h-4 w-4" />
            Akun Admin
          </TabsTrigger>
          <TabsTrigger value="system" className="gap-2">
            <Shield className="h-4 w-4" />
            Sistem
          </TabsTrigger>
          <TabsTrigger value="integration" className="gap-2">
            <Link2 className="h-4 w-4" />
            Integrasi
          </TabsTrigger>
        </TabsList>

        {/* Account Settings */}
        <TabsContent value="account" className="space-y-6">
          {/* Change Password */}
          <div className="bg-card rounded-xl border border-border shadow-sm p-6">
            <h3 className="font-semibold text-foreground mb-4">Ubah Password</h3>
            <div className="grid gap-4 max-w-md">
              <div className="space-y-2">
                <Label htmlFor="current-password">Password Saat Ini</Label>
                <Input id="current-password" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">Password Baru</Label>
                <Input id="new-password" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Konfirmasi Password</Label>
                <Input id="confirm-password" type="password" />
              </div>
              <Button className="w-fit">
                <Save className="mr-2 h-4 w-4" />
                Simpan Password
              </Button>
            </div>
          </div>

          {/* Admin List */}
          <div className="bg-card rounded-xl border border-border shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground">Daftar Admin</h3>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Tambah Admin
              </Button>
            </div>
            <div className="space-y-3">
              {admins.map((admin) => (
                <div
                  key={admin.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-medium">
                      {admin.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium">{admin.name}</p>
                      <p className="text-sm text-muted-foreground">{admin.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">{admin.role}</span>
                    {admin.role !== "Super Admin" && (
                      <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* System Settings */}
        <TabsContent value="system" className="space-y-6">
          <div className="bg-card rounded-xl border border-border shadow-sm p-6">
            <h3 className="font-semibold text-foreground mb-4">Pengaturan Keamanan</h3>
            <div className="space-y-6 max-w-md">
              <div className="space-y-2">
                <Label>Waktu Auto Logout</Label>
                <Select value={autoLogout} onValueChange={setAutoLogout}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 menit</SelectItem>
                    <SelectItem value="15">15 menit</SelectItem>
                    <SelectItem value="30">30 menit</SelectItem>
                    <SelectItem value="60">60 menit</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  Sistem akan otomatis logout jika tidak ada aktivitas
                </p>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border shadow-sm p-6">
            <h3 className="font-semibold text-foreground mb-4">Notifikasi</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Notifikasi Sinkronisasi</Label>
                  <p className="text-sm text-muted-foreground">
                    Tampilkan notifikasi saat data berhasil disinkronkan
                  </p>
                </div>
                <Switch
                  checked={syncNotification}
                  onCheckedChange={setSyncNotification}
                />
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Integration Settings */}
        <TabsContent value="integration" className="space-y-6">
          <div className="bg-card rounded-xl border border-border shadow-sm p-6">
            <h3 className="font-semibold text-foreground mb-4">Konfigurasi API</h3>
            <div className="space-y-4 max-w-xl">
              <div className="space-y-2">
                <Label htmlFor="api-url">API Endpoint</Label>
                <Input
                  id="api-url"
                  placeholder="https://api.tracking-app.com/v1"
                  defaultValue="https://api.sisforun.id/v1"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="api-key">API Key</Label>
                <Input
                  id="api-key"
                  type="password"
                  placeholder="Masukkan API Key"
                />
              </div>
              <div className="flex items-center gap-3 pt-2">
                <Button>
                  <Save className="mr-2 h-4 w-4" />
                  Simpan Konfigurasi
                </Button>
                <Button variant="outline">Test Koneksi</Button>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border shadow-sm p-6">
            <h3 className="font-semibold text-foreground mb-4">Status Integrasi</h3>
            <div className="flex items-center gap-3 p-4 rounded-lg bg-success/10 border border-success/20">
              <div className="h-3 w-3 rounded-full bg-success animate-pulse" />
              <div>
                <p className="font-medium text-success">Terhubung</p>
                <p className="text-sm text-muted-foreground">
                  Terakhir sinkronisasi: 09 Jan 2026, 14:32:18
                </p>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Pengaturan;
