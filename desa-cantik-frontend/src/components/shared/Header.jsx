// src/components/shared/Header.jsx
import React from "react";
import { Link } from "react-router-dom";
import { Menu } from "lucide-react";
import logoBps from "@/assets/images/logo_bps.png";
import logoTorut from "@/assets/images/logo_toraja_utara.png";

export default function Header({ title, subtitle, userName, userInitial, userRole, ...props }) {
  return (
    <header className="h-20 bg-[#1C6EA4] border-b border-gray-200 flex items-center justify-between px-6 transition-all">
      {/* Sisi Kiri: Logo & Judul Halaman (Nama Desa/Admin) */}
      <div className="flex items-center gap-4">
        {/* Mobile Menu Button */}
        <button onClick={props.onMenuClick} className="md:hidden p-2 -ml-2 text-white hover:bg-white/10 rounded-lg transition-colors">
          <Menu className="h-6 w-6" />
        </button>

        <Link to="/" className="flex items-center gap-2">
          {/* Logo BPS */}
          <div className="bg-white p-1 rounded-lg shadow-sm w-8 h-8 flex items-center justify-center">
            <img src={logoBps} alt="Logo BPS" className="w-full h-full object-contain" />
          </div>
          {/* Logo Torut */}
          <div className="bg-white p-1 rounded-lg shadow-sm w-8 h-8 flex items-center justify-center">
            <img src={logoTorut} alt="Logo Toraja Utara" className="w-full h-full object-contain" />
          </div>
        </Link>

        <div>
          <div className="text-white text-sm font-bold leading-tight">{title}</div>
          <div className="text-gray-300 text-xs leading-tight">{subtitle}</div>
        </div>
      </div>

      {/* Sisi Kanan: Profil Pengguna */}
      <div className="flex items-center gap-4">
        <div className="text-right hidden sm:block">
          <div className="text-sm text-white font-medium">{userName}</div>
          {/* Gunakan userRole jika ada, jika tidak gunakan subtitle */}
          <div className="text-xs text-gray-300">{userRole || subtitle}</div>
        </div>
        <div className="h-10 w-10 rounded-full bg-white text-[#1C6EA4] flex items-center justify-center font-bold shadow-sm ring-2 ring-white/30">
          <span>{userInitial}</span>
        </div>
      </div>
    </header>
  );
}
