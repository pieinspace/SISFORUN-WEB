import { Save, Plus, Trash2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Admin {
  id: number;
  username: string;
  password?: string;
  role: string;
}

const DEFAULT_ADMINS: Admin[] = [
  { id: 1, username: "admin", password: "admin123", role: "Super Admin" },
  { id: 2, username: "operator1", password: "operator123", role: "Admin" },
];

const Pengaturan = () => {
  const [admins, setAdmins] = useState<Admin[]>(() => {
    const saved = localStorage.getItem("sisforun_admins");
    if (saved) {
      const parsed = JSON.parse(saved);
      // Migration: Convert "Operator" role to "Admin" AND "email" to "username"
      return parsed.map((a: any) => {
        let admin = { ...a };
        // Role migration
        if (admin.role === "Operator") admin.role = "Admin";
        // Email to username migration (fallback)
        if (admin.email && !admin.username) {
          admin.username = admin.email.split('@')[0];
          delete admin.email;
        }
        // Ensure password exists (default if missing)
        if (!admin.password) {
          admin.password = "123456";
        }
        // Remove name if exists
        delete admin.name;
        return admin;
      });
    }
    return DEFAULT_ADMINS;
  });

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newAdmin, setNewAdmin] = useState({
    username: "",
    password: "",
    role: "Admin",
  });

  useEffect(() => {
    localStorage.setItem("sisforun_admins", JSON.stringify(admins));
  }, [admins]);

  const handleAddAdmin = () => {
    if (!newAdmin.username || !newAdmin.password) return;

    const admin: Admin = {
      id: Date.now(),
      username: newAdmin.username,
      password: newAdmin.password,
      role: newAdmin.role,
    };

    setAdmins([...admins, admin]);
    setNewAdmin({ username: "", password: "", role: "Admin" });
    setIsAddDialogOpen(false);
  };

  const handleDeleteAdmin = (id: number) => {
    setAdmins(admins.filter((admin) => admin.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="page-header">
        <h1 className="page-title">Pengaturan Akun</h1>
        <p className="page-description">
          Kelola konfigurasi akun admin
        </p>
      </div>

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
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Tambah Admin
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Tambah Admin Baru</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={newAdmin.username}
                    onChange={(e) => setNewAdmin({ ...newAdmin, username: e.target.value })}
                    placeholder="username"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={newAdmin.password}
                    onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                    placeholder="••••••••"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="role">Role</Label>
                  <Select
                    value={newAdmin.role}
                    onValueChange={(value) => setNewAdmin({ ...newAdmin, role: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Super Admin">Super Admin</SelectItem>
                      <SelectItem value="Admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Batal</Button>
                <Button onClick={handleAddAdmin}>Simpan</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        <div className="space-y-3">
          {admins.map((admin) => (
            <div
              key={admin.id}
              className="flex items-center justify-between p-4 rounded-lg bg-muted/50"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-medium">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium">@{admin.username}</p>
                  <p className="text-xs text-muted-foreground">Password: {admin.password}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">{admin.role}</span>
                {admin.role !== "Super Admin" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleDeleteAdmin(admin.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Pengaturan;
