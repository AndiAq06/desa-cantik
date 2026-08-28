import React, { useState, useEffect } from "react";
import { FileText, Loader2 } from "lucide-react";

/**
 * PDFPreview component - displays the first page of a PDF using browser's native PDF renderer
 * Falls back to a placeholder if the PDF can't be loaded
 *
 * @param {string} pdfUrl - URL to the PDF file
 * @param {string} title - Fallback title if PDF fails to load
 * @param {string} className - Additional CSS classes
 */
export default function PDFPreview({ pdfUrl, title, className = "" }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || window.opera;
      const isMobileUA = /android|iphone|ipad|ipod|iemobile|opera mini/i.test(userAgent);
      const isSmallScreen = window.innerWidth < 1024; // tablet and mobile
      setIsMobile(isMobileUA || isSmallScreen);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  React.useEffect(() => {
    if (!pdfUrl) return;
    const timer = setTimeout(() => {
      setLoading(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, [pdfUrl]);

  // If no URL, show placeholder immediately
  if (!pdfUrl) {
    return (
      <div
        className={`flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 ${className}`}
      >
        <div className="text-center p-4">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-500 font-medium break-words max-w-[200px] mx-auto">
            {title || "Dokumen PDF"}
          </p>
        </div>
      </div>
    );
  }

  const handleLoad = () => {
    setLoading(false);
  };

  const handleError = () => {
    setLoading(false);
    setError(true);
  };

  // Show error/fallback state
  if (error) {
    return (
      <div
        className={`flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 ${className}`}
      >
        <div className="text-center p-4">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-500 font-medium break-words max-w-[200px] mx-auto">
            {title || "Dokumen PDF"}
          </p>
        </div>
      </div>
    );
  }

  // Mobile/Tablet Fallback UI
  if (isMobile) {
    return (
      <div className={`flex flex-col items-center justify-center p-6 bg-gradient-to-br from-[#154D71]/5 to-[#33A1E0]/5 rounded-xl border border-dashed border-[#154D71]/20 text-center ${className}`}>
        <div className="p-4 bg-white rounded-full shadow-md mb-4 text-[#154D71]">
          <FileText className="w-12 h-12" />
        </div>
        <h4 className="font-bold text-[#154D71] text-base mb-2 max-w-[280px] line-clamp-2">
          {title || "Dokumen PDF"}
        </h4>
        <p className="text-xs text-gray-500 mb-5 max-w-[240px]">
          Perangkat mobile tidak mendukung pratinjau PDF langsung. Klik tombol di bawah untuk membaca dokumen.
        </p>
        <a
          href={pdfUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center px-6 py-3 bg-[#154D71] hover:bg-[#33A1E0] text-white font-semibold rounded-lg shadow-md transition-all gap-2 text-sm w-full max-w-[200px]"
        >
          <FileText className="w-4 h-4" />
          Baca PDF
        </a>
      </div>
    );
  }

  // Append #page=1&zoom=fit to show first page and fit to container
  const embedUrl = `${pdfUrl}#page=1&view=FitH&toolbar=0&navpanes=0&scrollbar=0`;

  return (
    <div className={`relative bg-white ${className}`}>
      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 z-10">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-gray-400 animate-spin mx-auto mb-2" />
            <p className="text-sm text-gray-500">Memuat pratinjau...</p>
          </div>
        </div>
      )}

      {/* PDF Embed - using object tag for better browser support */}
      <object
        data={embedUrl}
        type="application/pdf"
        className="w-full h-full"
        onLoad={handleLoad}
        onError={handleError}
      >
        {/* Fallback for browsers that don't support PDF embed */}
        <div className="flex items-center justify-center h-full bg-gradient-to-br from-gray-100 to-gray-200">
          <div className="text-center p-4">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500 font-medium break-words max-w-[200px] mx-auto">
              {title || "Dokumen PDF"}
            </p>
          </div>
        </div>
      </object>
    </div>
  );
}

