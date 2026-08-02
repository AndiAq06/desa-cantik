import { useContext, useState } from "react";
import { FooterContext } from "@/contexts/FooterContext";
import logoDc from "@/assets/images/logo_sangkutu.png";
import { Link } from "react-router-dom";
import { ChevronDown } from "lucide-react";

const FooterSection = ({ title, children }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-white/10 md:border-none last:border-none">
      <button onClick={() => setIsOpen(!isOpen)} className="flex items-center justify-between w-full py-3 md:py-0 md:mb-4 text-left focus:outline-none">
        <h3 className="text-xs font-semibold tracking-widest uppercase text-white">{title}</h3>
        <ChevronDown className={`w-4 h-4 transition-transform duration-300 md:hidden text-blue-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>
      <div className={`overflow-hidden transition-all duration-300 ease-in-out md:block ${isOpen ? "max-h-48 opacity-100 mb-4" : "max-h-0 opacity-0 md:max-h-none md:opacity-100"}`}>{children}</div>
    </div>
  );
};

export default function Footer({ scrollToVillages }) {
  const { footerData } = useContext(FooterContext);

  const ensureHttp = (url) => {
    if (!url) return "#";
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    return `https://${url}`;
  };

  const cleanPhone = (phone) => {
    if (!phone) return "";
    return phone.replace(/[^\d+]/g, "");
  };

  return (
    <footer className="bg-gradient-to-r from-[#154D71] to-[#1C6EA4] text-white pt-10 pb-0 mt-auto">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5 md:gap-10 max-w-5xl mx-auto text-sm">
          <div className="md:col-span-1 mb-3 md:mb-0 flex flex-col items-center md:items-start text-center md:text-left">
            <div className="w-14 h-14 md:w-16 md:h-16 bg-white rounded-full p-2.5 md:p-3 flex items-center justify-center mb-3">
              <img src={logoDc} alt="Logo Desa Cantik" className="w-9 h-9 md:w-10 md:h-10 object-contain" />
            </div>
            <h3 className="text-base md:text-lg mb-1 font-semibold">Desa Cantik</h3>
            <p className="text-blue-200 text-sm md:text-sm mb-4">Sistem Informasi Desa Cinta Statistik</p>
          </div>

          <FooterSection title="Navigasi">
            <ul className="flex flex-col gap-2.5 text-blue-100 text-xs md:text-sm pl-1 md:pl-0">
              <li>
                <Link to="/" className="hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToVillages();
                  }}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Desa Cantik
                </a>
              </li>
              <li>
                <Link to="/about" className="hover:text-white transition-colors">
                  Tentang
                </Link>
              </li>
            </ul>
          </FooterSection>

          <FooterSection title="Kontak">
            <ul className="flex flex-col gap-2.5 text-blue-100 text-xs md:text-sm pl-1 md:pl-0">
              <li>
                <a href={`mailto:${footerData.email}`} className="hover:text-white transition-colors break-all">
                  desacantik@bps.go.id
                </a>
              </li>
              <li>
                <a href={`tel:${cleanPhone(footerData.phone)}`} className="hover:text-white transition-colors">
                  0812-3456-7890
                </a>
              </li>
            </ul>
          </FooterSection>

          <FooterSection title="Website BPS">
            <ul className="flex flex-col gap-2.5 text-blue-100 text-xs md:text-sm pl-1 md:pl-0">
              <li>
                <a href={ensureHttp(footerData.bps_torut)} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                  BPS Toraja Utara
                </a>
              </li>
              <li>
                <a href={ensureHttp(footerData.bps_sulsel)} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                  BPS Sulsel
                </a>
              </li>
              <li>
                <a href={ensureHttp(footerData.bps_ri)} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                  BPS RI
                </a>
              </li>
            </ul>
          </FooterSection>
        </div>

        <div className="max-w-5xl mx-auto mt-8 border-t border-white/10 py-4 flex flex-col md:flex-row items-center justify-between gap-2">
          <p className="text-blue-200 text-xs">© {new Date().getFullYear()} Desa Cantik — BPS Toraja Utara</p>
          <span className="text-xs text-blue-200 border border-blue-200/30 bg-blue-200/10 px-3 py-1 rounded-full">Satu Data Indonesia</span>
        </div>
      </div>
    </footer>
  );
}
