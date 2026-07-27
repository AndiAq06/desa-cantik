// src/layouts/DashboardLayout.jsx
import React, { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import SidebarBPS from "@/components/shared/SidebarAdminBPS";
import SidebarPerangkat from "@/components/shared/SidebarPerangkatDesa";
import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { dataApi } from "@/services/dataApi";
import { useAuth } from "@/contexts/AuthContext";

export default function DashboardLayout() {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false); // State untuk mobile sidebar

  // 1. Ambil objek 'user' dari Context
  const { user, activeVillageId, setActiveVillageId } = useAuth();

  // Cek admin berdasarkan path URL (lebih aman untuk layout) atau role user
  const isAdmin = location.pathname.startsWith("/admin");

  const [villages, setVillages] = useState([]);

  useEffect(() => {
    if (!isAdmin) return;
    const fetchVillages = async () => {
      try {
        const res = await dataApi.listVillages({ per_page: 100 });
        setVillages(res.items || []);
        if (!activeVillageId && res.items?.[0]?.id) {
          setActiveVillageId(String(res.items[0].id));
        }
      } catch {
        /* ignore */
      }
    };
    fetchVillages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin]);

  // --- LOGIKA DINAMIS HEADER (PERBAIKAN DI SINI) ---

  // 2. Tentukan Judul Kiri
  // Jika Admin: Tampilkan 'Admin BPS'
  // Jika Desa: Ambil nama desa dari `user.village.name`, fallback ke 'Dashboard Desa'
  const title = isAdmin ? "Admin BPS" : user?.village?.name || "Dashboard Desa";

  const subtitle = "Desa Cantik";

  // 3. Tentukan Nama User & Role (Kanan)
  // Ambil nama dari `user.full_name`
  const userName =
    user?.full_name || (isAdmin ? "Administrator" : "Perangkat Desa");

  // Initial
  const userInitial = userName.charAt(0).toUpperCase();

  // Role Label (teks kecil di bawah nama)
  // Ambil dari `user.role.role_name` jika ada, atau fallback manual
  const userRoleLabel =
    user?.role?.role_name === "bps_admin" ? "Administrator" : "Perangkat Desa";

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* HEADER: Kirim props dinamis */}
      <Header
        title={title}
        subtitle={subtitle}
        userName={userName}
        userInitial={userInitial}
        userRole={userRoleLabel}
        onMenuClick={() => setIsMobileOpen(true)}
      />

      {/* MIDDLE SECTION - flex-1 to fill space */}
      <div className="flex flex-1 overflow-hidden">
        {/* SIDEBAR */}
        {/* SIDEBAR (Desktop) */}
        <div
          className="shrink-0 flex-col bg-white border-r hidden md:flex"
          style={{
            width: isCollapsed ? "4rem" : "16rem",
            flexShrink: 0,
            transition: "width 0.3s",
          }}
        >
          {isAdmin ? (
            <SidebarBPS
              isCollapsed={isCollapsed}
              setIsCollapsed={setIsCollapsed}
            />
          ) : (
            <SidebarPerangkat
              isCollapsed={isCollapsed}
              setIsCollapsed={setIsCollapsed}
            />
          )}
        </div>

        {/* SIDEBAR (Mobile - Sheet) */}
        <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
          <SheetContent side="left" className="p-0 w-64">
            <VisuallyHidden.Root>
              <SheetTitle>Navigation Menu</SheetTitle>
              <SheetDescription>Mobile navigation sidebar</SheetDescription>
            </VisuallyHidden.Root>
            {isAdmin ? (
              <SidebarBPS
                isCollapsed={false} // Selalu expand di mobile
                setIsCollapsed={() => {}} // Disable collapse di mobile
              />
            ) : (
              <SidebarPerangkat isCollapsed={false} setIsCollapsed={() => {}} />
            )}
          </SheetContent>
        </Sheet>

        {/* CONTENT */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
            <Outlet />
          </main>
        </div>
      </div>

      {/* FOOTER - Always at bottom */}
      <Footer scrollToVillages={() => {}} />
    </div>
  );
}
