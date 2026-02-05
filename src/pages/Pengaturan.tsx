import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
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
import { cn } from "@/lib/utils";
import { CheckCircle2, ChevronDown, Plus, Save, Search, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

interface Admin {
  id: number;
  username: string;
  name: string;
  password?: string;
  role: string;
  is_active?: boolean;
  kd_ktm?: string;
  kd_smkl?: string;
}

interface MasterKotama {
  kd_ktm: string;
  ur_ktm: string;
}

interface MasterKesatuan {
  kd_ktm: string;
  kd_smkl: string;
  ur_smkl: string;
}

const DEFAULT_ADMINS: Admin[] = [
  { id: 1, username: "admin", name: "Super Admin", password: "admin123", role: "Super Admin" },
  { id: 2, username: "operator1", name: "Operator 1", password: "operator123", role: "Admin" },
];

const API_BASE_URL = "http://localhost:4001/api";

const Pengaturan = () => {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  useEffect(() => {
    const userStr = localStorage.getItem("admin_user");
    if (userStr) {
      try {
        setCurrentUser(JSON.parse(userStr));
      } catch (e) {
        console.error("Failed to parse admin_user", e);
      }
    }
  }, []);

  const isSuperAdmin = currentUser?.role === 'superadmin';

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
    role: "Admin Kotama",
    kd_ktm: "",
    kd_smkl: "",
  });

  const [masterKotama, setMasterKotama] = useState<MasterKotama[]>([]);
  const [masterKesatuan, setMasterKesatuan] = useState<MasterKesatuan[]>([]);
  const [masterKesatuanFilter, setMasterKesatuanFilter] = useState<MasterKesatuan[]>([]);

  // Filter States
  const [searchAdmin, setSearchAdmin] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterKotama, setFilterKotama] = useState("");
  const [filterSubdis, setFilterSubdis] = useState("");
  const [openKotamaFilter, setOpenKotamaFilter] = useState(false);
  const [openSubdisFilter, setOpenSubdisFilter] = useState(false);

  // Fetch Master Data
  useEffect(() => {
    const fetchMasters = async () => {
      try {
        const resKtm = await fetch(`${API_BASE_URL.replace('/auth', '')}/master/kesatuan`);
        const jsonKtm = await resKtm.json();
        if (jsonKtm.success) setMasterKotama(jsonKtm.data);
      } catch (e) { console.error(e); }
    };
    fetchMasters();
  }, []);

  // Fetch Subdis when kotama changes (Add/Edit)
  useEffect(() => {
    if (!newAdmin.kd_ktm) {
      setMasterKesatuan([]);
      return;
    }
    const fetchSubdis = async () => {
      try {
        const res = await fetch(`${API_BASE_URL.replace('/auth', '')}/master/subdis/${newAdmin.kd_ktm}`);
        const json = await res.json();
        if (json.success) setMasterKesatuan(json.data);
      } catch (e) { console.error(e); }
    };
    fetchSubdis();
  }, [newAdmin.kd_ktm]);

  // Fetch Subdis when kotama changes (Filter)
  useEffect(() => {
    if (!filterKotama) {
      setMasterKesatuanFilter([]);
      setFilterSubdis("");
      return;
    }
    const fetchSubdis = async () => {
      try {
        const res = await fetch(`${API_BASE_URL.replace('/auth', '')}/master/subdis/${filterKotama}`);
        const json = await res.json();
        if (json.success) setMasterKesatuanFilter(json.data);
      } catch (e) { console.error(e); }
    };
    fetchSubdis();
  }, [filterKotama]);

  const filteredAdmins = useMemo(() => {
    return admins.filter((admin) => {
      const matchSearch =
        admin.name?.toLowerCase().includes(searchAdmin.toLowerCase()) ||
        admin.username?.toLowerCase().includes(searchAdmin.toLowerCase());

      const matchRole =
        filterRole === "all" || admin.role === filterRole;

      const matchKotama = !filterKotama || admin.kd_ktm === filterKotama;
      const matchSubdis = !filterSubdis || admin.kd_smkl === filterSubdis;

      return matchSearch && matchRole && matchKotama && matchSubdis;
    });
  }, [admins, searchAdmin, filterRole, filterKotama, filterSubdis]);

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
          role: newAdmin.role === "Super Admin" ? "superadmin" :
            newAdmin.role === "Admin Kotama" ? "admin_kotama" : "admin_satuan",
          name: newAdmin.username,
          kd_ktm: newAdmin.kd_ktm,
          kd_smkl: newAdmin.kd_smkl
        }),
      });

      const data = await response.json();
      if (data.success) {
        await fetchAdmins();
        setNewAdmin({ username: "", password: "", role: "Admin Kotama", kd_ktm: "", kd_smkl: "" });
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

  const handleChangePassword = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword) {
      alert("Harap isi password saat ini dan password baru");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("Konfirmasi password baru tidak cocok");
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem("admin_token");
      const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        }),
      });

      const data = await response.json();
      if (data.success) {
        alert("Password berhasil diubah!");
        setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      } else {
        alert(data.message || "Gagal mengubah password");
      }
    } catch (error) {
      console.error("Change password error:", error);
      alert("Terjadi kesalahan koneksi");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="page-header">
        <h1 className="page-title">Pengaturan Akun</h1>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-sm p-6">
        <h3 className="font-semibold text-foreground mb-4">Ubah Password</h3>
        <div className="grid gap-4 max-w-md">
          <div className="space-y-2">
            <Label htmlFor="current-password">Password Saat Ini</Label>
            <Input
              id="current-password"
              type="password"
              value={passwordData.currentPassword}
              onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-password">Password Baru</Label>
            <Input
              id="new-password"
              type="password"
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Konfirmasi Password</Label>
            <Input
              id="confirm-password"
              type="password"
              value={passwordData.confirmPassword}
              onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
            />
          </div>
          <Button className="w-fit" onClick={handleChangePassword} disabled={isLoading}>
            <Save className="mr-2 h-4 w-4" />
            {isLoading ? "Menyimpan..." : "Simpan Password"}
          </Button>
        </div>
      </div>

      {/* Admin List */}
      {isSuperAdmin && (
        <div className="bg-card rounded-xl border border-border shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
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
                        <SelectItem value="Admin Kotama">Admin Kotama</SelectItem>
                        <SelectItem value="Admin Satuan">Admin Satuan</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {(newAdmin.role === "Admin Kotama" || newAdmin.role === "Admin Satuan") && (
                    <div className="grid gap-2">
                      <Label>Kotama</Label>
                      <Select
                        value={newAdmin.kd_ktm}
                        onValueChange={(val) => setNewAdmin({ ...newAdmin, kd_ktm: val, kd_smkl: "" })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih Kotama" />
                        </SelectTrigger>
                        <SelectContent>
                          {masterKotama.map((k) => (
                            <SelectItem key={k.kd_ktm} value={k.kd_ktm}>{k.ur_ktm}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {newAdmin.role === "Admin Satuan" && newAdmin.kd_ktm && (
                    <div className="grid gap-2">
                      <Label>Kesatuan</Label>
                      <Select
                        value={newAdmin.kd_smkl}
                        onValueChange={(val) => setNewAdmin({ ...newAdmin, kd_smkl: val })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih Kesatuan" />
                        </SelectTrigger>
                        <SelectContent>
                          {masterKesatuan.map((s) => (
                            <SelectItem key={s.kd_smkl} value={s.kd_smkl}>{s.ur_smkl}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
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

          {/* Filters Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 p-4 rounded-xl border border-border bg-background/30 shadow-inner">
            {/* Search Username/Name */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Cari Admin</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari nama atau username..."
                  value={searchAdmin}
                  onChange={(e) => setSearchAdmin(e.target.value)}
                  className="pl-9 h-9"
                />
              </div>
            </div>

            {/* Filter Role */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Role</Label>
              <Select value={filterRole} onValueChange={setFilterRole}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Semua Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Role</SelectItem>
                  <SelectItem value="superadmin">Super Admin</SelectItem>
                  <SelectItem value="admin_kotama">Admin Kotama</SelectItem>
                  <SelectItem value="admin_satuan">Admin Satuan</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Filter Kotama */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Kotama</Label>
              <Popover open={openKotamaFilter} onOpenChange={setOpenKotamaFilter}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    className="w-full justify-between font-normal h-9 bg-background/50"
                  >
                    {masterKotama.find(k => k.kd_ktm === filterKotama)?.ur_ktm || "Semua Kotama"}
                    <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Cari kotama..." />
                    <CommandList>
                      <CommandEmpty>Kotama tidak ditemukan.</CommandEmpty>
                      <CommandGroup>
                        <CommandItem
                          onSelect={() => {
                            setFilterKotama("");
                            setOpenKotamaFilter(false);
                          }}
                        >
                          <CheckCircle2 className={cn("mr-2 h-4 w-4", filterKotama === "" ? "opacity-100" : "opacity-0")} />
                          Semua Kotama
                        </CommandItem>
                        {masterKotama.map((k) => (
                          <CommandItem
                            key={k.kd_ktm}
                            value={k.ur_ktm}
                            onSelect={() => {
                              setFilterKotama(k.kd_ktm === filterKotama ? "" : k.kd_ktm);
                              setOpenKotamaFilter(false);
                            }}
                          >
                            <CheckCircle2 className={cn("mr-2 h-4 w-4", filterKotama === k.kd_ktm ? "opacity-100" : "opacity-0")} />
                            {k.ur_ktm}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* Filter Kesatuan */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Kesatuan</Label>
              <Popover open={openSubdisFilter} onOpenChange={setOpenSubdisFilter}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    disabled={!filterKotama}
                    className="w-full justify-between font-normal h-9 bg-background/50"
                  >
                    {masterKesatuanFilter.find(s => s.kd_smkl === filterSubdis)?.ur_smkl || "Semua Kesatuan"}
                    <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Cari kesatuan..." />
                    <CommandList>
                      <CommandEmpty>Kesatuan tidak ditemukan.</CommandEmpty>
                      <CommandGroup>
                        <CommandItem
                          onSelect={() => {
                            setFilterSubdis("");
                            setOpenSubdisFilter(false);
                          }}
                        >
                          <CheckCircle2 className={cn("mr-2 h-4 w-4", filterSubdis === "" ? "opacity-100" : "opacity-0")} />
                          Semua Kesatuan
                        </CommandItem>
                        {masterKesatuanFilter.map((s) => (
                          <CommandItem
                            key={s.kd_smkl}
                            value={s.ur_smkl}
                            onSelect={() => {
                              setFilterSubdis(s.kd_smkl === filterSubdis ? "" : s.kd_smkl);
                              setOpenSubdisFilter(false);
                            }}
                          >
                            <CheckCircle2 className={cn("mr-2 h-4 w-4", filterSubdis === s.kd_smkl ? "opacity-100" : "opacity-0")} />
                            {s.ur_smkl}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <div className="space-y-3">
            {filteredAdmins.length > 0 ? (
              filteredAdmins.map((admin) => (
                <div
                  key={admin.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-muted/50 transition-all hover:bg-muted/70"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 text-primary font-medium border border-primary/20">
                      {admin.username.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{admin.name || admin.username}</p>
                      <p className="text-xs text-muted-foreground font-mono">@{admin.username}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right flex flex-col items-end">
                      <span className={cn(
                        "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter",
                        admin.role === 'superadmin' ? "bg-primary/20 text-primary border border-primary/30" :
                          admin.role === 'admin_kotama' ? "bg-amber-500/20 text-amber-600 border border-amber-500/30" :
                            "bg-blue-500/20 text-blue-600 border border-blue-500/30"
                      )}>
                        {admin.role === 'superadmin' ? 'Super Admin' :
                          admin.role === 'admin_kotama' ? 'Admin Kotama' :
                            admin.role === 'admin_satuan' ? 'Admin Satuan' : admin.role}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => handleDeleteAdmin(admin.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10 border border-dashed border-border rounded-lg bg-background/50">
                <p className="text-muted-foreground">Tidak ada admin yang ditemukan.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Pengaturan;
