import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Save, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

interface Admin {
  id: number;
  username: string;
  name: string;
  password?: string;
  role: string;
  is_active?: boolean;
}

const DEFAULT_ADMINS: Admin[] = [
  { id: 1, username: "admin", name: "Super Admin", password: "admin123", role: "Super Admin" },
  { id: 2, username: "operator1", name: "Operator 1", password: "operator123", role: "Admin" },
];

const API_BASE_URL = "http://localhost:4001/api";

const Pengaturan = () => {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchAdmins = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/admins`);
      const data = await response.json();
      if (data.success) {
        setAdmins(data.admins);
      }
    } catch (error) {
      console.error("Failed to fetch admins:", error);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newAdmin, setNewAdmin] = useState({
    username: "",
    password: "",
    role: "Admin",
  });

  const handleAddAdmin = async () => {
    if (!newAdmin.username || !newAdmin.password) return;

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/admins`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: newAdmin.username,
          password: newAdmin.password,
          role: newAdmin.role === "Super Admin" ? "superadmin" : "admin",
          name: newAdmin.username
        }),
      });

      const data = await response.json();
      if (data.success) {
        await fetchAdmins();
        setNewAdmin({ username: "", password: "", role: "Admin" });
        setIsAddDialogOpen(false);
      } else {
        alert(data.message || "Gagal menambah admin");
      }
    } catch (error) {
      console.error("Add admin error:", error);
      alert("Terjadi kesalahan koneksi");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAdmin = async (id: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus admin ini?")) return;

    try {
      const response = await fetch(`${API_BASE_URL}/auth/admins/${id}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (data.success) {
        await fetchAdmins();
      } else {
        alert(data.message || "Gagal menghapus admin");
      }
    } catch (error) {
      console.error("Delete admin error:", error);
      alert("Terjadi kesalahan koneksi");
    }
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
                <Button onClick={handleAddAdmin} disabled={isLoading}>
                  {isLoading ? "Menyimpan..." : "Simpan"}
                </Button>
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
                  {admin.username.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium">{admin.name || admin.username}</p>
                  <p className="text-xs text-muted-foreground">@{admin.username}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground capitalize">{admin.role}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  onClick={() => handleDeleteAdmin(admin.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Pengaturan;
