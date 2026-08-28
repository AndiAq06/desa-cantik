// src/components/shared/Navbar.jsx
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetClose, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import logoBps from "@/assets/images/logo_bps.png";
import logoTorut from "@/assets/images/logo_toraja_utara.png";

export default function Navbar({ scrollToVillages }) {
  return (
    <nav className="bg-gradient-to-r from-[#154D71] to-[#1C6EA4] sticky top-0 z-50 shadow-md">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          {/* Left side: Hamburger (mobile only) + Logos & Brand */}
          <div className="flex items-center gap-3">
            {/* Mobile Hamburger menu */}
            <div className="lg:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 p-1 w-11 h-11">
                    <Menu className="h-8 w-8" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="bg-white border-r border-slate-200 text-slate-800 p-6 flex flex-col justify-between">
                  <div>
                    <SheetHeader className="mb-8 text-left border-b border-slate-100 pb-4">
                      <SheetTitle className="text-[#154D71] text-lg font-bold tracking-wider uppercase">Sangkutu</SheetTitle>
                    </SheetHeader>
                    <div className="flex flex-col gap-5">
                      <SheetClose asChild>
                        <Link to="/" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="text-base font-semibold text-slate-700 hover:text-[#1C6EA4] transition-colors flex items-center justify-between py-1">
                          <span>Home</span>
                          <span className="text-slate-350">&rarr;</span>
                        </Link>
                      </SheetClose>

                      <SheetClose asChild>
                        <Link to="/" onClick={scrollToVillages} className="text-base font-semibold text-slate-700 hover:text-[#1C6EA4] transition-colors flex items-center justify-between py-1">
                          <span>Desa Cantik</span>
                          <span className="text-slate-350">&rarr;</span>
                        </Link>
                      </SheetClose>

                      <SheetClose asChild>
                        <Link to="/tentang" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="text-base font-semibold text-slate-700 hover:text-[#1C6EA4] transition-colors flex items-center justify-between py-1">
                          <span>Tentang</span>
                          <span className="text-slate-350">&rarr;</span>
                        </Link>
                      </SheetClose>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-slate-100">
                    <SheetClose asChild>
                      <Button asChild className="w-full bg-[#1C6EA4] hover:bg-[#154D71] text-white text-base py-5 rounded-xl shadow-lg transition-all duration-300">
                        <Link to="/login">Login</Link>
                      </Button>
                    </SheetClose>
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            {/* Logo & Brand text */}
            <Link to="/" className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 shrink-0">
                {/* Logo BPS */}
                <div className="bg-white p-1 rounded-full shadow-md w-9 h-9 sm:w-11 sm:h-11 flex items-center justify-center hover:scale-105 transition-transform">
                  <img src={logoBps} alt="Logo BPS" className="w-full h-full object-contain" />
                </div>

                {/* Logo Toraja Utara */}
                <div className="bg-white p-1 rounded-full shadow-md w-9 h-9 sm:w-11 sm:h-11 flex items-center justify-center hover:scale-105 transition-transform">
                  <img src={logoTorut} alt="Logo Toraja Utara" className="w-full h-full object-contain" />
                </div>
              </div>

              <div className="leading-tight">
                <h1 className="text-white text-sm sm:text-base font-bold">Desa Cantik</h1>
                <p className="text-[#FFF9AF] text-[10px] sm:text-xs font-semibold">Desa Cinta Statistik</p>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1.5">
            <Button asChild variant="ghost" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="text-white hover:text-[#FFF9AF] hover:bg-white/10 text-base px-4 py-1.5 transition-all">
              <Link to="/">Home</Link>
            </Button>

            <Button asChild variant="ghost" onClick={scrollToVillages} className="text-white hover:text-[#FFF9AF] hover:bg-white/10 text-base px-4 py-1.5 transition-all">
              <Link to="/">Desa Cantik</Link>
            </Button>

            <Button asChild variant="ghost" className="text-white hover:text-[#FFF9AF] hover:bg-white/10 text-base px-4 py-1.5 transition-all" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
              <Link to="/tentang">Tentang</Link>
            </Button>

            <Button asChild className="bg-[#FFF9AF] hover:bg-[#154D71] text-[#154D71] hover:text-white text-base px-6 py-1.5 ml-3 transition-all shadow-md hover:shadow-lg">
              <Link to="/login">Login</Link>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
