import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SidebarProvider } from "@/context/SidebarContext";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import DataPelari from "@/pages/DataPelari";
import Target14KM from "@/pages/Target14KM";
import DetailPelari from "@/pages/DetailPelari";
import Laporan from "@/pages/Laporan";
import Pengaturan from "@/pages/Pengaturan";
import Profil from "@/pages/Profil";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <SidebarProvider>
          <BrowserRouter>
            <Routes>
              {!isAuthenticated ? (
                <>
                  <Route path="/login" element={<Login onLogin={handleLogin} />} />
                  <Route path="*" element={<Navigate to="/login" replace />} />
                </>
              ) : (
                <>
                  <Route
                    path="/"
                    element={
                      <DashboardLayout onLogout={handleLogout}>
                        <Dashboard />
                      </DashboardLayout>
                    }
                  />
                  <Route
                    path="/pelari"
                    element={
                      <DashboardLayout onLogout={handleLogout}>
                        <DataPelari />
                      </DashboardLayout>
                    }
                  />
                  <Route
                    path="/pelari/:id"
                    element={
                      <DashboardLayout onLogout={handleLogout}>
                        <DetailPelari />
                      </DashboardLayout>
                    }
                  />
                  <Route
                    path="/target"
                    element={
                      <DashboardLayout onLogout={handleLogout}>
                        <Target14KM />
                      </DashboardLayout>
                    }
                  />
                  <Route
                    path="/laporan"
                    element={
                      <DashboardLayout onLogout={handleLogout}>
                        <Laporan />
                      </DashboardLayout>
                    }
                  />
                  <Route
                    path="/pengaturan"
                    element={
                      <DashboardLayout onLogout={handleLogout}>
                        <Pengaturan />
                      </DashboardLayout>
                    }
                  />
                  <Route
                    path="/profil"
                    element={
                      <DashboardLayout onLogout={handleLogout}>
                        <Profil />
                      </DashboardLayout>
                    }
                  />
                  <Route path="/login" element={<Navigate to="/" replace />} />
                  <Route path="*" element={<NotFound />} />
                </>
              )}
            </Routes>
          </BrowserRouter>
        </SidebarProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
