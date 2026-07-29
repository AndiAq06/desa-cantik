// src/components/shared/VillageDetailNavbar.jsx
import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Menu, Mail, ClipboardCheck, MessageSquare, AlertCircle, BookOpen, ChevronDown } from 'lucide-react';
import logoBps from '@/assets/images/logo_bps.png';
import logoTorut from '@/assets/images/logo_toraja_utara.png';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

export default function VillageDetailNavbar({ activeSection, scrollToSection, village }) {
  const getSubdomain = () => {
    const hostname = window.location.hostname;
    if (/^[0-9.]+$/.test(hostname)) {
      return null;
    }
    const parts = hostname.split('.');
    const isTwoPartTld = parts[parts.length - 2] === 'co' || parts[parts.length - 2] === 'web' || parts[parts.length - 2] === 'go';
    const minPartsForSubdomain = isTwoPartTld ? 4 : 3;

    if (parts.length < minPartsForSubdomain || parts[0] === 'www' || parts[0] === 'api') {
      return null;
    }
    return parts[0];
  };

  const { slug: paramSlug } = useParams();
  const villageId = paramSlug || getSubdomain();

  const getLinkTarget = (section) => {
    const hostname = window.location.hostname;
    const isLocalOrIp = /^[0-9.]+$/.test(hostname) || hostname === 'localhost';
    
    if (isLocalOrIp) {
      return section === 'desa' ? `/desa/${villageId}` : `/desa/${villageId}#${section}`;
    }

    const parts = hostname.split('.');
    const isTwoPartTld = parts[parts.length - 2] === 'co' || parts[parts.length - 2] === 'web' || parts[parts.length - 2] === 'go';
    const minPartsForSubdomain = isTwoPartTld ? 4 : 3;
    
    if (parts.length >= minPartsForSubdomain && parts[0] !== 'www' && parts[0] !== 'api') {
      return section === 'desa' ? `/` : `/#${section}`;
    }
    
    return section === 'desa' ? `/desa/${villageId}` : `/desa/${villageId}#${section}`;
  };

  const getHomeUrl = () => {
    const hostname = window.location.hostname;
    if (/^[0-9.]+$/.test(hostname) || hostname === 'localhost') {
      return '/';
    }
    const protocol = window.location.protocol;
    const parts = hostname.split('.');
    const baseDomain = parts.slice(-3).join('.');
    return `${protocol}//${baseDomain}/`;
  };

  const getActiveClass = (section) =>
    activeSection === section
      ? 'bg-white/20 text-white'
      : 'text-white hover:text-[#FFF9AF] hover:bg-white/10';

  const renderButton = (label, section) => {
    const content = (
      <Button
        variant="ghost"
        className={`text-sm px-4 py-1.5 transition-all ${getActiveClass(section)}`}
        onClick={scrollToSection ? () => scrollToSection(section) : undefined}
      >
        {label}
      </Button>
    );

    if (!scrollToSection) {
      return (
        <Link to={getLinkTarget(section)}>
          {content}
        </Link>
      );
    }
    return content;
  };

  const renderMobileLink = (label, section) => {
    if (scrollToSection) {
      return (
        <SheetClose asChild>
          <button
            onClick={section === 'desa' 
              ? () => { window.scrollTo({ top: 0, behavior: 'smooth' }); scrollToSection('desa'); }
              : () => scrollToSection(section)
            }
            className="text-lg font-medium text-gray-700 hover:text-[#1C6EA4] text-left w-full"
          >
            {label}
          </button>
        </SheetClose>
      );
    }

    return (
      <SheetClose asChild>
        <Link
          to={getLinkTarget(section)}
          className="text-lg font-medium text-gray-700 hover:text-[#1C6EA4] text-left w-full block"
        >
          {label}
        </Link>
      </SheetClose>
    );
  };

  return (
    <nav className="bg-gradient-to-r from-[#1C6EA4] to-[#154D71] sticky top-0 z-[9999]">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">

          {/* Logo */}
          <a href={getHomeUrl()} className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              {/* Logo BPS */}
              <div className="bg-white p-1 rounded-full shadow-md w-10 h-10 flex items-center justify-center hover:scale-105 transition-transform">
                <img src={logoBps} alt="Logo BPS" className="w-full h-full object-contain" />
              </div>
              {/* Logo Torut */}
              <div className="bg-white p-1 rounded-full shadow-md w-10 h-10 flex items-center justify-center hover:scale-105 transition-transform">
                <img src={logoTorut} alt="Logo Toraja Utara" className="w-full h-full object-contain" />
              </div>
            </div>

            <div className="hidden md:block leading-tight">
              <h1 className="text-white text-base font-bold">Desa Cantik</h1>
              <p className="text-[#FFF9AF] text-xs font-semibold">Cinta Statistik</p>
            </div>
          </a>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-1.5">
            {scrollToSection ? (
              <Button
                variant="ghost"
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                  scrollToSection('desa');
                }}
                className={`text-sm px-4 py-1.5 transition-all ${getActiveClass('desa')}`}
              >
                Desa
              </Button>
            ) : (
              <Link to={getLinkTarget('desa')}>
                <Button
                  variant="ghost"
                  className={`text-sm px-4 py-1.5 transition-all ${getActiveClass('desa')}`}
                >
                  Desa
                </Button>
              </Link>
            )}

            {renderButton('Data', 'data')}
            {renderButton('Publikasi', 'publikasi')}
            {renderButton('Peta', 'peta')}
            {renderButton('Dokumentasi', 'dokumentasi')}

            {village?.has_layanan_online === true && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="text-sm px-4 py-1.5 text-white hover:text-[#FFF9AF] hover:bg-white/10 flex items-center gap-1 transition-all"
                  >
                    Layanan Online
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-white border border-slate-200 shadow-xl rounded-xl z-[99999] p-1">
                  <DropdownMenuItem asChild className="hover:bg-slate-50 cursor-pointer rounded-lg">
                    <Link to={`/desa/${villageId}/layanan-online/surat-pengantar`} className="w-full flex items-center py-2 px-3 text-slate-700">
                      <Mail className="mr-2.5 h-4 w-4 text-[#1C6EA4]" />
                      <span className="text-sm">Permohonan Layanan Administrasi</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="hover:bg-slate-50 cursor-pointer rounded-lg">
                    <Link to={`/desa/${villageId}/layanan-online/status-pengantar`} className="w-full flex items-center py-2 px-3 text-slate-700">
                      <ClipboardCheck className="mr-2.5 h-4 w-4 text-[#1C6EA4]" />
                      <span className="text-sm">Hasil Layanan Administrasi</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="hover:bg-slate-50 cursor-pointer rounded-lg">
                    <Link to={`/desa/${villageId}/layanan-online/pengaduan`} className="w-full flex items-center py-2 px-3 text-slate-700">
                      <MessageSquare className="mr-2.5 h-4 w-4 text-[#1C6EA4]" />
                      <span className="text-sm">Pengaduan Masyarakat</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="hover:bg-slate-50 cursor-pointer rounded-lg">
                    <Link to={`/desa/${villageId}/layanan-online/status-pengaduan`} className="w-full flex items-center py-2 px-3 text-slate-700">
                      <AlertCircle className="mr-2.5 h-4 w-4 text-[#1C6EA4]" />
                      <span className="text-sm">Status Pengaduan Masyarakat</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="hover:bg-slate-50 cursor-pointer rounded-lg">
                    <Link to={`/desa/${villageId}/layanan-online/buku-tamu`} className="w-full flex items-center py-2 px-3 text-slate-700">
                      <BookOpen className="mr-2.5 h-4 w-4 text-[#1C6EA4]" />
                      <span className="text-sm">Buku Tamu</span>
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            <Button
              asChild
              className="bg-[#FFF9AF] hover:bg-[#154D71] text-[#154D71] hover:text-white text-sm px-5 py-1.5 ml-2 shadow"
            >
              <Link to="/login">Login</Link>
            </Button>
          </div>

          {/* Mobile Menu (Hamburger) */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/10"
                >
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="bg-white p-6">
                <SheetHeader className="mb-6 text-left">
                  <SheetTitle className="text-[#1C6EA4]">Menu</SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-4">
                  {renderMobileLink('Desa', 'desa')}
                  {renderMobileLink('Data', 'data')}
                  {renderMobileLink('Publikasi', 'publikasi')}
                  {renderMobileLink('Peta', 'peta')}
                  {renderMobileLink('Dokumentasi', 'dokumentasi')}

                  {village?.has_layanan_online === true && (
                    <div className="flex flex-col gap-2.5 pl-2 border-l border-slate-200 mt-2">
                      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider pl-1">
                        Layanan Online
                      </span>
                      <SheetClose asChild>
                        <Link
                          to={`/desa/${villageId}/layanan-online/surat-pengantar`}
                          className="text-base text-gray-600 hover:text-[#1C6EA4] pl-2 flex items-center gap-2"
                        >
                          <Mail className="h-4 w-4 text-[#1C6EA4]" />
                          Permohonan Layanan Administrasi
                        </Link>
                      </SheetClose>
                      <SheetClose asChild>
                        <Link
                          to={`/desa/${villageId}/layanan-online/status-pengantar`}
                          className="text-base text-gray-600 hover:text-[#1C6EA4] pl-2 flex items-center gap-2"
                        >
                          <ClipboardCheck className="h-4 w-4 text-[#1C6EA4]" />
                          Hasil Layanan Administrasi
                        </Link>
                      </SheetClose>
                      <SheetClose asChild>
                        <Link
                          to={`/desa/${villageId}/layanan-online/pengaduan`}
                          className="text-base text-gray-600 hover:text-[#1C6EA4] pl-2 flex items-center gap-2"
                        >
                          <MessageSquare className="h-4 w-4 text-[#1C6EA4]" />
                          Pengaduan Masyarakat
                        </Link>
                      </SheetClose>
                      <SheetClose asChild>
                        <Link
                          to={`/desa/${villageId}/layanan-online/status-pengaduan`}
                          className="text-base text-gray-600 hover:text-[#1C6EA4] pl-2 flex items-center gap-2"
                        >
                          <AlertCircle className="h-4 w-4 text-[#1C6EA4]" />
                          Status Pengaduan Masyarakat
                        </Link>
                      </SheetClose>
                      <SheetClose asChild>
                        <Link
                          to={`/desa/${villageId}/layanan-online/buku-tamu`}
                          className="text-base text-gray-600 hover:text-[#1C6EA4] pl-2 flex items-center gap-2"
                        >
                          <BookOpen className="h-4 w-4 text-[#1C6EA4]" />
                          Buku Tamu
                        </Link>
                      </SheetClose>
                    </div>
                  )}

                  <div className="pt-4 mt-2 border-t border-gray-100">
                    <SheetClose asChild>
                      <Button
                        asChild
                        className="w-full bg-[#1C6EA4] hover:bg-[#154D71]"
                      >
                        <Link to="/login">Login</Link>
                      </Button>
                    </SheetClose>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>

        </div>
      </div>
    </nav>
  );
}
