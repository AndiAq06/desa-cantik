// src/pages/desa/DashboardDesa.jsx
import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { BarChartHorizontalBig, BookCopy, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { validationFlowService } from "@/services/validationFlowService";
import { dashboardService } from "@/services/dashboardService";
import { useAuth } from "@/contexts/AuthContext";

export default function DashboardDesa() {
  const { user, activeVillageId } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [flowSteps, setFlowSteps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingFlow, setLoadingFlow] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      if (!activeVillageId) return;

      try {
        setLoading(true);
        const data = await dashboardService.getVillageDashboard(activeVillageId);
        setDashboardData(data);
      } catch (error) {
        console.error("Gagal memuat dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    const loadFlow = async () => {
      try {
        setLoadingFlow(true);
        const steps = await validationFlowService.getFlow();
        setFlowSteps(steps);
      } catch (error) {
        console.error("Gagal memuat alur validasi:", error);
      } finally {
        setLoadingFlow(false);
      }
    };

    loadDashboard();
    loadFlow();
  }, [activeVillageId]);

  // Transform statistics by category to chart format
  const chartDataKategori = dashboardData?.statisticsByCategory?.map((cat, idx) => ({
    name: cat.category,
    value: cat.count,
    fill: ['#22c55e', '#3b82f6', '#f59e0b', '#14b8a6', '#6366f1'][idx % 5],
  })) || [];

  // Fungsi helper untuk menentukan warna Badge
  const getStatusVariant = (status) => {
    switch (status) {
      case "Terverifikasi":
        return "default";
      case "Perlu Validasi":
      case "Menunggu Validasi":
        return "secondary";
      case "Ditolak":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getStatusClassName = (status) => {
    switch (status) {
      case "Terverifikasi":
        return "bg-emerald-500 hover:bg-emerald-600 border-transparent text-white";
      case "Perlu Validasi":
      case "Menunggu Validasi":
        return "bg-amber-500 hover:bg-amber-600 border-transparent text-white";
      case "Ditolak":
        return "bg-red-500 hover:bg-red-600 border-transparent text-white";
      default:
        return "";
    }
  };

  if (loading) {
    return (
      <div className="p-2.5 sm:p-6 space-y-6 w-full">
        <div className="text-center text-gray-500">Memuat dashboard...</div>
      </div>
    );
  }

  return (
    <div className="p-2.5 sm:p-6 space-y-4 sm:space-y-6 w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Dashboard Desa</h1>
          <p className="text-muted-foreground">
            {dashboardData?.village?.name || "Ringkasan data dan aktivitas desa Anda."}
          </p>
        </div>
      </div>

      {/* --- Baris Atas: Stat & Chart --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Kolom 1: Stat Cards (Stacked) */}
        <div className="space-y-4 sm:space-y-6">
          <Card className="shadow-sm border-l-4 border-l-[#1C6EA4]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 p-3 sm:p-6 sm:pb-2">
              <CardTitle className="text-xs sm:text-sm font-semibold text-muted-foreground">
                Total Indikator Statistik
              </CardTitle>
              <BarChartHorizontalBig className="h-4 w-4 sm:h-5 sm:w-5 text-[#1C6EA4]" />
            </CardHeader>
            <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
              <div className="text-2xl sm:text-4xl font-bold text-gray-800">
                {dashboardData?.summary?.totalStatistics || 0}
              </div>
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
                statistik tersimpan
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-l-4 border-l-emerald-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 p-3 sm:p-6 sm:pb-2">
              <CardTitle className="text-xs sm:text-sm font-semibold text-muted-foreground">
                Dokumen Publikasi
              </CardTitle>
              <BookCopy className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-500" />
            </CardHeader>
            <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
              <div className="text-2xl sm:text-4xl font-bold text-gray-800">
                {dashboardData?.summary?.totalPublications || 0}
              </div>
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
                {dashboardData?.summary?.publicationsThisYear || 0} tahun ini
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-l-4 border-l-purple-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 p-3 sm:p-6 sm:pb-2">
              <CardTitle className="text-xs sm:text-sm font-semibold text-muted-foreground">
                Total Layer Peta
              </CardTitle>
              <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-purple-500" />
            </CardHeader>
            <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
              <div className="text-2xl sm:text-4xl font-bold text-gray-800">
                {dashboardData?.summary?.thematicMaps || 0}
              </div>
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
                layer peta
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Kolom 2: Profile Completeness */}
        <Card className="shadow-sm flex flex-col">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Kelengkapan Profil</CardTitle>
            <CardDescription>
              Persentase data profil desa yang sudah diisi
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex items-center justify-center pb-4">
            <div className="text-center">
              <div className="text-6xl font-bold text-[#1C6EA4] mb-2">
                {dashboardData?.profileCompleteness?.percentage || 0}%
              </div>
              <p className="text-sm text-muted-foreground">
                {(dashboardData?.profileCompleteness?.percentage || 0) >= 100
                  ? "Profil lengkap!"
                  : `${100 - (dashboardData?.profileCompleteness?.percentage || 0)}% lagi untuk lengkap`}
              </p>
            </div>
          </CardContent>
        </Card>


        {/* Kolom 3: Chart Kategori (Pie) */}
        <Card className="shadow-sm flex flex-col">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Kategori Statistik</CardTitle>
            <CardDescription>Sebaran data per kategori</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 pb-0">
            {chartDataKategori.length > 0 ? (
              <>
                <ChartContainer config={{}} className="mx-auto aspect-square max-h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartDataKategori}
                        dataKey="value"
                        nameKey="name"
                        outerRadius={80}
                        labelLine={false}
                      >
                        {chartDataKategori.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>
                <div className="flex flex-wrap justify-center gap-2 mt-4 text-xs text-muted-foreground">
                  {chartDataKategori.map((item, i) => (
                    <div key={i} className="flex items-center gap-1">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: item.fill }}
                      ></div>
                      {item.name}
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center text-gray-500 py-8">
                Belum ada data kategori
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* --- Baris Bawah: Tabel Aktivitas Terkini --- */}
      <Card className="shadow-sm border">
        <CardHeader>
          <CardTitle>Aktivitas Terkini</CardTitle>
          <CardDescription>
            Aktivitas terbaru pada data desa Anda.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {dashboardData?.recentActivities?.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">No.</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Aksi</TableHead>
                  <TableHead>Deskripsi</TableHead>
                  <TableHead>Waktu</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dashboardData.recentActivities.map((activity, index) => (
                  <TableRow key={activity.id} className="hover:bg-slate-50 transition-colors">
                    <TableCell className="text-muted-foreground">{index + 1}</TableCell>
                    <TableCell className="font-medium">{activity.user}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-800">
                        {activity.action}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm">{activity.description}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {new Date(activity.timestamp).toLocaleString('id-ID')}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center text-gray-500 py-8">
              Belum ada aktivitas terkini
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
