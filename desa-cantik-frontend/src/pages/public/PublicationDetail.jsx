import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  Download,
  Calendar,
  FileText,
  MapPin,
  User,
  HardDrive,
  FileType,
  Building2,
  ChevronRight,
  Home,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import { publicationService } from "@/services/publicationService";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import PDFPreview from "@/components/shared/PDFPreview";

export default function PublicationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [publication, setPublication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadPublication = async () => {
      if (!id) return;

      try {
        setLoading(true);
        setError(null);
        const response = await publicationService.getPublicationById(id);
        // API returns { success: true, data: {...} }, so extract the nested data
        const data = response?.data || response;
        setPublication(data);
      } catch (err) {
        console.error("Error loading publication:", err);
        const isNotFound = err.status === 404 || err.message?.toLowerCase().includes("not found") || err.message?.toLowerCase().includes("tidak ditemukan");
        setError(
          isNotFound
            ? "Publikasi tidak ditemukan"
            : "Gagal memuat data publikasi"
        );
      } finally {
        setLoading(false);
      }
    };

    loadPublication();
  }, [id]);

  const handleDownload = () => {
    if (!publication) return;
    const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";
    const downloadUrl = `${baseUrl}/publications/${id}/download`;
    window.open(downloadUrl, "_blank");
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "-";
    const mb = bytes / (1024 * 1024);
    return mb < 1 ? `${(bytes / 1024).toFixed(1)} KB` : `${mb.toFixed(2)} MB`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="h-[calc(100vh-200px)] flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-[#33A1E0] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-[#154D71] font-medium">Memuat publikasi...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Error State
  if (error || !publication) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="h-[calc(100vh-200px)] flex items-center justify-center">
          <div className="text-center max-w-md mx-auto px-6">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <FileText className="w-10 h-10 text-red-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              {error || "Publikasi Tidak Ditemukan"}
            </h2>
            <p className="text-gray-600 mb-8">
              Publikasi yang Anda cari mungkin telah dihapus atau tidak
              tersedia.
            </p>
            <Button
              onClick={() => navigate(-1)}
              className="bg-[#154D71] hover:bg-[#33A1E0] gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Kembali
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Main Content
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#154D71] to-[#33A1E0] text-white py-16 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
              backgroundSize: "40px 40px",
            }}
          ></div>
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="text-white hover:bg-white/20 mb-6 gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali
          </Button>

          <div className="max-w-4xl">
            <Badge className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white mb-4 px-3 py-1 border-0">
              {publication.category || "Publikasi"}
            </Badge>

            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              {publication.title}
            </h1>

            <div className="flex flex-wrap gap-6 text-sm">
              {publication.published_at && (
                <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm">
                  <Calendar className="w-4 h-4" />
                  {formatDate(publication.published_at)}
                </div>
              )}

              {publication.uploader && (
                <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm">
                  <User className="w-4 h-4" />
                  {publication.uploader.full_name || publication.uploader.name}
                </div>
              )}

              {publication.village && (
                <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm">
                  <Building2 className="w-4 h-4" />
                  {publication.village.name}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-3 gap-10">
            {/* Left Column - Cover & Actions */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24 border-0 shadow-xl overflow-hidden">
                {/* PDF Preview - Renders first page of PDF */}
                <div className="relative aspect-[3/4] bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden group">
                  <PDFPreview
                    pdfUrl={
                      `${import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1"}/publications/${id}/view`
                    }
                    title={publication.title}
                    className="w-full h-full"
                  />

                  {publication.status && (
                    <div className="absolute top-4 right-4 z-10">
                      <Badge className="bg-white/90 backdrop-blur-sm text-[#154D71] shadow-lg">
                        {publication.status}
                      </Badge>
                    </div>
                  )}
                </div>

                <CardContent className="p-6 space-y-4">
                  {/* Download Button */}
                  {publication?.fileUrl ||
                  publication?.downloadUrl ||
                  publication?.file_url ? (
                    <Button
                      onClick={handleDownload}
                      className="w-full bg-[#154D71] hover:bg-[#33A1E0] text-white gap-2 h-12 text-base font-medium shadow-lg"
                    >
                      <Download className="w-5 h-5" />
                      Unduh Publikasi
                    </Button>
                  ) : (
                    <div className="w-full bg-gray-100 text-gray-500 gap-2 h-12 text-base font-medium flex items-center justify-center rounded-md border border-gray-200">
                      <FileText className="w-5 h-5" />
                      <span>File Tidak Tersedia</span>
                    </div>
                  )}

                  <Separator />

                  {/* File Info */}
                  <div className="space-y-3">
                    <h3 className="font-semibold text-gray-900 text-sm uppercase tracking-wide">
                      Informasi File
                    </h3>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500 flex items-center gap-2">
                          <FileType className="w-4 h-4" />
                          Tipe File
                        </span>
                        <span className="font-medium text-gray-900">
                          {publication.file_type?.toUpperCase() || "PDF"}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-gray-500 flex items-center gap-2">
                          <HardDrive className="w-4 h-4" />
                          Ukuran
                        </span>
                        <span className="font-medium text-gray-900">
                          {formatFileSize(publication.file_size_bytes)}
                        </span>
                      </div>

                      {publication.file_name && (
                        <div className="pt-2 border-t">
                          <p className="text-xs text-gray-500 mb-1">
                            Nama File:
                          </p>
                          <p className="text-xs font-mono text-gray-700 break-all bg-gray-50 p-2 rounded">
                            {publication.file_name}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Description & Details */}
            <div className="lg:col-span-2 space-y-8">
              {/* Description */}
              <Card className="border-0 shadow-lg">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold text-[#154D71] mb-6 flex items-center gap-3">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <FileText className="w-6 h-6 text-[#33A1E0]" />
                    </div>
                    Deskripsi
                  </h2>

                  {publication.description ? (
                    <div className="prose prose-gray max-w-none">
                      <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-lg">
                        {publication.description}
                      </p>
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">
                      Tidak ada deskripsi untuk publikasi ini.
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Additional Details */}
              <Card className="border-0 shadow-lg">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold text-[#154D71] mb-6 flex items-center gap-3">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <MapPin className="w-6 h-6 text-[#33A1E0]" />
                    </div>
                    Detail Publikasi
                  </h2>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
                      <p className="text-sm text-gray-500 mb-2">Kategori</p>
                      <p className="text-lg font-semibold text-[#154D71]">
                        {publication.category || "Umum"}
                      </p>
                    </div>

                    <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
                      <p className="text-sm text-gray-500 mb-2">
                        Tanggal Terbit
                      </p>
                      <p className="text-lg font-semibold text-[#154D71]">
                        {formatDate(publication.published_at)}
                      </p>
                    </div>

                    {publication.uploader && (
                      <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
                        <p className="text-sm text-gray-500 mb-2">
                          Diunggah Oleh
                        </p>
                        <p className="text-lg font-semibold text-[#154D71]">
                          {publication.uploader.full_name ||
                            publication.uploader.name ||
                            "-"}
                        </p>
                      </div>
                    )}

                    {publication.village && (
                      <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
                        <p className="text-sm text-gray-500 mb-2">Desa</p>
                        <p className="text-lg font-semibold text-[#154D71]">
                          {publication.village.name}
                        </p>
                        {publication.village.village_code && (
                          <p className="text-xs text-gray-500 mt-1">
                            Kode: {publication.village.village_code}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Back to Village Button */}
                  {publication.village && (
                    <div className="mt-8 pt-6 border-t">
                      <Button
                        variant="outline"
                        onClick={() => {
                          const slug = publication.village.name.toLowerCase().replace(/\s+/g, "-");
                          const hostname = window.location.hostname;
                          if (/^[0-9.]+$/.test(hostname) || hostname === 'localhost') {
                            navigate(`/desa/${slug}`);
                            return;
                          }
                          const protocol = window.location.protocol;
                          const parts = hostname.split('.');
                          const baseDomain = parts.slice(-3).join('.');
                          window.location.href = `${protocol}//${slug}.${baseDomain}`;
                        }}
                        className="gap-2 border-[#154D71] text-[#154D71] hover:bg-[#154D71] hover:text-white"
                      >
                        <MapPin className="w-4 h-4" />
                        Kembali ke Profil {publication.village.name}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
