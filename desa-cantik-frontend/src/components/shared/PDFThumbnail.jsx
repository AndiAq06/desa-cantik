import React, { useEffect, useState } from "react";
import { FileText, Loader2 } from "lucide-react";
import * as pdfjsLib from "pdfjs-dist";

// Import worker source as a local URL via Vite asset loader
// This prevents cross-origin worker blocks and eliminates CDN dependency
import pdfjsWorkerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorkerUrl;

export default function PDFThumbnail({ pdfUrl, title, className = "" }) {
  const [thumbnailUrl, setThumbnailUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;

    if (!pdfUrl) {
      setLoading(false);
      return;
    }

    const loadPdf = async () => {
      try {
        setLoading(true);
        setError(false);

        const loadingTask = pdfjsLib.getDocument({
          url: pdfUrl,
          withCredentials: true, // Allow cookies/credentials
        });
        const pdf = await loadingTask.promise;

        if (!active) return;

        const page = await pdf.getPage(1);

        if (!active) return;

        // Render at a low scale for thumbnail
        const viewport = page.getViewport({ scale: 0.4 });
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };

        await page.render(renderContext).promise;

        if (!active) return;

        const imgData = canvas.toDataURL("image/jpeg", 0.85);
        setThumbnailUrl(imgData);
        setLoading(false);
      } catch (err) {
        console.warn("PDF.js render failed:", err);
        if (active) {
          setError(true);
          setLoading(false);
        }
      }
    };

    loadPdf();

    return () => {
      active = false;
    };
  }, [pdfUrl]);

  if (loading) {
    return (
      <div className={`flex items-center justify-center bg-gray-50 border border-gray-150 ${className}`}>
        <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
      </div>
    );
  }

  if (error || !thumbnailUrl) {
    return (
      <div className={`flex flex-col items-center justify-center bg-blue-50 border border-blue-100 p-2 text-center select-none ${className}`}>
        <FileText className="w-7 h-7 text-blue-400 mb-1" />
        <span className="text-[9px] text-blue-600 font-bold leading-tight line-clamp-2 uppercase">
          {title || "PDF"}
        </span>
      </div>
    );
  }

  return (
    <img
      src={thumbnailUrl}
      className={`w-full h-full object-cover ${className}`}
      alt={title || "PDF Cover"}
      loading="lazy"
    />
  );
}
