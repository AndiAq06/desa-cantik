// src/components/shared/VillageDetailNavbar.jsx
import React, { useState } from 'react';
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
  const [isLayananOpen, setIsLayananOpen] = useState(false);
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
            className="text-base font-semibold text-slate-700 hover:text-[#1C6EA4] text-left w-full transition-colors flex items-center justify-between py-1"
          >
            <span>{label}</span>
            <span className="text-slate-350">&rarr;</span>
          </button>
        </SheetClose>
      );
    }

    return (
      <SheetClose asChild>
        <Link
          to={getLinkTarget(section)}
          className="text-base font-semibold text-slate-700 hover:text-[#1C6EA4] text-left w-full block transition-colors flex items-center justify-between py-1"
        >
          <span>{label}</span>
          <span className="text-slate-350">&rarr;</span>
        </Link>
      </SheetClose>
    );
  };

  return (
    <nav className="bg-gradient-to-r from-[#1C6EA4] to-[#154D71] sticky top-0 z-[9999]">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Left side: Hamburger (mobile only) + Logos & Brand */}
          <div className="flex items-center gap-3">
            {/* Mobile Hamburger Menu */}
            <div className="md:hidden flex-shrink-0">
              <Sheet>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/10 p-1 w-11 h-11"
                  >
                    <Menu className="h-8 w-8" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="bg-white border-r border-slate-200 text-slate-800 p-6 flex flex-col justify-between max-h-screen overflow-y-auto">
                  <div className="space-y-6">
                    <SheetHeader className="mb-6 text-left border-b border-slate-100 pb-4">
                      <SheetTitle className="text-[#1C6EA4] text-lg font-bold tracking-wider uppercase">Sangkutu</SheetTitle>
                    </SheetHeader>
                    <div className="flex flex-col gap-5">
                      {renderMobileLink('Desa', 'desa')}
                      {renderMobileLink('Data', 'data')}
                      {renderMobileLink('Publikasi', 'publikasi')}
                      {renderMobileLink('Peta', 'peta')}
                      {renderMobileLink('Dokumentasi', 'dokumentasi')}

                      {village?.has_layanan_online === true && (
                        <div className="w-full">
                          <button
                            onClick={() => setIsLayananOpen(!isLayananOpen)}
                            className="text-base font-semibold text-slate-700 hover:text-[#1C6EA4] text-left w-full transition-colors flex items-center justify-between py-1"
                          >
                            <span>Layanan Online</span>
                            <span className={`text-slate-400 transition-transform duration-300 ${isLayananOpen ? 'rotate-180' : ''}`}>
                              &#9662;
                            </span>
                          </button>
                          
                          <div className={`flex flex-col gap-3.5 pl-4 border-l border-slate-100 mt-3 overflow-hidden transition-all duration-300 ease-in-out ${isLayananOpen ? 'max-h-[300px] opacity-100' : 'max-h-0 opacity-0'}`}>
                            <SheetClose asChild>
                              <Link
                                to={`/desa/${villageId}/layanan-online/surat-pengantar`}
                                className="text-[14px] font-medium text-slate-650 hover:text-[#1C6EA4] flex items-center gap-2 transition-colors py-1"
                              >
                                <Mail className="h-4 w-4 text-[#1C6EA4]" />
                                Permohonan Layanan Administrasi
                              </Link>
                            </SheetClose>
                            <SheetClose asChild>
                              <Link
                                to={`/desa/${villageId}/layanan-online/status-pengantar`}
                                className="text-[14px] font-medium text-slate-650 hover:text-[#1C6EA4] flex items-center gap-2 transition-colors py-1"
                              >
                                <ClipboardCheck className="h-4 w-4 text-[#1C6EA4]" />
                                Hasil Layanan Administrasi
                              </Link>
                            </SheetClose>
                            <SheetClose asChild>
                              <Link
                                to={`/desa/${villageId}/layanan-online/pengaduan`}
                                className="text-[14px] font-medium text-slate-650 hover:text-[#1C6EA4] flex items-center gap-2 transition-colors py-1"
                              >
                                <MessageSquare className="h-4 w-4 text-[#1C6EA4]" />
                                Pengaduan Masyarakat
                              </Link>
                            </SheetClose>
                            <SheetClose asChild>
                              <Link
                                to={`/desa/${villageId}/layanan-online/status-pengaduan`}
                                className="text-[14px] font-medium text-slate-650 hover:text-[#1C6EA4] flex items-center gap-2 transition-colors py-1"
                              >
                                <AlertCircle className="h-4 w-4 text-[#1C6EA4]" />
                                Status Pengaduan Masyarakat
                              </Link>
                            </SheetClose>
                            <SheetClose asChild>
                              <Link
                                to={`/desa/${villageId}/layanan-online/buku-tamu`}
                                className="text-[14px] font-medium text-slate-650 hover:text-[#1C6EA4] flex items-center gap-2 transition-colors py-1"
                              >
                                <BookOpen className="h-4 w-4 text-[#1C6EA4]" />
                                Buku Tamu
                              </Link>
                            </SheetClose>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-6 border-t border-slate-100 mt-6 flex-shrink-0">
                    <SheetClose asChild>
                      <Button
                        asChild
                        className="w-full bg-[#1C6EA4] hover:bg-[#154D71] text-white text-base py-5 rounded-xl shadow-lg transition-all duration-300"
                      >
                        <Link to="/login">Login</Link>
                      </Button>
                    </SheetClose>
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            {/* Logo & Brand text */}
            <a href={getHomeUrl()} className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 shrink-0">
                {/* Logo BPS */}
                <div className="bg-white p-1 rounded-full shadow-md w-9 h-9 sm:w-11 sm:h-11 flex items-center justify-center hover:scale-105 transition-transform">
                  <img src={logoBps} alt="Logo BPS" className="w-full h-full object-contain" />
                </div>
                {/* Logo Torut */}
                <div className="bg-white p-1 rounded-full shadow-md w-9 h-9 sm:w-11 sm:h-11 flex items-center justify-center hover:scale-105 transition-transform">
                  <img src={logoTorut} alt="Logo Toraja Utara" className="w-full h-full object-contain" />
                </div>
              </div>

              <div className="leading-tight">
                <h1 className="text-white text-sm sm:text-base font-bold">{village?.name || 'Desa'}</h1>
                <p className="text-[#FFF9AF] text-[10px] sm:text-xs font-semibold">Desa Cantik</p>
              </div>
            </a>
          </div>

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
        </div>

        </div>
      </nav>
    );
  }
