// src/components/shared/SidebarPerangkatDesa.jsx
import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut, ChevronLeft, Mail, MessageSquare, BookOpen } from "lucide-react";
import { villageMenuItems } from "../../routes/config";
import { useAuth } from "@/contexts/AuthContext";

export default function SidebarPerangkatDesa({ isCollapsed, setIsCollapsed }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const hasLayananOnline = user?.village?.has_layanan_online === true || user?.village?.has_layanan_online === 1;

  const menuItems = [
    ...villageMenuItems,
    ...(hasLayananOnline ? [
      { id: 'desa-surat-pengantar', label: 'Kelola Surat', icon: Mail, path: '/desa-dashboard/surat-pengantar' },
      { id: 'desa-pengaduan', label: 'Kelola Pengaduan', icon: MessageSquare, path: '/desa-dashboard/pengaduan' },
      { id: 'desa-buku-tamu', label: 'Kelola Buku Tamu', icon: BookOpen, path: '/desa-dashboard/buku-tamu' },
    ] : [])
  ];

  return (
    <aside
      className={`relative bg-white border-r border-gray-200 
        flex flex-col h-full transition-all duration-300
        ${isCollapsed ? "w-16" : "w-64"}`}
    >
      {/* MENU — harus flex-1 agar bisa mendorong logout ke bawah */}
      <nav className="pt-6 px-3 flex-1 min-h-0 overflow-y-auto">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            
            const getSubdomain = () => {
              const hostname = window.location.hostname;
              if (/^[0-9.]+$/.test(hostname)) return null;
              const parts = hostname.split('.');
              const isTwoPartTld = parts[parts.length - 2] === 'co' || parts[parts.length - 2] === 'web' || parts[parts.length - 2] === 'go';
              const minPartsForSubdomain = isTwoPartTld ? 4 : 3;
              if (parts.length < minPartsForSubdomain || parts[0] === 'www' || parts[0] === 'api') return null;
              return parts[0];
            };

            const subdomain = getSubdomain();
            const villageSlug = user?.village?.name ? user.village.name.toLowerCase().replace(/\s+/g, "-") : "desa";
            const dynamicPath = subdomain
              ? item.path.replace("/desa-dashboard", "")
              : item.path.replace("/desa-dashboard", `/${villageSlug}`);
            const isActive = location.pathname.startsWith(dynamicPath);

            return (
              <li key={item.id}>
                <Button
                  asChild
                  variant={isActive ? "default" : "ghost"}
                  className={`w-full flex justify-start items-center gap-3 ${
                    isActive
                      ? "bg-[#1C6EA4] text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                  title={isCollapsed ? item.label : undefined}
                >
                  <Link to={dynamicPath}>
                    <Icon className="h-5 w-5" />
                    {!isCollapsed && (
                      <span className="text-sm">{item.label}</span>
                    )}
                  </Link>
                </Button>
              </li>
            );
          })}
          {/* LOGOUT BUTTON DIRECTLY UNDER THE MENU ITEMS */}
          <li className="pt-2 border-t border-gray-200 mt-2">
            <Button
              variant="ghost"
              onClick={handleLogout}
              className={`w-full flex justify-start items-center gap-3 text-red-600 hover:text-red-700 hover:bg-red-50 ${
                isCollapsed ? "px-0 justify-center" : ""
              }`}
              title={isCollapsed ? "Logout" : undefined}
            >
              <LogOut className="h-5 w-5 shrink-0" />
              {!isCollapsed && <span className="text-sm">Logout</span>}
            </Button>
          </li>
        </ul>
      </nav>

      {/* COLLAPSE BUTTON */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute top-20 -right-3 z-10 bg-white border border-gray-200 rounded-full p-1 hover:bg-gray-50 transition-all"
      >
        <ChevronLeft
          className={`h-4 w-4 transition-transform ${
            isCollapsed ? "rotate-180" : ""
          }`}
        />
      </button>
    </aside>
  );
}
