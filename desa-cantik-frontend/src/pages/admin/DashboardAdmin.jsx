// src/pages/admin/DashboardAdmin.jsx
import React, { useCallback, useEffect, useState } from 'react';
import { dashboardService } from '@/services/dashboardService';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  BarChart3,
  Users,
  FileText,
  Map,
  Activity,
  TrendingUp,
  RotateCcw,
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

export default function DashboardAdmin() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadDashboard = useCallback(
    async (isInitial = false) => {
      try {
        if (isInitial) {
          setLoading(true);
        } else {
          setRefreshing(true);
        }
        const data = await dashboardService.getAdminDashboard();
        setDashboardData(data);
        setError(null);
      } catch (err) {
        setError(err.message || 'Failed to load dashboard');
        console.error('Dashboard error:', err);
      } finally {
        if (isInitial) {
          setLoading(false);
        }
        setRefreshing(false);
      }
    },
    []
  );

  useEffect(() => {
    loadDashboard(true);
  }, [loadDashboard]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-sm border-slate-200">
          <CardContent className="flex flex-col items-center gap-4 py-10">
            <div className="h-12 w-12 animate-spin rounded-full border-2 border-slate-200 border-b-blue-600" />
            <p className="text-gray-600">Loading dashboard...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">{error}</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => loadDashboard(true)}
            >
              Coba lagi
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const {
    summary,
    recentActivities,
    villagesStatistics,
    monthlyActivities,
    publicationStatus,
    publicationCategories,
  } = dashboardData || {};

  const statusPalette = [
    '#34d399', '#facc15', '#fb923c', '#f87171',
    '#60a5fa', '#a78bfa', '#f472b6', '#22d3ee', '#f59e0b', '#10b981'
  ];

  const categoryPalette = [
    '#34d399', '#60a5fa', '#f97316', '#a855f7', '#facc15',
    '#ec4899', '#3b82f6', '#f43f5e', '#10b981', '#8b5cf6'
  ];
  const publicationStatusData = (publicationStatus && publicationStatus.length
    ? publicationStatus
    : [
      { status: 'Terverifikasi', count: 0 },
      { status: 'Perlu Validasi', count: 0 },
      { status: 'Draft', count: 0 },
      { status: 'Batal Terbit', count: 0 },
    ]
  ).map((item, index) => ({
    name: item.status || item.name,
    value: item.count ?? item.value ?? 0,
    color: item.color || statusPalette[index % statusPalette.length],
  }));

  const publicationCategoryData = (publicationCategories &&
    publicationCategories.length
    ? publicationCategories
    : [
      { category: 'Demografi', count: 0 },
      { category: 'Ekonomi', count: 0 },
      { category: 'Pertanian', count: 0 },
      { category: 'Pendidikan', count: 0 },
      { category: 'Kesehatan', count: 0 },
    ]
  ).map((item, index) => ({
    name: item.category || item.name,
    value: item.count ?? item.value ?? 0,
    color: item.color || categoryPalette[index % categoryPalette.length],
  }));

  const totalStatus = publicationStatusData.reduce((sum, item) => sum + item.value, 0) || 1;

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="flex-1 p-2.5 sm:p-6">
        <div className="space-y-4 sm:space-y-6 max-w-6xl mx-auto">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                Dashboard Admin BPS
              </h1>
              <p className="text-gray-600 mt-1">
                Overview sistem informasi statistik desa
              </p>
            </div>
            <Button
              variant="outline"
              className="border-slate-200"
              onClick={() => loadDashboard(false)}
              disabled={refreshing}
            >
              <RotateCcw
                className={`h-4 w-4 ${refreshing ? 'animate-spin text-blue-600' : ''
                  }`}
              />
              {refreshing ? 'Menyegarkan...' : 'Muat ulang'}
            </Button>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 p-3 sm:p-6 sm:pb-2">
                <CardTitle className="text-xs sm:text-sm font-semibold">
                  Total Desa
                </CardTitle>
                <Map className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
                <div className="text-xl sm:text-2xl font-bold">{summary?.totalVillages || 0}</div>
                <p className="text-[10px] sm:text-xs text-muted-foreground">
                  {summary?.activeVillages || 0} aktif, {summary?.inactiveVillages || 0} non-aktif
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 p-3 sm:p-6 sm:pb-2">
                <CardTitle className="text-xs sm:text-sm font-semibold">
                  Total Pengguna
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
                <div className="text-xl sm:text-2xl font-bold">{summary?.totalUsers || 0}</div>
                <p className="text-[10px] sm:text-xs text-muted-foreground">
                  {summary?.admin_count || 0} Admin BPS, {summary?.village_officer_count || 0} Perangkat Desa
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 p-3 sm:p-6 sm:pb-2">
                <CardTitle className="text-xs sm:text-sm font-semibold">
                  Total Statistik
                </CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
                <div className="text-xl sm:text-2xl font-bold">
                  {summary?.totalStatistics || 0}
                </div>
                <p className="text-[10px] sm:text-xs text-muted-foreground">
                  Data statistik desa
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 p-3 sm:p-6 sm:pb-2">
                <CardTitle className="text-xs sm:text-sm font-semibold">
                  Total Publikasi
                </CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
                <div className="text-xl sm:text-2xl font-bold">
                  {summary?.totalPublications || 0}
                </div>
                <p className="text-[10px] sm:text-xs text-muted-foreground">
                  {summary?.totalThematicMaps || 0} peta tematik
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Publication Overview 2x2 Grid */}
          <Card>
            <CardHeader>
              <CardTitle>Publikasi Desa</CardTitle>
              <CardDescription>
                Rekapitulasi publikasi desa menurut status, kategori, dan aktivitas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* Status Publikasi */}
                <div className="space-y-4">
                  <p className="text-sm font-semibold text-gray-600">Status Publikasi</p>
                  <p className="text-xs text-gray-500">Distribusi status publikasi aktif</p>
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <defs>
                          {publicationStatusData.map((entry, index) => (
                            <linearGradient
                              key={entry.name}
                              id={`grad-status-${index}`}
                              x1="0" y1="0" x2="1" y2="1"
                            >
                              <stop offset="0%" stopColor={statusPalette[index % statusPalette.length]} stopOpacity={0.7} />
                              <stop offset="100%" stopColor={statusPalette[index % statusPalette.length]} stopOpacity={1} />
                            </linearGradient>
                          ))}
                        </defs>
                        <Pie
                          data={publicationStatusData}
                          dataKey="value"
                          nameKey="name"
                          innerRadius={80}
                          outerRadius={120}
                          paddingAngle={2}
                          label={({ value }) => `${Math.round((value / totalStatus) * 100)}%`}
                          labelLine={false}
                        >
                          {publicationStatusData.map((entry, index) => (
                            <Cell key={entry.name} fill={`url(#grad-status-${index})`} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value, name) => [`${value} publikasi`, name]} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Kategori Publikasi */}
                <div className="space-y-4">
                  <p className="text-sm font-semibold text-gray-600">Kategori Publikasi</p>
                  <p className="text-xs text-gray-500">Kontribusi publikasi berdasarkan modul statistik</p>
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <defs>
                          {publicationCategoryData.map((entry, index) => (
                            <linearGradient
                              key={entry.name}
                              id={`grad-cat-${index}`}
                              x1="0" y1="0" x2="1" y2="1"
                            >
                              <stop offset="0%" stopColor={categoryPalette[index % categoryPalette.length]} stopOpacity={0.7} />
                              <stop offset="100%" stopColor={categoryPalette[index % categoryPalette.length]} stopOpacity={1} />
                            </linearGradient>
                          ))}
                        </defs>
                        <Pie
                          data={publicationCategoryData}
                          dataKey="value"
                          nameKey="name"
                          innerRadius={80}         // sama dengan status
                          outerRadius={120}        // sama dengan status
                          paddingAngle={2}         // sama dengan status
                          label={({ value }) => `${Math.round((value / publicationCategoryData.reduce((a, b) => a + b.value, 0)) * 100)}%`}
                          labelLine={false}        // sama dengan status
                        >
                          {publicationCategoryData.map((entry, index) => (
                            <Cell key={entry.name} fill={`url(#grad-cat-${index})`} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value, name) => [`${value} publikasi`, name]} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Publikasi Per Desa */}
                <div className="space-y-4">
                  <p className="text-sm font-semibold text-gray-600">Publikasi Per Desa</p>
                  <p className="text-xs text-gray-500">Jumlah publikasi tiap desa</p>
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <defs>
                          {(villagesStatistics || []).map((village, idx) => (
                            <linearGradient
                              key={village.villageName}
                              id={`grad-village-${idx}`}
                              x1="0" y1="0" x2="1" y2="1"
                            >
                              <stop offset="0%" stopColor={categoryPalette[idx % categoryPalette.length]} stopOpacity={0.7} />
                              <stop offset="100%" stopColor={categoryPalette[idx % categoryPalette.length]} stopOpacity={1} />
                            </linearGradient>
                          ))}
                        </defs>
                        <Pie
                          data={(villagesStatistics || []).map(v => ({ name: v.villageName, value: v.publicationsCount || 0 }))}
                          dataKey="value"
                          nameKey="name"
                          innerRadius={80}    // samakan style atas
                          outerRadius={120}   // samakan style atas
                          paddingAngle={2}    // samakan style atas
                          label={({ name, value }) => `${name}: ${value}`}
                          labelLine={false}   // samakan style atas
                        >
                          {(villagesStatistics || []).map((village, idx) => (
                            <Cell key={village.villageName} fill={`url(#grad-village-${idx})`} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value, name) => [`${value} publikasi`, name]} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Keaktifan Desa */}
                <div className="space-y-4">
                  <p className="text-sm font-semibold text-gray-600">Keaktifan Desa</p>
                  <p className="text-xs text-gray-500">Perbandingan desa aktif dan non-aktif</p>
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <defs>
                          <linearGradient id="grad-active" x1="0" y1="0" x2="1" y2="1">
                            <stop offset="0%" stopColor="#34d399" stopOpacity={0.7} />
                            <stop offset="100%" stopColor="#34d399" stopOpacity={1} />
                          </linearGradient>
                          <linearGradient id="grad-inactive" x1="0" y1="0" x2="1" y2="1">
                            <stop offset="0%" stopColor="#f87171" stopOpacity={0.7} />
                            <stop offset="100%" stopColor="#f87171" stopOpacity={1} />
                          </linearGradient>
                        </defs>
                        <Pie
                          data={[
                            { name: 'Aktif', value: summary?.activeVillages || 0 },
                            { name: 'Non-Aktif', value: summary?.inactiveVillages || 0 },
                          ]}
                          dataKey="value"
                          nameKey="name"
                          innerRadius={80}    // samakan style atas
                          outerRadius={120}   // samakan style atas
                          paddingAngle={2}    // samakan style atas
                          label={({ name, value }) => `${name}: ${value}`}
                          labelLine={false}   // samakan style atas
                        >
                          <Cell fill="url(#grad-active)" />
                          <Cell fill="url(#grad-inactive)" />
                        </Pie>
                        <Tooltip formatter={(value, name) => [`${value} desa`, name]} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

              </div>
            </CardContent>
          </Card>

          {/* Villages Statistics Table */}
          <Card>
            <CardHeader>
              <CardTitle>Statistik Desa</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <div className="min-w-[500px] text-sm md:text-base">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nama Desa</TableHead>
                        <TableHead className="text-right">Statistik</TableHead>
                        <TableHead className="text-right">Publikasi</TableHead>
                        <TableHead className="text-right">Update Terakhir</TableHead>
                      </TableRow>
                    </TableHeader>
                <TableBody>
                  {(villagesStatistics || []).map((village, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-medium">
                        {village.villageName}
                      </TableCell>
                      <TableCell className="text-right">
                        {village.statisticsCount}
                      </TableCell>
                      <TableCell className="text-right">
                        {village.publicationsCount}
                      </TableCell>
                      <TableCell className="text-right text-sm text-gray-500">
                        {village.lastUpdated
                          ? new Date(village.lastUpdated).toLocaleDateString('id-ID')
                          : '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!villagesStatistics || villagesStatistics.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-gray-500">
                        Tidak ada data
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activities */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Aktivitas Terkini
              </CardTitle>
              <CardDescription>10 aktivitas terakhir dalam sistem</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {(recentActivities || []).map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start justify-between border-b pb-3 last:border-0"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {activity.user}
                      </p>
                      <p className="text-sm text-gray-600">
                        {activity.description}
                      </p>
                    </div>
                    <span className="text-xs text-gray-500 whitespace-nowrap ml-4">
                      {activity.timestamp
                        ? new Date(activity.timestamp).toLocaleString('id-ID', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                        : '-'}
                    </span>
                  </div>
                ))}
                {(!recentActivities || recentActivities.length === 0) && (
                  <p className="text-center text-gray-500 py-4">
                    Belum ada aktivitas
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Monthly Activities Chart */}
          {monthlyActivities && monthlyActivities.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Aktivitas Bulanan
                </CardTitle>
                <CardDescription>
                  Statistik dan publikasi 6 bulan terakhir
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <div className="min-w-[500px] text-sm md:text-base">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Bulan</TableHead>
                          <TableHead className="text-right">Statistik Baru</TableHead>
                          <TableHead className="text-right">Statistik Update</TableHead>
                          <TableHead className="text-right">Publikasi</TableHead>
                        </TableRow>
                      </TableHeader>
                  <TableBody>
                    {monthlyActivities.map((month, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-medium">{month.month}</TableCell>
                        <TableCell className="text-right">
                          {month.statisticsCreated}
                        </TableCell>
                        <TableCell className="text-right">
                          {month.statisticsUpdated}
                        </TableCell>
                        <TableCell className="text-right">
                          {month.publicationsUploaded}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                    </Table>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}