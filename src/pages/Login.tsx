import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface LoginProps {
  onLogin: () => void;
}

const Login = ({ onLogin }: LoginProps) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Simulate login - replace with actual auth
    setTimeout(() => {
      if (email === "admin@sisforun.id" && password === "admin123") {
        onLogin();
        navigate("/");
      } else {
        setError("Email atau password salah. Silakan coba lagi.");
      }
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 gradient-dark items-center justify-center p-12 relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
        </div>

        <div className="relative z-10 max-w-md text-center">
          <div className="inline-flex h-24 w-24 items-center justify-center rounded-2xl mb-8 overflow-hidden">
            <img src="/logo.jpg" alt="SISFORUN" className="h-24 w-24 object-cover" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">
            SISFORUN
          </h1>
          <p className="text-lg text-white/70 mb-8">
            Sistem monitoring dan tracking aktivitas lari. Pantau pencapaian target 14 KM pelari dengan mudah.
          </p>
          <div className="flex items-center justify-center gap-8 text-white/60">
            <div className="text-center">
              <p className="text-3xl font-bold text-white">1,248</p>
              <p className="text-sm">Pelari Aktif</p>
            </div>
            <div className="h-12 w-px bg-white/20" />
            <div className="text-center">
              <p className="text-3xl font-bold text-white">347</p>
              <p className="text-sm">Target Tercapai</p>
            </div>
            <div className="h-12 w-px bg-white/20" />
            <div className="text-center">
              <p className="text-3xl font-bold text-white">15K</p>
              <p className="text-sm">Km Minggu Ini</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-xl mb-4 overflow-hidden">
              <img src="/logo.jpg" alt="SISFORUN" className="h-16 w-16 object-cover" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">SISFORUN</h1>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-foreground">Selamat Datang</h2>
              <p className="text-muted-foreground">
                Masuk ke panel admin untuk memantau aktivitas pelari
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm animate-slide-up">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@sisforun.id"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={isLoading}
              >
                {isLoading ? "Memproses..." : "Masuk"}
              </Button>
            </form>

            <p className="text-center text-sm text-muted-foreground">
              Demo: admin@sisforun.id / admin123
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
