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
          {/* Logo */}
          <Link to="/" className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {/* Logo BPS */}
              <div className="bg-white p-1.5 rounded-full shadow-md w-12 h-12 flex items-center justify-center hover:scale-105 transition-transform">
                <img src={logoBps} alt="Logo BPS" className="w-full h-full object-contain" />
              </div>

              {/* Logo Toraja Utara */}
              <div className="bg-white p-1.5 rounded-full shadow-md w-12 h-12 flex items-center justify-center hover:scale-105 transition-transform">
                <img src={logoTorut} alt="Logo Toraja Utara" className="w-full h-full object-contain" />
              </div>
            </div>

            <div className="hidden md:block">
              <h1 className="text-white text-lg font-bold">Desa Cantik</h1>
              <p className="text-[#FFF9AF] text-xs font-semibold">Desa Cinta Statistik</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1.5">
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

          {/* Mobile Navigation (Hamburger) */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="bg-gradient-to-b from-[#154D71] to-[#1C6EA4] text-white border-l-0 p-6 flex flex-col justify-between">
                <div>
                  <SheetHeader className="mb-8 text-left border-b border-white/10 pb-4">
                    <SheetTitle className="text-white text-xl font-black tracking-wider uppercase">Sangkutu</SheetTitle>
                  </SheetHeader>
                  <div className="flex flex-col gap-6">
                    <SheetClose asChild>
                      <Link to="/" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="text-lg font-bold text-white hover:text-[#FFF9AF] transition-colors flex items-center justify-between">
                        <span>Home</span>
                        <span className="text-white/20">&rarr;</span>
                      </Link>
                    </SheetClose>

                    <SheetClose asChild>
                      <Link to="/" onClick={scrollToVillages} className="text-lg font-bold text-white hover:text-[#FFF9AF] transition-colors flex items-center justify-between">
                        <span>Desa Cantik</span>
                        <span className="text-white/20">&rarr;</span>
                      </Link>
                    </SheetClose>

                    <SheetClose asChild>
                      <Link to="/tentang" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="text-lg font-bold text-white hover:text-[#FFF9AF] transition-colors flex items-center justify-between">
                        <span>Tentang</span>
                        <span className="text-white/20">&rarr;</span>
                      </Link>
                    </SheetClose>
                  </div>
                </div>

                <div className="pt-6 border-t border-white/10">
                  <SheetClose asChild>
                    <Button asChild className="w-full bg-[#FFF9AF] hover:bg-[#154D71] text-[#154D71] hover:text-white text-base py-6 rounded-xl shadow-lg transition-all duration-300">
                      <Link to="/login">Login</Link>
                    </Button>
                  </SheetClose>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
