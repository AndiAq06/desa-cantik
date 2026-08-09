import React, { useEffect, useState } from "react";
import { FileText, Loader2 } from "lucide-react";
import * as pdfjsLib from "pdfjs-dist";

// Import and instantiate the worker inline to bypass Nginx static file routing and CORS issues
import PDFWorker from "pdfjs-dist/build/pdf.worker.min.mjs?worker";
try {
  pdfjsLib.GlobalWorkerOptions.workerPort = new PDFWorker();
} catch (e) {
  console.warn("Failed to initialize PDFJS inline worker, falling back...", e);
}

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

        // Normalize insecure http URL to https on secure environments to prevent Mixed Content block
        let targetUrl = pdfUrl;
        if (targetUrl && targetUrl.startsWith("http://") && window.location.protocol === "https:") {
          targetUrl = targetUrl.replace("http://", "https://");
        }

        const loadingTask = pdfjsLib.getDocument({
          url: targetUrl,
          withCredentials: false, // Disable credentials to allow Access-Control-Allow-Origin: *
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
